"""Owner-neutral file artifact CLI; no product qualification or GitHub fallback."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import tempfile


def load(name):
    spec = importlib.util.spec_from_file_location('ci_files_' + name, Path(__file__).with_name(name + '.py'))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


transport, bundle = load('client'), load('bundle')


class FileArtifactError(Exception):
    def __init__(self, code, recovery_path=None):
        super().__init__(code); self.code = code; self.recovery_path = str(recovery_path) if recovery_path else None


def context_from_environment(environment):
    fields = {'owner_id': 'GITHUB_REPOSITORY_OWNER_ID', 'repository_id': 'GITHUB_REPOSITORY_ID',
              'sha': 'GITHUB_SHA', 'workflow_sha': 'GITHUB_WORKFLOW_SHA', 'workflow_ref': 'GITHUB_WORKFLOW_REF', 'run_id': 'GITHUB_RUN_ID'}
    try:
        context = {field: environment[key] for field, key in fields.items()}
        attempt = environment['GITHUB_RUN_ATTEMPT']
        if not re.fullmatch(r'[1-9][0-9]{0,9}', attempt): raise ValueError()
        context['attempt'] = int(attempt)
        transport.validate_identity(dict(context, profile='context'))
        return context
    except (KeyError, TypeError, ValueError, transport.ClientError): raise FileArtifactError('INVALID_WORKFLOW_CONTEXT') from None


def trusted_workflow(environment):
    """Fail before token acquisition for the approved untrusted PR exception."""
    if environment.get('GITHUB_ACTOR') == 'dependabot[bot]': return False
    if environment.get('GITHUB_EVENT_NAME') not in ('pull_request', 'pull_request_target'): return True
    try:
        with open(environment['GITHUB_EVENT_PATH'], 'rb') as source: raw = source.read(1024**2 + 1)
        if len(raw) > 1024**2: raise ValueError()
        event = json.loads(raw); request = event['pull_request']; head = request['head']['repo']; repository = event['repository']
        return (request['user']['login'] != 'dependabot[bot]'
                and str(head['id']) == environment['GITHUB_REPOSITORY_ID'] == str(repository['id'])
                and head['full_name'] == repository['full_name'] == environment['GITHUB_REPOSITORY'])
    except (KeyError, TypeError, OSError, ValueError): raise FileArtifactError('UNVERIFIED_PULL_REQUEST_CONTEXT') from None


def upload(client, context, profile, patterns, temporary_root, *, roots, max_bytes, receipt=None,
           receipt_format='bytes', include_hidden=False, outcome='candidate', evidence_class='diagnostic'):
    identity = dict(context, profile=profile); transport.validate_identity(identity)
    with tempfile.TemporaryDirectory(prefix='ci-artifact-files-upload-', dir=temporary_root) as directory:
        archive = Path(directory).resolve() / 'artifact.zip'
        record = bundle.pack(patterns, archive, roots=roots, max_bytes=max_bytes, receipt=receipt,
                             receipt_format=receipt_format, include_hidden=include_hidden)
        manifest = dict(identity, **{name: record[name] for name in ('size', 'sha256', 'canonical_receipt_sha256')},
                        outcome=outcome, evidence_class=evidence_class)
        result = client.upload(archive, manifest)
        if result != {'key': transport.identity_key(manifest), 'sha256': manifest['sha256']}:
            raise FileArtifactError('INVALID_UPLOAD_RECEIPT')
    return {'key': result['key'], 'manifest': manifest, 'file_count': record['file_count']}


def download(client, identity, destination, temporary_root, *, max_bytes, receipt=None,
             receipt_format='bytes', expected_canonical_sha256=None, archive_only=False):
    bundle._budget(max_bytes)
    destination = bundle._destination(destination)
    described = client.describe(identity, max_bytes=max_bytes, expected_canonical_sha256=expected_canonical_sha256)
    item, key = described['manifest'], described['key']
    operation = secrets.token_hex(16)
    checkpoint = client.checkpoint(key, item['sha256'], operation=operation)
    directory = Path(tempfile.mkdtemp(prefix='ci-artifact-files-fetch-', dir=temporary_root)).resolve()
    archive = directory / 'artifact.zip'; keep = False; recovered = False
    try:
        try: client.fetch(key, archive, expected=item, max_bytes=max_bytes)
        except Exception as error:
            recovery = getattr(error, 'recovery_path', None)
            if not recovery: raise
            try: transport.recover(recovery, archive, expected=item, max_bytes=max_bytes); recovered = True
            except Exception:
                keep = True
                raise FileArtifactError('FETCH_RECOVERY_REQUIRED', recovery) from None
        verified = bundle.unpack(archive, None if archive_only else destination,
            expected_sha256=item['sha256'], canonical_sha256=item['canonical_receipt_sha256'],
            max_bytes=max_bytes, receipt=receipt, receipt_format=receipt_format)
        if archive_only:
            destination = transport.safe_path(destination)
            if destination.exists(): raise FileArtifactError('DESTINATION_EXISTS')
            transport._publish(archive, destination)
        cleanup_unknown = False
        if not recovered:
            try: client.checkpoint(key, item['sha256'], operation=operation, complete=True)
            except Exception: cleanup_unknown = True
        return dict(described, **verified, checkpoint=checkpoint['checkpoint'],
                    acknowledgment_unknown=recovered, server_lease_review_required=recovered or cleanup_unknown)
    finally:
        if not keep: shutil.rmtree(directory)


def _identity(args, client):
    if args.selector_json is not None:
        found = client.locate(json.loads(args.selector_json), max_bytes=args.max_bytes,
                              expected_canonical_sha256=args.expected_canonical_sha256)
        return {name: found['manifest'][name] for name in transport.IDENTITY}
    if args.identity_json is None: return dict(context_from_environment(os.environ), profile=args.profile)
    value = json.loads(args.identity_json); transport.validate_identity(value); return value


def _output(value):
    raw = json.dumps(value, sort_keys=True, separators=(',', ':'))
    target = os.environ.get('GITHUB_OUTPUT')
    if target:
        with open(target, 'a', encoding='utf8') as output:
            output.write('artifact=' + raw + '\n')
            if 'key' in value: output.write('key=' + value['key'] + '\n')
    print(raw)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--endpoint', default=os.environ.get('CI_ARTIFACT_ENDPOINT'))
    commands = parser.add_subparsers(dest='command', required=True)
    put = commands.add_parser('upload'); put.add_argument('--profile', required=True)
    put.add_argument('--paths', required=True); put.add_argument('--max-bytes', type=int, default=1024**3)
    put.add_argument('--receipt'); put.add_argument('--receipt-format', choices=('bytes', 'canonical-json'), default='bytes')
    put.add_argument('--include-hidden', action='store_true')
    put.add_argument('--if-no-files-found', choices=('error', 'warn', 'ignore'), default='error')
    put.add_argument('--outcome', choices=('pass', 'fail', 'candidate', 'unknown'), default='candidate')
    put.add_argument('--evidence-class', choices=('main-qualification', 'integrated-main', 'candidate', 'diagnostic'), default='diagnostic')
    for operation in ('describe', 'download'):
        command = commands.add_parser(operation); command.add_argument('--profile')
        selection = command.add_mutually_exclusive_group()
        selection.add_argument('--identity-json'); selection.add_argument('--selector-json')
        command.add_argument('--max-bytes', type=int, default=1024**3)
        command.add_argument('--expected-canonical-sha256')
        if operation == 'download':
            command.add_argument('--destination', required=True); command.add_argument('--archive-only', action='store_true')
            command.add_argument('--receipt'); command.add_argument('--receipt-format', choices=('bytes', 'canonical-json'), default='bytes')
    args = parser.parse_args()
    try:
        if not trusted_workflow(os.environ): raise FileArtifactError('UNTRUSTED_PR_USE_GITHUB_DIAGNOSTIC_EXCEPTION')
        if not args.endpoint: raise FileArtifactError('ARTIFACT_ENDPOINT_NOT_CONFIGURED')
        client = transport.Client(args.endpoint,
            allow_loopback_http=os.environ.get('RUNNER_ENVIRONMENT') == 'self-hosted')
        temporary = Path(os.environ['RUNNER_TEMP']).resolve(strict=True)
        if args.command == 'upload':
            roots = [Path(os.environ['GITHUB_WORKSPACE']).resolve(strict=True), temporary]
            try:
                result = upload(client, context_from_environment(os.environ), args.profile,
                    [path.strip() for path in args.paths.splitlines() if path.strip()], temporary, roots=roots,
                    max_bytes=args.max_bytes, receipt=args.receipt, receipt_format=args.receipt_format,
                    include_hidden=args.include_hidden, outcome=args.outcome, evidence_class=args.evidence_class)
            except bundle.BundleError as error:
                if error.code != 'BUNDLE_MISSING_FILES' or args.if_no_files_found == 'error': raise
                result = {'uploaded': False, 'reason': 'BUNDLE_MISSING_FILES', 'policy': args.if_no_files_found}
                if args.if_no_files_found == 'warn': print('::warning::No matching artifact files')
        elif args.command == 'describe':
            result = client.describe(_identity(args, client), max_bytes=args.max_bytes,
                                     expected_canonical_sha256=args.expected_canonical_sha256)
        else:
            result = download(client, _identity(args, client), args.destination, temporary, max_bytes=args.max_bytes,
                receipt=args.receipt, receipt_format=args.receipt_format, archive_only=args.archive_only,
                expected_canonical_sha256=args.expected_canonical_sha256)
        _output(result); return 0
    except Exception as error:
        code = getattr(error, 'code', '') or (str(error) if error.__class__.__name__ == 'ClientError' else '')
        if not re.fullmatch('[A-Z][A-Z0-9_]{1,100}', code): code = 'FILE_ARTIFACT_COMMAND_FAILED'
        result = {'ok': False, 'error': code}
        if getattr(error, 'recovery_path', None):
            result.update(recovery_path=error.recovery_path, retained=True, owner='current CI job',
                          action='stop qualification; preserve exact producer identity and request recovery review')
        print(json.dumps(result, sort_keys=True)); return 2


if __name__ == '__main__': raise SystemExit(main())
