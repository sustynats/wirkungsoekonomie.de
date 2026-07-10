# Handoff: WÖMS-Methoden-Registry und Canvas-Spezifikationen

Stand: 10. Juli 2026

## Ergebnis

Die Datenlane für WÖMS 2.0 ist als kanonische Single Source umgesetzt. Sie enthält ausschließlich aus der Referenzfassung extrahierte Methodenfakten und Feldspezifikationen. Narrative Methodenseiten, Praxisbeispiele, Visuals, Folien und Videos gehören nicht zu diesem Paket.

## Kanonische Dateien

- `content/methods/woems-methoden.json`: 152 Kernmethoden A01 bis P10 in 16 Kategorien.
- `content/methods/woems-canvas.json`: 152 methodenspezifische Canvas und 56 Anwendungs- und Realisierungs-Canvas.
- `content/methods/woems-methods.ts`: Typen und typisierte Imports; keine zweite Datenpflege.
- `content/methods/schema/woems-canvas-instance.schema.json`: Schema für ausgefüllte Canvas-Instanzen.
- `lib/woems/validate-canvas.mjs`: Mindeststandard und harte Nichtkompensationsregel.

## Methodenschema

Jede Methode enthält exakt:

```json
{
  "id": "F03",
  "kategorie": "F",
  "kategorieName": "Innovation, Angebote und Geschäftsmodelle",
  "name": "Wirkungsmodell-Canvas",
  "docxSeite": 138,
  "zweck": "...",
  "inputs": ["..."],
  "schritte": ["..."],
  "outputs": ["..."],
  "qualitaetsregeln": ["..."],
  "schutzregeln": ["..."],
  "schnittstellen": {
    "bautAuf": ["F01", "F02", "C03"],
    "fuehrtZu": ["F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "E07"]
  },
  "canvasRef": "canvas-F03"
}
```

## Canvas-Schema

Jede Spezifikation enthält `id`, `methodId`, `name`, feldgenaue `felder` mit `key`, `label`, `leitfrage` und die fünf Pflichtfelder:

- Evidenzstatus
- Unsicherheit
- negative Wirkung
- Wirkungsgrenzen
- offene Fragen

Die 56 Anwendungsvarianten tragen zusätzlich `anwendungsmodul` und `relatedMethodIds`.

## Website- und Kernexport

- Schlanker Website-Export: `public/data/woems-methoden.json`
- Schlanker Canvas-Export: `public/data/woems-canvas.json`
- Kern-Endpunkt Methoden: `/api/v1/methods/`
- Kern-Endpunkt Canvas: `/api/v1/canvases/`

Die Akademie synchronisiert den Methodenexport als generierten Snapshot. Manuelle Kopien der 152 Methoden sind nicht zulässig.

## Aktualisierung

1. DOCX nach Text extrahieren, zum Beispiel mit `textutil`.
2. DOCX rendern und aus dem PDF mit `scripts/methods/extract-woems-page-map.py` die physische Seitenkarte erzeugen.
3. `WOEMS_TEXT=/pfad/WOEMS.txt WOEMS_PAGE_MAP=/pfad/woems-pages.json npm run methods:import`
4. `npm run methods:build`
5. `npm run check:woems`
6. Glossarimport neu ableiten und ausführen.

## Schutzlogik

Eine als `verletzt` markierte Wirkungsgrenze erzeugt immer `stop_or_redesign`. Ein aggregierter Wert ist in diesem Zustand unzulässig. Positive Werte dürfen die Grenzverletzung nicht kompensieren.

Farbe darf Bedeutung nie allein tragen. Jede Canvas-Instanz braucht zusätzlich Text- oder Symbolcodierung sowie ID, Methode, Version, Datum, Fall und verantwortliche Moderation.
