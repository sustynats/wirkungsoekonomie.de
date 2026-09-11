# Wirkungsticker: Suche und Filter

Stand: 12.09.2026

## Ursachen

- Die globale mobile `.btn`-Breite beanspruchte im Suchformular fast die gesamte Zeile. Bei 390 Pixeln blieben 21 Pixel für das Eingabefeld.
- Die Suche hatte Format-Chips, aber keinen sichtbaren Zugang zu allen Filtern und keinen kombinierten Ressortfilter.
- Der Suchindex enthielt nur Titel, Teaser und wenige Metadaten. Veröffentlichter Artikeltext, Gäste, Buchautoren und Quellenbezeichnungen fehlten.
- Alle Suchwörter mussten vorkommen, einschließlich Verbindungswörtern wie „und“. Zwei-Buchstaben-Präfixe ließen „KI“ zugleich auf „Kinder“ und „Kiew“ passen.
- Die allgemeine Speicherung bei Link-Klicks konnte während eines Filterwechsels einen noch leeren Feed unter der neuen URL zwischenspeichern.

## Änderungen

Das Suchformular verwendet eine feste 48-Pixel-Suchschaltfläche neben einem flexiblen Eingabefeld. Schriftgröße mindestens 16 Pixel verhindert den typischen iPhone-Fokuszoom. Die App berücksichtigt obere und untere Safe Areas.

Ein dauerhaft erreichbarer Filterknopf öffnet auf News, Analysen, Suche und Merkzettel die verfügbaren Ressorts, Formate und Ansichten. In der Suche kann zusätzlich zwischen Passung und Aktualität gewählt werden. Format und Ressort lassen sich kombinieren. Aktive Filter werden gezählt, alle Optionen sind auch ohne horizontales Wischen erreichbar. Escape und Klick außerhalb schließen das Menü. Suchbegriff und Filter stehen in der URL.

Eine gemeinsame Suchlogik für Generator und Browser behandelt deutsche Schreibweisen, sinnvolle Wortpräfixe, KI/AI und Verbindungswörter. Kurze Abkürzungen werden nicht auf beliebige längere Wörter erweitert. Titelübereinstimmungen stehen vor bloßen Texttreffern; bei gleicher Passung entscheidet Aktualität.

Der Index enthält ausschließlich veröffentlichte Inhalte und ausgewählte öffentliche Quellen-/Sendungsmetadaten. Redaktionskommentare, Freigabedaten, interne Gates und private Notizen werden nicht indiziert. Persönliche Beiträge ohne Ressort-Tags erhalten eine Navigationszuordnung aus ihrem öffentlichen Titel und Untertitel; bestehende fachliche Bewertungen bleiben unverändert.

Keine externe Suchplattform, kein KI-Aufruf und keine neue Infrastruktur. Der vorhandene statische Index bleibt in 128 Dateien aufgeteilt. Abgerufen werden nur die zum Suchbegriff gehörenden Teile und jeweils bis zu 20 Trefferkarten. Die kompakte Zuordnung aller veröffentlichten IDs umfasst rund 79 KB; eine Indexdatei maximal rund 100 KB im getesteten Bestand. Artikelvolltexte werden zur Suche nicht vollständig heruntergeladen.

## Prüfung

- Neue automatisierte Tests für Wortverbindungen, Abkürzungen, Umlaute, Rangfolge, kombinierte Filter, begrenzte Indexabrufe und Ausschluss interner Felder.
- Vorhandene Tests für verspätete Antworten, wechselnde Publikationsstände und Wiederholungsfehler bleiben erhalten; zusätzlicher Test für Zurück-Navigation mit bereits geladenen Seiten.
- Browser: Illner + Nachgesehen + Politik; Goepel/Göpel; KI und Arbeit; 20 → 40 Wirtschaftsbeiträge; Wechsel zu Technik und Zurück; Eingabe mit Leerzeichen während der Suche.
- Bei 390 Pixeln: 310 Pixel Suchfeld. Bei 320 Pixeln: 240 Pixel Suchfeld. Keine horizontale Seitenüberbreite.
- Physisches iPhone/PWA und VoiceOver wurden nicht direkt getestet; Safe-Area-Regeln, 16-Pixel-Eingabeschrift und Bedienelemente ab 44 Pixeln sind umgesetzt.

Eine Suche kann nur veröffentlichte Beiträge finden. Noch nicht freigegebene Redaktionspakete und unpublizierte Nachrichten werden dadurch nicht öffentlich.
