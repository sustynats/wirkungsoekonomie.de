import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = process.env.JOURNAL_SOURCE_PATH || process.argv[2];
if (!sourcePath) {
  throw new Error("Bitte JOURNAL_SOURCE_PATH oder einen Markdown-Dateipfad als Argument angeben.");
}

const legacySlug = "meinungsfreiheit-ist-keine-folgenfreiheit";
const slug = "afd-ideologie-kann-deinen-job-kosten";
const title = "AfD-Ideologie kann deinen Job kosten";
const subtitle = "Warum nicht die Wahlentscheidung das Problem ist, sondern Aussagen, Verhalten und Wirkung.";
const date = "2026-06-09";
const readingTime = "18 Min.";
const category = "Öffentlicher Wirkungsraum";
const image = "/assets/img/blog/2026-06-09-meinungsfreiheit-ist-keine-folgenfreiheit.webp";
const imageAlt = "Illustration einer Waage zwischen Meinungsfreiheit und Verantwortung für Wirkung, mit öffentlicher Kommunikation, Rathaus, Gericht und Stadt im Hintergrund.";
const articlePath = path.join(root, "blog", slug, "index.html");
const registryPath = path.join(root, "assets", "data", "term-registry.json");
const journalIndexPath = path.join(root, "journal", "index.html");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extract(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  if (start < 0) throw new Error(`Start pattern not found: ${startPattern}`);
  const rest = source.slice(start);
  const endMatch = rest.match(endPattern);
  if (!endMatch?.index && endMatch?.index !== 0) throw new Error(`End pattern not found: ${endPattern}`);
  return rest.slice(0, endMatch.index + endMatch[0].length);
}

function headerFooter() {
  const source = fs.readFileSync(path.join(root, "blog", "der-versoehner-und-die-wellen", "index.html"), "utf8");
  return {
    header: extract(source, /<header class="site-header"/, /<\/header>/),
    footer: extract(source, /<footer class="footer"/, /<\/footer>/),
  };
}

function parseMarkdown(markdown) {
  const refs = new Map();
  const withoutRefs = markdown.replace(/^\[(\d+)\]:\s+(\S+)(?:\s+(.+))?\s*$/gm, (_, id, url, label = "") => {
    const cleanLabel = label.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"');
    refs.set(id, { url: cleanUrl(url), label: cleanLabel || url });
    return "";
  });
  const blocks = withoutRefs
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const html = [];
  let skippedTitle = false;
  let skippedSubtitle = false;

  for (const block of blocks) {
    if (block.startsWith("## ") && !skippedTitle) {
      skippedTitle = true;
      continue;
    }
    if (block.startsWith("### ") && !skippedSubtitle) {
      skippedSubtitle = true;
      continue;
    }
    if (block.startsWith("## ")) {
      html.push(`<h2>${inline(block.slice(3), refs)}</h2>`);
      continue;
    }
    if (block.startsWith("### ")) {
      html.push(`<h3>${inline(block.slice(4), refs)}</h3>`);
      continue;
    }
    html.push(`<p>${inline(block.replace(/\n/g, " "), refs)}</p>`);
  }

  return { bodyHtml: html.join("\n          "), refs: Array.from(refs.values()) };
}

function cleanUrl(value) {
  try {
    const url = new URL(value);
    url.searchParams.delete("utm_source");
    const next = url.toString();
    return next.endsWith("/") && !value.endsWith("/") ? next.slice(0, -1) : next;
  } catch {
    return value.replace(/[?&]utm_source=chatgpt\.com/g, "");
  }
}

function inline(value, refs) {
  return esc(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\[(\d+)\]/g, (_, label, id) => {
      const ref = refs.get(id);
      if (!ref) return label;
      return `<a href="${esc(ref.url)}">${label}</a>`;
    });
}

function upsertTerms() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const terms = Array.isArray(registry) ? registry : registry.terms;
  const sourceDocument = `blog/${slug}/`;
  const nextTerms = [
    {
      id: "oeffentliche-wirkung",
      termId: "oeffentliche-wirkung",
      canonicalLabel: "Öffentliche Wirkung",
      label: "Öffentliche Wirkung",
      slug: "oeffentliche-wirkung",
      status: "woek-praegungsbegriff",
      type: "WÖk-Prägungsbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Öffentlicher Wirkungsraum",
      shortDefinition: "Öffentliche Wirkung beschreibt Folgen, die öffentliche Aussagen, Symbole, Kampagnen oder Rollen für Vertrauen, Sicherheit, Zugehörigkeit, Institutionen und Demokratie entfalten.",
      hoverDefinition: "Öffentliche Wirkung beschreibt, was öffentliche Kommunikation in Vertrauen, Sicherheit, Zugehörigkeit und demokratischer Stabilität verändert.",
      definition: "Öffentliche Wirkung beschreibt Folgen, die öffentliche Aussagen, Symbole, Kampagnen oder Rollen für Vertrauen, Sicherheit, Zugehörigkeit, Institutionen und Demokratie entfalten.",
      longDefinition: "In der Wirkungsökonomie ist öffentliche Wirkung keine bloße Reichweite und keine Gesinnungsbewertung. Gemeint ist die prüfbare Frage, wie eine öffentlich sichtbare Handlung oder Aussage Zustände im öffentlichen Wirkungsraum verändert: Vertrauen, Diskursfähigkeit, Gleichbehandlung, Betriebsklima, Reputation, Rechtsstaatlichkeit, Zugehörigkeit oder demokratische Korrekturfähigkeit.",
      woekRelation: "Der Begriff verbindet Meinungsfreiheit mit Wirkungsverantwortung. Eine Äußerung kann grundrechtlich geschützt sein und trotzdem soziale, berufliche, institutionelle oder ökonomische Folgen erzeugen.",
      usageNote: "Nicht als Zensurformel verwenden. Immer zwischen Meinung, Rolle, Kontext, Reichweite, nachweisbarem Schaden, Wirkungsrisiko und Verhältnismäßigkeit unterscheiden.",
      doNotConfuseWith: ["Reichweite", "Gesinnungsprüfung", "Personenbewertung", "Zensur"],
      synonyms: ["öffentliche Folgen", "öffentliche Kommunikationswirkung", "public impact", "öffentliche Wirksamkeit"],
      aliases: ["öffentliche Folgen", "öffentliche Kommunikationswirkung", "public impact", "öffentliche Wirksamkeit"],
      relatedTerms: ["meinungsfreiheit", "wirkungsverantwortung", "oeffentlichkeit-als-wirkungsraum", "folgenfreiheit", "wirkungsfreiheit", "demokratische-rueckkopplung", "wirkungsrisiko", "wirkungspotenzial", "framing-sprache-tonalitaet"],
      relatedDocuments: [sourceDocument],
      examples: ["Ein öffentlicher Post kann Vertrauen in eine Institution stärken oder schwächen.", "Politische Werbung kann Menschen mobilisieren, aber auch Feindbilder normalisieren."],
      preferredUsage: "Öffentliche Wirkung als prüfbare Folge öffentlicher Kommunikation beschreiben.",
      deprecatedUsage: ["Öffentliche Wirkung als moralische Personenbewertung verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "öffentliche wirkung",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Sprache, Wirklichkeit und Kommunikation",
      categories: ["medien-oeffentlichkeit", "demokratie", "wirkungslogik"],
      pageUrl: "/begriffe/oeffentliche-wirkung/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
    {
      id: "folgenfreiheit",
      termId: "folgenfreiheit",
      canonicalLabel: "Folgenfreiheit",
      label: "Folgenfreiheit",
      slug: "folgenfreiheit",
      status: "woek-praezisierungsbegriff",
      type: "WÖk-Präzisierungsbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Öffentlicher Wirkungsraum",
      shortDefinition: "Folgenfreiheit ist die falsche Vorstellung, eine erlaubte oder geschützte Handlung müsse grundsätzlich ohne soziale, berufliche oder institutionelle Konsequenzen bleiben.",
      hoverDefinition: "Folgenfreiheit verwechselt Freiheit mit Anspruch auf Folgenlosigkeit.",
      definition: "Folgenfreiheit ist die falsche Vorstellung, eine erlaubte oder geschützte Handlung müsse grundsätzlich ohne soziale, berufliche oder institutionelle Konsequenzen bleiben.",
      longDefinition: "Die Wirkungsökonomie trennt Freiheit und Folgenfreiheit: Grundrechte schützen vor unzulässiger staatlicher Unterdrückung, schaffen aber keinen Anspruch darauf, dass öffentliche Wirkung von anderen nicht bewertet, beantwortet oder verhältnismäßig sanktioniert wird. Entscheidend bleiben Rolle, Kontext, Schutzpflichten, Schaden, Verhältnismäßigkeit und rechtsstaatliche Verfahren.",
      woekRelation: "Der Begriff ist ein Schutz gegen zwei Verkürzungen: gegen pauschale Sanktionierung unliebsamer Meinung und gegen die Behauptung, öffentliche demokratiegefährdende Wirkung müsse folgenlos bleiben.",
      usageNote: "Immer als Abgrenzungsbegriff verwenden: Wahlgeheimnis und Meinungsfreiheit schützen Freiheit, aber nicht jede öffentliche Wirkung vor jeder Folge.",
      doNotConfuseWith: ["Meinungsfreiheit", "Rechtsfreiheit", "Straffreiheit", "Wirkungsfreiheit"],
      synonyms: ["Folgenlosigkeit", "Konsequenzfreiheit", "Anspruch auf Folgenlosigkeit"],
      aliases: ["Folgenlosigkeit", "Konsequenzfreiheit", "Anspruch auf Folgenlosigkeit"],
      relatedTerms: ["meinungsfreiheit", "oeffentliche-wirkung", "wirkungsfreiheit", "wirkungsverantwortung", "verhaeltnismaessigkeit", "rechtsstaatlichkeit", "grundrechte"],
      relatedDocuments: [sourceDocument],
      examples: ["Eine Meinung darf geäußert werden; dennoch kann ihr öffentlich widersprochen werden.", "Eine berufliche Vertrauensrolle kann strengere Pflichten erzeugen als ein privates Gespräch."],
      preferredUsage: "Folgenfreiheit als Missverständnis von Freiheit präzisieren.",
      deprecatedUsage: ["Folgenfreiheit als Begründung für pauschale Sanktionen verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "folgenfreiheit",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Ethik, Würde und Verantwortung",
      categories: ["demokratie", "recht", "wirkungslogik"],
      pageUrl: "/begriffe/folgenfreiheit/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
    {
      id: "afd-ideologie",
      termId: "afd-ideologie",
      canonicalLabel: "AfD-Ideologie",
      label: "AfD-Ideologie",
      slug: "afd-ideologie",
      status: "kontextbegriff",
      type: "Kontextbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Öffentlicher Wirkungsraum",
      shortDefinition: "AfD-Ideologie bezeichnet im WÖk-Kontext keinen juristischen Tatbestand, sondern sichtbare Aussagen und Muster, die an rechtsextreme, demokratiefeindliche oder menschenabwertende Wirkung anschließen können.",
      hoverDefinition: "AfD-Ideologie ist hier ein vorsichtiger Kontextbegriff für sichtbare Wirkungsmuster, keine pauschale Personenbewertung.",
      definition: "AfD-Ideologie bezeichnet im WÖk-Kontext keinen juristischen Tatbestand, sondern sichtbare Aussagen und Muster, die an rechtsextreme, demokratiefeindliche oder menschenabwertende Wirkung anschließen können.",
      longDefinition: "Der Begriff darf nicht als pauschales Etikett für Wähler:innen oder Mitglieder verwendet werden. Gemeint sind öffentliches Verhalten, Sprache, Symbole, Codes oder Narrative, die Menschenwürde, Gleichbehandlung, Vertrauen, Betriebsklima, Verfassungstreue oder demokratische Korrekturfähigkeit berühren. Ob daraus arbeits-, dienst- oder reputationsrechtliche Folgen entstehen, verlangt immer Einzelfallprüfung, Kontext, Rolle, Schwere, Wiederholung, betriebliche Nähe und Verhältnismäßigkeit.",
      woekRelation: "Der Begriff macht sichtbar, dass politische Kommunikation nicht nur Meinung bleibt, sondern öffentliche Wirkung im Betrieb, in Institutionen und in Regionen entfalten kann.",
      usageNote: "Nur mit Schutzlinie verwenden: keine Gesinnungsprüfung, keine Wahlkontrolle, keine Pauschalbewertung; relevant ist sichtbares Verhalten und konkrete Wirkung.",
      doNotConfuseWith: ["AfD-Wahlentscheidung", "Parteimitgliedschaft", "konservative Meinung", "rechtliche Parteiverbotsentscheidung"],
      synonyms: ["AfD-nahe Wirkungsmuster", "rechtsextreme Wirkungsmuster", "demokratiegefährdende Wirkungsmuster"],
      aliases: ["AfD Ideologie", "AfD-nahe Wirkung", "rechtsextreme Wirkungsmuster"],
      relatedTerms: ["oeffentliche-wirkung", "folgenfreiheit", "meinungsfreiheit", "wirkungsverantwortung", "rechtsstaatlichkeit", "verhaeltnismaessigkeit"],
      relatedDocuments: [sourceDocument],
      examples: ["Ein öffentlicher Post mit Arbeitgeberbezug kann aus privater Meinung eine reputationsrelevante Wirkung machen."],
      preferredUsage: "AfD-Ideologie als kontextgebundenen Wirkungsbegriff mit klarer Schutzlinie nutzen.",
      deprecatedUsage: ["AfD-Ideologie als pauschale Bewertung einzelner Wähler:innen verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "afd ideologie",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Demokratie, Rechtsstaat und öffentlicher Wirkungsraum",
      categories: ["demokratie", "medien-oeffentlichkeit", "recht"],
      pageUrl: "/begriffe/afd-ideologie/",
      classicGlossary: true,
      autoLinkAllowed: false,
    },
    {
      id: "konsequenzfaehigkeit",
      termId: "konsequenzfaehigkeit",
      canonicalLabel: "Konsequenzfähigkeit",
      label: "Konsequenzfähigkeit",
      slug: "konsequenzfaehigkeit",
      status: "woek-praezisierungsbegriff",
      type: "WÖk-Präzisierungsbegriff",
      version: "1.0",
      source: `Journalbeitrag: ${title}`,
      sourceDocument,
      sourceSection: "Öffentlicher Wirkungsraum",
      shortDefinition: "Konsequenzfähigkeit beschreibt die demokratische Fähigkeit, auf schädliche öffentliche Wirkung rechtsstaatlich, verhältnismäßig und klar zu reagieren.",
      hoverDefinition: "Konsequenzfähigkeit heißt: Wirkung ernst nehmen, ohne in Gesinnungsprüfung oder Pauschalurteile zu kippen.",
      definition: "Konsequenzfähigkeit beschreibt die demokratische Fähigkeit, auf schädliche öffentliche Wirkung rechtsstaatlich, verhältnismäßig und klar zu reagieren.",
      longDefinition: "Konsequenzfähigkeit verbindet Meinungsfreiheit, Schutzpflichten und Wirkungsverantwortung. Sie meint nicht Härte um der Härte willen, sondern die Fähigkeit von Organisationen, Institutionen und Öffentlichkeit, sichtbare Wirkungen zu prüfen, Betroffene zu schützen, Rollen und Kontext zu beachten und angemessene Rückkopplungen auszulösen.",
      woekRelation: "Der Begriff ergänzt demokratische Rückkopplung: Eine freiheitliche Ordnung bleibt lern- und schutzfähig, wenn sie Wirkung sieht und angemessen beantwortet.",
      usageNote: "Nur mit Verhältnismäßigkeit, Einzelfallprüfung und Rechtsstaatlichkeit verwenden.",
      doNotConfuseWith: ["Sanktionslust", "Cancel Culture", "Gesinnungsprüfung"],
      synonyms: ["demokratische Konsequenzfähigkeit", "rechtsstaatliche Rückkopplungsfähigkeit"],
      aliases: ["Konsequenzfaehigkeit", "demokratische Konsequenzfähigkeit"],
      relatedTerms: ["demokratische-rueckkopplung", "oeffentliche-wirkung", "folgenfreiheit", "wirkungsverantwortung", "verhaeltnismaessigkeit"],
      relatedDocuments: [sourceDocument],
      examples: ["Ein Arbeitgeber reagiert auf diskriminierendes Verhalten zunächst mit Aufklärung, Schutzmaßnahmen oder Abmahnung und prüft Eskalation nur verhältnismäßig."],
      preferredUsage: "Konsequenzfähigkeit als rechtsstaatliche Antwortfähigkeit auf Wirkung beschreiben.",
      deprecatedUsage: ["Konsequenzfähigkeit als pauschale Forderung nach Sanktionen verwenden."],
      reviewStatus: "approved",
      glossaryOrderKey: "konsequenzfähigkeit",
      firstApprovedIn: "2026.2",
      lastUpdated: date,
      category: "Demokratie, Rechtsstaat und öffentlicher Wirkungsraum",
      categories: ["demokratie", "recht", "wirkungslogik"],
      pageUrl: "/begriffe/konsequenzfaehigkeit/",
      classicGlossary: true,
      autoLinkAllowed: true,
    },
  ];

  for (const term of nextTerms) {
    const index = terms.findIndex((item) => item.termId === term.termId || item.slug === term.slug);
    if (index >= 0) terms[index] = { ...terms[index], ...term };
    else terms.push(term);
  }

  fs.writeFileSync(registryPath, `${JSON.stringify(Array.isArray(registry) ? terms : { ...registry, terms }, null, 2)}\n`);
}

function removeLegacyArticle() {
  const legacyPath = path.join(root, "blog", legacySlug);
  if (fs.existsSync(legacyPath)) fs.rmSync(legacyPath, { recursive: true, force: true });
}

function articleHtml(markdown) {
  const { header, footer } = headerFooter();
  const { bodyHtml, refs } = parseMarkdown(markdown);
  const sourceItems = refs
    .map((ref) => `              <li><a href="${esc(ref.url)}">${esc(ref.label)}</a></li>`)
    .join("\n");
  const body = `
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../blog.html">Journal</a> / ${esc(title)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · 9. Juni 2026 · ${esc(readingTime)}</p>
          <h1 class="hero-title">${esc(title)}</h1>
          <p class="hero-subtitle">${esc(subtitle)}</p>
          <p class="meta">Von Natalie Weber - Wirkungsökonomie</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="../..${image}" width="2752" height="1536" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>Die Wahlkabine ist privat. Die öffentliche Bühne ist es nicht.</figcaption>
        </figure>
      </article>

      <section class="article-page">
        <div class="article-body">
          <div class="callout">
            <p><strong>Schutzlinie:</strong> Dieser Beitrag ist eine politische und wirkungsökonomische Einordnung, keine Rechtsberatung. Er behauptet keine Kündigungsautomatik, keine Wahlkontrolle und keine pauschale Bewertung von Wähler:innen. Es geht um sichtbares Verhalten, Rolle, Kontext, konkrete Wirkung, Schutzpflichten und Verhältnismäßigkeit.</p>
          </div>

          ${bodyHtml}

          <section class="term-link-section">
            <div>
              <p class="section-eyebrow">Glossar</p>
              <h2>Begriffe zum Beitrag</h2>
            </div>
            <div class="term-chip-row">
              <a class="term-chip" href="../../begriffe/afd-ideologie/">AfD-Ideologie</a>
              <a class="term-chip" href="../../begriffe/oeffentliche-wirkung/">Öffentliche Wirkung</a>
              <a class="term-chip" href="../../begriffe/folgenfreiheit/">Folgenfreiheit</a>
              <a class="term-chip" href="../../begriffe/konsequenzfaehigkeit/">Konsequenzfähigkeit</a>
              <a class="term-chip" href="../../begriffe/meinungsfreiheit/">Meinungsfreiheit</a>
              <a class="term-chip" href="../../begriffe/wirkungsverantwortung/">Wirkungsverantwortung</a>
              <a class="term-chip" href="../../begriffe/demokratische-rueckkopplung/">Demokratische Rückkopplung</a>
            </div>
          </section>

          <section class="term-summary-card">
            <p class="section-eyebrow">Quellenstand</p>
            <h2>Rechts-, Daten- und WÖk-Quellen</h2>
            <p>Stand der rechtlichen und politischen Statusaussagen: 9. Juni 2026.</p>
            <ol class="source-list">
${sourceItems}
            </ol>
          </section>
        </div>
      </section>
    </main>`;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="${esc(subtitle)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="Warum nicht die Wahlentscheidung das Problem ist, sondern sichtbare Aussagen, Verhalten und öffentliche Wirkung mit Folgen für Vertrauen, Betrieb, Amtspflichten, Reputation und Demokratie.">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <link rel="canonical" href="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(subtitle)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/blog/${slug}/">
    <meta property="og:image" content="https://wirkungsoekonomie.de${image}">
    <meta property="og:image:alt" content="${esc(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(subtitle)}">
    <meta name="twitter:image" content="https://wirkungsoekonomie.de${image}">
    <meta name="twitter:image:alt" content="${esc(imageAlt)}">
    <meta property="article:published_time" content="${date}T00:00:00+02:00">
    <meta property="article:modified_time" content="${date}T00:00:00+02:00">
    <meta property="article:section" content="${esc(category)}">
    ${["AfD-Ideologie", "Meinungsfreiheit", "Folgenfreiheit", "Öffentliche Wirkung", "Konsequenzfähigkeit", "Wirkungsverantwortung", "Demokratie", "Arbeitsrecht", "Öffentlicher Wirkungsraum", "Wirkungsökonomie"].map((tag) => `<meta property="article:tag" content="${esc(tag)}">`).join("\n    ")}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-journal-mobile-fix">
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: subtitle,
      url: `https://wirkungsoekonomie.de/blog/${slug}/`,
      image: `https://wirkungsoekonomie.de${image}`,
      inLanguage: "de",
      datePublished: `${date}T00:00:00+02:00`,
      dateModified: `${date}T00:00:00+02:00`,
      author: { "@type": "Person", name: "Natalie Weber" },
      publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: "https://wirkungsoekonomie.de" },
      articleSection: category,
      keywords: ["AfD-Ideologie", "Meinungsfreiheit", "Folgenfreiheit", "Öffentliche Wirkung", "Konsequenzfähigkeit", "Wirkungsverantwortung", "Demokratie", "Arbeitsrecht", "Wirkungsökonomie"],
    }, null, 2)}</script>
  </head>
  <body>
${header}
${body}
${footer}
    <script src="../../assets/js/main.js?v=20260612-journal-mobile-fix"></script>
  </body>
</html>
`.replace(/[ \t]+$/gm, "");
}

function upsertJournalIndex() {
  if (!fs.existsSync(journalIndexPath)) return;
  let current = fs.readFileSync(journalIndexPath, "utf8");
  current = current.replace(new RegExp(`\\s*<article class="card">[\\s\\S]*?\\.\\./blog/(?:${legacySlug}|${slug})/[\\s\\S]*?</article>`, "g"), "");
  const card = `          <article class="card">
            <p class="card-kicker">${esc(category)} · 9. Juni 2026</p>
            <h3 class="card-title">${esc(title)}</h3>
            <p class="card-text">Warum nicht die Wahlentscheidung das Problem ist, sondern Aussagen, Verhalten und Wirkung.</p>
            <div class="portal-card-actions"><a class="text-link" href="../blog/${slug}/">Artikel lesen</a></div>
          </article>
`;
  const next = current.replace(/(<div class="card-grid three">\n)/, `$1${card}`);
  fs.writeFileSync(journalIndexPath, next);
}

const markdown = fs.readFileSync(sourcePath, "utf8");
removeLegacyArticle();
fs.mkdirSync(path.dirname(articlePath), { recursive: true });
fs.writeFileSync(articlePath, articleHtml(markdown));
upsertTerms();
upsertJournalIndex();
console.log(`Published journal article: blog/${slug}/index.html`);
