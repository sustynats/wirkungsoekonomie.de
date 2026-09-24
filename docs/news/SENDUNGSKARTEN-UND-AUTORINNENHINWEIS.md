# Sendungskarten und Autorinnenhinweis

Stand: 24.09.2026. Gemeinsame Darstellung fuer bestehende und neue Beitraege;
keine Aenderung freigegebener Manuskripte, Bewertungen oder Publikationsdaten.

## Sendungskennung

`scripts/news/show-identity.mjs` bleibt der einzige Renderer. Ein geliefertes,
gueltig freigegebenes Logo wird unveraendert, proportional und mit seinem Credit
verwendet. Rechtepruefung, Dateipruefsumme und Verwendungskontext bleiben erhalten.

Ohne nutzbares Logo entsteht eine eigene textliche WÖk-Sendungskarte:
Nachgesehen/Nachgehoert, grosser Sendungsname, Originalfolgentitel und originales
Sendungsdatum aus `source_media`. Fehlende Daten werden nicht aus Publikations-
oder Importdaten ersetzt. Keine Ladeanzeige, kein unechter Abspielknopf, kein
generiertes Fremdlogo oder Foto. Unbekannte Reihen erhalten einen deterministischen
eigenen Farbakzent. Lange Namen umbrechen auch auf schmalen Karten.

## Persoenlich kuratierte Analysefamilie

`scripts/news/editorial-authorship.mjs` liefert den gemeinsamen Hinweis fuer
Meinung & Analyse, Buch & Wirkung, Nachgehoert und Nachgesehen. Er erscheint in
der Autorinnenzeile der Karten und ausfuehrlich bei den Metadaten der Detailseite.
Die Analyseuebersicht nennt denselben redaktionellen Verantwortungsrahmen.

Themenauswahl, persoenliche Einordnung und redaktionelle Verantwortung liegen bei
Natalie Weber. Fakten, Analyse und Meinung bleiben unterscheidbar. Der Hinweis
behauptet weder KI-Freiheit noch ausschliesslich handgeschriebene Texte. Die
aufklappbare Arbeitsweise erlaeutert moegliche KI-Unterstuetzung.

Eine ausdrueckliche Einzel-Freigabe wird nur fuer die von den bestehenden
Publikationsadaptern validierten veroeffentlichten Fassungen ausgegeben:
`approved_editorial` mit Inhalts-Hash, freigegebene manuelle Buchmanuskripte oder
eine freigegebene versionierte Ueberarbeitung. Ein Auftrag, ein historischer
Autorenname oder `commissioned_review` allein reichen dafuer nicht.

Autopilot, Freigabelogik, private Vorschauen, Bildrechte und Inhaltshashes werden
durch diese Darstellungsanpassung nicht veraendert.
