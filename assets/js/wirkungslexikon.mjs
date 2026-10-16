/* ==========================================================================
   Wirkungslexikon politischer Sprache – Darstellung und Suche (15.10.2026)
   Vanilla JS, keine Laufzeitabhängigkeiten; progressive Browser-Erweiterung.
   Daten: geprüfter, zum jeweiligen Ausgabemodus gehörender JSON-Bestand.
   Gemeinsame Logik für statische Darstellung, Ableitungen, Filter und Zustände.
   ========================================================================== */
export function createLexicon(DATA, config = {}) {

  const UI = config.ui || {};
  const narrativeIds=e=>MODE==='preview' ? (e.narrativeinordnung_v7?.narrativ_ids||[]) : (config.confirmedNarrativeLinks?.[e.id]||[]);
  const TEXTE = config.texts || {};
  const META = config.meta || {};
  const matchMedia = (q) => typeof window !== 'undefined' ? window.matchMedia(q) : { matches: false };
  const ENTRIES = DATA.entries;
  const BASE_URL = 'https://wirkungsoekonomie.de/wirkungslexikon/';

  /* ------------------------------------------------------------------------
     1. HILFSFUNKTIONEN
     ------------------------------------------------------------------------ */
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  /** Suchnormalisierung: Groß/klein, Umlaute (ä=ae=a), ß, Akzente, Anführungszeichen */
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
    .replace(/[„“”‚‘’"'«»]/g, '');
  /** URL-Slug nach deutscher Konvention (ä → ae) */
  const slugify = (s) => String(s || '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const sortKey = (s) => norm(String(s).replace(/^[\s„“"‚‘'»«(]+/, ''));
  const fmtDate = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? `${+m[3]}.${+m[2]}.${m[1]}` : (iso || '');
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const $ = (sel, root = document) => root.querySelector(sel);
  /** Rein vertikal zu einem Element scrollen (respektiert scroll-margin-top, nie waagerecht) */
  const scrollToEl = (el, smooth) => {
    if (!el) return;
    const m = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - m, left: 0, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
  };
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    arrow: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16h22M19 9l7 7-7 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    cite: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h4v4H8c0 3 1 4 3 5M15 7h4v4h-3c0 3 1 4 3 5"/></svg>',
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
    ext: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/></svg>',
    filter: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18M6 12h12M10 19h4"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
  };

  /* ------------------------------------------------------------------------
     2. KONFIGURATION (Design-Ebene: Kurzlabels, Bereiche, Status, Leiter)
     ------------------------------------------------------------------------ */
  const KORPUS = {
    'AfD – offizielle Programmatik': { key: 'afd-programm', short: 'AfD · Programmatik', area: 'afd' },
    'AfD – Bundestagsanträge': { key: 'afd-antraege', short: 'AfD · Bundestagsantrag', area: 'afd' },
    'Sellner / Institut für Remigration – Website': { key: 'ifr-website', short: 'Sellner/IFR · Website', area: 'ifr' },
    'Sellner / IFR – Policy Paper Sachsen-Anhalt 2026': { key: 'ifr-papier', short: 'Sellner/IFR · Papier Sachsen-Anhalt', area: 'ifr', sekundaer: true },
    'CDU/CSU – dokumentierte öffentliche Aussagen': { key: 'cdu-csu', short: 'CDU/CSU · öffentliche Aussage', area: 'cdu-csu' },
    'Begriffe & Symbole – Bedeutungswandel': { key: 'begriffe-symbole', short: 'Begriff & Symbol', area: 'umdeutungen' },
    'Zivilgesellschaft – Gegenrahmungen': { key: 'zivilgesellschaft', short: 'Zivilgesellschaft · Gegenrahmung', area: 'zivilgesellschaft' },
    'Offene Recherche – noch keiner Organisation als Zitat zugeordnet': { key: 'offene-recherche', short: 'Offene Recherche · kein Zitat', area: 'offene-recherche', internal: true }
  };
  const korpusOf = (e) => config.publicationCorpora?.[e.id] || KORPUS[e.korpus] || { key: slugify(e.korpus), short: e.korpus, area: 'sonstige' };

  /* Bereichsseiten. Texte in "note"/"guard" stammen – wo angegeben – wörtlich aus dem V3-Paket,
     sonst sind sie als Mikrotext-Vorschlag markiert (siehe DESIGN_SYSTEM.md, Abschnitt Mikrotexte). */
  const AREAS = [
    { key: 'afd', title: 'AfD', sub: 'Programmatik und Bundestagsanträge', text: 'schwerpunkt_afd',
      note: 'Begriffe aus Wahlprogrammen, Positionspapieren und nachprüfbaren Originalaussagen.',
      guard: 'Ein gleichlautender Begriff belegt keine institutionelle Gleichsetzung.' },
    { key: 'ifr', title: 'Sellner / Institut für Remigration', sub: 'Website und Papier Sachsen-Anhalt', text: 'schwerpunkt_ifr',
      note: 'Eigene Begriffe, Pläne und medienstrategische Selbstaussagen. Ein IFR-Papier wird nicht automatisch der AfD zugerechnet.',
      guard: 'Das Institut ist nicht mit der AfD gleichzusetzen.' },
    { key: 'cdu-csu', title: 'CDU/CSU', sub: 'Dokumentierte öffentliche Aussagen',
      note: 'Originalzitate mit Nachtragspräzisierungen und Gegenpositionen.',
      guard: 'Präzisierungen und Gegenpositionen stehen auf jeder Karte.' },
    { key: 'umdeutungen', title: 'Umdeutungen & Symbole', sub: 'Begriffe & Symbole – Bedeutungswandel',
      note: '„Woke“, „Gendern“, Regenbogenflagge: Ausgangsbedeutung und politische Verwendung getrennt.',
      guard: 'Keine automatische Wertung des neutralen Begriffs.' },
    { key: 'zivilgesellschaft', title: 'Zivilgesellschaft', sub: 'Gegenrahmungen',
      note: 'Gegenrede und Protest – nach demselben Maßstab untersucht.',
      guard: 'Auch Gegenrahmungen erhalten keine Bewertung, nur Belege.' },
    { key: 'offene-recherche', title: 'Offene Recherche', sub: 'Interner Rechercheauftrag', internal: true,
      note: 'Recherchestichworte ohne Originalfundstelle.',
      guard: 'Kandidaten ohne Originalfundstelle niemals als Parteizitat veröffentlichen.' }
  ];
  const areaByKey = Object.fromEntries(AREAS.map((a) => [a.key, a]));

  const STATUS = {
    quellengeprueft_redaktioneller_review_noetig: 'Quellengeprüft – redaktioneller Review offen',
    quellenbelegt_redaktionell_pruefen: 'Quellenbelegt – Wortlaut- und Kontextprüfung offen',
    sekundaerbelegt_originalpapier_pruefen: 'Sekundär belegt – Originalpapier fehlt',
    recherchekandidat_originalstelle_fehlt: 'Recherchekandidat – Originalstelle fehlt',
    freigegeben: UI.status_published || 'Redaktionell freigegeben'
  };

  /* Evidenzleiter A–F (Wortlaut der Stufennamen aus LEXIKON_METHODIK_v3.md) */
  const LADDER = [
    { l: 'A', name: 'Textnachweis', belegt: 'Belegt allein die Verwendung.' },
    { l: 'B', name: 'Kommunikations­output', belegt: 'Belegt Sichtbarkeit/Reaktion, keine Einstellungsänderung.' },
    { l: 'C', name: 'Beobachtete Reaktion', belegt: 'Belegt eine konkrete Reaktion, nicht automatisch eine psychische Veränderung.' },
    { l: 'D', name: 'Institutionelle Veränderung', belegt: 'Belegt die Maßnahme, Ursachen sind sorgfältig zu prüfen.' },
    { l: 'E', name: 'Einstellung / Verhalten', belegt: 'Befragungszeitreihe, qualitative Interviews, repräsentative Daten.' },
    { l: 'F', name: 'Kausal- oder Beitrags­nachweis', belegt: 'Experiment, kontrollierter Vergleich, Identifikationsansatz.' }
  ];
  /* DARSTELLUNGS-VORSCHLAG (redaktionell zu bestätigen): Befundtyp → Leiterstufe.
     Das Feld beobachtete_wirkung.typ bleibt unverändert sichtbar; die Stufe ist nur Einordnung. */
  const TYP_STUFE = {
    'parlamentarische Debatte': 'B', 'dokumentierter Parlamentsvorgang': 'B',
    'dokumentierte öffentliche Reaktion': 'C', 'öffentliche Gegenrahmung': 'C', 'dokumentierte Rücknahme': 'C',
    'journalistischer Faktencheck': 'C', 'dokumentierte Gegenrede': 'C', 'dokumentierte Präzisierung': 'C',
    'beobachtete Mobilisierung': 'C', 'parlamentarische Entscheidung': 'C', 'parlamentarische Ablehnung': 'C',
    'Antragsablehnung': 'C', 'parlamentarischer Prozess': 'C',
    'institutionelle Entscheidung': 'D', 'nachweisbare Regeländerung': 'D', 'staatliche Umsetzung einer Regel': 'D',
    'normative Regelung': 'D', 'dokumentierte Entscheidung': 'D'
    /* 'genereller experimenteller Mechanismus' → keine Stufe: allgemeiner Forschungsbefund, keine Wirkung DIESES Begriffs */
  };

  /* Kuratierte Einstiege (Testkarten aus CODEX_UMSETZUNGSAUFTRAG_V3) */
  const SHOWCASE = ['neue-woke-ausgangssinn-umdeutung', 'neue-gendern-bedeutung-umdeutung',
    'neue-regenbogenflagge-geschichte-umdeutung', 'neue-merz-problem-im-stadtbild',
    'neue-remigration-zurueckkehr-vs-selfdeportation', 'ifr-self-deportation'];
  const QUICKTERMS = ['woke', 'Gendern', 'Remigration', 'Stadtbild', 'Regenbogenflagge'];

  /* ------------------------------------------------------------------------
     3. ABLEITUNGEN AUS DEN DATEN (deterministisch, ohne Inhaltsänderung)
     ------------------------------------------------------------------------ */
  const CATS = DATA.kategorien.map((c) => ({ ...c, slug: slugify(c.name) }));
  const catByName = Object.fromEntries(CATS.map((c) => [c.name, c]));
  const catBySlug = Object.fromEntries(CATS.map((c) => [c.slug, c]));
  const bySlug = Object.fromEntries(ENTRIES.map((e) => [e.slug, e]));

  /* Standardformulierungen: identischer Text in ≥ 10 Karten → zurückhaltend darstellen */
  const BOILER_MIN = 10;
  const freq = new Map();
  const countText = (t) => { if (t && typeof t === 'string') freq.set(t, (freq.get(t) || 0) + 1); };
  ENTRIES.forEach((e) => {
    [e.wirkstoff_analogie, e.langfristiges_potenzial, e.wirkungspotenzial.gegenwirkung, e.wirkungspotenzial.bedingungen,
      e.wirkungspotenzial.adressaten, e.beobachtete_kommunikationsleistung, e.wirkungsnachweis_status, e.attribution,
      e.empfohlene_wirkungspruefung, e.nachweis_absicht, e.redaktioneller_vorbehalt, e.nutzen_fuer_journalismus,
      e.ziel_absicht_beleglage, e.kategorisierung_status, e.analystische_sicherheit, e.psychologischer_effekt.evidenzstatus,
      e.originalnachweis.kontext, e.originalnachweis.wortlaut_pruefung, e.redaktionelle_alternativen[0],
      e.bedeutungsverschiebung.nachweis_der_verschiebung].forEach(countText);
  });
  const isBoiler = (t) => config.boilerTexts ? config.boilerTexts.includes(t) : (freq.get(t) || 0) >= BOILER_MIN;

  const mechName = (e) => e.psychologischer_effekt.name;
  const MECHS = (() => {
    const m = new Map();
    ENTRIES.forEach((e) => { const n = mechName(e); m.set(n, (m.get(n) || 0) + 1); });
    return [...m.entries()].map(([name, count]) => ({ name, count, slug: slugify(name) }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'de'));
  })();
  const mechBySlug = Object.fromEntries(MECHS.map((m) => [m.slug, m]));

  /** Zusammenfassung ist redundant, wenn sie nur „vorher“ + „nachher“ wiederholt (49 neue Karten) */
  const shiftSummaryRedundant = (bv) => !!(bv.wirkung_vorher && bv.wirkung_nachher && bv.veraenderung_des_wirkungspotenzials &&
    bv.veraenderung_des_wirkungspotenzials.includes(bv.wirkung_vorher) && bv.veraenderung_des_wirkungspotenzials.includes(bv.wirkung_nachher));
  const hasShift = (e) => { const b = e.bedeutungsverschiebung; return !!(b.urspruengliche_bedeutung && b.politisch_verwendete_bedeutung && b.wirkung_vorher && b.wirkung_nachher && b.nachweis_der_verschiebung && e.quellen.length && shiftEvidence(b.status) === 'beleg'); };
  const shiftClaimed = (e) => e.bedeutungsverschiebung.status !== 'noch nicht als Bedeutungswandel nachgewiesen';

  /** Leiterstand je Karte: Stufen-Buchstabe → 'belegt' | 'sekundaer' | 'offen' (+ Fundtext) */
  function ladderOf(e) {
    const st = {}; LADDER.forEach((r) => { st[r.l] = { state: 'offen' }; });
    if (e.quellen.length && e.pruefstatus !== 'recherchekandidat_originalstelle_fehlt') {
      st.A = e.pruefstatus === 'sekundaerbelegt_originalpapier_pruefen'
        ? { state: 'sekundaer', found: 'sekundär belegt' } : { state: 'belegt', found: 'Quelle belegt' };
    }
    const bw = e.beobachtete_wirkung;
    let research = null;
    if (bw) {
      const lvl = TYP_STUFE[bw.typ];
      if (lvl && (MODE === 'preview' || e.evidenzstufe_bestaetigt === lvl)) st[lvl] = { state: 'belegt', found: bw.typ, derived: e.evidenzstufe_bestaetigt !== lvl };
      else research = bw;
    }
    const highest = [...LADDER].reverse().find((r) => st[r.l].state !== 'offen');
    return { st, highest: highest ? highest.l : null, research };
  }

  /** Aussageart (Evidenzklasse) der Bedeutungsverschiebung je Status */
  function shiftEvidence(status) {
    if (/^nachgewiesene|^sekundärbelegte|^Originalbegriff/.test(status)) return 'beleg';
    if (/hypothese/i.test(status)) return 'deutung';
    return 'offen';
  }

  /* Suchindex */
  const INDEX = ENTRIES.map((e) => ({
    e,
    begriff: norm(e.begriff),
    strong: norm([e.originalnachweis.text, e.akteur, mechName(e), e.kategorien.join(' ')].join(' | ')),
    weak: norm([e.thema, e.themencluster, e.korpus, e.bedeutung_und_kontext, e.dokumentiertes_ziel,
      e.bedeutungsverschiebung.urspruengliche_bedeutung, e.bedeutungsverschiebung.politisch_verwendete_bedeutung,
      e.redaktionelle_alternativen.join(' '), e.wirkungspotenzial.moegliche_veraenderung, e.wirkungspotenzial.bedingungen, e.wirkungspotenzial.gegenwirkung, e.langfristiges_potenzial, e.beobachtete_wirkung?.beschreibung, ...e.quellen.map(q => q.title)].join(' | '))
  }));
  function searchScore(ix, tokens) {
    let score = 0;
    for (const t of tokens) {
      let s = 0;
      if (ix.begriff.startsWith(t)) s = 14;
      else if (new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(ix.begriff)) s = 11;
      else if (ix.begriff.includes(t)) s = 8;
      else if (ix.strong.includes(t)) s = 4;
      else if (ix.weak.includes(t)) s = 1;
      if (!s) return 0; /* UND-Verknüpfung */
      score += s;
    }
    return score;
  }

  /* Verwandtschaft: gleicher Kernbegriff, gleicher Mechanismus, gemeinsame Kategorien */
  const STOP = new Set(('ideologie schutz deutschland deutsche deutschen deutscher wieder beenden debatte gruppe politischer ' +
    'politische sprache europa europaischer mehrheit familie unsere unser statt gegen keine kein nicht alle mehr fur ' +
    'und oder der die das des dem den von zur zum als auf aus bei mit nach uber unter vor wir ist sind eine einer ' +
    'neue neuen sicherstellen symbol selbst konnen helfen linken burger bedeutung umdeutung ausgangssinn merz soder spahn ' +
    'dobrindt gegenrahmung pejorative geschichte').split(' '));
  const coreTokens = (e) => {
    const base = norm(e.begriff.replace(/\((Merz|Söder|Spahn|Dobrindt|AfD|CDU|CSU)[^)]*\)/gi, ''));
    return [...new Set((base.match(/[a-z0-9]+/g) || []).filter((t) => t.length >= 4 && !STOP.has(t)))];
  };
  const CORE = new Map(ENTRIES.map((e) => [e.slug, coreTokens(e)]));
  const tokMatch = (a, b) => a.some((x) => b.some((y) => (x.length >= 5 && y.startsWith(x)) || (y.length >= 5 && x.startsWith(y)) || x === y));

  function relatedOf(e) {
    const visible = ENTRIES.filter((o) => o !== e && isVisible(o));
    const area = korpusOf(e).area;
    const used = new Set();
    const byKey = (a, b) => sortKey(a.begriff).localeCompare(sortKey(b.begriff), 'de');
    const sameTerm = visible.filter((o) => tokMatch(CORE.get(e.slug), CORE.get(o.slug)))
      .sort((a, b) => (korpusOf(a).area !== area) - (korpusOf(b).area !== area) || byKey(a, b)).slice(0, 6);
    sameTerm.forEach((o) => used.add(o.slug));
    const shared = (o) => o.kategorien.filter((c) => e.kategorien.includes(c)).length;
    const sameMech = visible.filter((o) => !used.has(o.slug) && mechName(o) === mechName(e))
      .sort((a, b) => shared(b) - shared(a) || (korpusOf(a).area === area) - (korpusOf(b).area === area) || byKey(a, b)).slice(0, 4);
    sameMech.forEach((o) => used.add(o.slug));
    const sameCat = visible.filter((o) => !used.has(o.slug) && shared(o) > 0)
      .sort((a, b) => shared(b) - shared(a) || (b.themencluster === e.themencluster) - (a.themencluster === e.themencluster) || byKey(a, b)).slice(0, 4);
    return { sameTerm, sameMech, sameCat, shared };
  }

  /* ------------------------------------------------------------------------
     4. ZUSTAND: Ansichtsmodus (nur Prototyp) & Sichtbarkeit (Publikations-Gate)
     ------------------------------------------------------------------------ */
  const store = {
    get(k, d) { if (typeof window === 'undefined') return d; try { const v = localStorage.getItem('wl-' + MODE + '-' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { if (typeof window === 'undefined') return; try { localStorage.setItem('wl-' + MODE + '-' + k, JSON.stringify(v)); } catch (_) { /* privat/gesperrt: ignorieren */ } }
  };
  const MODE = config.mode === 'preview' ? 'preview' : 'public';
  const isVisible = (e) => MODE === 'preview' || (e.pruefstatus === 'freigegeben' && !korpusOf(e).internal && e.quellen.length && e.originalnachweis.quelle_id);
  const visibleEntries = () => ENTRIES.filter(isVisible);
  const parseHash = () => ({ params: new URLSearchParams(location.search) });
  const paths = { '/': '', '/kategorien': 'kategorien/', '/methodik': 'methodik/', '/fuer-redaktionen': 'fuer-redaktionen/', '/fuer-buerger': 'fuer-buerger/', '/fuer-wissenschaft': 'fuer-wissenschaft/' };
  const href = (p, params) => {
    let tail = paths[p];
    if (tail == null) tail = p.replace(/^\/karte\//, '').replace(/^\/kategorie\//, 'kategorien/').replace(/^\/bereich\/ifr$/, 'institut-fuer-remigration').replace(/^\/bereich\//, '').replace(/^\//, '') + '/';
    const ps = new URLSearchParams(params || ''); const anchor = ps.get('anker'); ps.delete('anker');
    return (config.mount || '') + '/wirkungslexikon/' + tail + (ps.size ? '?' + ps : '') + (anchor ? '#' + anchor : '');
  };
  const rewriteRoutes = html => html.replace(/(href|action)="#(\/[^"#]*)/g, (_, attr, raw) => {
    const [p, qs] = raw.split('?'); return attr + '="' + href(p, new URLSearchParams(qs || ''));
  }).replaceAll('img/titelbild_worte_wirken_16x9.png', '/assets/img/wirkungslexikon/titelbild-worte-wirken.png');
  const cardHref = e => href('/karte/' + e.slug);
  const prodUrl = e => BASE_URL + e.slug + '/';
  let lastPath = null;
  function route() {
    closeSuggest();
    const host = document.getElementById('wl-explorer');
    if (!host) return;
    const params = new URLSearchParams(location.search);
    host.innerHTML = rewriteRoutes(explorerHtml(params));
    const search = document.getElementById('q-hero');
    if (search) search.value = params.get('q') || '';
    hydrate(host);
  }

  /* ------------------------------------------------------------------------
     6. GEMEINSAME BAUSTEINE
     ------------------------------------------------------------------------ */
  const ev = (kind, label, sentence) => {
    const L = { beleg: 'Beleg', deutung: 'Interpretation', potenzial: 'Potenzial', offen: 'Nicht nachgewiesen', tool: 'Redaktionswerkzeug' };
    return `<span class="wl-ev wl-ev--${kind}${sentence ? ' wl-ev--sentence' : ''}">${esc(label || L[kind])}</span>`;
  };
  const boiler = (t, tag = true) => isBoiler(t)
    ? `<p class="wl-boiler">${esc(t)}${tag ? '<span class="wl-boiler-tag" title="Diese Formulierung steht wortgleich auf vielen Karten.">Standardhinweis</span>' : ''}</p>`
    : `<p>${esc(t)}</p>`;
  const flagCompact = (e) => e.pruefstatus === 'freigegeben' ? '' : `<span class="wl-flag wl-flag--compact" title="${esc(STATUS[e.pruefstatus] || '')}">In Prüfung<span class="wl-visually-hidden"> – ${esc(UI.status_draft || 'nicht freigegeben')}</span></span>`;
  const flagFor = (e) => e.pruefstatus === 'freigegeben'
    ? `<span class="wl-flag wl-flag--published">${esc(STATUS.freigegeben)}</span>`
    : `<span class="wl-flag" title="${esc(STATUS[e.pruefstatus] || e.pruefstatus)}">${esc(UI.status_draft || 'In redaktioneller Prüfung')}</span>`;
  const sourceChip = (e) => {
    const k = korpusOf(e);
    return `<span class="wl-source-chip${k.sekundaer ? ' wl-source-chip--sekundaer' : ''}" title="${esc(e.korpus)}">${esc(k.short)}</span>`;
  };
  const catTag = (name) => {
    const c = catByName[name];
    return c ? `<a class="wl-tag" href="${href('/kategorie/' + c.slug)}" title="${esc(c.definition)}">${esc(name)}</a>` : `<span class="wl-tag">${esc(name)}</span>`;
  };
  /** Kurzer Wirkungsstand für Kacheln */
  function effectLine(e) {
    return `<div class="wl-preview-potential">${ev('potenzial', 'Wirkungspotenzial')}<p>${esc(e.wirkungspotenzial.moegliche_veraenderung)}</p></div>`;
  }
  /** Begriff mit Sprachauszeichnung für englische Lemmata (Screenreader-Aussprache) */
  function termHtml(t) {
    const en = /\b(Self-Deportation|woke|Wokeness|Pride|Diversity|DEI|Remigration Ambassadors|Remigration Watch(dog)?|Remigration Briefing|Remigration Retreats|Demography Dashboard|Ethnic Vote Monitor|Right-Wing Accountability Pressure)\b/g;
    return esc(t).replace(en, '<span lang="en">$1</span>');
  }

  function tileHtml(e, { query } = {}) {
    const bv = e.bedeutungsverschiebung;
    const text = hasShift(e) && bv.politisch_verwendete_bedeutung
      ? `<dl class="wl-mini-shift"><div class="wl-mini-shift__vorher"><dt>Ausgangsbedeutung</dt><dd>${esc(bv.urspruengliche_bedeutung)}</dd></div><div class="wl-mini-shift__nachher"><dt>Im politischen Gebrauch</dt><dd>${esc(bv.politisch_verwendete_bedeutung)}</dd></div></dl>`
      : `<p class="wl-tile__text">${esc(e.bedeutung_und_kontext)}</p>`;
    const cats = e.kategorien.slice(0, 2).map(catTag).join('') + (e.kategorien.length > 2 ? `<span class="wl-small">+${e.kategorien.length - 2}</span>` : '');
    return `<li><article class="wl-tile" aria-labelledby="t-${esc(e.slug)}">
      ${sourceChip(e)}
      <h3 class="wl-tile__term" id="t-${esc(e.slug)}"><a href="${cardHref(e)}">${termHtml(e.begriff)}</a></h3>
      <p class="wl-tile__meta">${esc(e.akteur)} · ${esc(mechName(e))}</p>
      ${text}
      <div class="wl-tile__foot">${cats}</div>
      <div class="wl-tile__foot" style="border:0;padding-top:0;margin-top:0">${effectLine(e)}${MODE === 'preview' ? flagCompact(e) : ''}</div>
    </article></li>`;
  }

  /** Kompakte Listenzeile (mobil Standard): Begriff, Bereich, Mechanismus, Wirkungsstand */
  function rowHtml(e) {
    return `<li class="wl-row"><a class="wl-row__link" href="${cardHref(e)}">
      <span class="wl-row__term">${termHtml(e.begriff)}</span>
      <span class="wl-row__meta">${esc(korpusOf(e).short)} · ${esc(mechName(e))}${hasShift(e) ? ' · Bedeutungsverschiebung' : ''}</span>
      <span class="wl-row__ev">${effectLine(e)}${MODE === 'preview' && e.pruefstatus !== 'freigegeben' ? '<span class="wl-visually-hidden"> · nicht freigegeben</span>' : ''}</span>
    </a></li>`;
  }

  /* ------------------------------------------------------------------------
     7. STARTSEITE
     ------------------------------------------------------------------------ */
  function startParagraphs() {
    return [...String(TEXTE.startseite || '').matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
  }

  function viewStart(params) {
    const vis = visibleEntries();
    const p = startParagraphs(); /* [0] Leitsatz, [1–3] Einführung, [4] Befundtypen, [5] Redaktionen, [6] Autorin */
    const befund = [
      ['B', 'Ein Wort wurde oft wiederholt?', 'Das ist ein Kommunikationsbefund.'],
      ['C', 'Eine Demonstration wurde ausgelöst?', 'Das ist eine dokumentierte öffentliche Reaktion.'],
      ['D', 'Eine Verordnung wurde geändert?', 'Das ist ein institutioneller Befund.'],
      ['E–F', 'Eine langfristige Einstellungsänderung?', 'Die müsste unabhängig gemessen und ihre Ursache geprüft werden.']
    ];
    const areaCount = (a) => vis.filter((e) => korpusOf(e).area === a.key).length;
    const areas = AREAS.filter((a) => !a.internal || MODE === 'preview').map((a) => {
      const n = areaCount(a);
      return `<li><a class="wl-area${a.internal ? ' wl-area--internal' : ''}" href="${href('/bereich/' + a.key)}">
        <span class="wl-eyebrow" style="margin:0">${esc(a.sub)}</span>
        <span class="wl-area__title">${esc(a.title)}</span>
        <span class="wl-area__count">${n === 0 && MODE === 'public' ? 'Karten in redaktioneller Prüfung' : plural(n, 'Wirkungskarte', 'Wirkungskarten')}${MODE === 'preview' ? ' <span class="wl-small">(Vorschau)</span>' : ''}</span>
        <span class="wl-area__note">${esc(a.note)}</span>
        <span class="wl-area__guard">${esc(a.guard)}</span></a></li>`;
    }).join('');
    const showcase = SHOWCASE.map((s) => bySlug[s]).filter((e) => e && isVisible(e)).map((e) => {
      const bv = e.bedeutungsverschiebung;
      return `<li><a class="wl-shift-teaser" href="${cardHref(e)}">
        ${sourceChip(e)}
        <span class="wl-shift-teaser__term">${termHtml(e.begriff)}</span>
        <dl class="wl-mini-shift wl-mini-shift--arrow">
          <div class="wl-mini-shift__vorher"><dt>Ausgangsbedeutung</dt><dd>${esc(bv.urspruengliche_bedeutung)}</dd></div>
          <div class="wl-mini-shift__nachher"><dt>Im politischen Gebrauch</dt><dd>${esc(bv.politisch_verwendete_bedeutung)}</dd></div>
        </dl>
        ${effectLine(e)}</a></li>`;
    }).join('');
    const anatomy = [
      ['beleg', 'Original', 'Was steht wo, von wem, in welchem Kontext?'],
      ['beleg', 'Bedeutung', 'Ausgangssinn und politische Verwendung – getrennt.'],
      ['potenzial', 'Mechanismus', 'Welche allgemein untersuchte Reaktion könnte eine Rolle spielen?'],
      ['potenzial', 'Potenzial', 'Welche Zustandsänderung könnte auftreten – unter welchen Bedingungen?'],
      ['beleg', 'Ziel & Funktion', 'Was ist erklärt, was ist nur Interpretation?'],
      ['offen', 'Beobachtet', 'Was ist tatsächlich nachgewiesen – oder gerade nicht?'],
      ['beleg', 'Präziser', 'Sachliche Alternative für Bericht und Überschrift.']
    ].map(([k, t, d]) => `<li data-ev="${k}"><strong>${t}</strong><p>${d}</p></li>`).join('');

    const total = ENTRIES.length;
    const released = ENTRIES.filter((e) => e.pruefstatus === 'freigegeben').length;
    return `
    <div class="wl-container wl-start">
      <nav class="wl-breadcrumb" aria-label="Brotkrumen"><ol><li><a href="#/">Start</a></li><li><a href="#/">Debatte &amp; Radar</a></li><li aria-current="page">Wirkungslexikon</li></ol></nav>
      <section class="wl-hero wl-hero--lookup" aria-labelledby="hero-title">
        <h1 class="wl-hero__title" id="hero-title">Wirkungslexikon politischer Sprache</h1>
        <p class="wl-hero__lead">Politische Begriffe nachschlagen, Quellen prüfen und Wirkungspotenziale verstehen.</p>
        ${searchHtml('hero', params.get('q') || '')}
        <div class="wl-quickterms"><a href="#karten">Alle Begriffe ↓</a>${QUICKTERMS.map((t) => `<a href="${href('/', new URLSearchParams({ q: t, anker: 'karten' }))}">${esc(t)}</a>`).join('')}</div>
      </section>
    </div>

    <details class="wl-intro" id="einleitung">
      <summary class="wl-container"><span>Über das Lexikon: Einleitung und Lesehilfe</span></summary>
      <div class="wl-intro__body">
        <div class="wl-container">
        <p class="wl-lead">${p[0] || ''}</p>
        <ul class="wl-hero__facts">
          <li>${MODE === 'preview' ? `<strong>${total}</strong> Wirkungskarten im Redaktionsbestand` : vis.length ? `<strong>${vis.length}</strong> geprüfte Wirkungskarten` : 'Wirkungskarten werden <strong>einzeln freigegeben</strong>'}</li>
          <li><strong>${CATS.length}</strong> erklärte Kategorien</li>
          <li><strong>6</strong> Evidenzstufen A–F, keine Scores</li>
          ${MODE === 'preview' ? `<li><strong>${released}</strong> freigegeben</li>` : ''}
        </ul>
        </div>

    <section class="wl-section-space" aria-labelledby="intro-title">
      <div class="wl-container wl-two-col">
        <div class="wl-prose">
          <h2 class="wl-h2" id="intro-title">Worum es geht</h2>
          ${TEXTE.intro_v9 || p.slice(1, 4).map((x) => `<p>${x}</p>`).join('')}
          ${config.narrativeIntro||''}
        </div>
        <div>
          <span class="wl-label">So unterscheiden wir Aussagen</span>
          ${legendHtml(true)}
        </div>
      </div>
    </section>

    <section class="wl-section-space" style="padding-top:0" aria-label="Ihr Zugang zum Lexikon"><div class="wl-container"><h2 class="wl-h2">Ein Lexikon, drei Zugänge</h2><div class="wl-teasers">
      <a class="wl-teaser" href="/wirkungslexikon/fuer-buerger/"><span class="wl-eyebrow">Für Bürgerinnen und Bürger</span><span class="wl-teaser__title">Politische Sprache verstehen</span><span>Erklärungen, Beispiele und mögliche psychologische Mechanismen.</span></a>
      <a class="wl-teaser" href="/wirkungslexikon/fuer-redaktionen/"><span class="wl-eyebrow">Für Journalismus</span><span class="wl-teaser__title">Präzise recherchieren</span><span>Originale, Fundstellen, Kontext und journalistische Alternativen.</span></a>
      <a class="wl-teaser" href="/wirkungslexikon/fuer-wissenschaft/"><span class="wl-eyebrow">Für Analyse und Wissenschaft</span><span class="wl-teaser__title">Befunde nachvollziehen</span><span>Methodik, Evidenz, Attribution, Daten und Versionsgeschichte.</span></a>
    </div></div></section>
    <section class="wl-section-space" style="padding-top:0" aria-labelledby="befund-title">
      <div class="wl-container">
        <span class="wl-eyebrow">Vom Wort zur Wirkung</span>
        <h2 class="wl-h2" id="befund-title">Was ein Befund belegt – und was nicht</h2>
        <p class="wl-visually-hidden">${p[4] || ''}</p>
        <ol class="wl-befund" aria-describedby="befund-title">
          ${befund.map(([lvl, q, a]) => `<li><span class="wl-befund__lvl">Evidenzstufe ${lvl}</span><p class="wl-befund__q">${q}</p><p class="wl-befund__a">${a}</p></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="wl-section-space" style="background:var(--wl-surface-soft);border-block:1px solid var(--wl-line)" aria-labelledby="areas-title">
      <div class="wl-container">
        <span class="wl-eyebrow">Quellenbereiche</span>
        <h2 class="wl-h2" id="areas-title">Getrennte Korpora, eine Methode</h2>
        <p class="wl-lead" style="margin-bottom:var(--wl-s5)">Die Quellenbereiche dürfen nicht verwechselt werden. Jede Karte trägt ihren Ursprung sichtbar.</p>
        <ul class="wl-areas">${areas}</ul>
      </div>
    </section>

    ${showcase ? `<section class="wl-section-space" aria-labelledby="showcase-title">
      <div class="wl-container">
        <span class="wl-eyebrow">Bedeutungsverschiebung</span>
        <h2 class="wl-h2" id="showcase-title">Bedeutungen in Bewegung</h2>
        <p class="wl-lead" style="margin-bottom:var(--wl-s5)">„Vorher/Nachher“ ist ein möglicher Wirkungspfad, keine gemessene Veränderung.</p>
        <ul class="wl-showcase">${showcase}</ul>
      </div>
    </section>` : ''}

    <section class="wl-section-space" style="padding-top:0" aria-labelledby="anatomy-title">
      <div class="wl-container">
        <span class="wl-eyebrow">Lesehilfe</span>
        <h2 class="wl-h2" id="anatomy-title">So lesen Sie eine Wirkungskarte</h2>
        <ol class="wl-anatomy">${anatomy}</ol>
      </div>
    </section>

    <section class="wl-section-space" style="padding-top:0" aria-label="Weiterlesen">
      <div class="wl-container wl-stack">
        <div class="wl-teasers">
          <a class="wl-teaser" href="#/methodik"><span class="wl-eyebrow" style="margin:0">Methodik</span><span class="wl-teaser__title">Evidenzleiter A–F</span><span class="wl-small">Wirkstoff ≠ beobachtete Wirkung. Wie wir Belege, Potenziale und Nichtnachweise trennen.</span></a>
          <a class="wl-teaser" href="#/fuer-redaktionen"><span class="wl-eyebrow" style="margin:0">Für Redaktionen</span><span class="wl-teaser__title">Acht Prüffragen</span><span class="wl-small">Schlagworte in überprüfbare Sachbeschreibungen übersetzen – ohne Zitate zu verfälschen.</span></a>
          <a class="wl-teaser" href="#/kategorien"><span class="wl-eyebrow" style="margin:0">Raster</span><span class="wl-teaser__title">${CATS.length} Kategorien</span><span class="wl-small">Erklärte Mechanismen mit Beispielen – kein Gütesiegel, keine Schuldzuweisung.</span></a>
        </div>
        <div class="wl-journal" data-article-locked>
          <img src="img/titelbild_worte_wirken_16x9.png" alt="Titelbild des Journalartikels „Worte wirken. Auch wenn wir es nicht bemerken.“: eine Frau im Vordergrund, links Schlagwort-Schilder, rechts Menschen im Abendlicht." width="1672" height="941" loading="lazy">
          <div class="wl-journal__body">
            <span class="wl-eyebrow" style="color:#E7C67C;margin:0">Wirkungsökonomie-Journal</span>
            <h3>Worte wirken. Auch wenn wir es nicht bemerken.</h3>
            <p>Ein eigenständiger Begleitartikel zum Lexikon. Veröffentlichung nach ausdrücklicher Freigabe.</p>
            <p><span class="wl-flag wl-flag--locked">Link erst nach Veröffentlichung des Artikels</span></p>
          </div>
        </div>
      </div>
    </section>

      </div>
    </details>

    <section class="wl-section-space wl-lookup" id="karten" aria-labelledby="explorer-title">
      <div class="wl-container"><div id="wl-explorer">${explorerHtml(params)}</div></div>
    </section>

    <div class="wl-container"><p class="wl-small" style="margin-top:var(--wl-s5)">${p[6] || ''} · Stand: ${fmtDate(DATA.stand)} · Datenversion ${esc(DATA.version)}</p></div>`;
  }

  function searchHtml(id, value, inline) {
    return `<form class="wl-search${inline ? ' wl-search--inline' : ''}" role="search" data-search="${id}" action="#/">
      <label class="wl-search__label${inline ? ' wl-visually-hidden' : ''}" for="q-${id}">Im Lexikon suchen</label>
      <div class="wl-search__field">
        <span class="wl-search__icon">${ICON.search}</span>
        <input class="wl-search__input" id="q-${id}" name="q" type="search" value="${esc(value)}" autocomplete="off" spellcheck="false"
          placeholder="${esc(UI.search_placeholder || 'Suchen …')}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sg-${id}">
        <button class="wl-btn wl-search__submit" type="submit">Suchen</button>
      </div>
      <ul class="wl-suggest" id="sg-${id}" role="listbox" aria-label="Vorschläge" hidden></ul>
    </form>`;
  }

  function legendHtml(withText) {
    const items = [
      ['beleg', 'Beleg', 'In einer Quelle dokumentiert.'],
      ['deutung', 'Interpretation', 'Redaktionelle Deutung, keine Gedankenleserei.'],
      ['potenzial', 'Potenzial', 'Begründete Hypothese unter Bedingungen.'],
      ['offen', 'Nicht nachgewiesen', 'Weder folgenlos noch gefährlich – ungeprüft.']
    ];
    return `<ul class="wl-legend"${withText ? ' style="flex-direction:column;align-items:flex-start;gap:.7rem"' : ''}>${items.map(([k, l, d]) =>
      `<li>${ev(k, l)}${withText ? `<small>${d}</small>` : ''}</li>`).join('')}</ul>`;
  }

  /* ------------------------------------------------------------------------
     8. EXPLORER (Suche + Facetten + Ergebnisse)
     ------------------------------------------------------------------------ */
  const FACETS = [
    { key: 'bereich', label: 'Quellenbereich', hint: 'Korpora werden nie zusammengelegt.',
      values: () => Object.entries(KORPUS).filter(([, k]) => !k.internal || MODE === 'preview').map(([full, k]) => ({ v: k.key, label: k.short, title: full })),
      test: (e, v) => korpusOf(e).key === v },
    { key: 'thema', label: 'Narrativ- und Themenfeld',
      values: () => [...new Set(ENTRIES.map((e) => e.themencluster))].sort((a, b) => a.localeCompare(b, 'de')).map((t) => ({ v: slugify(t), label: t })),
      test: (e, v) => slugify(e.themencluster) === v },
    { key: 'kat', label: 'Kategorie (sprachlicher Mechanismus)', hint: 'Erklärtes Raster, keine Wertung.',
      values: () => CATS.map((c) => ({ v: c.slug, label: c.name, title: c.definition })),
      test: (e, v) => e.kategorien.some((n) => catByName[n] && catByName[n].slug === v) },
    { key: 'mech', label: 'Psychologischer Mechanismus', more: 8,
      values: () => MECHS.map((m) => ({ v: m.slug, label: m.name })),
      test: (e, v) => slugify(mechName(e)) === v },
    { key: 'akteur', label: 'Akteur', more: 8,
      values: () => {
        const m = new Map(); ENTRIES.forEach((e) => m.set(e.akteur, (m.get(e.akteur) || 0) + 1));
        return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de')).map(([a]) => ({ v: slugify(a), label: a }));
      },
      test: (e, v) => slugify(e.akteur) === v },
    { key: 'befund', label: 'Bedeutungsverschiebung und Befunde', hint: 'Dokumentierte Befundart; das Wirkungspotenzial wird gesondert beschrieben.',
      values: () => [
        { v: 'verschiebung', label: 'Bedeutungsverschiebung beschrieben' },
        { v: 'stufe-b', label: 'Kommunikationsoutput dokumentiert (B)' },
        { v: 'stufe-c', label: 'Reaktion dokumentiert (C)' },
        { v: 'stufe-d', label: 'Institutionelle Veränderung (D)' },
        { v: 'keine', label: 'Kein spezifischer Befund dokumentiert' }
      ],
      test: (e, v) => {
        if (v === 'verschiebung') return hasShift(e);
        const lvl = e.beobachtete_wirkung && TYP_STUFE[e.beobachtete_wirkung.typ];
        if (v === 'keine') return !lvl;
        return lvl === v.slice(-1).toUpperCase();
      } },
    { key:'quelle', label:'Quellenstatus', values:()=>[{v:'original',label:'Originalnachweis vorhanden'},{v:'sekundaer',label:'Nur sekundär belegt'},{v:'offen',label:'Originalstelle fehlt'}], test:(e,v)=>v==='offen'?!e.originalnachweis.quelle_id:v==='sekundaer'?(e.publication?e.publication.sourceKind==='secondary':e.korpus.includes('Policy Paper')):!!e.originalnachweis.quelle_id&&(e.publication?e.publication.sourceKind!=='secondary':!e.korpus.includes('Policy Paper')) },
    ...(config.v9?[{key:'narrativ',label:'Narrativfamilie',hint:MODE==='preview'?'KI-Zuordnung – menschliche Bestätigung offen.':'Nur redaktionell bestätigte Zuordnungen.',values:()=>config.families.map(f=>({v:f.id,label:f.titel})),test:(e,v)=>narrativeIds(e).includes(v)},
    {key:'evidenzrolle',label:'Evidenzrolle',values:()=>[...new Set(ENTRIES.flatMap(e=>[...e.quellen,...e.wissenschaftliche_quellen].map(q=>q.role)))].sort().map(r=>({v:slugify(r),label:r})),test:(e,v)=>[...e.quellen,...e.wissenschaftliche_quellen].some(q=>slugify(q.role)===v)},
    {key:'datum',label:'Prüfdatum',values:()=>[...new Set(ENTRIES.map(e=>e.geprueft_am))].sort().reverse().map(d=>({v:d,label:fmtDate(d)})),test:(e,v)=>e.geprueft_am===v}]:[]),
    { key: 'status', label: 'Redaktionsstatus', previewOnly: true,
      values: () => Object.keys(STATUS).map((k) => ({ v: k, label: STATUS[k] })),
      test: (e, v) => e.pruefstatus === v }
  ];

  function readFilters(params) {
    const f = {};
    FACETS.forEach((fc) => { const v = params.getAll(fc.key); if (v.length) f[fc.key] = v; });
    return f;
  }
  function applyFilters(list, f, except) {
    return list.filter((e) => FACETS.every((fc) => fc.key === except || !f[fc.key] || (fc.previewOnly && MODE !== 'preview') || f[fc.key].some((v) => fc.test(e, v))));
  }
  const IX_BY = new Map(INDEX.map((ix) => [ix.e, ix]));
  /** Suchtreffer: score ≥ 8 = Begriff trifft (Gruppe „im Begriff“), darunter = nur im Kontext erwähnt */
  const TERM_HIT = 8;
  function runQuery(params) {
    const q = (params.get('q') || '').trim();
    const f = readFilters(params);
    const letter = params.get('buchstabe');
    const tokens = norm(q).split(/[^a-z0-9-]+/).filter(Boolean);
    /* qset: alle sichtbaren Karten, die Suche + Buchstabe erfüllen (Basis der Facettenzahlen) */
    const scoreOf = new Map();
    let qset = visibleEntries();
    if (tokens.length) { qset = qset.filter((e) => { const sc = searchScore(IX_BY.get(e), tokens); scoreOf.set(e, sc); return sc > 0; }); }
    if (letter) qset = qset.filter((e) => letterOf(e) === letter);
    const list = applyFilters(qset, f);
    let scored = list.map((e) => ({ e, s: scoreOf.get(e) || 1 }));
    const sort = params.get('sort') || (tokens.length ? 'relevanz' : 'az');
    const az = (a, b) => sortKey(a.e.begriff).localeCompare(sortKey(b.e.begriff), 'de');
    if (sort === 'relevanz') scored.sort((a, b) => b.s - a.s || az(a, b));
    else if (sort === 'bereich') scored.sort((a, b) => korpusOf(a.e).short.localeCompare(korpusOf(b.e).short, 'de') || az(a, b));
    else scored.sort(az);
    return { q, f, letter, sort, tokens, qset, results: scored.map((x) => x.e), termHits: tokens.length ? scored.filter((x) => x.s >= TERM_HIT).length : null, scoreOf };
  }
  const letterOf = (e) => { const c = sortKey(e.begriff).charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };

  function explorerHtml(params) {
    const r = runQuery(params);
    const view = params.get('ansicht') || (matchMedia('(max-width:700px)').matches ? 'liste' : 'kacheln');
    const vis = visibleEntries();
    const step = 24;
    const shown = Math.min(r.results.length, +params.get('anzahl') || step);
    const facetHtml = FACETS.filter((fc) => !fc.previewOnly || MODE === 'preview').map((fc) => {
      const pool = applyFilters(r.qset, r.f, fc.key);
      const vals = fc.values().map((v) => ({ ...v, n: pool.filter((e) => fc.test(e, v.v)).length }));
      const sel = r.f[fc.key] || [];
      const render = (v) => `<li><label class="wl-check${v.n === 0 && !sel.includes(v.v) ? ' wl-check--empty' : ''}"${v.title ? ` title="${esc(v.title)}"` : ''}>
        <input type="checkbox" name="${fc.key}" value="${esc(v.v)}"${sel.includes(v.v) ? ' checked' : ''}><span>${esc(v.label)}</span><span class="wl-check__count">${v.n}</span></label></li>`;
      const main = fc.more ? vals.slice(0, fc.more) : vals;
      const rest = fc.more ? vals.slice(fc.more) : [];
      const restOpen = rest.some((v) => sel.includes(v.v));
      const isOpen = FACET_OPEN_KEYS ? FACET_OPEN_KEYS.has(fc.key) : (sel.length || ['bereich', 'kat', 'befund'].includes(fc.key));
      return `<details class="wl-facet" data-key="${fc.key}"${isOpen ? ' open' : ''}>
        <summary>${esc(fc.label)}${sel.length ? ` <span class="wl-chip__count">(${sel.length})</span>` : ''}</summary>
        ${fc.hint ? `<p class="wl-facet__hint">${esc(fc.hint)}</p>` : ''}
        <ul class="wl-facet__list">${main.map(render).join('')}</ul>
        ${rest.length ? `<details class="wl-facet__more" data-key="${fc.key}-mehr"${restOpen || (FACET_OPEN_KEYS && FACET_OPEN_KEYS.has(fc.key + '-mehr')) ? ' open' : ''}><summary class="wl-small" style="cursor:pointer;min-height:2.25rem;display:flex;align-items:center">Weitere ${rest.length} anzeigen</summary><ul class="wl-facet__list">${rest.map(render).join('')}</ul></details>` : ''}
      </details>`;
    }).join('');

    const active = [];
    if (r.q) active.push({ label: `Suche: „${r.q}“`, remove: 'q' });
    if (r.letter) active.push({ label: `Anfangsbuchstabe ${r.letter === '#' ? '0–9' : r.letter}`, remove: 'buchstabe' });
    FACETS.forEach((fc) => (r.f[fc.key] || []).forEach((v) => {
      const val = fc.values().find((x) => x.v === v);
      active.push({ label: `${fc.label}: ${val ? val.label : v}`, remove: fc.key, value: v });
    }));
    const letters = ['#'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const letterPool = applyFilters(r.tokens.length ? visibleEntries().filter((e) => searchScore(IX_BY.get(e), r.tokens) > 0) : vis, r.f);
    const azBar = `<ul class="wl-az" aria-label="Nach Anfangsbuchstabe filtern">${letters.map((L) => {
      const n = letterPool.filter((e) => letterOf(e) === L).length;
      const p = new URLSearchParams(params); p.delete('anzahl');
      if (r.letter === L) p.delete('buchstabe'); else p.set('buchstabe', L);
      return n ? `<li><a href="${href('/', p)}" ${r.letter === L ? 'aria-current="true" style="background:var(--wl-ink);color:#fff"' : ''} aria-label="${L === '#' ? 'Ziffern' : L}: ${plural(n, 'Karte', 'Karten')}">${L === '#' ? '0–9' : L}</a></li>` : `<li><span aria-hidden="true">${L}</span></li>`;
    }).join('')}</ul>`;

    let list = '';
    let lastL = null;
    let lastGroup = null;
    r.results.slice(0, shown).forEach((e) => {
      if (r.sort === 'az' && !r.q) { const L = letterOf(e); if (L !== lastL) { list += `<li class="wl-results__letter" aria-hidden="true">${L === '#' ? '0–9' : L}</li>`; lastL = L; } }
      if (r.sort === 'relevanz' && r.tokens.length) {
        const g = (r.scoreOf.get(e) || 0) >= TERM_HIT ? 'begriff' : 'kontext';
        if (g !== lastGroup) {
          list += `<li class="wl-results__letter wl-results__group">${g === 'begriff' ? `Im Begriff <span class="wl-small">(${r.termHits})</span>` : `Im Kontext erwähnt <span class="wl-small">(${r.results.length - r.termHits})</span>`}</li>`;
          lastGroup = g;
        }
      }
      list += view === 'liste' ? rowHtml(e) : tileHtml(e, { query: r.q });
    });
    const moreP = new URLSearchParams(params); moreP.set('anzahl', String(shown + step));
    const emptyPublic = MODE === 'public' && vis.length === 0;
    return `
      <div class="wl-results-bar" style="margin-bottom:var(--wl-s2)">
        <h2 class="wl-h2" id="explorer-title" style="margin:0">${r.q ? 'Suchergebnisse' : 'Begriffe A–Z'}</h2>
      </div>
      ${emptyPublic ? `<div class="wl-empty"><strong>Noch keine Wirkungskarte freigegeben</strong>Öffentlich erscheinen Karten erst nach redaktioneller Einzelfreigabe. Methodik und Leitfaden sind bereits lesbar.</div>` : `
      <div class="wl-explorer__layout">
        <div class="wl-facets${FACETS_OPEN ? ' is-open' : ''}" id="facets" role="region" aria-labelledby="facets-title"${FACETS_OPEN ? ' style="transition:none"' : ''}>
          <div class="wl-facets__head"><h3 class="wl-h3" id="facets-title" style="margin:0">Filter</h3>
            <a class="wl-small" href="${href('/', new URLSearchParams(r.q ? { q: r.q } : {}))}">${esc(UI.reset_filters || 'Filter zurücksetzen')}</a>
            <button class="wl-btn wl-btn--ghost wl-btn--sm wl-facets__close" type="button" data-close-facets aria-label="Filter schließen">${ICON.close}</button></div>
          <div class="wl-facets__scroll"><form data-facets>${facetHtml}</form></div>
          <div class="wl-facets__foot"><button class="wl-btn" type="button" data-close-facets>${plural(r.results.length, 'Ergebnis', 'Ergebnisse')} anzeigen</button></div>
        </div>
        <div class="wl-scrim" data-close-facets${FACETS_OPEN ? '' : ' hidden'}></div>
        <div>
          <div class="wl-results-bar">
            <p class="wl-results-count" role="status" aria-live="polite">${plural(r.results.length, 'Wirkungskarte', 'Wirkungskarten')}${r.results.length !== vis.length ? ` von ${vis.length}` : ''}${r.termHits != null ? `<span class="wl-small" style="font-weight:600"> · ${r.termHits} im Begriff</span>` : ''}</p>
            <button class="wl-btn wl-btn--secondary wl-btn--sm wl-filter-toggle" type="button" data-open-facets aria-controls="facets" aria-expanded="${FACETS_OPEN}">${ICON.filter}Filter${Object.keys(r.f).length ? ` (${Object.values(r.f).flat().length})` : ''}</button>
            <div class="wl-results-bar__right">
              <div class="wl-segmented" role="group" aria-label="Darstellung">${[['kacheln', 'Kacheln'], ['liste', 'Liste']].map(([v, l]) => { const p = new URLSearchParams(params); p.set('ansicht', v); p.delete('anzahl'); return `<a class="wl-segmented__a" href="${href('/', p)}" aria-current="${view === v}" data-view>${l}</a>`; }).join('')}</div>
              <label class="wl-small" for="sort">Sortierung</label>
              <select class="wl-select" id="sort" data-sort>
                ${r.tokens.length ? `<option value="relevanz"${r.sort === 'relevanz' ? ' selected' : ''}>Relevanz</option>` : ''}
                <option value="az"${r.sort === 'az' ? ' selected' : ''}>A–Z</option>
                <option value="bereich"${r.sort === 'bereich' ? ' selected' : ''}>Quellenbereich</option>
              </select></div>
            <div class="wl-active-filters">${active.map((a) => {
              const p = new URLSearchParams(params); p.delete('anzahl');
              if (a.value) { const rest = p.getAll(a.remove).filter((x) => x !== a.value); p.delete(a.remove); rest.forEach((x) => p.append(a.remove, x)); } else p.delete(a.remove);
              return `<a class="wl-chip" href="${href('/', p)}" aria-label="Filter entfernen: ${esc(a.label)}">${esc(a.label)}<span class="wl-chip__remove" aria-hidden="true">×</span></a>`;
            }).join('')}</div>
          </div>
          ${azBar}
          ${r.results.length ? `<ul class="wl-results${view === 'liste' ? ' wl-results--list' : ''}">${list}</ul>
            ${shown < r.results.length ? `<p style="margin-top:var(--wl-s5);text-align:center"><a class="wl-btn wl-btn--secondary" href="${href('/', moreP)}" data-more>Weitere ${Math.min(step, r.results.length - shown)} anzeigen <span class="wl-small">(${r.results.length - shown} verbleibend)</span></a></p>` : ''}`
            : `<div class="wl-empty"><strong>Keine passende Wirkungskarte</strong>${esc(UI.empty_results || '')}<p style="margin-top:.8rem"><a href="${href('/')}#karten">${esc(UI.reset_filters || 'Filter zurücksetzen')}</a></p></div>`}
        </div>
      </div>`}`;
  }

  /* ------------------------------------------------------------------------
     9. WIRKUNGSKARTE
     ------------------------------------------------------------------------ */
  function viewCard(slug) {
    const e = bySlug[slug];
    if (!e || !isVisible(e)) {
      return { title: 'Nicht öffentlich', html: `<div class="wl-container wl-section-space"><div class="wl-empty"><strong>Diese Wirkungskarte ist nicht öffentlich</strong>Karten erscheinen erst nach redaktioneller Einzelfreigabe. <a href="#/">Zur Übersicht</a></div></div>` };
    }
    const k = korpusOf(e);
    const area = areaByKey[k.area];
    const bv = e.bedeutungsverschiebung;
    const pe = e.psychologischer_effekt;
    const wp = e.wirkungspotenzial;
    const on = e.originalnachweis;
    const lad = ladderOf(e);
    const isKandidat = e.pruefstatus === 'recherchekandidat_originalstelle_fehlt';
    const isSek = e.pruefstatus === 'sekundaerbelegt_originalpapier_pruefen';
    const srcById = Object.fromEntries(e.quellen.map((q) => [q.id, q]));
    const primary = on.quelle_id && srcById[on.quelle_id];
    /* Zitatregel: echter Wortlaut (≠ Lemma) oder Programm-Überschrift → Zitat; Lemma/sekundär/Kandidat → kein Zitatsatz */
    const isQuote = (!config.v9 || (MODE==='public' && e.publication?.quoteDisplay===true) || e.originalzitat_menschlich_bestaetigt===true) && !isKandidat && !isSek && (on.text !== e.begriff || on.typ === 'Begriff/Kapitelüberschrift');

    /* Dubletten-Regel: identische Texte nur einmal zeigen */
    const funktionDup = e.moegliche_kommunikative_funktion === wp.moegliche_veraenderung;
    const bezugDup = pe.bezug_auf_diesen_begriff === wp.moegliche_veraenderung;
    const funktionIsMech = e.moegliche_kommunikative_funktion === pe.allgemeiner_mechanismus;

    const nodes = [];
    /* 1 ─ Original */
    nodes.push({ id: 'original', ev: isKandidat ? 'offen' : 'beleg', step: 'Quelle', title: 'Im Original', body: `
      ${config.v9&&MODE==='preview'?'<p class="wl-guard">Angaben des V8-Redaktionsentwurfs; menschliche Original- und Kontextprüfung noch nicht bestätigt. Der historische V3-Prüfstatus bleibt erhalten.</p>':''}
      <figure class="wl-original${isKandidat ? ' wl-original--kandidat' : ''}">
        ${isQuote ? `<blockquote class="wl-original__quote"><q>${termHtml(on.text)}</q></blockquote>`
          : `<p class="wl-original__lemma"><span class="wl-original__lemma-label">${isKandidat ? 'Recherchestichwort – KEIN ZITAT' : isSek ? (config.v9?'Ausdruck im Entwurf · historischer V3-Prüfstatus':'Ausdruck, sekundär belegt') : (e.publication?.quoteClass==='REDAKTIONELLES_LEMMA_KEIN_ORIGINALZITAT'?'Redaktionelles Lemma - KEIN Sprecherzitat':'Untersuchter Ausdruck')}</span>${termHtml(e.publication?.quoteClass==='REDAKTIONELLES_LEMMA_KEIN_ORIGINALZITAT'?(e.lemma_kurz||e.begriff):on.text)}</p>`}
        <figcaption>
          <dl class="wl-facts">
            <div><dt>Urheber</dt><dd>${esc(e.akteur)}</dd></div>
            <div><dt>Fundstelle</dt><dd>${esc(on.fundstelle)}</dd></div>
            <div><dt>Nachweisart</dt><dd>${esc(on.typ)}</dd></div>
            <div><dt>Zitierstatus</dt><dd>${esc(e.zitierstatus)}</dd></div>
            <div class="wl-facts__full"><dt>Kontext</dt><dd>${esc(on.kontext)}</dd></div>
            <div class="wl-facts__full"><dt>Wortlautprüfung</dt><dd>${esc(on.wortlaut_pruefung)}</dd></div>
          </dl>
          <div class="wl-source-open">
            ${primary ? `<a class="wl-btn" href="${esc(primary.url)}" target="_blank" rel="noopener noreferrer">${ICON.ext}${esc(UI.source_button || 'Originalquelle öffnen')}<span class="wl-visually-hidden"> (öffnet in neuem Tab)</span></a>
              <span class="wl-role">${esc(primary.role)}</span>` : `<span class="wl-ev wl-ev--offen">Originalstelle fehlt – kein Zitat</span>`}
          </div>
        </figcaption>
      </figure>
      ${area && (k.area === 'ifr' || k.area === 'afd') ? `<p class="wl-guard" style="margin-top:var(--wl-s4)">${esc(area.guard)}</p>` : ''}` });

    /* 2 ─ Bedeutung & Verschiebung (Herzstück) */
    const shiftEv = shiftEvidence(bv.status);
    if (hasShift(e)) {
      nodes.push({ id: 'verschiebung', ev: shiftEv === 'beleg' ? 'beleg' : 'deutung', step: 'Bedeutung', title: 'Bedeutungsverschiebung', body: `
        <p class="wl-node__intro">Wie sich mit der Bedeutung auch das mögliche Wirkungspotenzial verändert.</p>
        <div class="wl-shift" role="group" aria-label="Vergleich vorher und nachher">
          <section class="wl-shift__col wl-shift__col--vorher" aria-labelledby="sv-h">
            <header class="wl-shift__colhead"><h3 id="sv-h">Vorher · Ausgangsbedeutung</h3><p>Lexikalischer oder allgemeiner Sinn</p></header>
            <dl class="wl-shift__cell wl-shift__cell--meaning"><dt>Bedeutung ${ev(shiftEv === 'beleg' ? 'beleg' : 'deutung')}</dt><dd>${esc(bv.urspruengliche_bedeutung || '–')}</dd></dl>
            <dl class="wl-shift__cell"><dt>Wirkungspotenzial ${ev('potenzial')}</dt><dd>${esc(bv.wirkung_vorher || '–')}</dd></dl>
          </section>
          <div class="wl-shift__arrow" aria-hidden="true">${ICON.arrow}<span>Umdeutung</span></div>
          <section class="wl-shift__col wl-shift__col--nachher" aria-labelledby="sn-h">
            <header class="wl-shift__colhead"><h3 id="sn-h">Nachher · im politischen Gebrauch</h3><p>${esc(e.akteur)}</p></header>
            <dl class="wl-shift__cell wl-shift__cell--meaning"><dt>Bedeutung ${ev(shiftEv === 'beleg' ? 'beleg' : 'deutung')}</dt><dd>${esc(bv.politisch_verwendete_bedeutung || '–')}</dd></dl>
            <dl class="wl-shift__cell"><dt>Wirkungspotenzial ${ev('potenzial')}</dt><dd>${esc(bv.wirkung_nachher || '–')}</dd></dl>
          </section>
        </div>
        ${bv.veraenderung_des_wirkungspotenzials && !shiftSummaryRedundant(bv) ? `<div class="wl-claim wl-claim--potenzial wl-shift-summary">${ev('potenzial', 'Veränderung des Wirkungspotenzials')}<p>${esc(bv.veraenderung_des_wirkungspotenzials)}</p></div>` : ''}
        <p class="wl-shift-status"><span><strong>Status:</strong> ${esc(bv.status)}</span></p>
        ${bv.nachweis_der_verschiebung ? `<p class="wl-small" style="margin-top:.35rem"><strong style="color:var(--wl-ink)">Nachweis der Verschiebung:</strong> ${esc(bv.nachweis_der_verschiebung)}</p>` : ''}
        <p class="wl-shift-caveat">Vorher/Nachher beschreibt mögliche Interpretationen – keine gemessene Meinungsänderung.</p>` });
    } else {
      nodes.push({ id: 'verschiebung', ev: shiftClaimed(e) ? 'deutung' : 'offen', step: 'Bedeutung', title: 'Bedeutung und Kontext', body: `
        <div class="wl-claim wl-claim--beleg">${ev('beleg', 'Bedeutung im Kontext')}<p>${esc(e.bedeutung_und_kontext)}</p></div>
        <div class="wl-shift--none" style="margin-top:var(--wl-s3)">${shiftClaimed(e)
          ? `<div class="wl-claim wl-claim--deutung">${ev('deutung', 'Bedeutungsverschiebung')}<p>${esc(bv.status)}.</p>
             <p class="wl-claim__note">Für einen belegten Vorher/Nachher-Vergleich fehlen vollständige Angaben oder Quellen; das Raster wird deshalb nicht gezeigt.${MODE === 'preview' ? ' <span class="wl-derived">Redaktionshinweis</span> Vollständigkeit und Belege prüfen.' : ''}</p></div>`
          : `<div class="wl-claim wl-claim--offen">${ev('offen', 'Bedeutungsverschiebung')}<p>${esc(bv.status)}.</p>
             <p class="wl-claim__note">Für diesen Begriff liegt kein belegter Vorher/Nachher-Vergleich vor. Das Lexikon zeigt ihn deshalb nicht.</p></div>`}</div>` });
    }

    /* 3 ─ Wirkkette */
    nodes.push({ id: 'wirkkette', ev: 'potenzial', step: 'Mechanismus', title: 'Wirkungspotenzial – wie die Formulierung wirken kann', body: `
      <p class="wl-node__intro">${esc(UI.explainer_body || '')}</p>
      <ol class="wl-chain">
        <li class="wl-chain__step"><div class="wl-chain__label">Auslöser<small>${ev('deutung', 'Wirkstoff · Analogie')}</small></div>
          <div class="wl-chain__body"><p class="wl-mech-name">${termHtml(e.begriff)}</p>
            ${e.kategorien.length ? `<ul class="wl-tag-list" aria-label="Kategorien">${e.kategorien.map((c) => `<li>${catTag(c)}</li>`).join('')}</ul>` : ''}
            <div style="margin-top:.6rem">${boiler(e.wirkstoff_analogie)}</div></div></li>
        <li class="wl-chain__step"><div class="wl-chain__label">Psychologischer Mechanismus<small>${ev('potenzial', 'Allgemeine Forschung')}</small></div>
          <div class="wl-chain__body"><p class="wl-mech-name"><a href="${href('/', new URLSearchParams({ mech: slugify(pe.name) }))}#karten">${esc(pe.name)}</a></p>
            <p>${esc(pe.allgemeiner_mechanismus)}</p>
            ${bezugDup ? '' : `<p><strong>Bezug auf diesen Begriff:</strong> ${esc(pe.bezug_auf_diesen_begriff)}</p>`}
            ${boiler(pe.evidenzstatus)}</div></li>
        <li class="wl-chain__step"><div class="wl-chain__label">Wirkungspotenzial<small>${ev('potenzial')}</small></div>
          <div class="wl-chain__body">
            <div class="wl-timeframe">
              <div class="wl-claim wl-claim--potenzial"><span class="wl-label">Kurzfristig</span><p>${esc(wp.moegliche_veraenderung)}</p></div>
              <div class="wl-claim wl-claim--potenzial"><span class="wl-label">Langfristig</span>${boiler(e.langfristiges_potenzial)}</div>
            </div>
            <dl class="wl-facts" style="margin-top:var(--wl-s4)">
              <div><dt>Adressaten</dt><dd>${esc(wp.adressaten)}</dd></div>
              <div><dt>Bedingungen</dt><dd>${esc(wp.bedingungen)}</dd></div>
            </dl></div></li>
        <li class="wl-chain__step"><div class="wl-chain__label">Mögliche Gegenwirkung<small>${ev('potenzial')}</small></div>
          <div class="wl-chain__body">${boiler(wp.gegenwirkung)}</div></li>
      </ol>` });

    /* 4 ─ Ziel vs. Funktion */
    nodes.push({ id: 'ziel', ev: 'beleg', step: 'Absicht', title: 'Ziel und Funktion – getrennt', body: `
      <div class="wl-intent">
        <div class="wl-claim wl-claim--beleg">${ev('beleg')}<h3>${esc(UI.intent_heading || 'Dokumentiertes politisches Ziel')}</h3><p>${esc(e.dokumentiertes_ziel)}</p>${boiler(e.nachweis_absicht)}</div>
        <div class="wl-claim wl-claim--deutung">${ev('deutung')}<h3>${esc(UI.function_heading || 'Mögliche kommunikative Funktion – Interpretation')}</h3>
          ${(funktionDup || funktionIsMech) && MODE === 'preview'
            ? `<p class="wl-boiler"><span class="wl-derived">Redaktionshinweis</span> Wortgleich mit ${funktionDup ? '„Wirkungspotenzial – kurzfristig“' : '„Psychologischer Mechanismus“'} (oben). Vor Freigabe eigenständig formulieren.</p>`
            : `<p>${esc(e.moegliche_kommunikative_funktion)}</p>`}
          <p class="wl-claim__note">Keine Gedankenleserei und keine belegte versteckte Absicht.</p></div>
      </div>
      <p class="wl-small" style="margin-top:var(--wl-s3)">${esc(e.ziel_absicht_beleglage)}</p>` });

    /* 5 ─ Beobachtet */
    const bw = e.beobachtete_wirkung;
    const observationRole=config.reviewBySlug?.[e.slug]?.observationRole;
    const lvl = bw && TYP_STUFE[bw.typ];
    const ladder = `<ol class="wl-ladder" aria-label="Evidenzleiter A bis F für diese Karte">${LADDER.map((r) => {
      const s = lad.st[r.l];
      const stateTxt = s.state === 'offen' ? 'nicht dokumentiert' : s.state === 'sekundaer' ? 'sekundär dokumentiert' : 'dokumentiert';
      return `<li class="wl-ladder__rung" data-state="${s.state}">
        <span class="wl-ladder__letter">${r.l}<span class="wl-ladder__state" aria-hidden="true"></span></span>
        <span class="wl-ladder__name">${r.name}</span>
        <span class="wl-ladder__found">${s.state === 'offen' ? '<span class="wl-visually-hidden">nicht dokumentiert</span>' : esc(s.found)}${s.derived && MODE === 'preview' ? '<span class="wl-derived" title="Stufe aus dem Befundtyp abgeleitet – redaktionell zu bestätigen">abgeleitet</span>' : ''}</span>
        <span class="wl-visually-hidden">: ${stateTxt}</span></li>`;
    }).join('')}</ol>
    <p class="wl-ladder-note">Die Leiter zeigt die Art des Nachweises, nicht Gefährlichkeit. Fehlender Nachweis bedeutet weder Wirkungslosigkeit noch erwiesene Wirkung.</p>`;
    nodes.push({ id: 'beobachtet', ev: lvl ? 'beleg' : 'offen', step: 'Beobachtung', title: observationRole?'Dokumentierte Vorgänge und Reaktionen':config.v9&&!bw?'Dokumentierte Verwendung und Evidenzstatus':'Tatsächlich beobachtete Wirkungen', body: `
      ${observationRole?`<p class="wl-guard">Rollenprüfung offen: ${esc(observationRole.vorgeschlagene_Quellenrolle)}. Der Vorgang ist kein Nachweis einer durch das Wort verursachten Einstellungsänderung. Originalquellenkontrolle: ${esc(observationRole.Originalquellenkontrolle)}.</p>`:''}
      ${ladder}
      <div class="wl-claim wl-claim--beleg" style="margin-bottom:var(--wl-s3)">${ev('beleg', UI.observed_output || 'Dokumentierte Verwendung')}${boiler(e.beobachtete_kommunikationsleistung)}</div>
      ${lvl ? `<div class="wl-claim wl-claim--beleg wl-effect">${ev('beleg', observationRole?'Dokumentierter Vorgang - eigenständiger Attributionsstatus':UI.observed_effect || 'Tatsächlich beobachtete Wirkung')}
          <span class="wl-effect__type">${esc(bw.typ)}${MODE === 'preview' || e.evidenzstufe_bestaetigt === lvl ? ' · Stufe ' + lvl : ''}</span>
          <p class="wl-effect__desc">${esc(bw.beschreibung)}</p>
          <p class="wl-small">Belege: ${bw.beleg_ids.map((id) => {
            const q = srcById[id];
            if (q) return `<a href="#q-${esc(id)}">${esc(q.title)}</a>`;
            const g = (DATA.quellenregister || {})[id]; /* Rückfall: globales Quellenregister (Beleg fehlt in quellen[] der Karte) */
            return g ? `<a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">${esc(g.title)}</a>${MODE === 'preview' ? ' <span class="wl-derived" title="Beleg-ID fehlt in quellen[] dieser Karte">aus Quellenregister</span>' : ''}` : esc(id);
          }).join(' · ')}</p>
          <dl class="wl-attribution"><dt>Attribution</dt><dd>${esc(bw.attribution)}</dd></dl></div>`
        : `<div class="wl-claim wl-claim--offen">${ev('offen')}<p class="wl-not-proven">${esc(UI.not_proven || 'Keine spezifische Wirkung nachgewiesen.')}</p>
          <p class="wl-claim__note">${esc(e.wirkungsnachweis_status)}</p>
          ${lad.research ? `<div class="wl-claim wl-claim--potenzial" style="margin-top:var(--wl-s3)">${ev('potenzial', 'Allgemeiner Forschungsbefund – nicht zu diesem Begriff')}<p>${esc(lad.research.beschreibung)}</p><p class="wl-claim__note">${esc(lad.research.attribution)}</p></div>` : ''}</div>`}
      ${!lvl ? `<dl class="wl-attribution" style="margin-top:var(--wl-s3)"><dt>Attribution</dt><dd>${esc(e.attribution)}</dd></dl>` : ''}
      <div class="wl-claim wl-claim--offen wl-research">${ev('offen', 'Messweg · offene Forschungsfrage')}<p>${esc(e.empfohlene_wirkungspruefung)}</p></div>` });

    /* 6 ─ Alternativen */
    nodes.push({ id: 'alternativen', ev: 'tool', step: 'Sprache', title: 'Redaktionell präziser', body: `
      <ul class="wl-alts">${e.redaktionelle_alternativen.map((a, i) => `<li class="wl-alt">
        <div><span class="wl-alt__label">Redaktionell besser</span><p class="wl-alt__text" id="alt-${i}">${esc(a)}</p></div>
        <button class="wl-btn wl-btn--secondary wl-btn--sm" type="button" data-copy="#alt-${i}" aria-describedby="alt-${i}">${ICON.copy}Kopieren</button></li>`).join('')}</ul>
      <div class="wl-quote-rule">
        <div><strong>Im Zitat</strong>Originalwortlaut korrekt lassen, Urheber und Kontext nennen.</div>
        <div><strong>In der Sachbeschreibung</strong>Begriffsdefinition offenlegen, Betroffenenperspektiven und Gegenpositionen aufnehmen.</div>
      </div>
      <p class="wl-small" style="margin-top:var(--wl-s3)">${esc(e.nutzen_fuer_journalismus)} Keine Wortverbotsliste.</p>` });

    /* 7 ─ Quellen & Status */
    let no = 0;
    const srcItem = (q, used) => `<li class="wl-source-item" id="q-${esc(q.id)}"><span class="wl-source-item__no">${++no}</span>
      <span class="wl-source-item__title"><a href="${esc(q.url)}" target="_blank" rel="noopener noreferrer">${esc(q.title)}<span class="wl-visually-hidden"> (öffnet in neuem Tab)</span></a></span>
      <span class="wl-source-item__meta"><span class="wl-role">${esc(q.role)}</span>${q.author?`<span>${esc(q.author)}</span>`:config.v9?'<span>Urheberangabe offen</span>':''}${q.locator ? `<span>${esc(q.locator)}</span>` : config.v9?'<span>Fundstelle offen</span>':''}${q.date ? `<span>${esc(q.date)}</span>` : config.v9?'<span>Veröffentlichungsdatum offen</span>':''}${q.adopted_on?`<span>Beschluss: ${esc(q.adopted_on)}</span>`:''}</span>
      ${used ? `<span class="wl-source-item__used">${used}</span>` : ''}</li>`;
    const usedFor = (id) => [on.quelle_id === id ? 'Originalnachweis' : '', bw && bw.beleg_ids.includes(id) ? 'Beleg der beobachteten Wirkung' : ''].filter(Boolean).join(' · ');
    nodes.push({ id: 'quellen', ev: 'beleg', step: 'Belege', title: UI.references_heading || 'Quellen', body: `
      <div class="wl-sources">
        <div><h3 class="wl-h3">Quellen zur Aussage</h3>
          ${e.quellen.length ? `<ol class="wl-source-list">${e.quellen.map((q) => srcItem(q, usedFor(q.id))).join('')}</ol>` : `<div class="wl-claim wl-claim--offen">${ev('offen', 'Keine Quelle')}<p>Originalstelle fehlt. Diese Karte ist ein Rechercheauftrag und wird nicht als Zitat veröffentlicht.</p></div>`}</div>
        <div><h3 class="wl-h3">Forschung zum Mechanismus</h3>
          <p class="wl-small" style="margin-bottom:.5rem">Diese Studien belegen allgemeine Mechanismen – nicht die Wirkung dieses Begriffs.</p>
          <ol class="wl-source-list">${e.wissenschaftliche_quellen.map((q) => srcItem(q, pe.studien_ids.includes(q.id) ? 'Zum genannten Mechanismus' : '')).join('')}</ol></div>
        <div><h3 class="wl-h3">Belegstatus und Stand</h3><p><a href="daten.json" download>Strukturierte Karte herunterladen (JSON)</a></p>
          <dl class="wl-status-grid">
            <div><dt>${esc(UI.filter_review || 'Redaktionsstatus')}</dt><dd>${flagFor(e)}<br><span class="wl-small">${esc(STATUS[e.pruefstatus] || e.pruefstatus)}</span></dd></div>
            <div><dt>${esc(UI.last_reviewed || 'Quellenstand')}</dt><dd><time datetime="${esc(e.geprueft_am)}">${fmtDate(e.geprueft_am)}</time> · Version ${esc(e.version)}</dd></div>
            <div><dt>Kategorisierung</dt><dd>${esc(e.kategorisierung_status)}</dd></div>
            <div><dt>Analytische Sicherheit</dt><dd>${esc(e.analystische_sicherheit)}</dd></div>
            <div style="grid-column:1/-1"><dt>Redaktioneller Vorbehalt</dt><dd>${esc(e.redaktioneller_vorbehalt)}</dd></div>
          </dl></div>
        <div><h3 class="wl-h3">${esc(UI.corrected || 'Aktualisierung und Korrekturen')}</h3>
          <ol class="wl-history">${(config.histories?.[e.slug] || [{date: DATA.stand, version: e.version, actor: 'V3-Quellpaket · Natalie Weber', reason: 'Unveränderter Import; keine technische Freigabe.'}]).map(h => `<li><time datetime="${esc(h.date)}">${fmtDate(h.date)}</time><span>Version ${esc(h.version)} · ${esc(h.actor)} · ${esc(h.reason)}</span></li>`).join('')}</ol>
          <p class="wl-small" style="margin-top:.5rem">Korrekturen werden mit Datum, Version und Bearbeitung sichtbar dokumentiert.</p></div>
      </div>` });

    if(config.v9&&MODE==='public')nodes.push({id:'kategorien-begruendung',ev:'deutung',step:'Einordnung',title:'Begründete Kategorien und Revision',body:`<p>Die Kategorien beziehen sich auf diese Begriffsverwendung. Sie bewerten keine Personen und beweisen keine eingetretene Wirkung.</p><dl class="wl-facts">${(e.kategorien_begruendung||[]).map(x=>`<div class="wl-facts__full"><dt>${esc(x.kategorie)}</dt><dd>${esc(x.begruendung)}</dd></div>`).join('')}</dl><p>Publikationsfreigabe: Natalie Weber, 16.10.2026. Quellenrevision: <code>${esc(e.publication?.sourceRevision)}</code>. Zitatdarstellung: ${esc(e.zitierstatus)}.</p>`});
    if(config.v9&&MODE==='preview'){
      const recursive=(v,p)=>{if(v==null)return `<span data-content-path="${esc(p)}">Nicht erfasst</span>`;if(typeof v!=='object')return `<span data-content-path="${esc(p)}">${esc(v)}</span>`;return `<dl class="wl-facts">${Object.entries(v).map(([k,x])=>`<div class="wl-facts__full"><dt>${esc(k)}</dt><dd>${recursive(x,p+'.'+k)}</dd></div>`).join('')}</dl>`;};
      nodes.push({id:'v9-redaktion',ev:'tool',step:'Prüfstand',title:'Quellen, Zuordnungen und Inhaltsrevision',body:`<p>V9-Arbeitsfassung · keine Veröffentlichungsfreigabe. Originalwortlaut und Lemma sind getrennt; ein KI-Prüfvermerk ersetzt keine menschliche Zitatprüfung.</p><h3>Redaktionelles Lemma</h3><p>${esc(e.lemma_kurz||e.begriff)}</p><h3>Originalwortlaut – Prüfstand</h3><p>${esc(e.originalwortlaut||'Kein eigenständiger Originalwortlaut erfasst')}</p><p>${esc(e.lemma_zitat_status)}</p><h3>Kategorien und Begründungen</h3>${recursive(e.kategorien_begruendung,'kategorien_begruendung')}<h3>Narrativzuordnung</h3><p>KI-Vorschlag, noch nicht menschlich bestätigt. Keine zusätzliche Sprecherzuschreibung.</p>${recursive(e.narrativeinordnung_v7,'narrativeinordnung_v7')}<h3>Quellenmetadaten und offene Aufgaben</h3>${recursive(e.quelle_metadaten_pruefung,'quelle_metadaten_pruefung')}${recursive(e.qualitaet_v8,'qualitaet_v8')}<details><summary>Vollständiger strukturierter Prüfstand dieser Revision</summary>${recursive(e,'entry')}</details>`});
    }
    const additionalReview=config.reviewBySlug?.[e.slug];
    if(additionalReview?.stationHtml)nodes.push({id:'weiterverwendung',ev:'beleg',step:'Verwendung',title:'So wurde der Begriff weiterverwendet',body:additionalReview.stationHtml});
    if(additionalReview?.decisionHtml)nodes.push({id:'entscheidungs-vorwirkung',ev:'potenzial',step:'Entscheidungsraum',title:'Welche politischen Entscheidungen kann die Deutung vorbereiten?',body:additionalReview.decisionHtml});
    if(additionalReview?.reviewHtml)nodes.push({id:'quellen-review',ev:'tool',step:'Redaktionsprüfung',title:'Journalistische Funktionen und offene Prüfobjekte',body:additionalReview.reviewHtml});
    /* Verwandte */
    const rel = relatedOf(e);
    const relItem = (o, reason) => `<li><a class="wl-related__item" href="${cardHref(o)}"><small>${esc(korpusOf(o).short)}</small><strong>${termHtml(o.begriff)}</strong><small>${esc(reason)}</small></a></li>`;
    const relHtml = `
      <section class="wl-section-space" aria-labelledby="rel-title" style="padding-bottom:0">
        <span class="wl-eyebrow">Zusammenhänge</span><h2 class="wl-h2" id="rel-title">Verwandte Wirkungskarten</h2>
        <div class="wl-related">
          ${rel.sameTerm.length ? `<div class="wl-related__group"><h3>Weitere Karten zum selben Begriff</h3>
            ${rel.sameTerm.some((o) => korpusOf(o).area !== korpusOf(e).area) ? `<p class="wl-guard">Ein gleichlautender Begriff belegt keine institutionelle Gleichsetzung.</p>` : ''}
            <ul class="wl-related__list" style="margin-top:.6rem">${rel.sameTerm.map((o) => relItem(o, (korpusOf(o).area !== korpusOf(e).area ? 'Anderer Quellenbereich · ' : '') + o.akteur)).join('')}</ul></div>` : ''}
          ${rel.sameMech.length ? `<div class="wl-related__group"><h3>Gleicher Mechanismus: ${esc(pe.name)}</h3>
            <p><a href="${href('/', new URLSearchParams({ mech: slugify(pe.name) }))}#karten">Alle ${MECHS.find((m) => m.name === pe.name).count} Karten mit diesem Mechanismus</a></p>
            <ul class="wl-related__list">${rel.sameMech.map((o) => relItem(o, o.akteur)).join('')}</ul></div>` : ''}
          ${rel.sameCat.length ? `<div class="wl-related__group"><h3>Gemeinsame Kategorien</h3>
            <ul class="wl-related__list">${rel.sameCat.map((o) => relItem(o, o.kategorien.filter((c) => e.kategorien.includes(c)).join(' · '))).join('')}</ul></div>` : ''}
        </div>
      </section>`;

    const toc = nodes.map((n) => `<li><a href="#${n.id}" data-toc="${n.id}">${esc(n.step)}</a></li>`).join('');
    const glance = `<div class="wl-glance"><span class="wl-label" style="margin-bottom:.8rem">Auf einen Blick</span><dl>
      <div><dt>Quellenbereich</dt><dd>${esc(e.korpus)}</dd></div>
      <div><dt>Akteur</dt><dd>${esc(e.akteur)}</dd></div>
      <div><dt>Themenfeld</dt><dd>${esc(e.themencluster)} · ${esc(e.thema)}</dd></div>
      <div><dt>Mechanismus</dt><dd>${esc(pe.name)}</dd></div>
      <div><dt>Bedeutungsverschiebung</dt><dd>${hasShift(e) ? 'beschrieben' : 'nicht nachgewiesen'}</dd></div>
      <div><dt>Höchste dokumentierte Stufe</dt><dd>${lad.highest ? `${lad.highest} – ${LADDER.find((r) => r.l === lad.highest).name.replace('­', '')}` : 'keine'}</dd></div>
    </dl></div>`;

    const html = `
    <div class="wl-container">
      <nav class="wl-breadcrumb" aria-label="Brotkrumen"><ol><li><a href="#/">Start</a></li><li><a href="#/">Wirkungslexikon</a></li>
        ${area ? `<li><a href="${href('/bereich/' + area.key)}">${esc(area.title)}</a></li>` : ''}<li aria-current="page">${termHtml(e.begriff)}</li></ol></nav>
      <header class="wl-card-head">
        <div class="wl-card-head__top">${sourceChip(e)}${MODE === 'preview' ? flagFor(e) : ''}</div>
        <h1 class="wl-term">${termHtml(e.begriff)}</h1>
        <ul class="wl-term-meta">
          <li><strong>${esc(e.akteur)}</strong></li>
          ${primary ? `<li>${esc(primary.title.split(':')[0])}</li>` : '<li>ohne Originalquelle</li>'}
          <li>${esc(UI.last_reviewed || 'Quellenstand')} <time datetime="${esc(e.geprueft_am)}">${fmtDate(e.geprueft_am)}</time></li>
        </ul>
        <ul class="wl-tag-list" aria-label="Kategorien">${e.kategorien.map((c) => `<li>${catTag(c)}</li>`).join('')}</ul>
        ${MODE === 'preview' ? `<p><a class="wl-btn wl-btn--secondary" href="/wirkungslexikon/redaktion/?slug=${esc(e.slug)}">Karte redaktionell bearbeiten</a></p>` : ''}
        <nav class="wl-audience-switch" aria-label="Lesezugang"><a href="#wirkkette">Verständlich erklärt</a><a href="#original">Journalistische Recherche</a><a href="#quellen">Wissenschaft und Analyse</a></nav>
        <div class="wl-actions">
          <button class="wl-btn" type="button" data-share="${esc(e.slug)}">${ICON.share}Karte teilen</button>
          <button class="wl-btn wl-btn--secondary" type="button" data-cite="${esc(e.slug)}">${ICON.cite}Zitieren</button>
          <button class="wl-btn wl-btn--secondary" type="button" data-print>${ICON.print}Drucken/PDF</button>
          <button class="wl-btn wl-btn--ghost" type="button" data-report="${esc(e.slug)}">${ICON.flag}${esc(UI.report_problem || 'Fehler melden')}</button>
        </div>
        ${MODE === 'preview' && e.pruefstatus !== 'freigegeben' ? `<div class="wl-flag-panel" style="margin-top:var(--wl-s5)"><strong>Interne Vorschau · ${esc(STATUS[e.pruefstatus])}</strong><p>${esc(e.redaktioneller_vorbehalt)} Diese Seite ist nicht öffentlich, nicht indexiert und nicht teilbar.</p></div>` : ''}
      </header>
      <div class="wl-card-layout">
        <nav class="wl-toc wl-toc--bar" aria-label="Abschnitte dieser Karte"><ol>${toc}</ol></nav>
        <div class="wl-card-main">
          <ol class="wl-path">${nodes.map((n, i) => `<li class="wl-node" data-ev="${n.ev}" id="${n.id}" aria-labelledby="${n.id}-h">
            <span class="wl-node__marker" aria-hidden="true"></span>
            <div class="wl-node__head"><div><span class="wl-node__step">${i + 1} · ${esc(n.step)}</span><h2 class="wl-node__title" id="${n.id}-h">${esc(n.title)}</h2></div></div>
            ${n.body}</li>`).join('')}</ol>
          ${relHtml}
          <div class="wl-report" style="margin-top:var(--wl-s6)"><div><h2 class="wl-h3">Quelle fehlt oder ist ungenau?</h2><p>Hinweise auf Quellen, Korrekturen und neue Studien fließen in die nächste Version dieser Karte ein.</p></div>
            <button class="wl-btn wl-btn--secondary" type="button" data-report="${esc(e.slug)}">${ICON.flag}${esc(UI.report_problem || 'Fehler melden')}</button></div>
        </div>
        <aside class="wl-card-aside" aria-label="Kartenübersicht">
          ${glance}
          <nav class="wl-toc wl-toc--side" aria-label="Abschnitte dieser Karte"><span class="wl-label" style="margin-bottom:.5rem">Wirkungspfad</span><ol>${toc}</ol></nav>
          ${legendHtml(false)}
        </aside>
      </div>
    </div>`;
    return { html, title: e.begriff + ' – Wirkungskarte' };
  }

  /* ------------------------------------------------------------------------
     10. WEITERE SEITEN
     ------------------------------------------------------------------------ */
  function pageHead(eyebrow, title, lead, crumbs) {
    return `<nav class="wl-breadcrumb" aria-label="Brotkrumen"><ol><li><a href="#/">Start</a></li><li><a href="#/">Wirkungslexikon</a></li>${(crumbs || []).map((c) => `<li><a href="${c[1]}">${esc(c[0])}</a></li>`).join('')}<li aria-current="page">${esc(title)}</li></ol></nav>
      <header class="wl-page-head"><span class="wl-eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1>${lead ? `<p class="wl-lead">${lead}</p>` : ''}</header>`;
  }
  const rewriteLinks = (html) => String(html || '')
    .replace(/href="\/wirkungslexikon\/methodik\/"/g, 'href="#/methodik"')
    .replace(/href="\/wirkungslexikon\/institut-fuer-remigration\/"/g, 'href="#/bereich/ifr"')
    .replace(/href="\/wirkungslexikon\/afd\/"/g, 'href="#/bereich/afd"')
    .replace(/href="(https?:[^"]+)"/g, 'href="$1" target="_blank" rel="noopener noreferrer"');
  const stripH1 = (html) => String(html || '').replace(/<h1>[\s\S]*?<\/h1>/, '');

  function viewCategories() {
    const vis = visibleEntries();
    const items = CATS.map((c) => {
      const list = vis.filter((e) => e.kategorien.includes(c.name)).sort((a, b) => sortKey(a.begriff).localeCompare(sortKey(b.begriff), 'de'));
      const restrictive = /enger Begriff/.test(c.name);
      return `<li><article class="wl-cat${restrictive ? ' wl-cat--restrictive' : ''}">
        <div class="wl-cat__head"><h2 class="wl-cat__title"><a href="${href('/kategorie/' + c.slug)}">${esc(c.name)}</a></h2><span class="wl-cat__count">${plural(list.length, 'Karte', 'Karten')}</span></div>
        <p class="wl-cat__def">${esc(c.definition)}</p>
        <p class="wl-cat__examples">${list.length ? 'Beispiele: ' + list.slice(0, 3).map((e) => `<a href="${cardHref(e)}">${termHtml(e.begriff)}</a>`).join(' · ') : restrictive ? 'Derzeit keiner Karte zugeordnet – wird restriktiv vergeben.' : 'Derzeit keiner Karte zugeordnet.'}</p>
      </article></li>`;
    }).join('');
    return `<div class="wl-container">${pageHead('Raster', 'Kategorien', 'Ein erklärtes Raster sprachlicher Mechanismen – kein moralisches Gütesiegel. Eine Karte kann mehrere Kategorien haben; jede Zuordnung ist begründet. Nicht mit moralischer oder juristischer Schuld gleichsetzen.')}
      <ul class="wl-cat-grid">${items}</ul></div>`;
  }

  function viewCategory(slug) {
    const c = catBySlug[slug];
    if (!c) return { title: 'Nicht gefunden', html: viewNotFound() };
    const list = visibleEntries().filter((e) => e.kategorien.includes(c.name)).sort((a, b) => sortKey(a.begriff).localeCompare(sortKey(b.begriff), 'de'));
    return { title: c.name, html: `<div class="wl-container">${pageHead('Kategorie', c.name, esc(c.definition), [['Kategorien', '#/kategorien']])}
      <h2 class="wl-h3">${plural(list.length, 'Wirkungskarte', 'Wirkungskarten')} in dieser Kategorie</h2>
      <p class="wl-small" style="margin-bottom:var(--wl-s4)"><a href="${href('/', new URLSearchParams({ kat: c.slug }))}#karten">Im Explorer mit weiteren Filtern kombinieren</a></p>
      ${list.length ? `<ul class="wl-results">${list.map((e) => tileHtml(e)).join('')}</ul>` : `<div class="wl-empty"><strong>Keine Karte</strong>Dieser Kategorie ist derzeit keine ${MODE === 'public' ? 'freigegebene ' : ''}Karte zugeordnet.</div>`}</div>` };
  }

  function viewArea(key, params) {
    const a = areaByKey[key];
    if (!a || (a.internal && MODE !== 'preview')) return { title: 'Nicht gefunden', html: viewNotFound() };
    const list = visibleEntries().filter((e) => korpusOf(e).area === key).sort((x, y) => sortKey(x.begriff).localeCompare(sortKey(y.begriff), 'de'));
    const korpora = Object.entries(KORPUS).filter(([, k]) => k.area === key);
    const groups = korpora.map(([full, k]) => {
      const sub = list.filter((e) => e.korpus === full);
      return sub.length ? `<section class="wl-section-space" style="padding-top:var(--wl-s4)" aria-labelledby="g-${k.key}">
        <h2 class="wl-h2" id="g-${k.key}">${esc(full)} <span class="wl-small">(${sub.length})</span></h2>
        ${k.sekundaer ? `<p class="wl-flag-panel" style="margin-bottom:var(--wl-s4)">Bisher nur sekundär dokumentiert (Mimikama-Analyse mit Originalseitenausschnitten). Originalpapier vor Freigabe beschaffen.</p>` : ''}
        <ul class="wl-results">${sub.map((e) => tileHtml(e)).join('')}</ul></section>` : '';
    }).join('');
    const text = a.text ? rewriteLinks(stripH1(TEXTE[a.text])) : '';
    return { title: a.title, html: `<div class="wl-container">${pageHead(a.sub, a.title, esc(a.note))}
      <div class="wl-two-col"><div class="wl-prose">${text || `<p>${esc(a.note)}</p>`}</div>
        <aside class="wl-stack"><p class="wl-guard">${esc(a.guard)}</p>${legendHtml(true)}</aside></div>
      ${groups || `<div class="wl-empty" style="margin-top:var(--wl-s6)"><strong>Noch keine Karte</strong>In diesem Bereich ist derzeit keine ${MODE === 'public' ? 'freigegebene ' : ''}Karte vorhanden.</div>`}</div>` };
  }

  function viewMethodik() {
    if(TEXTE.methodik_v9)return `<div class="wl-container wl-prose wl-section-space">${TEXTE.methodik_v9}</div>`;
    const ladderLg = `<ol class="wl-ladder-lg">${LADDER.map((r) => `<li><b>${r.l}</b><div><strong>${r.name.replace('­', '')}</strong><span class="wl-small">${esc(r.belegt)}</span></div></li>`).join('')}</ol>`;
    const statusList = Object.entries(STATUS).map(([k, v]) => `<li>${k === 'freigegeben' ? `<span class="wl-flag wl-flag--published">${esc(v)}</span>` : `<span class="wl-flag">${esc(v)}</span>`} <span class="wl-small">${k === 'freigegeben' ? 'Einzige öffentlich sichtbare Stufe.' : 'Nur in der geschützten Redaktionsvorschau sichtbar.'}</span></li>`).join('');
    return `<div class="wl-container">${pageHead('Methodik', 'Wie das Wirkungslexikon arbeitet', 'Wirkstoff ≠ beobachtete Wirkung. Bedeutungsverschiebung ≠ nachgewiesene Massensuggestion.')}
      <div class="wl-two-col">
        <div class="wl-prose">${rewriteLinks(stripH1(TEXTE.methodik_fuer_leser))}
          <h2 id="leiter">Evidenzleiter A–F</h2><p>Von unten nach oben; keine numerische Manipulationsampel.</p>${ladderLg}
          <h2 id="aussagearten">Vier Aussagearten auf jeder Karte</h2>${legendHtml(true)}
          <h2 id="status">Review-Status</h2><ul style="list-style:none;padding:0;display:grid;gap:.6rem">${statusList}</ul>
          <h2 id="revision">Revisionshistorie</h2><p>Jede Karte trägt Version und Prüfdatum. Korrekturen werden mit Datum, Version und Bearbeitung sichtbar dokumentiert; frühere Fassungen bleiben nachvollziehbar.</p>
          <details style="margin-top:var(--wl-s6)"><summary class="wl-btn wl-btn--secondary">Vollständige wissenschaftliche Methodik v3.0 anzeigen</summary><div class="wl-prose" style="margin-top:var(--wl-s4)">${rewriteLinks(TEXTE.methodik)}</div></details>
        </div>
        <aside class="wl-stack"><nav class="wl-toc" aria-label="Abschnitte"><span class="wl-label">Auf dieser Seite</span><ol>
          <li><a href="${href('/methodik', new URLSearchParams({ anker: 'leiter' }))}">Evidenzleiter</a></li><li><a href="${href('/methodik', new URLSearchParams({ anker: 'aussagearten' }))}">Aussagearten</a></li>
          <li><a href="${href('/methodik', new URLSearchParams({ anker: 'status' }))}">Review-Status</a></li><li><a href="${href('/methodik', new URLSearchParams({ anker: 'revision' }))}">Revision</a></li></ol></nav></aside>
      </div></div>`;
  }

  function viewRedaktionen() {
    if(TEXTE.journalismus_v9)return `<div class="wl-container wl-prose wl-section-space">${TEXTE.journalismus_v9}</div>`;
    const text = TEXTE.fuer_redaktionen || '';
    const listItems = tag => [...(text.match(new RegExp('<' + tag + '>[\\s\\S]*?</' + tag + '>')) || [''])[0].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
    const qs = listItems('ol');
    const examples = listItems('ul');
    const paras = [...text.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
    const saved = store.get('checklist', []);
    const exampleCards = { 'Flüchtlingswelle': 'fluchtlingswelle', 'Genderzwang': 'genderzwang', 'Woke-Ideologie': 'woke', 'Stadtbildproblem': 'stadtbild', 'Remigration': 'remigration', 'Regenbogenflagge als Ideologie': 'regenbogenflagge' };
    const exHtml = examples.map((x, i) => {
      const term = (x.match(/„([^“]+)“/) || [])[1] || '';
      const q = exampleCards[term];
      return `<li class="wl-alt"><div><span class="wl-alt__label">Statt ${esc(term ? '„' + term + '“' : 'Schlagwort')}</span><p class="wl-alt__text" id="ex-${i}">${x.replace(/^„[^“]+“\s*→\s*/, '')}</p>
        ${q ? `<p class="wl-small" style="margin-top:.35rem"><a href="${href('/', new URLSearchParams({ q }))}#karten">Passende Wirkungskarten ansehen</a></p>` : ''}</div>
        <button class="wl-btn wl-btn--secondary wl-btn--sm" type="button" data-copy="#ex-${i}">${ICON.copy}Kopieren</button></li>`;
    }).join('');
    return `<div class="wl-container">${pageHead('Praxisleitfaden', 'Für Redaktionen', paras[0] || '')}
      <div class="wl-two-col"><div class="wl-stack" style="max-width:var(--wl-measure)">
        <h2 class="wl-h2">Acht Prüffragen</h2>
        <div class="wl-progress" aria-live="polite"><span data-progress-text>${saved.length} von ${qs.length} geprüft</span><span class="wl-progress__bar"><span style="width:${(saved.length / qs.length) * 100}%"></span></span></div>
        <ol class="wl-checklist" data-checklist>${qs.map((q, i) => `<li><label><input type="checkbox" value="${i}"${saved.includes(i) ? ' checked' : ''}><span>${q}</span></label></li>`).join('')}</ol>
        <p class="wl-small">Ihre Häkchen bleiben nur in diesem Browser gespeichert. <button class="wl-btn wl-btn--ghost wl-btn--sm" type="button" data-reset-checklist>Zurücksetzen</button></p>
        <h2 class="wl-h2" style="margin-top:var(--wl-s7)">Zitat vs. redaktionelle Sachbeschreibung</h2>
        <div class="wl-quote-rule"><div><strong>Zitat</strong>Politische Schlagworte sind zitierfähig: Wortlaut, Urheber und Kontext korrekt wiedergeben.</div><div><strong>Sachbeschreibung</strong>Nicht immer als eigene Sachbeschreibung geeignet: überprüfbaren Sachverhalt benennen.</div></div>
        <h2 class="wl-h2" style="margin-top:var(--wl-s7)">Beispiele für Sachalternativen</h2>
        <ul class="wl-alts">${exHtml}</ul>
        <p class="wl-flag-panel" style="background:#fff;border-color:var(--wl-line);border-left-color:var(--wl-tool);color:var(--wl-text)">${paras[paras.length - 2] || ''}</p>
      </div>
      <aside class="wl-stack"><div class="wl-glance"><span class="wl-label">Kurz gesagt</span><p style="margin-top:.4rem">Keine Liste verbotener Wörter und keine automatische Einstufung von Personen – ein Werkzeug für Quellenkritik.</p></div>${legendHtml(true)}</aside></div></div>`;
  }

  function viewNotFound() {
    return `<div class="wl-container wl-section-space"><div class="wl-empty"><strong>Seite nicht gefunden</strong><a href="#/">Zur Übersicht des Wirkungslexikons</a></div></div>`;
  }

  /* ------------------------------------------------------------------------
     11. VORSCHAU-BANNER
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     12. INTERAKTIONEN
     ------------------------------------------------------------------------ */
  function hydrate(root) {
    $$('form[data-search]', root).forEach(bindSearch);
    const ff = $('form[data-facets]', root);
    if (ff) ff.addEventListener('change', () => {
      const { params } = parseHash();
      const p = new URLSearchParams();
      if (params.get('q')) p.set('q', params.get('q'));
      if (params.get('sort')) p.set('sort', params.get('sort'));
      if (params.get('buchstabe')) p.set('buchstabe', params.get('buchstabe'));
      if (params.get('ansicht')) p.set('ansicht', params.get('ansicht'));
      new FormData(ff).forEach((v, k) => p.append(k, v));
      const keepOpen = $('#facets') && $('#facets').classList.contains('is-open');
      navigateKeepScroll(href('/', p), keepOpen);
    });
    const sortSel = $('[data-sort]', root);
    if (sortSel) sortSel.addEventListener('change', () => { const { params } = parseHash(); params.set('sort', sortSel.value); navigateKeepScroll(href('/', params)); });
    $$('[data-more], .wl-az a, .wl-active-filters a, [data-view]', root).forEach((a) => a.addEventListener('click', (ev2) => { ev2.preventDefault(); navigateKeepScroll(a.getAttribute('href')); }));
    $$('[data-open-facets]', root).forEach((b) => b.addEventListener('click', () => openFacets(true)));
    $$('[data-close-facets]', root).forEach((b) => b.addEventListener('click', () => openFacets(false)));
    $$('[data-copy]', root).forEach((b) => b.addEventListener('click', () => copyText($(b.dataset.copy).textContent.trim(), 'Alternative kopiert')));
    $$('[data-share]', root).forEach((b) => b.addEventListener('click', () => openShare(bySlug[b.dataset.share], b)));
    $$('[data-cite]', root).forEach((b) => b.addEventListener('click', () => openCite(bySlug[b.dataset.cite], b)));
    $$('[data-report]', root).forEach((b) => b.addEventListener('click', () => openReport(bySlug[b.dataset.report], b)));
    $$('[data-print]', root).forEach((b) => b.addEventListener('click', () => window.print()));
    const cl = $('[data-checklist]', root);
    if (cl) {
      const saved = store.get('checklist', []);
      $$('input', cl).forEach(i => { i.checked = saved.includes(+i.value); });
      const upd = () => {
        const vals = $$('input:checked', cl).map((i) => +i.value);
        store.set('checklist', vals);
        $('[data-progress-text]', root).textContent = `${vals.length} von ${$$('input', cl).length} geprüft`;
        $('.wl-progress__bar span', root).style.width = (vals.length / $$('input', cl).length) * 100 + '%';
      };
      upd();
      cl.addEventListener('change', upd);
      const rs = $('[data-reset-checklist]', root);
      if (rs) rs.addEventListener('click', () => { $$('input', cl).forEach((i) => { i.checked = false; }); upd(); });
    }
    scrollSpy(root);
  }

  let FACETS_OPEN = false;      /* mobile Filter-Schublade offen? (überlebt Neuaufbau) */
  let FACET_OPEN_KEYS = null;   /* aufgeklappte Facettengruppen (überleben Neuaufbau) */
  function navigateKeepScroll(h, keepFacetsOpen) {
    const y = window.scrollY;
    const scroller = $('.wl-facets__scroll'); const side = $('.wl-facets');
    const fy = scroller ? scroller.scrollTop : 0; const sy = side ? side.scrollTop : 0;
    if ($('details.wl-facet')) FACET_OPEN_KEYS = new Set($$('details.wl-facet[open], details.wl-facet__more[open]').map((d) => d.dataset.key));
    FACETS_OPEN = !!keepFacetsOpen;
    const activeId = document.activeElement && document.activeElement.id;
    const activeVal = document.activeElement && document.activeElement.value;
    lastPath = (h.replace(/^#/, '').split('?')[0] || '/');
    history.pushState(null, '', h);
    route();
    window.scrollTo({ top: y, behavior: 'instant' });
    if ($('.wl-facets__scroll')) $('.wl-facets__scroll').scrollTop = fy;
    if ($('.wl-facets')) $('.wl-facets').scrollTop = sy;
    if (keepFacetsOpen) { openFacets(true, true); requestAnimationFrame(() => { const f = $('#facets'); if (f) f.style.transition = ''; }); }
    if (activeId && document.getElementById(activeId)) document.getElementById(activeId).focus({ preventScroll: true });
    else if (activeVal) { const cb = $(`#facets input[value="${CSS.escape(activeVal)}"]`); if (cb) cb.focus({ preventScroll: true }); }
  }

  function openFacets(open, silent) {
    const f = $('#facets'); const s = $('.wl-scrim'); const t = $('[data-open-facets]');
    if (!f) return;
    FACETS_OPEN = open;
    f.classList.toggle('is-open', open);
    if (s) s.hidden = !open;
    if (t) t.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open && matchMedia('(max-width:1000px)').matches ? 'hidden' : '';
    const mobile=matchMedia('(max-width:1000px)').matches;
    if(mobile){ f.setAttribute('role',open?'dialog':'region');if(open)f.setAttribute('aria-modal','true');else f.removeAttribute('aria-modal'); }
    if (open && !silent) { const first = $('input, summary', f); if (first) first.focus(); }
    if (!open && t && !silent) t.focus();
  }
  if (typeof document !== 'undefined') document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#facets.is-open')) openFacets(false);
    if(e.key==='Tab' && matchMedia('(max-width:1000px)').matches && $('#facets.is-open')){const f=$('#facets');const all=$$('button,a,input,summary,select',f).filter(el=>el.getClientRects().length&&!el.disabled);const first=all[0],last=all.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}} });

  /* Suche mit Vorschlägen (Combobox) */
  let suggestState = null;
  function bindSearch(form) {
    const input = $('input', form); const list = $('.wl-suggest', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const sel = suggestState && suggestState.input === input && suggestState.items[suggestState.idx];
      if (sel) { closeSuggest(); location.href = sel.href; return; }
      const p = new URLSearchParams(); if (input.value.trim()) p.set('q', input.value.trim());
      closeSuggest();
      if (document.getElementById('wl-explorer')) navigateKeepScroll(href('/', p)); else location.href = href('/', p) + '#karten';
      setTimeout(() => {
        const heading = $('#explorer-title');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
        scrollToEl($('#karten'));
      }, 0);
    });
    input.addEventListener('input', () => showSuggest(input, list));
    input.addEventListener('keydown', (e) => {
      if (!suggestState || suggestState.input !== input) return;
      const n = suggestState.items.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); suggestState.idx = (suggestState.idx + 1) % n; markSuggest(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); suggestState.idx = (suggestState.idx - 1 + n) % n; markSuggest(); }
      else if (e.key === 'Escape') { closeSuggest(); }
    });
    input.addEventListener('blur', () => setTimeout(closeSuggest, 150));
  }
  function showSuggest(input, list) {
    const tokens = norm(input.value).split(/[^a-z0-9-]+/).filter(Boolean);
    if (!tokens.length) { closeSuggest(); return; }
    const vis = new Set(visibleEntries());
    const terms = INDEX.filter((ix) => vis.has(ix.e)).map((ix) => ({ ix, s: searchScore(ix, tokens) })).filter((x) => x.s >= 8)
      .sort((a, b) => b.s - a.s || sortKey(a.ix.e.begriff).localeCompare(sortKey(b.ix.e.begriff), 'de')).slice(0, 6);
    const t0 = tokens.join(' ');
    const cats = CATS.filter((c) => norm(c.name).includes(t0)).slice(0, 3);
    const mechs = MECHS.filter((m) => norm(m.name).includes(t0)).slice(0, 3);
    const hl = (s) => { const i = norm(s).indexOf(tokens[0]); return i < 0 || norm(s).length !== s.length ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + tokens[0].length)) + '</mark>' + esc(s.slice(i + tokens[0].length)); };
    const items = [];
    let html = '';
    if (terms.length) { html += `<li class="wl-suggest__group" role="presentation">Wirkungskarten</li>`; terms.forEach(({ ix }) => { items.push({ href: cardHref(ix.e) }); html += `<li class="wl-suggest__opt" role="option" id="opt-${items.length}" data-i="${items.length - 1}"><span>${hl(ix.e.begriff)}</span><small>${esc(korpusOf(ix.e).short)}</small></li>`; }); }
    if (cats.length) { html += `<li class="wl-suggest__group" role="presentation">Kategorien</li>`; cats.forEach((c) => { items.push({ href: href('/kategorie/' + c.slug) }); html += `<li class="wl-suggest__opt" role="option" id="opt-${items.length}" data-i="${items.length - 1}"><span>${hl(c.name)}</span><small>Kategorie</small></li>`; }); }
    if (mechs.length) { html += `<li class="wl-suggest__group" role="presentation">Mechanismen</li>`; mechs.forEach((m) => { items.push({ href: href('/', new URLSearchParams({ mech: m.slug })) }); html += `<li class="wl-suggest__opt" role="option" id="opt-${items.length}" data-i="${items.length - 1}"><span>${hl(m.name)}</span><small>${plural(m.count, 'Karte', 'Karten')}</small></li>`; }); }
    if (!items.length) { closeSuggest(); return; }
    list.innerHTML = html; list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    suggestState = { input, list, items, idx: -1 };
    $$('.wl-suggest__opt', list).forEach((li) => li.addEventListener('mousedown', (e) => { e.preventDefault(); const it = items[+li.dataset.i]; closeSuggest(); location.href = it.href; }));
  }
  function markSuggest() {
    const { list, idx, input } = suggestState;
    $$('.wl-suggest__opt', list).forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i === idx)));
    const cur = $(`.wl-suggest__opt[data-i="${idx}"]`, list);
    if (cur) { input.setAttribute('aria-activedescendant', cur.id); const lt = cur.offsetTop, lb = lt + cur.offsetHeight; if (lt < list.scrollTop) list.scrollTop = lt; else if (lb > list.scrollTop + list.clientHeight) list.scrollTop = lb - list.clientHeight; }
  }
  function closeSuggest() {
    if (!suggestState) return;
    suggestState.list.hidden = true; suggestState.list.innerHTML = '';
    suggestState.input.setAttribute('aria-expanded', 'false'); suggestState.input.removeAttribute('aria-activedescendant');
    suggestState = null;
  }

  /* Kopieren + Toast */
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  }
  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch (_) { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { if (!document.execCommand('copy')) { toast('Bitte Text markieren und manuell kopieren.'); ta.remove(); return; } } catch (__) { toast('Bitte Text manuell kopieren.'); ta.remove(); return; } ta.remove(); }
    toast(msg || 'Kopiert');
  }

  /* Scrollspy für den Wirkungspfad */
  let spy;
  function scrollSpy(root) {
    if (spy) spy.disconnect();
    const links = $$('[data-toc]', root);
    if (!links.length || !('IntersectionObserver' in window)) return;
    spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.setAttribute('aria-current', String(a.dataset.toc === en.target.id)));
        const bar = $('.wl-toc--bar ol', root); const cur = bar && $(`[data-toc="${en.target.id}"]`, bar);
        if (bar && cur) bar.scrollLeft = cur.parentElement.offsetLeft - 16; /* aktiven Chip sichtbar halten, ohne vertikal zu springen */
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    links.forEach((a) => { const t = document.getElementById(a.dataset.toc); if (t) spy.observe(t); });
    links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.dataset.toc); if (t) { scrollToEl(t, true); $('h2', t).setAttribute('tabindex', '-1'); $('h2', t).focus({ preventScroll: true }); } }));
  }

  /* Dialog-Helfer: natives <dialog>, Fokus zurück an Auslöser */
  function dialog(id, title, body, opener, size) {
    let d = document.getElementById(id);
    if (d) d.remove();
    d = document.createElement('dialog');
    d.id = id; d.className = 'wl-dialog' + (size === 'sm' ? ' wl-dialog--sm' : '');
    d.setAttribute('aria-labelledby', id + '-t');
    d.innerHTML = `<div class="wl-dialog__head"><h2 id="${id}-t">${esc(title)}</h2><button class="wl-btn wl-btn--ghost wl-dialog__close" type="button" aria-label="Dialog schließen">${ICON.close}</button></div><div class="wl-dialog__body">${body}</div>`;
    document.body.appendChild(d);
    $('.wl-dialog__close', d).addEventListener('click', () => d.close());
    d.addEventListener('close', () => { if (opener) opener.focus(); d.remove(); });
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.showModal();
    return d;
  }

  /* Zitieren */
  function openCite(e, opener) {
    const y = (e.geprueft_am || DATA.stand).slice(0, 4);
    const date = fmtDate(e.geprueft_am);
    const plainTerm = e.begriff.replace(/^„|“$/g, '');
    const apa = `Weber, N. (${y}). „${plainTerm}“. In Wirkungslexikon politischer Sprache (Version ${e.version}, Stand ${date}). Wirkungsökonomie. ${prodUrl(e)}`;
    const short = `Wirkungslexikon politischer Sprache: „${plainTerm}“ (Wirkungsökonomie, Stand ${date}), ${prodUrl(e)}`;
    const bib = `@misc{wirkungslexikon-${e.slug},\n  author = {Weber, Natalie},\n  title = {${plainTerm}},\n  howpublished = {Wirkungslexikon politischer Sprache, Wirkungsökonomie},\n  year = {${y}},\n  note = {Version ${e.version}, Stand ${date}},\n  url = {${prodUrl(e)}}\n}`;
    const d = dialog('dlg-cite', 'Karte zitieren', `
      ${MODE === 'preview' ? `<p class="wl-flag-panel">Entwurf: Zitierfähig erst nach Freigabe. URL ist die geplante öffentliche Adresse.</p>` : ''}
      <div class="wl-field"><span class="wl-label">Wissenschaftlich</span><div class="wl-codebox" id="c-apa">${esc(apa)}</div><button class="wl-btn wl-btn--secondary wl-btn--sm" type="button" data-c="#c-apa">${ICON.copy}Kopieren</button></div>
      <div class="wl-field"><span class="wl-label">Kurzform für Artikel</span><div class="wl-codebox" id="c-short">${esc(short)}</div><button class="wl-btn wl-btn--secondary wl-btn--sm" type="button" data-c="#c-short">${ICON.copy}Kopieren</button></div>
      <div class="wl-field"><span class="wl-label">BibTeX</span><pre class="wl-codebox" id="c-bib" style="white-space:pre-wrap;margin:0;font-size:.85rem">${esc(bib)}</pre><button class="wl-btn wl-btn--secondary wl-btn--sm" type="button" data-c="#c-bib">${ICON.copy}Kopieren</button></div>`, opener, 'sm');
    $$('[data-c]', d).forEach((b) => b.addEventListener('click', () => copyText($(b.dataset.c, d).textContent, 'Zitation kopiert')));
  }

  /* Fehler melden */
  function openReport(e, opener) {
    const d = dialog('dlg-report', UI.report_problem || 'Fehler melden', `
      <form class="wl-stack" novalidate data-report-form>
        <p>Karte: <strong>${termHtml(e.begriff)}</strong> <span class="wl-small">(${esc(e.slug)}, Version ${esc(e.version)})</span></p>
        <div class="wl-field"><label for="r-art">Art des Hinweises</label>
          <select id="r-art" name="art" required><option value="">Bitte wählen</option><option>Quelle fehlt oder Link defekt</option><option>Zitat/Wortlaut ungenau</option><option>Kontext oder Gegenposition fehlt</option><option>Neue Studie oder neuer Beleg</option><option>Kategorie/Mechanismus unpassend</option><option>Sonstiges</option></select></div>
        <div class="wl-field"><label for="r-text">Beschreibung</label><textarea id="r-text" name="text" required aria-describedby="r-text-h"></textarea><small id="r-text-h">Was ist ungenau, und wie lautet es richtig?</small></div>
        <div class="wl-field"><label for="r-url">Beleg-Link (optional)</label><input id="r-url" name="url" type="url" inputmode="url" placeholder="https://"></div>
        <div class="wl-field"><label for="r-mail">E-Mail für Rückfragen (optional)</label><input id="r-mail" name="mail" type="email" autocomplete="email"><small>Nur für Rückfragen zu diesem Hinweis, keine Weitergabe.</small></div>
        <p class="wl-small" role="alert" data-err hidden style="color:#8E2F22;font-weight:700">Bitte Art und Beschreibung angeben.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="wl-btn" type="submit">${MODE === 'preview' ? 'Hinweis speichern' : 'E-Mail vorbereiten'}</button><button class="wl-btn wl-btn--secondary" type="button" data-cancel>Abbrechen</button></div>
        <p class="wl-small">${MODE === 'preview' ? 'Der Hinweis wird in der geschützten Redaktionsablage gespeichert. E-Mail ist freiwillig und dient nur Rückfragen.' : 'Sie können den Hinweis als E-Mail an impact@wirkungsoekonomie.org vorbereiten. Erst Ihr E-Mail-Programm versendet ihn nach Ihrer Bestätigung. Das Lexikon überträgt dieses Formular nicht.'} Beleg-Link und Beschreibung sollten keine unnötigen personenbezogenen Daten enthalten.</p>
      </form>`, opener, 'sm');
    $('[data-cancel]', d).addEventListener('click', () => d.close());
    $('[data-report-form]', d).addEventListener('submit', async (ev2) => {
      ev2.preventDefault();
      const f = ev2.target;
      if (!f.elements.art.value || !f.elements.text.value.trim()) { $('[data-err]', d).hidden = false; (f.elements.art.value ? f.elements.text : f.elements.art).focus(); return; }
      if (MODE !== 'preview') {
        const v = Object.fromEntries(new FormData(f));
        const text = `Wirkungskarte: ${e.begriff}\n${prodUrl(e)}\nVersion: ${e.version}\n\nArt: ${v.art}\n${v.text}\n\nBeleg: ${v.url || '-'}\nRückfrageadresse: ${v.mail || '-'}`;
        const a = document.createElement('a'); a.href = `mailto:impact@wirkungsoekonomie.org?subject=${encodeURIComponent('Quellenhinweis: ' + e.begriff)}&body=${encodeURIComponent(text)}`; a.click();
        const note = $('[data-err]', d); note.hidden = false; note.style.color = 'var(--wl-muted)'; note.textContent = 'Der E-Mail-Entwurf wurde geöffnet. Falls kein E-Mail-Programm eingerichtet ist, kopieren Sie Ihren Hinweis und senden Sie ihn an impact@wirkungsoekonomie.org.';
        return;
      }
      try {
        const response = await fetch('/api/wirkungslexikon/reports', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({slug:e.slug, version:e.version, ...Object.fromEntries(new FormData(f))}) });
        if (!response.ok) throw new Error('Hinweis konnte nicht gespeichert werden. Bitte später erneut versuchen.');
      } catch (error) { const el = $('[data-err]', d); el.textContent = error.message; el.hidden = false; return; }
      $('.wl-dialog__body', d).innerHTML = `<div class="wl-claim wl-claim--tool" role="status">${ev('tool', 'Danke')}<p>Ihr Hinweis wurde in der geschützten Redaktionsablage gespeichert. Korrekturen erscheinen mit Datum im Änderungsverlauf der Karte.</p></div><button class="wl-btn" type="button" data-ok>Schließen</button>`;
      $('[data-ok]', d).addEventListener('click', () => d.close());
      $('[data-ok]', d).focus();
    });
  }

  /* ------------------------------------------------------------------------
     13. TEILEN – Social-Card als Canvas (PNG) + Alt-Text + Kanäle
     ------------------------------------------------------------------------ */
  const FORMATS = { og: { w: 1200, h: 630, label: 'Link-Vorschau 1200×630' }, portrait: { w: 1080, h: 1350, label: 'Hochformat 1080×1350' }, square: { w: 1080, h: 1080, label: 'Quadrat 1080×1080' } };

  function shareText(e) { return `„${e.begriff}“ – Wirkungspotenzial: ${e.wirkungspotenzial.moegliche_veraenderung}`; }
  function altText(e) { return `Wirkungskarte „${e.begriff}“ (${korpusOf(e).short}). Wirkungspotenzial: ${e.wirkungspotenzial.moegliche_veraenderung}`; }
  function openShare(e, opener) {
    const draft = MODE === 'preview' || e.pruefstatus !== 'freigegeben';
    const url = prodUrl(e), txt = shareText(e);
    const channels = [['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`], ['Bluesky', `https://bsky.app/intent/compose?text=${encodeURIComponent(txt + ' ' + url)}`], ['X', `https://x.com/intent/post?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(url)}`], ['E-Mail', `mailto:?subject=${encodeURIComponent('Wirkungskarte: ' + e.begriff)}&body=${encodeURIComponent(txt + '\n\n' + url)}`]];
    const imageUrl = format => (config.mount || '') + '/wirkungslexikon/' + e.slug + '/' + format + '.png';
    const d = dialog('dlg-share', 'Wirkungskarte teilen', `
      ${draft ? '<div class="wl-flag-panel"><strong>Geschützte Vorschau</strong><p>Das Bild trägt die Entwurfsmarke und dient der internen Prüfung. Öffentliche Kanäle sind hier gesperrt.</p></div>' : ''}
      <div class="wl-share"><div class="wl-share__preview"><img data-share-image src="${imageUrl('og')}" alt="${esc(altText(e))}" width="1200" height="630"></div><div class="wl-stack">
      <div class="wl-field"><span class="wl-label">Format</span><div class="wl-segmented" role="group" aria-label="Bildformat">${Object.entries(FORMATS).map(([k,f],i)=>`<button type="button" data-fmt="${k}" aria-pressed="${i===0}">${f.label}</button>`).join('')}</div></div>
      <a class="wl-btn" data-dl href="${imageUrl('og')}" download="wirkungskarte-${esc(e.slug)}-og${draft?'-ENTWURF':''}.png">${ICON.download}Bild herunterladen (PNG)</a>
      <div class="wl-field"><span class="wl-label">Alternativtext fürs Bild</span><p class="wl-codebox" id="share-alt">${esc(altText(e))}</p><button class="wl-btn wl-btn--secondary wl-btn--sm" data-copy-alt type="button">${ICON.copy}Alt-Text kopieren</button></div>
      <div class="wl-field"><span class="wl-label">Link</span><p class="wl-codebox" id="share-url">${esc(url)}</p><button class="wl-btn wl-btn--secondary wl-btn--sm" data-copy-url type="button"${draft?' disabled':''}>${ICON.copy}Link kopieren</button></div>
      <div class="wl-field"><span class="wl-label">Kanäle</span><div style="display:flex;flex-wrap:wrap;gap:.5rem">${channels.map(([label,u])=>draft?`<span class="wl-btn wl-btn--secondary wl-btn--sm" aria-disabled="true">${label}</span>`:`<a class="wl-btn wl-btn--secondary wl-btn--sm" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}</a>`).join('')}</div></div>
      <small class="wl-small">Direkte Links ohne eingebettete Tracking-Skripte.</small></div></div>`, opener);
    $$('[data-fmt]',d).forEach(b=>b.addEventListener('click',()=>{const fmt=b.dataset.fmt;const f=FORMATS[fmt];const img=$('[data-share-image]',d);img.src=imageUrl(fmt);img.width=f.w;img.height=f.h;const a=$('[data-dl]',d);a.href=imageUrl(fmt);a.download=`wirkungskarte-${e.slug}-${fmt}${draft?'-ENTWURF':''}.png`;$$('[data-fmt]',d).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
    $('[data-copy-alt]',d).addEventListener('click',()=>copyText(altText(e),'Alt-Text kopiert'));
    if(!draft)$('[data-copy-url]',d).addEventListener('click',()=>copyText(url,'Link kopiert'));
  }

  /* ------------------------------------------------------------------------
     14. START
     ------------------------------------------------------------------------ */
  /* Höhe von Site-Header + Lexikon-Subnav messen → Sticky-Offsets & scroll-margin (WCAG 2.4.11: Fokus nie verdeckt) */
  function measureHeader() {
    const h = $('.site-header'); const n = $('.wl-subnav');
    const hh = h ? h.getBoundingClientRect().height : 0; const nh = n ? n.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--wl-site-header-h', hh + 'px');
    document.documentElement.style.setProperty('--wl-header-offset', (hh + nh) + 'px');
  }
  /* Browser initialization is explicit; static HTML remains usable without JS. */
  function init() {
    measureHeader();
    window.addEventListener('resize', measureHeader);
    window.addEventListener('popstate', route);
    hydrate(document.getElementById('app'));
    if (document.getElementById('wl-explorer')) route();
    document.documentElement.dataset.wlReady = 'true';
  }
  return { init, href, rewriteRoutes, viewStart, viewCard, viewCategories, viewCategory, viewArea, viewMethodik, viewRedaktionen, explorerHtml, rowHtml, tileHtml, ladderOf, relatedOf, isBoiler, korpusOf, hasShift, runQuery, CATS, AREAS, STATUS, ev, esc, termHtml, effectLine };
}
