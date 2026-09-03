#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, "").split("=");
  return [key, value.join("=") || "true"];
}));
const baseUrl = new URL(args.get("base-url") ?? "http://127.0.0.1:3000");
const widths = [320, 360, 390];
const viewportHeight = 844;
const concurrency = Math.max(1, Math.min(16, Number.parseInt(args.get("concurrency") ?? "8", 10) || 8));
const routeLimit = Math.max(0, Number.parseInt(args.get("route-limit") ?? "0", 10) || 0);
const outputPath = args.get("output") ?? null;
const explicitRoute = args.get("route") ?? null;
const chromePath = args.get("chrome") ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const confirmedRoute = "/quellen/quelle-3225f31089a72a6b";
const expectedConfirmedTitle = "Bundeskabinett beschließt Gebäudemodernisierungsgesetz";
const syntheticGermanTitle = "Bundesimmissionsschutzgenehmigungszuständigkeitsübertragungsverordnung";
const syntheticLongToken = "https://example.invalid/ununterbrochener-technischer-identifikator-0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function routeUrl(route) {
  const result = new URL(route, baseUrl);
  for (const [key, value] of baseUrl.searchParams) {
    if (!result.searchParams.has(key)) result.searchParams.set(key, value);
  }
  return result.href;
}

async function fetchHtml(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function discoverSourceRoutes() {
  if (explicitRoute) return [explicitRoute.startsWith("/") ? explicitRoute : `/${explicitRoute}`];
  const routes = new Set();
  let page = 1;
  while (page <= 200) {
    const url = new URL(routeUrl("/quellen"));
    url.searchParams.set("page", String(page));
    const html = await fetchHtml(url.href);
    const pageRoutes = [...html.matchAll(/href="(\/quellen\/[a-z0-9][a-z0-9-]*)"/g)].map((match) => match[1]);
    const before = routes.size;
    for (const route of pageRoutes) routes.add(route);
    if (pageRoutes.length === 0 || routes.size === before) break;
    page += 1;
  }
  const discovered = [...routes].sort();
  if (discovered.length === 0) throw new Error(`No public source-detail routes discovered at ${baseUrl.origin}`);
  if (routeLimit === 0) return discovered;
  const limited = discovered.slice(0, routeLimit);
  if (discovered.includes(confirmedRoute) && !limited.includes(confirmedRoute)) limited.push(confirmedRoute);
  return limited;
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }

  close() {
    this.socket.close();
  }
}

async function waitForChromePort(profileDirectory, child) {
  const activePortPath = path.join(profileDirectory, "DevToolsActivePort");
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Chrome exited before DevTools became ready (${child.exitCode})`);
    try {
      const [port] = (await readFile(activePortPath, "utf8")).trim().split(/\r?\n/);
      if (port) return Number.parseInt(port, 10);
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Timed out waiting for Chrome DevToolsActivePort");
}

async function newPage(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create Chrome target (${response.status})`);
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await Promise.all([client.send("Page.enable"), client.send("Runtime.enable")]);
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? "Runtime evaluation failed");
  return result.result.value;
}

async function waitForReady(client, expectedPathname = null) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const page = await evaluate(client, "({ state: document.readyState, pathname: location.pathname })");
    if (page.state === "complete" && (!expectedPathname || page.pathname === expectedPathname)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Page did not reach ${expectedPathname ?? "the requested path"} with document.readyState=complete`);
}

async function setViewport(client, width, settleLayout = true) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: viewportHeight,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: viewportHeight,
  });
  if (settleLayout) await evaluate(client, "(() => { document.body?.getBoundingClientRect(); return true; })()");
}

async function measure(client, width) {
  await setViewport(client, width);
  return evaluate(client, `(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const viewportWidth = documentElement.clientWidth;
    const documentScrollWidth = Math.max(documentElement.scrollWidth, body ? body.scrollWidth : 0);
    const offenders = [...document.querySelectorAll("body *")].flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const overflow = Math.max(0, rect.right - viewportWidth, -rect.left);
      if (overflow <= 1 && element.scrollWidth <= element.clientWidth + 1) return [];
      return [{
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className.slice(0, 120) : "",
        overflow: Math.round(overflow * 100) / 100,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        text: (element.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 160),
      }];
    }).sort((left, right) => right.overflow - left.overflow || right.scrollWidth - left.scrollWidth).slice(0, 8);
    return {
      requestedWidth: ${width},
      viewportWidth,
      documentScrollWidth,
      pass: documentScrollWidth <= viewportWidth + 1,
      title: document.querySelector(".source-detail-header h1")?.textContent?.trim() ?? null,
      offenders,
    };
  })()`);
}

async function navigateAndMeasure(client, route) {
  await setViewport(client, 390, false);
  const response = await client.send("Page.navigate", { url: routeUrl(route) });
  if (response.errorText) throw new Error(`${route}: ${response.errorText}`);
  await waitForReady(client, new URL(routeUrl(route)).pathname);
  const status = await evaluate(client, "document.querySelector('main, .source-detail-page') ? 200 : 404");
  if (status !== 200) throw new Error(`${route}: source-detail template not rendered`);
  const measurements = [];
  for (const width of widths) measurements.push(await measure(client, width));
  return { route, measurements };
}

async function syntheticFixtureCheck(client, route) {
  await setViewport(client, 390, false);
  await client.send("Page.navigate", { url: routeUrl(route) });
  await waitForReady(client, new URL(routeUrl(route)).pathname);
  await evaluate(client, `(() => {
    const title = document.querySelector(".source-detail-header h1");
    if (!title) throw new Error("Synthetic fixture needs a source title");
    title.textContent = ${JSON.stringify(syntheticGermanTitle)};
    const facts = document.querySelector(".source-facts");
    if (facts) {
      const row = document.createElement("div");
      row.innerHTML = "<dt>Technischer Testwert</dt><dd><a></a></dd>";
      row.querySelector("a").textContent = ${JSON.stringify(syntheticLongToken)};
      row.querySelector("a").href = ${JSON.stringify(syntheticLongToken)};
      facts.append(row);
    }
  })()`);
  const measurements = [];
  for (const width of widths) measurements.push(await measure(client, width));
  return { title: syntheticGermanTitle, token: syntheticLongToken, measurements };
}

async function main() {
  const startedAt = new Date().toISOString();
  const routes = await discoverSourceRoutes();
  if (!routes.includes(confirmedRoute) && !explicitRoute) throw new Error(`Confirmed regression route ${confirmedRoute} was not discovered`);
  const profileDirectory = await mkdtemp(path.join(tmpdir(), "woek-source-responsive-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-default-apps",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ], { stdio: "ignore" });

  let clients = [];
  try {
    const port = await waitForChromePort(profileDirectory, chrome);
    for (let index = 0; index < Math.min(concurrency, routes.length); index += 1) {
      clients.push(await newPage(port));
    }
    const results = new Array(routes.length);
    let cursor = 0;
    await Promise.all(clients.map(async (client) => {
      while (cursor < routes.length) {
        const index = cursor++;
        try {
          results[index] = await navigateAndMeasure(client, routes[index]);
        } catch (error) {
          results[index] = { route: routes[index], error: error instanceof Error ? error.message : String(error), measurements: [] };
        }
      }
    }));

    const confirmedClient = clients[0];
    const confirmed = await navigateAndMeasure(confirmedClient, confirmedRoute);
    const sourceTitleUnchanged = confirmed.measurements.every((measurement) => measurement.title === expectedConfirmedTitle);
    const synthetic = await syntheticFixtureCheck(confirmedClient, confirmedRoute);
    const failures = results.flatMap((result) => {
      if (result.error) return [{ route: result.route, error: result.error }];
      return result.measurements.filter((measurement) => !measurement.pass).map((measurement) => ({ route: result.route, ...measurement }));
    });
    const syntheticFailures = synthetic.measurements.filter((measurement) => !measurement.pass);
    const confirmedPass = confirmed.measurements.every((measurement) => measurement.pass) && sourceTitleUnchanged;
    const status = failures.length === 0 && syntheticFailures.length === 0 && confirmedPass ? "PASS" : "FAIL";
    const report = {
      schema_version: "1.0",
      checked_at: new Date().toISOString(),
      started_at: startedAt,
      base_url: baseUrl.href,
      status,
      gates: {
        SOURCE_DETAIL_MOBILE_320_NO_HORIZONTAL_DOCUMENT_OVERFLOW: results.every((result) => result.measurements.find((item) => item.requestedWidth === 320)?.pass === true) ? "PASS" : "FAIL",
        SOURCE_DETAIL_MOBILE_360_NO_HORIZONTAL_DOCUMENT_OVERFLOW: results.every((result) => result.measurements.find((item) => item.requestedWidth === 360)?.pass === true) ? "PASS" : "FAIL",
        SOURCE_DETAIL_MOBILE_390_NO_HORIZONTAL_DOCUMENT_OVERFLOW: results.every((result) => result.measurements.find((item) => item.requestedWidth === 390)?.pass === true) ? "PASS" : "FAIL",
        ALL_PUBLIC_SOURCE_DETAIL_ROUTES_RESPONSIVE_SCAN: failures.length === 0 ? "PASS" : "FAIL",
        CONFIRMED_ROUTE_3225F31089A72A6B_390X844: confirmedPass ? "PASS" : "FAIL",
        SOURCE_TITLE_TEXT_UNCHANGED: sourceTitleUnchanged ? "PASS" : "FAIL",
        SYNTHETIC_LONG_GERMAN_TITLE_AND_TOKEN: syntheticFailures.length === 0 ? "PASS" : "FAIL",
      },
      widths,
      routes_discovered: routes.length,
      route_measurements: routes.length * widths.length,
      failures,
      synthetic_failures: syntheticFailures,
      confirmed_route: confirmed,
      synthetic_fixture: synthetic,
    };
    if (outputPath) await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (status !== "PASS") process.exitCode = 1;
  } finally {
    for (const client of clients) client.close();
    chrome.kill("SIGTERM");
    await rm(profileDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
