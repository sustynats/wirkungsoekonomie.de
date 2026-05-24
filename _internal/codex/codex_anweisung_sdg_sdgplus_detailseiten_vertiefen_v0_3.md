Du arbeitest im Repository der bestehenden Website www.wirkungsoekonomie.de.

Ziel dieses Auftrags:
Die Seite /verstehen/sdgs-sdgplus/ und alle zugehörigen SDG-/SDG+-Detailseiten sind fachlich zu vertiefen. Die aktuelle Seite ist als Übersicht geeignet, aber die Beschreibungen der 17 Ziele, der Unterziele, des Europa-/Deutschland-Bezugs und der wirkungsökonomischen Bedeutung sind zu oberflächlich. Bitte baue daraus einen belastbaren Referenzbereich.

Wichtig:
- Keine neue Extra-Seite nur für SDG+ bauen. SDG+ bleibt Bestandteil der gemeinsamen SDG-/SDG+-Referenzseite.
- Öffentliche Website-Inhalte dürfen keine internen CodeX-, Repository- oder Umsetzungsanweisungen enthalten.
- PDFs/Word-Dokumente sind ergänzende Downloads; der vollständige Inhalt muss online lesbar sein.
- Wirkung ist neutral und relational. Positive Wirkung ist nur positive Netto-Wirkung im Referenzrahmen von SDGs, Agenda 2030 und SDG+ für Mensch, Planet und Demokratie.

1. Aktuellen Zustand prüfen
- Öffne /verstehen/sdgs-sdgplus/.
- Prüfe bestehende SDG-Chips, SDGRef-Komponente, Detailseiten/Anker, Glossarlinks und Suchindex.
- Erhalte bestehendes Design und URLs.
- Bestehende Links dürfen nicht brechen.

2. Neue Informationstiefe je SDG
Jede SDG-Detailseite braucht künftig diese Abschnitte:

A. Kurz erklärt
- offizieller globaler Zielraum in verständlicher deutscher Sprache.
- Hinweis: offizielle UN-Zielseite wird referenziert, aber lange UN-Texte nicht kopieren.

B. Globale Unterziele
- alle Unterziel-Codes des jeweiligen SDG listen, z. B. 4.1 bis 4.c.
- pro Unterziel: kurze Paraphrase, relevante Indikatorlogik, Link zur offiziellen UN-Zielseite oder UN-Indicators-Liste.
- keine Unterziele erfinden.

C. Europa-/Deutschland-Bezug
- ableiten, was dieses Unterziel konkret für Deutschland und Europa bedeutet.
- relevante Bereiche nennen: Destatis SDG-Indikatoren, DNS-Indikatoren, Eurostat SDG Monitoring, EU-Rechtsrahmen, nationale Politikfelder.
- konkrete deutsche/europäische Problemfelder nennen, nicht nur allgemeine Sätze.

D. Wirkungsökonomische Bedeutung
- erklären, welche Zustandsveränderungen im Sinne der Wirkungsökonomie relevant sind.
- Bezug zu Mensch, Planet und Demokratie herstellen.
- negative Wirkungen, Wirkungsrisiken, Nebenwirkungen und Rückkopplungen benennen.
- erklären, wie das SDG in Preise, Steuern, Kapitalzugang, Beschaffung, Haushalt, Bildung, Recht oder Medien zurückwirken könnte.

E. WÖk-ID-/Indikatorenbezug
- relevante WÖk-ID-Familien anzeigen, wenn Daten verfügbar sind.
- mindestens Indikatorfamilien nennen.
- falls die WÖk Master Items maschinenlesbar sind, nach SDG/SDG+ filtern und anzeigen.
- falls nicht maschinenlesbar, vorhandenes Dokument verlinken und Tabelle später ergänzbar machen.

F. Relevante Wirkungsfelder und Werkzeuge
- auf passende Portale und Werkzeuge verlinken.
- Beispiele: SDG 12 -> Produkte & Konsum, Wirkungsumsatzsteuer, Scorecards, WÖk-IDs, Reverse Merit Order.

G. Politische Anschlussfähigkeit
- je SDG einen Abschnitt mit Aufgabe der Politik, Rahmenbedingungen, Ausgestaltungsspielraum, Zielkonflikten, Rollenverteilung, Übergang/Schutz, Evaluation/Korrektur.
- Keine Partei bewerten. Es geht um demokratischen Umsetzungsspielraum.

H. Offizielle Referenzen
- UN SDG Goals: https://sdgs.un.org/goals
- UN Statistics Global Indicator Framework: https://unstats.un.org/sdgs/indicators/indicators-list/
- Destatis SDG-Indikatoren Deutschland: https://sdg-indikatoren.de/
- Destatis Nachhaltigkeitsindikatoren: https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html
- Eurostat SDG Monitoring: https://ec.europa.eu/eurostat/web/sdi

3. Datenmatrix nutzen
Nutze die Datei data/sdg_detail_matrix_v0_3.json als Startmatrix für:
- Zielbeschreibungen,
- Unterziel-Paraphrasen,
- Europa-/Deutschland-Bezug,
- wirkungsökonomische Bedeutung,
- WÖk-ID-/Indikatorfamilien,
- relevante Portale.

Die Matrix ist redaktioneller Startinhalt. Bitte fachlich sauber in Website-HTML/Markdown übertragen und vorhandene Komponenten verwenden.

4. SDGRef und Hover/Fokus/Tap
- Jeder SDG-Chip bleibt interaktiv.
- Hover/Fokus/Tap zeigt weiterhin Kurzbeschreibung.
- Zusätzlich soll klar sichtbar sein: Details öffnen.
- Detailseiten enthalten die Langfassung.
- Hover allein reicht nicht; mobile und Tastaturnutzung beachten.

5. SDG+ vertiefen, aber nicht trennen
SDG+ bleibt im selben Referenzrahmen. Für jede SDG+-Dimension ergänzen:
- Definition,
- warum sie nötig ist,
- Anschluss an offizielle SDGs,
- Unterdimensionen,
- mögliche Indikator-/WÖk-ID-Familien,
- relevante Wirkungsfelder,
- rote Linien,
- politische Anschlussfähigkeit.

Pflichthinweis:
SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.

6. Glossar aktualisieren
Glossareinträge verlinken:
- SDG / SDGs -> /verstehen/sdgs-sdgplus/
- Agenda 2030 -> /verstehen/sdgs-sdgplus/
- SDG+ -> /verstehen/sdgs-sdgplus/#sdgplus
- WÖk-ID -> /werkzeuge/woek-ids/
- positive Netto-Wirkung -> Begriffsleitfaden + SDG-/SDG+-Referenzrahmen

7. Online-Dokumente und Downloads
- Das neue Vertiefungskonzept als Download verlinken.
- Der Inhalt muss zusätzlich online lesbar sein.
- Kein Abschnitt darf nur mit „PDF herunterladen“ enden.
- Druckbutton und Print-CSS beibehalten/ergänzen.

8. Keine internen Anweisungen veröffentlichen
Die CodeX-Anweisung bleibt intern. Website, Dossiers und Konzeptpapiere enthalten keine Hinweise wie „prüfe Repository“, „baue Komponente“, „nutze Datei X“.

9. Mindestlieferung
- /verstehen/sdgs-sdgplus/ mit vertiefter Übersicht.
- 17 SDG-Detailseiten oder stabile Ankerbereiche mit allen Unterzielen.
- SDG+-Abschnitt mit allen Dimensionen vertieft.
- SDGRef-Komponenten aktualisiert.
- Glossarlinks aktualisiert.
- Datenmatrix eingebunden oder als redaktionelle Grundlage genutzt.
- Suchindex/Sitemap aktualisiert.
- Druckfunktion geprüft.
- Abschlussbericht mit geänderten Dateien und offenen Punkten.