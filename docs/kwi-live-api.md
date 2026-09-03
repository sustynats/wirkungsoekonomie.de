# KWI Live API

Stand: 2026-07-03

## Ziel

Die KWI-Demo soll jede im SDG-Bereich verfügbare Kommune annehmen können. Die öffentliche Seite bleibt statisch-first. Das Frontend akzeptiert freie Eingaben, lädt vorhandene Snapshots sofort und ruft für unbekannte Kommunen den Live-Endpunkt `https://akademie.wirkungsoekonomie.de/api/kwi` auf.

## Datenfluss

1. Nutzer:in gibt eine Kommune ein.
2. Frontend sucht zuerst im lokalen Manifest `assets/data/kwi/municipalities.json`.
3. Wenn kein Snapshot vorhanden ist, zeigt das Frontend einen Ladezustand und ruft `https://akademie.wirkungsoekonomie.de/api/kwi?q=<kommune>` auf.
4. Die API läuft in der Akademie-App und bedient zuerst lokale Snapshots aus `assets/data/kwi`.
5. Das frühere SDG-Portal wurde zum 30.06.2026 abgeschaltet. Die alte Live-Scraping-Strecke ist deshalb als Fallback nicht mehr belastbar; für weitere Kommunen muss der Collector auf das Portal Nachhaltige Kommunen migriert werden.
6. Die API liefert denselben JSON-Aufbau wie die lokalen Snapshot-Dateien.
7. Der Snapshot sollte im Deploy oder am Edge gecacht werden.

## Frontend-Verhalten

- Freie Eingabe: Nutzer:innen können jede Kommune eingeben.
- Snapshot-Dropdown: Kommunen aus `municipalities.json` werden als Sofortauswahl angeboten.
- Ladezustand: Während Snapshot- oder Live-Abruf läuft, zeigt die Seite eine Statusmeldung und einen Fortschrittsindikator.
- Fallback: Wenn der Live-Endpunkt nicht erreichbar ist, bleibt die Seite bedienbar und verweist auf die vorhandenen Snapshots im Dropdown.

## Lokaler Snapshot

Der Serverless-Endpunkt nutzt das Manifest `assets/data/kwi/municipalities.json` als stabilen
Fallback. Eingaben werden tolerant gematcht, inklusive Umlautvarianten (`Düsseldorf`,
`Duesseldorf`, `Dusseldorf`).

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
GET https://akademie.wirkungsoekonomie.de/api/kwi?q=Bielefeld
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

Wenn keine lokale Kommune gefunden wird und die externe Quelle nicht nutzbar ist, antwortet die API
mit `source_unavailable` statt mit einem falschen `municipality_not_found`.

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
