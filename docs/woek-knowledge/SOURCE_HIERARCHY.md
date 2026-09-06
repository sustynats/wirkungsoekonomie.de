# Source Hierarchy - Quellenhierarchie der Wirkungsökonomie

Stand: 2026-08-15 · Maschinenlesbar: [`reference-manifest.yaml`](reference-manifest.yaml)

## Oberste Regel

**Maßgeblich ist der Status in der Website-Bibliothek, nicht der lokale Dateibestand.**
Statusquelle (Single Source of Truth): `assets/data/library-version-registry.json` (3196 Einträge; Generator `scripts/library/build-library-versioning-stage9.mjs`; Oberflächen `bibliothek/index.html` und `downloads.html#lesepfade`).

Statushierarchie (absteigend):

1. **führend** - aktuell kanonische Referenz für ihren Geltungsbereich (derzeit 11 Einträge)
2. **aktuell** - verwendbar, soweit keiner führenden Referenz widersprechend (2625)
3. **Arbeitsfassung** - nicht abschließend freigegeben, nur mit sichtbarem Hinweis (277)
4. **ältere Fassung / historisch** - für Entwicklungsgeschichte (261)
5. **archiviert** - nur Historie/zitierfähige alte Fundstellen (1)
6. **ersetzt** - **nie** für neue Berechnungen, Regeln, Glossare, UX-Texte, KI-Systemkontext oder Produktentscheidungen (21)

Lokale/hochgeladene Dateien, die älter sind als die führende Website-Referenz: `SOURCE_STALE`. Widersprüchliche Website-Metadaten: `REFERENCE_METADATA_CONFLICT` dokumentieren (→ `KNOWLEDGE_GAPS.md`), nicht still harmonisieren. Höhere Versionsnummern schlagen **nicht** den Registerstatus (Beispiel: T-SROI „v2.0"-Entwurf ist älter und nicht führend gegenüber Rechenstandard v1.1).

## Führende Referenzmatrix (Stand 2026-08-15, im Register verifiziert)

| Geltungsbereich | Führende Referenz | Version/Datum | Repo-Kopie |
|---|---|---|---|
| Gesamte Systemlogik | Die neue Ordnung des Wohlstands | 2026 | `assets/pdf/die-neue-ordnung-des-wohlstands.pdf` (+ Online-Lesefassung `referenz/`) |
| Management/Realisierung | WÖMM 2.0 | 10.07.2026, 98 S. | `assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf` (+ `bibliothek/eintraege/woemm-2-0/lesen/`) |
| Methoden | WÖMS 2.0 (152 Methoden, 56 Canvas, 20 Journeys) | 10.07.2026, 387 S. | `assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf` (+ Lesen-Fassung, JSON-Exporte) |
| Sprache/Begriffe | WÖk-Begriffsleitfaden führend | **v1.5**, 15.08.2026 | `public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.5.pdf` (+ `content/documents/online/woek-begriffsleitfaden-fuehrend.inc`) |
| Öffentliche Begriffe | Glossar der Wirkungsökonomie | laufend | `glossar.html` → `begriffe/` (2281 Seiten), `assets/data/glossary-lookup.json` |
| Normativ | SDG-/SDG+-Referenzrahmen (Lesefassung) + Onlinefassung | **v0.3** | `assets/downloads/woek_sdg_sdgplus_referenzrahmen_vertiefungskonzept_lesefassung_v0_3.pdf` + `verstehen/sdgs-sdgplus/` |
| Register/Indikatoren | WÖk Master Items | **v1.3 geprüft**, 13.08.2026 | `assets/downloads/woek-register/WOeK_Master_Items_v1.3_geprueft.xlsx` |
| T-SROI | T-SROI-Rechenstandard | **v1.1**, 02.08.2026 | `assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf` |

## Wichtige ersetzte/historische Quellen (nicht mehr als Ausgangsquellen verwenden)

- `WOeK_Master_Items_final_v1.2.xlsx` / `woek-master-items-v1-2.pdf` - ersetzt durch v1.3 (622-Item-Zahl nicht mehr kanonisch; jetzt 621 WÖk-IDs, 28 Regeln). Inkonsistenz: `public/downloads/originals/WOeK_Master_Items_final_v1.2.pdf` steht noch auf „aktuell" statt „ersetzt".
- `WOeK_Begriffsleitfaden_fuehrend_v1.0.md/.pdf` bis v1.4 - historische, zitierfähige Fassungen. Für neue Inhalte gilt v1.5.
- `Whitepaper-T-SROI.pdf` (multiplikative Logik) + Methodenpapier v1.0 - ersetzt durch Rechenstandard v1.1.
- Ältere Fassungen (WStG Oktober 2025, ältere WP_*-Papiere, „Wenn Maschinen arbeiten" u.a.) - Status „aktuell"/„ältere Fassung" je Registereintrag prüfen; für Entwicklungsgeschichte verwendbar, nicht ungeprüft als aktuelle WÖk-Position.

## Weitere relevante Quellstränge (außerhalb des führend-Registers)

- **Rechts-/Methodikentwürfe** unter `docs/gesetze/`: `WUStG_Technische_Leitlinien_v2.1_Entwurf.md` (aktuellster Methodenstand Scoring/Nichtkompensation/RMO) und `WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md` - bewusst **nicht** in der kuratierten Bibliothek; als Arbeitsstände behandeln.
- **Studienskripte** `content/studienskripte/*.md` - Akademie-Lehrtexte, enthalten die formalisierte RMO-Formel `FinalScore = min(Kernfeldscores)`.
- **Gesetzes-Volltexte** öffentlich: `werkstatt/gesetze/` (WStG-Volltext), Kurzfassungen `wirkungssteuerung/{wstg,westg,wustg}`.
- **llms.txt** (Root) - KI-Einstiegsdatei; verlinkt derzeit noch Master Items **v1.2** → veraltet, siehe `KNOWLEDGE_GAPS.md`.
- **`docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md`** - ältere, dokumentbezogene Hierarchie (Stand 13.08.2026), nennt in Ebene 2 noch Begriffsleitfaden v1.0; durch das Bibliotheks-Statusregister überholt. Diese Datei hier (`docs/woek-knowledge/SOURCE_HIERARCHY.md`) folgt dem Register.

## Bekannte SOURCE_CONFLICTs

1. **Skalensysteme** - dokumentiert und im Repo selbst aufgelöst:
   - Quelle A (führend/Primärlogik): Skala **-3…+3** je Indikator - `content/methodik/scoring-rules.json` (rule `score-scale-minus3-plus3`), Master Items v1.3 (Schwellen→WÖk-Klassen), WUStG-Leitlinien v2.1 §2.8/§6.1, WStG-2.0-Entwurf („-3/+3 … bleibt die methodische Primärebene").
   - Quelle B (Einzelanwendung): Skala **-100…+100** mit GWV-Gewichtung 0,35 Mensch / 0,35 Planet / 0,30 Demokratie - Use Case Kommunale Wirkungsgewerbesteuer (`assets/pdf/use-case-kommunale-wirkungsgewerbesteuer.pdf` + Lesefassung) und älterer WStG-Entwurf Okt. 2025.
   - Redaktionsstand: WStG-2.0-Entwurf erklärt -100/+100 zur „höchstens optionalen Darstellungs-/Verwaltungsskala"; `docs/migration/WOeK_Migrationsmatrix_v1.1.md` führt die saubere Verbindung als offene Entscheidung.
2. **Master-Items v1.2-Doppelstrang** - ein v1.2-PDF „ersetzt", das andere „aktuell" (s.o.).
3. **Begriffsleitfaden-Archivhinweis** - v1.0-Eintrag verweist auf v1.2 statt v1.3 (bestätigt in `library-version-registry.json`).
4. **Snapshot-Drifts** - `docs/stage-9-library-versioning.md` (führend=10) hinter JSON (führend=11); `api/v1/glossary.json` (2092) hinter `glossary-lookup.json` (2121).

## Nicht auffindbare referenzierte Quellen

- `Wirkungsoekonomie_Kontextdossier_fuer_Drittsysteme_v1.0.md` - auf `origin/main` nicht vorhanden; existiert nur im ungemergten Codex-Arbeitsbaum (`New project`-Checkout, Branch `codex/live-clean-20260628`). → `KNOWLEDGE_GAPS.md`.
- Kein Quell-Markdown für SDG-/SDG+-Referenzrahmen v0.3 (nur PDF + Glossarseite).
