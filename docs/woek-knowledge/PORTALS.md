# Portals - Themenportale & Oberflächen der Website

Stand: 2026-08-14 · Maschinenlesbar: [`portal-registry.yaml`](portal-registry.yaml) · Offizielle Quelle des Rang-Systems: `portale/index.html` (Rang 0-24, „Masterbibliothek").

## Struktur in einem Satz

Die Website ordnet ihr Wissen in ein **Rang-0-24-System**: Rang 0 = SDG-/SDG+-Referenzrahmen (führend), Rang 1-14 = 13+1 **Wirkungsfelder** (`wirkungsfelder/*` - Produkte, Staat/Recht/Demokratie, Wirtschaft, Wohnen, Arbeit, Rente, Bildung, Medien, Gesundheit, Wissenschaft, Finanzsystem, Klima, Kultur + Rang 2 Impact-Controlling unter `werkzeuge/`), Rang 15-23 = **Website-1.0-Dossierportale** (`portale/*` - Migration, Sicherheit/Resilienz, Digitalisierung/KI, Wissenschaft/Forschung, internationale Ordnung, Transformation, Kritik/Schutzarchitektur, Zukunftsbilder, Wirkungsakademie), Rang 24 = Masterbibliothek/Downloadzentrum. Quer dazu: **Wirkungsradar** (Debatte/Faktencheck), **Werkzeuge**, **Wirkungssteuerung** (Policy/Gesetze), **Erleben** (Demos), **Bibliothek/Referenz/Quellenarchiv** (Wissen), **Für-wen-Einstiege**, **Akademie/Institut** (Subdomains).

## Einheitliche Portalmuster (Wiederverwendung!)

- `wirkungsfelder/*`: Hub `index.html` + `konzept(papier)` + `dossier(s)` + `detailkonzepte` + teils `tools/` + `quellen/`.
- `portale/*` (Rang 15-23): `index.html` + `gesamtdossier/` + `konzeptpapier/` + `quellen-glossar/` + **`sdg-sdgplus/`** (Pflichtabschnitt Referenzrahmen!) + `toolkarten/` + `wirkungsindikatoren/` + `politische-anschlussfaehigkeit/` + `downloads/`.
- Jedes Portal hat SDG-/SDG+-Bezug als Strukturelement - neue Portale (Parlament!) sollten dieses Muster übernehmen statt neu zu erfinden.

## Für das Parlament-Portal besonders relevante Bestände

| Bestand | Warum |
|---|---|
| Rang 3 Staat/Recht/Demokratie | Wirkungshaushalt, WStG, Wirkungsrat-Governance, Resilienzstaat - fachliche Heimatbasis |
| Wirkungsradar | Aussagen-Prüfmuster (Faktenlage → Narrativ → Folgen → Antwort), Quellenbelege, Embed-Widgets, Redaktionsworkflow mit Community-Einreichung |
| `ordnung/anschlussfaehigkeit/` | bestehende Parteien-Anschlussfähigkeits-Analysen (Grüne, Linke, CDU/CSU, SPD, FDP) |
| Blog-Analysen | AfD-Regierungsprogramm-Wirkungsanalyse, Wahl-O-Mat-Methodenkritik - redaktionelle Vorarbeiten |
| `fuer/politik.html` | bestehender Politik-Zielgruppeneinstieg |
| Wirkungssteuerung + `werkstatt/gesetze/` | Policy-Instrumente + Gesetzes-Volltexte (WStG) |

## Navigations-Stand (wichtig für jede neue Seite)

Aktuell dominante Hauptnavigation: **Verstehen | Für wen? | Wirkungsfelder | Praxis & Tools | Debatte & Radar | Lernen | Institut | Bibliothek | Mitmachen** + Utility (Suche, Frag die WÖk, Mein Wirkungsraum, EN). Quelle: `assets/data/navigation.json`, normalisiert in alle Seiten via `scripts/site/normalize-site-header.mjs`/`-footer.mjs`.
⚠️ Vier abweichende Altstände existieren (Template `templates/header.html`, `bibliothek/index.html`, `en/`, Planungsdatei `website-architecture-v21.json`) - Details `DUPLICATION_AND_TECH_DEBT.md`. Neue Seiten IMMER über `navigation.json` + Normalisierungsskripte anbinden, nie Nav hart kopieren.

## Bekannte Portal-Inkonsistenzen (nicht still fixen - dokumentiert)

1. Gesundheit doppelt: `wirkungsfelder/gesundheit/` UND `wirkungsfelder/gesundheit-pflege/` beide live mit eigenem Canonical; Hub verlinkt erstere, Footer/Rang 10 letztere.
2. SDG+-Dreifachbestand: `verstehen/sdgs-sdgplus/` (führend) vs. `sdg-plus.html` vs. `sdg-plus/` (zwei verschiedene echte Altseiten) + Redirect-Varianten (`sdg-sdgplus/`, `referenzrahmen/sdgs-sdgplus/`); `sdg-und-sdg-plus/` redirectet fälschlich auf `wirkungsoekonomie.html`.
3. Rang-14-Link im Portalregister zeigt auf `referenz/` statt `wirkungsfelder/kultur-identitaet-resonanz/`.
4. `wirkungsfelder/wirkungsfinanzpolitik/` fehlt auf dem Wirkungsfelder-Hub (nur via Rang-/llms.txt auffindbar).
5. „Demokratie schützen" hat **keinen Hub** - lebt verstreut (Bibliothek-Studienskripte `demokratie-schuetzen-*` v2-v11, Wirkungsradar, `einwaende/`, `ordnung/anschlussfaehigkeit/`); `bibliothek/demokratie-schuetzen/` ist nur Redirect auf `downloads.html`.
6. Zwei Download-Welten: `downloads.html` (Dokumente nach Art/Status) vs. `downloads/` (Rang-Pakete) - verschiedene Inhalte unter fast gleichem Namen.
