"""Portable byte transport for Linux, macOS and Windows; no third-party package.

The client does not infer qualification or extract archives. Callers supply the
exact expected producer manifest, including their canonical receipt digest.
"""
import hashlib
import http.client
import json
import os
from pathlib import Path
import re
import secrets
import stat
import socket
import ssl
import urllib.error
import urllib.parse
import urllib.request

AUDIENCE = 'urn:gcake:ci-artifacts'
IDENTITY = ('owner_id', 'repository_id', 'sha', 'workflow_sha', 'workflow_ref', 'run_id', 'attempt', 'profile')


class ClientError(Exception):
    def __init__(self, code, recovery_path=None):
        super().__init__(code)
        self.recovery_path = str(recovery_path) if recovery_path else None


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True).encode()


def identity_key(manifest):
    return hashlib.sha256(canonical({name: manifest[name] for name in IDENTITY})).hexdigest()


def validate_identity(value):
    if type(value) is not dict or set(value) != set(IDENTITY): raise ClientError('INVALID_PRODUCER_IDENTITY')
    for field in ('owner_id', 'repository_id', 'run_id'):
        if type(value[field]) is not str or not re.fullmatch(r'[1-9][0-9]{0,19}', value[field]):
            raise ClientError('INVALID_PRODUCER_IDENTITY')
    if type(value['attempt']) is not int or not 1 <= value['attempt'] <= 10**10:
        raise ClientError('INVALID_PRODUCER_IDENTITY')
    for field in ('sha', 'workflow_sha'):
        if type(value[field]) is not str or not re.fullmatch(r'[a-f0-9]{40}', value[field]):
            raise ClientError('INVALID_PRODUCER_IDENTITY')
    if (type(value['profile']) is not str or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', value['profile'])
            or type(value['workflow_ref']) is not str or not 1 <= len(value['workflow_ref']) <= 1024
            or any(ord(c) < 32 for c in value['workflow_ref']) or '/.github/workflows/' not in value['workflow_ref']
            or '@refs/' not in value['workflow_ref']): raise ClientError('INVALID_PRODUCER_IDENTITY')


def github_token():
    """Get a fresh job OIDC identity; never print or persist either credential."""
    try:
        endpoint = urllib.parse.urlsplit(os.environ['ACTIONS_ID_TOKEN_REQUEST_URL'])
        if (endpoint.scheme != 'https' or endpoint.username or endpoint.password
                or not endpoint.hostname.endswith('.actions.githubusercontent.com') or endpoint.port not in (None, 443)):
            raise ClientError('INVALID_OIDC_ENDPOINT')
        query = urllib.parse.parse_qsl(endpoint.query, keep_blank_values=True)
        query = [(k, v) for k, v in query if k != 'audience'] + [('audience', AUDIENCE)]
        url = urllib.parse.urlunsplit(endpoint._replace(query=urllib.parse.urlencode(query)))
        request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
        # Refuse credential-bearing redirects before following them.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args): return None
        opener = urllib.request.build_opener(NoRedirect)
        with opener.open(request, timeout=15) as response:
            raw = response.read(32769)
        if len(raw) > 32768: raise ClientError('INVALID_OIDC_RESPONSE')
        token = json.loads(raw)['value']
        if type(token) is not str or not 1 <= len(token) <= 16384: raise ClientError('INVALID_OIDC_RESPONSE')
        return token
    except ClientError:
        raise
    except Exception as error:
        # Classify only known exception types. Never disclose URL, request
        # headers, provider response bodies or arbitrary exception messages.
        code = 'OIDC_UNAVAILABLE'
        reason = error.reason if isinstance(error, urllib.error.URLError) else error
        if isinstance(error, urllib.error.HTTPError):
            if type(error.code) is int and 100 <= error.code <= 599:
                code = 'OIDC_HTTP_' + str(error.code)
        elif isinstance(reason, ssl.SSLCertVerificationError):
            code = 'OIDC_TLS_CERTIFICATE_REJECTED'
        elif isinstance(reason, socket.gaierror):
            code = 'OIDC_DNS_UNAVAILABLE'
        elif isinstance(reason, TimeoutError):
            code = 'OIDC_TIMEOUT'
        raise ClientError(code) from None


def safe_path(value):
    path = Path(value).absolute()
    if '..' in path.parts or any(p.is_symlink() for p in (path, *path.parents)):
        raise ClientError('UNSAFE_DESTINATION')
    return path


def _sync_parent(path):
    if os.name == 'posix':
        fd = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
        try: os.fsync(fd)
        finally: os.close(fd)


def _publish(source, destination):
    linked = False
    try:
        os.link(source, destination, follow_symlinks=False)
        linked = True
        _sync_parent(destination)
    except BaseException:
        if linked and destination.exists() and os.path.samestat(source.stat(), destination.lstat()):
            destination.unlink()
        raise


def _regular_source(source):
    fd = os.open(source, os.O_RDONLY | getattr(os, 'O_NONBLOCK', 0) | getattr(os, 'O_NOFOLLOW', 0))
    if not stat.S_ISREG(os.fstat(fd).st_mode):
        os.close(fd)
        raise ClientError('INVALID_SOURCE_TYPE')
    return os.fdopen(fd, 'rb')


def recover(receipt_path, destination, *, expected, max_bytes):
    """Explicitly recover a verified copy after an unknown acknowledgment result.

    No network, secrets, older attempts or archive extraction are involved.
    The owning workflow reports retained copies and their cleanup responsibility.
    """
    receipt_path, destination = safe_path(receipt_path), safe_path(destination)
    if destination.exists(): raise ClientError('DESTINATION_EXISTS')
    try:
        with _regular_source(receipt_path) as source:
            raw = source.read(65537)
        if len(raw) > 65536: raise ValueError('oversized recovery receipt')
        receipt = json.loads(raw)
        if set(receipt) != {'format', 'key', 'manifest', 'payload'} or receipt['format'] != 1:
            raise ValueError('recovery format')
        item = receipt['manifest']
        payload = safe_path(receipt['payload'])
        if (payload.parent != receipt_path.parent or str(payload) + '.recovery.json' != str(receipt_path)
                or item != expected or identity_key(item) != receipt['key']
                or type(max_bytes) is not int or type(item['size']) is not int
                or not 0 <= item['size'] <= max_bytes):
            raise ValueError('recovery binding')
        with _regular_source(payload) as source:
            if os.fstat(source.fileno()).st_size != item['size']: raise ValueError('recovery size')
            digest, size = hashlib.sha256(), 0
            while block := source.read(min(1048576, item['size'] - size + 1)):
                size += len(block)
                if size > item['size']: raise ValueError('recovery growth')
                digest.update(block)
        if size != item['size'] or digest.hexdigest() != item['sha256']: raise ValueError('recovery hash')
        _publish(payload, destination)
        payload.unlink(); receipt_path.unlink(); _sync_parent(destination)
        return {'key': receipt['key'], 'manifest': item}
    except ClientError:
        raise
    except Exception:
        raise ClientError('RECOVERY_FAILED', receipt_path) from None


class Client:
    def __init__(self, endpoint, token_provider=github_token, *, allow_loopback_http=False):
        self.endpoint = urllib.parse.urlsplit(endpoint)
        endpoint = self.endpoint
        local = allow_loopback_http and endpoint.hostname == '127.0.0.1' and endpoint.scheme == 'http'
        if ((endpoint.scheme != 'https' and not local) or not endpoint.hostname
                or endpoint.username or endpoint.password or endpoint.path not in ('', '/')
                or endpoint.query or endpoint.fragment):
            raise ClientError('INVALID_SERVICE_ENDPOINT')
        self.token_provider = token_provider

    def _request(self, method, path, body=None, headers=None):
        connection = None
        try:
            endpoint = self.endpoint
            cls = http.client.HTTPSConnection if endpoint.scheme == 'https' else http.client.HTTPConnection
            connection = cls(endpoint.hostname, endpoint.port, timeout=30)
            headers = dict(headers or {})
            headers['Authorization'] = 'Bearer ' + self.token_provider()
            if isinstance(body, dict):
                body = canonical(body); headers['Content-Type'] = 'application/json'
            connection.request(method, path, body=body, headers=headers)
            response = connection.getresponse()
            if response.status not in (200, 201):
                raise ClientError('SERVICE_REFUSED_' + str(response.status))
            return connection, response
        except Exception as error:
            if connection: connection.close()
            if isinstance(error, ClientError): raise
            raise ClientError('TRANSPORT_UNAVAILABLE') from None

    def _json_request(self, method, path, body=None):
        connection, response = self._request(method, path, body)
        try:
            raw = response.read(65537)
            if len(raw) > 65536: raise ClientError('INVALID_SERVICE_RESPONSE')
            value = json.loads(raw)
            if type(value) is not dict: raise ClientError('INVALID_SERVICE_RESPONSE')
            return value
        except ClientError:
            raise
        except Exception:
            raise ClientError('INVALID_SERVICE_RESPONSE') from None
        finally:
            connection.close()

    def upload(self, source, manifest):
        source = safe_path(source)
        try:
            with _regular_source(source) as payload:
                if (type(manifest.get('size')) is not int or manifest['size'] < 0
                        or os.fstat(payload.fileno()).st_size != manifest['size']):
                    raise ClientError('SOURCE_INTEGRITY_FAILED')
                digest, size = hashlib.sha256(), 0
                while block := payload.read(min(1048576, manifest['size'] - size + 1)):
                    digest.update(block); size += len(block)
                    if size > manifest['size']: raise ClientError('SOURCE_INTEGRITY_FAILED')
                if size != manifest['size'] or digest.hexdigest() != manifest['sha256']:
                    raise ClientError('SOURCE_INTEGRITY_FAILED')
                reservation = self._json_request('POST', '/v1/reservations', manifest)
                if (reservation.get('key') != identity_key(manifest)
                        or type(reservation.get('token')) is not str
                        or not re.fullmatch(r'[a-f0-9]{64}', reservation['token'])):
                    raise ClientError('INVALID_SERVICE_RESPONSE')
                payload.seek(0)
                class Frame:
                    remaining = size
                    def read(frame, limit):
                        block = payload.read(min(limit, frame.remaining)) if frame.remaining else b''
                        frame.remaining -= len(block)
                        return block
                connection, response = self._request('PUT', '/v1/objects/' + reservation['key'], Frame(),
                        {'Content-Length': str(size), 'X-Reservation-Token': reservation['token']})
                try:
                    result = json.loads(response.read(65537))
                    if result != {'key': reservation['key'], 'sha256': manifest['sha256']}:
                        raise ClientError('INVALID_SERVICE_RESPONSE')
                finally: connection.close()
                return result
        except ClientError:
            raise
        except Exception:
            raise ClientError('UPLOAD_FAILED') from None

    def describe(self, expected_identity, *, max_bytes, expected_canonical_sha256=None):
        """Resolve only an independently selected exact producer/run/attempt.

        Payload size/hash come from immutable authenticated storage. Owners still
        validate their product receipts and GitHub run/job eligibility separately.
        """
        validate_identity(expected_identity)
        if type(max_bytes) is not int or not 0 <= max_bytes <= 1024**3:
            raise ClientError('INVALID_REQUEST')
        if expected_canonical_sha256 is not None and (type(expected_canonical_sha256) is not str
                or not re.fullmatch(r'[a-f0-9]{64}', expected_canonical_sha256)):
            raise ClientError('INVALID_REQUEST')
        key = identity_key(expected_identity)
        item = self._json_request('GET', '/v1/manifests/' + key)
        if (set(item) != set(IDENTITY) | {'size', 'sha256', 'canonical_receipt_sha256', 'outcome', 'evidence_class'}
                or any(item.get(name) != value for name, value in expected_identity.items())
                or identity_key(item) != key or type(item['size']) is not int or not 0 <= item['size'] <= max_bytes
                or any(type(item[name]) is not str or not re.fullmatch(r'[a-f0-9]{64}', item[name]) for name in ('sha256', 'canonical_receipt_sha256'))
                or item['outcome'] not in ('pass', 'fail', 'candidate', 'unknown')
                or item['evidence_class'] not in ('main-qualification', 'integrated-main', 'candidate', 'diagnostic')
                or (expected_canonical_sha256 is not None and item['canonical_receipt_sha256'] != expected_canonical_sha256)):
            raise ClientError('IDENTITY_MISMATCH')
        return {'key': key, 'manifest': item}

    def locate(self, selection, *, max_bytes, expected_canonical_sha256=None):
        fields = {'owner_id', 'repository_id', 'run_id', 'attempt', 'profile', 'workflow_path'}
        if type(selection) is not dict or set(selection) != fields: raise ClientError('INVALID_REQUEST')
        # Full identity validation also checks the selected IDs, attempt and profile.
        validate_identity({name: selection[name] for name in fields - {'workflow_path'}} |
            {'sha': '0'*40, 'workflow_sha': '0'*40, 'workflow_ref': str(selection['workflow_path']) + '@refs/heads/main'})
        found = self._json_request('POST', '/v1/lookup', selection)
        if type(found) is not dict or set(found) != {'key', 'manifest'} or type(found['manifest']) is not dict:
            raise ClientError('INVALID_SERVICE_RESPONSE')
        item = found['manifest']
        if (any(item.get(name) != selection[name] for name in fields - {'workflow_path'})
                or type(item.get('workflow_ref')) is not str
                or item['workflow_ref'].split('@')[0] != selection['workflow_path']):
            raise ClientError('IDENTITY_MISMATCH')
        result = self.describe({name: item.get(name) for name in IDENTITY}, max_bytes=max_bytes,
                              expected_canonical_sha256=expected_canonical_sha256)
        if result != found: raise ClientError('IDENTITY_MISMATCH')
        return result

    def checkpoint(self, key, sha256, *, operation, complete=False):
        if (type(key) is not str or not re.fullmatch('[a-f0-9]{64}', key)
                or type(operation) is not str or not re.fullmatch('[a-f0-9]{32}', operation)
                or type(sha256) is not str or not re.fullmatch('[a-f0-9]{64}', sha256) or type(complete) is not bool):
            raise ClientError('INVALID_REQUEST')
        result = self._json_request('POST', '/v1/objects/' + key + '/checkpoint',
            {'action': 'complete' if complete else 'begin', 'sha256': sha256, 'operation': operation})
        if (set(result) != {'checkpoint', 'completed'} or type(result['checkpoint']) is not str
                or not re.fullmatch('[a-f0-9]{64}', result['checkpoint']) or result['completed'] is not complete):
            raise ClientError('INVALID_SERVICE_RESPONSE')
        return result

    def fetch(self, key, destination, *, expected, max_bytes):
        destination = safe_path(destination)
        if destination.exists(): raise ClientError('DESTINATION_EXISTS')
        if (type(key) is not str or not re.fullmatch(r'[a-f0-9]{64}', key)
                or type(max_bytes) is not int or max_bytes < 0):
            raise ClientError('INVALID_REQUEST')
        part = destination.with_name(destination.name + '.part-' + secrets.token_hex(12))
        recovery_path = Path(str(part) + '.recovery.json')
        created = recovery_created = preserve = False
        try:
            manifest = self._json_request('GET', '/v1/manifests/' + key)
            if (manifest != expected or identity_key(manifest) != key
                    or type(manifest['size']) is not int or not 0 <= manifest['size'] <= max_bytes):
                raise ClientError('IDENTITY_MISMATCH')
            connection, response = self._request('GET', '/v1/objects/' + key)
            try:
                import base64
                streamed = json.loads(base64.b64decode(response.getheader('X-Artifact-Manifest'), validate=True))
                lease = response.getheader('X-Consumer-Lease')
                if (streamed != manifest or response.getheader('Content-Length') != str(manifest['size'])
                        or type(lease) is not str or not re.fullmatch(r'[a-f0-9]{64}', lease)):
                    raise ClientError('IDENTITY_MISMATCH')
                digest, count = hashlib.sha256(), 0
                descriptor = os.open(part, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
                with os.fdopen(descriptor, 'wb') as output:
                    created = True
                    while block := response.read(min(1048576, manifest['size'] - count + 1)):
                        count += len(block)
                        if count > manifest['size']: raise ClientError('PAYLOAD_INTEGRITY_FAILED')
                        output.write(block); digest.update(block)
                    output.flush(); os.fsync(output.fileno())
                if count != manifest['size'] or digest.hexdigest() != manifest['sha256']:
                    raise ClientError('PAYLOAD_INTEGRITY_FAILED')
            finally:
                connection.close()
            descriptor = os.open(recovery_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            recovery_created = True
            with os.fdopen(descriptor, 'wb') as output:
                output.write(canonical({'format': 1, 'key': key, 'manifest': manifest, 'payload': str(part)}))
                output.flush(); os.fsync(output.fileno())
            _sync_parent(recovery_path)
            # The durable independent copy and recovery handle precede ACK. A
            # response lost after server commit must not discard the only copy.
            preserve = True
            try:
                acknowledgment = self._json_request('POST', '/v1/objects/' + key + '/ack',
                                        {'lease_token': lease, 'sha256': digest.hexdigest()})
            except ClientError as error:
                if str(error) in ('SERVICE_REFUSED_401', 'SERVICE_REFUSED_403'):
                    preserve = False  # server denied before changing any lease
                raise
            if acknowledgment != {'acknowledged': True}: raise ClientError('ACKNOWLEDGMENT_FAILED')
            _publish(part, destination)
            preserve = False
            return {'key': key, 'manifest': manifest}
        except ClientError as error:
            if preserve: raise ClientError(str(error), recovery_path) from None
            raise
        except Exception:
            raise ClientError('FETCH_FAILED', recovery_path if preserve else None) from None
        finally:
            if not preserve:
                if created: part.unlink(missing_ok=True)
                if recovery_created: recovery_path.unlink(missing_ok=True)


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--endpoint')
    commands = parser.add_subparsers(dest='command', required=True)
    upload = commands.add_parser('upload')
    upload.add_argument('--source', required=True); upload.add_argument('--manifest', required=True)
    fetch = commands.add_parser('fetch')
    fetch.add_argument('--key', required=True); fetch.add_argument('--destination', required=True)
    fetch.add_argument('--manifest', required=True); fetch.add_argument('--max-bytes', required=True, type=int)
    recovery = commands.add_parser('recover')
    recovery.add_argument('--receipt', required=True); recovery.add_argument('--destination', required=True)
    recovery.add_argument('--manifest', required=True); recovery.add_argument('--max-bytes', required=True, type=int)
    args = parser.parse_args()
    try:
        with _regular_source(safe_path(args.manifest)) as source:
            raw = source.read(65537)
        if len(raw) > 65536: raise ClientError('INVALID_MANIFEST')
        manifest = json.loads(raw)
        if type(manifest) is not dict: raise ClientError('INVALID_MANIFEST')
        if args.command == 'recover':
            result = recover(args.receipt, args.destination, expected=manifest, max_bytes=args.max_bytes)
        else:
            client = Client(args.endpoint or '')
            result = (client.upload(args.source, manifest) if args.command == 'upload' else
                client.fetch(args.key, args.destination, expected=manifest, max_bytes=args.max_bytes))
        print(canonical(result).decode())
        return 0
    except ClientError as error:
        result = {'error': str(error)}
        if error.recovery_path: result['recovery_receipt'] = error.recovery_path
        print(canonical(result).decode())
        return 2
    except Exception:
        print('{"error":"CLIENT_FAILED"}')
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
