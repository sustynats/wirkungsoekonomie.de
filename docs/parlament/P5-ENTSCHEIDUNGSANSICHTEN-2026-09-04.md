# P5 — Einzelakten in drei Tiefen

Frische, saubere Ausgangsbasis: `5ae5af8fed34fd8916c9e3f26934bdc696ac6dc0`. Kein Import aus einem alten oder fremden Arbeitsbaum. P1–P4 sind gemergt; P5 verändert keine Fach-, Quellen-, Bewertungs- oder Release-Daten.

Vor PR-Eröffnung erneut gegen den frischen P23-Merge `30c5ae2e1ec7e2d0eb31e5c2af441e1b59c8eeb9` integriert. Die P23-Fachmaterialisierung aus #369 bleibt unverändert geschützt.

## Umsetzung und Textumzug

| Bisherige Ansicht / Abschnitt | Vollständiges neues Zuhause |
| --- | --- |
| Amtlicher Titel, Worum geht es, Entscheidungsreife, Problem Review, Goal Review, Begriffe | Sachverhalt |
| Wirkungssignatur mit allen Hinweisen, Executive Summary / Overview Assessment, Public Maturity, vollständige Einordnung | Wirkungsanalyse |
| Wirkprofil, alle Wirkpfade, alle SDG-/SDG+- und Rechtszuordnungen, Recommendation und Optionsvergleich | Wirkungsanalyse |
| Rechenansätze, Eingaben, Datenlücken, Schutzgates, Gegenfaktum, Gegenargumente, Rückkopplung, offene Prüffragen | Evidenz & Grenzen |
| Quellenregister mit Herausgeber, Abrufdatum, Fassung und Quellendetails | Quellen |
| Versionshinweis und spätere Wirkungsbeobachtung | Verlauf |
| CompletePublicationSource / FullReviewRecord einschließlich Rohtext und Hashes | Tier 3: „Rechenweg, Annahmen und Versionsstand öffnen“ |
| Politischer Prozess und sämtliche bisherigen Prüfstatus-Felder | Seitenspalte, ab 960 px sticky |

Die sieben alten `ansicht`-Werte bleiben als Aliase erreichbar. `fachakte` öffnet die vollständige Transparenzakte direkt. Alte Abschnitts-/Wirkpfad-Fragmente öffnen die zugehörige Ansicht und nötige Aufklapper. Reguläre Reiterwechsel verändern die Scrollposition nicht; SamePageNavigation und dessen bytegebundener Regressionstest bleiben unverändert. `/entscheidungen/[slug]` bleibt kanonisch.

Vor dem Umbau wurden alle 28 veröffentlichten Akten in allen sieben alten Ansichten gerendert (196 Ansichten; Basis `9444c33f5306ffb97ca042b2551317acf3c81b53`, P4-Code). Der vollständige Absatzabgleich umfasst **insgesamt 9.457 Passagen, innerhalb jeder Akte dedupliziert; 0 fehlend**. Die eingefrorene Baseline liegt komprimiert unter `ux/p5-text-baseline-2026-09-04.json.gz`, ausschließlich im GitHub-Auditbestand, nicht im minimalen Runtime-Artefakt. Dekomprimierte SHA-256: `13330a92316cb911dfc9ffe2a037afa803d3895510e2fc4b3eaa663ce1b00c7f`. Die GitHub-Browserprüfung reproduziert jede alte Passage gegen die gerenderte neue Akte und protokolliert deren konkretes Ziel in `decision-text-preservation.json`. Zusätzlich reproduziert das bestehende AST-Textinventar jeden statischen Textumzug im GitHub-Preview-Artefakt. Die vollständigen Fachdatensätze bleiben unverändert; alle 17.033 B07-Inhaltspfade bleiben gerendert.

## Lesemodus ohne neue Fachtexte

Der Zustand wird ausschließlich lokal unter `woek.decision-reader.v1` gespeichert, ohne Netzwerkzugriff. Die Anzeige verwendet vorhandene Datensatzfelder: `plainTitle` / `title`, redaktionelles `editorialSummary.keyStatement` / ursprüngliches `overallPotential` desselben Falles. Kein Wort dieser Fassungen wird umgeschrieben. Wo die alte Potential-Zeile nur generische Prozessbeschreibung enthält, bleibt auch im Fachmodus die bereits freigegebene redaktionelle Fassung stehen. Es wird keine zweite Fachfassung erfunden.

Alle vollständigen Befunde, Evidenzgrenzen, Einschränkungen, Risiken und Rechenwege sind in beiden Modi identisch erreichbar. Der Browservergleich prüft ausdrücklich, dass der gesamte Tier-2/Tier-3-Text beim Umschalten unverändert bleibt. Lesemodus ist weder ein zweites Urteil noch eine Verkürzung der Fachakte.

## Nicht schätzbare Anzeigen gemäß §7

Die Komponenten sind implementiert und fail-closed getestet. Fehlende strukturierte Nachweise werden nicht aus Fließtext, Datumsfeldern oder Analysefortschritt hergeleitet:

| Anzeige | Exakt benötigte strukturierte Eingabe | Aktueller Umgang |
| --- | --- | --- |
| Prüffragen-Ring | Pro konkreter Frage stabile ID, Frage, ausdrücklich `ANSWERED`/`OPEN`, Quellenbindung der Antwort | Bestehendes `questions: string[]` ist keine Antwortprüfung. Kein erfundener 0/n-Ring; Kennzahl nicht angezeigt. Alle bisherigen Fragen bleiben im Text. |
| Amtlicher Verfahrens-Stepper | Pro Schritt stabile ID, amtlicher Verfahrensschritt, tatsächliches Ereignisdatum und amtlicher Beleg; künftige Schritte ohne Datum | `lastUpdated` ist kein amtliches Ereignisdatum. Kein erfundener Zeitstrahl; bestehender parlamentarischer Status bleibt sichtbar. |
| Belegstatus der vier Kettenglieder | Ausdrücklich stufengebundene Aussage und Evidenzlabel mit Quellenreferenz je Entscheidung/Umsetzung/Zustandsveränderung/Zurechnung | „Separater Belegstand offen“ bezeichnet ausschließlich die fehlende separate Projektionsbindung, nicht die Nicht-Existenz von Quellen oder die Nicht-Prüfung des Falles. Die vollständige Fallprüfung bleibt direkt darunter. |
| Vierstufiger Evidenzgrad | Freigegebene ordinale Zuordnung, nicht aus HIGH/MEDIUM/LOW oder Text geraten | Bestehende P2-Regel unverändert: „Nicht eingestuft“, nicht Stufe null. |

Diese Anzeigen sind keine Aufforderung, bereits vorliegende Fachurteile neu zu verfassen. Vorhandene Angaben werden nicht als fehlende Fachprüfung deklariert. SDGs 1–17 bleiben sichtbar; „nicht zugeordnet“ bedeutet ausdrücklich nicht „unberührt“. SDG+-Felder und Rechtsbezüge stammen ausschließlich aus den bestehenden Zuordnungen; Recht bleibt eine eigene Ebene.

## Prüfungen und Release-Grenze

Die P5-Browserprüfung umfasst jede veröffentlichte kanonische Einzelakte bei 320/360/375/390/428/1440 px, alle fünf Ansichten mit automatisierter WCAG-Prüfung, Tastatur, gespeicherten Lesemodus, unveränderte Substanz und alte Transparenz-Direktlinks. Hinzu kommen der vollständige Portal-Smoke, SamePage/Back/Forward/Fokus, neutrale typisierte Projektionen, Textinventar, Tests, Typecheck, Lint, Privacy und Produktionsbuild mit B07 Source-vs-View. Konkrete exact-head-/PR-/Merge-Belege werden nach Abschluss in GitHub ergänzt, nicht vorweggenommen.

Kein Vercel-Build, keine Reservierung, keine Preview auf Vercel, kein Deployment, keine Promotion. Die Preview ist ein commitgebundenes GitHub-Actions-Prüfarbeitsprodukt. P5 ist kein Fachabschluss Berlin/MV und keine Freigabe, den weiterhin gesperrten Runtime-Release-Controller zu umgehen.
