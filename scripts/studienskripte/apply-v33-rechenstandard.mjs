#!/usr/bin/env node
/**
 * Hält die öffentliche Lernfassung V33 bei der aktuellen, dimensionsgleichen
 * T-SROI-Rechenlogik. Die Datei enthält ältere eingelesene Lesetexte; diese
 * Korrektur ersetzt ausschließlich deren Rechen- und Produktionsreste, nicht
 * historische PDF-Quellen.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MASTER = path.join(ROOT, "content/studienskripte/woek-g-v33.md");
const INDEX = path.join(ROOT, "content/studienskripte/index.json");

function replaceSection(text, startMarker, endMarker, replacement) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Abschnitt nicht gefunden: ${startMarker} → ${endMarker}`);
  }
  let tail = text.slice(end);
  // Einige Ersatztexte enthalten die folgende Überschrift bereits als klare
  // Abschnittsgrenze. Dann muss sie im Rest genau einmal entfernt werden.
  // Das macht den Normalisierer idempotent und verhindert Überschriften wie
  // "### 7.5 Fallfenster### 7.5 Fallfenster" nach mehreren Builds.
  if (replacement.trimEnd().endsWith(endMarker)) {
    const escapedMarker = endMarker.replace(/[.*+?^\x24{}()|[\]\\]/g, "\\$&");
    const repeatedBoundary = new RegExp("^(?:\\r?\\n)*" + escapedMarker);
    let removedBoundary = false;
    while (repeatedBoundary.test(tail)) {
      tail = tail.replace(repeatedBoundary, "");
      removedBoundary = true;
    }
    // Der Ersatztext liefert seinen eigenen Zeilenumbruch nach der Überschrift.
    // Ohne diesen Ausgleich würde jeder Build eine Leerzeile hinzufügen.
   if (removedBoundary && replacement.endsWith("\n")) {
      tail = /^(?:\r?\n)+/.test(tail) ? tail.replace(/^(?:\r?\n)+/, "\n") : `\n${tail}`;
   }
  }
  return `${text.slice(0, start)}${replacement}${tail}`;
}

const modelFormula = String.raw`### 7.4 Modellformel

NWI, IOI und T-SROI sind drei Werkzeuge mit drei verschiedenen Einheiten. Sie werden nicht ineinander umgerechnet.

$$
NWI = \sum_{i=1}^{n} w_i^{+}\Delta Z_i^{+} - \sum_{j=1}^{m} w_j^{-}\Delta Z_j^{-}
$$

Der NWI ist ein Profil auf einer offengelegten Skala. Die Summen gelten nur innerhalb der dokumentierten Systemgrenze, des Zeitraums und der Bewertungslogik; eine positive Ausweisung ist nur bei offenem Schutz-Gate \(G=1\) zulässig. Ein NWI-Punkt ist kein Euro.

$$
IOI = \frac{\sum_{t=1}^{T}\frac{B_{direkt,t}\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

$$
T\text{-}SROI = \frac{\sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

Dabei ist \(T\) eine ganze Zahl von Jahren mit \(T \geq 1\). \(B_{direkt,t}\) und \(B_{transformativ,t}\) sind getrennte Nutzenströme in Euro derselben Preisbasis, \(S_t\) sind Schäden innerhalb derselben Bilanzgrenze, \(I_t\) Investitionen und \(K_t\) inkrementelle Kosten. \(I_0\) liegt bei \(t=0\) und wird nicht abgezinst. \(a_t\), \(d_t\) und \(v_t\) begrenzen nur den beanspruchten Nutzen durch Attribution, Counterfactual/Deadweight und Verdrängung. Ein bereits angesetzter Schaden wird nicht automatisch mit diesen Faktoren verkleinert.

$$
PV_N^L = \sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)(1-u_t)-S_t}{(1+r)^t}
$$

\(PV_N^L\) ist die konservative Szenario-Untergrenze. \(u_t\) kürzt nur den beanspruchten Nutzen, nie den Schaden \(S_t\). Sie ist keine statistische Konfidenzgrenze, sondern eine offen gelegte Vorsichtsannahme.

Eine vereinfachte Ein-Satz-Demo darf nur ausdrücklich \(r=r_K\) setzen. Dann ist sie eine Rechenannahme, nicht die Behauptung, dass beide Sätze immer gleich sein müssen.

Die Geldquotienten dürfen nur bei offenem Schutz-Gate ausgewiesen werden: keine rote Linie, kein negatives Kernprofil nach Reverse Merit Order, dokumentierte Systemgrenze und Zurechnung, ausreichende Evidenz, positive Ressourcenbasis und \(PV_N^L > 0\). Andernfalls lautet das Ergebnis „blockiert / nicht bewertbar“.

### 7.5 Fallfenster

`;

const analysisModel = `### 7.3 Analysemodell

| Werkzeug | Kernfrage | Einheit | Schutz vor Fehlgebrauch |
| --- | --- | --- | --- |
| Scorecard und NWI | Wie sieht das begründete Wirkungsprofil mit positiven, negativen und offenen Befunden aus? | offengelegte Punkte, Stufen oder Profilfarben | keine Personeneinstufung, keine Euro-Umrechnung und keine Kompensation roter Linien |
| IOI | Wie viel direkt monetarisierter, kausal begrenzter Nettonutzen entsteht je Ressourceneuro? | EUR/EUR | gleiche Preis-, Zeit- und Systembasis; Schäden separat; Schutz-Gate offen |
| T-SROI | Wie verändert sich diese Geldrechnung, wenn zusätzlich ein eigener Transformationsnutzenstrom belegt ist? | Verhältnis bzw. EUR/EUR | kein Multiplikator für Reichweite, Resilienz, Diffusion oder Datenqualität |
| Entscheidung | Welche Handlung folgt unter Recht, Schutzregeln und Unsicherheit? | begründete Entscheidung, keine Kennzahl-Einheit | Kennzahl nicht als automatische Freigabe, Förderung oder Personenbewertung verwenden |

Die Reihenfolge ist absichtlich: Profil und Schutz-Gate kommen vor der Geldquote. Der IOI misst einen direkten Eurostrom. Der T-SROI ergänzt ihn ausschließlich um einen eigenständig dokumentierten, monetarisierten Transformationsnutzen. Ein guter NWI macht daher keinen IOI größer; gute Datenqualität macht keinen T-SROI größer. Beides entscheidet vielmehr, ob eine Quote verantwortbar ausgewiesen werden darf.

### 7.4 Modellformel
`;

const currentStandardBlock = String.raw`Formelkasten 34-1: Aktueller Rechenstandard für NWI, IOI und T-SROI

Der NWI ordnet ein Wirkungsprofil. Er verwendet eine dokumentierte Skala und ist keine Geldrechnung.

Der IOI rechnet einen direkt monetarisierten, kausal begrenzten Nettonutzen in Euro pro Ressourceneuro:

$$
IOI = \frac{\sum_{t=1}^{T}\frac{B_{direkt,t}\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

Der T-SROI ergänzt ihn nur um einen gesondert belegten transformativen Nutzenstrom:

$$
T\text{-}SROI = \frac{\sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

Das kleine „T“ ist kein Lautstärkeregler. \(B_{transformativ,t}\) braucht einen eigenen Wirkpfad, Empfängerkreis, Zeitraum, Preisbasis, Gegenhypothese, Zurechnungsanteil und eine Unsicherheitsanalyse. \(T\) ist eine ganze Zahl von Jahren mit \(T \geq 1\); \(I_0\) steht bei \(t=0\) und wird nicht abgezinst. Reichweite, Resilienz, Diffusion und Datenqualität bleiben wichtige Befunde; sie sind aber keine freien Rechenfaktoren. Datenqualität kann eine Ausweisung blockieren, aber sie erhöht keinen Geldwert. \(r\) für den Nutzenstrom und \(r_K\) für Ressourcen werden getrennt begründet; nur eine klar markierte Demo darf \(r=r_K\) setzen.

$$
PV_N^L = \sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)(1-u_t)-S_t}{(1+r)^t}
$$

Schäden \(S_t\) werden innerhalb derselben Systemgrenze separat abgezogen. \(u_t\) ist ein offengelegter konservativer Szenarioabschlag auf den beanspruchten Nutzen und kein Abschlag auf Schäden. Vor jeder positiven Quote stehen Schutz-Gate, Reverse Merit Order, positive Ressourcenbasis und \(PV_N^L > 0\).

### 34.3 Transformation statt bloßer Projekt-Nutzen
`;

const currentReferenceBlock = String.raw`### 7.7 Einordnung der Kennzahlen

NWI, IOI und T-SROI sind keine Stufen derselben Zahl. Sie sind drei verschiedene Antworten auf drei verschiedene Fragen.

Der **NWI** ordnet ein Wirkungsprofil auf einer offengelegten Skala. Er zeigt positive, negative und offene Befunde zusammen mit Datenqualität, Grenzen und Schutzregeln. Er ist kein Geldwert und kein Personenurteil.

Der **IOI** ist eine engere Geldrechnung. Er fragt: Wie viel direkt monetarisierter und kausal begrenzter Nettonutzen entsteht je Ressourceneuro? Dafür müssen Nutzen, Schäden, Investition und inkrementelle Kosten in Euro derselben Preis-, Zeit- und Systembasis dokumentiert sein.

Der **T-SROI** baut nicht aus NWI-Punkten oder einer allgemeinen Vorstellung von Transformation eine zweite Quote. Er verwendet dieselbe Geldlogik wie der IOI und ergänzt sie nur um einen zusätzlich belegten Transformationsnutzenstrom. Dieser Strom kann beispielsweise aus einer nachweislich übernommenen Praxis, einer belegten dauerhaften Standardänderung oder einer messbaren Folgewirkung entstehen. Er braucht aber einen eigenen Wirkpfad, Empfängerkreis, Vergleichsfall, Zeitraum, Preisbasis und Zurechnungsanteil. Ohne diesen Nachweis bleibt der Befund eine Transformationshypothese oder ein Wirkungsrisiko – nicht ein Aufschlag.

Die drei Fragen lassen sich so merken:

| Werkzeug | Frage | Zulässige Aussage | Unzulässige Verkürzung |
| --- | --- | --- | --- |
| NWI | Wie ist das Wirkungsprofil einzuordnen? | „Das Profil zeigt Nutzen, Schäden und offene Datenpunkte auf einer erklärten Skala.“ | „Ein Punkt ist ein Euro“ oder „Menschen erhalten einen Gesamtscore“. |
| IOI | Wie viel direkter Nettonutzen in Euro entsteht je Ressourceneuro? | „Unter diesen Annahmen beträgt der diskontierte direkte Nettonutzen X EUR/EUR.“ | „Jede positive Scorecard ergibt automatisch eine Geldquote.“ |
| T-SROI | Was ändert sich, wenn ein eigener zusätzlicher Transformationsnutzen in Euro belegt ist? | „Der belegte Zusatzstrom erhöht die Geldrechnung von IOI X auf T-SROI Y.“ | „Reichweite, Hoffnung oder Datenqualität werden als Faktor multipliziert.“ |

Eine rote Linie oder ein negatives Kernprofil nach Reverse Merit Order wird nicht durch einen hohen Eurobetrag geheilt. Vor jeder positiven Quote stehen deshalb die gleiche Systemgrenze, ein nachvollziehbarer Vergleichsfall, Zurechnung, ausreichende Evidenz und eine konservative Untergrenze. Fehlt etwas Wesentliches, lautet die sachliche Ausgabe: „blockiert / nicht bewertbar“.

### 34.1 Abgrenzung zu ROI, SROI, NWI, IOI und T-SROI

Der klassische **ROI** fragt nach finanziellem Rückfluss im Verhältnis zum eingesetzten Kapital. Das kann für eine Wirtschaftlichkeitsentscheidung wichtig sein, beschreibt aber keine umfassende Wirkung auf Mensch, Planet oder Demokratie.

Der klassische **SROI** macht gesellschaftliche, soziale oder ökologische Folgen in Geld sichtbar. Seine Qualität hängt – wie bei jeder Monetarisierung – von Systemgrenze, Preisbasis, Vergleichsfall, Doppelzählungen und der Behandlung von Schäden ab.

Der **NWI** bleibt davon getrennt: Er ist ein begründetes Wirkungsprofil, keine Währung. **IOI** und **T-SROI** sind dagegen Eurorechnungen. Der IOI enthält direkt monetarisierten, kausal begrenzten Nutzen. Der T-SROI enthält denselben direkten Nutzen und nur zusätzlich einen eigenständig belegten Transformationsnutzen. Schäden \(S\) werden innerhalb derselben Systemgrenze separat abgezogen. Beide Quoten bleiben geschlossen, wenn das Schutz-Gate nicht offen ist.

### 34.2 Die Arbeitslogik von NWI, IOI und T-SROI

Die Arbeitslogik lässt sich wie drei Schubladen erklären. In die erste kommt das Profil: Was ist positiv, negativ oder offen? In die zweite kommt der direkte, gut abgegrenzte Geldstrom. In die dritte kommt nur das, was über den direkten Strom hinaus tatsächlich als transformativ belegt und monetarisiert ist. Eine Beobachtung darf nur in die Schublade, in die ihre Einheit und ihr Nachweis passen.

Ein Beispiel: Eine Sanierung senkt nachweisbar Energiekosten. Das kann ein direkter Nutzen im IOI sein. Übernimmt eine Vergleichsgruppe später nachweisbar dieselbe technische Lösung und entstehen dadurch zusätzliche, getrennt abgegrenzte monetäre Nutzen, kann dieser zweite Strom zum T-SROI gehören. Die Zahl der Presseberichte, die Reichweite einer Kampagne oder eine gute Datenqualität sind dabei keine Geldströme. Sie können Evidenz, Resonanz oder eine Ausweisungsvoraussetzung sein, aber sie werden nicht als Rechenfaktor eingesetzt.

Formelkasten 34-1: Aktueller Rechenstandard für NWI, IOI und T-SROI
`;

const transformationClarification = String.raw`### 34.3 Transformation statt bloßer Projekt-Nutzen

Transformation beschreibt eine Veränderung von Regeln, Routinen, Infrastrukturen, Standards oder Entscheidungspfaden. Sie ist zunächst ein Wirkpfad-Befund, keine automatische Rechengröße. Ein Projekt kann nützlich sein, ohne transformativ zu wirken. Umgekehrt kann ein transformativ wirkender Ansatz noch zu unsicher sein, um einen Geldbetrag auszuweisen.

Für den T-SROI zählt deshalb nicht die Größe einer Erzählung, sondern der Nachweis eines zusätzlichen Nutzenstroms. Eine nachweislich dauerhaft übernommene Praxis kann zum Beispiel spätere Kosten oder Schäden vermeiden. Dann müssen Empfängerkreis, Gegenhypothese, Zeitraum, Preisbasis, Zurechnung und mögliche Doppelzählungen dokumentiert werden. Erst aus diesen Angaben kann ein monetarisierter \(B_{transformativ}\) entstehen.

Begriffe wie Diffusion, Resilienz, Standardsetzung oder Rückkopplung bleiben wichtig. Sie helfen, den Wirkpfad zu verstehen und offene Fragen sichtbar zu machen. Sie sind aber keine frei wählbaren Aufschläge und keine Ersatzformel für fehlende Daten. Fehlt der eigene Nachweis, wird der Befund als Hypothese, Risiko oder Lernauftrag geführt; die T-SROI-Rechnung fällt dann auf die direkte IOI-Rechnung zurück.

So schützt die Methode vor zwei gegensätzlichen Fehlern: Sie macht mögliche strukturelle Veränderungen nicht unsichtbar, aber sie vergoldet sie auch nicht mit einer freien Kennzahl.

### 34.4 Systemische Hebelwirkung, Diffusion und Standardsetzung
`;

const circularEconomyCase = String.raw`Fallbeispiel: Kreislaufwirtschaft ohne Punkt-Euro-Mischung

Ein Produktionsunternehmen prüft modellhaft eine Investition von 30 Mio. EUR. Die Scorecard und die rote-Linien-Prüfung seien für dieses Lernbeispiel offen; das ist eine Annahme, kein Urteil über ein reales Unternehmen. Für die Geldrechnung werden alle Werte in EUR derselben Preisbasis dokumentiert. Der Zurechnungsfaktor beträgt \(a \cdot (1-d) \cdot (1-v) = 0{,}8 \cdot 0{,}9 \cdot 0{,}95 = 0{,}684\). Die Demo setzt ausdrücklich \(r=r_K=5\) Prozent; im vollständigen Standard werden Nutzen- und Ressourcensatz getrennt begründet.

| Jahr | Direkter Nutzen \(B_{direkt}\) | Separat belegter Transformationsnutzen \(B_{transformativ}\) | Schaden \(S\) | Barwert direkter Nettonutzen | Barwert T-SROI-Nettonutzen |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 14,0 Mio. EUR | 2,0 Mio. EUR | 1,5 Mio. EUR | 7,691 Mio. EUR | 8,994 Mio. EUR |
| 2 | 16,0 Mio. EUR | 3,0 Mio. EUR | 1,5 Mio. EUR | 8,566 Mio. EUR | 10,427 Mio. EUR |

Für Jahr 1 lautet der T-SROI-Zähler vor Diskontierung: \((14{,}0 + 2{,}0) \text{ Mio.} \cdot 0{,}684 - 1{,}5 \text{ Mio.} = 9{,}444 \text{ Mio. EUR}\). Sein Barwert beträgt \(9{,}444 / 1{,}05 = 8{,}994\) Mio. EUR. Die entsprechende direkte IOI-Zeile lautet \(14{,}0 \text{ Mio.} \cdot 0{,}684 - 1{,}5 \text{ Mio.}\), also 7,691 Mio. EUR im Barwert.

Über zwei Jahre ergeben sich im Beispiel ein direkter Barwert-Nettonutzen von 16,257 Mio. EUR und ein T-SROI-Barwert-Nettonutzen von 19,421 Mio. EUR. Daraus folgen bei 30 Mio. EUR Ressourcen:

$$
IOI = 16{,}257 / 30 = 0{,}54\ \text{EUR/EUR}
$$

$$
T\text{-}SROI = 19{,}421 / 30 = 0{,}65 : 1
$$

Das Beispiel zeigt keine „hohe“ oder „niedrige“ Wirkung als Etikett. Es zeigt nur den Rechenweg unter den genannten Annahmen. Ein NWI-Profil wird daneben erläutert, aber nicht mit den Eurobeträgen multipliziert. Fehlt der eigenständige Nachweis für die 2,0 bzw. 3,0 Mio. EUR Transformationsnutzen, darf dieser Strom nicht in den T-SROI-Zähler; dann bleibt er als Transformationshypothese sichtbar.

Seite 13`;

const currentLearningBlock = String.raw`### 7.8 Vertiefung: Rechnen ohne Mischgrößen

Frühere Lehrtexte enthielten eine multiplikative Darstellung des T-SROI. Sie bleibt nicht als Rechenregel in dieser Lernfassung stehen, denn eine Formel muss nicht nur eindrucksvoll aussehen, sondern auch mit ihren Einheiten funktionieren. Punkte, Prozentwerte, Euro und Vermutungen über spätere Verbreitung sind verschiedene Messgrößen. Sie können nebeneinander erklärt werden, aber nicht ohne Übersetzung einfach miteinander multipliziert werden.

Der aktuelle Ausgangspunkt ist deshalb schlicht: Erst beschreiben wir den Wirkpfad. Dann prüfen wir das Profil. Dann rechnen wir – wenn alle nötigen Euroströme, Annahmen und Schutzbedingungen vorliegen. Das ist weniger spektakulär als eine große Gesamtzahl, aber genau dadurch überprüfbar.

#### 7.8.1 Drei Fragen, drei Werkzeuge

Stell dir drei Kästen auf einem Tisch vor. Auf dem ersten steht „Profil“, auf dem zweiten „direkter Geldstrom“ und auf dem dritten „zusätzlich belegter Transformationsnutzen“. Jeder Kasten beantwortet eine andere Frage.

| Werkzeug | Frage | Einheit | Was es nicht leistet |
| --- | --- | --- | --- |
| Scorecard und NWI | Welche positiven und negativen Wirkungen liegen im dokumentierten Wirkungsprofil vor? | Punkte, Stufen oder Profilfarben auf einer offen gelegten Skala | keine Eurorechnung und keine Bewertung von Personen |
| IOI | Wie viel direkt monetarisierter, kausal begrenzter Nettonutzen entsteht je Ressourceneuro? | EUR/EUR | keine Umrechnung von Scorepunkten in Geld |
| T-SROI | Wie verändert sich diese Eurorechnung, wenn zusätzlich ein eigener transformativer Nutzenstrom belegt ist? | Verhältnis bzw. EUR/EUR | kein Aufschlag für Hoffnung, Reichweite oder Datenqualität |

Der NWI ist damit kein kleiner IOI. Und der T-SROI ist kein besonders lauter NWI. Ein NWI kann ein gut begründetes Profil zeigen, obwohl eine Monetarisierung noch nicht möglich oder nicht sinnvoll ist. Ein IOI kann einen direkten Geldstrom ausweisen, obwohl kein gesonderter Nachweis für systemische Veränderung vorliegt. Ein T-SROI wird erst dann sinnvoll, wenn dieser zusätzliche Nutzenstrom wirklich dokumentiert werden kann.

Ein einfaches Bild hilft: Eine Landkarte zeigt Wege, Höhen und Grenzen. Sie ist das Profil. Ein Kassenbuch zeigt Euro. Es ist die Geldrechnung. Wer beides in dieselbe Spalte schreibt, bekommt weder eine gute Landkarte noch ein gutes Kassenbuch.

#### 7.8.2 Die Reihenfolge ist Teil der Methode

Die Formel kommt nicht zuerst. Vor ihr stehen sieben Arbeitsschritte.

1. **Entscheidung und Vergleichsfall benennen.** Was genau wird entschieden? Was wäre ohne die Maßnahme wahrscheinlich geschehen? Ein Vergleich zwischen zwei Wärmesystemen, zwei Produktionsweisen oder zwei Förderregeln braucht dieselbe Systemgrenze auf beiden Seiten.
2. **Wirkpfad beschreiben.** Wer oder was verändert sich, wodurch, wann und mit welchen möglichen Nebenwirkungen? Ein plausibler Satz reicht nicht; es braucht Daten oder eine klar markierte Annahme.
3. **Scorecard und rote Linien prüfen.** Ein Profil kann beispielsweise Mensch, Planet und Demokratie getrennt betrachten. Eine schwere Verletzung in einem Kernfeld wird nicht durch gute Werte in anderen Feldern neutralisiert.
4. **Geldströme abgrenzen.** Direkter Nutzen, Schäden, Investition und inkrementelle Kosten brauchen dieselbe Währung, Preisbasis, Zeitbasis und Systemgrenze.
5. **Zurechnung begrenzen.** Attribution, Counterfactual/Deadweight und Verdrängung reduzieren nur den Nutzen, den die Maßnahme beanspruchen kann. Sie sind keine Dekoration und keine Strafpunkte.
6. **Diskontieren und sensibilisieren.** Ein Nutzen im zweiten Jahr und ein Nutzen heute sind nicht ohne Weiteres gleich. Satz \(r\) für Nutzen und Schäden, Satz \(r_K\) für Ressourcen, Zeitraum \(T\) und Preisbasis müssen sichtbar sein. Erst eine ausdrücklich markierte Demo darf \(r=r_K\) setzen. Danach wird geprüft, ob die konservative Untergrenze \(PV_N^L\) bei einem offen gelegten Nutzenabschlag \(u\) noch positiv bleibt; der Schaden wird dabei nicht gekürzt.
7. **Entscheidung rückkoppeln.** Ein Ergebnis ist kein Endpunkt. Es kann zu einem Pilot, einer Ablehnung, einer weiteren Datenerhebung, einer Schutzauflage oder einer Änderung der Maßnahme führen.

Wenn Schritt 3 oder Schritt 5 nicht tragfähig ist, hilft Schritt 6 nicht weiter. Dann ist die richtige Ausgabe nicht „0,00“, sondern „blockiert / nicht bewertbar“. Das ist keine peinliche Lücke. Es ist eine ehrliche Aussage darüber, was wir noch nicht wissen oder verantworten können.

#### 7.8.3 Was die Buchstaben in der Formel bedeuten

Die aktuelle Formel verwendet wenige Buchstaben, aber jeder hat eine feste Aufgabe:

| Zeichen | Bedeutung | Prüffrage |
| --- | --- | --- |
| B_direkt | direkt monetarisierter Nutzen | Wer erhält den Nutzen, welche Einheit und welche Preisbasis gelten? |
| B_transformativ | eigener monetarisierter Nutzen aus einem dokumentierten Transformationswirkpfad | Welche spätere Zustandsveränderung wäre ohne die Maßnahme nicht oder nicht so eingetreten? |
| S | Schaden innerhalb derselben Bilanzgrenze | Wer trägt ihn, wann fällt er an und wurde er doppelt gezählt? |
| I | Investition | Welche Ressourcen werden zu Beginn oder über die Zeit eingesetzt? |
| K | inkrementelle Kosten | Welche zusätzlichen Betriebskosten entstehen nur wegen der Maßnahme? |
| a | Attribution | Welcher Anteil des Nutzens ist der Maßnahme zurechenbar? |
| d | Counterfactual/Deadweight | Welcher Anteil wäre ohnehin eingetreten? |
| v | Verdrängung | Welcher Nutzen fällt an anderer Stelle weg? |
| \(T\) | Betrachtungszeitraum | Sind es ganze Jahre mit \(T \geq 1\), und liegt \(I_0\) bei \(t=0\)? |
| \(r\), \(r_K\) | Diskontsätze | Mit welchen begründeten Sätzen werden Nutzen/Schäden bzw. Ressourcen abgezinst? |
| \(u\) | konservativer Szenarioabschlag | Wie viel des beanspruchten Nutzens wird vorsichtig gekürzt, ohne den Schaden anzutasten? |

Die drei Faktoren a, d und v werden transparent als Nutzenbegrenzung verwendet. Wenn etwa 80 Prozent des Nutzens zurechenbar sind, 10 Prozent ohnehin eingetreten wären und 5 Prozent verdrängt werden, dann beträgt der beanspruchte Anteil 0,8 mal 0,9 mal 0,95, also 0,684. Das bedeutet nicht, dass ein dokumentierter Schaden nur zu 68,4 Prozent zählt. Für eine niedrigere Schadenzurechnung bräuchte es einen eigenen Gegenfaktik-Nachweis. Der zusätzliche Szenarioabschlag \(u\) funktioniert genauso einseitig: Er kürzt nur den Nutzen, damit \(PV_N^L\) eine vorsichtige Untergrenze bleibt.

So verhindert die Methode eine typische Schieflage: Unsicherheit darf einen behaupteten Nutzen kleiner machen. Sie darf nicht heimlich einen bekannten Schaden kleiner machen.

#### 7.8.4 Der Transformationsnutzen braucht einen eigenen Beleg

Transformation kann wichtig sein. Eine neue Infrastruktur kann Folgekosten senken. Ein Standard kann spätere Entscheidungen verändern. Ein Ausbildungsprogramm kann nachweislich dazu führen, dass weitere Organisationen eine wirksame Praxis übernehmen. Das alles kann relevant werden. Aber die Frage lautet nicht: „Klingt das groß?“ Die Frage lautet: „Welcher zusätzliche Nutzen entsteht, bei wem, in welchem Zeitraum, verglichen womit und auf welcher Datengrundlage?“

Ein eigener Nutzenstrom braucht deshalb mindestens sechs Angaben:

- einen konkreten Empfängerkreis;
- einen nachvollziehbaren Wirkpfad;
- einen Zeitraum und eine Preisbasis;
- eine Gegenhypothese ohne die Maßnahme;
- einen begründeten Zurechnungsanteil;
- eine Unsicherheits- oder Sensitivitätsanalyse.

Fehlt eine dieser Angaben, verschwindet der Befund nicht. Er wird nur anders behandelt: als Transformationshypothese, Wirkungsrisiko, Resilienzbefund oder offene Lernfrage. Das ist oft sehr wertvoll für eine Entscheidung. Es ist nur noch keine Zahl im T-SROI-Zähler.

#### 7.8.5 Schrittweise Modellrechnung

Nehmen wir ein zweites, bewusst kleines Beispiel. Eine Kommune prüft ein Programm mit 1.000.000 EUR Anfangsinvestition. Das Schutz-Gate sei im Beispiel offen. Für zwei Jahre werden Nutzen und Schäden auf derselben Preisbasis dokumentiert. Der Kausalanteil beträgt 0,684. Die Demo setzt ausdrücklich \(r=r_K=5\) Prozent; das ist eine Vereinfachung für dieses Beispiel.

| Jahr | Direkter Nutzen | Transformationsnutzen mit eigenem Nachweis | Schaden | Direkter Netto-Barwert | T-SROI-Netto-Barwert |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 800.000 EUR | 100.000 EUR | 90.000 EUR | 435.429 EUR | 500.571 EUR |
| 2 | 900.000 EUR | 300.000 EUR | 110.000 EUR | 458.594 EUR | 644.717 EUR |

Für Jahr 1 wird der direkte Nutzen zuerst begrenzt: 800.000 mal 0,684 ergibt 547.200 EUR. Danach wird der Schaden abgezogen: 547.200 minus 90.000 ergibt 457.200 EUR. Mit dem in dieser Demo gesetzten Nutzen-Satz \(r=5\) Prozent ergibt sich ein Barwert von 435.429 EUR.

Für den T-SROI kommt im selben Jahr der getrennt belegte Transformationsnutzen hinzu: 800.000 plus 100.000 ergibt 900.000 EUR. Davon werden 68,4 Prozent beansprucht, anschließend werden die 90.000 EUR Schaden abgezogen. Das ergibt 525.600 EUR vor Diskontierung und 500.571 EUR im Barwert.

Über zwei Jahre beträgt der direkte Barwert-Nettonutzen 894.023 EUR. Der IOI beträgt damit 0,89 EUR/EUR. Der T-SROI-Barwert-Nettonutzen beträgt 1.145.288 EUR. Der T-SROI beträgt damit 1,15 : 1. Der Unterschied von 0,89 zu 1,15 ist hier vollständig nachvollziehbar: Er entsteht allein aus den zwei explizit angesetzten Transformationsnutzenströmen. Ohne ihren eigenen Nachweis bleibt der T-SROI gleich dem IOI, nicht höher.

Das ist die ganze Idee: Jede zusätzliche Zahl hat einen eigenen Namen, eine eigene Quelle und eine eigene Zeile.

#### 7.8.6 Sensitivität statt Wunschdenken

Eine einzelne Quote ist nie die ganze Geschichte. Deshalb gehört zu jeder belastbaren Rechnung eine Sensitivität. Die einfachste Variante verändert nacheinander eine Annahme und beobachtet die Folge.

| Frage | Optimistische Annahme | Konservative Annahme | Was daraus folgt |
| --- | --- | --- | --- |
| Attribution | hoher Anteil ist zurechenbar | nur ein kleiner Anteil ist zurechenbar | der Nutzenanspruch sinkt oder steigt, nicht aber ein bereits angesetzter Schaden |
| Vergleichsfall | ohne Maßnahme wäre wenig passiert | ein großer Teil wäre ohnehin passiert | Deadweight kann den Nutzen erheblich verringern |
| Preisbasis | hoher externer Kostensatz | niedriger, aber begründeter Kostensatz | die Monetarisierung muss die Preisbasis offenlegen |
| Diskontsätze \(r/r_K\) | niedrigere, begründete Sätze | höhere, begründete Sätze | weiter entfernte Nutzen und Ressourcen werden vorsichtiger bewertet; eine Ein-Satz-Demo markiert \(r=r_K\) |
| Transformationsnutzen | mehrere Wirkpfade sind belegt | nur direkte Effekte sind belegt | der T-SROI nähert sich dem IOI an |

Eine positive Entscheidungsaussage sollte nicht allein auf der freundlichsten Annahme beruhen. Sie braucht mindestens eine konservative Untergrenze. Wenn diese Untergrenze negativ wird, bleibt die positive Ausweisung geschlossen. Dann kann die Entscheidung trotzdem lauten: Pilot starten, Daten verbessern oder Schutzauflagen ergänzen. Sie darf nur nicht so tun, als wäre die Wirkung bereits bewiesen.

#### 7.8.7 Typische Fehler und ihre Reparatur

| Fehler | Warum er nicht funktioniert | Reparatur |
| --- | --- | --- |
| Einen NWI-Punkt durch Euro teilen | Punkt und Euro haben keine gemeinsame Einheit | NWI als Profil ausweisen; IOI nur mit Euroströmen rechnen |
| Einen erwarteten Diffusionseffekt frei hochrechnen | eine plausible Geschichte ist noch kein Nutzenstrom | Empfängerkreis, Gegenhypothese, Zurechnung und Preisbasis belegen |
| Schäden mit denselben Faktoren wie Nutzen verkleinern | Unsicherheit wird sonst zum Radiergummi für Schäden | Schäden separat und konservativ behandeln |
| Datenqualität als Aufschlag verwenden | gute Dokumentation macht keine Wirkung größer | Datenqualität als Mindestkriterium und Assurance-Frage führen |
| Gute Klimawirkung gegen schwere Rechts- oder Gesundheitsschäden verrechnen | kritische Schäden können nicht beliebig kompensiert werden | Reverse Merit Order und rote Linien vor der Geldquote anwenden |
| Eine Kennzahl als automatische Zins-, Steuer- oder Förderentscheidung ausgeben | rechtliche Zuständigkeit, Verteilung und Einzelfallprüfung werden übersprungen | Kennzahl als begründete Entscheidungsvorlage und Rückkopplung nutzen |

Die Reparatur ist fast immer dieselbe: zurück zur Einheit, zurück zur Systemgrenze, zurück zur Quelle. Das klingt einfach, aber es schützt vor sehr großen Fehlern.

#### 7.8.8 Was eine Entscheidung aus der Rechnung macht

Eine Wirkungsmessung ist erst nützlich, wenn sie eine Entscheidung verbessern kann. Das heißt nicht, dass eine Quote entscheidet. Politik, Unternehmen, Kommunen, Banken und zivilgesellschaftliche Organisationen haben unterschiedliche Aufgaben, Rechte und Grenzen. Eine Verwaltung darf kein Personenrating aus einer Scorecard machen. Eine Bank darf eine Modellquote nicht wie eine amtliche Bonität behandeln. Ein Unternehmen darf eine erwartete Wirkung nicht wie einen eingetretenen Erfolg bewerben.

Eine gute Entscheidungsnotiz kann daher so aussehen:

1. **Befund:** Das Profil zeigt in welchen Feldern Nutzen, Schaden und Datenlücken liegen.
2. **Gate:** Die rote-Linien-Prüfung ist offen, offen mit Auflagen oder geschlossen.
3. **Geldrechnung:** IOI und, wenn belegt, T-SROI zeigen ihre Systemgrenze, Preisbasis und Sensitivität.
4. **Konsequenz:** Investieren, anders gestalten, pilotieren, Daten nacherheben, Schutzauflage setzen oder ablehnen.
5. **Lernschleife:** Nach welchem Zeitraum wird welche Annahme geprüft und wer ist verantwortlich?

Das ist der Unterschied zwischen Reporting und Rückkopplung. Reporting sagt, was in einer Tabelle steht. Rückkopplung verändert aufgrund der Tabelle eine Entscheidung oder legt offen, warum sie sich noch nicht verändern darf.

#### 7.8.9 Kurztest für Lernende

Bevor du eine T-SROI-Zahl akzeptierst, stelle fünf Fragen:

1. Sind Zähler und Nenner vollständig in Euro derselben Preisbasis ausgewiesen?
2. Ist klar, welcher Nutzen direkt und welcher transformativ ist?
3. Gibt es für den transformativ ausgewiesenen Teil einen eigenen Wirkpfad und eine Gegenhypothese?
4. Sind Schäden separat, Systemgrenze und Gegenfaktik sichtbar?
5. Ist das Schutz-Gate offen – oder wäre „blockiert / nicht bewertbar“ die ehrlichere Antwort?

Kann eine dieser Fragen nicht beantwortet werden, ist das kein Grund, das Projekt schlechtzureden. Es ist ein Grund, die Rechnung noch nicht als positive Wirkungsbehauptung auszugeben.

#### 7.8.10 Gegenrechnung: Warum ein guter Einzelwert nicht genügt

Eine Rechnung wird besonders verständlich, wenn man sie einmal gegen den Strich bürstet. Nehmen wir eine Maßnahme, die nach außen sehr attraktiv aussieht: Sie spart im ersten Jahr Energie, schafft Arbeitsplätze und wird in einer Kampagne oft geteilt. Das sind drei verschiedene Beobachtungen. Die Energieeinsparung kann ein direkter Nutzen sein, wenn Baseline, Messmethode und Preisbasis klar sind. Arbeitsplätze können je nach Systemgrenze Nutzen, Kosten oder Verlagerung bedeuten; hier muss zuerst der Wirkpfad beschrieben werden. Viele geteilte Beiträge sind Reichweite. Reichweite kann einen Resonanzraum anzeigen, sie ist aber noch kein monetarisierter Transformationsnutzen.

Nun kommt eine Gegenfrage: Was passiert außerhalb des schönen Bildes? Vielleicht steigen die Materialverbräuche in der Lieferkette. Vielleicht wird eine andere, wirksamere Maßnahme verdrängt. Vielleicht entsteht ein Gesundheitsrisiko, das erst später sichtbar wird. Vielleicht war die Energieeinsparung ohnehin durch eine gesetzliche Pflicht eingetreten. Jede dieser Fragen verändert nicht einfach den Eindruck, sondern eine konkrete Zeile der Rechnung.

Für die direkte Geldrechnung ist der richtige Weg nicht, überall vorsorglich eine beliebige Pauschale abzuziehen. Der richtige Weg ist genauer:

- Ein nachweisbarer zusätzlicher Nutzen gehört als B_direkt in die Nutzenreihe.
- Ein nachweisbarer Schaden gehört als S in die Schadenreihe.
- Eine ohnehin eingetretene Veränderung begrenzt den Nutzen über den Counterfactual-Anteil.
- Ein Nutzen, der an anderer Stelle ausbleibt, gehört in die Verdrängungsprüfung.
- Ein noch nicht quantifizierbarer Befund bleibt sichtbar als Risiko, Annahme oder offene Datenlücke.

Das Ergebnis kann niedriger sein als die erste Werbeaussage. Es kann aber auch belastbarer sein, weil es zeigt, welche Annahme die Quote trägt. Eine niedrige, sauber erklärte Zahl ist wissenschaftlich wertvoller als eine hohe Zahl, die ihre Einheit oder ihre Gegenhypothese nicht verrät.

Die gleiche Gegenrechnung schützt auch vor einer falschen Schlussfolgerung über den NWI. Ein NWI-Profil kann beispielsweise gute Klimawerte, unklare Lieferkettendaten und ein kritisches Teilhaberisiko zugleich zeigen. Die Antwort ist nicht, die Profilwerte in Euro umzuwandeln, um daraus einen Durchschnitt zu bauen. Die Antwort lautet: Das kritische Feld prüfen, den Schutzweg klären und das Profil als Profil stehen lassen. Erst wenn die roten Linien und Datenlücken bearbeitet sind, kann sich eine Entscheidung oder eine Geldrechnung ändern.

#### 7.8.11 Eine Quellenkarte für eine prüfbare Rechnung

Eine gute Tabelle enthält nicht nur Zahlen. Sie sagt auch, woher die Zahlen kommen. Für jede zentrale Zeile empfiehlt sich eine kleine Quellenkarte.

| Rechenzeile | Mindestangabe | Beispiel einer guten Dokumentation | Warnsignal |
| --- | --- | --- | --- |
| Direkter Nutzen | Einheit, Zeitraum, Quelle, Systemgrenze | „Gemessene Energieeinsparung gegenüber 2024-Baseline, kWh pro Jahr, Messprotokoll X, Preisbasis 2026“ | „Spart viel Energie“ ohne Baseline |
| Transformationsnutzen | Wirkpfad, Empfängerkreis, Gegenhypothese, Zurechnung | „Zwei weitere Betriebe übernahmen die geprüfte Prozessnorm; Vergleichsgruppe und Zeitreihe dokumentiert“ | „Das Projekt wird bestimmt Schule machen“ |
| Schaden | Betroffene, Ursache, Einheit, Zeitbezug | „Mehrverkehr am Standort, gemessene Belastung, angenommener Schadenskostensatz und Sensitivität“ | Schaden wird nur als Randnotiz erwähnt |
| Attribution | Begründung des Anteils | „80 Prozent, weil vier von fünf beobachteten Umsetzungen auf die Intervention zurückgeführt werden können“ | Anteil wird gewählt, weil er plausibel klingt |
| Deadweight | Vergleich ohne Maßnahme | „10 Prozent wären laut Kontrollgruppe oder Rechtslage ohnehin eingetreten“ | Vergleichsfall fehlt |
| Verdrängung | Gegenwirkung außerhalb des Projekts | „5 Prozent des Nutzens verlagern sich nachweislich auf einen anderen Standort“ | nur der Projektort wird betrachtet |
| Diskontierung | \(r\), \(r_K\), Zeitraum, Preisbasis | „Demo: \(r=r_K=5\) Prozent, Jahre 1 bis 5, EUR_2026; Sensitivität mit getrennt begründeten Sätzen“ | Barwert wird genannt, aber nicht hergeleitet |

Diese Karte ist keine Bürokratie um der Bürokratie willen. Sie ist das Etikett auf der Dose. Wer weiß, was drin ist, kann entscheiden, ob die Dose für die Frage passt. Wer das Etikett weglässt, kann aus derselben Zahl fast alles machen.

Auch externe Quellen brauchen eine Rolle. Ein gesetzlicher Emissionsfaktor kann eine Rechenannahme stützen. Eine wissenschaftliche Studie kann einen Wirkpfad oder einen Schadenskostensatz begründen. Ein Unternehmensbericht kann Daten liefern, aber nicht ohne Weiteres die eigene positive Wirkung beweisen. Eine Expert:innen-Einschätzung kann eine Annahme plausibilisieren, aber sie ersetzt keine Beobachtung. In der Dokumentation sollte deshalb neben jeder Quelle stehen: Messung, Studie, Modell, Rechtsquelle, Schätzung oder Erfahrungswissen. So wird sichtbar, was eine Quelle kann – und was nicht.

#### 7.8.12 Mini-Workshop: Aus einem Projekt eine saubere Vorlage machen

Für einen Workshop reicht ein großes Whiteboard oder eine Tabelle mit vier Spalten. In die erste Spalte kommt die Entscheidung. In die zweite der Wirkpfad. In die dritte die Evidenz. In die vierte die Konsequenz. Ein Team kann sich zum Beispiel mit der Frage beschäftigen: Soll eine Kommune in ein neues Quartierswärmenetz investieren?

In der Entscheidungs-Spalte steht: Investition, Alternative, Zeitraum und Verantwortlichkeit. In der Wirkpfad-Spalte steht: Anschlussquote, Energieträger, Bauphase, Preisentwicklung, Versorgungssicherheit, mögliche Belastungen für Mieter:innen und Auswirkungen auf andere Infrastrukturen. In der Evidenz-Spalte steht nicht nur „Daten vorhanden“, sondern konkret: Kostenangebot, technische Potenzialanalyse, Emissionsfaktor, Sozialverträglichkeitsprüfung, Beteiligungsprotokoll, Annahme zum Vergleichsfall. In der Konsequenz-Spalte stehen mögliche Antworten: weiter planen, Tarifschutz ergänzen, Bauphase anders gestalten, Daten nacherheben, Pilot starten oder ablehnen.

Erst danach wird die Frage gestellt, ob eine Geldrechnung sinnvoll ist. Direkte Energiekosteneffekte, vermiedene Emissionsschäden und zusätzliche Betriebskosten können möglicherweise in eine IOI-Reihe eingehen. Ein überregionaler Standardisierungseffekt kann nur dann in einen T-SROI eingehen, wenn er mehr ist als eine gute Hoffnung. Vielleicht gibt es belastbare Daten aus ähnlichen Kommunen. Vielleicht bleibt er offen. Beides ist ein brauchbares Ergebnis, solange es klar benannt wird.

Der Workshop darf nicht in eine Bewertung von Menschen kippen. Weder Mieter:innen, Beschäftigte noch politische Entscheider:innen bekommen einen sozialen Wert. Bewertet werden Projekt, Wirkpfade, Daten und mögliche Zustandsveränderungen. Das schützt Würde und verhindert, dass eine Methode, die eigentlich Folgen sichtbar machen soll, selbst neue problematische Folgen erzeugt.

#### 7.8.13 Wie man Ergebnisse erklärt, ohne sie zu übertreiben

Am Ende braucht es einen Satz, den auch Menschen verstehen können, die die Formel nicht auswendig kennen. Eine gute Erklärung hat vier Teile:

„Für den beschriebenen Vergleichsfall zeigt das Wirkungsprofil diese Stärken und Risiken. Die direkte Geldrechnung ergibt unter den genannten Annahmen einen IOI von X. Ein T-SROI von Y wird nur ausgewiesen, weil der zusätzliche Transformationsnutzen mit eigenem Wirkpfad und Unsicherheit dokumentiert ist. Bleibt eine rote Linie oder eine zentrale Datenlücke offen, lautet die Entscheidung nicht positiv, sondern blockiert oder vorläufig.“

Dieser Satz ist nicht kleinlaut. Er sagt genau, was die Rechnung kann. Und er sagt genauso klar, was sie nicht kann. Das ist die Art von Präzision, die man auch ohne Taschenrechner prüfen kann: Welche Einheit? Welche Quelle? Welche Grenze? Welche Annahme? Welche Konsequenz?

#### 7.8.14 Der Unterschied zwischen Messwert, Werturteil und Entscheidung

In Wirkungsdebatten geraten drei Ebenen leicht durcheinander. Erstens gibt es einen Messwert. Das kann eine Kilowattstunde, eine Tonne CO2e, ein Eurobetrag, ein Anteil oder eine Beobachtung aus einer Befragung sein. Zweitens gibt es ein Werturteil. Es ordnet den Messwert im Referenzrahmen ein: Ist die Veränderung im gegebenen Kontext eher schützend, belastend, ambivalent oder unklar? Drittens gibt es eine Entscheidung. Sie kann eine Investition zulassen, ablehnen, umgestalten oder mit Auflagen verbinden.

Keine dieser Ebenen ist überflüssig, aber keine ersetzt die andere. Ein niedriger Energieverbrauch ist ein Messwert. Ob er unter Berücksichtigung von Lieferkette, Zugänglichkeit und Flächenwirkung positiv zu bewerten ist, ist eine zweite Frage. Ob eine Kommune oder ein Unternehmen deshalb investieren soll, ist eine dritte Frage, bei der Recht, Verteilung, Budget, Beteiligung und Alternativen eine Rolle spielen.

Der NWI hilft auf der zweiten Ebene: Er macht ein Wirkungsprofil in einer transparenten Bewertungslogik lesbar. IOI und T-SROI helfen auf einer klar abgegrenzten, monetarisierten Teilfrage. Sie dürfen nicht so gelesen werden, als hätten sie allein bereits ein vollständiges Werturteil oder eine rechtlich bindende Entscheidung erzeugt.

Das ist besonders wichtig, wenn die Zahlen groß werden. Ein hoher Eurobetrag kann auf einen erheblichen Nutzen hinweisen, sagt aber für sich noch nicht, wer ihn erhält und wer die Kosten trägt. Ein kleiner Eurobetrag kann für eine besonders verletzliche Gruppe sehr relevant sein. Eine Quote kann zeigen, dass sich ein dokumentierter Nettonutzen rechnerisch zum Ressourceneinsatz verhält. Sie sagt nicht, dass andere Rechte, Pflichten oder Verteilungsfragen erledigt wären.

Die WÖk trennt deshalb auch die Bewertung von Objekten und Systemen von der Bewertung von Personen. Eine Maßnahme, ein Produkt, ein Programm, eine Infrastruktur oder ein Kapitalfluss kann auf Wirkungen, Risiken und Daten geprüft werden. Menschen erhalten dadurch keinen Gesamtscore. Das gilt im Seminar ebenso wie in einem Dashboard oder einer Förderentscheidung.

#### 7.8.15 Von der Baseline zur konservativen Untergrenze

Eine belastbare Rechnung beginnt mit einer Baseline. Sie beschreibt nicht das Wunschbild, sondern den Vergleichsfall: Was wäre mit hoher Wahrscheinlichkeit ohne die Maßnahme geschehen? Bei einer Gebäudesanierung kann das der Weiterbetrieb des bestehenden Systems sein. Bei einer neuen Weiterbildung kann es der bisherige Qualifizierungsweg sein. Bei einer Beschaffungsentscheidung kann es ein realistisches Alternativprodukt sein. Die Baseline wird nicht gewählt, weil sie die Maßnahme besonders gut aussehen lässt, sondern weil sie zur Entscheidung passt und dokumentierbar ist.

Danach werden die Annahmen nach ihrer Stärke sortiert. Eine gemessene Veränderung mit klarer Messmethode ist stärker als eine Modellannahme. Eine Annahme mit Vergleichsgruppe ist stärker als eine reine Expertenvermutung. Eine plausible, aber noch nicht beobachtete Diffusion bleibt möglich, aber sie ist schwächer als ein tatsächlich beobachteter Übernahmeeffekt. Diese Unterschiede gehören in die Unsicherheitsanalyse.

Die konservative Untergrenze ist kein Trick, um gute Vorhaben schlechtzurechnen. Sie ist eine Sicherheitsfrage: Bleibt die Kernaussage auch dann bestehen, wenn der Nutzen kleiner, der Schaden größer, die Diskontsätze höher oder der Counterfactual günstiger für den Vergleichsfall ausfällt? Wenn die Antwort ja ist, wird die Aussage robuster. Wenn die Antwort nein ist, darf die Entscheidung trotzdem vernünftig sein, aber sie braucht eine vorsichtigere Begründung und eine Lernschleife.

Ein praktisches Raster kann so aussehen:

| Annahme | Zentralwert | konservative Variante | Warum die Variante wichtig ist |
| --- | ---: | ---: | --- |
| Attribution | 80 Prozent | 50 Prozent | trennt eigenen Beitrag von Mitwirkung anderer |
| Deadweight | 10 Prozent | 35 Prozent | prüft, wie viel ohnehin eingetreten wäre |
| Verdrängung | 5 Prozent | 20 Prozent | erfasst Nutzen, der an anderer Stelle ausbleibt |
| Diskontsätze \(r/r_K\) | Demo: 5 / 5 Prozent | getrennt begründete höhere Sätze | behandelt spätere Nutzen und Ressourcen vorsichtiger |
| Schaden | 90.000 EUR | 140.000 EUR | verhindert, dass Risiken zu klein angesetzt werden |
| Transformationsnutzen | dokumentiert | 0 EUR, falls der Nachweis wegfällt | zeigt, ob der T-SROI vom eigenen Zusatzstrom abhängt |

Die letzte Zeile ist besonders aufschlussreich. Eine gute T-SROI-Rechnung muss erklären können, was übrig bleibt, wenn der Transformationsnutzen nicht eingerechnet wird. Das Ergebnis ist dann der IOI. So sieht man unmittelbar, was der direkte Nutzen trägt und was durch den zusätzlichen, separat belegten Wirkpfad hinzukommt.

#### 7.8.16 Doppelt zählen ist keine Wirkung

Ein häufiger Fehler entsteht, wenn dieselbe Veränderung zweimal in verschiedenen Worten auftaucht. Eine Energieeinsparung kann beispielsweise Betriebskosten senken und Emissionen mindern. Wenn die eingesparten Energiekosten bereits den gesamten wirtschaftlichen Nutzen enthalten, darf derselbe Betrag nicht noch einmal als allgemeiner Produktivitätsgewinn hinzugerechnet werden. Wenn vermiedene Emissionen mit einem Schadenskostensatz monetarisiert werden, muss klar sein, ob dieser Schadenskostensatz bereits Gesundheits- oder Landwirtschaftsfolgen enthält. Sonst wird ein Nutzen zweimal gezählt, obwohl er nur einmal eingetreten ist.

Die Reparatur ist eine Wirkpfadkarte. Jeder Nutzenstrom bekommt einen Ursprung, einen Empfängerkreis, eine Einheit, einen Zeitraum und eine Zeile. Kommen zwei Zeilen vom selben Ursprung und beschreiben denselben Empfänger im selben Zeitraum, muss geprüft werden, ob sie sich überschneiden. Bei Unsicherheit ist eine konservative Zusammenfassung besser als eine doppelte Addition.

Das gilt auch für Schäden. Ein Lock-in-Risiko kann zu späteren Mehrkosten führen. Wenn diese Mehrkosten bereits als Betriebskosten K oder als Schaden S angesetzt sind, darf derselbe Betrag nicht noch einmal als allgemeines Zukunftsrisiko den Zähler drücken. Eine Risikobeschreibung bleibt trotzdem wichtig. Sie muss nur sagen, ob sie bereits monetarisiert wurde oder als nicht monetärer Befund neben der Rechnung steht.

Die Frage „Woher kommt diese Zahl genau?“ ist deshalb keine pedantische Nebenfrage. Sie entscheidet darüber, ob die Rechnung ein Rechenweg oder nur eine Sammlung gut klingender Effekte ist.

#### 7.8.17 Rollen, Zuständigkeiten und Widerspruch

Eine sorgfältige Wirkungsmessung braucht mehrere Rollen. Die Person oder Organisation, die eine Maßnahme vorschlägt, beschreibt Ziel und Wirkpfad. Datenhalter:innen dokumentieren Quellen und Grenzen. Fachleute prüfen Methode und Preisbasis. Betroffene oder ihre Vertretungen können auf Nebenwirkungen, Verteilung und fehlende Perspektiven hinweisen. Die entscheidende Stelle trägt die Verantwortung dafür, ob sie investiert, verändert, vertagt oder ablehnt.

Diese Rollen dürfen nicht in einer Kennzahl verschwinden. Gerade wenn ein Ergebnis Folgen für Förderung, Beschaffung, Kredit oder öffentliche Kommunikation haben kann, braucht es eine Möglichkeit zum Widerspruch und zur Korrektur. Ein Datenfehler, eine falsch gewählte Baseline oder eine nicht gesehene Nebenwirkung muss nachträglich sichtbar werden können. Die richtige Reaktion ist dann nicht, die alte Zahl zu verteidigen, sondern die Entscheidungslage zu aktualisieren.

Das schützt auch vor dem Missverständnis, die Wirkungsökonomie wolle alles zentral planen. Sie liefert keine automatische Rangliste und keine Sprachpolizei. Sie stellt Fragen an Folgen, Quellen, Grenzen und Rückkopplung. Welche Regel oder Entscheidung daraus folgt, bleibt eine rechtsgebundene, demokratische und fachliche Aufgabe.

#### 7.8.18 Ein kurzer Prüfpfad vor Veröffentlichung

Bevor eine Organisation einen NWI, IOI oder T-SROI veröffentlicht, kann sie diesen kurzen Prüfpfad durchgehen:

1. Ist klar, ob der Satz Wirkung, Wirkungspotenzial oder Wirkungsrisiko beschreibt?
2. Sind alle Eurobeträge mit Preisbasis, Zeitraum und Systemgrenze versehen?
3. Sind Punkte und Euro strikt getrennt dargestellt?
4. Ist der Vergleichsfall dokumentiert und für die Entscheidung plausibel?
5. Sind Attribution, Deadweight und Verdrängung begründet?
6. Sind Schäden separat ausgewiesen und nicht unbemerkt reduziert?
7. Ist ein zusätzlicher Transformationsnutzen als eigener Strom mit Quellen nachgewiesen?
8. Wurde die konservative Untergrenze gerechnet oder wenigstens als offene Lücke ausgewiesen?
9. Ist klar, welche Entscheidung oder Lernschleife aus dem Befund folgt?
10. Ist ausdrücklich ausgeschlossen, dass Menschen als Personen bewertet oder automatisiert klassifiziert werden?

Wenn dieser Prüfpfad nur teilweise beantwortet werden kann, ist das Ergebnis nicht wertlos. Es muss lediglich die passende Form haben: Profil, Hypothese, Pilotbefund, Risikohinweis oder „noch nicht bewertbar“ statt einer überzogenen Quotenzahl.

#### 7.8.19 Wiederholung in einem Bild

Man kann die Methode wie eine Brücke lesen. Das Profil steht am Anfang der Brücke. Es zeigt, ob sich ein Weg überhaupt verantwortbar öffnet. Der direkte Nutzenstrom läuft über die Brücke, aber nur soweit er kausal zurechenbar ist. Schäden sind keine Löcher, die man mit einem schönen Anstrich übermalt; sie werden auf derselben Brücke sichtbar abgezogen. Der Transformationsnutzen darf nur dann als zusätzlicher Fahrstreifen dazukommen, wenn seine Tragfähigkeit nachgewiesen ist. Und am Ende der Brücke steht nicht automatisch „Ja“, sondern eine Entscheidung mit Verantwortung, Rückkopplung und Möglichkeit zur Korrektur.

So bleiben NWI, IOI und T-SROI unterscheidbar und zugleich verbunden: Profil vor Quote, Evidenz vor Behauptung, Schutz vor Schönrechnung und Lernen vor Selbstgewissheit.

`;

let text = fs.readFileSync(MASTER, "utf8");
text = text
  .replace(/^\*\*Status:\*\*[^\n]*$/m, "**Fachlicher Stand:** methodisch aktualisiert am 2. August 2026")
  .replace(/^(\*\*Fachlicher Stand:\*\*[^\n]*?)[ \t]+$/m, "$1")
  .replace(/^\*\*Quelle:\*\*[^\n]*\n/m, "")
  .replace(/^\*\*Ablage:\*\*[^\n]*\n/m, "")
  .replace(/^\*\*Wissensbasis:\*\*[^\n]*$/m, "**Methodischer Bezug:** T-SROI-Rechenstandard v1.1, Glossar und offene Quellenangaben")
  .replace(
    /Dieses Studienskript ist die fachlich finale Codex-V1-Fassung fuer den Akademie-Reader und die oeffentliche Bibliothek\. Claude uebernimmt danach Satz, CI\/CD, PDF\/Reader-Freigabe und die abschliessende Lektoratsabnahme\./g,
    "Dieses Studienskript ist eine methodisch aktualisierte Lernfassung. Es macht Annahmen, Einheiten, Grenzen und offene Fragen sichtbar; es ersetzt keine Einzelfallprüfung."
  )
  .replace(
    /^\*\*Führende Quellen \(Repo\):\*\*.*$/m,
    "**Führende Quellen:** [T-SROI-Rechenstandard v1.1](https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/), [Glossar NWI](https://wirkungsoekonomie.de/begriffe/nwi/) und [Glossar Impact of Investment](https://wirkungsoekonomie.de/begriffe/impact-of-investment/)"
  )
  .replace(/^> Erstellt nach .*$/m, "")
  .replace(/^- \*\*Medienquelle:\*\* \[Platzhalter\]\n?/m, "")
  .replace("### 7.6 Prüfungsnahe Fallfragen ohne geschützte Antwortlogik", "### 7.6 Anwendungsfragen")
  .replace("## V1-Finalisierung: Vertiefung, Anwendung und Evidenz", "## Vertiefung, Anwendung und Evidenz")
  .replace("### V1-Abschlussnotiz", "### Nutzungshinweis")
  .replace(
    /Diese Finalisierung schliesst die Codex-Inhaltsproduktion fuer V33\. Offen bleibt nicht der fachliche Kern des Skripts, sondern der naechste Produktionsschritt: Claude setzt daraus die CI\/CD-konforme Reader- und PDF-Fassung, prueft Satz, Umbrueche, Medienintegration und Lektorat und markiert erst danach die veroeffentlichte Fassung als freigegeben\./g,
    "Die Lernfassung bleibt versionsgebunden: Quellen, Preisbasis, Systemgrenze, Unsicherheiten und der Stand der Rechenlogik sind bei jeder Anwendung zu prüfen."
  )
  .replace(
    /\*\*Status dieser Erweiterung:\*\*[^\n]*/g,
    "**Methodischer Hinweis:** Die folgenden Beispiele erklären den Rechenweg. Sie sind keine Prognosen, keine Personenbewertung und keine automatische Entscheidung."
  )
  .replace(
    /Diese Fragen sind öffentlich und dienen dem Lernen\. Die geschützte Antwortlogik, Scoring-Regeln und CorrectAnswer-Felder bleiben in der Prüfungs-Lane der App\./g,
    "Diese Fragen dienen dem Lernen. Sie verlangen nachvollziehbare Begriffe, Quellen, Unsicherheiten und Schutzregeln statt einer scheinbar eindeutigen Punktzahl."
  )
  .replace(
    /Diese Vorlesung ist prüfungsrelevant, aber die eigentliche Antwortlogik gehört \*\*nicht\*\* in das öffentliche Studienskript\. Zertifikatsfragen, CorrectAnswer, Scoring-Regeln und Fallrubrics werden separat in der geschützten App-Lane unter `[^`]+` gepflegt\./g,
    "Diese Vorlesung eignet sich für Selbstreflexion, Seminararbeit und Prüfungsvorbereitung. Entscheidend ist nicht das Auswendiglernen einer Formel, sondern die saubere Trennung von Profil, Geldstrom, Annahme und Schutzregel."
  )
  .replace(/^### Quellenanker: (.*?) · https?:\/\/[^·\n]+ · Druckdatum: [^\n]+$/gm, "### Weiterführende Quelle: $1")
  .replace(/^\*Interne Quelle:\*[^\n]*\n/gm, "")
  .replaceAll("Transformationsmultiplikatoren", "separat belegte Transformationsnutzen")
  .replaceAll("Transformationsmultiplikator", "separat belegter Transformationsnutzen")
  .replace("### Finaler Leseauftrag", "### Lesehinweis")
  .replace("## 7. Tiefenskript-Erweiterung Sprint 5", "## 7. Vertiefung: Anwendung und Rechenlogik")
  .replace(
    "Dieses Skript zu **V33 NWI und T-SROI unterscheiden** ist als Langformtext angelegt: Es soll nicht nur die Vorlesung begleiten, sondern als eigenstaendiges Studienmaterial funktionieren. Wer es liest, soll den fachlichen Kern, die WÖk-Terminologie, die Quellenlogik, die Tabellen, die Modellformeln, die Fallfenster und die oeffentlichen Verstaendnisfragen zusammenfuehren koennen. Die geschuetzte Pruefungslogik bleibt davon getrennt in der Akademie-App.",
    "Dieses Skript ist eine eigenständige Lernfassung. Es verbindet Begriffe, Wirkpfade, Quellenlogik, Modellformeln und Fallfragen. Entscheidend ist dabei nicht das Auswendiglernen einer Kennzahl, sondern die prüfbare Trennung von Profil, Geldstrom, Annahme und Schutzregel."
  )
  .replace(
    "Nicht jede Kennzahl beantwortet dieselbe Frage. Der NWI fragt nach Netto-Wirkung in einem Wirkungsprofil. T-SROI fragt nach Transformationswirkung im Verhältnis zu eingesetzten Mitteln. Beide sind nützlich, aber nicht austauschbar.",
    "Nicht jede Kennzahl beantwortet dieselbe Frage. Der NWI ordnet ein Wirkungsprofil. Der IOI rechnet direkt monetarisierten Nettonutzen je Ressourceneuro. Der T-SROI ergänzt diese Geldrechnung nur um einen eigenständig belegten Transformationsnutzenstrom. Die drei Werkzeuge sind nützlich, aber nicht austauschbar."
  )
  .replace(
    "**Kernaussage in einem Satz:** NWI bewertet Netto-Wirkung als Profil, T-SROI bewertet Transformationswirkung relativ zum Ressourceneinsatz; beide bleiben an Datenqualität und Nichtkompensation gebunden.",
    "**Kernaussage in einem Satz:** NWI ordnet ein Wirkungsprofil; IOI und T-SROI rechnen getrennte Euroströme je Ressourceneuro – der T-SROI nur mit einem zusätzlich belegten Transformationsnutzen."
  )
  .replace(
    "**Abschnitt C – T-SROI.** Transformative Social Return on Investment betrachtet Wirkung im Verhältnis zu eingesetzten Mitteln und Transformationsbeitrag.",
    "**Abschnitt C – IOI und T-SROI.** Der IOI rechnet direkten, monetarisierten Nettonutzen; der T-SROI ergänzt ihn ausschließlich um einen separat nachgewiesenen Transformationsnutzenstrom."
  )
  .replace(
    "**Abschnitt D – Nicht verwechseln.** NWI ist Bewertungsprofil; T-SROI ist Investitions- und Transformationsperspektive.",
    "**Abschnitt D – Nicht verwechseln.** NWI ist ein Profil. IOI und T-SROI sind Geldrechnungen; der T-SROI ist kein Multiplikator für das NWI."
  )
  .replace(
    "**T-SROI** fragt anders: Welche transformative Wirkung entsteht im Verhältnis zu eingesetzten Ressourcen? Er verbindet Wirkungsbewertung mit Investitionslogik. Wichtig ist dabei das T: Transformationswirkung. Es geht nicht nur darum, ob etwas „sozial nützlich\" ist, sondern ob es strukturell bessere Zustände ermöglicht.",
    "**IOI und T-SROI** fragen enger als der NWI: Welche monetarisierten, kausal begrenzten Nettonutzen entstehen je Ressourceneuro? Beim T-SROI kommt nur ein zusätzlicher Transformationsnutzen hinzu, der als eigener Eurostrom belegt ist. Das „T“ ist also kein Verstärker für eine gute Geschichte, sondern eine zusätzliche, prüfbare Rechenzeile."
  )
  .replace(
    "Der Unterschied ist praktisch: Wenn eine Kommune ein Schulgebäude saniert, kann der NWI das Wirkungsprofil des Gebäudes bewerten: Klima, Gesundheit, Bildung, Teilhabe. T-SROI kann fragen, welcher Transformationsnutzen im Verhältnis zur Investition entsteht: weniger Energiekosten, bessere Lernbedingungen, geringere Gesundheitsbelastung, soziale Resilienz.",
    "Der Unterschied ist praktisch: Wenn eine Kommune ein Schulgebäude saniert, kann der NWI das Wirkungsprofil des Gebäudes beschreiben: Klima, Gesundheit, Bildung und Teilhabe. Direkte, monetarisierte Energiekosten- oder Gesundheitsfolgen können in den IOI eingehen. Ein T-SROI entsteht erst, wenn ein zusätzlicher Transformationsnutzen – etwa eine nachweislich übernommene und monetarisierte Folgewirkung – separat belegt ist."
  )
  .replaceAll(
    "NWI und T-SROI beantworten unterschiedliche Fragen: Der Netto-Wirkungs-Index verdichtet ein Wirkungsprofil, T-SROI beschreibt Transformationswirkung im Verhältnis zu eingesetzten Ressourcen und langfristigen Systemeffekten.",
    "NWI, IOI und T-SROI beantworten unterschiedliche Fragen: Der NWI ordnet ein Wirkungsprofil, der IOI rechnet direkten monetarisierten Nettonutzen und der T-SROI ergänzt diesen nur um einen separat belegten Transformationsnutzenstrom."
  )
  .replaceAll(
    "**Fall 1.** Ein Präventionsprogramm kann kurzfristig teuer wirken, aber über vermiedene Krankheit, Pflegebedarf, Arbeitsausfall und familiäre Belastung hohe Transformationswirkung entfalten. Hier hilft T-SROI.",
    "**Fall 1.** Ein Präventionsprogramm kann direkte, monetarisierte Nutzen wie vermiedene Krankheit, Pflegebedarf oder Arbeitsausfall erzeugen. Das gehört zunächst in die IOI-Rechnung. Ein T-SROI kommt nur hinzu, wenn ein darüber hinausgehender Transformationsnutzen als eigener Strom belegt ist."
  )
  .replaceAll(
    "A) Transformationswirkung im Verhältnis zu eingesetzten Ressourcen  B) reine Reichweite  C) nur Designqualität  D) Personenwert",
    "A) zusätzlichen, separat belegten Transformationsnutzen in einer Geldrechnung ausweisen  B) reine Reichweite  C) nur Designqualität  D) Personenwert"
  )
  .replaceAll(
    "✅ **Richtig: A** - T-SROI verbindet Wirkung und Ressourceneinsatz.",
    "✅ **Richtig: A** - T-SROI ergänzt die direkte Geldrechnung nur um einen separat belegten Nutzenstrom."
  )
  .replaceAll(
    "✅ **Richtig: A** - NWI ist Bewertungsprofil, T-SROI Investitions-/Transformationsperspektive.",
    "✅ **Richtig: A** - NWI ist ein Profil; IOI und T-SROI sind getrennte Geldrechnungen."
  )
  .replaceAll(
    "**Schulsanierung.** NWI bewertet das Gebäudeprofil: Energie, Gesundheit, Barrierefreiheit, Lernumgebung. T-SROI fragt, welche Transformationswirkung pro investiertem Euro entsteht: bessere Lernbedingungen, weniger Krankheit, niedrigere Energiekosten, Quartiersnutzen.",
    "**Schulsanierung.** Der NWI ordnet Energie, Gesundheit, Barrierefreiheit und Lernumgebung als Wirkungsprofil. Nachweisbar monetarisierte Energiekosten- und Gesundheitsfolgen können in den IOI eingehen. Ein T-SROI setzt zusätzlich einen eigenständigen, dokumentierten Transformationsnutzen voraus."
  )
  .replaceAll(
    "- NWI und T-SROI in Werkzeugseiten konsequent als unterschiedliche Kennzahltypen erklären.",
    "- NWI, IOI und T-SROI in Werkzeugseiten konsequent als unterschiedliche Kennzahltypen erklären."
  )
  .replaceAll("`begriffe/netto-wirkungs-index`", "[NWI](/begriffe/nwi/)")
  .replaceAll("`begriffe/t-sroi`", "[T-SROI](/begriffe/t-sroi/)")
  .replaceAll("`begriffe/transformationswirkung`", "[Transformationswirkung](/begriffe/transformationswirkung/)")
  .replaceAll("`begriffe/finalscore`", "[FinalScore](/begriffe/finalscore/)")
  .replaceAll(
    "T-SROI bewertet finanzielle, soziale, ökologische und systemische Transformationswirkung im Verhältnis zum Ressourceneinsatz.",
    "T-SROI ergänzt eine direkte IOI-Geldrechnung nur um einen separat belegten, monetarisierten Transformationsnutzen innerhalb derselben Systemgrenze und Preisbasis."
  )
  .replaceAll(
    "Transformational Social Return on Investment bewertet finanzielle, soziale, ökologische und systemische Transformationswirkung.",
    "Transformational Social Return on Investment ergänzt eine direkte IOI-Geldrechnung um einen separat belegten Transformationsnutzenstrom."
  )
  .replaceAll(
    "Warum hier relevant? T-SROI übersetzt Investitionen, Prävention und Transformation in eine nachvollziehbare Wirkungsrendite.",
    "Warum hier relevant? T-SROI macht den direkt monetarisierten und den zusätzlich belegten Transformationsnutzen getrennt nachvollziehbar."
  )
  .replaceAll(
    "IOI setzt positive Netto-Wirkung ins Verhältnis zum eingesetzten Kapital, Budget oder Investitionsvolumen.",
    "IOI setzt direkt monetarisierten, kausal begrenzten Nettonutzen in Euro ins Verhältnis zu Investition und inkrementellen Kosten."
  )
  .replaceAll(
    "Warum hier relevant? IOI zeigt, ob ein Euro nur finanzielle Aktivität auslöst oder belegbare positive Netto-Wirkung erzeugt.",
    "Warum hier relevant? IOI zeigt, welcher direkt monetarisierte und kausal begrenzte Nettonutzen je Ressourceneuro dokumentiert ist."
  )
  .replaceAll(
    "„T-SROI fragt nicht nur, ob sich etwas lohnt, sondern ob es ein System in Richtung Zukunftsfähigkeit verändert.“",
    "„T-SROI ergänzt die direkte Geldrechnung nur dort, wo ein zusätzlicher Transformationsnutzen als eigener Nutzenstrom nachgewiesen ist.“"
  );

text = text
  .replace(/^### 7\.7 .*$/m, "### 7.7 Einordnung der Kennzahlen")
  .replace(/^### Quellenanker:.*\n*/m, "");
text = replaceSection(text, "### 7.3 Analysemodell", "### 7.4 Modellformel", analysisModel);
text = replaceSection(text, "### 7.4 Modellformel", "### 7.5 Fallfenster", modelFormula);
if (text.includes("Formelkasten 34-1: Grundlogik des Impact-Controllings")) {
  text = replaceSection(text, "Formelkasten 34-1: Grundlogik des Impact-Controllings", "### 34.3 Transformation statt bloßer Projekt-Nutzen", currentStandardBlock);
}
text = replaceSection(text, "### 7.7 Einordnung der Kennzahlen", "### 34.3 Transformation statt bloßer Projekt-Nutzen", currentReferenceBlock);
text = replaceSection(text, "### 34.3 Transformation statt bloßer Projekt-Nutzen", "### 34.4 Systemische Hebelwirkung, Diffusion und Standardsetzung", transformationClarification);
if (text.includes("### Quellenanker: Inhalt")) {
  text = replaceSection(text, "### Quellenanker: Inhalt", "### 7.9 Konsequenzen für die WÖk-Architektur", currentLearningBlock);
} else if (text.includes("### 7.8 Vertiefung: Rechnen ohne Mischgrößen")) {
  text = replaceSection(text, "### 7.8 Vertiefung: Rechnen ohne Mischgrößen", "### 7.9 Konsequenzen für die WÖk-Architektur", currentLearningBlock);
} else if (text.includes("Seite 12\n\n")) {
  text = replaceSection(text, "Seite 12\n\n", "Seite 13", circularEconomyCase);
}

const publicSources = `## 9. Quellen

### Methodische Quellen

- [Wirkungsökonomie: T-SROI-Rechenstandard v1.1](https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/)
- [Wirkungsökonomie: Netto-Wirkungs-Index (NWI)](https://wirkungsoekonomie.de/begriffe/nwi/)
- [Wirkungsökonomie: Impact of Investment (IOI)](https://wirkungsoekonomie.de/begriffe/impact-of-investment/)
- [Wirkungsökonomie: Transformationswirkung](https://wirkungsoekonomie.de/begriffe/transformationswirkung/)

`;
text = replaceSection(text, "## 9. Quellen\n", "### Externe Quellen", publicSources);
text = text.replace("### Externe Quellen fuer die V1-Fassung", "### Externe Quellen");

const forbidden = [
  "Transformationsmultiplikator",
  "T-SROI×M",
  "T_struktur",
  "H_sys",
  "F_zeit",
  "F_resilienz",
  "Q_daten",
  "Claude-CI/CD",
  "Druckdatum:",
  "[Platzhalter]",
  "geschützte Antwortlogik",
];
for (const value of forbidden) {
  if (text.includes(value)) throw new Error(`V33 enthält noch einen unzulässigen Rest: ${value}`);
}
for (const value of [
  "Ein NWI-Punkt ist kein Euro.",
  "T\\text{-}SROI =",
  "B_{direkt,t}",
  "PV_N^L",
  "(1-u_t)",
  "T \\geq 1",
  "I_0",
  "r=r_K",
  "positive Ressourcenbasis",
  "Der T-SROI beträgt damit 1,15 : 1.",
]) {
  if (!text.includes(value)) throw new Error(`V33 enthält die erforderliche Rechenklärung nicht: ${value}`);
}

fs.writeFileSync(MASTER, text, "utf8");

const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const entry = index.scripts?.find((item) => item.slug === "woek-g-v33");
if (!entry) throw new Error("V33 fehlt im Studienskript-Index.");
entry.notes = "Studienskript V1 mit methodischer Aktualisierung: NWI als Profil, IOI und T-SROI als getrennte Euro-Rechnungen mit Schutz-Gate.";
fs.writeFileSync(INDEX, `${JSON.stringify(index, null, 2)}\n`, "utf8");

console.log("V33 auf den T-SROI-Rechenstandard v1.1 und öffentliche Lernsprache aktualisiert.");
