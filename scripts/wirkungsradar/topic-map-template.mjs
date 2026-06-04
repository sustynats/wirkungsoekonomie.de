const UPDATED_AT = "2026-06-04";

function topicCard({ kicker, title, checked, seeds, narratives, psychology, ctaHref, ctaLabel = "Cluster öffnen" }) {
  const checkedItems = checked.map((item) => `<li>${item.href ? `<a href="${item.href}">${item.label}</a>` : item.label}</li>`).join("");
  const seedItems = seeds.map((item) => `<li>${item}</li>`).join("");
  const cta = ctaHref
    ? `<a class="btn btn-secondary" href="${ctaHref}">${ctaLabel}</a>`
    : `<span class="btn btn-secondary is-disabled" aria-disabled="true">Cluster folgt</span>`;
  return `<article class="radar-topic-card">
              <p class="card-kicker">${kicker}</p>
              <h3>${title}</h3>
              <div class="radar-topic-columns"><div><h4>Grundlage im Umbau</h4><ul>${checkedItems}</ul></div><div><h4>In Vorbereitung</h4><ul>${seedItems}</ul></div></div>
              <p><strong>Narrative:</strong> ${narratives}</p><p><strong>Psychologie:</strong> ${psychology}</p>${cta}
            </article>`;
}

export function renderRadarTopicMapPage(pageShell) {
  const cards = [
    topicCard({
      kicker: "Klima, Energie & Wärme",
      title: "Vom 2-Prozent-Frame bis zur Wärmewende.",
      checked: [
        { href: "../live/deutschland-nur-zwei-prozent/", label: "Deutschland nur 2 %?" },
        { href: "../live/co2-preis-oder-fossile-systemkosten/", label: "CO₂-Preis oder fossile Systemkosten?" },
        { href: "../live/heizgesetz-heizhammer-narrativ/", label: "Heizgesetz oder Heizhammer?" },
      ],
      seeds: ["Windräder zerstören Natur?", "Kernkraft zurück?", "Fusion löst das Energieproblem?"],
      narratives: "Ohnmacht, Verzögerung, Technikwunder, Verbotsangst, Natur-gegen-Klima.",
      psychology: "Verlustaversion, Reaktanz, Kontrollbedürfnis, Status-quo-Bias.",
      ctaHref: "klima-energie/",
    }),
    topicCard({
      kicker: "Mobilität, Industrie & Produkte",
      title: "Lebenszyklen, Rohstoffe, Industriepfade.",
      checked: [
        { href: "../live/e-autos-schlimmer-als-verbrenner/", label: "E-Autos schlimmer als Verbrenner?" },
        { href: "../live/batterien-sind-nicht-recyclebar/", label: "Batterien sind nicht recyclebar?" },
        { href: "../live/klimaschutz-deindustrialisiert-deutschland/", label: "Klimaschutz deindustrialisiert Deutschland?" },
      ],
      seeds: ["E-Fuels retten den Verbrenner?", "E-Lkw funktionieren nicht?", "Laden dauert viel zu lange?"],
      narratives: "Rohstoffangst, falscher Lebenszyklusvergleich, Deindustrialisierung, Effizienzverschiebung.",
      psychology: "Verfügbarkeitsheuristik, Bestätigungsfehler, Technikmisstrauen.",
    }),
    topicCard({
      kicker: "Staat, Haushalt & Steuergeld",
      title: "Bilanzgrenzen statt Bauchgefühl.",
      checked: [
        { href: "../live/schulden-machen-oder-sparen/", label: "Schulden machen oder sparen?" },
        { href: "../live/radwege-in-peru/", label: "Radwege in Peru?" },
        { href: "steuergeld-globale-verantwortung-fairness/", label: "Steuergeld & globale Verantwortung" },
      ],
      seeds: ["EU undemokratisch - Deutschland zahlt alles?", "NGOs kassieren Steuergeld?", "Steuerverschwendung Bürokratie?"],
      narratives: "Unser Geld geht weg, Nettozahler, Nullsummenframe, Verschwendung.",
      psychology: "Knappheitsstress, Empörungsheuristik, Ingroup/Outgroup.",
      ctaHref: "steuergeld-globale-verantwortung-fairness/",
    }),
    topicCard({
      kicker: "Migration, Sozialstaat & Zusammenhalt",
      title: "Sozialstaat nicht als Sündenbockmaschine.",
      checked: [
        { href: "../live/migration-kostet-nur/", label: "Migration kostet nur?" },
        { href: "migration-sozialstaat-zusammenhalt/", label: "Migration & Sozialstaat" },
        { href: "../narrative/sozialstaats-suendenbock/", label: "Sozialstaats-Sündenbock" },
      ],
      seeds: ["Nie eingezahlt?", "Integration ist gescheitert?", "Kriminalität und Migration?"],
      narratives: "Sündenbock, Sozialtourismus, Bedrohung, Grenzen-dicht-Frame.",
      psychology: "Statusangst, Kontrollverlust, Zugehörigkeit, Bedrohungswahrnehmung.",
      ctaHref: "migration-sozialstaat-zusammenhalt/",
    }),
    topicCard({
      kicker: "Arbeit, Leistung & soziale Sicherung",
      title: "Würde, Erwerbsanreize und Teilhabe.",
      checked: [
        { href: "../live/schulden-machen-oder-sparen/", label: "Haushalt als Wirkungsfrage" },
        { href: "wirtschaft-transformation/", label: "Wirtschaft & Transformation" },
        { href: "../psychologie/", label: "Psychologischer Wirkungscheck" },
      ],
      seeds: ["Arbeit lohnt sich nicht mehr?", "Bürgergeld macht faul?", "Rente unbezahlbar?"],
      narratives: "Faulheitsframe, Leistungsträger, Workfare, Generationenkonflikt.",
      psychology: "Fairnessintuition, moralische Empörung, Abgrenzung nach unten.",
    }),
    topicCard({
      kicker: "Wohnen, Stadt & Infrastruktur",
      title: "Freiheit durch Nähe, Planung und Versorgung.",
      checked: [
        { href: "wohnen-gebaeude-waerme/", label: "Wohnen, Gebäude & Wärme" },
        { href: "infrastruktur/", label: "Infrastruktur" },
        { href: "../live/heizgesetz-heizhammer-narrativ/", label: "Heizgesetz oder Heizhammer?" },
      ],
      seeds: ["Wohnungsnot wegen Migration?", "15-Minuten-Stadt oder Klimakäfig?", "Parkplätze sind Freiheit?"],
      narratives: "Klimakäfig, Planwirtschaft, Verdrängung, Autofreiheitsframe.",
      psychology: "Reaktanz, Eigentumsangst, Verlustaversion, Kontrollverlust.",
      ctaHref: "wohnen-gebaeude-waerme/",
    }),
    topicCard({
      kicker: "Medien, Demokratie & Öffentlichkeit",
      title: "Quellenvertrauen und demokratische Infrastruktur.",
      checked: [
        { href: "../live/man-darf-ja-nichts-mehr-sagen/", label: "Man darf ja nichts mehr sagen?" },
        { href: "../live/mainstreammedien-luegen-alle/", label: "Mainstreammedien lügen alle?" },
        { href: "demokratie-oeffentlichkeit/", label: "Demokratie & Öffentlichkeit" },
      ],
      seeds: ["ÖRR oder Staatsfunk?", "Verfassungsschutz oder Regierungsschutz?", "Faktenchecker sind Zensur?"],
      narratives: "Zensur, Staatsfunk, Elitenverschwörung, Opferumkehr.",
      psychology: "Kränkung, Ingroup/Outgroup, Misstrauen, kognitive Dissonanz.",
      ctaHref: "demokratie-oeffentlichkeit/",
    }),
    topicCard({
      kicker: "KI, Digitalisierung & Automatisierung",
      title: "Automatisierung als Wirkungs- und Teilhabefrage.",
      checked: [
        { href: "../../portale/digitalisierung-ki-wirkungsdatenraeume/algorithmische-fairness/", label: "Algorithmische Fairness" },
        { href: "../psychologie/", label: "Psychologischer Wirkungscheck" },
        { href: "../methode/", label: "Methode" },
      ],
      seeds: ["KI nimmt uns alle Jobs?", "KI macht Kinder dumm?", "Datenschutz verhindert Innovation?"],
      narratives: "Überflüssigkeit, Überwachung, Hype, Bürokratie.",
      psychology: "Zukunftsangst, Kontrollverlust, Kompetenzbedrohung.",
    }),
    topicCard({
      kicker: "Gesundheit, Pflege & Prävention",
      title: "Gesundheit nicht nur als Krankheitskosten.",
      checked: [
        { href: "../../wirkungsfelder/", label: "Wirkungsfelder" },
        { href: "../methode/", label: "Methode" },
        { href: "../wissen/", label: "Wissen" },
      ],
      seeds: ["Prävention ist zu teuer?", "Pflege ist unbezahlbar?", "Mehr Krankenhäuser bedeuten bessere Versorgung?"],
      narratives: "Kostenpanik, Mangelverwaltung, Sündenbock, Scheinsicherheit.",
      psychology: "Angst, Verdrängung, Kurzfristbias, Sicherheitsbedürfnis.",
    }),
    topicCard({
      kicker: "Landwirtschaft, Ernährung & Biodiversität",
      title: "Höfe, Böden, Wasser und Ernährungssicherheit.",
      checked: [
        { href: "../../wirkungsfelder/", label: "Wirkungsfelder" },
        { href: "../live/deutschland-nur-zwei-prozent/", label: "Klimawirkung verstehen" },
        { href: "../wissen/", label: "Wissen" },
      ],
      seeds: ["Die Bauern werden geopfert?", "Bio kann die Welt nicht ernähren?", "Fleischverzicht ist Ideologie?"],
      narratives: "Kulturkampf, Versorgungspanik, Naturromantik, Bürokratieframe.",
      psychology: "Identitätsschutz, Statusbedrohung, moralische Reaktanz.",
    }),
    topicCard({
      kicker: "Sicherheit, Geopolitik & Resilienz",
      title: "Frieden, Schutz und Folgekosten nüchtern prüfen.",
      checked: [
        { href: "../live/radwege-in-peru/", label: "Bilanzgrenzen prüfen" },
        { href: "../methode/", label: "Methode" },
        { href: "../psychologie/", label: "Psychologie" },
      ],
      seeds: ["Waffenlieferungen verlängern den Krieg?", "NATO hat Russland provoziert?", "Resilienz ist Autarkie?"],
      narratives: "Friedenssehnsucht, Schuldumkehr, Autarkie, Sicherheitsmüdigkeit.",
      psychology: "Bedrohungsreduktion, Schuldabwehr, Komplexitätsflucht.",
    }),
    topicCard({
      kicker: "Kultur, Identität & Geschlecht",
      title: "Sensible Themen ohne Abwertung prüfen.",
      checked: [
        { href: "../psychologie/", label: "Psychologie" },
        { href: "../narrative/", label: "Narrative" },
        { href: "../was-der-wirkungsradar-nicht-ist/", label: "Was der Radar nicht ist" },
      ],
      seeds: ["Gender-Ideologie?", "Queere Sichtbarkeit bedroht Kinder?", "Feminismus zerstört Familie?"],
      narratives: "Moral panic, Schutz-der-Kinder, Tradition, Statusbedrohung.",
      psychology: "Identitätsschutz, Ingroup/Outgroup, Ekel- und Bedrohungsframes.",
    }),
    topicCard({
      kicker: "Missverständnisse über die Wirkungsökonomie",
      title: "Planwirtschaft, Social Credit und Kontrollangst.",
      checked: [
        { href: "../live/sdgs-weltregierung/", label: "SDGs sind Weltregierung?" },
        { href: "../live/wirkungsoekonomie-planwirtschaft/", label: "WÖk ist Planwirtschaft?" },
        { href: "../was-der-wirkungsradar-nicht-ist/", label: "Was der Radar nicht ist" },
      ],
      seeds: ["WÖk ist Social Credit?", "WÖk bewertet Menschen?", "Wirkungsteuer macht alles teurer?"],
      narratives: "Herrschaft, Überwachung, Bürokratie, Freiheitsverlust.",
      psychology: "Reaktanz, Kontrollverlust, Misstrauen, Dissonanzschutz.",
      ctaHref: "../was-der-wirkungsradar-nicht-ist/",
      ctaLabel: "Einordnung öffnen",
    }),
  ].join("\n");

  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Themen</nav>
          <p class="hero-kicker">Themenlandkarte</p>
          <h1 class="hero-title">Themen im Wirkungsradar</h1>
          <p class="hero-subtitle">Mythen, Narrative und öffentliche Aussagen nach Wirkungsfeldern.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Der Wirkungsradar ordnet öffentliche Aussagen nicht nur nach Themen, sondern nach Wirkungspfaden. Jede Aussage wird danach geprüft, was stimmt, was fehlt, welches Narrativ wirkt, welche psychologischen Hebel aktiviert werden, welche Folgen falsches Handeln hätte und welche wirkungsökonomische Antwort möglich ist.</p>
          <p class="radar-status-line"><span>Statussystem aktiv</span><span>Datenstand: ${UPDATED_AT}</span><span>Backlog: 13 Cluster</span></p>
        </div>
      </section>
      <div class="radar-summary-grid" aria-label="Themenlandkarte Summary">
        <article class="radar-summary-item" data-tone="positive"><p class="radar-summary-label">Grundsatz</p><p class="radar-summary-value">Der Wirkungsradar ist eine systematische Karte öffentlicher Narrative, keine lose Artikelsammlung.</p></article>
        <article class="radar-summary-item" data-tone="critical"><p class="radar-summary-label">Prüflogik</p><p class="radar-summary-value">Faktenkern, Verkürzung, Frame, psychologische Wirkung, Folgencheck und WÖk-Lösungspfad.</p></article>
        <article class="radar-summary-item" data-tone="warning"><p class="radar-summary-label">Priorisierung</p><p class="radar-summary-value">Leuchttürme zuerst: geprüfte Dossiers tragen die Struktur, Seeds markieren den Ausbau.</p></article>
        <article class="radar-summary-item" data-tone="neutral"><p class="radar-summary-label">Redaktion</p><p class="radar-summary-value">Wahre Kerne anerkennen, Gruppen nicht abwerten, Menschen nicht pathologisieren.</p></article>
        <article class="radar-summary-item" data-tone="critical"><p class="radar-summary-label">Wirkung</p><p class="radar-summary-value">Aussagen wirken über Frames, Tonalität, Wiederholung, Resonanzräume und Anschlussfähigkeit.</p></article>
        <article class="radar-summary-item" data-tone="positive"><p class="radar-summary-label">Ziel</p><p class="radar-summary-value">Positive Netto-Wirkung für Mensch, Planet und Demokratie sichtbar machen.</p></article>
      </div>
      <nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
        <a href="../">Überblick</a>
        <a href="../methode/">Methode</a>
        <a href="../wissen/">Wissen</a>
        <a href="../live/">Live</a>
        <a href="../narrative/">Narrative</a>
        <a href="../psychologie/">Psychologie</a>
        <a href="./" aria-current="page">Themen</a>
        <a href="../detail/">Detail</a>
        <a href="../was-der-wirkungsradar-nicht-ist/">Was er nicht ist</a>
      </nav>
      <section class="section" id="prioritaeten">
        <div>
          <div class="section-header"><p class="hero-kicker">Priorität</p><h2>Erst Leuchttürme, dann Breite.</h2><p>Seeds sind noch keine fertigen Wirkungschecks. Sie zeigen, welche Themen im Backlog stehen und welche Prüfung als Nächstes gebraucht wird.</p></div>
          <div class="radar-priority-grid">
            <article class="card"><p class="card-kicker">P0_lighthouse</p><h3 class="card-title">Muss den Radar tragen.</h3><p class="card-text">Fertige oder fast fertige Referenzdossiers mit vollständigem Fakten-, Psychologie-, Folgen- und Lösungspfad.</p></article>
            <article class="card"><p class="card-kicker">P1_high_resonance</p><h3 class="card-title">Häufig und wirkungsstark.</h3><p class="card-text">Narrative mit hoher öffentlicher Resonanz, die demokratische Handlungsfähigkeit oder Systemvertrauen prägen.</p></article>
            <article class="card"><p class="card-kicker">P2-P4</p><h3 class="card-title">Cluster aufbauen, später prüfen.</h3><p class="card-text">Breitenthemen, spätere Ausbaustufen und historische Fälle werden markiert, aber nicht als geprüft verkauft.</p></article>
          </div>
        </div>
      </section>
      <section class="section section-soft" id="themencluster"><div><div class="section-header"><p class="hero-kicker">Clusterkarten</p><h2>Die öffentliche Themenlandkarte.</h2></div><div class="radar-topic-map-grid">${cards}</div></div></section>
      <section class="section" id="backlog-regeln">
        <div>
          <div class="section-header"><p class="hero-kicker">Redaktionelle Regeln</p><h2>So wird ein Backlog-Eintrag ein Wirkungscheck.</h2></div>
          <div class="radar-rule-grid">
            <article class="card"><p class="card-kicker">Pflichtfelder</p><p class="card-text">Cluster, Claim, wahrer Kern, zentrale Verkürzung, Narrativfamilien, psychologische Haupthebel, Manipulationsmuster, MPD-Risiko, WÖk-Lösungspfad, Quellenbedarf, Status und Priorität.</p></article>
            <article class="card"><p class="card-kicker">Statuswerte</p><p class="card-text">seed, draft, draft_missing_sources, draft_missing_psychology, draft_missing_woek_solution, draft_missing_positive_example, needs_update, archived.</p></article>
            <article class="card"><p class="card-kicker">Schutzregeln</p><p class="card-text">Wahre Kerne anerkennen. Keine Gruppen abwerten. Keine Menschen pathologisieren. Psychologie als Wirkmechanismus erklären, nicht als Diagnose verwenden.</p></article>
          </div>
        </div>
      </section>
    </main>`;

  return pageShell({
    title: "Themen im Wirkungsradar | Wirkungsökonomie",
    description: "Themenlandkarte des Wirkungsradars: Mythen, Narrative und öffentliche Aussagen nach Wirkungsfeldern, Status und Priorität.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/",
    base: "../../",
    searchType: "Themenlandkarte",
    assetVersion: "20260604-radar-backlog",
    main,
  });
}
