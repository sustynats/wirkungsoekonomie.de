# LWK-DE Snapshot-Import

Die 16 Bundeslaender stehen im LWK-DE-Universum fest. Wirkungsdaten werden nicht manuell in der Website gepflegt, sondern als CSV-Snapshot importiert.

Workflow:

1. Offizielle Quelle herunterladen, z. B. Destatis/Regionaldatenbank, Statistikportal, Umweltbundesamt, Bundeswahlleiterin oder Landeswahlleitung.
2. Quelle in die CSV-Struktur `lwk-de-observations.template.csv` ueberfuehren.
3. Import ausfuehren:

```bash
python3 scripts/wirkungskompass/import-territorial-snapshots.py lwk-csv path/to/lwk.csv
```

Der Importer schreibt `data/wirkungskompass/snapshots/lwk-de.manual.latest.json` und aktualisiert `data/wirkungskompass/snapshot-manifest.json`.

Wichtig: Fehlende Daten bedeuten keine schlechte Wirkung. Sie bedeuten nur, dass noch kein versionierter, quellenbasierter Snapshot vorliegt.
