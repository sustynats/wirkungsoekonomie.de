import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseArgument = process.argv.find((argument) => argument.startsWith("--base="));
const baseUrl = (baseArgument?.slice("--base=".length) || "http://127.0.0.1:3092").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9325;
const profile = mkdtempSync(join(tmpdir(), "woek-browser-audit-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank"
], { stdio: "ignore" });

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForChrome() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await pause(100);
  }
  throw new Error("Chrome DevTools did not become ready.");
}

class DevTools {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.sequence = 0;
    this.pending = new Map();
    this.events = [];
    this.socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) this.events.push(message);
    });
  }

  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() { this.socket.close(); }
}

async function auditPage(path, expression) {
  const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}${path}`)}`, { method: "PUT" });
  const target = await targetResponse.json();
  const devtools = new DevTools(target.webSocketDebuggerUrl);
  await devtools.ready();
  await Promise.all([
    devtools.send("Page.enable"),
    devtools.send("Runtime.enable"),
    devtools.send("Log.enable"),
    devtools.send("Network.enable")
  ]);
  await devtools.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await devtools.send("Page.navigate", { url: `${baseUrl}${path}` });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (devtools.events.some((event) => event.method === "Page.loadEventFired")) break;
    await pause(100);
  }
  await pause(750);
  const evaluated = await devtools.send("Runtime.evaluate", { expression: `JSON.stringify((${expression})())`, returnByValue: true });
  const result = JSON.parse(evaluated.result.value);
  const failures = devtools.events.filter((event) =>
    event.method === "Runtime.exceptionThrown" ||
    (event.method === "Runtime.consoleAPICalled" && event.params.type === "error") ||
    (event.method === "Log.entryAdded" && event.params.entry.level === "error")
  );
  devtools.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
  const consoleErrorDetails = failures.map((event) => {
    if (event.method === "Log.entryAdded") return event.params.entry.text;
    if (event.method === "Runtime.exceptionThrown") return event.params.exceptionDetails?.text ?? "Unbekannte Browser-Ausnahme";
    return event.params.args?.map((argument) => argument.value ?? argument.description).filter(Boolean).join(" ") ?? "Unbekannter Konsolenfehler";
  });
  return { ...result, consoleErrors: failures.length, consoleErrorDetails };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await waitForChrome();
  const index = await auditPage("/entscheidungen", `() => ({
    bodyText: document.body.innerText.length,
    cards: document.querySelectorAll('.decision-case-explorer .case-card').length,
    controls: document.querySelectorAll('.decision-filter-fields input, .decision-filter-fields select').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(index.bodyText > 1_000, "Decision index has too little visible content.");
  assert(index.cards === 28, `Decision index renders ${index.cards} instead of 28 cases.`);
  assert(index.controls >= 4, "Decision filters are incomplete.");
  assert(!index.overflow, "Decision index overflows horizontally at 375 px.");
  assert(index.consoleErrors === 0, "Decision index emits browser errors.");

  const decision = await auditPage("/entscheidungen/bt21-dip-c262bf7797f8", `() => ({
    bodyText: document.body.innerText.length,
    targetRows: document.querySelectorAll('.target-row').length,
    targetRowsTooSmall: [...document.querySelectorAll('.target-row')].filter((row) => row.getBoundingClientRect().height < 56).length,
    jumpLinks: document.querySelectorAll('.decision-page-navigation a').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(decision.bodyText > 5_000, "Decision page has too little visible content.");
  assert(decision.targetRows > 0, "Decision page has no normative target rows.");
  assert(decision.targetRowsTooSmall === 0, "A normative target row is smaller than 56 px.");
  assert(decision.jumpLinks >= 8, "Decision page navigation is incomplete.");
  assert(!decision.overflow, "Decision page overflows horizontally at 375 px.");
  assert(decision.consoleErrors === 0, "Decision page emits browser errors.");

  const programme = await auditPage("/fachakten/sachsen-anhalt-afd", `() => ({
    bodyText: document.body.innerText.length,
    directionFindings: document.querySelectorAll('.programme-direction').length,
    negativeFindings: document.querySelectorAll('.programme-direction--negative').length,
    detailedReasons: [...document.querySelectorAll('.programme-direction p')].filter((node) => node.textContent?.includes('Ausführliche Begründung')).length,
    misleadingArrow: [...document.querySelectorAll('.programme-result-icon--potential')].some((icon) => icon.textContent.includes('↗')),
    potentialIconColor: getComputedStyle(document.querySelector('.programme-result-icon--potential')).backgroundColor,
    riskIconColor: getComputedStyle(document.querySelectorAll('.programme-result-icon')[1]).backgroundColor,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(programme.bodyText > 2_000, "Programme page has too little visible content.");
  assert(programme.directionFindings >= 4, "Programme page omits its explicit directional findings.");
  assert(programme.negativeFindings >= 2, "Programme page understates its documented negative potential.");
  assert(programme.detailedReasons === programme.directionFindings, "A programme direction lacks its detailed rationale.");
  assert(!programme.misleadingArrow, "Potential card still contains a positive-looking arrow.");
  assert(programme.potentialIconColor !== programme.riskIconColor, "Potential and risk use the same semantic color.");
  assert(!programme.overflow, "Programme page overflows horizontally at 375 px.");
  assert(programme.consoleErrors === 0, "Programme page emits browser errors.");

  const dossier = await auditPage("/fachakten/dossiers/sachsen-anhalt-afd.html", `() => ({
    bodyText: document.body.innerText.length,
    commitmentRecords: document.querySelectorAll('details.commitment-record').length,
    directionCallouts: document.querySelectorAll('.commitment-direction').length,
    negativeCallouts: document.querySelectorAll('.commitment-direction--negative').length,
    styledLayout: getComputedStyle(document.querySelector('.dossier-layout')).display === 'grid',
    hasTools: Boolean(document.querySelector('.dossier-tools input[type=search]')),
    misleadingArrow: [...document.querySelectorAll('.dossier-result-grid .dossier-icon')].some((icon) => icon.textContent.includes('↗')),
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(dossier.bodyText > 10_000, "Full programme dossier has too little visible content.");
  assert(dossier.commitmentRecords === 466, `Full AfD dossier renders ${dossier.commitmentRecords} instead of 466 programme records.`);
  assert(dossier.directionCallouts === 466, "Not every programme record has a directional impact callout.");
  assert(dossier.negativeCallouts > 0, "Full AfD dossier omits its documented negative directional findings.");
  assert(dossier.styledLayout, "Full programme dossier stylesheet is not active.");
  assert(dossier.hasTools, "Full programme dossier has no navigation/search tools.");
  assert(!dossier.misleadingArrow, "Full dossier still contains a positive-looking arrow.");
  assert(!dossier.overflow, "Full programme dossier overflows horizontally at 375 px.");
  assert(dossier.consoleErrors === 0, "Full programme dossier emits browser errors.");

  const memberProfile = await auditPage("/abgeordnete/aaron-valent", `() => ({
    bodyText: document.body.innerText.length,
    matrices: document.querySelectorAll('.impact-profile-matrix').length,
    decisions: document.querySelectorAll('.profile-decision-list > article').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(memberProfile.bodyText > 2_000, "Member impact profile has too little visible content.");
  assert(memberProfile.matrices >= 2, "Member impact profile omits its MPD matrices.");
  assert(memberProfile.decisions >= 1, "Member impact profile omits its traceable decision.");
  assert(!memberProfile.overflow, "Member impact profile overflows horizontally at 375 px.");
  assert(memberProfile.consoleErrors === 0, `Member impact profile emits browser errors: ${memberProfile.consoleErrorDetails.join(" | ")}`);

  const factionProfile = await auditPage("/fraktionen/cdu-csu", `() => ({
    bodyText: document.body.innerText.length,
    matrices: document.querySelectorAll('.impact-profile-matrix').length,
    decisions: document.querySelectorAll('.profile-decision-list > article').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(factionProfile.bodyText > 5_000, "Faction impact profile has too little visible content.");
  assert(factionProfile.matrices >= 2, "Faction impact profile omits its MPD matrices.");
  assert(factionProfile.decisions === 12, "Faction impact profile does not expose all twelve decisions.");
  assert(!factionProfile.overflow, "Faction impact profile overflows horizontally at 375 px.");
  assert(factionProfile.consoleErrors === 0, "Faction impact profile emits browser errors.");

  const filteredFaction = await auditPage("/fraktionen/gruene?position=REJECTED&dimension=Mensch&richtung=AMBIVALENT#fallauswahl", `() => ({
    decisions: document.querySelectorAll('.profile-decision-list > article').length,
    detailedRationales: document.querySelectorAll('.profile-decision-analysis .path-evidence-boundary').length,
    inlineStyles: document.querySelectorAll('.impact-path-balance [style]').length,
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(filteredFaction.decisions === 6, `Filtered Greens profile renders ${filteredFaction.decisions} instead of six matching decisions.`);
  assert(filteredFaction.detailedRationales >= 6, "Filtered faction cases omit their detailed rationale/evidence boundary.");
  assert(filteredFaction.inlineStyles === 0, "Filtered faction profile uses CSP-blocked inline styles.");
  assert(!filteredFaction.overflow, "Filtered faction result overflows horizontally at 375 px.");
  assert(filteredFaction.consoleErrors === 0, "Filtered faction result emits browser errors.");

  const gegAnalysis = await auditPage("/fachanalysen/gebaeudeenergiegesetz-medienwirkung", `() => ({
    directionLabels: document.querySelectorAll('.reference-direction, .direction-label').length,
    detailedReasons: [...document.querySelectorAll('body *')].filter((node) => node.textContent?.includes('Ausführliche Begründung')).length,
    englishArtifacts: /Promulgated Law|Implementation Start|source ids|data gap/i.test(document.body.innerText),
    overflow: document.documentElement.scrollWidth > window.innerWidth
  })`);
  assert(gegAnalysis.directionLabels >= 10, "GEG analysis omits explicit directions for paths and reference fields.");
  assert(gegAnalysis.detailedReasons >= 2, "GEG analysis omits detailed direction rationales.");
  assert(!gegAnalysis.englishArtifacts, "GEG analysis exposes English system artifacts.");
  assert(!gegAnalysis.overflow, "GEG analysis overflows horizontally at 375 px.");
  assert(gegAnalysis.consoleErrors === 0, "GEG analysis emits browser errors.");

  console.log(JSON.stringify({ result: "PASS", baseUrl, viewport: "375x812", index, decision, programme, dossier, memberProfile, factionProfile, filteredFaction, gegAnalysis }));
} finally {
  chrome.kill("SIGTERM");
  if (chrome.exitCode === null) await Promise.race([once(chrome, "exit"), pause(1_000)]);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
}
