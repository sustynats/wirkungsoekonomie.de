# Detailkonzept- und Dossier-Sanierung

Dieses Verzeichnis enthält die interne Arbeitsgrundlage für die Sanierung der Detailkonzepte und Einzeldossiers.

Öffentliche Inhalte bleiben Publikationsinhalte. Technische Arbeitsanweisungen, Umsetzungsnotizen und Qualitätsregister werden nicht als Website-Inhalt ausgegeben.

## Standard

Ein Detailkonzept gilt erst dann als vollständig, wenn es als Online-Volltext und Download vorliegt, keine internen Umsetzungsnotizen enthält und inhaltlich die vereinbarte Langform erreicht.

Ein Dossier gilt erst dann als vollständig, wenn es als anwendungsnahe Online-Fassung und Download vorliegt, mindestens ein Beispiel oder Anwendungsszenario enthält und die Bewertungs-, Daten- oder Umsetzungslogik nachvollziehbar macht.

## Dateien

- `source/sanierungsmatrix_raenge_0_bis_13_v1_0.csv`: Arbeitsliste aller Ränge und Unterbereiche.
- `source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.docx`: Referenzstandard für Umfang und Struktur.
- `source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.pdf`: gerenderte Referenzfassung aus dem Startpaket.

## Statusregister

Das Statusregister wird über `npm run sanierung:status` erzeugt:

`data/content_quality/detaildossier_sanierung_status.json`

Es ist ein internes Qualitätsregister. Keine öffentliche Seite darf allein deshalb als vollständig gelten, weil eine Kurzfassung, ein Sammeldownload oder ein Platzhalter existiert.
