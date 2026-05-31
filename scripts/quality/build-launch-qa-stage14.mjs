import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const today = "2026-05-31";
const inventoryPath = path.join(root, "docs/site-inventory.md");
const checklistPath = path.join(root, "docs/launch-checklist.md");
const redirectMapPath = path.join(root, "docs/redirect-map-final.md");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function esc(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ").trim();
}

function splitMarkdownRow(line) {
  const cells = [];
  let current = "";
  let escaped = false;
  const trimmed = line.trim();
  const body = trimmed.startsWith("|") ? trimmed.slice(1, -1) : trimmed;
  for (const char of body) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
      current += char;
    } else if (char === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseInventory() {
  const rows = [];
  for (const line of fs.readFileSync(inventoryPath, "utf8").split("\n")) {
    if (!line.startsWith("| /")) continue;
    const cells = splitMarkdownRow(line);
    if (cells.length < 8) continue;
    rows.push({
      url: cells[0],
      file: cells[1],
      title: cells[2].replaceAll("\\|", "|"),
      type: cells[3],
      status: cells[4],
      metaTitle: cells[5].replaceAll("\\|", "|"),
      metaDescription: cells[6],
      links: cells[7],
      assets: cells[8] || "",
    });
  }
  return rows;
}

function fileForUrl(url) {
  const clean = decodeURI(String(url).replace(/^\//, "").split("#")[0].split("?")[0]);
  if (!clean) return "index.html";
  if (clean.endsWith("/")) return `${clean}index.html`;
  return clean;
}

function redirectTarget(html) {
  const refresh = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"';>]+)["'][^>]*>/i);
  const replace = html.match(/(?:window\.)?location\.(?:replace|href)\s*\(?\s*["']([^"']+)["']/i);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  const target = refresh?.[1] || replace?.[1] || "";
  return {
    target: target.trim(),
    canonical: canonical?.[1] || "",
    isRedirect: Boolean(target) || /<meta[^>]+http-equiv=["']refresh["']/i.test(html),
  };
}

function classifyRoute(row) {
  const file = row.file && row.file !== "-" ? row.file : fileForUrl(row.url);
  const directExists = exists(file);
  if (directExists) {
    const html = /\.(html?)$/i.test(file) ? read(file) : "";
    const redirect = html ? redirectTarget(html) : { isRedirect: false, target: "", canonical: "" };
    return {
      ...row,
      currentFile: file,
      routeState: redirect.isRedirect ? "redirect/alias" : row.status === "archiv" ? "archiv" : "exists",
      target: redirect.target,
      canonical: redirect.canonical,
      ok: true,
    };
  }
  const urlFile = fileForUrl(row.url);
  if (urlFile !== file && exists(urlFile)) {
    const html = /\.(html?)$/i.test(urlFile) ? read(urlFile) : "";
    const redirect = html ? redirectTarget(html) : { isRedirect: false, target: "", canonical: "" };
    return {
      ...row,
      currentFile: urlFile,
      routeState: redirect.isRedirect ? "redirect/alias" : "exists-by-url",
      target: redirect.target,
      canonical: redirect.canonical,
      ok: true,
    };
  }
  return {
    ...row,
    currentFile: file,
    routeState: "missing",
    target: "",
    canonical: "",
    ok: false,
  };
}

function listFiles(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  const stack = [full];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        stack.push(absolute);
      } else {
        out.push(path.relative(root, absolute).replaceAll(path.sep, "/"));
      }
    }
  }
  return out.sort();
}

function isDownloadLike(file) {
  return /\.(pdf|docx?|xlsx?|pptx?|zip|md|csv|json|html)$/i.test(file);
}

function collectDownloads(inventoryRows) {
  const inventoryDownloads = new Map();
  for (const row of inventoryRows) {
    if (row.type === "Download" || /^\/(?:assets|public)?\/?downloads\//.test(row.url) || /^\/dokumente\//.test(row.url)) {
      const file = row.file && row.file !== "-" ? row.file : fileForUrl(row.url);
      inventoryDownloads.set(file, row);
    }
    for (const cell of [row.assets, row.links]) {
      for (const part of String(cell || "").split("<br>")) {
        const cleaned = part.replace(/^\.\.\//, "").replace(/^\.\//, "").trim();
        if (/^(assets\/downloads|public\/downloads|downloads|dokumente)\//.test(cleaned) && isDownloadLike(cleaned)) {
          inventoryDownloads.set(cleaned, row);
        }
      }
    }
  }
  const noDeletePath = path.join(root, "docs/no-delete-list.md");
  if (fs.existsSync(noDeletePath)) {
    for (const line of fs.readFileSync(noDeletePath, "utf8").split("\n")) {
      const bullet = line.match(/^-\s+`([^`]+)`/);
      if (bullet && /^(assets\/downloads|public\/downloads|downloads|dokumente)\//.test(bullet[1]) && isDownloadLike(bullet[1])) {
        inventoryDownloads.set(bullet[1], { url: `/${bullet[1]}`, file: bullet[1], type: "Download" });
      }
    }
  }
  const currentDownloads = [
    ...listFiles("assets/downloads"),
    ...listFiles("public/downloads"),
    ...listFiles("downloads"),
    ...listFiles("dokumente"),
  ].filter(isDownloadLike);
  const missing = Array.from(inventoryDownloads.keys()).filter((file) => !exists(file));
  return {
    inventoryCount: inventoryDownloads.size,
    currentCount: currentDownloads.length,
    missing,
    addedSinceInventory: currentDownloads.filter((file) => !inventoryDownloads.has(file)),
  };
}

function collectHtml(dir) {
  return listFiles(dir).filter((file) => file.endsWith(".html"));
}

function pageTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "-";
}

function hasProtection(html) {
  return /protection-notice|Schutzlinien|Nicht amtlich|nicht amtlich|Keine Beratung|keine Beratung|keine Personenbewertung|Keine Personenbewertung|keine automatische Entscheidung/i.test(html);
}

function hasPlaceholderStatus(html) {
  return /status-badge[^>]*>(?:[^<]*(?:In Vorbereitung|Arbeitsfassung)|[\s\S]{0,120}(?:In Vorbereitung|Arbeitsfassung))/i.test(html);
}

function collectDemoToolAudit() {
  const demoFiles = [
    "erleben.html",
    "scanner.html",
    "scorecard-dashboard.html",
    "anwendungen/scanner.html",
    ...collectHtml("erleben"),
  ].filter((file, index, arr) => arr.indexOf(file) === index && exists(file));

  const toolFiles = collectHtml("werkzeuge").filter((file) => !/\/(?:dossier|dossiers|detailkonzepte|methodenpapiere)\//.test(file));
  const demoAudit = demoFiles.map((file) => {
    const html = read(file);
    return { file, title: pageTitle(html), protection: hasProtection(html) };
  });
  const toolAudit = toolFiles.map((file) => {
    const html = read(file);
    return { file, title: pageTitle(html), protection: hasProtection(html) };
  });
  return {
    demoAudit,
    toolAudit,
    demosMissingProtection: demoAudit.filter((item) => !item.protection),
    toolsMissingProtection: toolAudit.filter((item) => !item.protection),
  };
}

function collectPlaceholderAudit() {
  const htmlFiles = [
    ...collectHtml(".").filter(
      (file) =>
        !file.startsWith("node_modules/") &&
        !file.startsWith("outputs/") &&
        !file.startsWith(".codex-backup/") &&
        !file.startsWith("assets/downloads/") &&
        !file.startsWith("docs/") &&
        !file.startsWith("woek-akademie-app/"),
    ),
  ];
  const placeholders = [];
  for (const file of htmlFiles) {
    const html = read(file);
    const isPreparedPlaceholder =
      /<title>[^<]*(In Vorbereitung|Arbeitsfassung)[^<]*<\/title>/i.test(html) ||
      /<meta\s+name=["']search_type["']\s+content=["'](?:Werkzeug wird ergänzt|Platzhalter|Arbeitsfassung)["']/i.test(html) ||
      /Diese Seite ist als Platzhalter vorbereitet/i.test(html);
    if (isPreparedPlaceholder) {
      placeholders.push({ file, title: pageTitle(html), statusBadge: hasPlaceholderStatus(html) });
    }
  }
  return {
    count: placeholders.length,
    missingBadge: placeholders.filter((item) => !item.statusBadge),
    placeholders,
  };
}

function currentRedirects() {
  const htmlFiles = collectHtml(".").filter(
    (file) =>
      !file.startsWith("node_modules/") &&
      !file.startsWith("outputs/") &&
      !file.startsWith(".codex-backup/") &&
      !file.startsWith("docs/") &&
      !file.startsWith("woek-akademie-app/"),
  );
  return htmlFiles
    .map((file) => {
      const html = read(file);
      const info = redirectTarget(html);
      const url = `/${file.endsWith("/index.html") ? file.slice(0, -"index.html".length) : file}`;
      const source = url === "/index.html" ? "/" : url;
      let canonicalPath = "";
      try {
        canonicalPath = info.canonical ? new URL(info.canonical).pathname : "";
      } catch {
        canonicalPath = info.canonical || "";
      }
      const canonicalDiffers = Boolean(canonicalPath) && canonicalPath !== source;
      if (!info.isRedirect && !canonicalDiffers) return null;
      return {
        source,
        file,
        target: info.target || "-",
        canonical: info.canonical || "-",
        type: info.isRedirect ? "redirect/alias" : "canonical-alias",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.source.localeCompare(b.source));
}

function summarizeBy(items, key) {
  const counts = new Map();
  for (const item of items) counts.set(item[key], (counts.get(item[key]) || 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function table(headers, rows, limit = 80) {
  const clipped = rows.slice(0, limit);
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...clipped.map((row) => `| ${row.map(esc).join(" | ")} |`),
  ];
  if (rows.length > limit) {
    lines.push(`| … | ${rows.length - limit} weitere Einträge gekürzt | | |`);
  }
  return lines.join("\n");
}

const inventory = parseInventory();
const routeAudit = inventory.map(classifyRoute);
const missingRoutes = routeAudit.filter((item) => !item.ok);
const redirectNeeded = routeAudit.filter((item) => item.status === "redirect-needed");
const redirects = currentRedirects();
const downloads = collectDownloads(inventory);
const demoTools = collectDemoToolAudit();
const placeholders = collectPlaceholderAudit();

const launchChecklist = `# Launch-Checkliste

Stand: ${today}

Diese QA vergleicht das Stage-0-Inventar mit dem aktuellen Stand und nimmt keine inhaltlichen Großänderungen vor.

## Erledigt

- Stage-0-Inventar gelesen: ${inventory.length} inventarisierte Routen.
- Alte Routen gegen aktuellen Dateistand geprüft: ${routeAudit.length - missingRoutes.length}/${routeAudit.length} erreichbar, weiterleitend oder archiviert.
- Redirect-/Alias-Kandidaten geprüft: ${redirectNeeded.length} ursprünglich als \`redirect-needed\` markierte Einträge, aktuelle Redirect-/Canonical-Matrix separat in \`docs/redirect-map-final.md\`.
- Downloads geprüft: ${downloads.inventoryCount} inventarisierte Download-/Dokumentpfade, ${downloads.currentCount} aktuelle Download-/Dokumentdateien.
- Demos geprüft: ${demoTools.demoAudit.length} Demo-/Erleben-/Scanner-Seiten.
- Werkzeugseiten geprüft: ${demoTools.toolAudit.length} direkte Werkzeugseiten unter \`/werkzeuge/\` ohne Dossier-/Detailkonzept-Unterseiten.
- Placeholder-Status geprüft: ${placeholders.count} Seiten mit \`In Vorbereitung\` oder \`Arbeitsfassung\`.
- Interne Links per Projekt-Linkchecker vorgesehen; siehe finale Verifikation im Stage-14-Abschluss.

## Inventar-Abgleich

${table(["Status", "Anzahl"], summarizeBy(routeAudit, "routeState"))}

### Fehlende alte Routen

${missingRoutes.length ? table(["URL", "Inventar-Datei", "Status"], missingRoutes.map((item) => [item.url, item.file, item.status]), 120) : "Keine fehlenden inventarisierten Routen gefunden."}

## Downloads

- Inventarisierte Download-/Dokumentpfade: ${downloads.inventoryCount}
- Aktuelle Download-/Dokumentdateien: ${downloads.currentCount}
- Seit Stage 0 zusätzlich vorhanden: ${downloads.addedSinceInventory.length}

### Fehlende inventarisierte Downloads

${downloads.missing.length ? table(["Datei"], downloads.missing.map((file) => [file]), 120) : "Keine fehlenden inventarisierten Downloads gefunden."}

## Demos und Tools

### Demo-Schutzlinien

${demoTools.demosMissingProtection.length ? table(["Datei", "Titel"], demoTools.demosMissingProtection.map((item) => [item.file, item.title]), 120) : "Alle geprüften Demo-/Scanner-/Erleben-Seiten enthalten Schutzlinien oder ProtectionNotice-Hinweise."}

### Werkzeug-Schutzlinien

${demoTools.toolsMissingProtection.length ? table(["Datei", "Titel"], demoTools.toolsMissingProtection.map((item) => [item.file, item.title]), 120) : "Alle geprüften direkten Werkzeugseiten enthalten Schutzlinien oder Beratungs-/Methodikhinweise."}

## Placeholder-Status

${placeholders.missingBadge.length ? table(["Datei", "Titel"], placeholders.missingBadge.map((item) => [item.file, item.title]), 120) : "Alle geprüften Placeholder-Seiten mit \`In Vorbereitung\` oder \`Arbeitsfassung\` enthalten StatusBadge-Markup."}

## Offen

- Suffixed Duplicate-Dateien wie \`index 2.html\` und \`* 2.docx/pdf\` bleiben erreichbar, sollten aber nach Launch fachlich bereinigt oder gezielt archiviert werden.
- Werkzeugseiten sind teils Methodikseiten, teils Rechner-/Check-Seiten. Fehlende Schutzlinien auf direkten Werkzeugseiten sind Launch-Risiko, wenn die Seite als Entscheidungstool verstanden werden könnte.
- Die Download-Prüfung nutzt zusätzlich \`docs/no-delete-list.md\`, weil \`docs/site-inventory.md\` nur einen Teil der Download-Dateien als Routen führt.

## Risiko

- Größtes strukturelles Risiko: Duplicate-/Archivdateien mit Leerzeichen im Dateinamen können Nutzer:innen und Suchmaschinen irritieren.
- Mittleres Risiko: Einige Methodikseiten enthalten nicht durchgehend denselben sichtbaren Schutzlinienblock wie Demos.
- Niedriges Risiko: Redirect-Stubs und alte Aliasrouten bleiben vorhanden; Linkchecker sollte 0 interne 404 melden.

## Empfehlung

- Launch nur mit erfolgreichem Build und Linkcheck freigeben.
- Nach Launch eine eigene Cleanup-Stufe für Duplicate-Dateien und Archivstrategie planen, ohne Dateien zu löschen.
- Für direkte Werkzeugseiten einen einheitlichen Methodik-/Schutzlinien-Footer vorbereiten, aber nicht mehr als Großänderung in dieser Launch-QA erzwingen.
`;

const redirectMap = `# Redirect Map Final

Stand: ${today}

Diese Matrix dokumentiert aktuelle Redirects, Aliase und Canonicals. Es wurden in Stage 14 keine neuen Redirects umgesetzt.

## Zusammenfassung

- Aktuelle Redirect-/Alias-/Canonical-Einträge: ${redirects.length}
- Aus Stage 0 als \`redirect-needed\` inventarisiert: ${redirectNeeded.length}
- Fehlende inventarisierte Routen: ${missingRoutes.length}

## Aktuelle Redirects, Aliase und Canonicals

${table(["Quelle", "Datei", "Typ", "Ziel", "Canonical"], redirects.map((item) => [item.source, item.file, item.type, item.target, item.canonical]), 220)}

## Stage-0-Redirect-Needed-Abgleich

${table(
  ["URL", "Datei", "Aktueller Zustand", "Ziel", "Canonical"],
  redirectNeeded.map((item) => [item.url, item.currentFile, item.routeState, item.target || "-", item.canonical || "-"]),
  220,
)}

## Noch nicht automatisch bereinigen

- Duplicate-Dateien mit \` 2\` im Dateinamen bleiben als Archiv-/Fallback erreichbar.
- Alte semantische Routen wie \`/anwendungen.html\`, \`/glossar.html\`, \`/downloads.html\`, \`/erleben.html\` bleiben bewusst erhalten, solange externe Backlinks wahrscheinlich sind.
- Inhaltliche Konsolidierung braucht je Route eine kanonische Zielentscheidung und sollte nicht in der Launch-QA gelöscht werden.
`;

fs.writeFileSync(checklistPath, launchChecklist, "utf8");
fs.writeFileSync(redirectMapPath, redirectMap, "utf8");

console.log(
  JSON.stringify(
    {
      inventoryRoutes: inventory.length,
      missingRoutes: missingRoutes.length,
      downloadsInventory: downloads.inventoryCount,
      downloadsMissing: downloads.missing.length,
      demos: demoTools.demoAudit.length,
      demosMissingProtection: demoTools.demosMissingProtection.length,
      tools: demoTools.toolAudit.length,
      toolsMissingProtection: demoTools.toolsMissingProtection.length,
      placeholders: placeholders.count,
      placeholdersMissingBadge: placeholders.missingBadge.length,
      redirects: redirects.length,
    },
    null,
    2,
  ),
);
