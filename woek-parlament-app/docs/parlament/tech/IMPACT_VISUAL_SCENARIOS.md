# Wirkungsbilder / ImpactVisualScenario v1

## Status

Die öffentliche Bezeichnung lautet **Wirkungsbild**:

> Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.

Die v1-Architektur ist portalweit wiederverwendbar. Der Sachsen-Anhalt-Pilot
enthält zwölf versionierte Records: je ein `PROGRAM_SCENARIO` und ein
`CASE_SCENARIO` für CDU, SPD, BÜNDNIS 90/DIE GRÜNEN, Die Linke, BSW und AfD.
Zum Stand 25.08.2026 ist kein Bildasset freigegeben. Alle zwölf Records stehen
deshalb bewusst auf `NO_APPROVED_VISUAL_SCENARIO`; die öffentliche UI zeigt
keine Illustration und nennt die endlichen fehlenden Freigaben.

## Restore-first-Befund

Vor der Implementierung wurden aktueller `main`, Git-Historie,
GitHub-Code-Suche, Branches und Pull Requests nach `Wirkungsbild`,
`ImpactVisualScenario`, `WirkungsbildRecord`, `visual_brief` und
`NO_APPROVED_VISUAL_SCENARIO` durchsucht. Es existierte kein wiederverwendbares
Record-, Asset- oder Renderer-Modell. Die vorhandenen allgemeinen Visuals und
Diagrammkomponenten bilden keinen versionierten, analysegebundenen
Wirkungsbild-Vertrag ab und bleiben unverändert.

## Quellenbindung des Piloten

Kanonische Fachbasis ist
`LTW-2026-ST-SIX-PARTY-TERMINAL-RELEASE-V1`, veröffentlicht mit dem
Sachsen-Anhalt-Golden-State-Commit
`fefec75f09dc70db8de7880f93b4e8c6788e4461`. Programm-Slots übernehmen
mechanisch und unverändert die jeweils vier bereits kuratierten
Editorial-v2-Schlüsselpfad-IDs. Case-Slots dokumentieren dieselbe endliche
Kandidatenmenge, wählen aber technisch keinen Fall aus.

Damit gilt:

- keine neue Fachanalyse;
- keine neue Wirkungsrichtung oder Evidenzstufe;
- keine DNS-/SDG-Zuordnung;
- keine Recommendation oder Parteigesamtnote;
- kein Programmtext als Bildprompt;
- kein Asset ohne freigegebenen Visual Brief;
- kein Bildmodell-Output zurück in Fach- oder Analysedaten.

## Daten- und Assetvertrag

- JSON-Schema: `data/impact-visuals/contracts/impact-visual-scenario.schema.json`
- Versionierter Pilot-Descriptor:
  `data/impact-visuals/sachsen-anhalt-2026-v1.json`
- TypeScript-Vertrag: `lib/impact-visuals/contracts.ts`
- Deterministische Materialisierung:
  `scripts/materialize-sachsen-anhalt-impact-visuals.ts`
- Fail-closed- und Source-Fidelity-Gates:
  `scripts/quality/check-impact-visual-scenarios.ts`

Ein freigegebener Record benötigt gleichzeitig:

1. ausdrücklich ausgewählte freigegebene Wirkpfade (Programm 3–5, Case 1),
2. einen geprüften versionierten Visual Brief,
3. die vollständige Marker-zu-Wirkpfad-Zuordnung,
4. abgeschlossene Auswahl nichtvisueller und ausgelassener materieller Folgen,
5. Systemgrenze, Annahmen, Evidenz-/Unsicherheitsdarstellung,
6. geprüften Alt-Text,
7. neutrales Editorial-Sign-off,
8. Generator-/Prompt-/Asset-Provenienz und SHA-256.

Fehlt ein Feld, wird kein `<img>`/`next/image` gerendert. Eine spätere
Freigabe ersetzt den vorhandenen Record nicht still, sondern ergänzt seine
`change_history` und erzeugt eine neue Assetversion.

## Neutraler visueller Vertrag

Alle Parteien und Gegenstände verwenden denselben Perspektiv-, Detail-, Licht-
und Realismusvertrag. Parteifarben, moralische Lichtregie, dramatische
Gesichter, Stereotype sowie zusätzliche Zeichen von Chaos, Verfall, Ordnung
oder Wohlstand sind unzulässig, sofern sie nicht selbst als sichtbare
Zustandsänderung fachlich freigegeben und rückverlinkt sind. Kommunikations-
und Frame-Wirkung bleibt eine getrennte Analyseachse.

## Korrektur und Glossar-Synchronisation

Das Parliament-Glossar nutzt die in Issue #309 freigegebene Definition zentral
über `lib/presentation/terminology.ts`. Das Hauptwebsite-/Root-Glossar enthält
zum Implementierungszeitpunkt keinen bestehenden Wirkungsbild-Eintrag. Ein
späterer systemübergreifender Begriffsleitfaden-Sync muss dieselbe Definition
übernehmen; bis dahin wird keine parallele oder abweichende Root-Definition
angelegt.
