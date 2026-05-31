import path from "node:path";

export const demoGovernanceMarkerStart = "<!-- stage8-demo-governance:start -->";
export const demoGovernanceMarkerEnd = "<!-- stage8-demo-governance:end -->";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function relativeHref(root, fromFile, target) {
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  const targetPath = target.endsWith("/") ? path.join(root, target, "index.html") : path.join(root, target);
  let rel = path.relative(path.dirname(fromFile), targetPath).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  if (target.endsWith("/")) rel = rel.replace(/index\.html$/, "");
  return rel;
}

function linkList(root, fromFile, items) {
  return items
    .map((item) => `<a class="text-link" href="${relativeHref(root, fromFile, item.href)}">${escapeHtml(item.label)}</a>`)
    .join("");
}

export function renderDemoGovernanceBlock(root, fromFile, demo) {
  return `${demoGovernanceMarkerStart}
      <section class="section demo-governance" aria-labelledby="stage8-demo-${escapeHtml(demo.slug)}-title">
        <div class="section-header">
          <p class="hero-kicker">Demo-Methodik</p>
          <h2 id="stage8-demo-${escapeHtml(demo.slug)}-title">Was diese Demo zeigt und was nicht</h2>
          <p>Dieser Standardblock gilt für Demos, Rechner, Scanner und interaktive Tools. Er trennt modellhafte Darstellung von amtlicher Bewertung, Beratung oder automatisierter Entscheidung.</p>
        </div>
        <aside class="protection-notice" role="note" aria-label="Schutzlinien dieser Demo">
          <p class="card-kicker">ProtectionNotice</p>
          <h3 class="card-title">Nicht amtlich. Keine Beratung. Keine Personenbewertung.</h3>
          <ul class="protection-notice-list">
            <li>Nicht amtlich und keine WÖk-Zertifizierung.</li>
            <li>Keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs- oder Förderberatung.</li>
            <li>Keine Personenbewertung und kein Social-Credit-Mechanismus.</li>
            <li>Keine automatische Entscheidung; Verantwortung bleibt menschlich, institutionell und demokratisch legitimiert.</li>
            <li>Datenqualität, Annahmen und Unsicherheit müssen sichtbar bleiben.</li>
          </ul>
        </aside>
        <div class="card-grid four demo-governance-grid">
          <article class="card">
            <p class="card-kicker">Was diese Demo zeigt</p>
            <h3 class="card-title">${escapeHtml(demo.title)}</h3>
            <p class="card-text">${escapeHtml(demo.shows)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Modellannahmen</p>
            <h3 class="card-title">Vereinfachtes Arbeitsmodell</h3>
            <p class="card-text">${escapeHtml(demo.assumptions)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Datenqualität / Demo-Werte</p>
            <h3 class="card-title">Beispielwerte statt Prüfstatus</h3>
            <p class="card-text">${escapeHtml(demo.dataQuality)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Was diese Demo nicht leistet</p>
            <h3 class="card-title">Keine endgültige Einstufung</h3>
            <p class="card-text">${escapeHtml(demo.not)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Schutzlinien</p>
            <h3 class="card-title">Rote Linien bleiben sichtbar</h3>
            <p class="card-text">${escapeHtml(demo.protection)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Verwandte Methoden</p>
            <h3 class="card-title">Methodisch vertiefen</h3>
            <div class="demo-governance-links">${linkList(root, fromFile, demo.methods)}</div>
          </article>
          <article class="card">
            <p class="card-kicker">Verwandte Dokumente</p>
            <h3 class="card-title">Bibliothek und Kontext</h3>
            <div class="demo-governance-links">${linkList(root, fromFile, demo.docs)}</div>
          </article>
          <article class="card">
            <p class="card-kicker">Nächster Schritt</p>
            <h3 class="card-title">Vom Ausprobieren zur Anwendung</h3>
            <p class="card-text">${escapeHtml(demo.nextText)}</p>
            <div class="demo-governance-links">${linkList(root, fromFile, demo.next)}</div>
          </article>
        </div>
      </section>
${demoGovernanceMarkerEnd}`;
}
