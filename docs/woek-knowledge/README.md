# WÖk Knowledge Base - Kanonischer Einstiegspunkt

Stand: 2026-08-14 (Phase 0 „Knowledge Bootstrap", Claude; Codex-Verifikation offen → `CROSSCHECK.md`).
**Jede größere Aufgabe beginnt hier.** Grundregel: Nie annehmen „das gibt es wahrscheinlich noch nicht" - erst suchen, dann wiederverwenden/erweitern, erst zuletzt neu bauen. Gesprächskontext ist Hilfsmittel; Source of Truth ist dieses Verzeichnis plus die referenzierten Originalquellen.

## Was ist die Wirkungsökonomie?

Ein von Natalie Weber begründetes Gesellschafts- und Wirtschaftsmodell: **Wirkung auf Mensch, Planet und Demokratie wird zentrale Steuerungsgröße** („Wirkung statt Kapital"). Wirkung = tatsächliche Veränderung von Zuständen (neutral, relational); bewertet wird am Referenzrahmen SDGs/Agenda 2030 + SDG+ (WÖk-Erweiterung, keine UN-Kategorie); Kernprinzipien: positive Netto-Wirkung, Nichtkompensation, Reverse Merit Order (`FinalScore = min(Kernfelder)`), Wirkungsrückkopplung; Nachhaltigkeit = langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie (Begriffsleitfaden v1.5).

## Versionssicherheit (WICHTIG)

Maßgeblich ist der **Status in der Website-Bibliothek** (`assets/data/library-version-registry.json`: führend > aktuell > Arbeitsfassung > historisch > archiviert > ersetzt), nie der lokale Dateiname. Die 8 führenden Referenzen (Buch · WÖMM 2.0 · WÖMS 2.0 · Begriffsleitfaden **v1.5** · Glossar · SDG-/SDG+-Referenzrahmen **v0.3** · Master Items **v1.3** (621 IDs) · T-SROI-Rechenstandard **v1.1**): → [`SOURCE_HIERARCHY.md`](SOURCE_HIERARCHY.md) + [`reference-manifest.yaml`](reference-manifest.yaml). Ersetzte Fassungen (Master Items v1.2, Begriffsleitfaden v1.0 bis v1.4, T-SROI-Whitepaper) nie für Neues verwenden.

## Wegweiser

| Frage | Datei |
|---|---|
| Welche Quellen gelten, welche sind ersetzt? | `SOURCE_HIERARCHY.md`, `reference-manifest.yaml` |
| Wie heißen die Dinge richtig? | `TERMINOLOGY.md`, `terminology.yaml` |
| Normative Bewertungsgrundlage? | `NORMATIVE_FRAMEWORK.md` |
| Indikatoren/WÖk-IDs/Benchmarks? | `INDICATOR_REGISTRY.md` |
| Welche Werkzeuge existieren (und welche nur dem Namen nach)? | `TOOLS.md`, `tool-registry.yaml` |
| Welche Portale/Oberflächen existieren? | `PORTALS.md`, `portal-registry.yaml` |
| Welche APIs/Integrationen existieren? | `INTEGRATIONS.md`, `integration-registry.yaml` |
| Regionale/kommunale Daten? | `REGIONAL_DATA_CAPABILITIES.md` |
| Was kann die WÖk-KI? | `WOEK_AI_CAPABILITIES.md` |
| Was kann Institut / Akademie? | `INSTITUTE_CAPABILITIES.md`, `ACADEMY_CAPABILITIES.md` |
| Welche Inhalte sind wiederverwendbar? | `CONTENT_REGISTRY.md` |
| Wie hängt alles zusammen (System/Fähigkeiten)? | `SYSTEM_ARCHITECTURE.md`, `CAPABILITY_GRAPH.md` (+`capability-graph.json`), `CAPABILITY_MATRIX.md` |
| Was ist doppelt/Altlast? | `DUPLICATION_AND_TECH_DEBT.md` |
| Was wissen wir nicht? | `KNOWLEDGE_GAPS.md` |
| Was nutzt das Parlament-Portal wieder? | `PARLIAMENT_REUSE_MAP.md` |
| Wie erleben Menschen das Ökosystem? | `UX_ECOSYSTEM_MAP.md` |
| Technische Verifikation (Codex) | `TECHNICAL_CAPABILITY_MAP.md`, `CROSSCHECK.md` |
| Änderungshistorie | `CHANGELOG.md` |

## Produkte & Status (Kurzüberblick, Details in den Registries)

- **wirkungsoekonomie.de** (PRODUCTION): statische Site, Rang-0-24-Portalsystem, Wirkungsradar, ~30 interaktive Tools, Bibliothek (3196 Registry-Einträge), Referenzbuch online, Quellenarchiv-Spiegel, Glossar (2281), statische `/api/v1/`, PWA, 7 EN-Seiten.
- **akademie.wirkungsoekonomie.de** (PRODUCTION): Next.js/Vercel + Supabase; WÖk-G-Curriculum (9/36/108; 8 Vorlesungen published), Prüfungs-Engine, Moderations-Pipelines, KI-Beta, `/api/me`-Konto; Zertifikats-Ausstellung fehlt noch.
- **institut.wirkungsoekonomie.de** (PRODUCTION, Repo lokal unbekannt): Herausgeber/Redaktion, Quellenarchiv-SoR (`/api/quellen`).
- **WÖk-Kern-API auf Oracle** (PRODUCTION): Faktencheck, Frag-die-WÖk, Produktcheck, Feedback, Share, Community-Auth.
- **Wirkungsportal Parlament** (PLANNED): parlament.wirkungsoekonomie.de existiert noch nicht; Wiederverwendung → `PARLIAMENT_REUSE_MAP.md`.

## Arbeitsregeln

1. Vor jedem Neubau: `findEquivalentCapability()` gegen `tool-registry.yaml`/`CAPABILITY_MATRIX.md`; Entscheidung REUSE/EXTEND/WRAP/BUILD_NEW dokumentieren.
2. Status nie raten: `UNKNOWN` ist besser als erfunden; `last_verified` pflegen.
3. Konflikte als `SOURCE_CONFLICT`/`REFERENCE_METADATA_CONFLICT` dokumentieren, nicht still harmonisieren.
4. Diese Wissensbasis bei jeder größeren Änderung aktualisieren (+ `CHANGELOG.md`).
5. Sicherheits-/Datenschutzklassen je Capability beachten (PUBLIC/INTERNAL/PERSONAL_DATA/…, siehe Registries); keine internen Funktionen versehentlich öffentlich einbinden.
