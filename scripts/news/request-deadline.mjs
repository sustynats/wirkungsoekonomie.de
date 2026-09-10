// Keep the deadline alive until the whole operation (including body cleanup)
// settles. AbortSignal.timeout alone is unreferenced in Node and cannot keep
// a command-line worker alive while a broken fetch/body promise is pending.
export async function withRequestDeadline(operation, {timeoutMs, code}) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = Object.assign(new Error(code), {retryable:true});
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try { return await Promise.race([Promise.resolve().then(() => operation(controller.signal)), deadline]); }
  finally { clearTimeout(timer); }
}
