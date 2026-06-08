# KWI Live API

Stand: 2026-06-09

## Ziel

Die KWI-Demo soll jede im SDG-Portal verfügbare Kommune annehmen können. Die öffentliche Seite bleibt statisch-first, aber unbekannte Eingaben werden im Zielbetrieb serverseitig aufgelöst.

## Datenfluss

1. Nutzer:in gibt eine Kommune ein.
2. Frontend sucht zuerst im lokalen Manifest `assets/data/kwi/municipalities.json`.
3. Wenn kein Snapshot vorhanden ist, ruft das Frontend `/api/kwi?q=<kommune>` auf.
4. Die API nutzt `tools/kwi_collect.py`, sucht die Kommune im SDG-Portal, zieht die öffentliche Indikatorseite und berechnet einen KWI-Snapshot.
5. Die API liefert denselben JSON-Aufbau wie die lokalen Snapshot-Dateien.
6. Der Snapshot sollte im Deploy gecacht werden.

## Lokaler Snapshot

Einzelne Kommune neu erzeugen:

```bash
python3 tools/kwi_collect.py Bielefeld --out assets/data/kwi --append
```

Mehrere Kommunen neu erzeugen:

```bash
python3 tools/kwi_collect.py "Mannheim" "Gütersloh" "Bielefeld" --out assets/data/kwi
```

Ohne `--append` wird das Manifest aus den angegebenen Kommunen neu aufgebaut. Mit `--append` bleiben bestehende Manifest-Einträge erhalten und neue Snapshots werden ergänzt oder ersetzt.

## API

Pfad:

```text
GET /api/kwi?q=Bielefeld
```

Antwort:

```json
{
  "schemaVersion": "kwi-beta-0.1",
  "municipality": {},
  "summary": {},
  "indicators": []
}
```

Die API berechnet den Score deterministisch. Sie nutzt keine KI und verändert keine Gewichte.

## Rolle der WÖk-KI

Die WÖk-KI sollte nicht den KWI berechnen. Der belastbare Kern bleibt:

- Datenquelle
- Jahr
- Richtung
- Normalisierung
- Dimensionsgewicht
- Trend
- Datenqualität
- Schutzlinie

Sinnvoll ist KI als Erklärschicht. Sie erhält den fertigen Snapshot und formuliert daraus eine verständliche Interpretation:

- stärkste Dimension
- größte Wirkungslücke
- auffälliger Trend
- Datenabdeckung
- Demokratie als SDG+-Proxy
- Hinweis, dass der KWI kein Ranking und keine Entscheidung ersetzt

Wenn die KI ausfällt, bleibt die regelbasierte Interpretation im Frontend sichtbar.
