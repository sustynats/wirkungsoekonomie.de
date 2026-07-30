import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const termsOnly = process.argv.includes("--terms-only");
const today = "2026-07-30";
const sourceDocument = "verstehen/sdgs-sdgplus/risiko-resilienzregister/";
const registryPath = path.join(root, "assets", "data", "term-registry.json");

const links = {
  dossier: "/bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/",
  journal: "/blog/systemresilienz-statt-nachhaltigkeit/",
  riskRegister: "/verstehen/sdgs-sdgplus/risiko-resilienzregister/",
  systemresilienz: "/begriffe/systemresilienz/",
  risikoRegister: "/begriffe/risikoregister/",
  resilienzmanagement: "/begriffe/resilienzmanagement/",
  wirkungsmanagement: "/begriffe/wirkungsmanagement/",
  wirkungsrueckkopplung: "/begriffe/wirkungsrueckkopplung/",
  risikoResilienzregister: "/begriffe/risiko-und-resilienzregister/",
  sdgPlus: "/begriffe/sdg-plus/",
  sdgs: "/begriffe/sdgs/",
};

function filePath(rel) {
  return path.join(root, rel);
}

function exists(rel) {
  return fs.existsSync(filePath(rel));
}

function read(rel) {
  return fs.readFileSync(filePath(rel), "utf8");
}

function writeIfChanged(rel, next) {
  const full = filePath(rel);
  const before = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
  if (before === next) return false;
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, next);
  return true;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceFirst(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function updateMeta(html, description, title = null) {
  let next = html
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${esc(description)}">`)
    .replace(/<meta name="search_description" content="[^"]*">/i, `<meta name="search_description" content="${esc(description)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${esc(description)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${esc(description)}">`);
  if (title) {
    next = next
      .replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`)
      .replace(/<meta name="search_title" content="[^"]*">/i, `<meta name="search_title" content="${esc(title)}">`)
      .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${esc(title)}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${esc(title)}">`);
  }
  return next;
}

function replaceHeroText(html, { kicker, title, subtitle }) {
  let next = html;
  if (kicker) next = replaceFirst(next, /<p class="hero-kicker">[\s\S]*?<\/p>/i, `<p class="hero-kicker">${kicker}</p>`);
  if (title) next = replaceFirst(next, /<h1(?: class="hero-title")?>[\s\S]*?<\/h1>/i, `<h1 class="hero-title">${title}</h1>`);
  if (subtitle) next = replaceFirst(next, /<p class="hero-subtitle">[\s\S]*?<\/p>/i, `<p class="hero-subtitle">${subtitle}</p>`);
  return next;
}

function sectionBlock(marker, inner) {
  return `\n<!-- ${marker} -->\n${inner.trim()}\n<!-- /${marker} -->\n`;
}

function upsertAfterHero(html, marker, block) {
  const marked = sectionBlock(marker, block);
  if (html.includes(`<!-- ${marker} -->`)) {
    return html.replace(new RegExp(`\\n?<!-- ${marker} -->[\\s\\S]*?<!-- /${marker} -->\\n?`), marked);
  }
  const heroMatch = html.match(/<(section|article)\b[^>]*class=["'][^"']*hero/i);
  const heroStart = heroMatch?.index ?? -1;
  if (heroStart < 0) return html;
  const closeTag = `</${heroMatch[1]}>`;
  const heroEnd = html.indexOf(closeTag, heroStart);
  if (heroEnd < 0) return html;
  const insertAt = heroEnd + closeTag.length;
  return `${html.slice(0, insertAt)}${marked}${html.slice(insertAt)}`;
}

function upsertBeforeMainEnd(html, marker, block) {
  const marked = sectionBlock(marker, block);
  if (html.includes(`<!-- ${marker} -->`)) {
    return html.replace(new RegExp(`\\n?<!-- ${marker} -->[\\s\\S]*?<!-- /${marker} -->\\n?`), marked);
  }
  return html.replace(/<\/main>/i, `${marked}\n    </main>`);
}

function createTerm({ id, label, type, status, shortDefinition, longDefinition, relatedTerms, aliases = [], examples = [] }) {
  return {
    id,
    termId: id,
    canonicalLabel: label,
    label,
    slug: id,
    status,
    type,
    version: "1.0",
    source: "Website-Textanpassungen 2.1: SDGs und SDG+ als Risiko- und Resilienzregister",
    sourceDocument,
    sourceSection: "SDGs, SDG+ und Systemresilienz",
    shortDefinition,
    hoverDefinition: shortDefinition,
    definition: shortDefinition,
    longDefinition,
    woekRelation: "Der Begriff ordnet die neue Website-Rahmung ein: SDGs als Risiko- und Resilienzregister, SDG+ als Korrekturfähigkeit und Wirkungsökonomie als Rückkopplungsarchitektur.",
    usageNote: "Verwenden, wenn Nachhaltigkeit, SDGs, SDG+, Risiko, Resilienz und Rückkopplung als operative Steuerungslogik erklärt werden.",
    doNotConfuseWith: ["Nachhaltigkeit als reines Kommunikationslabel", "isoliertes ESG-Reporting", "Personenbewertung"],
    synonyms: aliases,
    aliases,
    relatedTerms,
    relatedDocuments: [
      sourceDocument,
      "bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/",
      "blog/systemresilienz-statt-nachhaltigkeit/",
      "verstehen/sdgs-sdgplus/",
    ],
    examples,
    preferredUsage: `${label} als prüfbaren Begriff für Risiko, Resilienz und Wirkungsrückkopplung verwenden.`,
    deprecatedUsage: [`${label} als bloßes Modewort ohne Daten-, Entscheidungs- und Schutzlinienbezug verwenden.`],
    reviewStatus: "approved",
    glossaryOrderKey: label.toLocaleLowerCase("de-DE"),
    firstApprovedIn: "2026.2",
    lastUpdated: today,
    category: "SDG+, Risiko und Systemresilienz",
    categories: ["resilienz", "sdg-plus", "wirkungslogik"],
    pageUrl: `/begriffe/${id}/`,
    classicGlossary: true,
    autoLinkAllowed: true,
  };
}

function addRelatedDocument(term, documentSlug) {
  const docs = Array.isArray(term.relatedDocuments) ? term.relatedDocuments : [];
  term.relatedDocuments = [documentSlug, ...docs.filter((item) => item !== documentSlug)];
  term.lastUpdated = today;
  return term;
}

function upsertTerms() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const terms = Array.isArray(registry) ? registry : registry.terms;
  const nextTerms = [
    createTerm({
      id: "resilienzmanagement",
      label: "Resilienzmanagement",
      type: "Kontextbegriff",
      status: "kontextbegriff",
      shortDefinition: "Resilienzmanagement senkt Verwundbarkeit, erhöht Anpassungsfähigkeit und schützt zentrale Systemfunktionen unter Stress.",
      longDefinition: "Resilienzmanagement macht Risiken und Verwundbarkeiten so bearbeitbar, dass Systeme zentrale Funktionen auch bei Schocks, Krisen, Fehlanreizen und Rückkopplungen erhalten. In der Wirkungsökonomie verbindet es Daten, Frühwarnsignale, Governance, Lernschleifen und Schutzlinien.",
      relatedTerms: ["systemresilienz", "risikomanagement", "resilienzarchitektur", "risiko-und-resilienzregister", "sdg-plus"],
      aliases: ["Resilience Management", "Resilienz-Management"],
      examples: ["Eine Kommune verbindet Hitze, Gesundheit, Pflege, Stadtgrün, Infrastruktur und Haushalt zu einer resilienteren Steuerung."],
    }),
    createTerm({
      id: "wirkungsmanagement",
      label: "Wirkungsmanagement",
      type: "Kontextbegriff",
      status: "kontextbegriff",
      shortDefinition: "Wirkungsmanagement organisiert Ziele, Daten, Wirkpfade, Bewertung und Rückkopplung so, dass Entscheidungen reale Zustandsveränderungen berücksichtigen.",
      longDefinition: "Wirkungsmanagement betrachtet nicht nur erbrachte Leistungen oder Programme, sondern Wirkungen, Nebenwirkungen, Datenqualität, Betroffene, Zeitraum, Risiken und Rückkopplung. Es verbindet strategische Ziele mit prüfbaren Wirkpfaden und Entscheidungsänderungen.",
      relatedTerms: ["wirkungsdaten", "wirkungsrueckkopplung", "positive-netto-wirkung", "impact-controlling", "systemresilienz"],
      aliases: ["wirkungsorientiertes Management"],
      examples: ["Eine Organisation nutzt Wirkungsdaten nicht nur im Bericht, sondern verändert Beschaffung, Finanzierung, Produktdesign und Governance."],
    }),
    createTerm({
      id: "risikoregister",
      label: "Risikoregister",
      type: "Kontextbegriff",
      status: "kontextbegriff",
      shortDefinition: "Ein Risikoregister sammelt und ordnet Risiken so, dass Zuständigkeiten, Daten, Eintrittspfade, Wirkungen und Bearbeitung sichtbar werden.",
      longDefinition: "Ein Risikoregister macht Risiken systematisch vergleichbar und bearbeitbar. Die Wirkungsökonomie liest die SDGs als globales Risiko- und Resilienzregister: Sie zeigen, welche Lebens- und Funktionsbedingungen stabil bleiben müssen, damit Gesellschaften, Märkte, Lieferketten, Ökosysteme und Demokratien nicht verwundbar werden.",
      relatedTerms: ["risiko-und-resilienzregister", "systemresilienz", "risikomanagement", "sdgs", "sdg-plus"],
      aliases: ["Risk Register", "Risiko-Register"],
      examples: ["SDG 6 Wasser wird als Standort-, Produktions-, Gesundheits-, Agrar- und Konfliktrisiko sichtbar."],
    }),
  ];

  for (const term of nextTerms) {
    const index = terms.findIndex((item) => item.termId === term.termId || item.slug === term.slug || item.id === term.id);
    if (index >= 0) terms[index] = { ...terms[index], ...term };
    else terms.push(term);
  }

  const impactManagementIndex = terms.findIndex((item) => item.termId === "impact-management" || item.slug === "impact-management" || item.id === "impact-management");
  if (impactManagementIndex >= 0) {
    const impactManagement = terms[impactManagementIndex];
    const aliases = Array.isArray(impactManagement.aliases) ? impactManagement.aliases : [];
    terms[impactManagementIndex] = {
      ...impactManagement,
      aliases: aliases.filter((alias) => alias !== "Wirkungsmanagement"),
      synonyms: Array.isArray(impactManagement.synonyms)
        ? impactManagement.synonyms.filter((alias) => alias !== "Wirkungsmanagement")
        : impactManagement.synonyms,
      relatedTerms: Array.from(new Set([...(Array.isArray(impactManagement.relatedTerms) ? impactManagement.relatedTerms : []), "wirkungsmanagement"])),
      lastUpdated: today,
    };
  }

  for (const relatedSlug of [
    "systemresilienz",
    "risikomanagement",
    "nachhaltigkeitsmanagement",
    "resilienzarchitektur",
    "wirkungsrisikomanagement",
    "wirkungsrueckkopplung",
    "risiko-und-resilienzregister",
    "sdg-plus",
    "sdgs",
    "positive-netto-wirkung",
  ]) {
    const index = terms.findIndex((item) => item.termId === relatedSlug || item.slug === relatedSlug || item.id === relatedSlug);
    if (index >= 0) terms[index] = addRelatedDocument(terms[index], sourceDocument);
  }

  fs.writeFileSync(registryPath, `${JSON.stringify(Array.isArray(registry) ? terms : { ...registry, terms }, null, 2)}\n`);
}

function resilienceReferenceBlock(prefix = "") {
  return `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">SDGs · SDG+ · Systemresilienz</p>
        <h2>Die neue Risiko- und Resilienzlesart</h2>
        <p>Die SDGs sind nicht nur Nachhaltigkeitsziele. Wirkungsökonomisch gelesen beschreiben sie Mindestbedingungen stabiler Gesellschaften, Märkte, Lieferketten, Ökosysteme und Institutionen. SDG+ ergänzt die demokratische, mediale, rechtliche, digitale und gesellschaftliche Korrekturfähigkeit.</p>
      </div>
      <div class="card-grid three">
        <article class="card">
          <p class="card-kicker">Dossier</p>
          <h3 class="card-title">SDGs als Risiko- und Resilienzregister</h3>
          <p class="card-text">Das Dossier erklärt die neue Lesart ausführlich und macht die Verbindung zu Systemresilienz, Risikointelligenz und Rückkopplung sichtbar.</p>
          <a class="text-link" href="${prefix}${links.dossier.replace(/^\//, "")}">Dossier lesen</a>
        </article>
        <article class="card">
          <p class="card-kicker">Journal</p>
          <h3 class="card-title">Nachhaltigkeit ist Systemresilienz</h3>
          <p class="card-text">Der Journalbeitrag erklärt Nachhaltigkeit als langfristige Wirkungsresilienz von Mensch, Planet und Demokratie – mit Rückstellung, Regeneration, Lernen und Nicht-Externalisierung.</p>
          <a class="text-link" href="${prefix}${links.journal.replace(/^\//, "")}">Artikel öffnen</a>
        </article>
        <article class="card">
          <p class="card-kicker">Glossar</p>
          <h3 class="card-title">Begriffe nachschlagen</h3>
          <p class="card-text">Systemresilienz, Risikoregister, Resilienzmanagement und Wirkungsrückkopplung sind im Glossar verlinkt und zitierfähig.</p>
          <a class="text-link" href="${prefix}${links.systemresilienz.replace(/^\//, "")}">Systemresilienz öffnen</a>
        </article>
      </div>
    </section>`;
}

function updateHomepage() {
  if (!exists("index.html")) return;
  let html = read("index.html");
  html = updateMeta(
    html,
    "Die Wirkungsökonomie macht Wirkung, Risiko und Systemresilienz sichtbar: positive Netto-Wirkung für Mensch, Planet und Demokratie statt Blindflug nach Gewinn und Wachstum.",
    "Gewinn und Wachstum reichen nicht als Maßstab | Wirkungsökonomie",
  );
  html = replaceHeroText(html, {
    kicker: "WAS PREISE, BERICHTE UND GEWINNE BISLANG NICHT ZEIGEN",
    title: "Gewinn und Wachstum reichen nicht als Maßstab.",
    subtitle:
      "Und zentrale Kontrolle ist keine Lösung. Die Wirkungsökonomie gibt Märkten, Politik, Kapital und öffentlichen Entscheidungen einen besseren Kompass: Wirkung statt Kapital, Systemresilienz statt Blindflug.",
  });
  html = html.replace(
    /<p class="lead-statement"><strong>Gewinn ist nicht das Problem\.<\/strong>[\s\S]*?<\/p>/,
    '<p class="lead-statement"><strong>Gewinn ist nicht das Problem.</strong> Das Problem ist, dass sich schädliche Wirkung noch rechnet - und positive Netto-Wirkung oft nicht.</p>',
  );
  html = upsertAfterHero(html, "sdg-resilience-homepage", resilienceReferenceBlock(""));
  writeIfChanged("index.html", html);
}

function updateVerstehen() {
  if (!exists("verstehen/index.html")) return;
  let html = read("verstehen/index.html");
  html = updateMeta(
    html,
    "Ein verständlicher Einstieg in Wirkung, positive Netto-Wirkung, SDGs als Risikoregister, SDG+ als Korrekturfähigkeit und Rückkopplung.",
    "Verstehen | Wirkungsökonomie",
  );
  html = replaceHeroText(html, {
    kicker: "Verstehen",
    title: "Erst Alltag, dann Fachbegriff.",
    subtitle:
      "Die Wirkungsökonomie beginnt mit einer einfachen Frage: Was verändert sich wirklich - und für wen? Danach kommen Begriffe, Daten, Bewertung, Risiko, Resilienz und Rückkopplung.",
  });
  html = upsertAfterHero(
    html,
    "sdg-resilience-verstehen",
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Vom Preis zur Wirkung</p>
        <h2>Der Apfel ist nicht nur ein Apfel.</h2>
        <p>Ein Preis zeigt, was du bezahlst. Eine Wirkungsfrage zeigt, was mitbezahlt wird: Wasser, Boden, Transport, Arbeit, Gesundheit, regionale Versorgung, Lieferkettenrisiko und Vertrauen.</p>
      </div>
      <div class="card-grid two">
        <article class="card"><p class="card-kicker">Alte Lesart</p><h3 class="card-title">Was kostet das?</h3><p class="card-text">Der Markt sieht vor allem Preis, Menge und Nachfrage. Folgen für Mensch, Planet und Demokratie bleiben oft außerhalb der Entscheidung.</p></article>
        <article class="card"><p class="card-kicker">Wirkungslesart</p><h3 class="card-title">Was bewirkt das?</h3><p class="card-text">Die Wirkungsökonomie prüft den Wirkpfad: Welche Zustände verändern sich? Welche Risiken werden erzeugt? Welche Schäden entstehen? Welche positive Netto-Wirkung wird möglich?</p></article>
      </div>
    </section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">SDGs als Risikoregister</p>
        <h2>Warum die SDGs härter sind als ein Nachhaltigkeitsetikett</h2>
        <p>Armut ist nicht nur ein Sozialthema, sondern ein Nachfrage-, Gesundheits-, Sicherheits- und Demokratierisiko. Wasser ist nicht nur ein Umweltziel, sondern Standort-, Produktions-, Gesundheits- und Konfliktrisiko. Bildung ist nicht nur ein weiches Gesellschaftsziel, sondern Fachkräfte-, Innovations-, Anpassungs- und Demokratierisiko.</p>
        <p>SDG+ ergänzt diese Logik um die Korrekturfähigkeit moderner Gesellschaften: Wahrheit, Recht, Vertrauen, Diskurs, Medienqualität, digitale Integrität, kulturelle Teilhabe und öffentliche Rechenschaft.</p>
      </div>
      <div class="hero-actions">
        <a class="btn btn-primary" href="../verstehen/sdgs-sdgplus/risiko-resilienzregister/">Risiko- und Resilienzregister verstehen</a>
        <a class="btn btn-secondary" href="../begriffe/systemresilienz/">Systemresilienz im Glossar</a>
      </div>
    </section>`,
  );
  writeIfChanged("verstehen/index.html", html);
}

function updateSdgReference() {
  if (!exists("verstehen/sdgs-sdgplus/index.html")) return;
  let html = read("verstehen/sdgs-sdgplus/index.html");
  html = updateMeta(
    html,
    "Die Wirkungsökonomie nutzt die SDGs, Agenda 2030 und SDG+ als Risiko- und Resilienzregister für Mensch, Planet, Demokratie, Medien, Recht, Vertrauen und digitale Selbstbestimmung.",
    "SDGs und SDG+ als Risiko- und Resilienzregister | Wirkungsökonomie",
  );
  html = replaceHeroText(html, {
    kicker: "Referenzrahmen",
    title: "SDGs und SDG+ als Risiko- und Resilienzregister.",
    subtitle:
      "Die SDGs beschreiben Mindestbedingungen, unter denen Gesellschaften, Märkte, Lieferketten, Gesundheitssysteme, Ökosysteme und Demokratien stabil, lernfähig und friedlich bleiben. SDG+ ergänzt die fehlende Systemebene: Demokratiequalität, Medienvielfalt, Rechtsstaatlichkeit, Diskursfähigkeit, Vertrauen, gesellschaftliche Resilienz, digitale Selbstbestimmung, Kooperation, kulturelle Teilhabe sowie Transparenz und Rechenschaft.",
  });
  html = upsertAfterHero(
    html,
    "sdg-resilience-reference",
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Neue Lesart</p>
        <h2>Die SDGs sind kommunikativ richtig, aber systemisch unterpräzise.</h2>
        <p>Sie klingen nach Nachhaltigkeit, Entwicklung und Zielbild. Das ist anschlussfähig. Der härtere Kern ist Risiko- und Resilienzmanagement: Wenn Armut, Hunger, Wasserstress, Krankheiten, Energieabhängigkeit, Infrastrukturversagen, Ungleichheit, Klimafolgen, Biodiversitätsverlust, Korruption oder Vertrauensverlust nicht bearbeitet werden, destabilisieren sie Gesellschaften, Märkte, Lieferketten, Kapitalmärkte, Versicherbarkeit, Gesundheit, Ernährung und Demokratie.</p>
        <blockquote><p>Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie. Die SDGs und SDG+ beschreiben Referenz-, Risiko- und Rückkopplungsdaten, die diese Systemfähigkeit prüfbar machen.</p></blockquote>
      </div>
      <div class="hero-actions">
        <a class="btn btn-primary" href="risiko-resilienzregister/">Ergänzungsseite öffnen</a>
        <a class="btn btn-secondary" href="../../bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/">Dossier lesen</a>
        <a class="btn btn-secondary" href="../../blog/systemresilienz-statt-nachhaltigkeit/">Journalbeitrag lesen</a>
      </div>
    </section>`,
  );
  html = html
    .replace(/Der Die Seite ist online lesbar; Word- und PDF-Dateien sind ergänzende(?: ergänzende)? Downloadfassungen\./g, "Diese Seite ist vollständig online lesbar. PDF-, Word-, CSV- oder JSON-Dateien sind ergänzende Export- und Archivfassungen.")
    .replace(/Separater Dossier-Download wird ergänzt/g, "Dossier-Download folgt nach redaktioneller Prüfung. Die Onlinefassung bleibt bis dahin der aktuelle Arbeitsstand.")
    .replace(/PDF PDF/g, "PDF")
    .replace(/(<a class="text-link" href="([^"]+\.pdf)">PDF<\/a>)\s*<a class="text-link" href="\2">PDF<\/a>/g, "$1");
  writeIfChanged("verstehen/sdgs-sdgplus/index.html", html);
}

function updateSimplePage(rel, metaDescription, hero, block, prefix = "../") {
  if (!exists(rel)) return;
  let html = read(rel);
  html = updateMeta(html, metaDescription);
  html = replaceHeroText(html, hero);
  html = upsertAfterHero(html, `sdg-resilience-${rel.replace(/[^a-z0-9]+/gi, "-").replace(/-$/g, "")}`, block);
  writeIfChanged(rel, html);
}

function updateMainPages() {
  updateSimplePage(
    "fuer/index.html",
    "Zielgruppeneinstiege der Wirkungsökonomie: Bürger:innen, Unternehmen, Politik, Kommunen, Medien, Wissenschaft, Kapital, Wohnen, Gesundheit, Landwirtschaft, Rente und Bildung.",
    {
      kicker: "Für wen · Zielgruppen",
      title: "Was bedeutet die Wirkungsökonomie für mich?",
      subtitle:
        "Die Wirkungsökonomie ist kein abstraktes Modell. Sie verändert, wie Unternehmen Risiken steuern, wie Politik Wirkung rückkoppelt, wie Bürger:innen Preise lesen, wie Kommunen Resilienz planen, wie Journalismus öffentliche Wirkung analysiert und wie Kapital Zukunftsrisiken bewertet.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Gemeinsame Frage</p>
        <h2>Was misst das alte System falsch?</h2>
        <p>Jede Zielgruppe sieht zuerst andere Zwänge: Budget, Markt, Haushalt, Redaktion, Forschung, Pflege, Rendite oder Alltag. Die Wirkungsökonomie ergänzt überall dieselbe Prüfung: Welche Wirkung, welche Risiken und welche Resilienz entstehen dadurch?</p>
      </div>
      <div class="hero-actions"><a class="btn btn-primary" href="../verstehen/sdgs-sdgplus/risiko-resilienzregister/">SDG-/SDG+-Risikorahmen öffnen</a><a class="btn btn-secondary" href="../begriffe/wirkungsmanagement/">Wirkungsmanagement</a></div>
    </section>`,
  );

  updateSimplePage(
    "wirkungsfelder/index.html",
    "Wirkungsfelder ordnen Mensch, Planet, Wirtschaft, Arbeit, Wohnen, Staat, Öffentlichkeit, Wissen und Kapital als Wirkungs-, Risiko- und Resilienzräume.",
    {
      kicker: "Systemlandkarte",
      title: "Wirkungsfelder",
      subtitle:
        "Fünf Cluster für Mensch, Planet und Demokratie - gelesen als Wirkungs-, Risiko- und Resilienzräume. Jedes Feld fragt: Welche Zustände werden verändert, welche Risiken entstehen und welche Resilienz wird gestärkt?",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Fünf Cluster</p>
        <h2>Die WÖk ordnet nach Wirkungsräumen, nicht nach Ressorts.</h2>
        <p>Alltag & Grundbedürfnisse, Wirtschaft & Kapital, Staat & Demokratie, Öffentlichkeit & Wissen sowie Planet & Resilienz zeigen, wo Wirkung konkret wird und wo fehlende Rückkopplung Systemrisiken erzeugt.</p>
      </div>
    </section>`,
  );

  updateSimplePage(
    "wirkungssteuerung/index.html",
    "Wirkungssteuerung verbindet Daten, Bewertung und Rückkopplung: Wirkung wird in Preise, Steuern, Kapital, Beschaffung, Haushalte, Management und Entscheidungen zurückgeführt.",
    {
      kicker: "Wirkungssteuerung",
      title: "Wirkungssteuerung",
      subtitle:
        "Wirkungssteuerung ist die Rückkopplungsarchitektur der Wirkungsökonomie: Wirkung wird nicht nur berichtet, sondern verändert Preise, Steuern, Kapital, Einkommen, Beschaffung, Produkte, Unternehmen, Staat und demokratische Entscheidungen.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Grundprinzip</p>
        <h2>Ohne Rückkopplung bleibt Wirkung Information.</h2>
        <p>Eine Handlung oder ein Unterlassen erzeugt Wirkungspotenzial oder Wirkungsrisiko. Daraus können Zustandsveränderungen entstehen. Diese werden gemessen, eingeordnet und an Mensch, Planet und Demokratie bewertet. Danach müssen sie zurück in Entscheidungen: in Preise, Steuern, Kapital, Beschaffung, Haushalte, Management, Förderung oder Recht.</p>
        <p><strong>Mit Rückkopplung wird Wirkung Richtung.</strong></p>
      </div>
      <div class="hero-actions"><a class="btn btn-primary" href="../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a><a class="btn btn-secondary" href="../begriffe/risikoregister/">Risikoregister</a></div>
    </section>`,
  );

  updateSimplePage(
    "oeffentlicher-wirkungsraum/index.html",
    "Der Öffentliche Wirkungsraum ordnet Aussagen, Narrative, Resonanz und Wirkpfade ein: Faktencheck plus Folgencheck für demokratische Korrekturfähigkeit.",
    {
      kicker: "Die fünf Wellen öffentlicher Wirkung",
      title: "Öffentlicher Wirkungsraum",
      subtitle:
        "Antworten finden. Narrative einordnen. Debatten wirksamer führen. Öffentliche Aussagen wirken über Fakten, Erfahrungen, Ängste, Loyalitäten, Plattformlogiken, wirtschaftliche Anreize und politische Interessen.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">SDG+ und Öffentlichkeit</p>
        <h2>Öffentlichkeit braucht mehr als richtige Antworten.</h2>
        <p>Eine demokratische Öffentlichkeit muss Aussagen prüfen, Resonanz einordnen, Aufmerksamkeit gewichten und Ursachen sichtbar machen. SDG+ macht diese Seite systemisch notwendig: Demokratiequalität, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen und digitale Selbstbestimmung sind Korrekturfähigkeiten der Gesellschaft.</p>
      </div>
    </section>`,
  );

  updateSimplePage(
    "werkzeuge/index.html",
    "Methoden und Werkzeuge der Wirkungsökonomie zeigen Wirkung, Risiken, Engpässe, Datenqualität, Schutzlinien und Rückkopplung.",
    {
      kicker: "Tool-Landschaft 2.1",
      title: "Methoden & Werkzeuge der Wirkungsökonomie",
      subtitle:
        "Erst Alltag, dann Begriff: Finde das passende Werkzeug für deine Frage und sieh danach die Methode dahinter. Keine Karte ist eine amtliche Bewertung, keine Demo trifft automatische Entscheidungen und kein Werkzeug bewertet Personen.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Risiko-/Resilienzlesart</p>
        <h2>Werkzeuge sollen nicht nur zeigen, ob etwas nachhaltig klingt.</h2>
        <p>Sie sollen sichtbar machen, welche Wirkungen, Risiken, Engpässe, Datenlücken und Rückkopplungen entstehen. Ergebnisse sind Modellierungen und Prüfpfade, keine automatischen Entscheidungen.</p>
      </div>
    </section>`,
  );

  updateSimplePage(
    "lernen/index.html",
    "Lernen in der Wirkungsökonomie heißt Wirkpfade erkennen, Risiken einordnen, Daten prüfen, Zielkonflikte verstehen und Rückkopplungen entwerfen.",
    {
      kicker: "Lernen",
      title: "Wirkungskompetenz aufbauen.",
      subtitle:
        "Lernen heißt hier nicht nur Begriffe kennen. Lernen heißt, Wirkpfade zu erkennen, Risiken einzuordnen, Daten zu prüfen, Zielkonflikte zu verstehen und bessere Rückkopplungen zu entwerfen.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Lernziel</p>
        <h2>Urteilskraft für komplexe Gesellschaften.</h2>
        <p>Die Lernbereiche verbinden Grundlagen, Begriffe, Beispiele, Werkzeuge, SDG-/SDG+-Referenzrahmen und persönliche Merkliste. Ziel ist nicht Auswendiglernen, sondern die Fähigkeit, Wirkung, Wirkungspotenziale, Risiken, Nebenwirkungen, Datenqualität, Systemzusammenhänge und Schutzlinien sauber zu unterscheiden.</p>
      </div>
    </section>`,
  );

  updateSimplePage(
    "bibliothek/index.html",
    "Die Bibliothek bündelt Grundlagenwerk, Dossiers, Journal, Glossar, Quellen und Onlinefassungen als Wissensinfrastruktur der Wirkungsökonomie.",
    {
      kicker: "Bibliothek",
      title: "Wissensbibliothek der Wirkungsökonomie.",
      subtitle:
        "Die Bibliothek bündelt Grundlagenwerk, Dossiers, Whitepaper, Working Papers, Methoden, Glossar, Quellen, Gesetze, Leitlinien und Onlinefassungen. Sie ist kein Ablageort für PDFs, sondern die Wissensinfrastruktur der Wirkungsökonomie.",
    },
    resilienceReferenceBlock("../"),
  );

  updateSimplePage(
    "mitmachen.html",
    "Mitmachen heißt in der Wirkungsökonomie: Fragen stellen, Annahmen prüfen, Quellen verbessern, Werkzeuge testen, Risiken benennen und Pilotierungen vorbereiten.",
    {
      kicker: "Mitmachen",
      title: "Wirkungsökonomie weiterdenken.",
      subtitle:
        "Die Wirkungsökonomie ist ein offenes Modell. Sie soll gelesen, geprüft, diskutiert, kritisiert und praktisch erprobt werden. Mitmachen heißt hier nicht Zustimmung, sondern gemeinsames Prüfen und Anwenden.",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Einladung</p>
        <h2>Eine neue Ordnung entsteht nicht allein.</h2>
        <p>Wirkung wird gesellschaftlich wirksam, wenn Menschen sie verstehen, anwenden, prüfen und weitertragen: Fragen stellen, Annahmen prüfen, Quellen verbessern, Werkzeuge testen, Risiken benennen und Pilotierungen vorbereiten.</p>
      </div>
    </section>`,
    "",
  );

  updateSimplePage(
    "ueber.html",
    "Warum die Wirkungsökonomie entstanden ist: Wirkung, Risiko, Systemresilienz und positive Netto-Wirkung als neuer Maßstab für Mensch, Planet und Demokratie.",
    {
      kicker: "Über die Wirkungsökonomie",
      title: "Warum dieses Modell entstanden ist",
      subtitle:
        "Die Wirkungsökonomie entstand aus einer einfachen Frage: Warum haben wir so viele Daten - und steuern trotzdem weiter nach dem falschen Maßstab?",
    },
    `
    <section class="section section-soft">
      <div class="section-header">
        <p class="hero-kicker">Paradigmenwechsel</p>
        <h2>Ein Gesellschaftsmodell und ein neuer Maßstab.</h2>
        <p>Die Wirkungsökonomie ist mehr als ein neues Wirtschaftsmodell. Sie verschiebt den Maßstab: Nicht mehr Kapital, Macht oder kurzfristiger Profit entscheiden, sondern positive Netto-Wirkung für Mensch, Planet und Demokratie - bewertet am Referenzrahmen von SDGs, Agenda 2030 und SDG+.</p>
        <p>Die neue Risiko-/Resilienzlesart schärft diesen Maßstab: Die SDGs beschreiben Stabilitätsbedingungen. SDG+ beschreibt Korrekturfähigkeiten. Die Wirkungsökonomie beschreibt die Architektur, durch die beides in Preise, Steuern, Kapital, Beschaffung, Governance und Entscheidungen zurückgeführt wird.</p>
      </div>
    </section>`,
    "",
  );
}

function buildRiskRegisterPage() {
  const base = read("verstehen/sdgs-sdgplus/index.html");
  const headerMatch = base.match(/<header class="site-header"[\s\S]*?<\/header>/);
  const footerMatch = base.match(/<footer class="footer"[\s\S]*?<\/footer>/);
  const header = (headerMatch?.[0] || "").replaceAll("../../", "../../../");
  const footer = (footerMatch?.[0] || "").replaceAll("../../", "../../../");
  const page = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Die SDGs als globales Risiko- und Resilienzregister | Wirkungsökonomie</title>
    <meta name="description" content="SDGs und SDG+ als Risiko-, Wirkungs- und Rückkopplungsrahmen für die langfristige Wirkungsresilienz von Mensch, Planet und Demokratie.">
    <meta name="search_title" content="Die SDGs als globales Risiko- und Resilienzregister">
    <meta name="search_description" content="Öffentlich verständliche Ergänzungsseite zum Dossier: SDGs als Risikoregister, SDG+ als Korrekturfähigkeit und Wirkungsökonomie als Rückkopplungsarchitektur.">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="Dossierseite">
    <link rel="canonical" href="https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/risiko-resilienzregister/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="Die SDGs als globales Risiko- und Resilienzregister">
    <meta property="og:description" content="SDGs und SDG+ als Risiko-, Wirkungs- und Rückkopplungsrahmen für die langfristige Wirkungsresilienz von Mensch, Planet und Demokratie.">
    <meta property="og:url" content="https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/risiko-resilienzregister/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Die SDGs als globales Risiko- und Resilienzregister">
    <meta name="twitter:description" content="SDGs und SDG+ als Risiko-, Wirkungs- und Rückkopplungsrahmen für die langfristige Wirkungsresilienz von Mensch, Planet und Demokratie.">
    <link rel="icon" href="../../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
${header}
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Verstehen</a> / <a href="../">SDGs &amp; SDG+</a> / Risiko- und Resilienzregister</nav>
          <p class="hero-kicker">Dossier</p>
          <h1 class="hero-title">Die SDGs als globales Risiko- und Resilienzregister.</h1>
          <p class="hero-subtitle">SDGs und SDG+ als Risiko-, Wirkungs- und Rückkopplungsrahmen für die langfristige Wirkungsresilienz von Mensch, Planet und Demokratie.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="../../../bibliothek/sdgs-sdgplus-risiko-resilienzregister-systemresilienz/">Vollständiges Dossier lesen</a>
            <a class="btn btn-secondary" href="../../../blog/systemresilienz-statt-nachhaltigkeit/">Journalbeitrag lesen</a>
          </div>
        </div>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Kurzformel:</strong> Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie. Die SDGs sind ein globales Risiko- und Resilienzregister; SDG+ macht seine demokratische Korrektur- und Lernfähigkeit sichtbar.</p>
          </div>
          <p>Nachhaltigkeit ist die langfristige <a href="../../../begriffe/wirkungsresilienz/">Wirkungsresilienz</a> des gekoppelten Systems Mensch–Planet–Demokratie. Die SDGs lassen sich zusätzlich als globale Risiko- und Resilienzfelder lesen; <a href="../../../begriffe/sdg-plus/">SDG+</a> macht demokratische Korrektur-, Lern- und Schutzfähigkeiten ausdrücklich sichtbar.</p>
          <p>Die 17 SDGs beschreiben keine moralische Wunschliste. Sie beschreiben Risikofelder, deren Nichtbearbeitung Gesellschaften, Märkte, Lieferketten, Kapitalmärkte, Versicherbarkeit, Gesundheit, Ernährung, Demokratie und ökologische Lebensgrundlagen destabilisiert.</p>
          <p>Armut ist dann kein bloßes Sozialthema, sondern ein Nachfrage-, Gesundheits-, Sicherheits- und Demokratierisiko. Hunger ist kein Entwicklungshilfethema, sondern ein Ernährungs-, Preis-, Agrar-, Konflikt- und Lieferkettenrisiko. Wasser ist kein Umweltlabel, sondern Standort-, Produktions-, Gesundheits- und Konfliktrisiko. Bildung ist kein weiches Gesellschaftsziel, sondern Fachkräfte-, Innovations-, Anpassungs- und Demokratierisiko. Klima ist nicht Meinung, sondern Physik mit Zeitverzug. Biodiversität ist nicht Naturromantik, sondern Infrastruktur für Nahrung, Böden, Bestäubung, Wasser, Gesundheit und Rohstoffe.</p>
          <p>SDG+ ergänzt diese Lesart um jene Systemfähigkeiten, die die SDGs voraussetzen, aber nicht tief genug operationalisieren: öffentliche Wahrheit, legitime Teilhabe, Rechtsstaatlichkeit, Diskursfähigkeit, digitale Integrität, institutionelles Vertrauen und gesellschaftliche Schockfestigkeit.</p>
          <p>Nachhaltigkeit ist damit nicht kleiner, sondern präziser gefasst: langfristige Wirkungsresilienz. <a href="../../../begriffe/systemresilienz/">Systemresilienz</a> beschreibt das Verhalten eines gekoppelten Systems unter Stress; die WÖk bindet sie an Mensch, Planet, Demokratie, positive Netto-Wirkung und Nicht-Externalisierung.</p>
          <p>Die Wirkungsökonomie geht einen Schritt weiter als klassisches Risikomanagement. Klassisches Risikomanagement fragt: Welche Risiken bedrohen unser Unternehmen, unser Kapital, unsere Lieferfähigkeit, unsere Reputation? Die Wirkungsökonomie fragt zusätzlich: Welche Risiken erzeugen wir selbst für andere, für Lieferketten, für Ökosysteme, für Demokratien und für kommende Generationen - und wann kommen diese Risiken als Kosten, Haftung, Regulierung, Instabilität, Versicherungsprämie oder Vertrauensverlust zurück?</p>
          <p>In der Bilanz kann Wirkung verschwinden. In der Wirklichkeit nicht. Wirkung ändert Ort, Form und Zeitpunkt, aber sie löst sich nicht auf. Genau deshalb reicht Nachhaltigkeitsreporting nicht. Es braucht <a href="../../../begriffe/wirkungsrueckkopplung/">Wirkungsrückkopplung</a>: in Preise, Steuern, Kapitalzugang, Beschaffung, Förderung, Management, Haushalte und demokratische Korrektur.</p>

          <section class="term-link-section">
            <div>
              <p class="section-eyebrow">Vier Lesarten</p>
              <h2>Vom Risikoregister zur Rückkopplung</h2>
            </div>
            <div class="card-grid two">
              <article class="card"><p class="card-kicker">Risikomanagement</p><h3 class="card-title">Risiken erkennen und bearbeiten</h3><p class="card-text">Risiken erkennen, bewerten, behandeln und überwachen.</p><a class="text-link" href="../../../begriffe/risikomanagement/">Begriff öffnen</a></article>
              <article class="card"><p class="card-kicker">Resilienzmanagement</p><h3 class="card-title">Systemfunktionen schützen</h3><p class="card-text">Verwundbarkeit senken, Anpassungsfähigkeit erhöhen und Systemfunktionen schützen.</p><a class="text-link" href="../../../begriffe/resilienzmanagement/">Begriff öffnen</a></article>
              <article class="card"><p class="card-kicker">Wirkungsmanagement</p><h3 class="card-title">Erzeugte Wirkungen rückkoppeln</h3><p class="card-text">Nicht nur Risiken für den eigenen Akteur betrachten, sondern erzeugte Wirkungen im gesamten System messen und rückkoppeln.</p><a class="text-link" href="../../../begriffe/wirkungsmanagement/">Begriff öffnen</a></article>
              <article class="card"><p class="card-kicker">Wirkungsökonomie</p><h3 class="card-title">Entscheidungen verändern</h3><p class="card-text">Wirkung als Maßstab in Preise, Steuern, Kapitalzugang, Beschaffung, Governance und Entscheidungen zurückführen.</p><a class="text-link" href="../../../verstehen/">Grundidee öffnen</a></article>
            </div>
          </section>

          <section class="term-summary-card">
            <p class="section-eyebrow">FAQ</p>
            <h2>Häufige Fragen</h2>
            <h3>Sind die SDGs damit falsch benannt?</h3>
            <p>Nein. Der Name Sustainable Development Goals war politisch anschlussfähig und konsensfähig. Wirkungsökonomisch ist er nur zu weich. Die SDGs können zugleich als Nachhaltigkeitsziele und als Risiko- und Resilienzfelder gelesen werden.</p>
            <h3>Ist das eine neue Ideologie?</h3>
            <p>Nein. Die Lesart ist wirtschaftsformunabhängig. Jede Ordnung braucht Ernährung, Wasser, Gesundheit, Bildung, Energie, Institutionen, Infrastruktur, ökologische Regeneration, soziale Kohäsion und Kooperationsfähigkeit.</p>
            <h3>Warum braucht es SDG+?</h3>
            <p>Weil ökologische und soziale Ziele ohne demokratische, mediale, rechtliche und digitale Korrekturfähigkeit instabil werden.</p>
            <h3>Bewertet SDG+ Meinungen?</h3>
            <p>Nein. Bewertet werden nicht angenehme oder unangenehme Meinungen, sondern Wirkungsräume und Strukturen: Quellenklarheit, Manipulationsschutz, Verfahren, Rechte, Datenintegrität, Diskursbedingungen, Plattformlogiken und Rechenschaft.</p>
          </section>
        </div>
      </section>
    </main>
${footer}
    <script src="../../../assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>
`;
  writeIfChanged("verstehen/sdgs-sdgplus/risiko-resilienzregister/index.html", page.replace(/[ \t]+$/gm, ""));
}

function normalizeSearchFallback() {
  if (!exists("suche.html")) return;
  let html = read("suche.html");
  html = html.replace(
    /Keine Ergebnisse gefunden\.[\s\S]{0,400}?<\/p>/,
    "Keine Ergebnisse gefunden. Versuche einen allgemeineren Begriff wie Wirkung, SDG+, Produktpreise, Wirkungssteuerung, Resonanzraum, Wirkungsrat oder positive Netto-Wirkung. Du kannst auch über Verstehen, Wirkungsfelder, Werkzeuge oder Bibliothek einsteigen.</p>",
  );
  writeIfChanged("suche.html", html);
}

function walkHtml(dir = root, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path.relative(root, full).replaceAll(path.sep, "/"));
  }
  return files;
}

function normalizePublicBoilerplate() {
  if (termsOnly) return;
  for (const rel of walkHtml()) {
    let html = read(rel);
    const before = html;
    html = html
      .replace(/CodeX-/g, "technische ")
      .replace(/Codex-Anweisung/g, "redaktionelle Arbeitsnotiz")
      .replace(/CodeX-Anweisung/g, "redaktionelle Arbeitsnotiz")
      .replace(/Generatorreste/g, "interne Platzhalter")
      .replace(/Diese drei Fachdetailkonzepte bilden Paket 1 der Go-2-Produktionsreihenfolge\./g, "Diese drei Fachdetailkonzepte bilden den öffentlichen Einstieg in den SDG-/SDG+-Referenzrahmen.")
      .replace(/Der Die Seite ist online lesbar; Word- und PDF-Dateien sind ergänzende(?: ergänzende)? Downloadfassungen\./g, "Diese Seite ist vollständig online lesbar. PDF-, Word-, CSV- oder JSON-Dateien sind ergänzende Export- und Archivfassungen.")
      .replace(/(<a class="text-link" href="([^"]+\.pdf)">PDF<\/a>)\s*<a class="text-link" href="\2">PDF<\/a>/g, "$1")
      .replace(/PDF PDF/g, "PDF");
    if (html !== before) writeIfChanged(rel, html);
  }
}

function main() {
  upsertTerms();
  if (termsOnly) {
    console.log("SDG resilience copydeck terms updated.");
    return;
  }
  updateHomepage();
  updateVerstehen();
  updateSdgReference();
  updateMainPages();
  buildRiskRegisterPage();
  normalizeSearchFallback();
  normalizePublicBoilerplate();
  console.log("SDG resilience copydeck page updates applied.");
}

main();
