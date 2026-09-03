import fs from "node:fs";

// These are public, current teaching scripts. Historical editions keep their
// historical formula as a clearly marked archive; a current study script must
// instead contain the same unit-safe standard as the calculators and the
// method paper. Replacing the whole two-section block is deliberate: partial
// wording changes would leave the retired multiplier logic next to the new
// formula.
const files = [
  "content/studienskripte/woek-g-v23.md",
  "content/studienskripte/woek-g-v31.md",
  "content/studienskripte/wirkungscontrolling-wc-v7.md",
];

const canonicalBlock = String.raw`### 34.1 Abgrenzung zu ROI, SROI, NWI, IOI und T-SROI

Diese fünf Kürzel beantworten fünf verschiedene Fragen. Sie sind keine Treppe, auf der aus einem Punkt automatisch ein Euro oder aus einem Euro automatisch Transformation wird.

| Werkzeug | Frage | Einheit | Wofür es nicht taugt |
| --- | --- | --- | --- |
| ROI | Rechnet sich das Kapital finanziell? | EUR/EUR | Wirkungen auf Mensch, Planet und Demokratie vollständig zu beschreiben. |
| SROI | Welcher soziale oder ökologische Nutzen wird in Geld geschätzt? | EUR/EUR | Systemgrenze, Schäden oder Doppelzählungen zu ersetzen. |
| NWI | Wie ist das dokumentierte Wirkungsprofil einzuordnen? | dimensionsloses Profil | Punkte in Euro umzuwandeln oder Menschen zu bewerten. |
| IOI | Wie viel direkter, kausal begrenzter Nettonutzen in Euro entsteht je Ressourceneuro? | EUR/EUR | Reichweite oder Datenqualität als Geldfaktor aufzuschlagen. |
| T-SROI | Wie verändert sich die Geldrechnung, wenn ein zusätzlicher Transformationsnutzen in Euro eigenständig belegt ist? | EUR/EUR | Hoffnung, Diffusion oder Resilienz ohne eigenen Nachweis zu vergolden. |

Der NWI ist ein nichtmonetäres Wirkungsprofil. Er macht positive, negative und offene Befunde auf einer vorher erklärten Skala sichtbar. Ein Schutz-Gate prüft dabei rote Linien, kritische Felder, Datenqualität, Systemgrenze und Zurechnung. Ist es geschlossen, lautet die Aussage nicht „null“, sondern „blockiert / nicht bewertbar“.

IOI und T-SROI sind dagegen Geldrechnungen. Sie verwenden ausschließlich Nutzen, Schäden, Investitionen und inkrementelle Kosten in Euro derselben Preis-, Zeit- und Systembasis. Sie teilen Schutzanforderungen mit dem NWI, übernehmen aber keinen NWI-Punkt in Zähler oder Nenner. Ein gutes Profil macht einen Eurobetrag nicht größer; es entscheidet mit darüber, ob eine positive Aussage verantwortbar ist.

Der T-SROI ist kein Multiplikator für „große Transformation“. Er ergänzt den IOI nur um einen zusätzlichen Nutzenstrom, der zum Beispiel aus einer nachweislich übernommenen Praxis oder einem dauerhaft geänderten Standard entstehen kann. Ohne eigenen Wirkpfad, Empfängerkreis, Vergleichsfall, Zeitraum, Preisbasis und Zurechnung bleibt das eine Transformationshypothese oder ein Wirkungsrisiko - kein Rechenaufschlag.

### 34.2 Die Arbeitslogik von NWI, IOI und T-SROI

Man kann sich drei Schubladen vorstellen. In die erste kommt das Wirkungsprofil. In die zweite kommen direkte, belegte Geldströme. In die dritte kommt nur zusätzlicher Transformationsnutzen, der ebenfalls als eigener Geldstrom belegt ist. Man darf die Schubladen nebeneinander benutzen, aber ihren Inhalt nicht vermischen.

Formelkasten 34-1: Aktueller Rechenstandard

Der NWI bleibt ein Profilwert bei offenem NWI-Schutz-Gate. Der IOI rechnet den direkten Nutzen:

$$
IOI = \frac{\sum_{t=1}^{T}\frac{B_{direkt,t}\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

Der T-SROI ergänzt ausschließlich den getrennt belegten Transformationsnutzen:

$$
T\text{-}SROI = \frac{\sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)-S_t}{(1+r)^t}}{\sum_{t=0}^{T}\frac{I_t+K_t}{(1+r_K)^t}}
$$

Dabei ist \(T\) eine ganze Zahl von Jahren mit \(T \geq 1\). Die Anfangsinvestition \(I_0\) liegt bei \(t=0\) und wird deshalb nicht abgezinst. \(B\) steht für Nutzen, \(S\) für Schaden, \(I\) für Investition und \(K\) für inkrementelle Kosten. \(a\) (Attribution), \(d\) (Counterfactual/Deadweight) und \(v\) (Verdrängung) begrenzen ausschließlich den beanspruchten Nutzen. Ein dokumentierter Schaden wird nicht still mitverkleinert; dafür bräuchte es eine eigene Gegenfaktik.

Für die vorsichtige Veröffentlichungsschwelle gilt zusätzlich:

$$
PV_N^L = \sum_{t=1}^{T}\frac{(B_{direkt,t}+B_{transformativ,t})\,a_t(1-d_t)(1-v_t)(1-u_t)-S_t}{(1+r)^t}
$$

\(u_t\) ist ein offengelegter konservativer Szenarioabschlag auf den beanspruchten Nutzen. Er reduziert nie den Schaden \(S_t\). Eine positive IOI- oder T-SROI-Aussage ist nur zulässig, wenn die Schutzprüfung offen ist, die Ressourcenbasis positiv ist und \(PV_N^L > 0\) bleibt. Fehlen wesentliche Angaben, ist das Ergebnis blockiert oder nicht bewertbar - nicht künstlich 0 und nicht positiv.

Ein kleines Rechenbeispiel: Im ersten Jahr entstehen 100 EUR direkter und 25 EUR separat belegter Transformationsnutzen. Attribution ist 1, Deadweight und Verdrängung sind 0, der Schaden beträgt 60 EUR, der Diskontsatz 5 Prozent und die Investition 50 EUR. Dann beträgt der T-SROI-Zähler \((100+25-60)/1{,}05 = 61{,}90\) EUR und der T-SROI \(61{,}90/50=1{,}24\) EUR/EUR. Bei einem Unsicherheitsabschlag von 20 Prozent lautet die Untergrenze \(((100+25)\cdot0{,}8-60)/1{,}05 = 38{,}10\) EUR. Der Schaden bleibt 60 EUR; genau das macht die Rechnung vorsichtig und nachvollziehbar.

Reichweite, Datenqualität, Resilienz, Diffusion und ein überzeugendes Narrativ können wichtige Hinweise sein. Sie sind aber keine frei wählbaren Multiplikatoren. Sie verbessern den Wirkpfad, die Evidenz oder die Entscheidung - einen Eurobetrag nur dann, wenn daraus ein eigener belegter Nutzenstrom in derselben Preisbasis entsteht.

`;

const start = "### 34.1 Abgrenzung zu ROI, SROI, NWI, IOI und T-SROI";
const end = "### 34.3 Transformation statt bloßer Projekt-Nutzen";

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const startIndex = original.indexOf(start);
  const endIndex = original.indexOf(end, startIndex);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`${file}: Abschnitt 34.1/34.2 nicht eindeutig gefunden.`);
  }
  const next = `${original.slice(0, startIndex)}${canonicalBlock}${original.slice(endIndex)}`;
  if (next !== original) fs.writeFileSync(file, next);
}

console.log(`Aktueller T-SROI-Rechenstandard in ${files.length} Studienskripten vereinheitlicht.`);
