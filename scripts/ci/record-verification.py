import hashlib, json, os, re, subprocess
from pathlib import Path
sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
assert sha == os.environ['GITHUB_SHA']
log = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', Path('ci-tests.log').read_text())
counts = {}
for key in ('tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'):
    matches = re.findall(r'^(?:ℹ|#)\s+' + key + r'\s+(\d+)\s*$', log, re.M)
    assert len(matches) == 1, (key, matches)
    counts[key] = int(matches[0])
assert counts['tests'] >= 15 and counts['pass'] == counts['tests']
assert all(counts[key] == 0 for key in ('fail', 'cancelled', 'skipped', 'todo'))
index = Path('dist/index.html').read_bytes()
assert index and index == Path('dist/404.html').read_bytes()
files = {}
for path in sorted(Path('dist').rglob('*')):
    assert not path.is_symlink()
    if path.is_file():
        files[path.relative_to('dist').as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
assert {'index.html', '404.html'} <= files.keys()
receipt = dict(sourceSha=sha, sourceTree=subprocess.check_output(['git', 'rev-parse', 'HEAD^{tree}'], text=True).strip(),
    runner=os.environ['RUNNER_NAME'], tests=counts, buildVerification='passed', fallbackVerification='identical-to-index',
    deployment='not-run', browserVerification='not-run-by-original-CI', humanLearningReview='not-run', distFiles=files)
Path('ci-verification.json').write_text(json.dumps(receipt, indent=2) + '\n')
with open(os.environ['GITHUB_OUTPUT'], 'a') as out:
    out.write(f'sha={sha}\n')
