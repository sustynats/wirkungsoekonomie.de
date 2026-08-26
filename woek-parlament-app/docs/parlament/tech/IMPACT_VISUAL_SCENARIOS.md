# Wirkungsbilder / ImpactVisualScenario v1

## Status

Die öffentliche Bezeichnung lautet **Wirkungsbild**:

> Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.

Die v1-Architektur ist portalweit wiederverwendbar. Der Sachsen-Anhalt-Pilot
enthält zwölf versionierte Records: je ein `PROGRAM_SCENARIO` und ein
`CASE_SCENARIO` für CDU, SPD, BÜNDNIS 90/DIE GRÜNEN, Die Linke, BSW und AfD.
Zum Stand 26.08.2026 sind die sechs `PROGRAM_SCENARIO`-Assets durch den
owner-seitig gelieferten, fachlich-redaktionell signierten Handoff freigegeben
und im Portal integriert. Die sechs `CASE_SCENARIO`-Records bleiben bewusst
auf `NO_APPROVED_VISUAL_SCENARIO`, weil weder eine symmetrische Case-Auswahl
noch Case-Assets freigegeben wurden.

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
3. für jeden verwendeten Marker eine vollständige Marker-zu-Wirkpfad-Zuordnung;
   nicht eindeutig bindbare sichtbare Motive werden dokumentiert und erhalten
   bewusst keinen Marker,
4. abgeschlossene Auswahl nichtvisueller und ausgelassener materieller Folgen,
5. Systemgrenze, Annahmen, Evidenz-/Unsicherheitsdarstellung,
6. geprüften Alt-Text,
7. neutrales Editorial-Sign-off,
8. verfügbare Generator-/Prompt-Provenienz sowie zwingend Asset-, Original-
   und Handoff-Provenienz mit SHA-256. Nicht mitgelieferte Generatorparameter
   werden nicht erfunden.

Fehlt ein zwingendes Feld, wird kein `<img>`/`next/image` gerendert. Eine spätere
Freigabe ersetzt den vorhandenen Record nicht still, sondern ergänzt seine
`change_history` und erzeugt eine neue Assetversion.

## Freigegebener 6/6-Assetstand

Alle sechs Dateien wurden aus den bereitgestellten PNG-Originalen mit
`cwebp -q 90 -m 6 -metadata none` in WebP überführt. Der vollständige
Bildausschnitt bleibt erhalten; die Descriptor-Records pinnen Originalname,
Original-SHA, Ausgabemaße, Bytezahl und Asset-SHA.

| Programm | Asset | SHA-256 |
| --- | --- | --- |
| CDU | `cdu-program-scenario-v1.webp` | `37ddd1008a733172f58843f5424e6014b0f4623d140dd13f12c93781d9b5db3e` |
| SPD | `spd-program-scenario-v1.webp` | `03fe2d3097b9e3ddb79fbc29a917eb2f891ec86b3185d8960fb24fb1e2fd730f` |
| BÜNDNIS 90/DIE GRÜNEN | `gruene-program-scenario-v1.webp` | `7350d33b57190788e0a4e5d0910f2d7362a625fe84710ca6349834d85cddfe8b` |
| Die Linke | `linke-program-scenario-v1.webp` | `74ba1d23f7452cc58dd54fa36addfcadbdac22f5078fe04aadcfd0948fbec823` |
| BSW | `bsw-program-scenario-v1.webp` | `2ead313d310fee8256642ddda5b8c26a8f1dfaa7ea9238c8be012fd8c70724d1` |
| AfD | `afd-program-scenario-v1.webp` | `ed6a73eeed917bf8501d5f351feaf01a206f75774d467be865675d8f1957b78a` |

Der freigegebene Handoff ist als
`SACHSEN-ANHALT-WIRKUNGSBILDER-6-6-CODEX-HANDOFF-2026-08-26`, Version
`1.0`, SHA-256
`3840250aa566a04044d051b191ab89c672d4116a83ce330b753cf448e5066d29`
gebunden. Die sechs Alt-Texte werden daraus unverändert übernommen.

## Marker-Entscheidung

Die sichtbaren Motive der sechs Bilder lassen sich nicht jeweils eindeutig
einer der vier bereits freigegebenen Editorial-v2-Wirkpfad-IDs zuordnen.
Deshalb ist die korrekte öffentliche Darstellung `NO_MARKER`: kein
Wirkungspfad wird aus einem sichtbaren Motiv abgeleitet. Pro Record benennt
`omitted_marker_candidates` den geprüften, nicht belastbar bindbaren
Motivbereich. Das Bild bleibt Illustration eines freigegebenen
Ex-ante-Szenarios und erzeugt keine neue Fachinformation.

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
