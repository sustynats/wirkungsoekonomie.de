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

## Ergänzung vom 9. September 2026: Wirkungsticker

Nachrichten und eigenständige Beiträge unter `/wirkungsticker/analyse/`
erhalten jetzt eine eigene, aus den öffentlichen Seitenmetadaten abgeleitete
Linkkarte. Sie zeigt den aktuellen Titel, die Rubrik und bei Autorenbeiträgen
die Autorin. Die Analyse übernimmt nicht die Karte ihrer Ursprungsmeldung.
Inhaltsbilder und bereits veröffentlichte Illustrationen bleiben unverändert.
Die kleine Vorschau ist eine Titelkarte, keine verkürzte MPD-Bewertung.

`scripts/news/share-image.mjs` verwendet vorhandene Markenfarben, Schriftmaße,
eingebettete Fonts und Line-Icons. Eine Änderung an Titel oder Rubrik ergibt
eine neue Bildadresse. Routinezeitstempel allein erzeugen keine neue Grafik.
OpenGraph, Twitter und JSON-LD nennen dasselbe absolute HTTPS-JPEG
(1200 x 630 Pixel, geprüft unter 5 MB). Die Metadaten stehen im HTML-Kopf;
Crawler müssen dafür kein JavaScript ausführen und keine Anmeldung verwenden.

Die JPEGs werden als kleine Website-Assets im vorhandenen Pages-Artefakt
erzeugt, nicht als neue persistente Nutzerdaten oder große Publikationsdownloads.
`build-public-artifact.mjs` führt dies sowohl bei regulären als auch bei
Ticker-Releases aus. Der isolierte Chrome-Rasterizer verarbeitet maximal
40 Karten je Browserinstanz, ohne externe Downloads, KI-API oder Vercel.
Gültige vorhandene JPEGs werden bei wiederholtem Aufruf wiederverwendet.
Vor Deployment werden Dateiformat, Maße, Größe und Metadatenzuordnung geprüft.

Ein manueller Test kann die HTML-Metadaten und das öffentlich abrufbare JPEG
prüfen. Eine tatsächliche Plattformvorschau ist davon zu unterscheiden:
LinkedIn entscheidet über Anzeige und Cache. Für alte Links kann der
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) einen neuen
Abruf anstoßen; bereits angelegte Posts werden dadurch nicht garantiert geändert.
Die technische Auslegung folgt den
[LinkedIn-Vorgaben](https://www.linkedin.com/help/linkedin/answer/a521928/making-your-website-shareable-on-linkedin?lang=en).
