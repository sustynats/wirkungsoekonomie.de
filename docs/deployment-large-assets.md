# Deployment-Standard fuer grosse Medienassets

Stand: 2026-06-18

## Grundregel

Grosse oeffentliche Audio- und Video-Dateien werden nicht mehr im normalen Website-Deploy versioniert, wenn sie als stabile Medienquelle dienen. Sie werden als GitHub-Release-Assets veroeffentlicht und in Website, RSS-Feeds oder Playern ueber die Release-URL referenziert.

Das gilt besonders fuer:

- Podcast-Audio
- lange Erklaervideos
- Videodateien fuer externe Player oder YouTube-Vorbereitung
- wiederverwendbare Medien, die selten geaendert werden

Weiter lokal im Repository bleiben duerfen:

- HTML, CSS, JavaScript, JSON und Content-Dateien
- Cover, Poster und kleine Bildassets
- kleine Demo-Medien, wenn sie fuer Layout oder Offline-Preview sinnvoll sind
- bestehende eingebundene Kurzvideos bis zur naechsten geplanten Medienmigration

## Aktueller Release

Podcast-Audio liegt ab jetzt im Release:

`woek-podcast-audio-v1`

Basis-URL:

`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-podcast-audio-v1/`

Die Podcast-Episoden referenzieren die Audiodateien in `assets/data/podcast-index.json` ueber:

- `audio`
- `audioStorage`
- `audioRelease`
- `audioAsset`
- `audioBytes`
- `durationSeconds`

Der RSS-Feed `feeds/podcast.xml` nutzt daraus die `enclosure`-URLs.

## Standardprozess fuer neue Podcast-Folgen

1. MP3 finalisieren und Dateinamen stabil vergeben, z. B. `podcast-folge-004-titel.mp3`.
2. Datei in den passenden GitHub Release hochladen:

   ```bash
   gh release upload woek-podcast-audio-v1 /pfad/zur/datei.mp3 --repo sustynats/wirkungsoekonomie.de --clobber
   ```

3. `assets/data/podcast-index.json` aktualisieren:

   - `audio` = vollstaendige GitHub-Release-URL
   - `audioStorage` = `github-release`
   - `audioRelease` = Release-Tag
   - `audioAsset` = Asset-Dateiname
   - `audioBytes` = Dateigroesse in Bytes
   - `durationSeconds` = Laufzeit in Sekunden

4. Podcast-Seiten und RSS neu bauen:

   ```bash
   npm run podcast:build
   node scripts/feeds/build-rss-feeds.mjs
   npm run check:release-assets
   ```

5. Live deployen und pruefen:

   - `https://wirkungsoekonomie.de/podcast/`
   - `https://wirkungsoekonomie.de/feeds/podcast.xml`
   - mindestens eine `enclosure`-URL per `curl -I -L`

## Standardprozess fuer neue Videos

Neue oder laengere Videos werden bevorzugt als GitHub-Release-Assets publiziert. Im Repository bleiben dann Posterbild, Beschreibung, Transkript und Einbindung. Die MP4-Datei selbst wird ueber eine stabile Release-URL referenziert.

Bestehende Kurzvideos unter `assets/video/` bleiben vorerst lokal, solange sie unter 20 MB liegen und direkt in Seiten eingebunden sind. Eine spaetere Sammelmigration kann sie in ein Video-Release verschieben.

## Build-Gate

`npm run check:release-assets` prueft:

- veroeffentlichte Podcast-Episoden verwenden GitHub-Release-URLs
- Podcast-Audiodateien liegen nicht mehr lokal unter `assets/audio/podcast/`
- MP4-Dateien unter `assets/video/` bleiben unter 20 MB

Der Check ist Teil des normalen `npm run build`.
