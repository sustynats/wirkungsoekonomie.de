import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Kanonische Personen-/Urheberinnenseite von Natalie Weber unter /w/natalie-weber/
// plus Unterseiten. Eigenständiges, warmes Look&Feel (self-contained CSS/Fonts),
// indexierbar (kein noindex). Interne Verlinkung; keine "Zur Website"-CTAs.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Externe, freigegebene Profile
const LINKS = {
  linkedin: "https://www.linkedin.com/in/natalie-weber-woek/",
  spotify: "https://open.spotify.com/show/7gfvcutQoqS8sfWCN5ZS22",
  appleMusic: "https://music.apple.com/de/artist/sustynats/1733095804",
  amazonMusic: "https://music.amazon.de/artists/B0CWK13RR3/sustynats",
  youtubeMusic: "https://music.youtube.com/channel/UCOpEj__GRuno-7yJbzXz2Ow",
  amazonAuthor: "https://www.amazon.com/stores/Natalie-Weber/author/B0BSQSRYHV",
};

const CSS = `
      @font-face { font-family: "Playfair Display"; src: url("{B}assets/fonts/playfair-display-700.woff2") format("woff2"); font-weight: 700; font-display: swap; }
      @font-face { font-family: "Playfair Display"; src: url("{B}assets/fonts/playfair-display-600.woff2") format("woff2"); font-weight: 600; font-display: swap; }
      @font-face { font-family: "Inter"; src: url("{B}assets/fonts/inter-400.woff2") format("woff2"); font-weight: 400; font-display: swap; }
      @font-face { font-family: "Inter"; src: url("{B}assets/fonts/inter-500.woff2") format("woff2"); font-weight: 500; font-display: swap; }
      @font-face { font-family: "Inter"; src: url("{B}assets/fonts/inter-600.woff2") format("woff2"); font-weight: 600; font-display: swap; }
      :root { --navy:#101f38; --navy-2:#16294a; --ink:#1c2430; --cream:#faf6ee; --paper:#fff; --gold:#c9a227; --gold-soft:#e4c76a; --green:#2f7d54; --muted:#6a7078; --line:#e7e1d4; --line-dark:#2a3a58; }
      * { box-sizing:border-box; } html { scroll-behavior:smooth; }
      body { margin:0; background:var(--cream); color:var(--ink); font-family:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif; font-size:18px; line-height:1.65; -webkit-font-smoothing:antialiased; }
      h1,h2,h3 { font-family:"Playfair Display",Georgia,serif; font-weight:700; line-height:1.12; letter-spacing:-0.01em; }
      a { color:inherit; }
      .wrap { max-width:1060px; margin:0 auto; padding:0 clamp(22px,5vw,56px); }
      .nw-top { position:sticky; top:0; z-index:10; background:rgba(16,31,56,.9); backdrop-filter:blur(10px); border-bottom:1px solid var(--line-dark); }
      .nw-top .wrap { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:60px; flex-wrap:wrap; }
      .nw-brand { display:inline-flex; align-items:center; gap:10px; color:#fff; text-decoration:none; font-weight:600; font-size:.95rem; }
      .nw-brand img { width:26px; height:26px; }
      .nw-nav { display:flex; flex-wrap:wrap; gap:2px 4px; }
      .nw-nav a { color:#cdd4df; text-decoration:none; font-size:.85rem; font-weight:500; padding:5px 10px; border-radius:999px; }
      .nw-nav a:hover, .nw-nav a[aria-current] { color:var(--navy); background:var(--gold-soft); }
      .hero { position:relative; color:#f4efe4; background: radial-gradient(1100px 520px at 82% -10%, rgba(201,162,39,.22), transparent 60%), radial-gradient(760px 460px at 6% 12%, rgba(47,125,84,.16), transparent 55%), linear-gradient(160deg,var(--navy),var(--navy-2)); overflow:hidden; }
      .hero .wrap { position:relative; padding-top:clamp(46px,8vw,84px); padding-bottom:clamp(46px,8vw,80px); display:grid; grid-template-columns:1.3fr .7fr; gap:clamp(28px,5vw,56px); align-items:center; }
      .eyebrow { text-transform:uppercase; letter-spacing:.2em; font-size:.72rem; font-weight:600; color:var(--gold-soft); margin:0 0 18px; }
      .hero h1 { font-size:clamp(2.5rem,6vw,4.2rem); margin:0; color:#fff; }
      .hero .sub { font-size:clamp(1.05rem,2.2vw,1.35rem); color:#e7e2d6; margin:18px 0 0; max-width:46ch; }
      .rule { width:74px; height:3px; background:var(--gold); border:0; margin:24px 0 0; }
      .cta-row { display:flex; flex-wrap:wrap; gap:12px; margin-top:28px; }
      .btn { display:inline-block; text-decoration:none; font-weight:600; font-size:.95rem; padding:13px 24px; border-radius:999px; transition:transform .15s,background .2s,color .2s; }
      .btn-primary { background:var(--gold); color:var(--navy); }
      .btn-primary:hover { background:var(--gold-soft); transform:translateY(-1px); }
      .btn-ghost { background:transparent; color:#f4efe4; border:1px solid rgba(255,255,255,.32); }
      .btn-ghost:hover { border-color:var(--gold-soft); color:#fff; }
      .hero-portrait { justify-self:center; }
      .hero-portrait img { width:min(300px,68vw); aspect-ratio:4/5; object-fit:cover; border-radius:18px; border:1px solid rgba(228,199,106,.4); box-shadow:0 24px 60px rgba(0,0,0,.4); }
      section { padding:clamp(48px,7vw,84px) 0; }
      .section-num { color:var(--gold); font-weight:600; letter-spacing:.16em; font-size:.72rem; text-transform:uppercase; }
      h2 { font-size:clamp(1.8rem,3.6vw,2.5rem); margin:12px 0 0; color:var(--navy); }
      .lead-p { font-size:1.1rem; color:#34404f; }
      p.body { color:#33404e; max-width:70ch; }
      .band { background:var(--paper); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
      .band-dark { background:linear-gradient(160deg,var(--navy),var(--navy-2)); color:#eae6da; }
      .band-dark h2 { color:#fff; } .band-dark .section-num { color:var(--gold-soft); }
      .facts { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-top:30px; }
      .fact { background:var(--paper); border:1px solid var(--line); border-radius:14px; padding:20px 22px; }
      .fact .k { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--muted); }
      .fact .v { font-family:"Playfair Display",serif; font-size:1.1rem; color:var(--navy); margin-top:6px; }
      .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:36px; }
      .cards.two { grid-template-columns:repeat(2,1fr); }
      .card { display:flex; flex-direction:column; background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:26px 24px; position:relative; overflow:hidden; text-decoration:none; color:inherit; transition:transform .15s,border-color .2s; }
      a.card:hover { transform:translateY(-2px); border-color:var(--gold); }
      .card::before { content:""; position:absolute; left:0; top:0; width:100%; height:4px; background:linear-gradient(90deg,var(--gold),var(--gold-soft)); }
      .card .k { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; font-weight:600; color:var(--muted); }
      .card h3 { font-size:1.28rem; color:var(--navy); margin:6px 0 10px; }
      .card p { margin:0 0 12px; color:#3f4a57; font-size:.96rem; flex:1; }
      .card .go { color:#a6851a; font-weight:600; font-size:.9rem; }
      .formula { background:rgba(255,255,255,.05); border:1px solid var(--line-dark); border-left:4px solid var(--gold); border-radius:12px; padding:24px 28px; margin-top:30px; }
      .formula p { margin:0; } .formula ul { margin:8px 0 0; padding-left:1.2rem; display:grid; gap:6px; }
      .book { display:grid; grid-template-columns:auto 1fr; gap:clamp(20px,4vw,40px); align-items:center; margin-top:30px; }
      .book img { width:140px; border-radius:8px; box-shadow:0 16px 40px rgba(16,31,56,.22); }
      .chips { display:flex; flex-wrap:wrap; gap:10px; margin-top:22px; }
      .chip { display:inline-block; padding:9px 16px; border:1px solid var(--line); border-radius:999px; background:var(--paper); text-decoration:none; color:var(--navy); font-size:.9rem; font-weight:500; }
      .chip:hover { border-color:var(--gold); }
      .faq details { border:1px solid var(--line); border-radius:12px; padding:.3rem 1rem; background:var(--paper); margin-bottom:.6rem; }
      .faq summary { cursor:pointer; font-weight:600; padding:.7rem 0; list-style:none; }
      .faq summary::-webkit-details-marker { display:none; }
      .faq summary::before { content:"＋"; margin-right:.6rem; color:var(--gold); font-weight:700; }
      .faq details[open] summary::before { content:"－"; }
      .faq details > div { padding:0 0 .8rem; color:#3a4551; }
      .close { text-align:center; } .close h2 { max-width:24ch; margin-inline:auto; } .close .cta-row { justify-content:center; }
      .quote-grid { display:grid; gap:16px; margin-top:26px; }
      .quote { background:var(--paper); border:1px solid var(--line); border-left:4px solid var(--gold); border-radius:12px; padding:20px 24px; }
      .quote p { margin:0; font-family:"Playfair Display",serif; font-size:1.16rem; line-height:1.4; color:var(--navy); }
      .quote .src { display:block; margin-top:12px; font-family:"Inter",sans-serif; font-size:.82rem; font-weight:600; letter-spacing:.02em; color:var(--muted); }
      .notice { background:rgba(47,125,84,.08); border:1px solid rgba(47,125,84,.28); border-radius:12px; padding:20px 24px; margin-top:26px; color:#274a37; }
      .notice strong { color:var(--green); }
      .modules { list-style:none; margin:26px 0 0; padding:0; display:grid; grid-template-columns:repeat(2,1fr); gap:10px; counter-reset:mod; }
      .modules li { position:relative; background:var(--paper); border:1px solid var(--line); border-radius:12px; padding:14px 16px 14px 48px; font-size:.96rem; color:#33404e; }
      .modules li::before { counter-increment:mod; content:counter(mod,decimal-leading-zero); position:absolute; left:16px; top:14px; font-family:"Playfair Display",serif; font-weight:700; color:var(--gold); font-size:.95rem; }
      @media (max-width:860px){ .modules{grid-template-columns:1fr;} }
      .subhero { background:linear-gradient(160deg,var(--navy),var(--navy-2)); color:#f4efe4; }
      .subhero .wrap { padding:clamp(40px,7vw,72px) 0; }
      .subhero h1 { font-size:clamp(2.1rem,5vw,3.4rem); color:#fff; margin:10px 0 0; }
      .subhero .sub { color:#d9dae0; max-width:60ch; margin:16px 0 0; }
      .breadcrumb { font-size:.85rem; color:#aeb6c4; }
      .breadcrumb a { color:#cdd4df; text-decoration:none; }
      footer.nw { background:var(--navy); color:#b9c1cf; padding:44px 0; }
      footer.nw .wrap { display:grid; gap:18px; }
      footer.nw .fnav { display:flex; flex-wrap:wrap; gap:8px 18px; }
      footer.nw .fnav a { color:#d7dce4; text-decoration:none; font-size:.9rem; }
      footer.nw .fnav a:hover { color:var(--gold-soft); }
      footer.nw .legal { font-size:.85rem; color:#8a94a6; display:flex; flex-wrap:wrap; gap:6px 16px; align-items:center; }
      footer.nw .legal a { color:#b9c1cf; text-decoration:none; }
      @media (max-width:860px){ .hero .wrap{grid-template-columns:1fr;} .hero-portrait{justify-self:start; order:-1;} .cards,.cards.two,.facts,.book{grid-template-columns:1fr;} }
`;

const SUBPAGES = [
  ["", "Profil"],
  ["biografie/", "Biografie"],
  ["urheberschaft/", "Urheberschaft"],
  ["publikationen/", "Publikationen"],
  ["podcast/", "Podcast"],
  ["musik/", "Musik"],
  ["presse/", "Presse"],
  ["faq/", "FAQ"],
];

function topbar(base, current) {
  const nav = SUBPAGES.map(([h, l]) => {
    const target = h === "" ? `${base}` : `${base}${h}`;
    const cur = h === current ? ' aria-current="page"' : "";
    return `        <a href="${target}"${cur}>${esc(l)}</a>`;
  }).join("\n");
  return `    <div class="nw-top">
      <div class="wrap">
        <a class="nw-brand" href="${base}../../index.html"><img src="${base}../../assets/img/brand/signet.svg" alt="">Wirkungsökonomie</a>
        <nav class="nw-nav" aria-label="Natalie Weber">
${nav}
        </nav>
      </div>
    </div>`;
}
function footer(base) {
  const nav = SUBPAGES.filter(([h]) => h !== "").map(([h, l]) => `        <a href="${base}${h}">${esc(l)}</a>`).join("\n");
  return `    <footer class="nw">
      <div class="wrap">
        <nav class="fnav" aria-label="Natalie Weber Unterseiten">
        <a href="${base}">Profil</a>
${nav}
        </nav>
        <p class="legal">
          <span>© 2026 Natalie Weber</span><span>·</span>
          <a href="${base}../../wirkungswissenschaften/">Wirkungswissenschaften</a><span>·</span>
          <a href="${base}../../impressum.html">Impressum</a><span>·</span>
          <a href="${base}../../datenschutz.html">Datenschutz</a>
        </p>
      </div>
    </footer>`;
}
function shell({ rel, base, title, metaTitle, description, current, jsonld, body }) {
  const route = `/${rel.replace(/index\.html$/, "")}`;
  const canonical = `${SITE}${route}`;
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="profile">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/people/natalie-weber.jpeg">
    <link rel="icon" href="${base}../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <style>${CSS.replaceAll("{B}", `${base}../../`)}</style>
${jsonld ? `    <script type="application/ld+json">${jsonld}</script>` : ""}
  </head>
  <body>
${topbar(base, current)}
${body}
${footer(base)}
  </body>
</html>
`;
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return rel;
}

// Unterseiten-Hero
function subhero(base, kicker, h1, sub) {
  return `    <header class="hero subhero">
      <div class="wrap">
        <nav class="breadcrumb"><a href="${base}">Natalie Weber</a> / ${esc(kicker)}</nav>
        <p class="eyebrow" style="margin-top:16px">${esc(kicker)}</p>
        <h1>${esc(h1)}</h1>
        <p class="sub">${esc(sub)}</p>
      </div>
    </header>`;
}
function sec({ band, num, h2, intro, inner }) {
  return `    <section class="${band || ""}">
      <div class="wrap">
        ${num ? `<p class="section-num">${esc(num)}</p>` : ""}
        ${h2 ? `<h2>${esc(h2)}</h2>` : ""}
        ${intro ? `<p class="lead-p" style="max-width:72ch; margin-top:18px">${intro}</p>` : ""}
${inner || ""}
      </div>
    </section>`;
}
function cardList(items, cls = "cards") {
  return `        <div class="${cls}">
${items.map((c) => {
    const tag = c.href ? "a" : "article";
    const href = c.href ? ` href="${c.href}"` : "";
    return `          <${tag} class="card"${href}>
            ${c.k ? `<span class="k">${esc(c.k)}</span>` : ""}
            <h3>${esc(c.title)}</h3>
            <p>${c.text}</p>
            ${c.go ? `<span class="go">${esc(c.go)} →</span>` : ""}
          </${tag}>`;
  }).join("\n")}
        </div>`;
}

// ============================ MAIN PROFIL =====================================
function buildMain() {
  const base = "";
  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "Person", "@id": `${SITE}/w/natalie-weber/#person`,
    name: "Natalie Weber", url: `${SITE}/w/natalie-weber/`, image: `${SITE}/assets/img/people/natalie-weber.jpeg`,
    description: "Physikerin, Nachhaltigkeitsstrategin, Autorin, Musikerin und Begründerin der Wirkungsökonomie.",
    jobTitle: "Begründerin der Wirkungsökonomie",
    knowsAbout: ["Wirkungsökonomie", "Wirkungswissenschaften", "Wirkungsforschung", "Nachhaltigkeitsmanagement", "Systemdenken", "Wirkungsmessung", "Wirkungssteuerung", "Demokratie", "positive Netto-Wirkung"],
    sameAs: [LINKS.linkedin, LINKS.spotify, LINKS.appleMusic, LINKS.amazonMusic, LINKS.youtubeMusic, LINKS.amazonAuthor],
  });
  const body = `    <header class="hero">
      <div class="wrap">
        <div class="hero-copy">
          <p class="eyebrow">Physikerin · Autorin · Begründerin</p>
          <h1>Natalie Weber</h1>
          <p class="sub">Physikerin, Nachhaltigkeitsstrategin, Autorin, Musikerin und Begründerin der Wirkungsökonomie. Sie entwickelt mit den Wirkungswissenschaften einen Rahmen, in dem Wirkung als tatsächliche Veränderung von Zuständen sichtbar, bewertbar und entscheidungsrelevant wird — für Mensch, Planet und Demokratie.</p>
          <hr class="rule">
          <div class="cta-row">
            <a class="btn btn-primary" href="#wirkungsraeume">Was sie begründet hat</a>
            <a class="btn btn-ghost" href="${base}../../buch.html">Zum Grundlagenwerk</a>
            <a class="btn btn-ghost" href="${base}../../institut/">Zum Wirkungsinstitut</a>
            <a class="btn btn-ghost" href="${base}../../akademie.html">Zur Akademie</a>
          </div>
        </div>
        <figure class="hero-portrait">
          <img src="${base}../../assets/img/people/natalie-weber.jpeg" alt="Natalie Weber – Physikerin, Nachhaltigkeitsstrategin, Autorin und Musikerin" width="300" height="375" decoding="async">
        </figure>
      </div>
    </header>
${sec({ band: "band", num: "01 · Kurzprofil", h2: "Kurzprofil",
    intro: "Natalie Weber verbindet naturwissenschaftliches Denken, Nachhaltigkeitsmanagement, Systemanalyse und öffentliche Vermittlung. Aus der Frage, warum Gesellschaften so viel messen und trotzdem oft nach den falschen Maßstäben steuern, entwickelte sie die Wirkungsökonomie.",
    inner: `        <div class="facts">
          <div class="fact"><p class="k">Fachlicher Ursprung</p><p class="v">Physik und Systemdenken</p></div>
          <div class="fact"><p class="k">Praxisfeld</p><p class="v">Nachhaltigkeitsmanagement und Unternehmensrealität</p></div>
          <div class="fact"><p class="k">Zentrale Arbeit</p><p class="v">Wirkungsökonomie, Wirkungswissenschaften, Institut, Akademie</p></div>
          <div class="fact"><p class="k">Vermittlung</p><p class="v">Buch, Journal, Podcast, Musik</p></div>
          <div class="fact"><p class="k">Persönlich</p><p class="v">Mutter von drei Söhnen</p></div>
        </div>` })}
${sec({ num: "02 · Ursprung", h2: "Wie die Wirkungsökonomie entstand",
    intro: "Die Wirkungsökonomie entstand aus einem Widerspruch: Unternehmen, Märkte und politische Systeme erzeugen immer mehr Daten, Berichte und Kennzahlen. Trotzdem bleibt oft offen, was sich dadurch wirklich verändert.",
    inner: `        <p class="body">Aus Physik, Systemdenken und Nachhaltigkeit wurde bei Natalie Weber eine ökonomische und demokratische Frage: Wie muss eine Gesellschaft steuern, wenn nicht Kapital, sondern Wirkung der entscheidende Maßstab ist? Ihre Arbeit macht Wirkung zum Maßstab — als reale Zustandsveränderung für Mensch, Planet und Demokratie.</p>
        <p><a class="chip" href="${base}biografie/">Ausführliche Biografie →</a></p>` })}
${sec({ band: "band", num: "03 · Wirkungsräume", h2: "Welche Räume Natalie Weber aufgebaut hat", id: "wirkungsraeume",
    intro: "Natalie Webers Arbeit besteht nicht nur aus einem Begriff oder einem Buch. Sie hat einen zusammenhängenden Wirkungsraum aufgebaut: Modell, Wissenschaftsrahmen, Forschungsraum, Lernraum und öffentliche Vermittlung.",
    inner: `<span id="wirkungsraeume"></span>` + cardList([
      { k: "Ordnungs- und Steuerungsmodell", title: "Wirkungsökonomie", text: "Macht Wirkung zum Maßstab für Wirtschaft, Politik, Kapital, Medien und gesellschaftliche Entwicklung.", href: `${base}../../wirkungsoekonomie.html`, go: "Modell verstehen" },
      { k: "Wissenschaftlicher Rahmen", title: "Wirkungswissenschaften", text: "Rahmen Wirkung als tatsächliche Veränderung von Zuständen und verbinden Forschung, Bewertung und Rückkopplung.", href: `${base}../../wirkungswissenschaften/`, go: "Rahmen verstehen" },
      { k: "Methodische Weiterentwicklung", title: "Systemische Wirkungsforschung", text: "Bestehende Wirkungsforschung wird nicht negiert, sondern erweitert: von nachgelagerter Evaluation zu voraus-, begleit- und rückkoppelnder Forschung.", href: `${base}../../blog/wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie.html`, go: "Einordnung lesen" },
      { k: "Forschungs- und Arbeitsraum", title: "Wirkungsinstitut", text: "Entwickelt Wirkungswissen durch Fragen, Quellenarbeit, Analysen, Review, Dossiers und Rückkopplung.", href: `${base}../../institut/`, go: "Institut öffnen" },
      { k: "Lern- und Bildungsraum", title: "Akademie für Wirkungsökonomie", text: "Übersetzt die Wirkungsökonomie in Wirkungskompetenz — mit Lernpfaden, Kursen, Prüfungen und Praxisprojekt.", href: `${base}../../akademie.html`, go: "Akademie starten" },
    ]) })}
${sec({ num: "04 · Autorin", h2: "Autorin und Begründerin einer Begriffswelt",
    intro: "Natalie Weber schreibt an einer Sprache für Wirkung: präzise genug für Forschung und Steuerung, verständlich genug für Öffentlichkeit und Praxis.",
    inner: `        <div class="book">
          <img src="${base}../../assets/img/book/cover.webp" alt="Buchcover: Die neue Ordnung des Wohlstands">
          <div>
            <p class="body" style="margin-top:0">Ihr Grundlagenwerk <strong>Die neue Ordnung des Wohlstands</strong> entfaltet die Wirkungsökonomie als Modell für eine Gesellschaft, die Wirkung auf Mensch, Planet und Demokratie zum Maßstab macht. Dazu kommen Dossier, Journalbeitrag und das Glossar der Wirkungsökonomie.</p>
            <p class="cta-row"><a class="btn btn-primary" href="${base}../../buch.html" style="color:#101f38">Zum Grundlagenwerk</a> <a class="chip" href="${base}publikationen/">Alle Publikationen</a></p>
          </div>
        </div>` })}
${sec({ band: "band", num: "05 · Vermittlung", h2: "Wie Natalie Weber Wirkung vermittelt",
    intro: "Die Wirkungsökonomie soll nicht nur als Theorie existieren. Sie soll verstanden, geprüft, diskutiert und angewendet werden — deshalb arbeitet Natalie Weber in verschiedenen Formen der Vermittlung.",
    inner: cardList([
      { title: "Podcast", text: "„Der neue Kompass“ erklärt Wirkung, Preise, Kapital, Demokratie und Verantwortung Schritt für Schritt — mit Transkripten.", href: `${base}podcast/`, go: "Podcast" },
      { title: "Musik", text: "Als Musikerin (sustynats) zeigt Natalie Weber eine andere Seite derselben Grundfrage: Was berührt, was verändert, was bleibt?", href: `${base}musik/`, go: "Musik" },
      { title: "LinkedIn & Öffentlichkeit", text: "In sozialen Medien macht sie komplexe Wirkungsfragen zugänglich und diskutierbar.", href: LINKS.linkedin, go: "LinkedIn" },
    ]) })}
${sec({ band: "band-dark", num: "06 · Persönlich", h2: "Der Mensch hinter der Arbeit",
    intro: "Neben ihrer fachlichen Arbeit ist Natalie Weber Musikerin und Mutter von drei Söhnen.",
    inner: `        <p class="body" style="color:#d9dae0">Diese persönliche Perspektive gehört nicht als private Anekdote auf die Seite, sondern als Teil ihres Blicks auf Wirkung: Es geht um Zukunft, Verantwortung, Care, Bildung, Vertrauen und die Frage, welche Bedingungen kommende Generationen vorfinden.</p>` })}
${sec({ num: "07 · Einordnung", h2: "Wissenschaftlich sauber: Was neu ist und was nicht",
    intro: "Wirkung wurde auch vor Natalie Weber untersucht. Neu ist der systemische Rahmen, in dem Wirkung als gemeinsame Leitkategorie von Erkenntnis, Bewertung und Steuerung zusammengeführt wird.",
    inner: `        <p class="body">Natalie Weber beansprucht nicht, dass vor ihr niemand Wirkung untersucht hätte. Ihr Beitrag liegt in der systemischen Verbindung: Wirkung wird als tatsächliche Veränderung von Zuständen verstanden, am Rahmen Mensch, Planet und Demokratie bewertet und in Entscheidungen, Preise, Kapital, Recht, Medien und Governance rückgekoppelt. Die Wirkungswissenschaften sind kein staatlich oder akademisch bereits anerkanntes Fach, sondern ein in Entwicklung befindlicher Rahmen.</p>
        <p><a class="chip" href="${base}urheberschaft/">Urheberschaft und Abgrenzung →</a></p>` })}
${sec({ num: "08 · Öffentliche Kommunikation", h2: "Bewusst im Hintergrund — wirksam über Strukturen",
    intro: "Natalie Weber konzentriert sich bewusst auf Grundlagenarbeit, Autorinnenschaft und die Weiterentwicklung der Wirkungsökonomie. Die Wirkungsökonomie soll nicht über eine einzelne Person skaliert werden, sondern über Institutionen, Materialien, Schulungen und qualifizierte Multiplikator:innen.",
    inner: `        <p class="body">Ihr Schwerpunkt liegt auf Theorieentwicklung, systemischer Einordnung, Texten, Konzepten, Methodik, Akademie und der Befähigung von Multiplikator:innen. Öffentliche Anfragen, Fachgespräche und Schulungsformate werden daher institutionell über das Wirkungsinstitut, die Akademie oder autorisierte Ansprechpartner:innen koordiniert.</p>
        <div class="notice"><strong>Ziel:</strong> ein tragfähiges Wissens-, Schulungs- und Multiplikator:innensystem, das die Methode unabhängig, qualitätsgesichert und skalierbar vermittelt — statt sie an die öffentliche Verfügbarkeit einer einzelnen Person zu binden.</div>` })}
    <section class="close band">
      <div class="wrap">
        <p class="section-num">09 · Presse & Anfragen</p>
        <h2>Presse, Materialien und institutionelle Anfragen</h2>
        <p class="lead-p" style="max-width:60ch; margin:18px auto 0">Kurzprofile, Hintergrundmaterialien, Zitate zur Verwendung und die passenden Ansprechpartner:innen für Medien, Organisationen und Kooperationen.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${base}presse/" style="color:#101f38">Zum Pressebereich</a>
          <a class="btn btn-ghost" href="${base}../../institut/" style="color:#16294a; border-color:#c9a227">Wirkungsinstitut</a>
          <a class="btn btn-ghost" href="${base}../../akademie.html" style="color:#16294a; border-color:#c9a227">Akademie</a>
        </div>
      </div>
    </section>`;
  return shell({ rel: "w/natalie-weber/index.html", base, current: "",
    title: "Natalie Weber", metaTitle: "Natalie Weber – Begründerin der Wirkungsökonomie und Entwicklerin der Wirkungswissenschaften",
    description: "Natalie Weber ist Physikerin, Nachhaltigkeitsstrategin, Autorin, Musikerin und Begründerin der Wirkungsökonomie. Sie entwickelt Wirkungswissenschaften, Wirkungsinstitut und Akademie als Räume für Wirkung auf Mensch, Planet und Demokratie.",
    jsonld, body });
}

// ============================ SUBPAGES ========================================
function sub(rel, current, kicker, h1, subline, description, inner) {
  const base = "../";
  return shell({ rel: `w/natalie-weber/${rel}index.html`, base, current,
    title: `${h1} – Natalie Weber`, metaTitle: `${h1} – Natalie Weber | Wirkungsökonomie`, description,
    body: subhero(base, kicker, h1, subline) + "\n" + inner(base) });
}

function buildSubpages() {
  const out = [];
  out.push(sub("biografie/", "biografie/", "Biografie", "Biografie", "Von der Physik über das Nachhaltigkeitsmanagement zur Wirkungsökonomie.",
    "Biografie von Natalie Weber: Physikerin, Nachhaltigkeitsstrategin und Begründerin der Wirkungsökonomie — beruflicher Ursprung, Systemdenken und die Entstehung des Modells.",
    (base) => sec({ num: "Kurzbiografie", h2: "Kurzbiografie",
      intro: "Natalie Weber ist Physikerin und arbeitete viele Jahre im Nachhaltigkeitsmanagement eines Industriekonzerns. Aus der Verbindung von naturwissenschaftlichem Denken, Unternehmenspraxis und Systemanalyse entwickelte sie die Wirkungsökonomie.",
      inner: `        <p class="body">Als Physikerin war sie früh von der Vorstellung geprägt, dass nichts isoliert geschieht: Jede Handlung verändert Zustände, jede Veränderung wirkt in ein System zurück. Später, in der Unternehmensrealität, wurde daraus eine ökonomische Frage: Warum erzeugen Unternehmen Wirkungsdaten, während Kapital, Gewinn und Kosten weiterhin die Entscheidungen bestimmen?</p>
        <p class="body">Aus dieser Unruhe entstand die Wirkungsökonomie — und aus ihr ein ganzer Wirkungsraum: Wirkungswissenschaften, Wirkungsinstitut, Akademie, Journal und Podcast.</p>
        <p class="chips"><a class="chip" href="${base}urheberschaft/">Urheberschaft</a><a class="chip" href="${base}publikationen/">Publikationen</a><a class="chip" href="${base}../../buch.html">Grundlagenwerk</a></p>` }) ));

  out.push(sub("urheberschaft/", "urheberschaft/", "Urheberschaft", "Urheberschaft und Einordnung", "Was Natalie Weber begründet hat — und wo bestehende Forschung anschließt.",
    "Urheberschaft von Natalie Weber: Wirkungsökonomie, Wirkungswissenschaften und systemische Wirkungsforschung — sauber abgegrenzt zu Evaluation, ESG, SROI, Donut- und Gemeinwohlökonomie.",
    (base) => sec({ num: "Einordnung", h2: "Begründet, ohne zu überclaimen",
      intro: "Natalie Weber ist Begründerin der Wirkungsökonomie und entwickelt mit den Wirkungswissenschaften einen inter- und transdisziplinären Rahmen, in dem Wirkung als tatsächliche Veränderung von Zuständen untersucht, bewertet und in gesellschaftliche Lern- und Steuerungsprozesse rückgekoppelt wird.",
      inner: cardList([
        { k: "Modell", title: "Wirkungsökonomie", text: "Die erste ausgearbeitete Steuerungs- und Ordnungsdisziplin: Wirkung statt Kapital als Maßstab.", href: `${base}../../wirkungswissenschaften/wirkungsoekonomie/`, go: "Mehr" },
        { k: "Rahmen", title: "Wirkungswissenschaften", text: "Der systemische Dachrahmen, der verstreute Ansätze zusammenführt — noch kein staatlich anerkanntes Fach, sondern in Entwicklung.", href: `${base}../../wirkungswissenschaften/`, go: "Mehr" },
        { k: "Weiterentwicklung", title: "Systemische Wirkungsforschung", text: "Bestehende Wirkungsforschung wird nicht negiert, sondern von nachgelagerter Evaluation zu voraus-, begleit- und rückkoppelnder Forschung erweitert.", href: `${base}../../wirkungswissenschaften/wirkungsforschung/`, go: "Mehr" },
      ]) + sec({ num: "Abgrenzung", h2: "Anschluss an bestehende Felder",
        inner: `        <p class="body">Die Wirkungsökonomie schließt an Evaluation, Impact Assessment, Nachhaltigkeitswissenschaft, Transformationsforschung, ESG-Berichterstattung, SROI, Donut- und Gemeinwohlökonomie an — und geht darüber hinaus, indem sie Wirkung bewertet, gewichtet und in Entscheidungen zurückkoppelt. Sie ist kein amtliches System, keine Planwirtschaft und keine Personenbewertung.</p>` }) }) ));

  out.push(sub("publikationen/", "publikationen/", "Publikationen", "Publikationen", "Buch, Dossier, Journal und Glossar — zentral gebündelt.",
    "Publikationen von Natalie Weber: Grundlagenwerk „Die neue Ordnung des Wohlstands“, Dossier und Journalbeitrag zu den Wirkungswissenschaften sowie das Glossar der Wirkungsökonomie.",
    (base) => sec({ num: "Werke", h2: "Schriftliche Grundlagen",
      inner: cardList([
        { k: "Buch", title: "Die neue Ordnung des Wohlstands", text: "Das frei zugängliche Grundlagenwerk begründet die Wirkungsökonomie als eigenständiges Ordnungsmodell.", href: `${base}../../buch.html`, go: "Zur Buchseite" },
        { k: "Dossier", title: "Wirkungswissenschaften", text: "Systematische Einordnung der Disziplinen, Begriffe und Wirkungsarchitektur.", href: `${base}../../dokumente/dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/`, go: "Dossier" },
        { k: "Journal", title: "Wirkungswissenschaften als neuer Bezugsrahmen", text: "Konzeptioneller Journalbeitrag zur wissenschaftlichen Einordnung.", href: `${base}../../blog/wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie.html`, go: "Beitrag lesen" },
        { k: "Glossar", title: "Begriffe der Wirkung", text: "Wirkung, Wirkstoff, Wirkungspotenzial, Wirkungspfad, Netto-Wirkung, Wirkungsarchitektur.", href: `${base}../../begriffe/`, go: "Zum Glossar" },
        { k: "Bücher extern", title: "Autorinnenprofil", text: "Übersicht der Veröffentlichungen im Handel.", href: LINKS.amazonAuthor, go: "Autorinnenseite" },
      ]) + `        <p class="formula" style="background:var(--paper); color:var(--ink)"><strong>Zitierempfehlung:</strong> Weber, Natalie (2026): Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie. Dossier zur systemischen Einordnung, Version 1.0.</p>` }) ));

  out.push(sub("podcast/", "podcast/", "Podcast", "Podcast und Audio", "„Der neue Kompass“ — die Wirkungsökonomie zum Anhören.",
    "Der Podcast von Natalie Weber: „Der neue Kompass“ erklärt die Wirkungsökonomie ruhig und verständlich — mit Transkripten und Anschlussseiten.",
    (base) => sec({ num: "Hören", h2: "Der neue Kompass",
      intro: "Im Podcast übersetzt Natalie Weber komplexe Wirkungsfragen in ruhige, verständliche Folgen — mit Player, Transkript und Anschlussseiten.",
      inner: `        <p class="chips"><a class="chip" href="${base}../../podcast/">Zur Podcast-Übersicht</a><a class="chip" href="${LINKS.spotify}">Auf Spotify hören</a><a class="chip" href="${base}../../feeds/podcast.xml">RSS-Feed</a></p>` }) ));

  out.push(sub("musik/", "musik/", "Musik", "Musik", "Natalies zweiter Resonanzraum: Sprache, Gefühl, Klang.",
    "Musik von Natalie Weber (sustynats): der kreative Resonanzraum neben der fachlichen Arbeit — auf Apple Music, Amazon Music und YouTube Music.",
    (base) => sec({ num: "Hören", h2: "sustynats",
      intro: "Musik zeigt eine andere Seite derselben Grundfrage wie die Wirkungsökonomie: Was berührt, was verändert, was bleibt? Als „sustynats“ verbindet Natalie Weber Sprache, Gefühl und Öffentlichkeit.",
      inner: `        <p class="chips"><a class="chip" href="${LINKS.appleMusic}">Apple Music</a><a class="chip" href="${LINKS.amazonMusic}">Amazon Music</a><a class="chip" href="${LINKS.youtubeMusic}">YouTube Music</a></p>` }) ));

  out.push(sub("presse/", "presse/", "Presse", "Presse & Anfragen", "Presseinformationen zur Wirkungsökonomie, Hintergrundmaterialien und die passenden institutionellen Ansprechpartner:innen.",
    "Pressebereich zur Wirkungsökonomie: Kurzprofile, Hintergrundmaterialien, Zitate zur Verwendung sowie institutionelle Ansprechpartner:innen und Multiplikator:innen. Natalie Weber arbeitet bewusst im Hintergrund; Anfragen werden über Wirkungsinstitut, Akademie und autorisierte Vertreter:innen koordiniert.",
    (base) => sec({ num: "Öffentliche Kommunikation", h2: "Keine personenbezogene Auftrittslogik",
      intro: "Natalie Weber steht nicht für klassische Personeninterviews, öffentliche Vorträge oder Panelauftritte zur Verfügung. Ihre Arbeit konzentriert sich auf Grundlagen, Texte, Modelle, Akademie, Methodik und institutionellen Aufbau.",
      inner: `        <p class="body">Die Wirkungsökonomie soll nicht von der öffentlichen Verfügbarkeit einer einzelnen Person abhängen. Ziel ist der Aufbau eines tragfähigen Wissens-, Schulungs- und Multiplikator:innensystems, das die Methode unabhängig, qualitätsgesichert und skalierbar vermittelt. Öffentliche Anfragen, Fachgespräche und Schulungsformate werden daher institutionell über das Wirkungsinstitut, die Akademie oder autorisierte Ansprechpartner:innen koordiniert.</p>` })

      + sec({ band: "band", num: "Presseprofil", h2: "Kurzprofil zur Verwendung",
        intro: "Natalie Weber ist Physikerin, Nachhaltigkeitsstrategin, Autorin und Begründerin der Wirkungsökonomie. Sie entwickelte das Modell aus der Erfahrung, dass moderne Gesellschaften immer mehr messen, ihre Entscheidungen aber weiterhin oft an Kapital, Wachstum, Gewinn oder Reichweite ausrichten. Mit den Wirkungswissenschaften entwickelt sie einen Rahmen, der Wirkung als tatsächliche Veränderung von Zuständen sichtbar, bewertbar und rückkoppelbar macht — für Mensch, Planet und Demokratie. Sie gründete das Wirkungsinstitut als Forschungsraum und die Akademie als Lernraum.",
        inner: `        <div class="notice"><strong>Kurzbeschreibung Wirkungsökonomie:</strong> Die Wirkungsökonomie macht Wirkung — die tatsächliche Veränderung von Zuständen für Mensch, Planet und Demokratie — zum Maßstab für Wirtschaft, Kapital, Politik, Recht und Medien und koppelt sie in Entscheidungen zurück.</div>` })

      + sec({ num: "Institutionelle Kommunikation", h2: "Anfragen laufen über Strukturen, nicht über eine Person",
        intro: "Anfragen zur Wirkungsökonomie werden über die jeweils passende Struktur beantwortet — je nach Thema fachlich, wissenschaftlich, institutionell oder didaktisch.",
        inner: cardList([
          { k: "Forschung & Einordnung", title: "Wirkungsinstitut", text: "Wissenschaftliche und fachliche Einordnung, Quellen, Analysen, Dossiers und Hintergrund zur Wirkungsökonomie.", href: `${base}../../institut/`, go: "Institut" },
          { k: "Bildung & Schulung", title: "Akademie", text: "Lern- und Schulungsformate, Workshops und die Qualifizierung von Multiplikator:innen.", href: `${base}../../akademie.html`, go: "Akademie" },
          { k: "Vermittlung", title: "Autorisierte Ansprechpartner:innen", text: "Perspektivisch benannte, geschulte Vertreter:innen für Fachgespräche, Medien- und Schulungsformate.", },
        ]) })

      + sec({ band: "band", num: "Statements", h2: "Zitate & Statements zur Verwendung",
        intro: "Freigegebene Formulierungen, die Medien und Organisationen der Wirkungsökonomie bzw. Natalie Weber zuordnen dürfen.",
        inner: `        <div class="quote-grid">
          <blockquote class="quote"><p>„Wir messen mehr als je zuvor — und steuern trotzdem zu oft am Ziel vorbei. Die Wirkungsökonomie macht Wirkung, nicht Kapital, zum Maßstab.“</p><span class="src">Natalie Weber, Begründerin der Wirkungsökonomie</span></blockquote>
          <blockquote class="quote"><p>„Wirkung ist die tatsächliche Veränderung von Zuständen — für Mensch, Planet und Demokratie. Alles andere ist Aktivität.“</p><span class="src">Natalie Weber, Begründerin der Wirkungsökonomie</span></blockquote>
          <blockquote class="quote"><p>„Die Wirkungsökonomie soll nicht von der Verfügbarkeit einer einzelnen Person abhängen, sondern von einem tragfähigen System aus Wissen, Schulung und Multiplikation.“</p><span class="src">Natalie Weber, Begründerin der Wirkungsökonomie</span></blockquote>
          <blockquote class="quote"><p>„Wer den Maßstab ändert, ändert die Entscheidungen. Nachhaltigkeit scheitert selten am Wollen, sondern am Maßstab.“</p><span class="src">Natalie Weber, Begründerin der Wirkungsökonomie</span></blockquote>
        </div>` })

      + sec({ num: "Materialien", h2: "Materialien für Medien und Organisationen",
        intro: "Bereitgestellt werden Hintergrundmaterialien, Kurzprofile und weiterführende Quellen. Weitere Visuals oder ein vertieftes Hintergrundpapier stellen wir auf Anfrage zusammen.",
        inner: cardList([
          { k: "Hintergrund", title: "Hintergrundpapier / Dossier", text: "Systematische Einordnung von Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie.", href: `${base}../../dokumente/dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/`, go: "Dossier öffnen" },
          { k: "Grundlagenwerk", title: "Buch", text: "„Die neue Ordnung des Wohlstands“ — das frei zugängliche Grundlagenwerk.", href: `${base}../../buch.html`, go: "Zur Buchseite" },
          { k: "Begriffe", title: "Glossar der Wirkungsökonomie", text: "Präzise Definitionen für eine belastbare Berichterstattung.", href: `${base}../../begriffe/`, go: "Zum Glossar" },
        ]) + `        <p class="chips" style="margin-top:24px">
          <a class="chip" href="${base}../../assets/img/people/natalie-weber.jpeg">Pressefoto (JPG)</a>
          <a class="chip" href="${base}../../wirkungsoekonomie.html">Kurzbeschreibung Wirkungsökonomie</a>
          <a class="chip" href="${base}faq/">FAQ für Medien</a>
          <a class="chip" href="${base}../../akademie.html">Akademie</a>
          <a class="chip" href="${base}../../mitmachen.html">Kontaktformular für Anfragen</a>
        </p>` })

      + sec({ band: "band-dark", num: "Vertretung", h2: "Multiplikator:innen statt Personenkult",
        intro: "Für Interviews, Fachgespräche, Workshops, Vorträge, Schulungen oder Medienformate können perspektivisch geschulte Vertreter:innen benannt werden. Die Wirkungsökonomie soll über qualifizierte Personen und Institutionen vermittelt werden.",
        inner: `        <p class="body" style="color:#d9dae0">Dazu können Coaches, Trainer:innen, Wissenschaftler:innen, Berater:innen, Lehrende und Organisationen geschult und zertifiziert werden — als tragfähiges Netzwerk, das die Methode unabhängig, qualitätsgesichert und skalierbar erklärt, anwendet und weitervermittelt, ohne dass jede Anfrage an Natalie Weber persönlich gebunden ist.</p>` })

      + sec({ num: "Akademie", h2: "Akademie für Multiplikator:innen",
        intro: "Im Aufbau: ein eigener Akademie-Bereich „Multiplikator:innen für Wirkungsökonomie“ für Coaches, Trainer:innen, Wissenschaftler:innen, Fachautor:innen, Berater:innen und institutionelle Multiplikator:innen aus Unternehmen, Bildung, Politik, Verwaltung, Medien und Zivilgesellschaft.",
        inner: `        <p class="chips"><a class="chip">Coaches</a><a class="chip">Trainer:innen</a><a class="chip">Wissenschaftler:innen</a><a class="chip">Berater:innen</a><a class="chip">Lehrende</a><a class="chip">Nachhaltigkeits- & ESG-Verantwortliche</a><a class="chip">Politische Bildner:innen</a><a class="chip">Journalist:innen</a><a class="chip">Organisationsentwickler:innen</a></p>
        <ol class="modules">
          <li>Grundlagen der Wirkungsökonomie</li>
          <li>Wirkung, Wirkstoff, Wirkungspotenzial und Wirkungspfad</li>
          <li>Wirkungsmanagement</li>
          <li>Wirkungscontrolling</li>
          <li>Netto-Wirkung, T-SROI, NWI und Impact-of-Investment</li>
          <li>Wirkungsökonomie in Unternehmen</li>
          <li>Wirkungsökonomie in Politik und Verwaltung</li>
          <li>Wirkungskommunikation ohne Greenwashing</li>
          <li>Umgang mit Medien, Narrativen und gesellschaftlicher Wirkung</li>
          <li>Abschlussprüfung / Zertifizierung</li>
        </ol>
        <div class="notice" style="margin-top:26px"><strong>Ziel:</strong> ein qualitätsgesichertes Netzwerk aus Menschen, die die Wirkungsökonomie erklären, anwenden und weitervermitteln können. <a href="${base}../../akademie.html" style="color:var(--green); font-weight:600">Zur Akademie →</a></div>` })

      + sec({ band: "band", num: "Hinweise", h2: "Korrekte Schreibweise, Claims und Kontakt",
        inner: `        <p class="body"><strong>Korrekte Bezeichnung:</strong> „Natalie Weber, Begründerin der Wirkungsökonomie“. <strong>Nicht:</strong> „hat die Wirkungsforschung erfunden“. Die Wirkungswissenschaften sind ein in Entwicklung befindlicher Rahmen, kein bereits staatlich oder akademisch anerkanntes Fach.</p>
        <p class="cta-row" style="margin-top:22px"><a class="btn btn-primary" href="${base}../../mitmachen.html" style="color:#101f38">Anfrage stellen</a> <a class="chip" href="${LINKS.linkedin}">LinkedIn</a></p>` }) ));

  const faqs = [
    ["Gibt Natalie Weber Interviews, Vorträge oder Panelauftritte?", "Natalie Weber konzentriert sich bewusst auf Grundlagenarbeit, Autorinnenschaft und die Weiterentwicklung der Wirkungsökonomie. Sie steht daher nicht für klassische Personeninterviews, öffentliche Vorträge oder Panelauftritte zur Verfügung. Öffentliche Anfragen, Fachgespräche und Schulungsformate werden institutionell über das Wirkungsinstitut, die Akademie oder autorisierte Multiplikator:innen koordiniert."],
    ["Wie werden Presse- und Medienanfragen beantwortet?", "Über die jeweils passende Struktur: das Wirkungsinstitut für wissenschaftliche und fachliche Einordnung, die Akademie für Schulungs- und Bildungsformate sowie autorisierte Ansprechpartner:innen und geschulte Multiplikator:innen. Materialien, Kurzprofile und Zitate zur Verwendung stehen im Pressebereich bereit."],
    ["Kann man die Wirkungsökonomie als Coach oder Trainer:in vermitteln?", "Perspektivisch ja. Die Akademie baut einen Bereich „Multiplikator:innen für Wirkungsökonomie“ auf, in dem Coaches, Trainer:innen, Wissenschaftler:innen, Berater:innen und Lehrende geschult und zertifiziert werden, um die Methode qualitätsgesichert weiterzugeben."],
    ["Hat Natalie Weber die Wirkungsforschung erfunden?", "Nein. Wirkung wurde in Evaluation, Impact Assessment und Nachhaltigkeitsforschung schon lange untersucht. Neu ist die systemische Zusammenführung in einen Rahmen, in dem Wirkung bewertet und rückgekoppelt wird."],
    ["Was ist das Neue an der Wirkungsökonomie?", "Sie macht Wirkung — die tatsächliche Veränderung von Zuständen für Mensch, Planet und Demokratie — zum Maßstab für Wirtschaft, Kapital, Recht, Medien und Politik und koppelt sie in Entscheidungen zurück."],
    ["Was sind Wirkungswissenschaften?", "Der von Natalie Weber begründete inter- und transdisziplinäre Rahmen, der Wirkung untersucht, bewertet und rückkoppelt. Kein bereits staatlich oder akademisch anerkanntes Fach, sondern ein in Entwicklung befindlicher Rahmen."],
    ["Ist die Akademie ein staatlich anerkannter Abschluss?", "Nein. Die Akademie vermittelt Wirkungskompetenz mit eigenen Zertifikaten; sie ersetzt keine staatlich anerkannte akademische Qualifikation."],
    ["Was ist das Wirkungsinstitut?", "Der Denk-, Forschungs- und Arbeitsraum, in dem aus Fragen, Quellen, Analysen und Kritik prüfbares Wirkungswissen entsteht."],
    ["Welche Rolle spielt Musik?", "Musik ist Natalie Webers kreativer Resonanzraum als „sustynats“ — eigenständig neben der fachlichen Arbeit, verbunden über Sprache, Gefühl und Öffentlichkeit."],
    ["Warum erwähnt die Seite, dass Natalie Mutter ist?", "Sehr sparsam und ohne private Details — weil ihr Blick auf Zukunft, Care, Bildung und Verantwortung Teil ihrer Arbeit an Wirkung ist."],
  ];
  out.push(sub("faq/", "faq/", "FAQ", "Häufige Fragen", "Zu Natalie Weber und der Wirkungsökonomie.",
    "FAQ zu Natalie Weber und der Wirkungsökonomie: Urheberschaft, Wirkungswissenschaften, Institut, Akademie, Musik und persönliche Perspektive.",
    () => `    <section class="section"><div class="wrap"><div class="faq">
${faqs.map(([q, a]) => `      <details><summary>${esc(q)}</summary><div>${esc(a)}</div></details>`).join("\n")}
    </div></div></section>`));
  return out;
}

const main = buildMain();
const subs = buildSubpages();
console.log(`[natalie] ${1 + subs.length} Seiten erzeugt: ${[main, ...subs].map((r) => r.replace(/index\.html$/, "")).join(", ")}`);
