# Vorschaubilder beim Teilen

Stand: 7. September 2026.

Die neutrale Markenkarte `assets/img/brand/wirkungsoekonomie-share-v2.png`
ersetzt das alte pauschale System-Schaubild in OpenGraph-/Twitter-Metadaten.
1200 x 630 Pixel, bestehendes Signet und lokal eingebettete Website-Schriften;
keine Artikel-Headline, keine inhaltliche Modellverkürzung, kein KI-Bilddienst.
Die PNG-Datei ist versioniert. Neu rendern bei bewusster Designänderung:
`node scripts/site/build-brand-share-image.mjs`. SVG und PNG gemeinsam prüfen.
Der vorhandene Chrome-Rasterizer wird nur für diesen expliziten Asset-Build
genutzt; normale Veröffentlichungen verwenden die fertige Datei.

`scripts/lib/share-metadata.mjs` wird vom gemeinsamen finalen
`normalize-public-content.mjs` aufgerufen. Damit gilt die Regel sowohl für
vollständige Pages-Releases als auch für schnelle Ticker-Veröffentlichungen,
ohne alte Generatoren oder historische Publikationstexte umzuschreiben:

- Eigene Artikel-, Umfrage-, Buch- und sonstige Titelbilder bleiben erhalten.
- Das bisherige generische PNG/WebP wird nur in den Share-Metadaten ersetzt.
- Fehlende Bildangaben bei vorhandenen Social-Metadaten erhalten den Fallback.
- Titel, Beschreibung und Canonical bleiben seitenbezogen unverändert.
- Abbildungen im Seiteninhalt und strukturierte Daten werden nicht umgeschrieben.
- Bildformat, Abmessungen und Alternativtext werden für die Markenkarte gesetzt.
- Reine Maschinenansichten ohne Social-Metadaten erhalten keine neuen Tags.

Neue Seiten sollten weiterhin ein passendes eigenes Vorschaubild wählen.
Die Markenkarte ist der Rückfallwert, kein Ersatz für individuelle Titelbilder.
Der bestehende RSS-Generator erkennt Bilder unter `assets/img/brand/` bereits
als generisch und zieht vorhandene eigene Beitragsbilder vor.

Die neue Bild-URL vermeidet einen veralteten Cache desselben Bildnamens.
Bereits veröffentlichte Posts können Plattform-Caches behalten. Das Löschen
fremder Caches oder das Ändern alter Social-Media-Beiträge ist nicht Teil des
Website-Deployments; eine sichtbare Aktualisierung lässt sich dort nicht erzwingen.
