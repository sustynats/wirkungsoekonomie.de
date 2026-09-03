# Wirkungsbilder / ImpactVisualScenario v2

## Status

Die öffentliche Bezeichnung lautet **Wirkungsbild**:

> Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.

Die schema-kompatible Architektur ist portalweit wiederverwendbar. Der Sachsen-Anhalt-Pilot
enthält zwölf versionierte Records: je ein `PROGRAM_SCENARIO` und ein
`CASE_SCENARIO` für CDU, SPD, BÜNDNIS 90/DIE GRÜNEN, Die Linke, BSW und AfD.
Zum Stand 27.08.2026 sind 12/12 Assets aus dem finalen Handoff
`SA-2026-WIRKUNGSBILDER-FINAL-12-OF-12` freigegeben und bytegebunden.
`PROGRAM_SCENARIO` v2 ersetzt die sechs bisherigen, nicht hinreichend an die
vier kanonischen Pfade gebundenen Programm-v1-Fotos. Alle sechs
`CASE_SCENARIO`-Records verwenden getrennte Case-Dateien; `IMAGE_ASSET` und
`FINAL_IMAGE_SIGNOFF` sind beseitigt. AfD bleibt fachlich
`OPEN / NOT_ASSESSABLE` und verwendet weiterhin `NULL_MARKER_APPROVED`.

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
Editorial-v2-Schlüsselpfad-IDs. Case-Slots binden exakt die sechs bereits
delegiert freigegebenen Einzelpfade; die Bildintegration ändert weder Auswahl
noch Fachrecord.

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

## Freigegebener 12/12-Assetstand

Alle zwölf Dateien wurden aus den bereitgestellten PNG-Originalen mit
`cwebp -q 90 -m 6 -metadata none` in WebP überführt. Der vollständige
Bildausschnitt bleibt erhalten; die Descriptor-Records pinnen Originalname,
Original-SHA, Ausgabemaße, Bytezahl und Asset-SHA.

| Partei | Programm v2 · Public SHA-256 | Fallvertiefung · Public SHA-256 |
| --- | --- | --- |
| CDU | `cdu-program-scenario-v2.webp` · `5baf10d136d280baee4febf2733249876e0abd5e6eab620dad38a4074ef3f917` | `cdu-case-scenario-v1.webp` · `563e6e442ec89f4bd54fcf11b391e524ff991bc6277781d98097284f85179bbf` |
| SPD | `spd-program-scenario-v2.webp` · `59e69c1b07353c1edd7beff95eed209461cd227778a39115c264554444dfa18f` | `spd-case-scenario-v1.webp` · `067739482a4a0f7f6d40baeb928ccd8cc0a45cadca4904f3c880d86540cbf1b2` |
| BÜNDNIS 90/DIE GRÜNEN | `gruene-program-scenario-v2.webp` · `6d2bbe6b8d7e0c64455c1e2564e24ac4c6f4144f824b9a37774595b6ffde2221` | `gruene-case-scenario-v1.webp` · `2a273b541db5a93e0eb0dffb60c2e82cd59a8af70e497eb772689bc87bebc6b0` |
| Die Linke | `linke-program-scenario-v2.webp` · `48198176bf0b656d5cce381f21347e18090719cbcad59b9b278ba29704b66ee7` | `linke-case-scenario-v1.webp` · `7fdc7a9b2a45d535896a43a576125a535d74ce417c0aeb4e26c586816a3088c6` |
| BSW | `bsw-program-scenario-v2.webp` · `85c88775667537c6a32095370bfde1b148baa4aedebd1b8378ca87f370051cce` | `bsw-case-scenario-v1.webp` · `129370172f869eaa362f1467748813e6d2078f810b25c4a0965739108e6fe446` |
| AfD | `afd-program-scenario-v2.webp` · `eaaf7725d624a9c9357c0c9517c8f7327b2a1d610439d2638f0eb3f6dbdbc101` | `afd-case-scenario-v1.webp` · `1a6dc5da1bcc7f9aba49a22670687f069ba3d44d488ac4a7e33db9604ff2ce61` |

Der finale Handoff ist als `SA-2026-WIRKUNGSBILDER-FINAL-12-OF-12`
gebunden. Manifest-SHA-256:
`ff4d217bef7dc2971a304d9eb69b0931f3aead728a40fbddbfc5effce3f8c9c3`;
Archiv-SHA-256:
`c3364d149b465e1ce6b4951a005d5b6ec12c3a1d90595f76186ddbad7fafce85`.
Alle zwölf kanonischen Alt-Texte und Original-PNG-Hashes sind im Descriptor
gepinnt. Die sechs alten Programm-v1-WebPs sind nicht mehr im Public-Baum.

## Marker-Entscheidung

Die Programm-v2-Composites binden ihre vier analytischen Pfadkarten exakt an
die unveränderten Editorial-v2-IDs. Aus dem Fotoanker werden dennoch keine
räumlichen UI-Marker abgeleitet. Die Case-Bilder zeigen ausschließlich den
freigegebenen Struktur-/Kapazitäts-/Verfahrensanker; weitergehende Outcomes
bleiben textlich. AfD hat explizit `NULL_MARKER_APPROVED`. Damit erzeugt kein
Bild eine neue Fachinformation.

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
