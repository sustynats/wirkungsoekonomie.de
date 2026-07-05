# Self-gehostete Webfonts (DSGVO-konform)

Diese Schriften werden lokal ausgeliefert (`assets/css/style.css`, `@font-face`),
damit zur Laufzeit **keine** Verbindung zu Google-Servern (fonts.googleapis.com /
fonts.gstatic.com) aufgebaut wird.

## Enthaltene Familien (woff2, Latin-Subsets)

| Familie          | Dateien                                   | Verwendung                          |
|------------------|-------------------------------------------|-------------------------------------|
| Playfair Display | playfair-display-500/600/700              | Überschriften (`--font-heading`)    |
| Source Sans 3    | source-sans-3-400/500/600/700             | Fließtext (`--font-body`)           |
| Source Serif 4   | source-serif-4-400/400-italic/600/700     | Serif-Fallback/ältere Deklarationen |
| Inter            | inter-400/500/600/700                     | Sans-Fallback/ältere Deklarationen  |

## Lizenz

Alle vier Familien stehen unter der **SIL Open Font License 1.1 (OFL)**:
<https://openfontlicense.org>

Die OFL erlaubt Nutzung, Einbettung, Bündelung und Weitergabe der Fonts
(auch kommerziell); die Fonts selbst dürfen nicht einzeln verkauft werden.
Copyright verbleibt bei den jeweiligen Urhebern:

- Playfair Display — Copyright 2017 The Playfair Display Project Authors
  (https://github.com/clauseggers/Playfair-Display)
- Source Sans 3 — Copyright 2010-2024 Adobe (https://github.com/adobe-fonts/source-sans)
- Source Serif 4 — Copyright 2014-2024 Adobe (https://github.com/adobe-fonts/source-serif)
- Inter — Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)

## Quelle

Die woff2-Dateien wurden über die Google-Fonts-API bezogen
(https://fonts.google.com, Download der gstatic-woff2-Dateien) und werden
seitdem ausschließlich von der eigenen Domain ausgeliefert.
