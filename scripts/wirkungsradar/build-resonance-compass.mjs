import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_URL = "https://wirkungsoekonomie.de";
const DATA_STAND = "2026-06-05";
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, "data/wirkungsradar/resonance-cards.json"), "utf8"));
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

function cleanText(value = "") {
  return String(value)
    .replaceAll("\u2014", "-")
    .replace(/\bCO2\b/g, "CO₂")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const traps = [
  ["prozentfalle", "Prozentfalle", "Eine kleine Zahl wird so benutzt, als bedeute sie geringe Verantwortung.", "Welche Wirkung entsteht über direkte Anteile hinaus?"],
  ["kosten-ohne-gegenkosten", "Kosten ohne Gegenkosten", "Kosten einer Lösung werden gezeigt, Kosten des Nicht-Handelns verschwinden.", "Was kostet der Status quo wirklich?"],
  ["nullsummenfalle", "Nullsummenfalle", "Hilfe für A wird so dargestellt, als schade sie automatisch B.", "Welche Stabilität entsteht - und welche Folgekosten würden ohne Hilfe entstehen?"],
  ["einzelfallfalle", "Einzelfallfalle", "Ein auffälliger Fall ersetzt die Struktur.", "Was sagt der Einzelfall - und was sagt er nicht?"],
  ["symptom-statt-ursache", "Symptom statt Ursache", "Man diskutiert die sichtbare Folge, aber nicht den Systemfehler.", "Welche Ursache erzeugt das Symptom immer wieder?"],
  ["suendenbock-frame", "Sündenbock-Frame", "Komplexe Überlastung bekommt eine leicht greifbare Schuldfigur.", "Wer wird beschuldigt - und wer profitiert davon?"],
  ["verbotsfalle", "Verbotsfalle", "Jede Regel wird als Angriff auf Freiheit erzählt.", "Wie entsteht Freiheit durch gute Rahmenbedingungen?"],
  ["wundertechnik-aufschub", "Aufschub durch Wundertechnik", "Eine spätere Technologie soll heutige Entscheidungen ersetzen.", "Was wirkt rechtzeitig?"],
  ["nicht-perfekt-also-schlechter", "Nicht perfekt, also schlechter", "Eine Lösung wird verworfen, weil sie nicht wirkungsfrei ist.", "Vergleichen wir reale Alternativen oder ein Idealbild?"],
  ["falsche-bilanzgrenze", "Falsche Bilanzgrenze", "Es wird nur gezählt, was in den Frame passt.", "Welche Wirkungen fehlen in der Rechnung?"],
  ["zeitversatzfalle", "Zeitversatzfalle", "Kurzfristige Kosten verdrängen langfristige Wirkungen.", "Was verändert sich über Jahre, nicht nur heute?"],
  ["privathaushaltsfalle", "Privathaushaltsfalle", "Staatliche Investitionen werden wie private Konsumschulden erzählt.", "Erzeugt die Ausgabe künftige Leistungsfähigkeit?"],
  ["reichweite-als-relevanz", "Reichweite als Relevanz", "Was viel geteilt wird, gilt als wichtig.", "Passt die Aufmerksamkeit zum Wirkungsgewicht?"],
  ["falsche-mitte", "Falsche Mitte", "Aus zwei Positionen wird automatisch eine Mitte konstruiert.", "Welche Aussage ist belegt, welche nur laut?"],
  ["moralersatz", "Moralersatz", "Eine Debatte wird als Gut/Böse erzählt, statt den Wirkpfad zu zeigen.", "Welche Zustände ändern sich konkret?"],
  ["status-quo-verharmlosung", "Status-quo-Verharmlosung", "Nichtstun erscheint neutral.", "Was bewirkt Unterlassen?"],
  ["massstabsverwechslung", "Maßstabsverwechslung", "Ein lokaler Eindruck ersetzt systemische Einordnung oder umgekehrt.", "Auf welcher Ebene wirkt das Problem?"],
  ["externalisierungsvergessen", "Externalisierungsvergessen", "Folgen werden ausgelagert und dadurch unsichtbar.", "Wer trägt die Wirkung außerhalb des Preises?"],
  ["pseudo-pragmatismus", "Pseudo-Pragmatismus", "Eine verkürzte Lösung klingt bodenständig, vermeidet aber die Ursache.", "Welcher Hebel verändert den Zustand tatsächlich?"],
  ["emotionsbeweis", "Emotionsbeweis", "Ein starkes Gefühl wird als Beleg behandelt.", "Was ist das Gefühl - und was ist die Ursache?"],
  ["autoritaetsverdacht", "Autoritätsverdacht", "Institutionen werden pauschal verdächtigt.", "Welche Institution versagt konkret - und welcher Korrekturpfad existiert?"],
  ["identitaetsfalle", "Identitätsfalle", "Ein politisches Thema wird zur Frage von Zugehörigkeit.", "Welche gemeinsame Wirkungsfrage bleibt trotz Unterschied?"],
  ["ablenkungsfalle", "Ablenkungsfalle", "Ein reales, aber kleineres Thema besetzt Raum, während ein größeres Problem verschwindet.", "Was reden wir deshalb nicht?"],
  ["reporting-als-wirkung", "Reporting als Wirkung", "Sichtbarkeit oder Bericht ersetzt Veränderung.", "Was hat sich tatsächlich verändert?"],
  ["personalisierungsfalle", "Personalisierungsfalle", "Strukturprobleme werden einzelnen Personen zugeschrieben.", "Welche Regel, Infrastruktur oder Anreizlogik erzeugt das Verhalten?"],
].map(([slug, title, text, question]) => ({ slug, title, text, question }));

const causePages = [
  ["falsche-preise", "Falsche Preise", "Was würde dieses Produkt kosten, wenn seine Wirkung mit im Preis wäre?", "Der Preis zeigt Kapitalaufwand, Angebot und Nachfrage - aber nicht automatisch Klima-, Gesundheits-, Arbeits-, Ressourcen- und Demokratiefolgen."],
  ["externalisierte-kosten", "Externalisierte Kosten", "Wer zahlt am Ende die Rechnung, wenn sie nicht im Preis steht?", "Das System erlaubt, dass Kosten dort entstehen, wo sie nicht bezahlt werden. Der Gewinn entsteht an einer Stelle, die Rechnung an einer anderen."],
  ["buerokratie-als-reparaturmaschine", "Bürokratie als Reparaturmaschine", "Welche Bürokratie brauchen wir nur deshalb, weil Preise und Anreize vorher falsch sind?", "Wo der Markt Wirkung nicht selbst zurückkoppelt, muss Politik nachträglich reparieren: Fördertopf hier, Nachweispflicht dort, Sonderregel daneben."],
  ["fehlende-wirkungsrueckkopplung", "Fehlende Wirkungsrückkopplung", "Was ändert sich an der Entscheidung, wenn wir die Wirkung kennen?", "Reporting beschreibt. Es verändert noch keine Anreize. Ohne Rückkopplung bleiben Daten folgenlos."],
  ["aufmerksamkeit-als-falscher-kompass", "Aufmerksamkeit als falscher Kompass", "Ist dieses Thema wichtig - oder nur wirksam laut?", "Digitale Öffentlichkeit belohnt häufig Aktivierung: Empörung, Angst, Identität, Konflikt und Wiederholung. Relevanz und Wahrheit sind nicht automatisch sichtbar."],
  ["algorithmische-erregung", "Algorithmische Erregung", "Welche Inhalte belohnt der öffentliche Raum - und welche Gesellschaft entsteht dadurch?", "Viele Plattformlogiken optimieren auf Verweildauer, Interaktion und Reaktion. Das kann Polarisierung belohnen, auch ohne böse Absicht einzelner Nutzer:innen."],
  ["vertrauensverlust-in-institutionen", "Vertrauensverlust in Institutionen", "Welche konkrete Erfahrung müsste sich ändern, damit Vertrauen wieder begründet wächst?", "Vertrauen bricht, wenn Menschen Diskrepanz erleben: große Versprechen, schlechte Umsetzung, unklare Quellen, langsame Verfahren, unfaire Lasten und sichtbare Inkonsistenzen."],
  ["wahrheit-als-infrastrukturproblem", "Wahrheit als Infrastrukturproblem", "Wie machen wir Wahrheit auffindbar, prüfbar und anschlussfähig?", "Information ist sichtbar, aber nicht automatisch prüfbar. Quellen, Herkunft, Kontext, Datenstand und Korrekturwege fehlen oft."],
  ["kommunale-ueberlastung", "Kommunale Überlastung", "Welche Wirkung soll vor Ort entstehen - und hat die Kommune die Mittel dafür?", "Viele Systementscheidungen landen bei Kommunen, ohne dass Ressourcen, Daten, Zuständigkeiten und Handlungsspielräume mitwachsen."],
  ["investitionsstau", "Investitionsstau", "Welche Kosten entstehen, wenn wir heute nicht handeln?", "Kurzfristige Haushaltslogik kann Investitionen verhindern, deren Nutzen erst später sichtbar wird. Unterlassen wirkt aber auch."],
  ["wohnkosten-und-kapitalbindung", "Wohnkosten und Kapitalbindung", "Wie wird Wohnraum nach Lebenswirkung statt Verwertbarkeit gesteuert?", "Wohnraum ist Lebensgrundlage und Anlageklasse zugleich. Kapital sucht Rendite, während Menschen Sicherheit brauchen."],
  ["integrationsarchitektur", "Integrationsarchitektur", "Wie wird Ankommen schneller zu Teilhabe?", "Ankommen wird oft schlecht organisiert: Verfahren dauern, Abschlüsse bleiben liegen, Wohnraum fehlt, Kommunen improvisieren, Sprache und Arbeit kommen zu spät."],
  ["sozialstaat-unter-automatisierung", "Sozialstaat unter Automatisierung", "Wie verteilen wir Wertschöpfung, wenn Maschinen arbeiten?", "Der Sozialstaat hängt stark an Erwerbsarbeit und Lohnbeiträgen. Wenn Wertschöpfung automatisierter wird, passt die Finanzierungslogik immer weniger."],
  ["gesundheit-als-reparatursystem", "Gesundheit als Reparatursystem", "Welche Bedingungen machen Menschen gesund, bevor sie Patient:innen werden?", "Prävention, gute Lebensbedingungen, psychische Stabilität, Umweltqualität und soziale Teilhabe werden schlechter finanziert als Behandlung."],
  ["bildung-als-zukunftsinfrastruktur", "Bildung als Zukunftsinfrastruktur", "Was müssen Menschen verstehen, um Zukunft mitgestalten zu können?", "Bildung wird oft zu eng als Stoffvermittlung gelesen. Transformation braucht Systemdenken, Quellenprüfung, Wirkungskompetenz, Kooperation und demokratische Mündigkeit."],
  ["fossile-pfadabhaengigkeit", "Fossile Pfadabhängigkeit", "Welche fossile Normalität macht Veränderung scheinbar unzumutbar?", "Infrastruktur, Subventionen, Gewohnheiten, Industriepfade, Heizungen, Mobilität und Preise wurden über Jahrzehnte fossil gebaut."],
  ["technik-als-aufschubargument", "Technik als Aufschubargument", "Hilft diese Technologie rechtzeitig - oder beruhigt sie nur die Debatte?", "Technologieversprechen können Wirkung haben, bevor Technologie verfügbar, skalierbar oder bezahlbar ist."],
  ["nationale-massstabsverkuerzung", "Nationale Maßstabsverkürzung", "Welche Hebel bewegt ein Land über seinen direkten Anteil hinaus?", "Wirkung wird nur als direkter nationaler Anteil gelesen. Standards, EU-Regeln, Export, Technologie, Kapital, Vorbilder und Lieferketten werden ausgeblendet."],
  ["nichttriviale-systeme", "Nichttriviale Systeme", "Was verändert diese Maßnahme im System - nicht nur auf dem Papier?", "Gesellschaft, Wirtschaft, Natur und Öffentlichkeit reagieren nicht linear. Jede Regel verändert Erwartungen, Ausweichwege, Nebenwirkungen und Rückkopplungen."],
  ["demokratische-korrekturfaehigkeit", "Demokratische Korrekturfähigkeit", "Wie bleibt Demokratie lernfähig, ohne beliebig zu werden?", "Korrektur braucht Vertrauen, Quellen, Verfahren, Zeit, Fairness und die Bereitschaft, nicht jede Unsicherheit als Schwäche auszulegen."],
].map(([slug, title, question, text]) => ({ slug, title, question, text }));

const agendaItems = [
  ["klimafolgekosten-und-versicherbarkeit", "Klimafolgekosten und Versicherbarkeit", "unterbelichtet", "sehr hoch", "Wenn Extremwetter, Dürre, Hitze, Ernteausfälle und Versicherungsschäden zunehmen, wird Klimapolitik nicht zur Kostenfrage, sondern zur Stabilitätsfrage.", "Was kostet ein System, das Klimaschäden nicht rechtzeitig verhindert?"],
  ["fossile-systemkosten", "Fossile Systemkosten", "unterbelichtet", "sehr hoch", "Öl, Gas und Kohle erscheinen oft günstiger, weil Importabhängigkeit, Gesundheitskosten, Klimaschäden und Sicherheitsrisiken nicht vollständig im Preis stehen.", "Warum gilt nur Klimaschutz als teuer - und nicht das fossile System?"],
  ["medienqualitaet-und-algorithmische-erregung", "Medienqualität und algorithmische Erregung", "unterbelichtet", "sehr hoch", "Öffentlichkeit wird anfällig, wenn Sichtbarkeit durch Empörung belohnt wird und Qualität, Quellenklarheit und Korrektur weniger Reichweite bekommen.", "Wie muss digitale Öffentlichkeit gebaut sein, damit Wahrheit nicht gegen Erregung verliert?"],
  ["pflege-und-gesundheitspraevention", "Pflege und Gesundheitsprävention", "unterbelichtet", "hoch", "Das System bezahlt häufig Behandlung, Überlastung und Reparatur, aber zu wenig Prävention, Arbeitsbedingungen und stabile Sorgeinfrastruktur.", "Warum finanzieren wir Krankheit besser als Gesundheit?"],
  ["wohnkosten-und-bodenwert", "Wohnkosten und Bodenwert", "unterbelichtet", "sehr hoch", "Wohnungsnot wird oft auf Neubau verkürzt. Unter der Oberfläche liegen Bodenpreise, Kapitalbindung, Spekulation, Sanierung, Mietbelastung und kommunale Planung.", "Wie wird Wohnen wieder Daseinsvorsorge statt Kapitalanlage?"],
  ["bildung-und-zukunftskompetenz", "Bildung und Zukunftskompetenz", "unterbelichtet", "sehr hoch", "Transformation braucht Menschen, die Systeme verstehen, Quellen prüfen, Wirkung einschätzen und mit Unsicherheit umgehen können.", "Welche Bildung macht Gesellschaft transformationsfähig?"],
  ["kommunale-handlungsfaehigkeit", "Kommunale Handlungsfähigkeit", "unterbelichtet", "hoch", "Viele Krisen landen vor Ort: Wohnen, Integration, Klima-Anpassung, Pflege, Mobilität, Schule. Wenn Kommunen überlastet sind, bricht Wirkung an der Basis ab.", "Wie werden Kommunen zu Wirkungsorten statt Reparaturstellen?"],
  ["investitionsstau-und-schuldenlogik", "Investitionsstau und Schuldenlogik", "verzerrt", "hoch", "Sparen wirkt solide, kann aber teuer werden, wenn Infrastruktur, Bildung, Klima-Anpassung und Digitalisierung verfallen.", "Welche Schulden vermeiden Zukunftskosten - und welche verschieben nur Lasten?"],
  ["migration-und-integrationsarchitektur", "Migration und Integrationsarchitektur", "überhitzt/verzerrt", "hoch", "Migration wird oft als Kosten- oder Kulturfrage geführt. Entscheidend sind Verfahren, Sprache, Arbeit, Wohnen, Bildung, Kommunen und Zugehörigkeit.", "Wie wird Ankommen schneller zu Teilhabe, Arbeit, Beiträgen und Nachbarschaft?"],
  ["automatisierung-und-sozialversicherung", "Automatisierung und Sozialversicherung", "unterbelichtet", "sehr hoch", "Wenn Wertschöpfung stärker durch Maschinen und KI entsteht, reichen Lohnbeiträge als Finanzierungsbasis immer weniger.", "Wie sichern wir Einkommen, Würde und Sozialstaat, wenn Arbeit nicht mehr die Hauptquelle der Wertschöpfung ist?"],
  ["lieferkettenwirkung", "Lieferkettenwirkung", "unterbelichtet", "hoch", "Ein Produkt wirkt nicht nur im Laden. Klima, Wasser, Arbeit, Chemikalien und Rechte entstehen oft tief in der Lieferkette.", "Wie wird der Preis wahrer, wenn die Wirkung im Vorfeld entsteht?"],
  ["buerokratie-als-reparaturmaschine", "Bürokratie als Reparaturmaschine", "überhitzt/symptomfixiert", "hoch", "Bürokratie wird oft als Ursache dargestellt. Häufig wächst sie, weil falsche Preise und fehlende Rückkopplung Schäden nachträglich verwalten müssen.", "Welche Regeln würden unnötige Reparaturbürokratie überflüssig machen?"],
  ["oeffentliche-beschaffung", "Öffentliche Beschaffung", "unterbelichtet", "hoch", "Der Staat kauft enorm viel ein. Wenn Beschaffung nur auf Preis schaut, verstärkt sie schädliche Märkte. Wenn sie Wirkung berücksichtigt, wird sie Systemhebel.", "Wie kauft der Staat so ein, dass Wirkung zum Standard wird?"],
  ["demokratisches-vertrauen", "Demokratisches Vertrauen", "unterbelichtet", "sehr hoch", "Vertrauen ist keine Stimmung. Es ist Infrastruktur für langfristige Politik, Krisenfähigkeit und faire Konfliktlösung.", "Welche Entscheidungen stärken die Korrekturfähigkeit der Demokratie?"],
  ["digitale-selbstbestimmung-und-deepfakes", "Digitale Selbstbestimmung und Deepfakes", "unterbelichtet", "hoch", "KI, Datenprofile, Manipulation und synthetische Medien verändern, wem Menschen glauben und wie Öffentlichkeit Vertrauen bildet.", "Wie schützen wir Informationssouveränität, ohne offene Debatte zu ersticken?"],
  ["energieinfrastruktur-netze-speicher-flexibilitaet", "Energieinfrastruktur: Netze, Speicher, Flexibilität", "unterbelichtet", "hoch", "Die Debatte springt oft auf einzelne Technologien. Der eigentliche Hebel liegt im Zusammenspiel von Netzen, Speichern, Flexibilität, Effizienz und Nachfrage.", "Welche Infrastruktur macht saubere Energie verlässlich und bezahlbar?"],
  ["biodiversitaet-boden-und-wasser", "Biodiversität, Boden und Wasser", "unterbelichtet", "sehr hoch", "Natur wird oft als Kulisse behandelt. Boden, Wasser, Bestäuber und Artenvielfalt sind aber Produktions- und Lebensgrundlagen.", "Wie wird Natur als Infrastruktur des Lebens sichtbar?"],
  ["psychische-gesundheit-und-soziale-ueberlastung", "Psychische Gesundheit und soziale Überlastung", "unterbelichtet", "hoch", "Dauerstress, Unsicherheit, Einsamkeit und Überforderung wirken auf Arbeit, Bildung, Pflege, Demokratie und Zusammenhalt.", "Welche Systeme erzeugen Stabilität, bevor Menschen zusammenbrechen?"],
  ["industrie-transformation", "Industrie-Transformation", "verzerrt", "hoch", "Die Debatte kippt oft in Klimaschutz zerstört Industrie. Die echte Frage lautet: Welche Industrie bleibt wettbewerbsfähig, wenn Märkte dekarbonisieren?", "Wie wird Transformation zum Standortvorteil statt zur Abwehrschlacht?"],
  ["steueranreize-und-falsche-preise", "Steueranreize und falsche Preise", "unterbelichtet", "sehr hoch", "Steuern behandeln oft Umsatz, Einkommen oder Konsum, aber nicht die tatsächliche Wirkung. Dadurch bleiben destruktive Modelle konkurrenzfähig.", "Wie würde ein Steuersystem aussehen, das Wirkung zurückkoppelt?"],
  ["globale-gerechtigkeit-und-systemfolgen", "Globale Gerechtigkeit und Systemfolgen", "unterbelichtet", "hoch", "Viele Debatten tun so, als ende Wirkung an der Grenze. Klima, Lieferketten, Migration, Sicherheit und Märkte sind aber global verflochten.", "Welche Verantwortung entsteht, wenn unsere Entscheidungen anderswo Wirkung entfalten?"],
  ["sicherheits-und-friedensordnung", "Sicherheits- und Friedensordnung", "unterbelichtet/verzerrt", "hoch", "Sicherheit wird oft nur militärisch oder national diskutiert. Wirklich stabil wird sie durch Energieunabhängigkeit, Resilienz, Institutionen, Diplomatie und demokratische Bündnisse.", "Welche Sicherheitskosten entstehen, wenn Prävention und Stabilität fehlen?"],
  ["ernaehrungssystem-und-landwirtschaft", "Ernährungssystem und Landwirtschaft", "überhitzt/symptomfixiert", "hoch", "Landwirtschaft wird schnell zum Kulturkampf. Darunter liegen Preise, Böden, Wasser, Tierhaltung, Einkommen, Handelsketten und Ernährungssicherheit.", "Wie werden Bauernhöfe, Natur und Verbraucher:innen aus falschen Anreizen befreit?"],
  ["kulturkampf-um-sprache", "Kulturkampf um Sprache", "überhitzt", "mittel", "Sprache ist nicht unwichtig. Aber wenn Symboldebatten alles überdecken, verdrängen sie Bildung, Medienqualität, Teilhabe und reale Diskriminierungsfragen.", "Wann ist Sprachdebatte Wirkung - und wann nur Ablenkung?"],
  ["plattformmacht-und-reichweitenlogik", "Plattformmacht und Reichweitenlogik", "unterbelichtet", "sehr hoch", "Plattformen steuern, was sichtbar wird. Wenn Reichweite Empörung bevorzugt, wird Aufmerksamkeit selbst zur Systemmacht.", "Wer baut die Regeln des öffentlichen Raums - und nach welcher Wirkung?"],
  ["klimaanpassung-vor-ort", "Klimaanpassung vor Ort", "unterbelichtet", "hoch", "Hitze, Starkregen und Dürre brauchen lokale Infrastruktur: Schatten, Wasser, Entsiegelung, Warnsysteme, Pflege, Gesundheit, Versicherung.", "Wie wird Anpassung zur Daseinsvorsorge, bevor Schäden eskalieren?"],
  ["kinderarmut-und-startchancen", "Kinderarmut und Startchancen", "unterbelichtet", "sehr hoch", "Armut in der Kindheit wirkt über Bildung, Gesundheit, Teilhabe, Vertrauen und spätere Erwerbschancen weit in die Zukunft.", "Warum behandeln wir Startchancen nicht als wichtigste Zukunftsinvestition?"],
  ["rechtsstaatlichkeit-und-faire-verfahren", "Rechtsstaatlichkeit und faire Verfahren", "unterbelichtet", "hoch", "Wenn Verfahren zu langsam, undurchsichtig oder überlastet sind, verlieren Menschen Vertrauen - egal ob bei Asyl, Bauen, Verwaltung, Justiz oder Sozialleistungen.", "Welche Verfahrensqualität braucht eine wirksame Demokratie?"],
  ["datenqualitaet-und-wirkungswahrheit", "Datenqualität und Wirkungswahrheit", "unterbelichtet", "hoch", "Ohne gute Daten wird Wirkung geraten. Ohne Quellenklarheit werden Bewertungen angreifbar. Ohne Unsicherheitslogik entsteht Scheingenauigkeit.", "Wie machen wir Wirkung sichtbar, ohne so zu tun, als wüssten wir alles?"],
  ["gemeinsame-wirklichkeit", "Gemeinsame Wirklichkeit", "unterbelichtet", "sehr hoch", "Eine Demokratie braucht Streit. Aber Streit braucht eine geteilte Wirklichkeitsbasis, sonst wird jede Entscheidung zur Identitätsfrage.", "Welche Informationsinfrastruktur hält gemeinsame Wirklichkeit offen?"],
].map(([slug, title, relation, impact, text, question]) => ({ slug, title, relation, impact, text, question }));

function esc(value = "") {
  return cleanText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navHref(item, base) {
  const href = item.href || "#";
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return `${base}${href}`.replace(/\/{2,}/g, "/");
}

function navLink(item, base) {
  const match = (item.match || []).join(" ");
  return `<a href="${navHref(item, base)}" data-nav-match="${esc(match)}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
        ${(group.items || []).map((item) => navLink(item, base)).join("\n        ")}
      </div>
    </div>`;
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", (navigation.footerGroups || []).map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function write(relative, html) {
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, "utf8");
}

function redirectPage({ title, canonical, destination, base = "../../" }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Wirkungsökonomie</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${esc(canonical)}">
  <meta http-equiv="refresh" content="0; url=${esc(destination)}">
  <link rel="stylesheet" href="${base}assets/css/style.css?v=20260606-nav-cache-fix">
</head>
<body>
  <main class="section"><article class="card"><p class="card-kicker">Weiterleitung</p><h1>${esc(title)}</h1><p>Diese Seite ist kanonisch unter <a class="text-link" href="${esc(destination)}">${esc(destination)}</a> erreichbar.</p></article></main>
</body>
</html>`;
}

function shell({ title, description, canonical, base = "../../", main }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Wirkungsökonomie</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="stylesheet" href="${base}assets/css/style.css?v=20260606-nav-cache-fix">
</head>
<body>
  <header class="site-header" data-search-exclude>
    <a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
    <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
    <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
  </header>
  <main>${main}</main>
  ${renderFooter(base)}
  <script src="${base}assets/js/main.js?v=20260606-main-cache-fix"></script>
</body>
</html>`;
}

function radarNav(base = "../") {
  const links = [
    ["Antwort finden", `${base}`],
    ["Debattenkarten", `${base}debattenkarten/`],
    ["Resonanz-Kompass", `${base}resonanz-kompass/`],
    ["Agenda-Radar", `${base}agenda-radar/`],
    ["Ursachen", `${base}ursachen-navigator/`],
    ["Muster", `${base}muster/`],
    ["Resilienz", `${base}resilienz-prinzipien/`],
    ["Methode", `${base}resonanz-kompass/methode/`],
    ["Einreichen", `${base}narrativ-einreichen/`],
  ];
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>${links.map(([label, href]) => `<a class="pill-link" href="${href}">${esc(label)}</a>`).join("")}</nav>`;
}

function cardGrid(items, mapper) {
  return `<div class="card-grid two">${items.map(mapper).join("")}</div>`;
}

function sourceCards() {
  const sources = [
    ["IPCC", "Klimawissenschaft, Risiken, Anpassung und Folgen des Nicht-Handelns.", "https://www.ipcc.ch/"],
    ["OECD", "Vertrauen, Regulierung, Integration, Arbeit, Gesundheit und bessere öffentliche Steuerung.", "https://www.oecd.org/"],
    ["Umweltbundesamt", "Daten zu Klima, Energie, Emissionen, Umweltfolgen und Anpassung.", "https://www.umweltbundesamt.de/"],
    ["Bundeszentrale für politische Bildung", "Politische Bildung, Demokratie, Medienkompetenz und gesellschaftliche Einordnung.", "https://www.bpb.de/"],
    ["WÖk Referenz", "Begriffe, Wirkpfade und Online-Kapitel der Wirkungsökonomie.", "/referenz/"],
  ];
  return `<section class="section" id="quellen"><div><div class="section-header"><p class="hero-kicker">Quellenlogik</p><h2>Erst Einordnung. Dann Quelle.</h2><p>Quellen belegen konkrete Fakten, Grenzen oder Datenstände. Sie ersetzen nicht den Folgencheck.</p></div>${cardGrid(sources, ([title, text, href]) => `<article class="card source-card"><p class="card-kicker">Quelle</p><h3>${esc(title)}</h3><p><strong>Belegt hier:</strong> ${esc(text)}</p><p><a class="text-link" href="${href}">Quelle öffnen</a></p></article>`)}</div></section>`;
}

function relationLabel(card) {
  return `${card.attention || "Aufmerksamkeit offen"} · ${card.impact || "Wirkungsgewicht offen"} · ${card.relation || "Verhältnis prüfen"}`;
}

function resonanceIndexPage() {
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav><p class="hero-kicker">Resonanz-Kompass</p><h1 class="hero-title">Welche Themen bekommen Aufmerksamkeit - und passt das zu ihrer wirklichen Bedeutung?</h1><p class="hero-subtitle">Der Resonanz-Kompass prüft nicht, ob über ein Thema gesprochen werden darf. Er zeigt, was die öffentliche Gewichtung bewirkt: Was wird laut? Was bleibt leise? Welche Ursache verschwindet?</p></div></section>${radarNav("../")}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Schnelltest</p><h2>Springen, umlenken oder vertiefen?</h2><p>Der Debatten-Kompass hilft, wenn ein Narrativ schon im Raum steht. Der Resonanz-Kompass hilft, bevor ein Narrativ den Raum übernimmt. Gemeinsam stärken sie demokratische Resilienz.</p></article></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Resonanzkarten</p><h2>Aufmerksamkeit gegen Wirkungsgewicht lesen.</h2></div>${cardGrid(cards, (card) => `<article class="card"><p class="card-kicker">${esc(card.cluster || "Öffentlicher Wirkungsraum")}</p><h3>${esc(card.title)}</h3><p>${esc(card.subtitle || "")}</p><p><span class="status-pill">${esc(relationLabel(card))}</span></p><p><a class="btn btn-secondary" href="${card.slug}/">Resonanz prüfen</a></p></article>`)}</div></section>
  ${sourceCards()}`;
  return shell({ title: "Resonanz-Kompass", description: "Aufmerksamkeit, Wirkungsgewicht und verdrängte Systemfragen im öffentlichen Wirkungsraum prüfen.", canonical: `${SITE_URL}/wirkungsradar/resonanz/`, base: "../../", main });
}

function resonanceDetailPage(card) {
  const relatedDebates = (card.related || "").split(";").map((item) => item.trim()).filter(Boolean).slice(0, 6);
  const trapLinks = (card.traps || "").split(",").map((item) => item.trim()).filter(Boolean);
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="../">Resonanz-Kompass</a></nav><p class="hero-kicker">Resonanzkarte</p><h1 class="hero-title">${esc(card.title)}</h1><p class="hero-subtitle">${esc(card.subtitle || "")}</p><p class="meta-line">${esc(relationLabel(card))} · Datenstand: ${DATA_STAND}</p></div></section>${radarNav("../../")}
  <section class="section" id="schnellorientierung"><div><article class="card important-card"><p class="card-kicker">Schnellorientierung</p><h2>Springen, umlenken oder vertiefen?</h2><p>${esc(card.orientation || "Erst prüfen, ob die Debatte eine Ursache klärt oder nur Aufmerksamkeit bindet.")}</p></article></div></section>
  <section class="section" id="aufmerksamkeit"><div><div class="section-header"><p class="hero-kicker">Worum geht die Debatte gerade?</p><h2>${esc(card.attentionBlock || card.title)}</h2><p><strong>Warum zieht das Thema?</strong> ${esc(card.frame || "Der Frame muss offengelegt werden, bevor die Antwort wirkt.")}</p></div></div></section>
  <section class="section section-soft" id="einordnung"><div><div class="section-header"><p class="hero-kicker">Sofort nutzbare Einordnung</p><h2>Wenn du gerade in der Debatte bist.</h2></div><div class="card-grid three"><article class="card"><p class="card-kicker">10 Sekunden</p><p>${esc(card.ten || "")}</p></article><article class="card"><p class="card-kicker">30 Sekunden</p><p>${esc(card.thirty || "")}</p></article><article class="card"><p class="card-kicker">2 Minuten</p><p>${esc(card.two || "")}</p></article></div></div></section>
  <section class="section" id="check"><div><div class="card-grid two"><article class="card"><p class="card-kicker">Aufmerksamkeits-Check</p><h2>Was wird verdrängt?</h2><p>${esc(card.displacement || "")}</p><p><strong>Aufmerksamkeitsgewicht:</strong> ${esc(card.attention || "offen")}<br><strong>Wirkungsgewicht:</strong> ${esc(card.impact || "offen")}<br><strong>Verhältnis:</strong> ${esc(card.relation || "prüfen")}</p></article><article class="card"><p class="card-kicker">Vom Aufreger zur Ursache</p><h2>${esc(card.betterQuestion || "Welche Systemfrage fehlt?")}</h2><p>${esc(card.causePath || "")}</p></article></div></div></section>
  <section class="section section-soft" id="folgencheck"><div><article class="card important-card"><p class="card-kicker">Folgencheck</p><h2>Was wird wahrscheinlicher, wenn diese Gewichtung dominiert?</h2><p>${esc(card.consequence || "")}</p></article></div></section>
  <section class="section" id="muster"><div><div class="section-header"><p class="hero-kicker">Denkfehler und Aufmerksamkeitsfallen</p><h2>Lautstärke ist nicht automatisch Wichtigkeit.</h2></div><div class="pill-row">${trapLinks.map((trap) => `<a class="pill-link" href="../../muster/#${esc(slugifyTrap(trap))}">${esc(trap)}</a>`).join("")}</div></div></section>
  <section class="section" id="verwandte-debatten"><div><div class="section-header"><p class="hero-kicker">Konkrete Debattenkarten dazu</p><h2>Vom Meta-Blick zurück zur Antwort.</h2></div>${cardGrid(relatedDebates, (item) => `<article class="card"><h3>${esc(item)}</h3><p>Diese Debattenkarte oder dieses Thema zeigt, wie der Resonanzframe in konkreten Aussagen auftaucht.</p><p><a class="text-link" href="../../live/">Debattenkarten öffnen</a></p></article>`)}</div></section>
  ${sourceCards()}`;
  return shell({ title: card.title, description: card.subtitle || "Resonanzkarte im öffentlichen Wirkungsraum.", canonical: `${SITE_URL}/wirkungsradar/resonanz/${card.slug}/`, base: "../../../", main });
}

function slugifyTrap(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function agendaPage() {
  const groups = [
    ["Unterbelichtet", agendaItems.filter((item) => /unterbelichtet/i.test(item.relation || ""))],
    ["Überhitzt", agendaItems.filter((item) => /überhitzt|ueberhitzt/i.test(item.relation || ""))],
    ["Verzerrt oder symptomfixiert", agendaItems.filter((item) => /verzerrt|symptomfixiert/i.test(item.relation || ""))],
    ["Systemhebel", agendaItems.filter((item) => /sehr hoch|hoch/i.test(item.impact || "")).slice(0, 10)],
  ];
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav><p class="hero-kicker">Agenda-Radar</p><h1 class="hero-title">Welche wichtigen Wirkungsfragen bekommen zu wenig Raum?</h1><p class="hero-subtitle">Öffentliche Aufmerksamkeit ist begrenzt. Wenn laute Themen alles überdecken, verschwinden oft die Fragen, die langfristig am meisten bewirken.</p></div></section>${radarNav("../")}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Kurzlogik</p><h2>Nicht jedes laute Thema ist wichtig. Nicht jedes wichtige Thema ist laut.</h2><p>Der Agenda-Radar hilft, öffentliche Debatten nicht nur nach Lautstärke zu lesen, sondern nach Wirkung. Er zeigt überhitzte Debatten, unterbelichtete Wirkungsfragen, echte Systemhebel und wiederkehrende Ablenkungsmuster.</p></article></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Sofortfilter</p><h2>Vier Blickrichtungen.</h2></div>${cardGrid(groups, ([title, items]) => `<article class="card"><p class="card-kicker">Radarfilter</p><h2>${esc(title)}</h2><p>${items.length} Themen</p><ul>${items.slice(0, 6).map((item) => `<li><a class="text-link" href="#${esc(item.slug)}">${esc(item.title)}</a></li>`).join("")}</ul></article>`)}</div></section>
  <section class="section" id="radar-kacheln"><div><div class="section-header"><p class="hero-kicker">Startbestand</p><h2>30 Wirkungsfragen im öffentlichen Raum.</h2><p>Status: redaktionell gewichtet. Kein automatisches Medienranking, keine Scheingenauigkeit.</p></div>${cardGrid(agendaItems, (item) => `<article class="card" id="${esc(item.slug)}"><p class="card-kicker">${esc(item.relation)} · Wirkungsgewicht: ${esc(item.impact)}</p><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p><p><strong>Bessere Systemfrage:</strong> ${esc(item.question)}</p></article>`)}</div></section>
  <section class="section section-soft"><div><article class="card important-card"><p class="card-kicker">Datenhinweis</p><h2>Orientierung, keine Scheingenauigkeit.</h2><p>Aufmerksamkeit kann über Medienpräsenz, Plattformtrends, Suchinteresse, politische Agenda und Wiederholung angenähert werden. Wirkungsgewicht wird über Mensch, Planet, Demokratie, Systemhebel, Dauer, Betroffenheit, Verdrängung und Risiko bewertet. Wo kein quantitativer Medienmonitor vorhanden ist, wird der Status sichtbar als redaktionelle Gewichtung markiert.</p></article></div></section>`;
  return shell({ title: "Agenda-Radar", description: "Öffentliche Aufmerksamkeit und Wirkungsgewicht im Debatten-Kompass vergleichen.", canonical: `${SITE_URL}/wirkungsradar/agenda-radar/`, base: "../../", main });
}

function causesIndexPage() {
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav><p class="hero-kicker">Ursachen-Navigator</p><h1 class="hero-title">Vom Aufreger zur Ursache.</h1><p class="hero-subtitle">Viele Debatten drehen sich um Symptome. Der Ursachen-Navigator fragt, was darunter liegt: falsche Preise, fehlende Rückkopplung, kaputte Infrastruktur, schlechte Daten, Wohnkosten, Vertrauensverlust oder Plattformlogik.</p></div></section>${radarNav("../")}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Arbeitsweise</p><h2>Vom Stöckchen zur Systemfrage.</h2><p>Der Ursachen-Navigator nimmt Aufreger ernst, bleibt aber nicht an der Oberfläche. Er unterscheidet Symptom, Ursache, falsche Abkürzung, Wirkpfad und wirksamen Hebel.</p></article></div></section>
  <section class="section section-soft"><div>${cardGrid(causePages, (cause) => `<article class="card"><p class="card-kicker">Systemursache</p><h2>${esc(cause.title)}</h2><p>${esc(cause.text)}</p><p><strong>Kernfrage:</strong> ${esc(cause.question)}</p><p><a class="btn btn-secondary" href="${cause.slug}/">Ursache öffnen</a></p></article>`)}</div></section>`;
  return shell({ title: "Ursachen-Navigator", description: "Wiederkehrende Aufregerthemen auf Systemursachen zurückführen.", canonical: `${SITE_URL}/wirkungsradar/ursachen-navigator/`, base: "../../", main });
}

function causeDetailPage(cause) {
  const related = cards.filter((card) => (card.causePath || card.displacement || "").toLowerCase().includes(cause.slug.split("-")[0])).slice(0, 6);
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="../">Ursachen</a></nav><p class="hero-kicker">Ursachen-Navigator</p><h1 class="hero-title">${esc(cause.title)}</h1><p class="hero-subtitle">${esc(cause.text)}</p></div></section>${radarNav("../../")}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Bessere Systemfrage</p><h2>${esc(cause.question)}</h2><p>Diese Ursache wird nicht durch eine einzelne Schlagzeile gelöst. Sie braucht Wirkpfad, Zustandsveränderung, Rückkopplung und überprüfbare Schutzlinien für Mensch, Planet und Demokratie.</p></article></div></section>
  <section class="section section-soft"><div><div class="card-grid two"><article class="card"><p class="card-kicker">Falsche Abkürzung</p><h2>Beim Symptom stehen bleiben.</h2><p>Die Debatte wirkt dann handfest, aber sie behandelt nur die Oberfläche. Die Ursache erzeugt ähnliche Konflikte immer wieder.</p></article><article class="card"><p class="card-kicker">Wirksamer Hebel</p><h2>Rückkopplung bauen.</h2><p>Wirksam wird die Debatte erst, wenn Preise, Regeln, Infrastruktur, Verantwortung oder Daten so verändert werden, dass bessere Entscheidungen wahrscheinlicher werden.</p></article></div></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Typische Stöckchen</p><h2>Debatten, die von dieser Ursache ablenken können.</h2></div>${cardGrid(related.length ? related : cards.slice(0, 4), (card) => `<article class="card"><h3>${esc(card.title)}</h3><p>${esc(card.subtitle || "")}</p><p><a class="text-link" href="../../resonanz/${card.slug}/">Resonanzkarte öffnen</a></p></article>`)}</div></section>`;
  return shell({ title: cause.title, description: cause.text, canonical: `${SITE_URL}/wirkungsradar/ursachen-navigator/${cause.slug}/`, base: "../../../", main });
}

function trapsPage() {
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav><p class="hero-kicker">Musterbibliothek</p><h1 class="hero-title">Nicht jedes Stöckchen verdient einen Sprung.</h1><p class="hero-subtitle">Aufmerksamkeitsfallen verengen Debatten: Ein Einzelfall ersetzt die Ursache. Kosten werden ohne Gegenkosten gezeigt. Eine Zahl wird zum Ohnmachtsbeweis.</p></div></section>${radarNav("../")}
  <section class="section"><div>${cardGrid(traps, (trap) => `<article class="card" id="${trap.slug}"><p class="card-kicker">Aufmerksamkeitsfalle</p><h2>${esc(trap.title)}</h2><p>${esc(trap.text)}</p><p><strong>Bessere Systemfrage:</strong> ${esc(trap.question)}</p></article>`)}</div></section>`;
  return shell({ title: "Musterbibliothek", description: "Denkfehler, Frames und Aufmerksamkeitsfallen im öffentlichen Wirkungsraum erkennen.", canonical: `${SITE_URL}/wirkungsradar/muster/`, base: "../../", main });
}

function methodPage() {
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="../">Resonanz-Kompass</a></nav><p class="hero-kicker">Methode</p><h1 class="hero-title">Wir prüfen nicht, ob ein Thema erlaubt ist. Wir prüfen, was seine Gewichtung bewirkt.</h1><p class="hero-subtitle">Der Resonanz-Kompass verbindet Aufmerksamkeitsanalyse, Wirkungsgewicht, Verdrängungscheck, Frameanalyse und Systemfrage. Er arbeitet mit Wirkungspotenzial, Wirkpfaden und Resonanzrisiken - nicht mit Personenurteilen.</p></div></section>${radarNav("../../")}
  <section class="section"><div><div class="card-grid two"><article class="card"><p class="card-kicker">Prüffrage</p><h2>Reden wir über das Richtige?</h2><p>Im richtigen Verhältnis und auf der richtigen Systemebene?</p></article><article class="card"><p class="card-kicker">Schutzgrenzen</p><h2>Keine Personenbewertung.</h2><p>Kein Social Credit. Keine Zensur. Keine automatische Entscheidung. Jede Bewertung bleibt begründet, quellengebunden und korrigierbar.</p></article></div></div></section>
  <section class="section section-soft"><div>${cardGrid([["Aufmerksamkeit", "Wie sichtbar, wiederholt, emotionalisiert und politisch anschlussfähig ist das Thema?"], ["Wirkungsgewicht", "Wie stark berührt das Thema Mensch, Planet und Demokratie?"], ["Verhältnis", "Passend, überhitzt, unterbelichtet, verzerrt oder stellvertretend."], ["Verdrängung", "Welche wichtigere Systemfrage verschwindet aus dem Blick?"]], ([title, text]) => `<article class="card"><h2>${esc(title)}</h2><p>${esc(text)}</p></article>`)}</div></section>`;
  return shell({ title: "Methode des Resonanz-Kompasses", description: "Aufmerksamkeit, Wirkungsgewicht, Verdrängung und Systemfrage methodisch prüfen.", canonical: `${SITE_URL}/wirkungsradar/resonanz/methode/`, base: "../../../", main });
}

function resiliencePage() {
  const principles = [
    ["Erst den Frame erkennen, dann antworten.", "Ein Satz liefert selten nur Information. Er legt oft schon fest, wer schuld ist, was als Problem gilt und welche Lösung naheliegt. Wer sofort antwortet, übernimmt häufig den Rahmen."],
    ["Lautstärke nicht mit Wichtigkeit verwechseln.", "Ein Thema kann groß wirken, weil es emotional zieht, oft wiederholt wird oder algorithmisch verstärkt wird. Das sagt noch nichts über sein Wirkungsgewicht."],
    ["Symptome ernst nehmen, aber Ursachen suchen.", "Menschen erleben echte Belastungen: Kosten, Angst, Überforderung, Kontrollverlust. Diese Erfahrungen sind nicht egal. Aber sie erklären noch nicht automatisch die Ursache."],
    ["Fakten mit Folgen verbinden.", "Fakten sind notwendig, aber sie reichen selten allein. Entscheidend ist, welche Entscheidung wahrscheinlicher wird und welche Wirkung sichtbar oder unsichtbar bleibt."],
    ["Nicht jedes Stöckchen zur Agenda machen.", "Ein Stöckchen funktioniert, wenn alle springen. Resiliente Öffentlichkeit kann einordnen, ohne zuzulassen, dass wichtigere Wirkungsfragen verdrängt werden."],
    ["Berechtigte Sorgen von manipulativen Schlussfolgerungen trennen.", "Viele Narrative nutzen echte Sorgen. Die Antwort darf die Sorge nicht abwerten, muss aber die falsche Schlussfolgerung sichtbar machen."],
    ["Wirkungsgewicht vor Empörungsgewicht stellen.", "Entscheidend ist nicht, was am stärksten empört, sondern was Zustände bei Mensch, Planet und Demokratie tatsächlich verändert oder verändern kann."],
    ["Quellen sichtbar machen.", "Vertrauen wächst nicht durch Autorität, sondern durch Prüfbarkeit. Jede starke Aussage braucht Quellen, Datenstand und klare Grenzen."],
    ["Unsicherheit offen benennen.", "Unsicherheit ist kein Fehler, sondern Teil seriöser Arbeit. Wer sie erklärt, stärkt Korrekturfähigkeit."],
    ["Korrekturfähigkeit schützen.", "Eine resiliente Öffentlichkeit kann nachbessern, ohne Gesichtsverlust. Sie aktualisiert Daten, korrigiert Irrtümer und erklärt, warum sich Einordnungen ändern."],
    ["Systemfragen stellen.", "Die beste Antwort auf ein Stöckchen ist oft nicht die Gegenbehauptung, sondern die bessere Frage: Welche Ursache liegt darunter? Was würde wirklich etwas verändern?"],
    ["Demokratie als Infrastruktur behandeln.", "Demokratie ist nicht nur Wahl. Sie braucht Medienqualität, Rechtsstaatlichkeit, Verfahrensvertrauen, Diskursfähigkeit, Bildung, Datenklarheit und faire Sichtbarkeit."],
  ];
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav><p class="hero-kicker">Resilienz-Prinzipien</p><h1 class="hero-title">Wie Öffentlichkeit widerstandsfähiger gegen Empörung, Ablenkung und Manipulation wird.</h1><p class="hero-subtitle">Eine Demokratie ist nicht resilient, weil sie keine Konflikte hat. Sie ist resilient, wenn sie trotz Konflikten noch prüfen, unterscheiden, korrigieren und lernen kann.</p></div></section>${radarNav("../")}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Kernlogik</p><h2>Antwortqualität plus Aufmerksamkeitsqualität.</h2><p>Der Debatten-Kompass verbessert Antwortqualität. Der Resonanz-Kompass verbessert Aufmerksamkeitsqualität. Gemeinsam stärken sie demokratische Resilienz im öffentlichen Wirkungsraum.</p></article></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Prinzipien</p><h2>Zwölf Regeln für prüffähige Öffentlichkeit.</h2></div>${cardGrid(principles, ([title, text]) => `<article class="card"><h3>${esc(title)}</h3><p>${esc(text)}</p><p><strong>Praxisfrage:</strong> Was müsste diese Debatte tun, damit Öffentlichkeit danach besser prüfen, unterscheiden oder korrigieren kann?</p></article>`)}</div></section>
  ${sourceCards()}`;
  return shell({ title: "Resilienz-Prinzipien", description: "Wie demokratische Öffentlichkeit prüffähig, lernfähig und handlungsfähig bleibt.", canonical: `${SITE_URL}/wirkungsradar/resilienz-prinzipien/`, base: "../../", main });
}

function publicImpactRoomPage() {
  const impactNav = `<nav class="radar-subnav" aria-label="Öffentlicher Wirkungsraum Navigation" data-search-exclude><a class="pill-link" href="../wirkungsradar/">Debatten-Kompass</a><a class="pill-link" href="../wirkungsradar/debattenkarten/">Debattenkarten</a><a class="pill-link" href="../wirkungsradar/resonanz-kompass/">Resonanz-Kompass</a><a class="pill-link" href="../wirkungsradar/agenda-radar/">Agenda-Radar</a><a class="pill-link" href="../wirkungsradar/ursachen-navigator/">Ursachen-Navigator</a><a class="pill-link" href="../wirkungsradar/resilienz-prinzipien/">Resilienz-Prinzipien</a><a class="pill-link" href="../wirkungsradar/methode/">Methode</a><a class="pill-link" href="../wirkungsradar/narrativ-einreichen/">Einreichen</a></nav>`;
  const entryCards = [
    ["Ich habe eine konkrete Aussage gehört.", "Debatten-Kompass", "Wenn ein Satz schon im Raum steht: Was wird behauptet? Welcher Frame steckt dahinter? Wie antworte ich, ohne in die Falle zu laufen?", "wirkungsradar/live/", "Debatten-Kompass öffnen"],
    ["Ich will Beispiele sehen.", "Debattenkarten", "Konkrete öffentliche Muster auf einen Blick: Aussage, Frame, Resonanzraum, Agenda-Effekt, Ursache und mögliche Antwort.", "wirkungsradar/debattenkarten/", "Debattenkarten öffnen"],
    ["Ein Thema dominiert gerade alles.", "Resonanz-Kompass", "Wenn alle über dasselbe reden: Passt die öffentliche Aufmerksamkeit zum tatsächlichen Wirkungsgewicht des Themas?", "wirkungsradar/resonanz-kompass/", "Resonanz prüfen"],
    ["Ich frage mich, was übersehen wird.", "Agenda-Radar", "Welche Wirkungsfragen sind wichtig, aber leise? Welche Probleme haben hohes Wirkungsgewicht, aber zu wenig öffentliche Aufmerksamkeit?", "wirkungsradar/agenda-radar/", "Agenda-Radar öffnen"],
    ["Ich will zur Ursache.", "Ursachen-Navigator", "Vom Aufreger zur Systemfrage: Welche Ursache liegt unter der Oberfläche? Welche Hebel würden wirklich etwas verändern?", "wirkungsradar/ursachen-navigator/", "Ursachen öffnen"],
    ["Ich will Debatten widerstandsfähiger machen.", "Resilienz-Prinzipien", "Wie bleibt Öffentlichkeit prüffähig, lernfähig und handlungsfähig, auch wenn Empörung, Angst und Manipulation zunehmen?", "wirkungsradar/resilienz-prinzipien/", "Prinzipien öffnen"],
  ];
  const readingLevels = [
    ["Faktenlage", "Was ist belegbar?", "Quellen, Datenstand, Unsicherheit und Grenzen werden sichtbar gemacht."],
    ["Framing", "Welche Deutung wird angeboten?", "Ein Satz legt oft schon fest, wer schuld ist, was als Problem gilt und welche Lösung naheliegt."],
    ["Resonanz", "Warum findet das Anschluss?", "Wirkungspotenzial entsteht über Erfahrungen, Zugehörigkeit, Angst, Vertrauen, Kränkung, Status und Wiederholung."],
    ["Agenda", "Was wird sichtbar - und was verschwindet?", "Aufmerksamkeit ist begrenzt. Jedes laute Thema kann wichtige Wirkungsfragen verdrängen."],
    ["Ursache", "Welche Systemfrage liegt darunter?", "Viele Aufreger sind Symptome. Der Ursachen-Navigator fragt nach dem Hebel darunter."],
    ["Resilienz", "Was macht Öffentlichkeit lernfähig?", "Demokratische Resilienz entsteht, wenn Öffentlichkeit prüfen, unterscheiden, korrigieren und handeln kann."],
  ];
  const main = `<section class="hero radar-page-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a></nav><p class="hero-kicker">Öffentlicher Wirkungsraum</p><h1 class="hero-title">Der öffentliche Raum wirkt. Entscheidend ist, wohin.</h1><p class="hero-subtitle">Öffentlichkeit ist kein neutraler Marktplatz, auf dem Fakten einfach gegeneinander antreten. Eine Aussage trifft auf Erfahrungen, Ängste, Loyalitäten, Kränkungen, Medienlogiken, Algorithmen und politische Interessen. Der Öffentliche Wirkungsraum macht sichtbar, welches Wirkungspotenzial Sprache, Resonanz und Aufmerksamkeit öffnen - und welche demokratische Orientierung daraus entstehen kann.</p><div class="hero-audio" aria-label="Audio: Öffentlicher Wirkungsraum"><label class="audio-label" for="oeffentlicher-wirkungsraum-audio">Anhören: Öffentlicher Wirkungsraum</label><audio id="oeffentlicher-wirkungsraum-audio" controls preload="metadata" aria-label="Anhören: Öffentlicher Wirkungsraum"><source src="../assets/audio/explanations/oeffentlicher-wirkungsraum.mp3" type="audio/mpeg">Dein Browser kann diese Audiodatei nicht direkt abspielen.</audio><p class="audio-transcript-note">Audio-Einführung verfügbar.</p></div></div></section>
  <figure class="woek-visual-figure"><img class="woek-visual" src="../assets/img/generated/oeffentlicher-wirkungsraum-hero.webp" alt="Wellen auf einer Wasseroberfläche als Bild für Aussage, Wirkungspotenzial, Resonanzraum, Öffentlichkeit, Mensch, Planet und Demokratie."><figcaption class="woek-visual-caption">Nicht der einzelne Stein verändert den öffentlichen Raum allein, sondern die Wellen: Aussage, Resonanz, Aufmerksamkeit, Ursache und demokratische Rückkopplung.</figcaption></figure>
  ${impactNav}
  <section class="section"><div><article class="card important-card"><p class="card-kicker">Leitidee</p><h2>Öffentlichkeit braucht mehr als richtige Antworten.</h2><p>Eine demokratische Öffentlichkeit muss Aussagen prüfen, Resonanz einordnen, Aufmerksamkeit gewichten und Ursachen sichtbar machen. Erst dann wird aus Debatte mehr als Reaktion. Erst dann entsteht Orientierung.</p><p>Der Öffentliche Wirkungsraum fragt deshalb nicht nur: Stimmt eine Aussage? Sondern auch: Warum bekommt sie Anschluss? Welche Aufmerksamkeit bindet sie? Welche Fragen verdrängt sie? Welche Wirkpfade öffnet sie? Und was braucht eine Öffentlichkeit, um prüffähig, lernfähig und handlungsfähig zu bleiben?</p></article></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Was brauchst du gerade?</p><h2>Der schnellste Einstieg.</h2></div>${cardGrid(entryCards, ([question, title, text, href, label]) => `<article class="card"><p class="card-kicker">${esc(question)}</p><h2>${esc(title)}</h2><p>${esc(text)}</p><p><a class="btn btn-secondary" href="../${href}">${esc(label)}</a></p></article>`)}</div></section>
  <section class="section"><div><div class="section-header"><p class="hero-kicker">Vom Satz zur Systemfrage</p><h2>Erst die Ebene erkennen, dann reagieren.</h2></div><div class="card-grid two"><article class="card"><p class="card-kicker">Szene</p><h3>Ein Satz fällt.</h3><p>In einer Talkshow sagt jemand: „Die da oben hören uns nicht mehr zu.“ Der Satz ist kurz. Aber er arbeitet weiter: in Überschriften, Kommentarspalten, Gruppen, Clips und Gesprächen. Manche fühlen sich verstanden, andere angegriffen. Oft fragt niemand mehr, welches konkrete Problem eigentlich gelöst werden müsste.</p></article><article class="card"><p class="card-kicker">Wirkungsanalyse</p><h3>Der Resonanzraum öffnet sich.</h3><p>Genau hier beginnt Wirkungsanalyse: nicht erst bei der Frage, ob jedes Wort formal richtig ist, sondern bei der Frage, welcher Resonanzraum entsteht: Vertrauen oder Misstrauen? Klärung oder Feindbild? Ursache oder Ablenkung? Handlungsfähigkeit oder Ohnmacht?</p></article></div></div></section>
  <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Methodische Leitplanken</p><h2>Was dieser Raum nicht ist.</h2></div><article class="card important-card"><p>Der Öffentliche Wirkungsraum ist kein Wahrheitsministerium, kein Zensurwerkzeug und keine Instanz, die Menschen bewertet. Er ersetzt keinen Faktencheck und keine politische Debatte. Er ergänzt sie.</p><p>Ein Faktencheck prüft, ob eine Aussage stimmt. Eine Wirkungsanalyse fragt, welche Resonanzräume, Wirkungspotenziale, Wirkpfade und Rückkopplungen eine Aussage öffnet. Sie unterstellt keine Absicht. Sie macht sichtbar, wie Sprache, Aufmerksamkeit und Wiederholung öffentliche Wirklichkeit mitformen können.</p></article></div></section>
  <section class="section"><div><div class="section-header"><p class="hero-kicker">Wie wir lesen</p><h2>Fakten, Frame, Resonanz, Agenda, Ursache.</h2></div>${cardGrid(readingLevels, ([kicker, title, text]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`)}</div></section>
  <section class="section section-soft"><div><article class="card important-card"><p class="card-kicker">Kurzform</p><h2>Antwortqualität, Aufmerksamkeitsqualität, Prioritätsqualität, Ursachenqualität.</h2><p>Debatten-Kompass = Antwortqualität. Resonanz-Kompass = Aufmerksamkeitsqualität. Agenda-Radar = Prioritätsqualität. Ursachen-Navigator = Ursachenqualität. Resilienz-Prinzipien = demokratische Schutzlogik. Gemeinsame Wirkung: eine Öffentlichkeit, die nicht jedem Stöckchen hinterherläuft, sondern bessere Wirkungsfragen stellt.</p></article></div></section>`;
  return shell({ title: "Öffentlicher Wirkungsraum", description: "Der Öffentliche Wirkungsraum der Wirkungsökonomie analysiert Debatten, Narrative, Resonanz und Aufmerksamkeit: Was wird behauptet, was bekommt Raum, was wird übersehen - und wie bleibt Demokratie resilient?", canonical: `${SITE_URL}/oeffentlicher-wirkungsraum/`, base: "../", main });
}

function enhanceRadarHome() {
  const file = path.join(ROOT, "wirkungsradar/index.html");
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("data-public-impact-room")) {
    const block = `<section class="section section-soft" data-public-impact-room>
      <div>
        <div class="section-header"><p class="hero-kicker">Öffentlicher Wirkungsraum</p><h2>Debatten beantworten und Aufmerksamkeit gewichten.</h2><p>Der Debatten-Kompass hilft bei konkreten Aussagen. Der Resonanz-Kompass zeigt, warum manche Themen den Raum besetzen und welche wichtigeren Wirkungsfragen verschwinden.</p></div>
        <div class="pill-row"><a class="pill-link" href="resonanz-kompass/">Resonanz-Kompass</a><a class="pill-link" href="agenda-radar/">Agenda-Radar</a><a class="pill-link" href="ursachen-navigator/">Ursachen-Navigator</a><a class="pill-link" href="muster/">Aufmerksamkeitsfallen</a><a class="pill-link" href="resilienz-prinzipien/">Resilienz-Prinzipien</a></div>
      </div>
    </section>`;
    html = html.replace(/(<\/section>)/, `$1${block}`);
  }
  fs.writeFileSync(file, html, "utf8");
}

function enhanceDebatePages() {
  const roots = ["wirkungsradar/live", "wirkungsradar/detail"];
  let count = 0;
  for (const root of roots) {
    const dir = path.join(ROOT, root);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(dir, entry.name, "index.html");
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, "utf8");
      if (html.includes("data-resonance-crosslink")) continue;
      const related = pickRelatedCards(entry.name);
      const base = root.endsWith("live") || root.endsWith("detail") ? "../../" : "../";
      const block = `<section class="section section-soft" id="resonanz-ebene" data-resonance-crosslink>
        <div>
          <div class="section-header"><p class="hero-kicker">Meta-Ebene</p><h2>Warum dieses Narrativ Raum bekommt.</h2><p>Diese Aussage ist nicht nur ein Satz. Sie kann Aufmerksamkeit binden, Ursachen verdecken oder eine bessere Systemfrage verdrängen.</p></div>
          <div class="card-grid two">${related.map((card) => `<article class="card"><p class="card-kicker">Resonanz-Kompass</p><h3>${esc(card.title)}</h3><p>${esc(card.subtitle || "")}</p><p><a class="text-link" href="${base}resonanz/${card.slug}/">Resonanzkarte öffnen</a></p></article>`).join("")}</div>
        </div>
      </section>`;
      html = html.replace(/(<section class="section[^"]*" id="quellen"|<section class="section[^"]*" id="warum-zieht-das"|<section class="section[^"]*" id="narrativ-einreichen")/, `${block}$1`);
      fs.writeFileSync(file, html, "utf8");
      count += 1;
    }
  }
  console.log(`Resonanz-Crosslinks ergänzt: ${count} Debattenseiten.`);
}

function pickRelatedCards(slug) {
  const s = slug.toLowerCase();
  const matches = cards.filter((card) => {
    const hay = `${card.title} ${card.related} ${card.cluster} ${card.attentionBlock}`.toLowerCase();
    return s.split("-").some((part) => part.length > 4 && hay.includes(part));
  });
  if (matches.length) return matches.slice(0, 2);
  if (/migration|auslaender|sozialtourismus|wohnungsnot/.test(s)) return cards.filter((card) => /migration/i.test(card.slug)).slice(0, 2);
  if (/klima|co2|wind|e-auto|batterie|wasserstoff|fusion|efuel|energie/.test(s)) return cards.filter((card) => /klima|e-auto|wundertechnik|windkraft/i.test(card.slug)).slice(0, 2);
  if (/medien|zensur|fakten|wissenschaft|sdg|gesteuert|altparteien/.test(s)) return cards.filter((card) => /medien|plattform|verbotsstaat/i.test(card.slug)).slice(0, 2);
  return cards.slice(0, 2);
}

write("wirkungsradar/resonanz/index.html", resonanceIndexPage());
write("wirkungsradar/resonanz-kompass/index.html", resonanceIndexPage().replaceAll("/wirkungsradar/resonanz/", "/wirkungsradar/resonanz-kompass/"));
for (const card of cards) write(`wirkungsradar/resonanz/${card.slug}/index.html`, resonanceDetailPage(card));
for (const card of cards) write(`wirkungsradar/resonanz-kompass/${card.slug}/index.html`, resonanceDetailPage(card).replaceAll("/wirkungsradar/resonanz/", "/wirkungsradar/resonanz-kompass/"));
write("wirkungsradar/agenda-radar/index.html", agendaPage());
write("wirkungsradar/ursachen/index.html", causesIndexPage());
write("wirkungsradar/ursachen-navigator/index.html", causesIndexPage().replaceAll("/wirkungsradar/ursachen/", "/wirkungsradar/ursachen-navigator/"));
for (const cause of causePages) write(`wirkungsradar/ursachen/${cause.slug}/index.html`, causeDetailPage(cause));
for (const cause of causePages) write(`wirkungsradar/ursachen-navigator/${cause.slug}/index.html`, causeDetailPage(cause).replaceAll("/wirkungsradar/ursachen/", "/wirkungsradar/ursachen-navigator/"));
write("wirkungsradar/muster/index.html", trapsPage());
write("wirkungsradar/resonanz/methode/index.html", methodPage());
write("wirkungsradar/resonanz-kompass/methode/index.html", methodPage().replaceAll("/wirkungsradar/resonanz/methode/", "/wirkungsradar/resonanz-kompass/methode/").replaceAll("/wirkungsradar/resonanz/", "/wirkungsradar/resonanz-kompass/"));
write("wirkungsradar/resilienz-prinzipien/index.html", resiliencePage());
write("oeffentlicher-wirkungsraum/index.html", publicImpactRoomPage());
write("assets/data/wirkungsradar-resonance-cards.json", `${JSON.stringify(cards, null, 2)}\n`);
write("assets/data/wirkungsradar-attention-traps.json", `${JSON.stringify(traps, null, 2)}\n`);
write("assets/data/wirkungsradar-agenda-items.json", `${JSON.stringify(agendaItems, null, 2)}\n`);
write("assets/data/wirkungsradar-causes.json", `${JSON.stringify(causePages, null, 2)}\n`);
enhanceRadarHome();
enhanceDebatePages();
console.log(`Resonanz-Kompass gebaut: ${cards.length} Resonanzkarten, ${agendaItems.length} Agenda-Themen, ${causePages.length} Ursachen, ${traps.length} Muster.`);
