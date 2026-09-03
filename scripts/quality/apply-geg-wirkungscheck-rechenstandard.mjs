import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = path.join(ROOT, "blog/geg-wirkungscheck-ioi-t-sroi.html");

function heading(id) {
  return `<h2 id="${id}"`;
}

function replaceSection(html, id, nextId, replacement) {
  const start = html.indexOf(heading(id));
  const end = html.indexOf(heading(nextId), start + 1);
  if (start < 0 || end < 0) {
    throw new Error(`Abschnitt ${id} oder seine Folgemarke ${nextId} fehlt.`);
  }
  return `${html.slice(0, start)}${replacement}${html.slice(end)}`;
}

const h = (id, text) => `<h2 id="${id}">${text} <a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>`;
const formula = (value) => `<div class="formula-box"><p><code>${value}</code></p></div>`;
const currentStandard = `<a class="text-link" href="../werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/">T-SROI-Rechenstandard v1.1</a>`;

const sections = [
  {
    id: "3-die-kennzahlenkaskade-roi-sroi-nwi-ioi-und-t-sroi",
    nextId: "4-mathematisches-modell-und-datenbasis",
    html: `${h("3-die-kennzahlenkaskade-roi-sroi-nwi-ioi-und-t-sroi", "3. Die Kennzahlenkaskade: ROI, SROI, NWI, IOI und T-SROI")}
<p>Die <a class="text-link" href="../wirkungsoekonomie.html">Wirkungsökonomie</a> trennt die Kennzahlen, statt sie zu vermischen. Wirkung ist zunächst eine tatsächliche Veränderung von Zuständen; sie kann positiv, negativ oder neutral sein. Positive Netto-Wirkung ist die Zielgröße, aber keine moralische Note und keine Personenbewertung.</p>
<p>Der <a class="text-link" href="../begriffe/nwi/">NWI</a> ist eine operative Profilkennzahl auf einer offengelegten Skala. Er ordnet geprüfte positive und negative Wirkungen gegenüber. Ein <a class="text-link" href="../begriffe/impact-of-investment/">IOI</a> ist dagegen eine Euro-zu-Euro-Kennzahl für direkt monetarisierten Nettonutzen. Der <a class="text-link" href="../werkzeuge/t-sroi/">T-SROI</a> ergänzt diese Geldrechnung nur um einen separat belegten transformativen Nutzenstrom. NWI-Punkte gehören deshalb weder in den IOI- noch in den T-SROI-Zähler.</p>
${formula("NWI = Summe gewichteter positiver Wirkungen − Summe gewichteter negativer Wirkungen; positive Ausweisung nur bei offenem Schutz-Gate")}
${formula("IOI = Σ(t=1…T)[(B_direkt,t × a_t × (1 − d_t) × (1 − v_t) − S_t) / (1 + r)^t] ÷ Σ(t=0…T)[(I_t + K_t) / (1 + r_K)^t]; nur bei offenem Schutz-Gate")}
${formula("T-SROI = Σ(t=1…T)[((B_direkt,t + B_transformativ,t) × a_t × (1 − d_t) × (1 − v_t) − S_t) / (1 + r)^t] ÷ Σ(t=0…T)[(I_t + K_t) / (1 + r_K)^t]; nur bei offenem Schutz-Gate")}
<p>Hierbei sind <code>B_direkt</code> und <code>B_transformativ</code> getrennte Nutzenströme in Euro derselben Preisbasis, <code>S</code> Schäden innerhalb derselben Bilanzgrenze, <code>I</code> Investition und <code>K</code> inkrementelle Kosten. <code>a</code>, <code>d</code> und <code>v</code> begrenzen den beanspruchten Nutzen durch Attribution, Counterfactual/Deadweight und Verdrängung. Schäden werden nicht pauschal mit diesem Nutzenfaktor verkleinert. Datenqualität ist eine Prüfbedingung, kein Multiplikator. Die vollständige Logik steht im ${currentStandard}.</p>`,
  },
  {
    id: "4-mathematisches-modell-und-datenbasis",
    nextId: "5-beispielrechnung-pro-jahr",
    html: `${h("4-mathematisches-modell-und-datenbasis", "4. Mathematisches Modell und Datenbasis")}
<p>Die folgenden Energiewerte bilden einen transparenten Modellvergleich, keine Gebäudeberatung und keine vollständige volkswirtschaftliche Bewertung. Der Strommix, Brennstoffpreise, Klimakostensätze, der Vergleichsfall und die Preisbasis müssen für jede neue Rechnung mit dem jeweils passenden Zeitstand belegt werden.</p>
${formula("E_Gas = Q_Waerme / eta_Gas")}
${formula("E_WP = Q_Waerme / JAZ")}
${formula("CO2_i,t [t] = E_i,t [kWh] × EF_i,t [kg CO2e/kWh] / 1.000")}
${formula("PV(X) = Summe_t X_t / (1 + r)^t")}
<p>Eine vermiedene Emission wird erst dann zu einem monetarisierten direkten Nutzen, wenn Emissionsdifferenz, Schadenskostensatz, Systemgrenze, Zeitbezug und Zurechnung dokumentiert sind. Für einen vollständigen IOI oder T-SROI fehlen in dieser Kurzrechnung insbesondere ein belegter Gegenfakt, ein vollständiger Schaden- und Kostenpfad sowie die konservative Untergrenze. Deshalb weist der Beitrag dafür keine Kennzahlenzahl aus.</p>`,
  },
  {
    id: "5-beispielrechnung-pro-jahr",
    nextId: "6-20-jahres-gegenrechnung-und-sensitivitaeten",
    html: `${h("5-beispielrechnung-pro-jahr", "5. Beispielrechnung pro Jahr")}
<p>Für das Modellhaus werden 20.000 kWh Nutzwärmebedarf pro Jahr angesetzt. Mit <code>eta_Gas = 0,90</code> ergibt sich ein Gasbedarf von rund 22.222 kWh; mit <code>JAZ = 3,2</code> benötigt die Wärmepumpe rund 6.250 kWh Strom. Die Rechnung zeigt die Annahmen offen, damit sie für ein konkretes Gebäude ersetzt werden können.</p>
<p>Bei den im Rechenanhang dokumentierten Preis- und Emissionsannahmen beträgt die Energiekostendifferenz rund 183 EUR pro Jahr und die Emissionsdifferenz rund 3,06 t CO2e pro Jahr. Multipliziert man die Emissionsdifferenz mit einem ausdrücklich benannten Klimakostensatz, entsteht ein möglicher monetärer Nutzenbaustein – kein NWI und noch kein IOI- oder T-SROI-Ergebnis. Dafür müssten Nutzen, Schäden, zusätzliche Kosten, Zurechnung und Unsicherheit vollständig abgegrenzt werden.</p>`,
  },
  {
    id: "6-20-jahres-gegenrechnung-und-sensitivitaeten",
    nextId: "7-finanzpolitische-interpretation-foerder-euro-investitions-euro-transformations-euro",
    html: `${h("6-20-jahres-gegenrechnung-und-sensitivitaeten", "6. 20-Jahres-Gegenrechnung und Sensitivitäten")}
<p>Für den im Beitrag beschriebenen Gaspfad mit Bio-Treppe werden die damaligen rechtlichen Annahmen und Emissionsfaktoren im Rechenanhang transparent notiert. Das ist nützlich als Hypothese über einen Vergleichspfad, genügt aber nicht für einen positiven IOI oder T-SROI.</p>
<p>Eine belastbare Langfristbetrachtung braucht für jeden Zeitraum den dokumentierten Vergleichsfall, reale Preisbasis, Investitions- und Betriebskosten, direkte Nutzen, Schäden, Attribution, Counterfactual, Verdrängung, Diskontsätze und eine Sensitivitätsanalyse. Die vorliegende Modellskizze quantifiziert diese Bestandteile nicht vollständig. Sie berichtet deshalb keinen numerischen NWI, IOI, Förder-IOI oder T-SROI.</p>
<p>Das Ergebnis ist nicht „nichts“. Es ist eine klare Prüffrage: Unter welchen überprüfbaren Annahmen bleibt der kausal zugerechnete Nettonutzen des jeweiligen Wärmewegs auch in der konservativen Untergrenze positiv? Erst dann kann das Schutz-Gate geöffnet werden.</p>`,
  },
  {
    id: "7-finanzpolitische-interpretation-foerder-euro-investitions-euro-transformations-euro",
    nextId: "8-t-sroi-deutung-wann-wird-aus-heizungstausch-systemtransformation",
    html: `${h("7-finanzpolitische-interpretation-foerder-euro-investitions-euro-transformations-euro", "7. Finanzpolitische Interpretation: Förder-Euro, Investitions-Euro, Transformations-Euro")}
<p>Eine Förderentscheidung, eine private Investition und eine gesamtgesellschaftliche Betrachtung haben unterschiedliche Systemgrenzen. Der gleiche Heizungstausch kann deshalb mehrere getrennte Rechenblätter erfordern. Das Gesetz selbst, die Förderung, private Mehrkosten und vermiedene gesellschaftliche Schäden dürfen nicht unbemerkt in einen gemeinsamen Nenner fallen.</p>
${formula("Förder-IOI = PV(kausal zugerechneter öffentlicher direkter Nettonutzen) / PV(klar abgegrenzte öffentliche Förderung und Folgekosten); nur bei offenem Schutz-Gate")}
<p>Für einen numerischen Förder-IOI fehlen hier belastbare Angaben zu Förderadditionalität, Mitnahmeeffekten, Verteilungswirkungen, öffentlichen Folgekosten und kausaler Zurechnung. Deshalb wird keine Zahl pro Förder-Euro behauptet. Die Formel zeigt nur, welche Daten eine spätere, prüfbare Rechnung bräuchte.</p>`,
  },
  {
    id: "8-t-sroi-deutung-wann-wird-aus-heizungstausch-systemtransformation",
    nextId: "9-schlussfolgerung-fuer-den-aufsatz-und-die-politische-debatte",
    html: `${h("8-t-sroi-deutung-wann-wird-aus-heizungstausch-systemtransformation", "8. T-SROI-Deutung: Wann wird aus Heizungstausch Systemtransformation?")}
<p>Eine einzelne Wärmepumpe kann direkte Energie-, Emissions- oder Kostenwirkungen haben. Ob ein Regelpfad zusätzlich Handwerk, Infrastruktur, Standards, Stromtarife, Quartierslösungen oder spätere Investitionen verändert, ist eine eigene Transformationshypothese.</p>
<p>Diese Hypothese kann fachlich sehr relevant sein. Sie wird im T-SROI aber nur dann monetarisiert, wenn ein separater Nutzenstrom mit Empfängerkreis, Wirkpfad, Zeitraum, Preisbasis, Gegenhypothese, Zurechnung und Unsicherheit belegt ist. Der vorliegende Beitrag dokumentiert einen solchen Strom nicht vollständig und weist deshalb keinen T-SROI-Wert für die Regelpfade aus.</p>
<p>Nicht monetarisierte Transformationsbefunde verschwinden nicht. Sie bleiben als Risikobild, Szenario oder Entscheidungskriterium sichtbar und dürfen nicht durch einen freien Multiplikator ersetzt werden.</p>`,
  },
  {
    id: "9-schlussfolgerung-fuer-den-aufsatz-und-die-politische-debatte",
    nextId: "rechenanhang",
    html: `${h("9-schlussfolgerung-fuer-den-aufsatz-und-die-politische-debatte", "9. Schlussfolgerung für den Aufsatz und die politische Debatte")}
<p>Die politische Debatte über Wärmepolitik braucht mehr als einen Vergleich von Anfangsinvestitionen oder Förderkosten. Sie braucht nachvollziehbare Vergleichsfälle, Energie- und Emissionspfade, Verteilung, Preisrisiken, Nebenwirkungen und Schutzrechte.</p>
<p>Der methodische Befund dieses Beitrags lautet: NWI, IOI und T-SROI sind getrennte Werkzeuge. Der NWI ordnet ein Wirkungsprofil ein. IOI und T-SROI rechnen nur gleichpreisige, kausal abgegrenzte Euroströme und nur bei offenem Schutz-Gate. Die hier dokumentierten Energiedaten reichen nicht aus, um einen der Geldquotienten für einen Regelpfad seriös zu beziffern.</p>
<p>Das ist kein Rückzug aus der Bewertung. Es ist die Voraussetzung dafür, dass spätere Bewertungen prüfbar bleiben: Wer eine Wirkung behauptet, legt Systemgrenze, Nutzen, Schäden, Kosten, Zurechnung, Unsicherheit und die Konsequenz einer roten Linie offen.</p>`,
  },
  {
    id: "rechenanhang",
    nextId: "grenzen-der-modellrechnung",
    html: `${h("rechenanhang", "Rechenanhang: Was die vorliegenden Daten erlauben")}
<p>A1. Jährliche Endenergie</p>
${formula("E_Gas = 20.000 / 0,90 = 22.222 kWh/Jahr")}
${formula("E_WP = 20.000 / 3,2 = 6.250 kWh/Jahr")}
<p>A2. Jährliche Energiekosten</p>
${formula("K_Gas = 22.222 × 0,1223 = rund 2.718 EUR/Jahr")}
${formula("K_WP = 6.250 × 0,4055 = rund 2.534 EUR/Jahr")}
${formula("Delta K = K_Gas − K_WP = rund 183 EUR/Jahr")}
<p>A3. Jährliche Emissionen</p>
${formula("CO2_Gas = 22.222 × 0,240 kg/kWh / 1.000 = rund 5,33 t/Jahr")}
${formula("CO2_WP = 6.250 × 0,363 kg/kWh / 1.000 = rund 2,27 t/Jahr")}
${formula("Delta CO2 = rund 3,06 t/Jahr")}
${formula("möglicher Klimanutzenbaustein = 3,06 t × 350 EUR_2025/t = rund 1.071 EUR_2025/Jahr")}
<p>Der letzte Betrag ist ein transparenter Nutzenbaustein unter einem bestimmten Schadenskostensatz. Er ist noch kein vollständiger direkter Nettonutzen, weil unter anderem Zurechnung, zusätzliche Schäden, Kosten und Unsicherheit fehlen.</p>
<p>A4. Barwert und Bio-Treppe</p>
${formula("PV(X) = Summe_t X_t / (1 + r)^t")}
${formula("Durchschnittlicher Biogasanteil 2029–2048 = (1 × 10 % + 5 × 15 % + 5 × 30 % + 9 × 60 %) / 20 = 38,75 %")}
${formula("Durchschnittlicher EF_GasBio = 61,25 % × 240 + 38,75 % × 140 = 201,25 g CO2e/kWh")}
<p>Diese Angaben beschreiben einen Modellpfad. Sie ergeben ohne vollständige Nutzen-, Schaden-, Kosten-, Zurechnungs- und Sensitivitätsrechnung keinen IOI- oder T-SROI-Wert.</p>`,
  },
];

let html = fs.readFileSync(file, "utf8");
for (const section of sections) html = replaceSection(html, section.id, section.nextId, section.html);

// Quellen, Preisbasis und Quellenstand stehen außerhalb der ausgetauschten
// Abschnitte. Die Aktualisierung ist absichtlich eng: Sie macht aus dem
// Klimakostensatz keine Dauerzahl und markiert historische Grundlagenquellen
// nicht als aktuelle T-SROI-Norm.
html = html
  .replaceAll("3,06 t × 300 EUR/t = rund 919 EUR/Jahr", "3,06 t × 350 EUR_2025/t = rund 1.071 EUR_2025/Jahr")
  .replaceAll(
    "Enthält Klimakostensätze 300 EUR/t CO2 bei 1 Prozent Zeitpräferenz und 880 EUR/t bei 0 Prozent Zeitpräferenz. URL: <a class=\"text-link\" href=\"https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.umweltbundesamt.de/themen/gesellschaftliche-kosten-von-umweltbelastungen</a>",
    "Enthält die zeit- und preisstandsabhängigen Klimakostensätze; für im Jahr 2026 emittierte Treibhausgase nennt die Seite 350 EUR_2025/t bei 1 Prozent und 1.000 EUR_2025/t bei 0 Prozent Zeitpräferenz. URL: <a class=\"text-link\" href=\"https://www.umweltbundesamt.de/daten/umweltzustand-trends/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.umweltbundesamt.de/daten/umweltzustand-trends/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen</a>"
  )
  .replaceAll(
    "Weber, Natalie: Grundlagenpapier Wirkungsökonomie WÖk, 2025; Whitepaper T-SROI - Der neue Standard für Impact-Controlling in der Wirkungsökonomie, 2025.",
    "Weber, Natalie: Grundlagenpapier Wirkungsökonomie WÖk, 2025; Whitepaper T-SROI - Der neue Standard für Impact-Controlling in der Wirkungsökonomie, 2025 (historische Referenz; für Berechnungen gilt der T-SROI-Rechenstandard v1.1)."
  )
  .replaceAll(
    "Stand: 12. Juni 2026. Die Zahlen sind transparente Modellannahmen",
    "Methodisch überprüft am 2. August 2026. Die Zahlen sind transparente Modellannahmen"
  );

const obsolete = [
  "IOI_netto = NWI / I",
  "IOI_foerder = NWI_gesellschaft / I_oeffentlich",
  "T-SROI_IOI =",
  "T_struktur",
  "H_sys",
  "F_zeit",
  "F_resilienz",
  "Q_daten",
  "Foerder-IOI_Szenario_C_300",
  "Foerder-IOI_Szenario_C_880",
  "NWI von rund 12.000 EUR",
  "3,06 t × 300 EUR/t",
];
for (const pattern of obsolete) {
  if (html.includes(pattern)) throw new Error(`Veraltete Rechenlogik bleibt im GEG-Beitrag sichtbar: ${pattern}`);
}
for (const required of ["NWI = Summe gewichteter positiver Wirkungen", "IOI = Σ(t=1…T)[(B_direkt,t", "T-SROI = Σ(t=1…T)[((B_direkt,t", "Σ(t=0…T)[(I_t + K_t)", "keinen numerischen NWI, IOI, Förder-IOI oder T-SROI", "3,06 t × 350 EUR_2025/t = rund 1.071 EUR_2025/Jahr"]) {
  if (!html.includes(required)) throw new Error(`Aktuelle Rechenlogik fehlt im GEG-Beitrag: ${required}`);
}

fs.writeFileSync(file, html, "utf8");
console.log("GEG-Wirkungscheck auf die T-SROI-Rechenlogik v1.1 aktualisiert.");
