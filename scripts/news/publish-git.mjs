import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
const exec = promisify(execFile);

export async function publishGitUpdate({ run = async args => {
  const result = await exec("git", args, { maxBuffer: 4 * 1024 * 1024 });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    // Rebase conflicts remain closed: never choose a side or force-push data.
    await run(["pull", "--rebase", "origin", "main"]);
    try {
      await run(["push", "origin", "HEAD:main"]);
      return { attempts: attempt };
    } catch (error) {
      if (attempt === 3) throw error;
      // A parallel release may advance main during the expensive object upload.
      // Re-read and integrate it before a bounded idempotent push retry.
      await sleep(attempt * 2000);
    }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await publishGitUpdate();
