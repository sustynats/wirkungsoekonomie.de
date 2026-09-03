# CodeX – Änderungsbericht „Perfekter Livegang“

Stand: 19. August 2026  
Ausgangscommit: `23129c81d8da8bcaf21923684571bdd0ca2a0c72`  
Ziel: neuer, ausschließlich auf Staging zu prüfender Release Candidate

## Ergebnis

Der öffentliche Portalstand ist technisch und gestalterisch für den externen WÖk-Endaudit vorbereitet. Production wurde nicht verändert. Die wiederkehrenden Writer und der Newsletter bleiben während des Audits deaktiviert.

## P0-A – Regierungsakten ohne Laufzeitabbruch

- Strukturierte amtliche Kennungen werden nicht mehr als React-Children gerendert.
- Ein zentraler, typisierter Renderer bildet DIP-Dokumente sowie Kabinetts-/Tagesordnungskontexte in lesbare öffentliche Angaben ab.
- Unbekannte Objektformen werden fail-closed unterdrückt und können weder einen Objektdump noch einen Seitenabbruch erzeugen.
- Das Bestandsinventar umfasst 1.931 öffentliche GovernmentActions und 10.088 Kennungswerte in sechs unterstützten Formen; unbekannte Formen im aktuellen Public Store: 0.
- Die beiden bekannten Regressionen sowie zwei weitere strukturierte Akten liefern HTTP 200 ohne Console-, Page- oder React-Fehler.

## P0-B – WÖk-Kurzbewertung

- „WÖk-Kurzbewertung“ bleibt ein kleines Eyebrow-Label.
- Die fachliche Einordnung darunter ist ein semantischer Absatz, kein Heading.
- Sans-Serif, Gewicht 600, 18 px mobil und 20 px desktop, Zeilenhöhe 1,45.
- Kein Kürzen, keine Ellipse und keine fachliche Textänderung.

## UX-/UI-Verbesserungen

- Bewertungsicons werden ausschließlich aus strukturierten, freigegebenen Richtungswerten und expliziten Präsentationsmodi abgeleitet. Freitext-Heuristiken und ein Positiv-Standardfall wurden entfernt; unbekannte Werte bleiben nicht-direktional.
- `EU-IMPACT-2026-004` zeigt für seine gegenläufigen Potenziale und Risiken nun konsistent die ambivalente Pfad-Darstellung statt eines positiven Häkchens.
- Wirkungsanalyse, Quellen und – sofern vorhanden – Handlungsoption stehen auf Government- und EU-Detailseiten vor dem politischen Prozess.
- Detailseiten besitzen genau eine fachliche Hauptüberschrift; eingebettete Fachakten vermeiden Heading-Sprünge.
- Öffentliche Systemwerte werden nur mit freigegebenen Klartextzuordnungen gezeigt; unbekannte Werte bleiben ausgeblendet bzw. werden als offen markiert.
- Technische IDs, Hashes, Dateipfade und Schemawerte wurden aus nutzergerichteten Darstellungen entfernt.
- Amtliche Quellen bleiben über Quellen-Zwischenseiten erreichbar.
- Lange Fachbegriffe, Quellenangaben, Suchtreffer und Tabellen brechen auf kleinen Geräten kontrolliert um.
- Breite Transparenz- und Fachtabellen sind als tastaturfokussierbare Scrollregionen ausgezeichnet.
- Analytics sendet nur auf der Production-Domain; lokale und Preview-Audits bleiben frei von Cross-Origin-Fehlern.
- Die öffentliche K.-o.-Tropfen-Auditroute löst auf den kanonischen Parlamentsfall auf.

## Fachliche Integrität

WÖk-Richtung, Evidenz, Quellen, Fachtexte und Bewertungslogik wurden nicht neu erzeugt oder umgedeutet. Sechs fachlich freigegebene RecommendationRecords werden unverändert wiedergegeben. CodeX erzeugt keine Handlungsoptionen.

## Release-Empfehlung

`READY_FOR_EXTERNAL_WOEK_AUDIT`

Es bestehen keine bekannten P0- oder P1-Darstellungsfehler im geprüften Public Store. Zehn Government- und fünf EU-Fälle verbleiben entsprechend ihren bestehenden Objektgates außerhalb des fertigen öffentlichen Analysebestands; dies ist kein technischer Release-Blocker und wird nicht als Vollständigkeit ausgegeben. Der nachträgliche externe P0 zur Icon-Richtungssemantik wurde im neuen Kandidaten technisch behoben und in der vollständigen Browsermatrix regressionsgeprüft.
