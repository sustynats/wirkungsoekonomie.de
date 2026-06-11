# Audio-Audit: Wirkung politischer Sprache

## Eingebundene Audiodatei

- Quelle: `/Users/hagen/Downloads/sprache-esv2-81p-bg-10p-music-10p.wav`
- Zielpfad: `/assets/audio/wirkung-politischer-sprache.mp3`
- Format: WAV
- MIME-Type im Player: `audio/mpeg`

## Seite und Position

- Seite: `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- Platzierung: direkt nach dem Hero / Einführungstext und vor dem Abschnitt `Faktencheck vs. Wirkungsanalyse`
- Audio-Titel: `Warum politische Sprache Wirkung erzeugt`
- Player-Label: `Anhören: Warum politische Sprache Wirkung erzeugt`

## Verhalten

- Autoplay ist deaktiviert.
- Der Player nutzt native Browser-Controls.
- `preload="metadata"` ist gesetzt.
- Die echte Audiodatei wird auf dieser Seite priorisiert; es wird kein gleichrangiger Browser-TTS-Player daneben angezeigt.

## Barrierefreiheit

- Der Audio-Player hat ein sichtbares Label.
- `aria-label="Audio-Einführung: Warum politische Sprache Wirkung erzeugt"` ist gesetzt.
- Das Transkript ist als ausklappbarer `details`-Bereich eingebunden.
- Die Bedienung erfolgt über native, tastaturbedienbare Controls.
- Es gibt keine reine Icon-Bedienung.

## Transkript

- Das vollständige Transkript wurde unter dem Player eingebunden.
- Der Ausklappbereich trägt den Titel `Transkript: Warum politische Sprache Wirkung erzeugt`.

## Mobile

- Der Player steht im normalen Dokumentfluss.
- Es gibt keinen Sticky-Player und keine horizontale Scroll-Abhängigkeit.
- Die vorhandene Audio-Komponente ist auf `width: min(100%, 620px)` begrenzt und bleibt mobil innerhalb des Viewports.

## Strukturierte Daten

- Die Seite enthält ein `AudioObject` im JSON-LD:
  - `name`: `Warum politische Sprache Wirkung erzeugt`
  - `contentUrl`: `https://wirkungsoekonomie.de/assets/audio/wirkung-politischer-sprache.mp3`
  - `encodingFormat`: `audio/mpeg`
  - `inLanguage`: `de`

## Offene Punkte

- Falls später eine kleinere Datei gewünscht ist, kann die WAV-Datei zusätzlich als MP3 oder M4A exportiert werden.
- Ein Browser-TTS-Fallback ist nicht prominent eingebaut, weil die echte Audiodatei vorhanden ist und die Website aktuell keine zentrale TTS-Komponente verwendet.
