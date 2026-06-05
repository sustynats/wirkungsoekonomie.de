import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";
const ASSET_VERSION = "20260603-psychology-library";
const outRoot = "wirkungsradar/psychologie";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function sentence(value) {
  const text = String(value ?? "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function cleanList(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function summaryGrid(items, label, className = "") {
  return `<div class="radar-summary-grid ${className}" aria-label="${escapeHtml(label)}">
${items.map(([itemLabel, value, tone = "neutral"]) => `          <article class="radar-summary-item" data-tone="${escapeHtml(tone)}"><p class="radar-summary-label">${escapeHtml(itemLabel)}</p><p class="radar-summary-value">${escapeHtml(value)}</p></article>`).join("\n")}
        </div>`;
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value.map((item) => {
      if (item && typeof item === "object") {
        const rendered = toYaml(item, indent + 2);
        return `${pad}- ${rendered.trimStart()}`;
      }
      return `${pad}- ${JSON.stringify(item)}`;
    }).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        if (Array.isArray(item) || (item && typeof item === "object")) return `${pad}${key}:\n${toYaml(item, indent + 2)}`;
        return `${pad}${key}: ${JSON.stringify(item)}`;
      })
      .join("\n");
  }
  return `${pad}${JSON.stringify(value)}`;
}

const uiSentences = [
  "Ich beantworte das, aber ich übernehme nicht den Frame.",
  "Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.",
  "Der wahre Kern ist … Der Denkfehler ist … Die bessere Wirkungsfrage lautet …",
  "Nicht lauter werden. Den Mechanismus sichtbar machen.",
  "Kommunikative Souveränität heißt: ruhig bleiben, Frame erkennen, Wirkung klären.",
  "Nicht manipulieren. Mechanismus erkennen. Frame halten. Wirkung zurückführen.",
  "Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.",
];

const psychologyNotice =
  "Psychologische Effekte sind keine Diagnose einzelner Personen. Sie beschreiben allgemeine menschliche Wahrnehmungs- und Kommunikationsmuster. Der Wirkungsradar nutzt sie, um Frames, Resonanzräume und Wirkungsrisiken sichtbar zu machen - nicht um Menschen abzuwerten.";

const keyPoints = [
  ["Fakten allein reichen nicht", "Eine Aussage kann faktisch schwach sein und trotzdem stark wirken, wenn sie Angst, Kränkung, Statusverlust oder Zugehörigkeit aktiviert.", "warning"],
  ["Psychologie ist kein Defizit", "Kognitive Effekte sind normale menschliche Wahrnehmungsmuster, keine Diagnose einzelner Personen.", "positive"],
  ["Narrative nutzen Bedürfnisse", "Sicherheit, Kontrolle, Identität, Entlastung und Sinn machen Aussagen anschlussfähig.", "neutral"],
  ["Manipulation beginnt oft mit dem Frame", "Viele Stöckchen funktionieren, weil sie die falsche Voraussetzung bereits in die Frage einbauen.", "critical"],
  ["Souveränität heißt Framekontrolle", "Nicht lauter werden, sondern Gefühl, Fakt und Folgerung trennen.", "positive"],
  ["Die beste Antwort führt zur Wirkung", "Nicht nur widersprechen, sondern fragen: Welche Maßnahme verbessert den Zustand messbar?", "positive"],
];

const effects = [
  {
    id: "kognitive-dissonanz",
    title: "Kognitive Dissonanz",
    shortDefinition: "Spannungszustand, wenn neue Informationen den eigenen Überzeugungen, der Identität oder dem bisherigen Verhalten widersprechen.",
    whyItWorks: "Menschen wollen innere Konsistenz. Wenn Fakten eine bisherige Haltung infrage stellen, entsteht psychischer Druck. Dieser Druck wird oft durch Abwertung der Quelle, Ausweichen oder Umdeutung reduziert.",
    typicalNarratives: ["Man darf ja nichts mehr sagen", "Die Wissenschaft ist gekauft", "Mainstreammedien lügen alle", "E-Autos sind schlimmer als Verbrenner"],
    emotionalHooks: ["Kränkung", "Selbstschutz", "Gesichtsverlust vermeiden"],
    risk: "Fakten werden nicht geprüft, sondern abgewehrt, weil sie als Angriff auf die eigene Person oder Gruppe erlebt werden.",
    responsePrinciple: "Gesichtswahrend korrigieren: Person respektieren, Aussage prüfen.",
    manipulationPatterns: ["Opferinszenierung", "Quellenzerstörung", "Frame-Übernahme"],
    hostSentences: ["Ich greife nicht dich an, sondern ich prüfe die Aussage.", "Es ist völlig okay, seine Einschätzung zu ändern, wenn neue Informationen dazukommen.", "Lass uns Gefühl, Fakt und Schlussfolgerung trennen."],
    relatedNarratives: ["Opferumkehr", "Wissenschaftsdelegitimierung", "Medienfeindbild"],
    relatedLiveCards: ["man-darf-ja-nichts-mehr-sagen", "die-wissenschaft-ist-gekauft", "mainstreammedien-luegen-alle"],
    mpd: { mensch: "Gesichtsverlust und Abwehr können Lernen blockieren.", planet: "Klimawirkung wird abgewehrt, wenn sie bisherige Entscheidungen infrage stellt.", demokratie: "Korrekturen werden als Angriff statt als Lernprozess erlebt." },
  },
  {
    id: "bestaetigungsfehler",
    title: "Bestätigungsfehler",
    shortDefinition: "Tendenz, Informationen stärker zu beachten, die zur eigenen Überzeugung passen, und widersprechende Informationen abzuwerten.",
    whyItWorks: "Menschen suchen nicht nur Wahrheit, sondern auch Orientierung und Stabilität. Informationen, die zum bisherigen Weltbild passen, fühlen sich schneller plausibel an.",
    typicalNarratives: ["Die da oben machen sowieso, was sie wollen", "SDGs sind Weltregierung", "Die Wissenschaft ist gekauft", "Klimawandel gab es schon immer"],
    emotionalHooks: ["Vertrautheit", "Gruppengefühl", "Misstrauen gegen Gegenseite"],
    risk: "Die Debatte wird immun gegen Korrektur, weil nur noch passende Belege akzeptiert werden.",
    responsePrinciple: "Gemeinsamen Ausgangspunkt suchen und dann die Bilanzgrenze öffnen.",
    manipulationPatterns: ["Quellenzerstörung", "Beweislastumkehr", "Teilfakt als Totalurteil"],
    hostSentences: ["Welche Information würde deine Einschätzung verändern?", "Lass uns beide Quellen nebeneinanderlegen.", "Was müsste stimmen, damit diese Schlussfolgerung trägt?"],
    relatedNarratives: ["Elitenverschwörung", "Kontrollverlust", "Wissenschaftsdelegitimierung"],
    relatedLiveCards: ["sdgs-weltregierung", "die-da-oben", "die-wissenschaft-ist-gekauft"],
    mpd: { mensch: "Orientierung wird enger, Korrektur wird schwerer.", planet: "Unpassende Klima- und Energiedaten werden leichter ausgeblendet.", demokratie: "Gemeinsame Belegkriterien zerfallen." },
  },
  {
    id: "motiviertes-denken",
    title: "Motiviertes Denken",
    shortDefinition: "Informationsverarbeitung, bei der gewünschte Schlussfolgerungen, Identität oder Gruppenzugehörigkeit geschützt werden.",
    whyItWorks: "Menschen verarbeiten Informationen nicht neutral, wenn viel soziale Identität daran hängt.",
    typicalNarratives: ["Klimaschutz ist Ökodiktatur", "Wirkungsökonomie ist Planwirtschaft", "Wirkungsökonomie ist Social Credit", "Gender-Ideologie"],
    emotionalHooks: ["Identitätsschutz", "Freiheitsangst", "Statusschutz"],
    risk: "Fakten werden als Lagerangriff erlebt.",
    responsePrinciple: "Wertebrücke bauen: Freiheit, Würde und Kontrolle anerkennen, dann die Wirkungsfrage stellen.",
    manipulationPatterns: ["Frame-Übernahme", "falsches Dilemma", "Emotion vor Klärung"],
    hostSentences: ["Die Sorge vor Kontrolle ist wichtig. Genau deshalb müssen wir sauber unterscheiden.", "Hier geht es nicht um Personenbewertung, sondern um Produkt- und Systemwirkung.", "Welche Freiheit wollen wir schützen - und welche Schäden verhindern?"],
    relatedNarratives: ["Verbotsnarrativ", "Normalisierung", "Zersetzung"],
    relatedLiveCards: ["klimaschutz-ist-oekodiktatur", "wirkungsoekonomie-social-credit", "wirkungsoekonomie-planwirtschaft"],
    mpd: { mensch: "Fakten können als Identitätsangriff erlebt werden.", planet: "Wirksame Maßnahmen werden abgewehrt, wenn sie Lageridentität berühren.", demokratie: "Debatten kippen von Sachprüfung in Lagerkampf." },
  },
  {
    id: "reaktanz",
    title: "Reaktanz",
    shortDefinition: "Abwehrreaktion, wenn Menschen ihre Freiheit, Kontrolle oder Selbstbestimmung bedroht sehen.",
    whyItWorks: "Wenn etwas als Verbot oder Bevormundung gerahmt wird, entsteht Trotz - selbst dann, wenn die Maßnahme Schutz oder Fairness bezweckt.",
    typicalNarratives: ["Die wollen uns alles verbieten", "Klimaschutz ist Ökodiktatur", "Das ist Zensur", "Wirkungsökonomie ist Social Credit"],
    emotionalHooks: ["Freiheitsverlust", "Kontrollverlust", "Trotz"],
    risk: "Sachfragen werden zu Identitäts- und Freiheitskämpfen.",
    responsePrinciple: "Regel, Preis, Schutz, Verbot und Wahlmöglichkeiten unterscheiden.",
    manipulationPatterns: ["Falsche Voraussetzung", "Opferinszenierung", "Falsches Dilemma"],
    hostSentences: ["Nicht jede Regel ist ein Verbot.", "Welche Freiheit wird hier wirklich eingeschränkt - und welche Freiheit wird geschützt?", "Lass uns Verhältnismäßigkeit prüfen."],
    relatedNarratives: ["Verbotsnarrativ", "Opferumkehr", "Kontrollverlust"],
    relatedLiveCards: ["das-ist-zensur", "klimaschutz-ist-oekodiktatur", "man-darf-ja-nichts-mehr-sagen"],
    mpd: { mensch: "Schutzmaßnahmen können als Angriff erlebt werden.", planet: "Klimaschutz wird in Kulturkampf übersetzt.", demokratie: "Moderation und Regeln werden als Unterdrückung gerahmt." },
  },
  {
    id: "verlustaversion",
    title: "Verlustaversion",
    shortDefinition: "Tendenz, Verluste stärker zu gewichten als gleich große Gewinne.",
    whyItWorks: "Menschen reagieren stärker auf das Gefühl, dass ihnen etwas genommen wird, als auf abstrakte Zukunftsgewinne.",
    typicalNarratives: ["CO₂-Preis ist Abzocke", "Klimaschutz macht alles unbezahlbar", "Die verbieten uns das Auto", "Wohlstand geht verloren"],
    emotionalHooks: ["Kostenangst", "Statusverlust", "Besitzschutz"],
    risk: "Kurzfristig sichtbare Kosten verdrängen langfristig größere Systemkosten.",
    responsePrinciple: "Sichtbare Rechnung und unsichtbare Rechnung nebeneinanderlegen.",
    manipulationPatterns: ["Sichtbare Rechnung gegen unsichtbare Kosten", "Falsches Dilemma", "Frame-Übernahme"],
    hostSentences: ["Vergleichen wir den sichtbaren Preis mit null Kosten - oder mit den realen Folgekosten?", "Was kostet Nicht-Handeln?", "Welche Entlastung und welche Alternative gibt es konkret?"],
    relatedNarratives: ["Verbotsnarrativ", "Verzögerung", "Scheiternsframe"],
    relatedLiveCards: ["co2-preis-oder-fossile-systemkosten", "klimaschutz-deindustrialisiert-deutschland"],
    mpd: { mensch: "Belastung wird real, aber unvollständig wahrgenommen.", planet: "Unsichtbare ökologische Folgekosten bleiben draußen.", demokratie: "Kostenangst wird politisch leicht instrumentalisierbar." },
  },
  {
    id: "verfuegbarkeitsheuristik",
    title: "Verfügbarkeitsheuristik",
    shortDefinition: "Tendenz, leicht erinnerbare oder emotional starke Beispiele für häufiger oder typischer zu halten.",
    whyItWorks: "Ein emotionaler Einzelfall bleibt stärker hängen als eine nüchterne Grundgesamtheit.",
    typicalNarratives: ["Windräder töten Vögel", "Kriminalität ist vor allem Migration", "Einzelfall als Systembeweis", "Batterien brennen ständig"],
    emotionalHooks: ["Schock", "Angst", "Empörung"],
    risk: "Einzelfälle ersetzen Verhältnis, Häufigkeit und Kontext.",
    responsePrinciple: "Einzelfall anerkennen, dann Grundgesamtheit und Alternativenvergleich zeigen.",
    manipulationPatterns: ["Teilfakt als Totalurteil", "Emotion vor Klärung", "Komplexitätsbruch"],
    hostSentences: ["Der Fall ist ernst. Aber ist er typisch?", "Welche Grundgesamtheit betrachten wir?", "Wie sieht der Vergleich mit den Alternativen aus?"],
    relatedNarratives: ["Scheiternsframe", "Sündenbock", "Medienfeindbild"],
    relatedLiveCards: ["windraeder-zerstoeren-natur", "batterien-sind-nicht-recyclebar"],
    mpd: { mensch: "Angst wird durch auffällige Einzelfälle verstärkt.", planet: "Alternativenvergleich verschwindet.", demokratie: "Einzelfalllogik kann harte Scheinlösungen plausibel machen." },
  },
  {
    id: "wahrheitsillusion",
    title: "Wahrheitsillusion",
    shortDefinition: "Wiederholte Aussagen fühlen sich vertrauter und dadurch wahrer an, auch wenn sie nicht besser belegt sind.",
    whyItWorks: "Vertrautheit wird mit Plausibilität verwechselt.",
    typicalNarratives: ["Deutschland rettet das Klima nicht allein", "Mainstreammedien lügen", "CO₂ ist nur ein Spurengas", "Energiewende gescheitert"],
    emotionalHooks: ["Vertrautheit", "Wiederholung", "Gruppenbestätigung"],
    risk: "Slogans werden zu gefühlten Wahrheiten.",
    responsePrinciple: "Nicht endlos den Mythos wiederholen; Fakten-Sandwich nutzen.",
    manipulationPatterns: ["Frame-Übernahme", "Quellenzerstörung", "Normalisierung"],
    hostSentences: ["Der Satz klingt bekannt, aber Bekanntheit ist kein Beleg.", "Kurz der Mythos - dann der Denkfehler - dann zurück zum Fakt."],
    relatedNarratives: ["Normalisierung", "Medienfeindbild", "Ohnmacht"],
    relatedLiveCards: ["deutschland-nur-zwei-prozent", "mainstreammedien-luegen-alle", "co2-ist-nur-ein-spurengas"],
    mpd: { mensch: "Vertrautheit kann Orientierung ersetzen.", planet: "Wiederholte Klimamythen senken Handlungsdruck.", demokratie: "Slogans verdrängen Belegprüfung." },
  },
  {
    id: "ingroup-outgroup",
    title: "Ingroup/Outgroup-Effekt",
    shortDefinition: "Tendenz, die eigene Gruppe positiver und andere Gruppen homogener, fremder oder bedrohlicher wahrzunehmen.",
    whyItWorks: "Zugehörigkeit gibt Sicherheit. In Krisen werden Grenzen zwischen Wir und Die emotional stärker.",
    typicalNarratives: ["Wir gegen die", "Altparteien gegen Volk", "Deutsche gegen Migranten", "Patrioten gegen Ideologen"],
    emotionalHooks: ["Zugehörigkeit", "Statusschutz", "Gruppenloyalität"],
    risk: "Pluralismus wird zu Lagerkampf, Kompromiss zu Verrat.",
    responsePrinciple: "Gruppenpauschalisierung auflösen und gemeinsame Wirkungsinteressen sichtbar machen.",
    manipulationPatterns: ["Sündenbocklogik", "Falsches Dilemma", "Opferinszenierung"],
    hostSentences: ["Nicht alle Menschen einer Gruppe verursachen dieses Problem.", "Welche konkrete Struktur erzeugt den Schaden?", "Welche Lösung verbessert die Lage, ohne Gruppen gegeneinanderzustellen?"],
    relatedNarratives: ["Sündenbock", "Zersetzung", "Elitenverschwörung"],
    relatedLiveCards: ["die-da-oben", "man-wird-doch-wohl-fragen-duerfen"],
    mpd: { mensch: "Gruppenabwertung beschädigt Zugehörigkeit und Sicherheit.", planet: "Gemeinsame ökologische Aufgaben werden zu Lagerfragen.", demokratie: "Pluralismus wird als Verrat gelesen." },
  },
  {
    id: "nullsummendenken",
    title: "Nullsummendenken",
    shortDefinition: "Fehleinschätzung, dass der Gewinn einer Gruppe automatisch der Verlust einer anderen Gruppe sein müsse.",
    whyItWorks: "In Unsicherheit wirken Ressourcen knapp. Dann wird Teilhabe anderer schnell als Bedrohung erlebt.",
    typicalNarratives: ["Migration nimmt uns alles weg", "Klimaschutz gegen Wohlstand", "Frauenförderung benachteiligt Männer", "Stadt gegen Land"],
    emotionalHooks: ["Knappheit", "Neid", "Verteilungskonflikt"],
    risk: "Gemeinsame Lösungen verschwinden hinter Gruppenkonkurrenz.",
    responsePrinciple: "Wirkungsbilanz statt Gruppenkampf.",
    manipulationPatterns: ["Falsches Dilemma", "Sündenbocklogik", "Komplexitätsbruch"],
    hostSentences: ["Ist das wirklich ein Nullsummenspiel?", "Welche Maßnahme verbessert die Lage für mehrere Gruppen?", "Wo liegt der echte Engpass?"],
    relatedNarratives: ["Sündenbock", "Verbotsnarrativ", "Zersetzung"],
    relatedLiveCards: ["klimaschutz-deindustrialisiert-deutschland"],
    mpd: { mensch: "Knappheitsstress verschärft Gruppenkonflikte.", planet: "Transformation wird als Wegnahme statt als Schutzbilanz gelesen.", demokratie: "Gemeinsame Lösungen verlieren Plausibilität." },
  },
  {
    id: "statusbedrohung",
    title: "Statusbedrohung",
    shortDefinition: "Gefühl, dass eigene Anerkennung, Lebensweise oder soziale Position abgewertet oder verdrängt wird.",
    whyItWorks: "Status ist ein soziales Sicherheitssignal. Wenn er bedroht wirkt, steigt Abwehr gegen Veränderung.",
    typicalNarratives: ["Woke gegen normale Bürger", "Gender-Ideologie", "Tradition wird zerstört", "Die eigene Kultur verschwindet"],
    emotionalHooks: ["Kränkung", "Identitätsverlust", "Anerkennungsangst"],
    risk: "Kulturelle Konflikte verdrängen Sachfragen.",
    responsePrinciple: "Würde sichern, ohne Abwertung anderer Gruppen zu übernehmen.",
    manipulationPatterns: ["Emotion vor Klärung", "Opferinszenierung", "Falsches Dilemma"],
    hostSentences: ["Niemand muss seine Würde verlieren, damit andere gleiche Rechte haben.", "Lass uns Tradition und Gleichwertigkeit nicht gegeneinanderstellen.", "Welche konkrete Regel ist problematisch?"],
    relatedNarratives: ["Opferumkehr", "Normalisierung", "Zersetzung"],
    relatedLiveCards: ["man-darf-ja-nichts-mehr-sagen", "das-ist-zensur"],
    mpd: { mensch: "Kränkung und Statusangst erhöhen Abwehr.", planet: "Sachfragen können in Kulturkampf verschwinden.", demokratie: "Gleichwertigkeit wird als Statusverlust gerahmt." },
  },
  {
    id: "kontrollbeduerfnis",
    title: "Kontrollbedürfnis",
    shortDefinition: "Menschliches Bedürfnis nach Ordnung, Vorhersagbarkeit und Handlungsfähigkeit.",
    whyItWorks: "Komplexe Krisen erzeugen Kontrollverlust. Einfache Schuldige und harte Maßnahmen fühlen sich dann entlastend an.",
    typicalNarratives: ["Die da oben kontrollieren uns", "Grenzen dicht", "Task Force Abschiebungen", "Alles gesteuert"],
    emotionalHooks: ["Sicherheitswunsch", "Misstrauen", "Kontrollverlust"],
    risk: "Autoritäre Scheinlösungen wirken attraktiver.",
    responsePrinciple: "Echte Kontrolle durch Transparenz, Verfahren, Rechtsstaat und messbare Wirkung zeigen.",
    manipulationPatterns: ["Falsche Voraussetzung", "Beweislastumkehr", "Heilsversprechen"],
    hostSentences: ["Kontrolle entsteht nicht durch Härte allein, sondern durch wirksame Verfahren.", "Welche konkrete Maßnahme wirkt - und ist rechtsstaatlich?", "Was ist nachprüfbar?"],
    relatedNarratives: ["Kontrollverlust", "Elitenverschwörung", "Zersetzung"],
    relatedLiveCards: ["das-ist-alles-gesteuert", "sdgs-weltregierung", "wirkungsoekonomie-social-credit"],
    mpd: { mensch: "Unsicherheit kann Härtewünsche verstärken.", planet: "Komplexe Systemlösungen wirken unkontrollierbar.", demokratie: "Autoritäre Vereinfachungen gewinnen Anschluss." },
  },
  {
    id: "ohnmacht",
    title: "Gelernte Ohnmacht",
    shortDefinition: "Zustand, in dem Menschen Handeln für sinnlos halten, weil sie Veränderung nicht mehr als wirksam erleben.",
    whyItWorks: "Wenn Probleme sehr groß wirken, entlastet der Gedanke: Es bringt sowieso nichts.",
    typicalNarratives: ["Deutschland ist nur 2 %", "Meine Stimme zählt nicht", "Die da oben machen sowieso, was sie wollen", "Es ist alles zu spät"],
    emotionalHooks: ["Resignation", "Entlastung", "Zynismus"],
    risk: "Nicht-Handeln wird plausibel.",
    responsePrinciple: "Hebel sichtbar machen und kleine Wirkung nicht mit Wirkungslosigkeit verwechseln.",
    manipulationPatterns: ["Ohnmachtsanker", "Whataboutism", "Moving Goalposts"],
    hostSentences: ["Niemand löst alles allein. Aber daraus folgt nicht Wirkungslosigkeit.", "Welche Hebel haben wir trotzdem?", "Was wäre die Wirkung von Unterlassen?"],
    relatedNarratives: ["Ohnmacht", "Whataboutism", "Verzögerung"],
    relatedLiveCards: ["deutschland-nur-zwei-prozent", "die-da-oben"],
    mpd: { mensch: "Selbstwirksamkeit sinkt.", planet: "Unterlassen wird wahrscheinlicher.", demokratie: "Beteiligung und Korrekturfähigkeit nehmen ab." },
  },
];

const patterns = [
  ["falsche-voraussetzung", "Falsche Voraussetzung", "Eine Frage oder Aussage enthält bereits eine unbelegte Annahme.", "Warum wollt ihr uns alles verbieten?", "Wer antwortet, übernimmt unbewusst den Verbotsframe.", "Voraussetzung prüfen, bevor man antwortet.", "Ich beantworte das, aber zuerst prüfe ich die Voraussetzung: Wer verbietet was genau?"],
  ["beweislastumkehr", "Beweislastumkehr", "Eine unbelegte Behauptung wird aufgestellt, und die Gegenseite soll beweisen, dass sie falsch ist.", "Beweis doch, dass die SDGs keine Weltregierung sind.", "Unbelegte Verdachtslogik wird zur Gesprächsgrundlage.", "Belege für die Ausgangsbehauptung verlangen.", "Wer eine starke Behauptung aufstellt, muss sie zuerst belegen."],
  ["gish-gallop", "Gish Gallop", "Viele Behauptungen werden schnell hintereinander aufgestellt, sodass eine saubere Prüfung kaum möglich ist.", "Klima, Migration, Medien, Gender, EU - alles hängt zusammen und ist gesteuert.", "Überforderung ersetzt Klärung.", "Auf einen prüfbaren Punkt begrenzen.", "Ich nehme einen Punkt nach dem anderen. Welche Behauptung soll zuerst geprüft werden?"],
  ["moving-goalposts", "Moving Goalposts", "Sobald ein Punkt geklärt ist, wird der Maßstab verschoben.", "Okay, aber was ist mit China? Okay, aber was ist mit Batterien?", "Klärung wird endlos verschoben.", "Kriterium vorab festlegen.", "Was wäre für dich eine geklärte Antwort auf genau diese Frage?"],
  ["frame-uebernahme", "Frame-Übernahme", "Man argumentiert innerhalb des gegnerischen Deutungsrahmens und verstärkt ihn dadurch.", "Wir leben nicht in einer Klimadiktatur.", "Der problematische Begriff bleibt hängen.", "Frame markieren und ersetzen.", "Ich übernehme den Diktaturframe nicht. Die sachliche Frage ist demokratische Kontrolle und soziale Fairness."],
  ["opferinszenierung", "Opferinszenierung", "Kritik wird als Unterdrückung oder Verfolgung der sprechenden Person dargestellt.", "Man darf ja nichts mehr sagen.", "Die Wirkung der Aussage verschwindet hinter dem Opfergefühl.", "Meinungsfreiheit und Widerspruchsfreiheit trennen.", "Du darfst das sagen. Andere dürfen widersprechen. Widerspruch ist keine Zensur."],
  ["suedenbocklogik", "Sündenbocklogik", "Komplexe Probleme werden auf eine Gruppe reduziert.", "Migration ist schuld an Wohnungsnot, Kriminalität und Sozialkosten.", "Feindbilder ersetzen Ursachenanalyse.", "Problem anerkennen, Gruppenschuld trennen.", "Das Problem ist real. Aber eine ganze Gruppe zur Ursache zu machen, verhindert Lösungen."],
  ["quellenzerstoerung", "Quellenzerstörung", "Alle etablierten Korrekturinstanzen werden pauschal delegitimiert.", "Medien lügen alle. Wissenschaft ist gekauft.", "Gemeinsame Faktenbasis zerfällt.", "Konkrete Quelle, konkrete Aussage, konkrete Belege prüfen.", "Medienkritik ja. Pauschale Quellenzerstörung nein."],
  ["falsches-dilemma", "Falsches Dilemma", "Es werden nur zwei extreme Optionen dargestellt, obwohl es Zwischenlösungen gibt.", "Entweder Freiheit oder Klimaschutz.", "Kompromiss- und Gestaltungsräume verschwinden.", "Dritte Optionen sichtbar machen.", "Die Frage ist nicht Freiheit oder Klimaschutz, sondern welche Klimapolitik Freiheit, Gesundheit und Zukunft schützt."],
  ["teilfakt-als-totalurteil", "Teilfakt als Totalurteil", "Ein echter Einzelaspekt wird zum Gesamturteil über ein ganzes System gemacht.", "Batterien brauchen Rohstoffe, also sind E-Autos schlimmer.", "Lebenszyklus und Alternativenvergleich verschwinden.", "Systemgrenze öffnen.", "Der Punkt ist real. Aber er ist ein Teil des Lebenszyklus, nicht das Gesamturteil."],
  ["emotion-vor-klaerung", "Emotion vor Klärung", "Eine Aussage ist so formuliert, dass Empörung oder Abwehr schneller kommt als Analyse.", "Die wollen unsere Kinder umerziehen.", "Die Debatte springt sofort in Schutz- und Kampfmodus.", "Emotion anerkennen, Sachfrage präzisieren.", "Ich sehe, dass das emotional ist. Was genau ist die konkrete Maßnahme, über die wir sprechen?"],
  ["heilsversprechen", "Heilsversprechen", "Eine einfache, perfekte Lösung wird versprochen, die komplexe Nebenfolgen ausblendet.", "Fusion löst das Energieproblem. Kernkraft wäre die einfache Lösung.", "Heute verfügbare Maßnahmen verlieren Dringlichkeit.", "Zeithorizont, Skalierung und Opportunitätskosten prüfen.", "Forschung ja. Aber was wirkt rechtzeitig und skalierbar?"],
].map(([id, title, definition, example, risk, counterMove, hostSentence]) => ({ id, title, definition, example, risk, counterMove, hostSentence }));

const debiasingMoves = [
  ["gefuehl-fakt-folgerung-trennen", "Gefühl, Fakt und Folgerung trennen", "Wenn eine Aussage emotional stark aufgeladen ist.", "Das Gefühl wird anerkannt, der Fakt geprüft und die politische Folgerung separat bewertet.", "Ich verstehe die Sorge. Der Fakt ist aber ein anderer Punkt. Und die Schlussfolgerung daraus müssen wir sauber prüfen.", ["Gefühl lächerlich machen", "nur mit Zahlen antworten", "die Folgerung ungeprüft übernehmen"]],
  ["frame-markieren", "Frame markieren", "Wenn eine Aussage eine falsche Voraussetzung setzt.", "Der Deutungsrahmen wird sichtbar gemacht, bevor man inhaltlich antwortet.", "Ich beantworte das, aber ich übernehme nicht den Frame.", ["im Frame weiterdiskutieren", "nur verneinen", "den Kampfbegriff wiederholen"]],
  ["wahren-kern-anerkennen", "Wahren Kern anerkennen", "Wenn eine Aussage einen echten Problemanteil enthält.", "Der echte Punkt wird anerkannt, aber von der falschen Verallgemeinerung getrennt.", "Der reale Punkt ist: Es gibt Überforderung. Der Denkfehler ist: Daraus eine ganze Gruppe verantwortlich zu machen.", ["Problem wegreden", "überheblich wirken", "pauschal moralisieren"]],
  ["systemgrenze-oeffnen", "Systemgrenze öffnen", "Bei Teilfakten, verkürzten Bilanzen und falschen Lebenszyklusvergleichen.", "Die Debatte wird vom isolierten Einzelpunkt auf Lebenszyklus, Bilanzgrenze und Alternativenvergleich erweitert.", "Das ist ein echter Teilaspekt. Aber für das Gesamturteil brauchen wir den Lebenszyklus und den Vergleich mit Alternativen.", ["Teilaspekt kleinreden", "Durchschnittswerte ohne Kontext nutzen", "Alternativen ausblenden"]],
  ["beweislast-zurueckgeben", "Beweislast zurückgeben", "Bei unbelegten Unterstellungen, Verschwörungsframes oder Social-Credit-Vorwürfen.", "Starke Behauptungen müssen zuerst belegt werden.", "Welche konkrete Quelle belegt diese Behauptung?", ["unbelegte Behauptung wie bewiesen behandeln", "endlos Gegenbeweise liefern", "in Verdachtslogik einsteigen"]],
  ["engpass-statt-totalurteil", "Engpass statt Totalurteil", "Bei Scheiternsframes.", "Probleme werden nicht geleugnet, sondern als lösbare Engpässe analysiert.", "Probleme sind nicht automatisch Scheitern. Welcher Engpass begrenzt gerade die Wirkung?", ["alles schönreden", "Totalurteil spiegeln", "Komplexität vermeiden"]],
  ["wirkungsfrage-stellen", "Wirkungsfrage stellen", "Immer dann, wenn ein Gespräch in Schuld, Lagerkampf oder Ohnmacht kippt.", "Die Debatte wird von Identität und Schuld auf messbare Verbesserung zurückgeführt.", "Welche Maßnahme verbessert den Zustand messbar - ohne Nebenfolgen zu verdrängen?", ["nur moralisch argumentieren", "keine Lösung anbieten", "Menschen beschämen"]],
  ["wertebruecke-bauen", "Wertebrücke bauen", "Wenn Fakten als Angriff auf Identität, Freiheit oder Lebensweise erlebt werden.", "Ein geteilter Wert wird sichtbar gemacht, bevor der Denkfehler erklärt wird.", "Freiheit ist wichtig. Genau deshalb müssen Preise, Regeln und Schäden ehrlich sein.", ["Wert des Gegenübers lächerlich machen", "Sorge pathologisieren", "nur technokratisch antworten"]],
  ["nicht-amplifizieren", "Nicht amplifizieren", "Bei provokativen Kampfbegriffen und Triggerwörtern.", "Der Trigger wird nicht unnötig wiederholt; stattdessen wird der Mechanismus benannt.", "Das ist ein Bedrohungsframe. Die sachliche Frage ist: Welche konkrete Aufgabe lösen wir?", ["Trigger in Überschriften setzen", "Kampfbegriff mehrfach wiederholen", "Empörung als Hauptreaktion nutzen"]],
].map(([id, title, useWhen, howItWorks, exampleSentence, dontDo]) => ({ id, title, useWhen, howItWorks, exampleSentence, dontDo }));

const warningSigns = [
  ["Emotion vor Klärung", "Die Aussage ist so gebaut, dass du sofort wütend oder defensiv reagieren sollst.", "Ich sehe den emotionalen Punkt. Lass uns die konkrete Behauptung prüfen."],
  ["Falsche Voraussetzung", "Die Frage enthält bereits eine unbelegte Behauptung.", "Ich prüfe zuerst die Voraussetzung."],
  ["Beweislastumkehr", "Du sollst eine unbelegte Unterstellung widerlegen.", "Welche Quelle belegt die Ausgangsbehauptung?"],
  ["Themenverschiebung", "Sobald ein Punkt geklärt ist, wird ein neues Thema geöffnet.", "Wir bleiben kurz bei der ersten Frage."],
  ["Identitätsfalle", "Widerspruch wird als Angriff auf die Person oder Gruppe gerahmt.", "Ich kritisiere nicht dich, sondern ich prüfe die Aussage."],
  ["Empörungsverstärker", "Der Trigger soll Reichweite durch Empörung erzeugen.", "Ich reagiere nicht auf den Köder, sondern auf den Mechanismus."],
  ["Komplexitätsbruch", "Viele Ursachen werden auf einen Schuldigen, eine Elite oder ein Verbot reduziert.", "Das ist komplexer. Welche konkrete Ursache prüfen wir?"],
  ["Ohnmachtsanker", "Die Aussage legt nahe: Es bringt sowieso nichts.", "Niemand löst alles allein. Welche Hebel haben wir trotzdem?"],
].map(([title, description, hostSentence]) => ({ title, description, hostSentence }));

const frameSteps = [
  ["Stoppen", "Ich ordne das kurz ein.", "Tempo aus dem Frame nehmen, bevor die Debatte kippt."],
  ["Frame markieren", "Der Frame hier lautet: ...", "Die falsche Voraussetzung sichtbar machen."],
  ["Wahren Kern anerkennen", "Der reale Punkt ist ...", "Den berechtigten Anteil retten, ohne die Folgerung zu übernehmen."],
  ["Muster benennen", "Der Sprung passiert hier: ...", "Denkfehler oder psychologischen Hebel kurz erklären."],
  ["Wirkungsfrage stellen", "Die bessere Frage lautet ...", "Zur messbaren Wirkung zurückführen."],
  ["Kriterium verlangen", "Welche Maßnahme verbessert den Zustand messbar?", "Aus Schuld, Lagerkampf oder Verdacht wieder eine lösbare Frage machen."],
].map(([label, sentence, explanation]) => ({ label, sentence, explanation }));

const narrativePsychologyRows = [
  ["Ohnmacht", "gelernte Ohnmacht, Verantwortungsdiffusion", "Hebel sichtbar machen"],
  ["Verzögerung", "Status-quo-Bias, Unsicherheitsaversion", "Kosten des Wartens zeigen"],
  ["Sündenbock", "Ingroup/Outgroup, Nullsummendenken", "Problem anerkennen, Gruppenschuld trennen"],
  ["Kontrollverlust", "Reaktanz, Kontrollbedürfnis", "Transparenz und Verfahren prüfen"],
  ["Verbotsnarrativ", "Reaktanz, Verlustaversion", "Regel, Preis, Schutz und Verbot unterscheiden"],
  ["Elitenverschwörung", "Mustererkennung, Intentionalitätsbias", "konkrete Belege verlangen"],
  ["Wissenschaftsdelegitimierung", "Bestätigungsfehler, motiviertes Denken", "Methode und Korrektursystem erklären"],
  ["Medienfeindbild", "Hostile-Media-Effekt, Wahrheitsillusion", "konkrete Quelle prüfen"],
  ["Opferumkehr", "Reaktanz, Identitätsschutz", "Meinungsfreiheit von Widerspruch trennen"],
  ["Whataboutism", "Aufmerksamkeitsverschiebung", "zurück zur Ausgangsfrage"],
  ["Scheiternsframe", "Negativity Bias, Verfügbarkeitsheuristik", "Engpass statt Totalurteil"],
  ["Technikwunder-Aufschub", "Optimismusbias, moral licensing", "Forschung ja, Aufschub nein"],
  ["Normalisierung", "Wahrheitsillusion, Desensibilisierung", "erlaubt, wahr und wirkungsarm trennen"],
  ["Zersetzung", "Zynismusspirale, gelernte Ohnmacht", "Reformkritik von Delegitimierung trennen"],
];

const sourcePack = {
  sources: {
    debunking_handbook: {
      label: "The Debunking Handbook 2020",
      publisher: "George Mason University / University of Bristol / Partner",
      url: "https://www.climatechangecommunication.org/debunking-handbook-2020/",
      use_for: ["Fakten-Sandwich", "Prebunking", "Umgang mit Fehlinformation"],
    },
    conspiracy_theory_handbook: {
      label: "The Conspiracy Theory Handbook",
      publisher: "Lewandowsky / Cook",
      url: "https://www.climatechangecommunication.org/conspiracy-theory-handbook/",
      use_for: ["Verschwörungsdenken", "Mustererkennung", "Beweislastumkehr"],
    },
    cognitive_bias_codex: {
      label: "Cognitive Bias Codex",
      publisher: "Buster Benson / John Manoogian III",
      url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Cognitive_bias_codex_en.svg",
      use_for: ["Übersicht kognitiver Verzerrungen", "UI-Inspiration"],
    },
    apa_misinformation: {
      label: "APA - Misinformation and psychology resources",
      publisher: "American Psychological Association",
      url: "https://www.apa.org/topics/journalism-facts/misinformation",
      use_for: ["Psychologie von Fehlinformation", "Kommunikation"],
    },
    inoculation_theory: {
      label: "Inoculation theory / Prebunking research",
      publisher: "verschiedene wissenschaftliche Quellen",
      url: "https://inoculation.science/",
      use_for: ["Prebunking", "Resilienz gegen Manipulation"],
    },
  },
};

function pageShell({ title, description, canonical, main, base = "../../" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <meta name="search_type" content="Psychologie">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-menu-fix}">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Für Mensch, Planet und Demokratie.</p></div><a class="btn btn-primary" href="${base}kompass.html">WÖk-Kompass öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage1"></script>
  </body>
</html>`;
}

function psychologySubnav(current, base = "") {
  const links = [
    ["Überblick", ""],
    ["Effekte", "psychologische-effekte/"],
    ["Manipulationsmuster", "manipulationsmuster/"],
    ["Souveränität", "kommunikative-souveraenitaet/"],
    ["Stöckchen", "psychologische-stoeckchen/"],
    ["Debiasing", "debiasing-playbook/"],
  ];
  return `<nav class="topic-subnav" aria-label="Psychologie Navigation" data-search-exclude>
${links.map(([label, href]) => `        <a href="${base}${href}"${label === current ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
      </nav>`;
}

function radarSubnav() {
  return `<nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
        <a href="../">Überblick</a><a href="../methode/">Methode</a><a href="../wissen/">Wissen</a><a href="../live/">Live</a><a href="../narrative/">Narrative</a><a href="./" aria-current="page">Psychologie</a><a href="../themen/">Themen</a><a href="../detail/">Detail</a><a href="../was-der-wirkungsradar-nicht-ist/">Was er nicht ist</a>
      </nav>`;
}

function renderHubHero() {
  return `<section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Psychologie</nav>
          <p class="hero-kicker">Wirkungsradar</p>
          <h1 class="hero-title">Psychologie im Wirkungsradar</h1>
          <p class="hero-subtitle">Warum Narrative hängen bleiben - und wie man den Frame zurückholt.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Menschen reagieren nicht nur auf Fakten. Sie reagieren auf Sicherheit, Zugehörigkeit, Status, Vertrauen, Angst, Kontrolle, Kränkung, Hoffnung und Sinn. Narrative wirken deshalb nicht nur über ihren Wahrheitsgehalt, sondern über psychologische Anschlussfähigkeit. Der Wirkungsradar analysiert diese Effekte nicht, um Menschen abzuwerten, sondern um Wirkmechanismen sichtbar zu machen. Wer die psychologischen Muster erkennt, springt nicht mehr in jedes Stöckchen, übernimmt nicht jeden Frame und kann zur besseren Wirkungsfrage zurückführen.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Kernsatz: Nicht manipulieren. Mechanismus erkennen. Frame halten. Wirkung zurückführen.</span></p>
        </div>
      </section>`;
}

function effectCard(effect, prefix = "") {
  return `<a class="card text-link-card radar-psychology-card" href="${escapeHtml(prefix)}${escapeHtml(effect.id)}/"><p class="card-kicker">${escapeHtml(effect.emotionalHooks.join(" / "))}</p><h3 class="card-title">${escapeHtml(effect.title)}</h3><p class="card-text">${escapeHtml(effect.shortDefinition)}</p><p class="card-text"><strong>Antwortprinzip:</strong> ${escapeHtml(effect.responsePrinciple)}</p></a>`;
}

function renderEffectLibraryGrid(prefix = "") {
  return `<section class="section" id="effektbibliothek"><div><div class="section-header"><p class="hero-kicker">Effektbibliothek</p><h2>Psychologische Hebel im Wirkungsradar.</h2><p>${escapeHtml(psychologyNotice)}</p></div><div class="card-grid radar-psychology-grid">${effects.map((effect) => effectCard(effect, prefix)).join("\n")}</div></div></section>`;
}

function renderManipulationPatternLibrary() {
  return `<section class="section" id="musterbibliothek"><div><div class="section-header"><p class="hero-kicker">Manipulationsmuster</p><h2>Gesprächsmechanismen, die Frames setzen.</h2></div><div class="card-grid">${patterns.map((pattern) => `<article class="card"><p class="card-kicker">${escapeHtml(pattern.id)}</p><h3 class="card-title">${escapeHtml(pattern.title)}</h3><p class="card-text">${escapeHtml(pattern.definition)}</p><p class="card-text"><strong>Beispiel:</strong> ${escapeHtml(pattern.example)}</p><p class="card-text"><strong>Risiko:</strong> ${escapeHtml(pattern.risk)}</p><p class="card-text"><strong>Gegenbewegung:</strong> ${escapeHtml(pattern.counterMove)}</p><p class="card-text"><strong>Host-Satz:</strong> ${escapeHtml(pattern.hostSentence)}</p></article>`).join("\n")}</div></div></section>`;
}

function renderDebiasingPlaybook() {
  return `<section class="section" id="debiasing"><div><div class="section-header"><p class="hero-kicker">Debiasing-Playbook</p><h2>Strategien für Klärung statt Gegenmanipulation.</h2><p>Debiasing heißt im Wirkungsradar nicht, Menschen auszutricksen. Es heißt: bessere Bedingungen schaffen, damit Gefühl, Fakt, Folgerung und Wirkung wieder unterscheidbar werden.</p></div><div class="card-grid">${debiasingMoves.map((move) => `<article class="card"><p class="card-kicker">${escapeHtml(move.useWhen)}</p><h3 class="card-title">${escapeHtml(move.title)}</h3><p class="card-text">${escapeHtml(move.howItWorks)}</p><p class="card-text"><strong>Beispielsatz:</strong> ${escapeHtml(move.exampleSentence)}</p><p class="card-text"><strong>Nicht tun:</strong></p>${cleanList(move.dontDo)}</article>`).join("\n")}</div></div></section>`;
}

function renderFrameControlScript() {
  return `<section class="section section-soft" id="framekontrolle"><div><div class="section-header"><p class="hero-kicker">FrameControlScript</p><h2>Kommunikative Souveränität in sechs Schritten.</h2><p>Oberhand gewinnen heißt hier nicht Dominanz, sondern Klärung: Gefühl anerkennen, Fakt prüfen, Denkfehler benennen, Wirkung sichtbar machen und eine bessere Frage stellen.</p></div><ol class="timeline radar-flow">${frameSteps.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(step.label)}</strong><p>${escapeHtml(step.sentence)}</p><p>${escapeHtml(step.explanation)}</p></div></li>`).join("\n")}</ol><p class="formula-note"><strong>Kurzformel:</strong> Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</p></div></section>`;
}

function renderStoeckchenChecklist() {
  return `<section class="section" id="stoeckchen"><div><div class="section-header"><p class="hero-kicker">Psychologische Stöckchen</p><h2>Woran man merkt, dass eine Aussage den Frame setzen soll.</h2></div><div class="card-grid">${warningSigns.map((sign) => `<article class="card"><p class="card-kicker">Warnzeichen</p><h3 class="card-title">${escapeHtml(sign.title)}</h3><p class="card-text">${escapeHtml(sign.description)}</p><p class="card-text"><strong>Host-Satz:</strong> ${escapeHtml(sign.hostSentence)}</p></article>`).join("\n")}</div></div></section>`;
}

function renderSources() {
  const sourceItems = Object.values(sourcePack.sources);
  return `<section class="section section-soft" id="quellen"><div><div class="section-header"><p class="hero-kicker">Source-Pack</p><h2>Psychologie und Kommunikation.</h2><p>Diese Quellen dienen als wissenschaftliche und methodische Ergänzung. Die WÖk-eigene Einordnung bleibt Wirkung, Wirkungspotenzial, Wirkungsrisiko, Wirkungspfad, MPD und SDG+.</p></div><div class="card-grid">${sourceItems.map((source) => `<article class="card"><p class="card-kicker">${escapeHtml(source.publisher)}</p><h3 class="card-title">${escapeHtml(source.label)}</h3>${cleanList(source.use_for)}<p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p></article>`).join("\n")}</div></div></section>`;
}

function renderHub() {
  const main = `<main id="inhalt" data-pagefind-body>
      ${renderHubHero()}
      ${radarSubnav()}
      ${psychologySubnav("Überblick")}
      <section class="section radar-summary-section" aria-labelledby="psych-summary"><div class="radar-section-intro"><p class="hero-kicker">Das Wichtigste</p><h2 id="psych-summary">Psychologische Wirkung in sechs Punkten.</h2></div>${summaryGrid(keyPoints, "Psychologie Summary")}</section>
      <section class="section section-soft"><div class="card narrative-rule-card"><p class="card-kicker">Kernsatz</p><h2 class="card-title">Nicht manipulieren. Mechanismus erkennen. Frame halten. Wirkung zurückführen.</h2><p class="card-text">${escapeHtml(psychologyNotice)}</p></div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Bibliothek</p><h2>Fünf Zugänge.</h2></div><div class="card-grid"><a class="card text-link-card" href="psychologische-effekte/"><h3 class="card-title">Psychologische Effekte</h3><p class="card-text">Kognitive Dissonanz, Reaktanz, Verlustaversion, Wahrheitsillusion und weitere Hebel.</p></a><a class="card text-link-card" href="manipulationsmuster/"><h3 class="card-title">Manipulationsmuster</h3><p class="card-text">Falsche Voraussetzung, Beweislastumkehr, Frame-Übernahme, Gish Gallop und mehr.</p></a><a class="card text-link-card" href="kommunikative-souveraenitaet/"><h3 class="card-title">Kommunikative Souveränität</h3><p class="card-text">Das 6-Schritte-Schema, um den Frame zurückzuholen.</p></a><a class="card text-link-card" href="psychologische-stoeckchen/"><h3 class="card-title">Psychologische Stöckchen</h3><p class="card-text">Warnzeichen erkennen, bevor die Debatte kippt.</p></a><a class="card text-link-card" href="debiasing-playbook/"><h3 class="card-title">Debiasing-Playbook</h3><p class="card-text">Konkrete Moves für Klärung statt Gegenmanipulation.</p></a></div></div></section>
      ${renderEffectLibraryGrid()}
      ${renderManipulationPatternLibrary()}
      ${renderDebiasingPlaybook()}
      ${renderFrameControlScript()}
      ${renderStoeckchenChecklist()}
      ${renderSources()}
    </main>`;
  return pageShell({ title: "Psychologie im Wirkungsradar - Frames, Trigger und kommunikative Souveränität", description: "Wie Narrative psychologisch wirken: kognitive Dissonanz, Reaktanz, Verlustaversion, Bestätigungsfehler, Ingroup/Outgroup, Manipulationsmuster und Gegenstrategien im Wirkungsradar.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/psychologie/", main });
}

function renderSectionPage({ slug, nav, title, subtitle, abstract, body }) {
  const main = `<main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Psychologie</a> / ${escapeHtml(title)}</nav><p class="hero-kicker">Psychologie im Wirkungsradar</p><h1 class="hero-title">${escapeHtml(title)}</h1><p class="hero-subtitle">${escapeHtml(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(abstract)}</p><p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span></p></div></section>
      ${psychologySubnav(nav, "../")}
      ${body}
    </main>`;
  return pageShell({ title: `${title} | Psychologie im Wirkungsradar`, description: sentence(abstract), canonical: `https://wirkungsoekonomie.de/wirkungsradar/psychologie/${slug}/`, main, base: "../../../" });
}

function renderEffectDetail(effect) {
  const body = `<section class="section" id="definition"><div class="article-body radar-method-body"><h2>Definition</h2><p>${escapeHtml(effect.shortDefinition)}</p><h2>Warum es wirkt</h2><p>${escapeHtml(effect.whyItWorks)}</p></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Typische Anschlüsse</p><h2>Narrative, Muster und Trigger.</h2></div><div class="card-grid three"><article class="card"><p class="card-kicker">Narrative</p>${cleanList(effect.typicalNarratives)}</article><article class="card"><p class="card-kicker">Emotionale Hooks</p>${cleanList(effect.emotionalHooks)}</article><article class="card"><p class="card-kicker">Manipulationsmuster</p>${cleanList(effect.manipulationPatterns)}</article></div></div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Wirkungsrisiko</p><h2>Mensch, Planet, Demokratie.</h2></div>${summaryGrid([["Mensch", effect.mpd.mensch, "warning"], ["Planet", effect.mpd.planet || "Der Effekt kann ökologische Wirkung indirekt verschieben.", "warning"], ["Demokratie", effect.mpd.demokratie, "critical"]], `${effect.title} MPD`, "mpd-impact-panel")}</div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Gegenstrategie</p><h2>${escapeHtml(effect.responsePrinciple)}</h2></div><div class="card-grid two"><article class="card"><p class="card-kicker">Host-Sätze</p>${cleanList(effect.hostSentences)}</article><article class="card"><p class="card-kicker">Verknüpfungen</p><p class="card-text"><strong>Narrative:</strong> ${escapeHtml(effect.relatedNarratives.join(" / "))}</p><p class="card-text"><strong>Live-Karten:</strong> ${escapeHtml(effect.relatedLiveCards.join(" / "))}</p></article></div></div></section>`;
  return renderSectionPage({
    slug: effect.id,
    nav: "Effekte",
    title: effect.title,
    subtitle: effect.shortDefinition,
    abstract: `${effect.title} im Wirkungsradar: warum dieser psychologische Hebel wirkt, welche Narrative ihn nutzen und wie Hosts den Frame zurück zur Wirkungsfrage führen.`,
    body,
  });
}

function renderQualityGate() {
  return {
    requiredModules: ["hero", "abstract", "summary", "true_core", "missing_context", "facts", "narrative", "wirkstoff", "effect_path", "psychology", "manipulation_patterns", "response_strategy", "woek_solution", "sources", "internal_links"],
    statuses: {
      missing_psychology: "draft_missing_psychology",
      missing_response_strategy: "draft_missing_response_strategy",
      incomplete_psychology: "draft_incomplete_psychology",
      pathologizing_or_shaming: "blocked_editorial_review",
    },
    editorialRules: [
      "Psychologische Effekte sind keine Diagnosen.",
      "Nicht schreiben: Menschen fallen darauf rein.",
      "Besser schreiben: Diese Aussage nutzt ein Wahrnehmungsmuster, das bei allen Menschen wirken kann.",
      "Nicht schreiben: So manipulierst du zurück.",
      "Besser schreiben: So hältst du den Frame und führst zur Klärung zurück.",
      "Nicht beschämen. Nicht pathologisieren. Nicht moralisieren ohne Lösung.",
    ],
    uiSentences,
  };
}

writeFile("content/wirkungsradar/psychology/psychology-effects-v1.yaml", `${toYaml({ effects }).trim()}\n`);
writeFile("content/wirkungsradar/psychology/manipulation-patterns-v1.yaml", `${toYaml({ patterns }).trim()}\n`);
writeFile("content/wirkungsradar/psychology/debiasing-playbook-v1.yaml", `${toYaml({ moves: debiasingMoves }).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/psychology-communication-v1.yaml", `${toYaml(sourcePack).trim()}\n`);
writeFile("content/wirkungsradar/psychology/quality-gate-v1.yaml", `${toYaml(renderQualityGate()).trim()}\n`);

writeFile(`${outRoot}/index.html`, renderHub());
writeFile(`${outRoot}/psychologische-effekte/index.html`, renderSectionPage({
  slug: "psychologische-effekte",
  nav: "Effekte",
  title: "Psychologische Effekte",
  subtitle: "Kognitive Hebel, emotionale Trigger und Wirkungsrisiken.",
  abstract: "Diese Bibliothek erklärt die wichtigsten psychologischen Effekte im Wirkungsradar und verbindet sie mit Narrativen, Risiken und Antwortprinzipien.",
  body: `${renderEffectLibraryGrid("../")}${renderSources()}`,
}));
writeFile(`${outRoot}/manipulationsmuster/index.html`, renderSectionPage({
  slug: "manipulationsmuster",
  nav: "Manipulationsmuster",
  title: "Manipulationsmuster",
  subtitle: "Gesprächsmechanismen erkennen, ohne selbst manipulativ zu werden.",
  abstract: "Manipulationsmuster setzen Frames, verschieben Beweislast oder überfordern Klärung. Der Wirkungsradar zeigt Gegenbewegungen für demokratische Kommunikation.",
  body: renderManipulationPatternLibrary(),
}));
writeFile(`${outRoot}/kommunikative-souveraenitaet/index.html`, renderSectionPage({
  slug: "kommunikative-souveraenitaet",
  nav: "Souveränität",
  title: "Kommunikative Souveränität",
  subtitle: "Wie man den Frame zurückholt, ohne selbst manipulativ zu werden.",
  abstract: "Kommunikative Souveränität bedeutet nicht, das Gegenüber zu besiegen. Sie bedeutet, den manipulativen Frame zu erkennen, die eigene Ruhe zu behalten und die Debatte zurück auf Fakten, Wirkung und Lösung zu führen.",
  body: `${renderFrameControlScript()}<section class="section"><div><div class="section-header"><p class="hero-kicker">UI-Sätze</p><h2>Wiederverwendbare Formulierungen.</h2></div>${cleanList(uiSentences)}</div></section>`,
}));
writeFile(`${outRoot}/psychologische-stoeckchen/index.html`, renderSectionPage({
  slug: "psychologische-stoeckchen",
  nav: "Stöckchen",
  title: "Psychologische Stöckchen erkennen",
  subtitle: "Woran man merkt, dass eine Aussage weniger klären als den Frame setzen soll.",
  abstract: "Ein psychologisches Stöckchen ist eine Aussage, die nicht primär auf Klärung zielt, sondern auf eine gewünschte Reaktion: Wut, Rechtfertigung, Beschämung, Angst, Trotz oder Frame-Übernahme.",
  body: renderStoeckchenChecklist(),
}));
writeFile(`${outRoot}/debiasing-playbook/index.html`, renderSectionPage({
  slug: "debiasing-playbook",
  nav: "Debiasing",
  title: "Debiasing-Playbook",
  subtitle: "Strategien für Klärung statt Gegenmanipulation.",
  abstract: "Das Debiasing-Playbook zeigt praktische Moves für Hosts und Creator:innen: Gefühl, Fakt und Folgerung trennen, Frame markieren, Beweislast zurückgeben und die Wirkungsfrage stellen.",
  body: renderDebiasingPlaybook(),
}));
for (const effect of effects) {
  writeFile(`${outRoot}/${effect.id}/index.html`, renderEffectDetail(effect));
}

console.log(`Built psychology library: ${effects.length} effect pages, ${patterns.length} patterns, ${debiasingMoves.length} debiasing moves.`);
