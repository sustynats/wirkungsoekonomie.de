import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGET_ROOTS = [
  "wirkungsfelder",
  "werkzeuge",
  "werkstatt/dossiers",
  "werkstatt/gesetze",
  "werkstatt/leitlinien",
  "werkstatt/whitepaper",
  "dokumente",
];

const STANDARD_INTRO =
  "Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit dieses Wirkungsfeld demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann. Unterschiedliche Parteien können innerhalb dieses Rahmens verschiedene Wege wählen. Entscheidend ist, dass Wirkung sichtbar, überprüfbar, korrigierbar und grundrechtskonform bleibt.";

const COMMON = {
  default: {
    label: "Wirkungsökonomie",
    rows: {
      "Aufgabe der Politik":
        "Politik schafft Mandat, Verfahren, Zuständigkeiten und Korrekturwege, damit Wirkung sichtbar wird, ohne demokratische Entscheidungen zu ersetzen.",
      "Politische Rahmenbedingungen":
        "Notwendig sind transparente Datenstandards, Rechtsschutz, Datenschutz, öffentliche Prüfbarkeit, unabhängige Evaluation und anschlussfähige Verwaltungsverfahren.",
      "Ausgestaltungsspielraum":
        "Demokratische Parteien können Tempo, Instrumente, Finanzierung, Pilotierung, Verbindlichkeit, Förderung und Rückverteilung unterschiedlich gewichten.",
      Zielkonflikte:
        "Wirksamkeit, Bürokratiearmut, soziale Gerechtigkeit, Wettbewerbsfähigkeit, Datenschutz, Grundrechte und Innovationsfreiheit müssen politisch austariert werden.",
      Rollenverteilung:
        "EU, Bund, Länder, Kommunen, Verwaltung, Wirtschaft, Wissenschaft und Zivilgesellschaft tragen unterschiedliche Verantwortung für Regeln, Daten, Umsetzung und Kontrolle.",
      "Übergang und Schutz":
        "Übergangsfristen, soziale Abfederung, KMU-Schutz, Beteiligung, Einspruchsrechte und klare Datenschutzregeln verhindern Überforderung und Fehlanreize.",
      "Evaluation und Korrektur":
        "Wirkungsberichte, öffentliche Konsultation, unabhängige Prüfung und Revisionszyklen halten die Umsetzung lernfähig und korrigierbar.",
      "Parteipolitische Anschlussfähigkeit":
        "Konservative, liberale, sozialdemokratische, grüne, linke, kommunale und wirtschaftsnahe Perspektiven können unterschiedliche Umsetzungswege wählen.",
      "Schutz vor Technokratie":
        "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert; bewertet werden Maßnahmen, Strukturen und Wirkungsräume, nicht Menschen.",
    },
  },
  "produkte-konsum": {
    label: "Produkte & Konsum",
    rows: {
      "Aufgabe der Politik":
        "Politik muss Produktwirkung sichtbar machen, Verbraucherinformation sichern und Preis- sowie Steuerlogiken so gestalten, dass positive Netto-Wirkung entscheidungsrelevant wird.",
      "Politische Rahmenbedingungen":
        "Erforderlich sind WUStG, Produktscorecards, WÖk-IDs, Wirkungsrat, transparente Produktdaten, EU-Anschlussfähigkeit, Kaufkraftschutz und rechtssichere Übergangsfristen.",
      Ausgestaltungsspielraum:
        "Parteien können Steuerentlastung, Bonus-Malus-Modelle, Produktlabel, Förderung, Branchenpiloten, soziale Rückverteilung und EU-Harmonisierung unterschiedlich kombinieren.",
      Zielkonflikte:
        "Ehrliche Preise, soziale Kaufkraft, KMU-Belastung, Datenqualität, Wettbewerbsneutralität, Importlogik und Missbrauchsschutz müssen politisch balanciert werden.",
      Rollenverteilung:
        "EU und Bund setzen Steuer- und Datenrahmen, Verwaltung und Wirkungsrat prüfen Methodik, Unternehmen liefern Daten, Handel und Verbraucher:innen nutzen die Information.",
      "Übergang und Schutz":
        "KMU-Schutz, Standardwerte, Pilotbranchen, Kaufkraftausgleich, klare Einspruchsrechte und Datenschutz verhindern, dass Wirkungssteuerung sozial oder wirtschaftlich kippt.",
      "Evaluation und Korrektur":
        "Steuerklassen, Schwellen, Scorecards und Verbraucherwirkung müssen regelmäßig überprüft und bei Fehlanreizen öffentlich korrigiert werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Marktnahe, soziale, ökologische, verbraucherschützende und industriepolitische Ansätze können unterschiedliche Pfade wählen, solange Wirkung transparent bleibt.",
      "Schutz vor Technokratie":
        "Der Score darf keine politische Entscheidung ersetzen. Er macht Produktfolgen sichtbar; Tarif, Rückverteilung, Ausnahmen und Schutzregeln bleiben demokratisch festzulegen.",
    },
  },
  "impact-controlling": {
    label: "Impact Controlling",
    rows: {
      "Aufgabe der Politik":
        "Politik schafft Datenzugang, Prüfstandards und Verlässlichkeit, damit Impact Controlling als Entscheidungsgrundlage statt als Berichtsroutine funktioniert.",
      "Politische Rahmenbedingungen":
        "WÖk-IDs, Scorecards, NWI, T-SROI, Datenqualität, Assurance, Datenschutz, Verhältnismäßigkeit und Berichtspflichten brauchen klare Zuständigkeiten.",
      Ausgestaltungsspielraum:
        "Berichtspflichten, freiwillige Pilotierung, öffentliche Beschaffung, Förderlogik, Steuerungsinstrumente und Prüfintensität können unterschiedlich ausgestaltet werden.",
      Zielkonflikte:
        "Vergleichbarkeit, Kosten, Geschäftsgeheimnisse, Datenschutz, Prüftiefe, Geschwindigkeit und KMU-Tauglichkeit stehen in politischer Spannung.",
      Rollenverteilung:
        "Gesetzgeber setzen Mindeststandards, Unternehmen steuern intern, Prüfer:innen sichern Qualität, Wissenschaft entwickelt Methodik, Verwaltung nutzt Ergebnisse.",
      "Übergang und Schutz":
        "Gestufte Pflichten, Branchenarchetypen, Standardwerte, Assurance-Level und geförderte Dateninfrastruktur schützen kleinere Organisationen.",
      "Evaluation und Korrektur":
        "Indikatoren, Schwellen, Methoden und Datenquellen müssen versioniert, geprüft und bei Fehlsteuerung korrigiert werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Liberale Transparenzlogik, soziale Schutzlogik, ökologische Transformationslogik und wirtschaftliche Resilienzlogik können hier anschließen.",
      "Schutz vor Technokratie":
        "Impact Controlling liefert Entscheidungswissen. Es ersetzt weder Managementverantwortung noch demokratische Abwägung.",
    },
  },
  "staat-recht-demokratie": {
    label: "Staat, Recht & Demokratie",
    rows: {
      "Aufgabe der Politik":
        "Politik muss Rechtsrahmen, Institutionen, Haushaltslogik und Rechtsschutz so ordnen, dass Wirkung sichtbar und demokratisch kontrollierbar wird.",
      "Politische Rahmenbedingungen":
        "Wirkungssteuergesetz, Wirkungshaushalt, Wirkungsrat, parlamentarische Kontrolle, Grundrechte, Datenschutz und gerichtlicher Rechtsschutz bilden den Kernrahmen.",
      Ausgestaltungsspielraum:
        "Institutionendesign, Mandat des Wirkungsrats, Haushaltsregeln, Piloträume, Evaluationszyklen und Beteiligungsverfahren bleiben demokratisch gestaltbar.",
      Zielkonflikte:
        "Wirksamkeit, Gewaltenteilung, Grundrechte, Verwaltungslast, politische Freiheit, Minderheitenschutz und öffentliche Nachvollziehbarkeit müssen austariert werden.",
      Rollenverteilung:
        "Parlamente entscheiden normativ, Verwaltung setzt um, Gerichte sichern Rechtsschutz, Wirkungsrat prüft Methodik, Öffentlichkeit kontrolliert demokratisch.",
      "Übergang und Schutz":
        "Pilotgesetze, Sunset-Klauseln, Ombudsstellen, Beteiligung, Rechtsbehelfe und Datenschutzfolgenabschätzung verhindern institutionelle Überdehnung.",
      "Evaluation und Korrektur":
        "Wirkungsberichte, parlamentarische Anhörungen, gerichtliche Kontrolle und unabhängige Methodenrevision halten den Rechtsrahmen lernfähig.",
      "Parteipolitische Anschlussfähigkeit":
        "Rechtsstaatliche, ordnungspolitische, sozialstaatliche, ökologische und demokratietheoretische Ansätze können verschiedene Ausprägungen wählen.",
      "Schutz vor Technokratie":
        "Die Wirkungsökonomie ersetzt Politik nicht. Normative Entscheidungen bleiben bei demokratisch legitimierten Organen und unterliegen Rechtsschutz.",
    },
  },
  "wirtschaft-unternehmen": {
    label: "Wirtschaft & Unternehmen",
    rows: {
      "Aufgabe der Politik":
        "Politik schafft Rahmen, in denen Unternehmen Wirkung, Risiko, Wertschöpfung und Verantwortung verlässlich steuern können.",
      "Politische Rahmenbedingungen":
        "CSRD/ESRS-Anschluss, Risikomanagement, Lieferkettenregeln, Wettbewerbsrecht, Weiterbildung, Datenstandards und Anreizsysteme müssen zusammenspielen.",
      Ausgestaltungsspielraum:
        "Förderung, Steueranreize, Beschaffung, Berichtspflichten, Branchenpiloten, KMU-Erleichterungen und Transformationsfonds können unterschiedlich kombiniert werden.",
      Zielkonflikte:
        "Wettbewerbsfähigkeit, Transformationsdruck, Datenaufwand, Greenwashing-Schutz, Innovation, Beschäftigung und Lieferkettenrealität stehen in Spannung.",
      Rollenverteilung:
        "Unternehmen verantworten Strategie und Umsetzung, Politik setzt Leitplanken, Prüfer:innen sichern Qualität, Beschäftigte und Kund:innen liefern Rückkopplung.",
      "Übergang und Schutz":
        "KMU-taugliche Standards, Förderprogramme, Qualifizierung, Branchenwerte, Pilotierung und Rechtssicherheit verhindern Überforderung.",
      "Evaluation und Korrektur":
        "Wirkungsrisiken, Lieferkettenwirkung, Bonuslogiken und Produktportfolios müssen überprüft und bei Fehlanreizen korrigiert werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Wirtschaftsnahe, sozialpartnerschaftliche, ökologische, innovationspolitische und ordnungspolitische Ansätze können unterschiedliche Instrumente wählen.",
      "Schutz vor Technokratie":
        "Wirkungsdaten unterstützen Unternehmensführung und Politik. Sie ersetzen keine unternehmerische Verantwortung und keine demokratische Rahmensetzung.",
    },
  },
  "wohnen-stadt": {
    label: "Wohnen & Stadt",
    rows: {
      "Aufgabe der Politik":
        "Politik muss Wohnen als Wirkungsraum sichern: bezahlbar, gesund, klimaverträglich, rechtssicher und sozial eingebettet. Eigentumsschutz und Wirkungspflicht müssen so verbunden werden, dass verantwortliche Vermietung gestärkt und destruktive Spekulation erschwert wird.",
      "Politische Rahmenbedingungen":
        "Mietrecht, Bodenpolitik, Sanierungsförderung, Warmmietenneutralität, Leerstandsregeln, Grundsteuer C, Zweckentfremdungsrecht, kommunale Wohnwirkungshaushalte und Quartierswirkung brauchen gemeinsame Logik.",
      Ausgestaltungsspielraum:
        "Parteien können Mieterschutz, Eigentumsförderung, Genossenschaften, öffentliche Wohnungswirtschaft, Marktanreize, Bodenpolitik, Sanierungspflichten, steuerliche Entlastung und Förderung unterschiedlich gewichten.",
      Zielkonflikte:
        "Klimaschutz, Bezahlbarkeit, Eigentumsrechte, Wirkungspflicht, Sanierungsfinanzierung, Neubau, Bestandsschutz, Verdrängung, Finanzierung und kommunale Handlungsfähigkeit müssen austariert werden.",
      Rollenverteilung:
        "Bundesrecht, Landesrecht und kommunale Satzungen setzen unterschiedliche Hebel. Vermieter:innen, Mieter:innen, Energieversorger, Wohnungswirtschaft, Finanzierer:innen, Wissenschaft und Zivilgesellschaft tragen je eigene Verantwortung.",
      "Übergang und Schutz":
        "Warmmietenneutralität, Härtefallregeln, Kleinvermieter:innen-Schutz, Sanierungsfahrpläne, Mieterschutz, Rechtsschutz, Verhältnismäßigkeit und Förderlogik verhindern soziale und wirtschaftliche Schieflagen.",
      "Evaluation und Korrektur":
        "Wohnwirkungsindex, WIX-VI, Mietbelastung, Sanierungswirkung, Leerstand, Zweckentfremdung, Stranded-Asset-Risiken und Quartiersindikatoren müssen regelmäßig überprüft werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Kommunale, marktliche, genossenschaftliche, soziale und ökologische Wohnpolitiken können verschiedene Instrumente wählen.",
      "Schutz vor Technokratie":
        "Bewertet werden Wohnbedingungen, Gebäude, Regeln und Quartierswirkung, nicht Menschen. Politische Zielkonflikte bleiben demokratisch zu entscheiden.",
    },
  },
  bildung: {
    label: "Bildung",
    rows: {
      "Aufgabe der Politik":
        "Politik muss Schulen in die Lage versetzen, nicht nur Stoff zu vermitteln, sondern Lernfähigkeit, Teilhabe, Demokratiepraxis, Gesundheit und Zukunftskompetenz verlässlich zu stärken.",
      "Was sich an Lehrplänen ändern müsste":
        "Lehrpläne bleiben notwendig. Sie sollten aber sichtbar machen, welche Wirkung ein Fach erzeugen soll: Basiskompetenzen sichern, Urteilskraft trainieren, Medienkompetenz stärken, Zusammenarbeit üben und Folgen von Entscheidungen verstehen.",
      "Was bei Bewertung geklärt werden muss":
        "Noten, Portfolios und Kompetenzraster brauchen klare Rollen: Sie sollen Lernen verbessern und Übergänge fairer machen, aber keine Kinderprofile, Familienrankings oder automatisierte Schullabel erzeugen.",
      "Was Schulen dafür brauchen":
        "Schulen brauchen Zeit, Fortbildung, digitale Grundausstattung, Schulsozialarbeit, Datenregeln und verlässliche Förderung. Wirkungsschule darf keine Zusatzaufgabe ohne Personal, Budget und Entlastung werden.",
      Ausgestaltungsspielraum:
        "Länder und Parteien können unterschiedlich gewichten: mehr Ganztag oder mehr Wahlfreiheit, mehr Standards oder mehr Schulautonomie, zuerst Modellschulen oder schneller in die Fläche. Diese Entscheidungen müssen offen benannt werden.",
      Zielkonflikte:
        "Vergleichbarkeit hilft gegen Beliebigkeit, kann aber pädagogische Freiheit einengen. Datenschutz schützt Kinder, kann aber frühe Hilfe erschweren. Leistungsanspruch, Inklusion und Entlastung müssen praktisch austariert werden.",
      Rollenverteilung:
        "Länder setzen Regeln und Prüfungsrahmen. Kommunen sichern Räume, Sozialraum und Infrastruktur. Schulen gestalten Praxis. Lehrkräfte, Eltern und Schüler:innen geben Rückmeldung. Wissenschaft prüft, ob die Wirkung wirklich eintritt.",
      "Übergang und Schutz":
        "Start mit Modellschulen und Pilotregionen, keine personenbezogenen Scores, keine Sanktionen gegen Kinder oder Lehrkräfte, klare Zweckbindung der Daten und finanzierte Fortbildung vor neuen Pflichten.",
      "Evaluation und Korrektur":
        "Geprüft werden Schulklima, Lernentwicklung, Teilhabe, Übergänge, Demokratiekompetenz und Wirkungskompetenz. Wenn ein Instrument Druck erhöht statt Lernen verbessert, muss es geändert oder beendet werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Bildungsgerechtigkeit, Leistungsorientierung, digitale Mündigkeit, Demokratiebildung und kommunale Bildungsnetze können verschieden kombiniert werden, solange Schutzgrenzen und Verantwortlichkeiten klar bleiben.",
      "Schutz vor Technokratie":
        "Wirkungsdaten dürfen Kinder nicht klassifizieren. Sie helfen, Lernräume, Förderung und Strukturen besser zu gestalten.",
    },
  },
  "medien-oeffentlichkeit": {
    label: "Medien & Öffentlichkeit",
    rows: {
      "Aufgabe der Politik":
        "Politik muss demokratische Öffentlichkeit schützen, ohne Meinungsfreiheit durch Bewertungsautomatismen zu ersetzen.",
      "Politische Rahmenbedingungen":
        "Plattformregulierung, Medienqualität, Transparenz, Quellenklarheit, Desinformationsschutz, Datenschutz und Grundrechte brauchen klare Verfahren.",
      Ausgestaltungsspielraum:
        "Parteien können Medienförderung, Plattformpflichten, Transparenzregeln, Bildung, Forschung und Aufsicht unterschiedlich gewichten.",
      Zielkonflikte:
        "Meinungsfreiheit, Schutz vor Manipulation, Zensurvermeidung, Plattformmacht, journalistische Freiheit und demokratische Resilienz stehen in Spannung.",
      Rollenverteilung:
        "Plattformen, Medien, Zivilgesellschaft, Forschung, Regulierungsbehörden, Bildungseinrichtungen und Gerichte tragen verschiedene Rollen.",
      "Übergang und Schutz":
        "Beschwerdewege, Transparenzberichte, Schutz journalistischer Freiheit, Quellenklarheit und gerichtlicher Rechtsschutz sind notwendig.",
      "Evaluation und Korrektur":
        "Regeln gegen Desinformation und Manipulation müssen regelmäßig auf Wirksamkeit, Grundrechtskonformität und Nebenwirkungen geprüft werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Freiheitsorientierte, demokratieschützende, bildungspolitische und medienpolitische Ansätze können unterschiedliche Instrumente wählen.",
      "Schutz vor Technokratie":
        "Wirkungsanalyse bewertet öffentliche Wirkpfade, nicht Gesinnungen. Sie darf keine Zensurmaschine werden.",
    },
  },
  "gesundheit-pflege": {
    label: "Gesundheit & Pflege",
    rows: {
      "Aufgabe der Politik":
        "Politik muss Prävention, Pflege, Versorgungsqualität und Teilhabe so ordnen, dass Gesundheit als Zustandsveränderung sichtbar wird.",
      "Politische Rahmenbedingungen":
        "Pflegefinanzierung, Gesundheitsdaten, Datenschutz, Kassenlogik, Prävention, kommunale Gesundheitsräume und Qualitätsindikatoren müssen zusammenspielen.",
      Ausgestaltungsspielraum:
        "Parteien können Präventionsbudgets, Pflegevergütung, digitale Infrastruktur, kommunale Versorgung und Kassenanreize unterschiedlich kombinieren.",
      Zielkonflikte:
        "Datenschutz, Versorgungsgerechtigkeit, Kosten, Personalmangel, Prävention, Therapiefreiheit und regionale Unterschiede stehen in Spannung.",
      Rollenverteilung:
        "Bund, Länder, Kommunen, Kassen, Leistungserbringer, Pflege, Patient:innen, Wissenschaft und Zivilgesellschaft tragen je eigene Aufgaben.",
      "Übergang und Schutz":
        "Datenschutz, Einwilligung, Patient:innenrechte, Personalentlastung, Pilotregionen und soziale Abfederung schützen vor Fehlsteuerung.",
      "Evaluation und Korrektur":
        "Gesundheitswirkung, Pflegequalität, Präventionserfolge und Nebenwirkungen müssen öffentlich geprüft und korrigiert werden.",
      "Parteipolitische Anschlussfähigkeit":
        "Solidarische, präventive, kommunale, digitale und wettbewerbliche Gesundheitslogiken können unterschiedlich ausgestaltet werden.",
      "Schutz vor Technokratie":
        "Bewertet werden Versorgungssysteme und Rahmenbedingungen, nicht der Wert oder die Lebensführung einzelner Menschen.",
    },
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(target);
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  });
}

function isRelevant(rel) {
  if (!rel.endsWith("index.html") && !rel.endsWith(".html")) return false;
  return TARGET_ROOTS.some((root) => rel === `${root}/index.html` || rel.startsWith(`${root}/`));
}

function contextFor(rel) {
  const pairs = [
    ["produkte-konsum", COMMON["produkte-konsum"]],
    ["wp-produkte", COMMON["produkte-konsum"]],
    ["wirkungsumsatzsteuer", COMMON["produkte-konsum"]],
    ["produktwirkungssteuer", COMMON["produkte-konsum"]],
    ["produktscorecards", COMMON["produkte-konsum"]],
    ["impact-controlling", COMMON["impact-controlling"]],
    ["woek-master-items", COMMON["impact-controlling"]],
    ["woek-ids", COMMON["impact-controlling"]],
    ["scorecards", COMMON["impact-controlling"]],
    ["netto-wirkungs-index", COMMON["impact-controlling"]],
    ["reverse-merit-order", COMMON["impact-controlling"]],
    ["benchmarks-archetypen", COMMON["impact-controlling"]],
    ["datenqualitaet-assurance", COMMON["impact-controlling"]],
    ["digitale-produktpaesse-wirkungsdatenraeume", COMMON["impact-controlling"]],
    ["kii-statt-kpi", COMMON["impact-controlling"]],
    ["staat-recht-demokratie", COMMON["staat-recht-demokratie"]],
    ["wirkungssteuergesetz", COMMON["staat-recht-demokratie"]],
    ["wirkungshaushalt", COMMON["staat-recht-demokratie"]],
    ["wirkungsrat", COMMON["staat-recht-demokratie"]],
    ["politische-wirkungspruefung", COMMON["staat-recht-demokratie"]],
    ["wirkungseinkommensteuer", COMMON["staat-recht-demokratie"]],
    ["wstg", COMMON["staat-recht-demokratie"]],
    ["wustg", COMMON["staat-recht-demokratie"]],
    ["wirtschaft-unternehmen", COMMON["wirtschaft-unternehmen"]],
    ["unternehmens-wirkungscheck", COMMON["wirtschaft-unternehmen"]],
    ["wohnen-stadt", COMMON["wohnen-stadt"]],
    ["bildung", COMMON.bildung],
    ["medien-oeffentlichkeit", COMMON["medien-oeffentlichkeit"]],
    ["gesundheit-pflege", COMMON["gesundheit-pflege"]],
  ];
  return pairs.find(([needle]) => rel.includes(needle))?.[1] || COMMON.default;
}

function renderPoliticalBlock(context) {
  const rows = Object.entries(context.rows)
    .map(([label, text]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(text)}</td></tr>`)
    .join("");
  return `<section class="section" aria-labelledby="political-implementation">
    <div class="card">
      <p class="hero-kicker">Umsetzung</p>
      <h2 id="political-implementation" class="implementation-title">Politische Anschlussfähigkeit und Umsetzung <a class="cite-anchor no-print" href="#political-implementation" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
      <p>${escapeHtml(STANDARD_INTRO)}</p>
      <div class="table-wrap"><table class="data-table political-implementation-table">
        <thead><tr><th>Ebene</th><th>Konkrete Ausgestaltung für ${escapeHtml(context.label)}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>
  </section>`;
}

function replaceExisting(html, block) {
  let next = html;
  const patterns = [
    /<section class="section" aria-labelledby="political-(?:implementation|options)">[\s\S]*?<\/section>/g,
    /<section class="section" aria-labelledby="political-implementation"><div class="card">[\s\S]*?<\/div><\/section>/g,
  ];
  for (const pattern of patterns) {
    next = next.replace(pattern, block);
  }
  return next;
}

function insertBeforeBestAnchor(html, block) {
  const anchors = [
    /<section class="section" aria-labelledby="sdg-title">/,
    /<section class="section" aria-labelledby="book-anchors">/,
    /<section class="section" aria-labelledby="downloads">/,
    /<section class="section" aria-labelledby="context-tools">/,
    /<\/main>/,
  ];
  for (const anchor of anchors) {
    const match = html.match(anchor);
    if (match?.index !== undefined) {
      return `${html.slice(0, match.index)}${block}\n      ${html.slice(match.index)}`;
    }
  }
  return html;
}

let changed = 0;
let already = 0;

const files = TARGET_ROOTS.flatMap((root) => listHtmlFiles(path.join(ROOT, root)));
for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (!isRelevant(rel)) continue;
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("<main")) continue;
  if (/data-no-political-standard/.test(html)) continue;
  const block = renderPoliticalBlock(contextFor(rel));
  let next = replaceExisting(html, block);
  if (!next.includes('id="political-implementation"')) {
    next = insertBeforeBestAnchor(next, block);
  }
  if (next === html) {
    already += 1;
    continue;
  }
  fs.writeFileSync(file, next, "utf8");
  changed += 1;
}

console.log(`Applied political implementation standard to ${changed} pages; ${already} unchanged.`);
