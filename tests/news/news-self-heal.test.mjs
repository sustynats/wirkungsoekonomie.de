import test from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

test('Oracle self-healing preserves active writers and measures real publication', async () => {
  await promisify(execFile)('python3', ['-m', 'unittest', 'discover', '-s', 'tests/ops', '-p', 'test_news_self_heal.py'], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)), timeout: 30000,
  });
});
