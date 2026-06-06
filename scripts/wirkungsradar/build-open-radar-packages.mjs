import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_STAND = "2026-06-04";
const VERSION = "20260604-open-radar-packages-patch49";

function readJson(file, fallback) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const openPackages = [
  {
    slug: "auslaender-pluendern-sozialstaat",
    title: "Ausländer plündern den Sozialstaat?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Ausländer plündern den Sozialstaat.",
    judgement: "Wahrer Belastungskern, falsches Gruppenurteil.",
    truePoints: ["Kommunen, Schulen, Wohnungsmarkt, Jobcenter und Integrationsangebote können real überlastet sein.", "Sozialleistungen, Aufenthaltsstatus, Arbeitserlaubnis, Qualifikation und Wohnkosten müssen sauber getrennt werden."],
    missingPoints: ["Aus einzelnen Kosten wird ein Gruppenurteil gemacht.", "Beiträge, Arbeit, Demografie, fehlende Integration, Bürokratie und politische Steuerung verschwinden.", "Die bessere Frage lautet nicht, welche Gruppe schuld ist, sondern welche Architektur Arbeit, Sprache, Wohnen, Bildung und Teilhabe wirksam macht."],
    betterQuestion: "Welche Regeln, Angebote und Investitionen machen aus Migration schneller Arbeit, Teilhabe und stabile Kommunen?",
    hostLine: "Der Sozialstaat wird nicht besser, wenn man Gruppen beschuldigt. Er wird besser, wenn Arbeit, Sprache, Wohnen und Verfahren funktionieren.",
  },
  {
    slug: "nie-eingezahlt",
    title: "Die haben nie eingezahlt?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Die haben nie eingezahlt.",
    judgement: "Wahrer Beitragskern, falscher Sozialstaatsbegriff.",
    truePoints: ["Beitragsfinanzierte Leistungen brauchen faire Regeln.", "Wer arbeitet und einzahlt, erwartet zurecht Verlässlichkeit."],
    missingPoints: ["Der Sozialstaat besteht nicht nur aus Versicherung nach Vorleistung.", "Schutz, Kinder, Krankheit, Flucht, Grundsicherung, Arbeitseintritt und künftige Beiträge gehören in die Rechnung.", "Wer Menschen vom Arbeitsmarkt fernhält, produziert später genau die Kosten, über die er klagt."],
    betterQuestion: "Welche Regeln bringen Menschen möglichst schnell in Sprache, Arbeit, Ausbildung und Beitragszahlung?",
    hostLine: "Einzahlung ist wichtig. Aber der beste Sozialstaat fragt auch: Wie kommen Menschen schneller in Arbeit und Verantwortung?",
  },
  {
    slug: "sozialtourismus-frame",
    title: "Sozialtourismus?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Das ist Sozialtourismus.",
    judgement: "Kampfbegriff statt Rechts- und Datenprüfung.",
    truePoints: ["Missbrauch muss verhindert und kontrolliert werden.", "Leistungszugang braucht klare Regeln und Nachweise."],
    missingPoints: ["Der Begriff vermischt Flucht, EU-Freizügigkeit, Arbeit, Familiennachzug, Schutzstatus und Sozialrecht.", "Einzelne Missbrauchsfälle werden zum Gesamtbild gemacht.", "Die Lösung ist bessere Verwaltung, nicht pauschale Abwertung."],
    betterQuestion: "Welche Leistungsregeln sind klar, kontrollierbar und zugleich arbeits- und integrationsfördernd?",
    hostLine: "Missbrauch prüfen ja. Aber Sozialtourismus ist ein Kampfwort. Wir brauchen Rechtsstatus, Daten und konkrete Kontrollen.",
  },
  {
    slug: "sozialschmarotzer-frame",
    title: "Sozialschmarotzer?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Das sind Sozialschmarotzer.",
    judgement: "Abwertung statt Wirkungsanalyse.",
    truePoints: ["Leistungsbetrug und dauerhafte Fehlanreize müssen verhindert werden.", "Menschen wollen Fairness zwischen Arbeit, Hilfe und Eigenverantwortung."],
    missingPoints: ["Der Begriff macht Menschen zum Problem und blendet Ursachen aus: Wohnkosten, Krankheit, Qualifikation, Kinderbetreuung, Aufenthaltsrecht, regionale Jobs.", "Abwertung senkt Problemlösungsfähigkeit und erhöht gesellschaftliche Spaltung.", "Wirksam ist die Trennung von Betrug, Schutzbedarf, Arbeitshemmnissen und politischem Design."],
    betterQuestion: "Welche Hürden verhindern Arbeit und welche Regeln verhindern Missbrauch, ohne Menschen abzuwerten?",
    hostLine: "Abwertung löst kein Sozialproblem. Wir müssen Betrug, Arbeitshemmnisse und echte Hilfe sauber trennen.",
  },
  {
    slug: "integration-ist-gescheitert",
    title: "Integration ist gescheitert?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Integration ist gescheitert.",
    judgement: "Reale Engpässe, falsches Totalurteil.",
    truePoints: ["Es gibt reale Probleme bei Sprache, Wohnen, Schule, Arbeit, Verwaltung und Sicherheit.", "Scheitern einzelner Maßnahmen muss benannt werden."],
    missingPoints: ["Integration ist kein Ja-nein-Zustand, sondern ein Wirkungspfad.", "Erfolge, Unterschiede nach Gruppen, Generationen, Bildung, Arbeitsmarkt und Kommunen verschwinden.", "Ein Totalurteil macht bessere Steuerung weniger wahrscheinlich."],
    betterQuestion: "Wo scheitert Integration konkret, wo gelingt sie, und welche Hebel verbessern Sprache, Arbeit, Schule, Wohnen und Sicherheit?",
    hostLine: "Integration ist kein Gesamturteil. Wir müssen sehen, welche Teile funktionieren und welche konkret repariert werden müssen.",
  },
  {
    slug: "fachkraeftemangel-ohne-zuwanderung",
    title: "Fachkräftemangel ohne Zuwanderung lösen?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Fachkräftemangel lässt sich ohne Zuwanderung lösen.",
    judgement: "Wahrer Aktivierungskern, demografisch verkürzt.",
    truePoints: ["Inländische Potenziale müssen besser genutzt werden: Ausbildung, Frauen, Ältere, Teilzeit, Produktivität, Weiterbildung.", "Schlechte Arbeitsbedingungen dürfen nicht durch Migration verdeckt werden."],
    missingPoints: ["Demografie, Pflege, Handwerk, Technik, Gesundheit und regionale Engpässe bleiben trotzdem real.", "Zuwanderung ersetzt keine Reformen, kann aber Teil der Lösung sein.", "Ohne schnelle Anerkennung, Sprache und Integration bleibt auch Zuwanderung wirkungsarm."],
    betterQuestion: "Welche Kombination aus besserer Arbeit, Qualifikation, Produktivität und gezielter Zuwanderung schließt reale Lücken?",
    hostLine: "Erst alle Potenziale hier nutzen. Aber Demografie verschwindet nicht. Gute Fachkräftepolitik kombiniert Ausbildung, bessere Arbeit und gezielte Zuwanderung.",
  },
  {
    slug: "kriminalitaet-und-migration",
    title: "Kriminalität und Migration?",
    cluster: "Migration, Sozialstaat & Zusammenhalt",
    claim: "Migration macht Deutschland unsicher.",
    judgement: "Sicherheitskern, aber falsche Pauschalisierung.",
    truePoints: ["Sicherheit, Gewaltprävention und konsequente Strafverfolgung sind legitime Erwartungen.", "Kriminalitätsdaten müssen offen, differenziert und verständlich sein."],
    missingPoints: ["Pauschale Gruppenbilder ersetzen keine Statistik nach Alter, Geschlecht, sozialer Lage, Tatart, Aufenthaltsstatus und Anzeigeverhalten.", "Prävention, Integration, Polizei, Justiz, Schule und kommunale Arbeit gehören zusammen.", "Wer Gruppen pauschal verdächtigt, schwächt Vertrauen und Problemlösung."],
    betterQuestion: "Welche konkreten Delikte steigen, wer ist betroffen, welche Ursachen sind belegt und welche Maßnahmen senken Gewalt tatsächlich?",
    hostLine: "Sicherheit ernst nehmen heißt: Daten differenzieren, Opfer schützen, Täter verfolgen und Ursachen bearbeiten. Pauschalurteile helfen nicht.",
  },
  {
    slug: "buergergeld-macht-faul",
    title: "Bürgergeld macht faul?",
    cluster: "Arbeit, Leistung & soziale Sicherung",
    claim: "Bürgergeld macht faul.",
    judgement: "Einzelfälle werden zum Menschenbild.",
    truePoints: ["Arbeit muss sich lohnen.", "Transfersysteme dürfen keine schlechten Anreize setzen."],
    missingPoints: ["Viele Leistungsbeziehende arbeiten, sind krank, betreuen Kinder, qualifizieren sich oder suchen Arbeit.", "Wohnkosten, Niedriglöhne, Betreuung, Gesundheit und Qualifikation verschwinden im Faulheitsframe.", "Die Lösung ist nicht Verachtung, sondern bessere Arbeitsarchitektur."],
    betterQuestion: "Welche Kombination aus Lohn, Wohnen, Betreuung, Qualifikation und Transferregeln macht Arbeit wirklich tragfähig?",
    hostLine: "Arbeit muss sich lohnen. Aber Faulheit erklärt nicht Wohnkosten, Niedriglöhne, Betreuungslücken und Qualifikationsprobleme.",
  },
  {
    slug: "rente-unbezahlbar",
    title: "Rente ist unbezahlbar?",
    cluster: "Arbeit, Leistung & soziale Sicherung",
    claim: "Die Rente ist unbezahlbar.",
    judgement: "Demografischer Kern, aber falsche Panikrechnung.",
    truePoints: ["Alterung, Beitragszahler, Rentenniveau und Bundeszuschüsse sind echte Fragen.", "Generationengerechtigkeit muss ernst genommen werden."],
    missingPoints: ["Produktivität, Erwerbsquote, Löhne, Zuwanderung, Kapitalerträge, Gesundheitsjahre und Steuerfinanzierung werden oft ausgeblendet.", "Panik ersetzt Reformpfade.", "Die bessere Debatte trennt Sicherung, Finanzierung, Arbeit und Vermögen."],
    betterQuestion: "Welche Mischung aus guter Arbeit, Produktivität, Erwerbsbeteiligung, Finanzierung und Altersarmutsprävention stabilisiert Alterssicherung?",
    hostLine: "Die Rente hat ein echtes Demografieproblem. Aber unbezahlbar ist kein Reformplan. Entscheidend ist der Mix aus Arbeit, Produktivität und fairer Finanzierung.",
  },
  {
    slug: "eu-undemokratisch-deutschland-zahlt-alles",
    title: "Deutschland zahlt für die ganze EU?",
    cluster: "Steuergeld, globale Verantwortung & Fairness",
    claim: "Deutschland zahlt für die ganze EU.",
    judgement: "Nettozahler-Zahl greift zu kurz.",
    truePoints: ["Deutschland ist ein großer Beitragszahler der EU.", "EU-Ausgaben brauchen Kontrolle, Transparenz und demokratische Legitimation."],
    missingPoints: ["Binnenmarkt, Exportnutzen, Stabilität, Forschungsprogramme, Infrastruktur, Friedensordnung und gemeinsame Standards fehlen.", "Nettozahlung ist keine vollständige Wirkungsbilanz.", "Auch EU-Regeln brauchen demokratische Verbesserung, aber nicht jede Kooperation ist Fremdherrschaft."],
    betterQuestion: "Welche EU-Ausgaben erzeugen welche Wirkung für Stabilität, Markt, Demokratie, Klima und Regionen?",
    hostLine: "Deutschland zahlt viel. Aber die EU ist nicht nur eine Rechnung, sondern auch Markt, Stabilität, Standards und gemeinsames Handeln.",
  },
  {
    slug: "ngos-kassieren-steuergeld",
    title: "NGOs kassieren Steuergeld?",
    cluster: "Steuergeld, globale Verantwortung & Fairness",
    claim: "NGOs kassieren unser Steuergeld.",
    judgement: "Wahrer Kontrollkern, falscher Pauschalverdacht.",
    truePoints: ["Fördermittel müssen transparent vergeben, geprüft und evaluiert werden.", "Organisationen dürfen öffentliche Mittel nicht zweckfremd verwenden."],
    missingPoints: ["Aus Kontrolle wird oft Delegitimierung von Zivilgesellschaft.", "Leistungen in Beratung, Prävention, Bildung, Demokratieschutz, Hilfe und Facharbeit verschwinden.", "Die bessere Lösung ist Wirkungstransparenz statt Generalverdacht."],
    betterQuestion: "Welche Organisation bekommt wofür Geld, welche Wirkung wird geprüft, und welche Kontrollen greifen?",
    hostLine: "Fördergeld muss kontrolliert werden. Aber Pauschalverdacht ersetzt keine Wirkungsprüfung.",
  },
  {
    slug: "steuerverschwendung-buerokratie",
    title: "Der Staat verschwendet unser Geld?",
    cluster: "Staat, Haushalt & Demokratie",
    claim: "Der Staat verschwendet unser Geld.",
    judgement: "Wahrer Effizienzkern, falsche Staatsverachtung.",
    truePoints: ["Fehlplanung, Bürokratie, schlechte Beschaffung und unklare Zuständigkeiten kosten Geld.", "Öffentliche Ausgaben brauchen Wirkungskontrolle."],
    missingPoints: ["Pauschale Staatsverachtung verhindert bessere Verwaltung.", "Unterlassungskosten, Investitionsstau und fehlende Digitalisierung werden oft nicht mitgerechnet.", "Die Lösung ist Wirkungshaushalt, nicht Handlungsunfähigkeit."],
    betterQuestion: "Welche Ausgaben erzeugen Wirkung, welche nicht, und welche Unterlassungskosten entstehen durch Nicht-Handeln?",
    hostLine: "Ja, Verschwendung muss raus. Aber die Antwort ist nicht weniger Staat um jeden Preis, sondern ein Staat, der Wirkung nachweist.",
  },
  {
    slug: "entwicklungshilfe-warum-nicht-zuerst-deutschland",
    title: "Entwicklungshilfe: Warum nicht zuerst Deutschland?",
    cluster: "Steuergeld, globale Verantwortung & Fairness",
    claim: "Warum Entwicklungshilfe, wenn wir hier Probleme haben?",
    judgement: "Wahrer Prioritätenkern, falsche Inland-Ausland-Trennung.",
    truePoints: ["Deutschland hat reale Investitionslücken.", "Auslandsprojekte müssen wirksam, kontrolliert und gut begründet sein."],
    missingPoints: ["Globale Stabilität, Klima, Gesundheit, Handel, Fluchtursachen, Sicherheit und Partnerschaft wirken auf Deutschland zurück.", "Inlandspolitik wird nicht besser, wenn Auslandswirkung pauschal entwertet wird.", "Zuschüsse, Kredite und Garantien müssen getrennt werden."],
    betterQuestion: "Welche Ausgaben verbessern hier und international messbare Zustände, und welche Folgekosten verhindern sie?",
    hostLine: "Deutschland zuerst klingt einfach. Aber viele Risiken kommen zurück: Klima, Gesundheit, Sicherheit, Handel und Flucht. Entscheidend ist geprüfte Wirkung.",
  },
  {
    slug: "klimafinanzierung-wir-zahlen-fuer-andere",
    title: "Klimafinanzierung: Zahlen wir für andere?",
    cluster: "Steuergeld, globale Verantwortung & Fairness",
    claim: "Bei Klimafinanzierung zahlen wir für andere.",
    judgement: "Kostenkern, aber Eigeninteresse fehlt.",
    truePoints: ["Internationale Klimafinanzierung kostet öffentliches Geld und muss kontrolliert werden.", "Verteilung und Verantwortung müssen demokratisch erklärt werden."],
    missingPoints: ["Klimarisiken, Lieferketten, Sicherheit, Märkte, Migration, Biodiversität und historische Emissionen fehlen.", "Nicht-Handeln kann teurer sein als Kooperation.", "Kredite, Garantien, Zuschüsse und private Hebel werden oft vermischt."],
    betterQuestion: "Welche Klimafinanzierung senkt reale Risiken, stärkt Anpassung und verhindert höhere Folgekosten?",
    hostLine: "Klimafinanzierung ist nicht nur Altruismus. Sie senkt Risiken, die sonst über Preise, Schäden, Migration und Sicherheit zurückkommen.",
  },
  {
    slug: "entwicklungshilfe-china-indien",
    title: "Warum Geld für China und Indien?",
    cluster: "Steuergeld, globale Verantwortung & Fairness",
    claim: "Warum zahlen wir Geld an China und Indien?",
    judgement: "Meist verkürzt: Projektart und Finanzierungsform fehlen.",
    truePoints: ["Bei großen Volkswirtschaften braucht jede Kooperation besonders klare Begründung.", "Zuschüsse an wohlhabendere Staaten wären erklärungspflichtig."],
    missingPoints: ["Oft geht es um Kredite, Klimaprojekte, Forschung, Standards, Märkte oder multilaterale Programme.", "China, Indien, Kommunen, Unternehmen und multilaterale Fonds werden vermischt.", "Wirkung und Eigeninteresse müssen projektgenau geprüft werden."],
    betterQuestion: "Handelt es sich um Zuschuss, Kredit, Garantie, Forschung oder Klimakooperation - und welche Wirkung entsteht?",
    hostLine: "Die Frage ist berechtigt. Aber zuerst müssen wir klären: Zuschuss, Kredit, Garantie oder Projektkooperation? Das ist nicht dasselbe.",
  },
  {
    slug: "kultur-gender-luxusprojekte",
    title: "Geld für Kultur und Gender statt echte Probleme?",
    cluster: "Kultur, Identität & Geschlecht",
    claim: "Geld für Kultur und Gender statt echte Probleme.",
    judgement: "Prioritätenkern, aber Teilhabewirkung fehlt.",
    truePoints: ["Öffentliche Förderung braucht klare Ziele, Transparenz und Wirkung.", "Menschen erwarten, dass soziale, wirtschaftliche und infrastrukturelle Probleme nicht verdrängt werden."],
    missingPoints: ["Kultur, Gleichstellung, Gewaltprävention, Bildung, demokratische Teilhabe und Diskriminierungsschutz sind nicht automatisch Luxus.", "Der Frame macht Minderheiten, Künstler:innen oder Gleichstellung zum Sündenbock.", "Die bessere Prüfung fragt nach konkreter Wirkung, nicht nach Spottwert."],
    betterQuestion: "Welche Förderung verbessert Teilhabe, Schutz, Bildung oder Demokratie - und welche tut es nicht?",
    hostLine: "Prioritäten prüfen ja. Aber Kultur und Gleichstellung pauschal als Luxus abzuwerten, ersetzt keine Wirkungsprüfung.",
  },
  {
    slug: "gender-ideologie",
    title: "Gender-Ideologie?",
    cluster: "Kultur, Identität & Geschlecht",
    claim: "Gender-Ideologie gefährdet Kinder und Familie.",
    judgement: "Schutzgefühl, aber Kulturkampf-Frame.",
    truePoints: ["Kinder brauchen Schutz, stabile Beziehungen und altersgerechte Bildung.", "Eltern erwarten Transparenz und pädagogische Verantwortung."],
    missingPoints: ["Aus Schutz wird häufig Angst vor Vielfalt, Gleichstellung oder Minderheiten.", "Begriffe wie Gender werden vermischt: Sprache, Forschung, Gleichstellung, Identität, Schule, Familie.", "Die bessere Debatte trennt Kinderschutz, Bildung, Respekt, Diskriminierungsschutz und Familienrealität."],
    betterQuestion: "Welche Bildung schützt Kinder wirklich: Angstbilder oder altersgerechte Aufklärung, Respekt und klare Schutzregeln?",
    hostLine: "Kinderschutz ist wichtig. Aber Angstbilder helfen Kindern nicht. Gute Bildung schützt, erklärt altersgerecht und respektiert Familien.",
  },
  {
    slug: "queere-sichtbarkeit-bedroht-kinder",
    title: "Queere Sichtbarkeit bedroht Kinder?",
    cluster: "Kultur, Identität & Geschlecht",
    claim: "Queere Sichtbarkeit bedroht Kinder.",
    judgement: "Schutzinstinkt, aber falscher Bedrohungsrahmen.",
    truePoints: ["Kinder brauchen Schutz vor Übergriffen, Druck und unangemessenen Inhalten.", "Bildung muss altersgerecht sein."],
    missingPoints: ["Sichtbarkeit wird mit Gefährdung verwechselt.", "Kinder in diversen Familien, queere Jugendliche und Minderheiten verschwinden aus dem Schutzbegriff.", "Schutz bedeutet klare Grenzen gegen Gewalt und Missbrauch, nicht Unsichtbarkeit von Menschen."],
    betterQuestion: "Wie schaffen wir altersgerechte Bildung, Schutz vor Übergriffen und Respekt für unterschiedliche Familien?",
    hostLine: "Schutz heißt nicht Unsichtbarkeit. Schutz heißt altersgerecht erklären, Grenzen setzen und jedes Kind respektieren.",
  },
  {
    slug: "feminismus-zerstoert-familie",
    title: "Feminismus zerstört Familie?",
    cluster: "Kultur, Identität & Geschlecht",
    claim: "Feminismus zerstört Familie.",
    judgement: "Statusangst, falscher Nullsummenrahmen.",
    truePoints: ["Viele Familien erleben echten Druck durch Arbeit, Care, Kosten, Zeit und Erwartungen.", "Beziehungen brauchen Verlässlichkeit und Fürsorge."],
    missingPoints: ["Gleichstellung wird als Verlust für Familie erzählt, obwohl faire Care-Arbeit, Schutz vor Gewalt und ökonomische Sicherheit Familien stärken können.", "Männer, Frauen, Kinder und Pflege werden gegeneinander gestellt.", "Die bessere Frage ist, welche Regeln Fürsorge tragfähig machen."],
    betterQuestion: "Welche Arbeits-, Steuer-, Betreuungs- und Schutzregeln stärken Familien und faire Care-Arbeit?",
    hostLine: "Familien werden nicht durch Gleichstellung zerstört. Sie werden durch Zeitdruck, Armut, Gewalt und unfaire Care-Last geschwächt.",
  },
  {
    slug: "e-lkw-funktionieren-nicht",
    title: "E-Lkw funktionieren nicht?",
    cluster: "Mobilität, Industrie & Produkte",
    claim: "E-Lkw funktionieren nicht.",
    judgement: "Echter Infrastrukturkern, aber falsches Technikurteil.",
    truePoints: ["Schwere Logistik braucht Reichweite, Ladeleistung, Netzanschlüsse, Planung und verlässliche Kosten.", "Nicht jeder Einsatz lässt sich sofort elektrifizieren."],
    missingPoints: ["Depotladen, planbare Routen, Megawattladen, Batteriekosten, Wartung, Wirkungsgrad und Strommix fehlen.", "Aus heutigen Engpässen wird ein Dauerurteil.", "Die bessere Frage trennt Nahverkehr, Regionalverkehr, Fernverkehr und Spezialfälle."],
    betterQuestion: "Welche Lkw-Anwendungen sind heute batterieelektrisch sinnvoll, welche brauchen Infrastruktur, und welche bleiben Spezialfälle?",
    hostLine: "E-Lkw sind kein Zauberstab. Aber viele planbare Routen werden elektrisch plausibel, wenn Depotladen, Netz und Ladeparks mitwachsen.",
  },
  {
    slug: "laden-dauert-viel-zu-lange",
    title: "Laden dauert viel zu lange?",
    cluster: "Mobilität, Industrie & Produkte",
    claim: "Laden dauert viel zu lange.",
    judgement: "Wahrer Alltagskern, falsche Tankstellenlogik.",
    truePoints: ["Ladezeit, Verfügbarkeit, Preis und Zuverlässigkeit sind echte Akzeptanzfaktoren.", "Schlechte Ladeinfrastruktur frustriert."],
    missingPoints: ["Viele Ladevorgänge passieren beim Parken: zuhause, bei der Arbeit, am Depot, am Supermarkt.", "Tankzeit wird mit Standzeit verwechselt.", "Schnellladen ist wichtig, aber nicht der einzige Ladefall."],
    betterQuestion: "Wo steht das Fahrzeug ohnehin, und welche Ladeinfrastruktur macht diese Standzeit nutzbar?",
    hostLine: "Beim E-Auto lädt man oft nicht wie beim Tanken. Man lädt, während das Auto sowieso steht: zuhause, am Arbeitsplatz, im Depot oder beim Einkauf.",
  },
  {
    slug: "wohnungsnot-wegen-migration",
    title: "Wohnungsnot wegen Migration?",
    cluster: "Wohnen, Stadt & Infrastruktur",
    claim: "Wohnungsnot entsteht wegen Migration.",
    judgement: "Realer Druck, falscher Sündenbock.",
    truePoints: ["Zuzug erhöht in angespannten Märkten die Nachfrage.", "Kommunen brauchen Planung, Wohnungsbau, Finanzierung und Infrastruktur."],
    missingPoints: ["Bodenpreise, Zinsen, Baukosten, Leerstand, Spekulation, Genehmigungen, Sozialwohnungsbestand und Raumordnung verschwinden.", "Migration wird zur Hauptursache gemacht, obwohl Wohnungsnot strukturell länger gewachsen ist.", "Die Lösung liegt in Bau, Bestand, Bodenpolitik und kommunaler Steuerung."],
    betterQuestion: "Welche Kombination aus Neubau, Bestand, Bodenpolitik, Sozialwohnungen und Infrastruktur senkt Wohnungsdruck wirklich?",
    hostLine: "Zuzug kann Druck erhöhen. Aber Wohnungsnot entsteht nicht nur dadurch. Entscheidend sind Bau, Boden, Bestand und kommunale Planung.",
  },
  {
    slug: "15-minuten-stadt-oder-klimakaefig",
    title: "15-Minuten-Stadt oder Klimakäfig?",
    cluster: "Wohnen, Stadt & Infrastruktur",
    claim: "Die 15-Minuten-Stadt ist ein Klimakäfig.",
    judgement: "Freiheitsangst, falsches Kontrollbild.",
    truePoints: ["Stadtplanung darf Mobilität nicht bevormunden und muss demokratisch entschieden werden.", "Menschen brauchen Wahlfreiheit, Sicherheit und Erreichbarkeit."],
    missingPoints: ["Nähe wird als Einsperren erzählt.", "Schule, Arzt, Einkauf, Arbeit, Grünflächen und ÖPNV in der Nähe erhöhen oft Freiheit.", "Die richtige Frage ist Zugang, nicht Zwang."],
    betterQuestion: "Welche Planung macht Alltag näher, sicherer und freier, ohne Bewegungsfreiheit einzuschränken?",
    hostLine: "Eine gute 15-Minuten-Stadt sperrt niemanden ein. Sie macht wichtige Dinge näher: Einkauf, Schule, Arzt, Grün und Bahn.",
  },
  {
    slug: "parkplaetze-sind-freiheit",
    title: "Parkplätze sind Freiheit?",
    cluster: "Wohnen, Stadt & Infrastruktur",
    claim: "Parkplätze sind Freiheit.",
    judgement: "Alltagskern, aber Flächenkosten fehlen.",
    truePoints: ["Menschen brauchen Erreichbarkeit, besonders bei Behinderung, Handwerk, Pflege, Lieferverkehr und ländlichen Räumen.", "Parkraum kann für Alltag und Wirtschaft wichtig sein."],
    missingPoints: ["Öffentliche Fläche ist knapp und hat Alternativen: Bäume, sichere Wege, Lieferzonen, Radwege, Aufenthalt, ÖPNV.", "Kosten, Flächengerechtigkeit und Gesundheit bleiben unsichtbar.", "Freiheit heißt Erreichbarkeit, nicht immer kostenloser Abstellraum an jeder Stelle."],
    betterQuestion: "Welche Mischung aus Parken, Lieferzonen, ÖPNV, sicheren Wegen und Aufenthaltsqualität schafft echte Erreichbarkeit?",
    hostLine: "Parken kann wichtig sein. Aber Freiheit ist mehr als Abstellen: Es geht um Erreichbarkeit für alle und faire Nutzung knapper Fläche.",
  },
  {
    slug: "oerr-oder-staatsfunk",
    title: "ÖRR oder Staatsfunk?",
    cluster: "Medien, Demokratie & Öffentlichkeit",
    claim: "Der öffentlich-rechtliche Rundfunk ist Staatsfunk.",
    judgement: "Kontrollfrage, aber falscher Gleichschaltungsframe.",
    truePoints: ["Öffentlich-rechtliche Medien brauchen Unabhängigkeit, Kontrolle, Pluralität und Sparsamkeit.", "Kritik an Programmen, Kosten und Governance ist legitim."],
    missingPoints: ["Staatsfunk bedeutet staatliche Weisung; öffentlich-rechtlich bedeutet gerade staatsfern organisierte Grundversorgung.", "Fehler, Bias und Reformbedarf werden zu Gleichschaltung überhöht.", "Die bessere Frage ist Unabhängigkeit, Vielfalt, Transparenz und Auftrag."],
    betterQuestion: "Wie sichern wir staatsferne, pluralistische und überprüfbare öffentliche Medien im digitalen Raum?",
    hostLine: "Kritik am ÖRR ist legitim. Aber Staatsfunk ist ein anderer Vorwurf. Prüfen müssen wir Auftrag, Staatsferne, Vielfalt, Kosten und Kontrolle.",
  },
  {
    slug: "verfassungsschutz-oder-regierungsschutz",
    title: "Verfassungsschutz oder Regierungsschutz?",
    cluster: "Medien, Demokratie & Öffentlichkeit",
    claim: "Der Verfassungsschutz schützt nur die Regierung.",
    judgement: "Machtkontrollkern, aber Delegitimierungsframe.",
    truePoints: ["Sicherheitsbehörden brauchen rechtsstaatliche Kontrolle, Transparenz im Rahmen des Möglichen und gerichtliche Überprüfbarkeit.", "Politischer Missbrauch muss ausgeschlossen werden."],
    missingPoints: ["Verfassungsschutz wird pauschal als Parteiinstrument erzählt.", "Extremismus, Gewalt, Spionage, Demokratiefeindlichkeit und Minderheitenschutz verschwinden.", "Die bessere Debatte fragt nach Kontrolle, Kriterien und Rechtswegen."],
    betterQuestion: "Welche Kriterien, Kontrollen und Rechtswege sichern Demokratie, ohne Behörden politisch zu missbrauchen?",
    hostLine: "Behörden müssen kontrolliert werden. Aber pauschal Regierungsschutz zu sagen, ersetzt keine Prüfung von Kriterien, Belegen und Rechtswegen.",
  },
  {
    slug: "faktenchecker-sind-zensur",
    title: "Faktenchecker sind Zensur?",
    cluster: "Medien, Demokratie & Öffentlichkeit",
    claim: "Faktenchecker sind Zensur.",
    judgement: "Meinungsfreiheitskern, falscher Zensurbegriff.",
    truePoints: ["Faktenchecks müssen transparent, korrigierbar und methodisch sauber sein.", "Plattformregeln können Meinungsfreiheit berühren und brauchen Kontrolle."],
    missingPoints: ["Prüfung wird mit staatlichem Verbot verwechselt.", "Fakten, Meinung, Moderation, Reichweitenregeln und Zensur werden vermischt.", "Die bessere Frage ist nachvollziehbare Prüfung statt Autoritätsersatz."],
    betterQuestion: "Wie prüfen wir Behauptungen transparent, korrigierbar und ohne legitime Meinung zu unterdrücken?",
    hostLine: "Faktencheck ist nicht automatisch Zensur. Entscheidend ist: transparent, korrigierbar, methodisch sauber und klar getrennt von Meinung.",
  },
  {
    slug: "ki-nimmt-uns-alle-jobs",
    title: "KI nimmt uns alle Jobs?",
    cluster: "KI, Digitalisierung & Automatisierung",
    claim: "KI nimmt uns alle Jobs weg.",
    judgement: "Echte Umbruchangst, falsches Totalbild.",
    truePoints: ["KI verändert Tätigkeiten, Berufe, Qualifikationen und Machtverhältnisse.", "Automatisierung kann Jobs verdrängen und Druck erhöhen."],
    missingPoints: ["Neue Tätigkeiten, Produktivität, Assistenz, Weiterbildung, Regulierung, Mitbestimmung und Verteilung werden ausgeblendet.", "Nicht KI allein entscheidet, sondern Geschäftsmodelle, Arbeitsrecht und Bildung.", "Die bessere Frage ist Gestaltung."],
    betterQuestion: "Welche Arbeit wird ersetzt, welche ergänzt, und wie verteilen wir Produktivität, Qualifikation und Schutz?",
    hostLine: "KI verändert Arbeit massiv. Aber nicht die Technik allein entscheidet, sondern wie Unternehmen, Bildung, Mitbestimmung und Regeln sie einsetzen.",
  },
  {
    slug: "ki-macht-kinder-dumm",
    title: "KI macht Kinder dumm?",
    cluster: "KI, Digitalisierung & Automatisierung",
    claim: "KI macht Kinder dumm.",
    judgement: "Lernschutzkern, aber falsches Technikurteil.",
    truePoints: ["Unreflektierte KI-Nutzung kann Lernen, Schreiben, Konzentration und Eigenleistung schwächen.", "Schule braucht Regeln, Medienkompetenz und Schutz."],
    missingPoints: ["KI kann auch erklären, üben, barrierearm unterstützen und Lehrkräfte entlasten.", "Die Wirkung hängt von Aufgabe, Alter, Anleitung und Prüfung ab.", "Verbot allein ersetzt keine Kompetenz."],
    betterQuestion: "Welche KI-Nutzung stärkt Denken, Schreiben und Verstehen - und welche ersetzt es nur?",
    hostLine: "KI kann Lernen schwächen oder stärken. Entscheidend ist, ob Kinder damit denken lernen oder Denken auslagern.",
  },
  {
    slug: "datenschutz-verhindert-innovation",
    title: "Datenschutz verhindert Innovation?",
    cluster: "KI, Digitalisierung & Automatisierung",
    claim: "Datenschutz verhindert Innovation.",
    judgement: "Realer Reibungskern, aber falscher Gegensatz.",
    truePoints: ["Überkomplexe Regeln, Unsicherheit und schlechte Verwaltung können Innovation bremsen.", "Datenzugang ist für Forschung, KI und Verwaltung wichtig."],
    missingPoints: ["Vertrauen, Datensicherheit, Fairness, Rechte und Datenqualität sind Innovationsbedingungen.", "Schlechter Datenschutz erzeugt Missbrauch, Klagen und Akzeptanzverlust.", "Die Lösung sind klare Standards, Datentreuhand, Anonymisierung und gute Infrastruktur."],
    betterQuestion: "Welche Datenarchitektur ermöglicht Nutzung, Schutz, Qualität und Vertrauen zugleich?",
    hostLine: "Datenschutz ist nicht der Feind von Innovation. Schlechte Datenarchitektur ist es. Gute Regeln ermöglichen Nutzung und Vertrauen zugleich.",
  },
  {
    slug: "praevention-ist-zu-teuer",
    title: "Prävention ist zu teuer?",
    cluster: "Gesundheit, Pflege & Prävention",
    claim: "Prävention ist zu teuer.",
    judgement: "Kurzfristkosten, aber Unterlassungskosten fehlen.",
    truePoints: ["Prävention kostet Geld und wirkt oft später.", "Nicht jede Präventionsmaßnahme ist wirksam."],
    missingPoints: ["Krankheit, Pflegebedürftigkeit, Ausfallzeiten, Armut, Gewalt, Umweltfolgen und Folgekosten werden zu spät sichtbar.", "Wirksame Prävention muss evaluiert werden, aber Nicht-Prävention ist auch eine Entscheidung.", "Die bessere Bilanz zählt Lebensqualität und vermiedene Schäden mit."],
    betterQuestion: "Welche Prävention verhindert nachweisbar Krankheit, Pflegebedarf, Gewalt oder Folgekosten?",
    hostLine: "Prävention kostet vorher. Nicht-Prävention kostet später. Entscheidend ist, welche Maßnahme wirklich Schäden verhindert.",
  },
  {
    slug: "pflege-ist-unbezahlbar",
    title: "Pflege ist unbezahlbar?",
    cluster: "Gesundheit, Pflege & Prävention",
    claim: "Pflege ist unbezahlbar.",
    judgement: "Echter Kostenkern, aber Würde und Arbeitsarchitektur fehlen.",
    truePoints: ["Pflege braucht mehr Personal, Geld, Zeit und Organisation.", "Beiträge, Eigenanteile und Fachkräftemangel sind reale Probleme."],
    missingPoints: ["Unbezahlbar macht handlungsunfähig.", "Prävention, Angehörige, gute Arbeit, Digitalisierung, Quartiere, Migration, Tarifbindung und Pflegegrade gehören zusammen.", "Pflege ist nicht nur Kostenblock, sondern Würde, Gesundheit und soziale Infrastruktur."],
    betterQuestion: "Welche Pflegearchitektur schützt Würde, Personal, Angehörige und Finanzierung zugleich?",
    hostLine: "Pflege ist teuer, weil sie menschliche Zeit braucht. Die Frage ist nicht ob, sondern wie wir Würde, Personal und Finanzierung tragfähig machen.",
  },
  {
    slug: "mehr-krankenhaeuser-bessere-versorgung",
    title: "Mehr Krankenhäuser bedeuten bessere Versorgung?",
    cluster: "Gesundheit, Pflege & Prävention",
    claim: "Mehr Krankenhäuser bedeuten bessere Versorgung.",
    judgement: "Nähegefühl, aber Qualitäts- und Personalfrage fehlt.",
    truePoints: ["Erreichbarkeit und Notfallversorgung sind wichtig.", "Ländliche Räume brauchen Sicherheit und verlässliche Versorgung."],
    missingPoints: ["Qualität, Spezialisierung, Personal, Rettungsdienst, Telemedizin, ambulante Versorgung und Nachsorge fehlen.", "Viele kleine Standorte ohne Personal können Versorgung schwächen.", "Die bessere Frage ist Versorgungsnetz statt Standortzählung."],
    betterQuestion: "Welche Mischung aus Nähe, Qualität, Personal, Rettungsdienst und Spezialisierung verbessert Versorgung wirklich?",
    hostLine: "Gute Versorgung zählt nicht nur Gebäude. Sie zählt Personal, Qualität, Erreichbarkeit, Notfallkette und Nachsorge.",
  },
  {
    slug: "die-bauern-werden-geopfert",
    title: "Die Bauern werden geopfert?",
    cluster: "Landwirtschaft, Ernährung & Biodiversität",
    claim: "Die Bauern werden geopfert.",
    judgement: "Realer Druck, aber falscher Opferrahmen.",
    truePoints: ["Landwirtschaft steht unter hohem Kostendruck, Bürokratie, Wetterrisiken und Marktmacht.", "Viele Höfe erleben Transformation als Bedrohung."],
    missingPoints: ["Boden, Wasser, Biodiversität, Tierwohl, Preise, Handel, Subventionen und Lebensmitteleinzelhandel gehören in die Rechnung.", "Aus Strukturproblemen wird ein Kulturkampf gegen Umweltauflagen.", "Die Lösung ist faire Transformation, nicht Rückkehr zu alten Schäden."],
    betterQuestion: "Welche Regeln machen Höfe wirtschaftlich stabil und senken zugleich Boden-, Wasser-, Klima- und Biodiversitätsschäden?",
    hostLine: "Bauern brauchen faire Perspektiven. Aber Umwelt gegen Landwirtschaft zu stellen, löst weder Höfedruck noch Bodenschäden.",
  },
  {
    slug: "bio-kann-die-welt-nicht-ernaehren",
    title: "Bio kann die Welt nicht ernähren?",
    cluster: "Landwirtschaft, Ernährung & Biodiversität",
    claim: "Bio kann die Welt nicht ernähren.",
    judgement: "Ertragskern, aber falsche Gesamtbilanz.",
    truePoints: ["Erträge, Fläche und Versorgungssicherheit sind reale Fragen.", "Nicht jede ökologische Maßnahme ist automatisch global skalierbar."],
    missingPoints: ["Ernährungsverluste, Tierfutter, Fleischkonsum, Bodenfruchtbarkeit, Wasser, Pestizide, Biodiversität und Resilienz fehlen.", "Die Frage ist nicht Bio als Dogma, sondern regenerative, produktive und robuste Landwirtschaft.", "Versorgung hängt auch von Verteilung, Armut, Krieg und Verschwendung ab."],
    betterQuestion: "Welche Landwirtschaft ernährt Menschen sicher und erhält zugleich Boden, Wasser, Klima und Biodiversität?",
    hostLine: "Die Welt ernähren heißt nicht nur maximaler Ertrag pro Hektar. Es heißt auch weniger Verluste, bessere Böden, Wasser und faire Verteilung.",
  },
  {
    slug: "fleischverzicht-ist-ideologie",
    title: "Fleischverzicht ist Ideologie?",
    cluster: "Landwirtschaft, Ernährung & Biodiversität",
    claim: "Fleischverzicht ist Ideologie.",
    judgement: "Identitätskern, aber Wirkungsdaten fehlen.",
    truePoints: ["Essen ist Kultur, Genuss, Gewohnheit und Freiheit.", "Menschen wollen nicht bevormundet werden."],
    missingPoints: ["Gesundheit, Klima, Flächen, Tierwohl, Wasser, Preise und Ernährungsarmut gehören zur Wirkung.", "Reduktion ist nicht automatisch Verbot.", "Die bessere Frage ist Wahlfreiheit mit wahreren Preisen und guten Alternativen."],
    betterQuestion: "Welche Ernährung macht Gesundheit, Klima, Tierwohl und Wahlfreiheit zugleich besser?",
    hostLine: "Niemand muss Essen zum Kulturkampf machen. Die Frage ist: Welche Ernährung verbessert Gesundheit, Klima, Tierwohl und Alltag?",
  },
  {
    slug: "waffenlieferungen-verlaengern-den-krieg",
    title: "Waffenlieferungen verlängern den Krieg?",
    cluster: "Sicherheit, Geopolitik & Resilienz",
    claim: "Waffenlieferungen verlängern den Krieg.",
    judgement: "Friedenssehnsucht, aber Schutz- und Verhandlungsfrage fehlt.",
    truePoints: ["Waffenlieferungen sind schwere Entscheidungen mit Risiken.", "Frieden und Leidverkürzung müssen Ziel bleiben."],
    missingPoints: ["Ohne Schutz kann ein angegriffener Staat schlechter verhandeln und mehr Menschen verlieren.", "Abschreckung, Verteidigungsfähigkeit, Eskalationsrisiko und Diplomatie müssen zusammen geprüft werden.", "Nicht-Liefern ist ebenfalls eine Handlung mit Folgen."],
    betterQuestion: "Welche Unterstützung verkürzt Leid, schützt Menschen und erhöht realistische Friedenschancen?",
    hostLine: "Frieden ist das Ziel. Die harte Frage ist, ob weniger Schutz wirklich Frieden bringt oder nur die Verhandlungsposition des Angegriffenen schwächt.",
  },
  {
    slug: "nato-hat-russland-provoziert",
    title: "NATO hat Russland provoziert?",
    cluster: "Sicherheit, Geopolitik & Resilienz",
    claim: "Die NATO hat Russland provoziert.",
    judgement: "Sicherheitsdilemma, aber Täter-Opfer-Verschiebung.",
    truePoints: ["Sicherheitsinteressen, Bündniserweiterung und geopolitische Wahrnehmungen müssen historisch analysiert werden.", "Auch westliche Politik ist kritisierbar."],
    missingPoints: ["Aus Kontext wird Rechtfertigung für Angriffskrieg.", "Souveränität osteuropäischer Staaten und ihre Sicherheitsinteressen verschwinden.", "Die bessere Analyse trennt Ursachen, Interessen, Verantwortung und Völkerrecht."],
    betterQuestion: "Wie erklären wir Sicherheitsinteressen, ohne Angriffskrieg und Grenzverschiebung zu rechtfertigen?",
    hostLine: "Kontext erklären ja. Aber Kontext ist keine Rechtfertigung. Staaten haben eigene Sicherheitsinteressen und Grenzen dürfen nicht mit Gewalt verschoben werden.",
  },
  {
    slug: "resilienz-ist-autarkie",
    title: "Resilienz ist Autarkie?",
    cluster: "Sicherheit, Geopolitik & Resilienz",
    claim: "Resilienz heißt Autarkie.",
    judgement: "Sicherheitskern, aber falsches Abschottungsbild.",
    truePoints: ["Abhängigkeiten bei Energie, Rohstoffen, Medikamenten, Daten und Lieferketten können riskant sein.", "Kritische Infrastruktur braucht Schutz und Reserven."],
    missingPoints: ["Autarkie ist oft teuer, langsam und verletzlich.", "Resilienz entsteht durch Diversifizierung, Standards, Partner, Lager, Reparaturfähigkeit, Kreislaufwirtschaft und Lernfähigkeit.", "Abschottung kann Sicherheit schwächen."],
    betterQuestion: "Welche Mischung aus Diversifizierung, Reserven, Partnern und Eigenfähigkeit macht Systeme wirklich robuster?",
    hostLine: "Resilienz heißt nicht alles allein machen. Resilienz heißt: mehrere Wege, gute Partner, Reserven und Reparaturfähigkeit.",
  },
  {
    slug: "woek-bewertet-menschen",
    title: "Wirkungsökonomie bewertet Menschen?",
    cluster: "Missverständnisse über die Wirkungsökonomie",
    claim: "Die Wirkungsökonomie bewertet Menschen.",
    judgement: "Kontrollangst, aber falscher Gegenstand.",
    truePoints: ["Bewertungssysteme können missbraucht werden und brauchen klare Grenzen.", "Menschenwürde darf nie bilanziert oder verrechnet werden."],
    missingPoints: ["Die Wirkungsökonomie bewertet nicht Menschen, sondern Folgen von Entscheidungen, Produkten, Regeln und Kapitalflüssen.", "Mensch, Planet und Demokratie sind Schutzgüter, keine Punkteskala für Personen.", "Die bessere Frage ist: Welche Wirkung erzeugt eine Entscheidung und wer trägt Folgen?" ],
    betterQuestion: "Wie messen wir Folgen von Entscheidungen, ohne Menschenwürde zu verrechnen?",
    hostLine: "Die WÖk bewertet keine Menschen. Sie prüft, welche Folgen Entscheidungen für Menschen, Planet und Demokratie haben.",
  },
  {
    slug: "wirkungsteuer-macht-alles-teurer",
    title: "Wirkungsteuer macht alles teurer?",
    cluster: "Missverständnisse über die Wirkungsökonomie",
    claim: "Eine Wirkungsteuer macht alles teurer.",
    judgement: "Preissorge, aber Folgekosten fehlen.",
    truePoints: ["Preise und Verteilungseffekte müssen ernst genommen werden.", "Schlechte Abgaben können sozial ungerecht wirken."],
    missingPoints: ["Schäden sind schon heute teuer, nur oft versteckt: Gesundheit, Klima, Wasser, Infrastruktur, Pflege, Sicherheit.", "Eine gute Rückkopplung verteuert nicht alles, sondern verschiebt Anreize von Schaden zu positiver Netto-Wirkung.", "Sozialer Ausgleich und Rückverteilung sind Teil der Architektur."],
    betterQuestion: "Welche Schäden sind heute versteckt eingepreist - und wie lässt sich Rückkopplung sozial gerecht gestalten?",
    hostLine: "Schäden sind nicht kostenlos. Die Frage ist, ob wir sie versteckt zahlen oder fair in Entscheidungen zurückkoppeln.",
  },
];

const missingDetailPackages = [
  ["co2-ist-nur-ein-spurengas", "CO₂ ist nur ein Spurengas", "Klima & Energie", "Spurengas-Frame mit falscher Schlussfolgerung."],
  ["das-ist-alles-gesteuert", "Das ist alles gesteuert", "Demokratie & Öffentlichkeit", "Kontrollgefühl, aber Verschwörungslogik."],
  ["das-ist-zensur", "Das ist Zensur", "Demokratie & Öffentlichkeit", "Meinungsfreiheitskern, falscher Zensurbegriff."],
  ["die-da-oben", "Die da oben", "Demokratie & Öffentlichkeit", "Machtkritik, aber pauschale Elitenerzählung."],
  ["klima-hat-sich-schon-immer-veraendert", "Klima hat sich schon immer verändert", "Klima & Energie", "Wahrer Satz, falsche Ursache."],
  ["klimaschutz-ist-oekodiktatur", "Klimaschutz ist Ökodiktatur", "Klima & Energie", "Freiheitsangst, aber Risikoausblendung."],
  ["man-wird-doch-wohl-fragen-duerfen", "Man wird doch wohl fragen dürfen", "Demokratie & Öffentlichkeit", "Fragefreiheit, aber Schutzschild gegen Prüfung."],
  ["windraeder-zerstoeren-natur", "Windräder zerstören Natur", "Klima & Energie", "Zielkonflikt, aber falsches Totalbild."],
];

const routeAliasPackages = [
  ["fuenfzehn-minuten-stadt-klimakaefig", "15-Minuten-Stadt oder Klimakäfig?", "Wohnen, Stadt & Infrastruktur", "Nähe kann Alltag erleichtern. Zum Käfig wird es erst im Angstframe.", "15-Minuten-Stadt heißt nicht, dass Menschen eingesperrt werden.", "Welche Stadtplanung verkürzt Wege, ohne Freiheit, Eigentum und demokratische Entscheidung einzuschränken?"],
  ["oeffentlicher-rundfunk-staatsfunk", "Öffentlicher Rundfunk oder Staatsfunk?", "Medien, Demokratie & Öffentlichkeit", "Reformbedarf ja. Staatsfunk-Frame nein.", "Öffentlich-rechtliche Medien brauchen Kritik, Kontrolle und Reform. Das ist aber nicht dasselbe wie Staatspropaganda.", "Welche Kontrolle, Transparenz und Vielfalt machen öffentlich-rechtliche Medien demokratisch besser?"],
  ["verfassungsschutz-regierungsschutz", "Verfassungsschutz oder Regierungsschutz?", "Medien, Demokratie & Öffentlichkeit", "Kontrollfrage ja. Pauschale Delegitimierung nein.", "Sicherheitsbehörden brauchen Kontrolle und Rechtswege. Daraus folgt nicht, dass jede Extremismusprüfung Regierungsschutz ist.", "Welche rechtsstaatliche Kontrolle schützt Grundrechte und Demokratie zugleich?"],
];

function narrativeCasePackage(input) {
  const mechanisms = input.mechanisms || [];
  const hidden = input.perception_shift?.hidden || [];
  const effects = input.democratic_effects || [];
  const resonance = input.resonance_spaces || [];
  const question = input.woek_question || input.system_questions?.[0] || "Welche konkrete Wirkung entsteht, wenn Menschen diesem Frame folgen?";
  const title = /\?$/.test(input.title) ? input.title : `${input.title}?`;
  const cluster = String(input.cluster || "Mythen & Narrative").replace(/\s*\/\s*/g, ", ");
  return {
    slug: slugify(input.id || input.title),
    title,
    cluster,
    claim: input.title,
    judgement: input.short_thesis || "Ein vorbereiteter Narrativ-Seed wird als Debattenkarte sichtbar gemacht.",
    truePoints: [
      "Kritik an Politik, Institutionen, Medien oder Transformation ist legitim, wenn sie konkret, überprüfbar und verhältnismäßig bleibt.",
      `Der Satz aktiviert nachvollziehbare Resonanzräume: ${resonance.slice(0, 4).join(", ") || "Unsicherheit, Ärger, Kontrollwunsch"}.`,
      input.source?.title ? `Der Seed ist als öffentlicher Sprach- und Frame-Fall aus ${input.source.title} dokumentiert.` : "Der Seed ist als öffentlicher Sprach- und Frame-Fall dokumentiert.",
    ],
    missingPoints: [
      input.short_thesis || "Der Begriff verkürzt eine komplexe Lage zu einem schnellen Deutungsbild.",
      hidden.length ? `Ausgeblendet werden: ${hidden.slice(0, 4).join(", ")}.` : "Ausgeblendet werden konkrete Zuständigkeiten, Daten, Alternativen und demokratische Korrekturwege.",
      effects.length ? `Demokratisches Risiko: ${effects.slice(0, 4).join(", ")}.` : "Demokratisch riskant wird der Frame, wenn Kritik zu Pauschalverdacht oder Feindbild wird.",
    ],
    betterQuestion: question,
    hostLine: input.counterframe || `Den wahren Punkt konkret prüfen, aber den Frame nicht übernehmen: ${question}`,
    source: input.source,
    narrativeEffects: mechanisms,
    resonanceSpaces: resonance,
    generatedFromNarrativeCase: true,
  };
}

const narrativeCasePackages = readJson("assets/data/narrative-cases.json", []).map(narrativeCasePackage);

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copy(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${content.trim()}\n`, "utf8");
}

function shell({ title, description, canonical, base, main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Debatten-Kompass">
    <meta name="search_type" content="Debattenkarte">
    <meta name="wirkungsradar_status" content="live">
    <meta name="wirkungsradar_data_stand" content="${DATA_STAND}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260606-nav-cache-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Debatten-Kompass</p><h2>Debattenkarten-Inventar gepflegt.</h2><p>Dieses Paket ist als Debattenkarte und Detailseite veröffentlicht. Quellen und Fachstand werden im Inventar nachgeführt.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/status/">Status öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260606-main-cache-fix"></script>
  </body>
</html>`;
}

function radarNav(base) {
  const links = [
    ["Antwort finden", `${base}wirkungsradar/`],
    ["Debattenkarten", `${base}wirkungsradar/debattenkarten/`],
    ["Mythen & Narrative", `${base}wirkungsradar/narrative/`],
    ["Antwort-Playbooks", `${base}wirkungsradar/antwort-playbooks/`],
    ["Wirkungsradar-Methode", `${base}wirkungsradar/methode/`],
    ["Quellen", `${base}wirkungsradar/quellen/`],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

function fallbackPackage([slug, title, cluster, judgement]) {
  return {
    slug,
    title,
    cluster,
    claim: title,
    judgement,
    truePoints: ["Die Aussage enthält einen prüfbaren Teil, der nicht weggewischt werden sollte.", "Die konkrete Faktenlage muss nach Quelle, Zeitraum, Bilanzgrenze und Alternative getrennt werden."],
    missingPoints: ["Aus einem Teilaspekt wird leicht ein Gesamturteil.", "Folgekosten, Alternativen, psychologische Wirkung und demokratische Entscheidung verschwinden.", "Deshalb braucht die Detailseite nicht nur Faktencheck, sondern Folgencheck."],
    betterQuestion: "Welche konkrete Wirkung entsteht, wenn Menschen dieser Aussage folgen?",
    hostLine: "Der wahre Punkt gehört in die Rechnung. Aber die Schlussfolgerung braucht Fakten, Bilanzgrenze und Folgencheck.",
    generatedFromExistingLive: true,
  };
}

function routeAliasPackage([slug, title, cluster, judgement, hostLine, betterQuestion]) {
  return {
    slug,
    title,
    cluster,
    claim: title,
    judgement,
    truePoints: [
      "Die Aussage berührt einen realen Prüfpunkt: öffentliche Regeln, Kosten, Freiheit, Kontrolle oder institutionelle Verantwortung müssen nachvollziehbar sein.",
      "Kritik ist legitim, wenn sie konkrete Entscheidungen, Zuständigkeiten, Daten und Alternativen prüft.",
    ],
    missingPoints: [
      "Aus einem berechtigten Prüfpunkt wird ein pauschales Misstrauens- oder Verbotsbild.",
      "Demokratische Kontrolle, Rechtswege, lokale Unterschiede, Folgekosten und bessere Gestaltungsoptionen werden ausgeblendet.",
      "Der bessere Weg ist nicht Pauschalverdacht, sondern konkrete Wirkungsprüfung.",
    ],
    betterQuestion,
    hostLine,
    generatedFromAliasClosure: true,
  };
}

function answer10(item) {
  return `${item.judgement} Der wahre Punkt gehört in die Rechnung. Entscheidend ist: ${item.betterQuestion}`;
}

function answer30(item) {
  return `Der wahre Kern ist: ${item.truePoints[0]} Der Denkfehler ist: ${item.missingPoints[0]} Die bessere Reaktion ist, den Frame nicht zu wiederholen, sondern die Wirkung zu prüfen: ${item.betterQuestion}`;
}

function answer2(item) {
  return `${item.claim} klingt stark, weil die Aussage einen echten Punkt berührt: ${item.truePoints.join(" ")} Irreführend wird sie, wenn daraus ein geschlossenes Gesamtbild gemacht wird. ${item.missingPoints.join(" ")} Der Debatten-Kompass fragt deshalb nicht nur, ob ein Teil stimmt, sondern welche Entscheidung wahrscheinlicher wird, wenn Menschen dem Frame folgen. Die bessere Frage lautet: ${item.betterQuestion} So bleibt der reale Punkt sichtbar, ohne dass aus Sorge, Ärger oder Kontrollbedürfnis eine falsche politische Schlussfolgerung wird.`;
}

function chips(items) {
  return `<div class="radar-card-badges">${items.map((item) => `<span>${esc(item)}</span>`).join("")}</div>`;
}

function livePage(item) {
  const base = "../../../";
  const main = `
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsradar/">Debatten-Kompass</a> / Debattenkarte</nav>
          <p class="hero-kicker">${esc(item.cluster)}</p>
          <h1 class="hero-title">${esc(item.title)}</h1>
          <p class="hero-subtitle">${esc(item.judgement)}</p>
          <p class="radar-status-line"><span>Status: Debattenkarte</span><span>Datenstand: ${DATA_STAND}</span><span>Quellenprüfung: redaktionell nachführen</span></p>
        </div>
      </section>
      ${radarNav(base)}
      <section class="section" id="host-cockpit"><div><div class="section-header"><p class="hero-kicker">Schnellantwort</p><h2>Was wird behauptet?</h2></div><div class="card-grid two">
        <article class="card"><p class="v2-badge">Kurzantwort - 10 Sekunden</p><p class="card-text">${esc(item.hostLine)}</p><button class="copy-chip" type="button" data-copy-text='${copy(item.hostLine)}'>Antwort kopieren</button></article>
        <article class="card v2-card-strong"><p class="v2-badge">Kurzurteil</p><h3 class="card-title">${esc(item.judgement)}</h3></article>
        <article class="card"><p class="v2-badge">Die bessere Frage</p><p class="card-text">${esc(item.betterQuestion)}</p><button class="copy-chip" type="button" data-copy-text='${copy(item.betterQuestion)}'>Frage kopieren</button></article>
        <article class="card"><p class="v2-badge">Frame nicht übernehmen</p><p class="card-text"><strong>Alter Frame:</strong> ${esc(item.claim)}</p><p class="card-text"><strong>Besser:</strong> ${esc(item.hostLine)}</p></article>
      </div></div></section>
      <section class="section" id="verstehen"><div><div class="section-header"><p class="hero-kicker">Verstehen</p><h2>Was stimmt - und was fehlt?</h2></div><div class="card-grid two">
        <article class="card"><p class="card-kicker">Was stimmt?</p><ul class="clean-list">${item.truePoints.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></article>
        <article class="card"><p class="card-kicker">Was fehlt?</p><ul class="clean-list">${item.missingPoints.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></article>
      </div></div></section>
      <section class="section section-soft v3-layer-consequences" id="folgencheck"><div><div class="section-header"><p class="hero-kicker">Wirkung statt bloßer Faktenprüfung</p><h2>Folgencheck: Was dieses Narrativ bewirkt</h2><p>Der Debatten-Kompass fragt, was wahrscheinlicher wird, wenn Menschen dem Frame folgen.</p></div><div class="card-grid three v3-consequence-orders">
        <article class="card v3-order-card"><p class="v2-badge">Wirkung 1. Ordnung</p><h3 class="card-title">Wahrnehmung</h3><p class="card-text">Die Debatte springt auf den alten Frame: ${esc(item.claim)}</p></article>
        <article class="card v3-order-card"><p class="v2-badge">Wirkung 2. Ordnung</p><h3 class="card-title">Entscheidung</h3><p class="card-text">Die konkrete Wirkungsfrage wird verdrängt: ${esc(item.betterQuestion)}</p></article>
        <article class="card v3-order-card"><p class="v2-badge">Wirkung 3. Ordnung</p><h3 class="card-title">Systempfad</h3><p class="card-text">Schlechtere Entscheidungen wirken plausibler, weil Ursache, Alternative und Folgekosten unscharf bleiben.</p></article>
      </div><div class="card v3-mpd-risk-card"><p class="card-kicker">Wirkungsökonomische Einordnung</p><p class="card-text">Relevant ist nicht nur, ob ein Teil der Aussage stimmt. Relevant ist, welcher Zustand für Mensch, Planet und Demokratie wahrscheinlicher wird.</p></div></div></section>
      <section class="section" id="loesungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Vom Frame zurück zur Wirkung.</h2></div><div class="impact-path-stepper">
        <article class="impact-path-step"><p class="v2-badge">Auslöser</p><p>${esc(item.claim)}</p></article>
        <article class="impact-path-step"><p class="v2-badge">Wirkungspotenzial</p><p>${esc(item.judgement)}</p></article>
        <article class="impact-path-step"><p class="v2-badge">Wirkmechanismus</p><p>Ein Teilaspekt wird zur ganzen Erklärung gemacht.</p></article>
        <article class="impact-path-step"><p class="v2-badge">Zustandsveränderung</p><p>Die bessere Frage verschwindet aus der Debatte.</p></article>
        <article class="impact-path-step"><p class="v2-badge">Rückkopplung</p><p>Der alte Frame wirkt später noch plausibler.</p></article>
        <article class="impact-path-step"><p class="v2-badge">Gegensteuerung</p><p>${esc(item.betterQuestion)}</p></article>
      </div></div></section>
      <section class="section section-soft" id="host-antworten"><div><div class="section-header"><p class="hero-kicker">Debatten-Kompass: So reagierst du</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2></div><div class="radar-answer-accordion host-answer-tabs">
        <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span><span class="radar-answer-label">Kernsatz</span></summary><p>${esc(answer10(item))}</p><button class="copy-chip" type="button" data-copy-text='${copy(answer10(item))}'>Antwort kopieren</button></details>
        <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span><span class="radar-answer-label">Einordnung</span></summary><p>${esc(answer30(item))}</p><button class="copy-chip" type="button" data-copy-text='${copy(answer30(item))}'>Antwort kopieren</button></details>
        <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span><span class="radar-answer-label">Vertiefung</span></summary><p>${esc(answer2(item))}</p><button class="copy-chip" type="button" data-copy-text='${copy(answer2(item))}'>Antwort kopieren</button></details>
      </div></div></section>
      <section class="section debate-psychology-secondary" id="psychologie"><div><details class="debate-psychology-accordion"><summary><span>Warum zieht dieses Narrativ?</span><span>Ergänzende Mechanik</span></summary><p class="card-text">Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen. Wer den Mechanismus erkennt, kann die Debatte auf den Wirkpfad zurückholen.</p><div class="debate-psychology-list">
        <article class="card debate-psychology-item"><p class="v2-badge">Frame-Effekt</p><h3 class="card-title">Ein Bild entscheidet vor der Prüfung.</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> Der Satz setzt ein schnelles Bild. Wer nur widerspricht, bleibt oft im alten Frame.</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> Wahren Punkt anerkennen und Bilanzgrenze öffnen.</p></article>
        <article class="card debate-psychology-item"><p class="v2-badge">Verfügbarkeitsheuristik</p><h3 class="card-title">Das auffällige Beispiel wirkt wie die ganze Lage.</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> Ein emotionales Einzelbild wird leichter erinnert als eine differenzierte Wirkungsrechnung.</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> Daten, Zeitpfad und Gegenbeispiel ergänzen.</p></article>
        <article class="card debate-psychology-item"><p class="v2-badge">Kontrollbedürfnis</p><h3 class="card-title">Eine einfache Ursache beruhigt.</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> Komplexität wird auf eine Schuldfigur oder eine einfache Blockade reduziert.</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> Konkrete Hebel nennen, die den Zustand verbessern.</p></article>
      </div>${item.narrativeEffects?.length || item.resonanceSpaces?.length ? `<article class="card"><p class="card-kicker">Seed-Signale</p>${chips([...(item.narrativeEffects || []), ...(item.resonanceSpaces || [])].slice(0, 10))}</article>` : ""}</details></div></section>
      <section class="section" id="weiter"><div><article class="card"><p class="card-kicker">Vertiefung</p><h2 class="card-title">Detailseite öffnen.</h2><p class="card-text">Die Detailseite bündelt Faktenlage, Folgencheck, psychologische Mechanik, Antwortformate und offene Quellenpflege.</p><p><a class="btn btn-primary" href="../../detail/${esc(item.slug)}/">Detailanalyse öffnen</a></p></article></div></section>`;
  return shell({
    title: `${item.title} | Debatten-Kompass`,
    description: `${item.title}: schnelle Antwort, Faktenkern, Denkfehler und bessere Frage im Debatten-Kompass.`,
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/live/${item.slug}/`,
    base,
    main,
  });
}

function detailPage(item) {
  const base = "../../../";
  const main = `
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsradar/">Debatten-Kompass</a> / Detail</nav>
          <p class="hero-kicker">${esc(item.cluster)}</p>
          <h1 class="hero-title">${esc(item.title)}</h1>
          <p class="hero-subtitle">${esc(item.judgement)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Diese Detailseite schließt ein zuvor nur vorbereitetes Radar-Paket. Sie trennt wahren Kern, fehlende Bilanzgrenze, psychologische Wirkung, bessere Frage und demokratische Anschlussfähigkeit.</p>
          <p class="radar-status-line"><span>Status: Detail-Paket veröffentlicht</span><span>Datenstand: ${DATA_STAND}</span><span>Quellenprüfung: redaktionell nachführen</span></p>
        </div>
      </section>
      ${radarNav(base)}
      <section class="section" id="aussage"><div><article class="card"><p class="card-kicker">Aussage</p><h2 class="card-title">${esc(item.claim)}</h2><p class="card-text">${esc(item.judgement)}</p>${chips([item.cluster, "Debattenkarte", "Folgencheck"])}</article></div></section>
      <section class="section section-soft" id="faktenlage"><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was der Satz belegt - und was nicht.</h2></div><div class="card-grid two">
        <article class="card"><p class="card-kicker">Prüfbarer Kern</p><ul class="clean-list">${item.truePoints.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></article>
        <article class="card"><p class="card-kicker">Denkfehler</p><ul class="clean-list">${item.missingPoints.map((point) => `<li>${esc(point)}</li>`).join("")}</ul></article>
      </div></div></section>
      <section class="section" id="folgencheck"><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was wahrscheinlicher wird, wenn der Frame gewinnt.</h2></div><div class="card-grid three">
        <article class="card"><p class="v2-badge">Sofort</p><p class="card-text">Die Debatte springt auf den alten Frame: ${esc(item.claim)}</p></article>
        <article class="card"><p class="v2-badge">Danach</p><p class="card-text">Die konkrete Wirkungsfrage wird verdrängt: ${esc(item.betterQuestion)}</p></article>
        <article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">Schlechtere Entscheidungen wirken plausibler, weil Ursache, Alternative und Folgekosten unscharf bleiben.</p></article>
      </div></div></section>
      <section class="section section-soft" id="antwort"><div><div class="section-header"><p class="hero-kicker">Antwort</p><h2>Frame verschieben.</h2></div><div class="radar-answer-accordion host-answer-tabs">
        <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span><span class="radar-answer-label">Kernsatz</span></summary><p>${esc(answer10(item))}</p></details>
        <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span><span class="radar-answer-label">Einordnung</span></summary><p>${esc(answer30(item))}</p></details>
        <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span><span class="radar-answer-label">Vertiefung</span></summary><p>${esc(answer2(item))}</p></details>
      </div></div></section>
      <section class="section" id="quellenstatus"><div><article class="card"><p class="card-kicker">Quellenstatus</p><h2 class="card-title">Veröffentlicht, Quellenpflege sichtbar.</h2><p class="card-text">Dieses Paket wurde aus dem offenen Backlog in eine Debattenkarte und Detailseite überführt. Wo noch keine spezifische Quellenkette im vorhandenen Dossierbestand hinterlegt war, ist die Quellenprüfung ausdrücklich als redaktionell nachzuführen markiert.</p><p><a class="btn btn-secondary" href="../../quellen/">Quellenhub öffnen</a></p></article></div></section>
      ${item.source?.url ? `<section class="section section-soft" id="seed-quelle"><div><article class="card"><p class="card-kicker">Seed-Quelle</p><h2 class="card-title">${esc(item.source.title || "Quelle")}</h2><p class="card-text">${esc(item.source.context || "Quelle des vorbereiteten Narrativ-Seeds.")}</p><p><a class="btn btn-secondary" href="${esc(item.source.url)}" target="_blank" rel="noopener">Quelle öffnen</a></p></article></div></section>` : ""}
      <section class="section section-soft" id="debattenkarte"><div><article class="card"><p class="card-kicker">Debattenkarte</p><h2 class="card-title">Schnell nutzbare Antwort.</h2><p class="card-text">${esc(item.hostLine)}</p><p><a class="btn btn-primary" href="../../live/${esc(item.slug)}/">Antwort öffnen</a></p></article></div></section>`;
  return shell({
    title: `${item.title} | Debatten-Kompass Detail`,
    description: `${item.title}: Detailanalyse mit Faktenkern, Denkfehler, Folgencheck und Antwortformaten.`,
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/detail/${item.slug}/`,
    base,
    main,
  });
}

function card(item, base = "") {
  return `<a class="card text-link-card radar-live-card" href="${base}${esc(item.slug)}/" data-radar-card data-topic="${esc(item.cluster)}" data-search="${esc([item.title, item.claim, item.cluster, item.judgement, item.betterQuestion].join(" "))}">
    <div class="radar-card-badges"><span>${esc(item.cluster)}</span><span>Debattenkarte</span></div>
    <h3 class="card-title">${esc(item.title)}</h3>
    <p class="card-text">${esc(item.judgement)}</p>
    <p class="card-text"><strong>Bessere Frage:</strong> ${esc(item.betterQuestion)}</p>
  </a>`;
}

function removeSection(html, id) {
  const pattern = new RegExp(`\\n\\s*<section[^>]+id="${id}"[\\s\\S]*?\\n\\s*</section>`, "m");
  return html.replace(pattern, "");
}

function injectBeforeMainEnd(file, id, section) {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(`id="${id}"`)) {
    const cleaned = removeSection(html, id);
    writeFile(file, cleaned.replace(/\s*<\/main>/, `\n${section}\n    </main>`));
    return;
  }
  writeFile(file, html.replace(/\s*<\/main>/, `\n${section}\n    </main>`));
}

function extractPublishedRouteCard(slug) {
  const file = `wirkungsradar/live/${slug}/index.html`;
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, "utf8");
  const text = (pattern, fallback = "") => {
    const match = html.match(pattern);
    return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : fallback;
  };
  const title = text(/<h1[^>]*class="[^"]*hero-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/, slug.replace(/-/g, " "));
  const cluster = text(/<p[^>]*class="[^"]*hero-kicker[^"]*"[^>]*>([\s\S]*?)<\/p>/, "Debattenkarte")
    .replace(/\s*·\s*(checked|geprüft|v2|Live|Detail|positives Erklärbild).*$/i, "")
    .replace(/^Wirkungsradar\s*/i, "")
    .trim() || "Debattenkarte";
  const subtitle = text(/<p[^>]*class="[^"]*hero-subtitle[^"]*"[^>]*>([\s\S]*?)<\/p>/, "Veröffentlichte Debattenkarte.");
  return {
    slug,
    title: /\?$/.test(title) ? title : `${title}?`,
    cluster,
    claim: title,
    judgement: subtitle,
    betterQuestion: "Welche Aussage steckt dahinter - und welche Antwort führt zur Wirkung statt in den Frame?",
  };
}

function updatePublishedLiveRouteCards(file, base = "") {
  if (!fs.existsSync(file)) return;
  let html = removeSection(fs.readFileSync(file, "utf8"), "weitere-veroeffentlichte-live-routen");
  const linked = new Set();
  for (const match of html.matchAll(/href="(?:\.\.\/live\/|)([^"\/]+)\/"/g)) {
    linked.add(match[1]);
  }
  const routeSlugs = fs
    .readdirSync("wirkungsradar/live", { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(`wirkungsradar/live/${entry.name}/index.html`))
    .map((entry) => entry.name)
    .filter((slug) => !linked.has(slug))
    .sort();
  const cards = routeSlugs.map(extractPublishedRouteCard).filter(Boolean);
  writeFile(file, html);
  if (!cards.length) return;
  injectBeforeMainEnd(
    file,
    "weitere-veroeffentlichte-live-routen",
    `<section class="section section-soft" id="weitere-veroeffentlichte-live-routen"><div><div class="section-header"><p class="hero-kicker">Weitere veröffentlichte Karten</p><h2>${cards.length} zusätzliche Live-Routen in der Antwortsuche.</h2><p>Diese veröffentlichten Karten stammen aus älteren oder spezialisierten Generatorpfaden und werden automatisch in die Suche aufgenommen.</p></div><div class="card-grid three">${cards.map((item) => card(item, base)).join("")}</div></div></section>`,
  );
}

function updateLiveCount(file) {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  const count = (html.match(/data-radar-card/g) || []).length;
  const updated = html.replace(
    /<p class="radar-search-status" data-live-count>[\s\S]*?<\/p>/,
    `<p class="radar-search-status" data-live-count>${count} Karten gefunden</p>`,
  );
  writeFile(file, updated);
}

function updateStatusPage(packages) {
  const base = "../../";
  const rows = packages
    .map((item) => `<tr><td><a class="text-link" href="../live/${esc(item.slug)}/">${esc(item.title)}</a></td><td>${esc(item.cluster)}</td><td>Debattenkarte + Detail</td><td>Quellenpflege nachführen</td></tr>`)
    .join("");
  const main = `
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Status</nav>
          <p class="hero-kicker">Debattenkarten-Inventar</p>
          <h1 class="hero-title">Debatten-Kompass Status</h1>
          <p class="hero-subtitle">Welche Pakete veröffentlicht sind, welche aus dem Backlog geschlossen wurden und wo Quellenpflege offen bleibt.</p>
          <p class="radar-status-line"><span>Datenstand: ${DATA_STAND}</span><span>Veröffentlicht: ${packages.length} Backlog-Pakete geschlossen</span><span>Generator: ${VERSION}</span></p>
        </div>
      </section>
      ${radarNav(base)}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Geschlossene offene Pakete</p><h2>Aus Backlog/Seed in Debattenkarte + Detail überführt.</h2></div><div class="table-wrap"><table><thead><tr><th>Paket</th><th>Cluster</th><th>Status</th><th>Hinweis</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
  writeFile("wirkungsradar/status/index.html", shell({
    title: "Debatten-Kompass Status",
    description: "Inventar der Debatten-Kompass-Pakete.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/status/",
    base,
    main,
  }));
}

const aliasPackages = routeAliasPackages.map(routeAliasPackage);
const allPackages = [...openPackages, ...aliasPackages, ...narrativeCasePackages, ...missingDetailPackages.map(fallbackPackage)];
const curatedStandaloneSlugs = new Set(["radwege-in-peru"]);

for (const item of allPackages) {
  if (curatedStandaloneSlugs.has(item.slug)) continue;
  if (!item.generatedFromExistingLive) {
    writeFile(`wirkungsradar/live/${item.slug}/index.html`, livePage(item));
  }
  writeFile(`wirkungsradar/detail/${item.slug}/index.html`, detailPage(item));
}

const sdgLegacy = fallbackPackage(["sdgs-sind-weltregierung", "SDGs sind Weltregierung?", "Demokratie & Öffentlichkeit", "Internationale Zusammenarbeit, aber keine Weltregierung."]);
writeFile("wirkungsradar/live/sdgs-sind-weltregierung/index.html", livePage(sdgLegacy));

injectBeforeMainEnd(
  "wirkungsradar/live/index.html",
  "offene-radar-pakete-geschlossen",
  `<section class="section section-soft" id="offene-radar-pakete-geschlossen"><div><div class="section-header"><p class="hero-kicker">Backlog geschlossen</p><h2>${openPackages.length + aliasPackages.length + narrativeCasePackages.length} zusätzliche Debattenkarten.</h2><p>Diese Karten waren bisher nur als Seed, Backlog, Alias oder Themenhinweis sichtbar und sind jetzt als Debattenkarten veröffentlicht.</p></div><div class="card-grid three">${[...openPackages, ...aliasPackages, ...narrativeCasePackages].map((item) => card(item)).join("")}</div></div></section>`,
);
updatePublishedLiveRouteCards("wirkungsradar/live/index.html");
updateLiveCount("wirkungsradar/live/index.html");

injectBeforeMainEnd(
  "wirkungsradar/debattenkarten/index.html",
  "offene-radar-pakete-geschlossen",
  `<section class="section section-soft" id="offene-radar-pakete-geschlossen"><div><div class="section-header"><p class="hero-kicker">Backlog geschlossen</p><h2>${openPackages.length + aliasPackages.length + narrativeCasePackages.length} zusätzliche Debattenkarten.</h2><p>Diese Karten waren bisher nur als Seed, Backlog, Alias oder Themenhinweis sichtbar und sind jetzt als Debattenkarten veröffentlicht.</p></div><div class="card-grid three">${[...openPackages, ...aliasPackages, ...narrativeCasePackages].map((item) => card(item, "../live/")).join("")}</div></div></section>`,
);
updatePublishedLiveRouteCards("wirkungsradar/debattenkarten/index.html", "../live/");
updateLiveCount("wirkungsradar/debattenkarten/index.html");

injectBeforeMainEnd(
  "wirkungsradar/detail/index.html",
  "offene-radar-detailpakete-geschlossen",
  `<section class="section section-soft" id="offene-radar-detailpakete-geschlossen"><div><div class="section-header"><p class="hero-kicker">Backlog geschlossen</p><h2>${allPackages.length + 1} zusätzliche Detailseiten.</h2><p>Offene Radar-Pakete und bisher nur als Live-Seite vorhandene Karten haben jetzt Detailseiten.</p></div><div class="card-grid three">${[...openPackages, sdgLegacy].map((item) => card(item)).join("")}</div></div></section>`,
);

updateStatusPage([...openPackages, ...aliasPackages, ...narrativeCasePackages, ...missingDetailPackages.map(fallbackPackage), sdgLegacy]);

writeFile(
  "reports/wirkungsradar-live-inventory.json",
  JSON.stringify(
    {
      dataStand: DATA_STAND,
      generator: VERSION,
      openedPackagesClosed: openPackages.map((item) => item.slug),
      aliasRoutesClosed: aliasPackages.map((item) => item.slug),
      narrativeCaseRoutesClosed: narrativeCasePackages.map((item) => item.slug),
      existingLiveDetailsAdded: missingDetailPackages.map(([slug]) => slug),
      legacyLiveAliasAdded: "sdgs-sind-weltregierung",
      note: "Backlog/Seed-Pakete wurden in Live- und Detailseiten ueberfuehrt. Spezifische Quellenketten bleiben sichtbar als redaktionelle Pflege markiert.",
    },
    null,
    2,
  ),
);

console.log(`Open radar packages built: ${openPackages.length + aliasPackages.length + narrativeCasePackages.length} live packages, ${allPackages.length + 1} detail/live-alias closures.`);
