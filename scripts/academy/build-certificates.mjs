import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const sourcePath = "data/academy/certificates.json";
const outRoot = "zertifikat";
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const registry = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const siteUrl = "https://wirkungsoekonomie.de";
const publicCertificateRecords = Array.isArray(registry.certificates) ? registry.certificates : [];

if (publicCertificateRecords.length > 0) {
  throw new Error("Public website repo must not contain person-level certificate records.");
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[char]);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(record) {
  return crypto.createHash("sha256").update(stableStringify({
    schemaVersion: registry.schemaVersion,
    issuer: registry.issuer.name,
    program: registry.program.name,
    legalNotice: registry.legalNotice,
    certificateId: record.certificateId,
    holderName: record.holderName,
    qualificationLabel: record.qualificationLabel,
    issueDate: record.issueDate,
    status: record.status,
    version: record.version,
    recognitionBasis: record.recognitionBasis
  })).digest("hex");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate.replaceAll("{{BASE}}", base);
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function pageShell({ title, description, canonicalPath, body, base = "../", structuredData = null }) {
  const structured = structuredData
    ? `    <script type="application/ld+json">\n${JSON.stringify(structuredData, null, 6)}\n    </script>\n`
    : "";
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <link rel="canonical" href="${siteUrl}/${canonicalPath}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${siteUrl}/${canonicalPath}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260628-radar-toc">
${structured}  </head>
  <body>
${renderHeader(base)}
    <main>
${body}
    </main>
${renderFooter(base)}
    <script src="${base}assets/js/main.js?v=20260628-radar-toc"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function scopeList() {
  return `<ul class="certificate-scope-list">
${registry.program.scope.map((item) => `              <li>${esc(item)}</li>`).join("\n")}
            </ul>`;
}

function statusLabel(status) {
  return status === "gültig" ? "Gültig" : status;
}

function certificateUrl(record) {
  return `${siteUrl}/${record.verificationPath}`;
}

function renderIndex() {
  const body = `      <section class="hero certificate-hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Akademie-Zertifikate</p>
            <h1 class="hero-title">Zertifikat per ID prüfen.</h1>
            <p class="hero-subtitle">Direkte Verifikation der Akademie für Wirkungsökonomie.</p>
            <p class="hero-text">Diese Seite veröffentlicht keine Zertifikatsliste. Eine Prüfung erfolgt nur mit konkreter Zertifikats-ID oder über den QR-Code auf der Urkunde.</p>
          </div>
          <article class="card certificate-status-panel">
            <p class="card-kicker">Verifikation</p>
            <h2 class="card-title">Gültigkeit nur mit ID und QR-Code.</h2>
            <p class="card-text">${esc(registry.validityNotice)}</p>
            <p class="competence-note"><strong>Rechtlicher Hinweis:</strong> ${esc(registry.legalNotice)}</p>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="certificate-id-check-title">
        <div>
          <article class="term-summary-card certificate-id-check">
            <p class="section-eyebrow">Direktprüfung</p>
            <h2 id="certificate-id-check-title">Zertifikats-ID eingeben</h2>
            <form class="certificate-id-form" data-certificate-id-form>
              <label for="certificate-id-input">Zertifikats-ID</label>
              <div class="certificate-id-row">
                <input id="certificate-id-input" name="certificateId" type="text" autocomplete="off" inputmode="latin" placeholder="WOEK-PH-JJJJ-NNNN" pattern="WOEK-[A-Z0-9-]+" required>
                <button class="btn btn-primary" type="submit">Prüfen</button>
              </div>
              <p class="card-text">Die ID steht auf der Urkunde oder ist im QR-Code enthalten.</p>
            </form>
          </article>
        </div>
      </section>

      <script>
        (() => {
          const form = document.querySelector("[data-certificate-id-form]");
          if (!form) return;
          const result = document.createElement("p");
          result.className = "card-text";
          result.setAttribute("aria-live", "polite");
          form.append(result);
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='certificateId']");
            const id = String(input?.value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
            if (!id) return;
            result.textContent = "Zertifikat wird im Verifikationssystem geprüft ...";
            fetch("https://akademie.wirkungsoekonomie.de/api/certificates/" + encodeURIComponent(id), {
              headers: { "Accept": "application/json" }
            })
              .then((response) => response.json().then((body) => ({ ok: response.ok, body })))
              .then(({ ok, body }) => {
                if (!ok || !body.ok || !body.certificate) {
                  result.textContent = body.message || "Dieses Zertifikat konnte nicht verifiziert werden.";
                  return;
                }
                const certificate = body.certificate;
                const status = certificate.statusLabel || certificate.status || "verifiziert";
                const issued = certificate.issueDateDisplay || certificate.issueDate || "ohne Datumsanzeige";
                result.textContent = "Verifiziert: " + (certificate.qualificationLabel || "WÖk-Zertifikat") + ", Status " + status + ", ausgestellt " + issued + ".";
              })
              .catch(() => {
                result.textContent = "Die Zertifikatsprüfung ist derzeit nicht erreichbar.";
              });
          });
        })();
      </script>`;

  return pageShell({
    title: "Zertifikate prüfen | Akademie für Wirkungsökonomie",
    description: "Direkte Verifikation von Zertifikaten der Akademie für Wirkungsökonomie mit Zertifikats-ID oder QR-Code.",
    canonicalPath: "zertifikat/",
    base: "../",
    body
  });
}

function renderCertificate(record) {
  const fullHash = fingerprint(record);
  const shortHash = fullHash.slice(0, 16);
  const body = `      <section class="hero certificate-hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Zertifikatsverifikation</p>
            <h1 class="hero-title">${esc(record.holderName)}</h1>
            <p class="hero-subtitle">${esc(record.qualificationLabel)}</p>
            <p class="hero-text">${esc(registry.program.level)}. Status: ${esc(statusLabel(record.status))}. Ausgestellt am ${esc(record.issueDateDisplay)} durch die ${esc(registry.issuer.name)}.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="../../${esc(record.pdfPath)}" rel="nofollow">PDF-Zertifikat öffnen</a>
            </div>
          </div>
          <article class="card certificate-status-panel">
            <p class="card-kicker">Status</p>
            <h2 class="card-title"><span class="certificate-status-badge">${esc(statusLabel(record.status))}</span></h2>
            <dl class="certificate-meta-list">
              <div><dt>Zertifikats-ID</dt><dd>${esc(record.certificateId)}</dd></div>
              <div><dt>Ausgestellt</dt><dd>${esc(record.issueDateDisplay)}</dd></div>
              <div><dt>Version</dt><dd>${esc(record.version)}</dd></div>
              <div><dt>Registry-Fingerprint</dt><dd><code>${esc(shortHash)}</code></dd></div>
            </dl>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="certificate-proof-title">
        <div class="certificate-verification-grid">
          <article class="term-summary-card">
            <p class="section-eyebrow">Prüfgrundlage</p>
            <h2 id="certificate-proof-title">Anerkennung und Zertifizierungsgrundlage</h2>
            <p>${esc(record.recognitionBasis)}</p>
            <p><strong>Rolle:</strong> ${esc(record.holderRole)}</p>
            <p><strong>Freigabe:</strong> ${esc(record.releaseAuthority)}</p>
          </article>

          <article class="term-summary-card">
            <p class="section-eyebrow">Gegenstand</p>
            <h2>Inhalt der Qualifikation</h2>
            ${scopeList()}
          </article>
        </div>
      </section>

      <section class="section section-soft" aria-labelledby="certificate-legal-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Rechtsabgrenzung</p>
            <h2 id="certificate-legal-title">Private Akademie-Zertifizierung, kein staatlicher Grad.</h2>
            <p>${esc(registry.legalNotice)}</p>
            <p>${esc(registry.validityNotice)}</p>
          </div>
          <div class="certificate-proof-strip">
            <div><span>Zertifikats-ID</span><strong>${esc(record.certificateId)}</strong></div>
            <div><span>Verifikations-URL</span><strong>${esc(certificateUrl(record))}</strong></div>
            <div><span>SHA-256</span><strong>${esc(shortHash)}</strong></div>
          </div>
        </div>
      </section>`;

  return pageShell({
    title: `${record.holderName} - ${record.qualificationLabel} | Zertifikat prüfen`,
    description: `Verifikation des WÖk-Zertifikats ${record.certificateId} für ${record.holderName}: ${record.qualificationLabel}, Status ${statusLabel(record.status)}.`,
    canonicalPath: record.verificationPath,
    base: "../../",
    body
  });
}

fs.mkdirSync(outRoot, { recursive: true });

for (const entry of fs.readdirSync(outRoot, { withFileTypes: true })) {
  if (entry.isDirectory() && /^WOEK-[A-Z0-9-]+$/.test(entry.name)) {
    fs.rmSync(path.join(outRoot, entry.name), { recursive: true, force: true });
  }
}

fs.writeFileSync(path.join(outRoot, "index.html"), renderIndex());

console.log("Wrote neutral certificate verification page; no person-level certificate pages in public repo.");
