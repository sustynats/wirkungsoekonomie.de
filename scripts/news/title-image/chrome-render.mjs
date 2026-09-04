// Screenshot our own generated SVG via the documented Chrome DevTools Protocol.
// No npm dependency, no browser profile/session reuse, no external navigation.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

export async function cleanupChromeProfile(directory, { remove = fs.promises.rm, warn = console.warn } = {}) {
  // Chrome helpers may finish writing after the browser process exits on Linux.
  // Cleanup must neither discard a completed PNG nor mask the render error.
  if (path.dirname(directory) !== os.tmpdir() || !path.basename(directory).startsWith("wt-title-cdp-")) throw new Error("CHROME_PROFILE_PATH_INVALID");
  try { await remove(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }); }
  catch { warn("CHROME_PROFILE_CLEANUP_DEFERRED"); } // ephemeral runner removes it at job end
}

export async function setGeneratedDocument(page, frameId, svg) {
  await page("Page.setDocumentContent", { frameId, html: `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; font-src data:; style-src 'unsafe-inline'"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}img{display:block}</style></head><body></body></html>` });
  // Multi-megabyte inlined originals can stall a single DevTools command.
  // Keep each transport frame bounded; no files or external URLs are needed.
  await page("Runtime.evaluate", { expression: "globalThis.__wtSvg=[]" });
  for (let offset = 0; offset < svg.length; offset += 65536) {
    await page("Runtime.evaluate", { expression: `globalThis.__wtSvg.push(${JSON.stringify(svg.slice(offset, offset + 65536))})` });
  }
  const result = await page("Runtime.evaluate", { expression: "(()=>{const image=new Image();image.src=URL.createObjectURL(new Blob(globalThis.__wtSvg,{type:'image/svg+xml'}));document.body.replaceChildren(image);delete globalThis.__wtSvg;return true})()", returnByValue: true });
  if (result.exceptionDetails || result.result?.value !== true) throw new Error("CHROME_DOCUMENT_INVALID");
}

export async function chromeRender(svg, { width, height, scale = 1, chrome }) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wt-title-cdp-"));
  let child, socket, timer, phase = "START";
  const pending = new Map(); let sequence = 0;
  try {
    const png = await Promise.race([
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`CHROME_RENDER_TIMEOUT_${phase}`)), 30000); }),
      (async () => {
        child = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", "--remote-debugging-address=127.0.0.1", `--user-data-dir=${directory}`, "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-component-update", "--disable-dev-shm-usage", "--password-store=basic", "--use-mock-keychain", ...(process.env.WT_CHROME_NO_SANDBOX === "true" ? ["--no-sandbox"] : []), "about:blank"], { stdio: ["ignore", "ignore", "pipe"], detached: process.platform !== "win32" });
        const endpoint = await new Promise((resolve, reject) => {
          let output = "";
          child.on("error", reject); child.on("exit", () => reject(new Error("CHROME_EXITED")));
          child.stderr.on("data", (data) => {
            output = (output + data.toString()).slice(-8000);
            const match = output.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[^\s]+)/);
            if (match) resolve(match[1]);
          });
        });
        phase = "CONNECT";
        socket = new WebSocket(endpoint);
        await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
        socket.addEventListener("message", (event) => {
          const result = JSON.parse(event.data);
          if (!pending.has(result.id)) return;
          const { resolve, reject } = pending.get(result.id); pending.delete(result.id);
          result.error ? reject(new Error("CHROME_PROTOCOL_ERROR")) : resolve(result.result);
        });
        const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
          const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
        phase = "PAGE";
        const { targetId } = await send("Target.createTarget", { url: "about:blank" });
        const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
        let pageCommands = 0;
        const page = (method, params) => { phase = `${method.replaceAll(".", "_")}_${++pageCommands}`; return send(method, params, sessionId); };
        await page("Page.enable");
        await page("Network.enable");
        await page("Network.setBlockedURLs", { urls: ["http://*", "https://*", "file://*"] });
        await page("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
        const { frameTree } = await page("Page.getFrameTree");
        phase = "DOCUMENT";
        await setGeneratedDocument(page, frameTree.frame.id, svg);
        phase = "ASSETS";
        const ready = await page("Runtime.evaluate", { expression: "Promise.all([document.fonts.ready,...Array.from(document.images).map(image=>image.decode())]).then(()=>true)", awaitPromise: true, returnByValue: true });
        if (ready.exceptionDetails || ready.result?.value !== true) throw new Error("CHROME_ASSETS_NOT_READY");
        phase = "SCREENSHOT";
        const shot = await page("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 }, captureBeyondViewport: false });
        return Buffer.from(shot.data, "base64");
      })(),
    ]);
    return png;
  } finally {
    clearTimeout(timer); socket?.close();
    for (const operation of pending.values()) operation.reject(new Error("CHROME_RENDER_CLOSED"));
    if (child && child.exitCode === null && child.signalCode === null) {
      const closed = once(child, "exit").catch(() => {});
      // Only the process group created above, never another browser/session.
      try { process.platform === "win32" ? child.kill("SIGKILL") : process.kill(-child.pid, "SIGKILL"); }
      catch { child.kill("SIGKILL"); }
      await closed;
    }
    await cleanupChromeProfile(directory);
  }
}
