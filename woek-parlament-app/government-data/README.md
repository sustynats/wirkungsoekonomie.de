# WÖk Government Data Contract 1.0

Dieses Verzeichnis enthält die reproduzierbare Ingestion für die amtliche Faktenbasis zu Regierungshandlungen der Bundesregierung seit dem 6. Mai 2025.

Die Ingestion trennt:

- amtliche Veröffentlichungen (`SourceEvent`),
- kanonische Regierungshandlungen (`GovernmentAction`),
- Handlungen externer Akteure (`ExternalActorEvent`) und
- belegte oder noch zu prüfende Beziehungen zwischen diesen Objekten.

Sie erzeugt ausdrücklich keine Wirkungsbewertung, keine SDG-Richtung, keinen Score und keine Bewertung von Personen, Parteien oder Regierung.

## Ausführen

```sh
python3 -m pip install -r requirements.txt
python3 scripts/ingest/run_ingest.py --output ./geschuetzte-ausgabe
python3 scripts/validate/validate_package.py ./geschuetzte-ausgabe
python3 -m unittest discover -s tests -v
```

Ein eigener DIP-Zugang kann optional über die dafür vorgesehene
Umgebungsvariable bereitgestellt werden. Der Wert wird weder in Rohdaten noch
in Manifesten gespeichert und gehört nicht in Befehle, Logs oder Pakete.

## Quellenabdeckung

Für das veröffentlichte Kabinettsarchiv existiert ein überprüfbarer Nenner. Für Ressortquellen ohne vollständiges amtliches Register wird der Status `BEST_EFFORT_DEFINED_SOURCE_SCOPE` verwendet. Der Coverage-Bericht nennt je Ressort die konkret geprüften amtlichen Quellenbereiche.

## Führende Regeln

- Originaldaten bleiben erhalten; normalisierte Felder werden zusätzlich gespeichert.
- Unbekannt bleibt `null` beziehungsweise `UNKNOWN`; fehlende Zahlen werden nicht zu `0`.
- Eine Pressemitteilung ist ein `SourceEvent`, aber nicht automatisch eine `GovernmentAction`.
- Unsichere Zusammenführungen bleiben `POSSIBLE_SAME_AS` und `REVIEW_REQUIRED`.
- Spätere Quellenänderungen erzeugen eine neue Version statt einer stillen Überschreibung.

Herausgeber: Institut für Wirkungsökonomie
