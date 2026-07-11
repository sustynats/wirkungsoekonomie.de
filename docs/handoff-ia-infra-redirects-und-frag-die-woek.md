# IA-Infra Handoff: Redirects und Frag die WOek

Stand: 2026-07-11

## Redirect-Mechanismus

### Dateien

- Kanonische Redirect-Map: `content/redirects/site-redirects.json`
- Generator: `scripts/site/build-redirects.mjs`
- Einzelbefehl: `npm run redirects:build`
- Build-Hook: `npm run build` fuehrt `scripts/site/build-redirects.mjs` nach dem Header-Sync aus.
- Hosting-Datei: `_redirects` wird generiert und vom Public-Artifact mitkopiert.

Der Generator baut zwei Dinge parallel:

- statische HTML-Redirect-Stubs fuer GitHub-Pages-/statische Deployments
- `_redirects` fuer Hostings, die native Redirect-Regeln auswerten

### Schema

Nur Eintraege mit `enabled: true` werden gebaut.

```json
{
  "from": "/wirkungssteuerung/",
  "to": "/wirkung-steuern/",
  "status": 301,
  "enabled": true,
  "replaceExisting": true,
  "allowMissingTarget": false,
  "title": "Wirkung steuern",
  "reason": "Die fruehere Rubrik Wirkungssteuerung wurde mit Praxis & Tools zusammengefuehrt."
}
```

Felder:

- `from`: alte interne URL, absolut oder relativ zur Domain
- `to`: neue interne Ziel-URL
- `status`: 301, 302, 307 oder 308; Default 301
- `enabled`: nur `true` aktiviert den Redirect
- `replaceExisting`: `true` ist notwendig, wenn die alte Seite schon als HTML-Datei existiert und bewusst ersetzt werden soll
- `allowMissingTarget`: nur fuer gestaffelte PRs nutzen; normalerweise `false`
- `title` / `reason`: Text fuer den HTML-Fallback

### Rubrik-Fusionen

Die korrigierte IA-Map ist in `content/redirects/site-redirects.json` eingetragen und baut aktuell 9 Redirects:

- `/wirkungssteuerung/` -> `/wirkung-steuern/`
- `/werkzeuge/` -> `/wirkung-steuern/`
- `/praxis-tools/` -> `/wirkung-steuern/`
- `/praxis-und-tools/` -> `/wirkung-steuern/`
- `/tools/` -> `/wirkung-steuern/`
- `/oeffentlicher-wirkungsraum/` -> `/debatte-radar/`
- `/oeffentlichkeit/` -> `/debatte-radar/`
- `/debatte-und-radar/` -> `/debatte-radar/`
- `/radar/` -> `/debatte-radar/`

Wichtig fuer den Merge: Die neuen Zielseiten `/wirkung-steuern/` und `/debatte-radar/` muessen von Claudes IA-PR vor oder zusammen mit diesen Redirects live gehen. Bis dahin sind die Redirects technisch vorbereitet, aber sie duerfen nicht separat live geschaltet werden, weil sie sonst auf noch fehlende Zielseiten zeigen.

Wichtig: Wenn eine bestehende Rubrikseite ersetzt werden soll, muss der jeweilige Eintrag `replaceExisting: true` haben. Ohne dieses Flag bricht der Build bewusst ab, damit keine bestehende Seite versehentlich ueberschrieben wird.

## Frag die WOek: App + KI

### Aktueller technischer Stand

- `app/` ist bereits die installierbare PWA und enthaelt Tabs fuer:
  - Wirkungscheck
  - Frag die WOek
  - Produktcheck
- `woek-ki/` ist eine separate Beta-Seite mit eigener Inline-JavaScript-Logik fuer Fragen, Quellen, Fortschrittsanzeige und Feedback.
- Beide Einstiege sind heute im Header/Footer sichtbar und unter `Oeffentlicher Wirkungsraum` verortet.

### Einschätzung

Website-seitig kann Claude die Einstiege sofort zu einem einzigen Einstieg zusammenfuehren, z. B. `Frag die WOek` oder `WOek-App & KI`.

Technisch empfehle ich keine harte HTML-Zusammenkopie. Sauberer ist:

1. `app/` bleibt die kanonische PWA-Shell.
2. `woek-ki/` wird mittelfristig Alias/Redirect oder schlanke Landing-/Erklaerseite auf den KI-Tab der App.
3. Die KI-Logik aus `woek-ki/` wird in ein gemeinsames JS-Modul ausgelagert, z. B. `assets/js/woek-ai-client.js`.
4. `app/` nutzt dieses Modul fuer den Tab `Frag die WOek`.
5. Die Website-Navigation zeigt nur noch einen Einstieg; alte URLs bleiben per Redirect erreichbar.

### Risiko / Aufwand

- Sofort machbar: IA-/Navigationszusammenfuehrung, Copy, ein Einstieg in Header/Footer.
- Kleine technische Phase: gemeinsames JS-Modul fuer Frage, API, Quellen, Feedback.
- Danach: Redirect `woek-ki/` -> `app/#frag-die-woek` oder neue kanonische Zielroute.

Meine Empfehlung: Erst die Website-IA vereinheitlichen, dann App-Fusion technisch modularisieren. So bleibt die PWA stabil und die KI-Funktion wird nicht doppelt gepflegt.
