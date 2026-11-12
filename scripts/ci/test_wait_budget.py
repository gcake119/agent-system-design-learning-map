import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

REPO = 'agent-system-design-learning-map'
SOURCE = Path(__file__).with_name('run-step.sh')

class WaitBudgetRouting(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.record = self.root / 'record.json'
        tool = self.root / 'slot'
        tool.write_text("#!/usr/bin/env python3\nimport json,os,subprocess,sys\nfrom pathlib import Path\nPath(os.environ['RECORD']).write_text(json.dumps(sys.argv[1:]))\nargs=sys.argv[1:]\nsys.exit(subprocess.run(args[args.index('--')+1:]).returncode)\n")
        tool.chmod(0o755)
        identity = self.root / 'id'
        identity.write_text('#!/bin/sh\necho 995\n')
        identity.chmod(0o755)
        self.wrapper = self.root / 'wrapper.sh'
        # Redirect the admission executable only; never use a real shared lock.
        self.wrapper.write_text(SOURCE.read_text().replace('/usr/local/bin/ci-resource-slot', str(tool)))
        self.payload = self.root / 'payload.sh'
        self.payload.write_text('exit 23\n')
        self.env = dict(os.environ, PATH=str(self.root)+':'+os.environ['PATH'],
                        RECORD=str(self.record), RUNNER_ENVIRONMENT='self-hosted',
                        GITHUB_REPOSITORY='gcake119/'+REPO, RUNNER_NAME='mint-'+REPO)

    def run_wrapper(self, **env):
        result = subprocess.run(['bash', str(self.wrapper), str(self.payload)],
                                env={**self.env, **env}, capture_output=True, text=True)
        args = json.loads(self.record.read_text()) if self.record.exists() else None
        return result.returncode, args

    def test_default_heavy_uses_shared_bounded_job_wait_budget(self):
        code, args = self.run_wrapper()
        self.assertEqual(code, 23)
        self.assertEqual(args[:8], ['--class','heavy','--timeout','14400','--job-wait-budget','14400','--','/usr/bin/bash'])
        self.assertEqual(args[-1], str(self.payload))

    def test_light_cleanup_never_consumes_heavy_budget(self):
        code, args = self.run_wrapper(CI_RESOURCE_CLASS='light')
        self.assertEqual(code, 23)
        self.assertEqual(args[:6], ['--class','light','--timeout','900','--','/usr/bin/bash'])
        self.assertNotIn('--job-wait-budget', args)

    def test_invalid_class_is_rejected_before_admission(self):
        code, args = self.run_wrapper(CI_RESOURCE_CLASS='invalid')
        self.assertEqual(code, 64)
        self.assertIsNone(args)

    def test_wrong_repository_is_rejected_before_admission(self):
        code, args = self.run_wrapper(GITHUB_REPOSITORY='other/repo')
        self.assertEqual(code, 1)
        self.assertIsNone(args)

if __name__ == '__main__':
    unittest.main()
