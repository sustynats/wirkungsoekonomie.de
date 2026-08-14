# UX Ecosystem Map — Wie Menschen die Wirkungsökonomie erleben (Claude-Lane)

Stand: 2026-08-14. Leitfrage: Wie erlebt ein Mensch die WÖk als zusammenhängendes System statt als Sammlung einzelner Seiten?

## Ist-Erleben: fünf Eingangstüren, ein Wissenskern

1. **Verstehen** (`verstehen/`, Kompass, Glossar-Hover): Modell-Einstieg ohne Vorwissen.
2. **Für wen?** (`fuer/`): 10+ Zielgruppen-Einstiege (Bürger:innen, Unternehmen, Kommunen, Politik, Journalismus …).
3. **Erleben/Werkzeuge**: Rechner und Demos machen die Methodik anfassbar (T-SROI, Scorecards, Kompasse, Quiz).
4. **Debatte & Radar**: aktuelle Aussagen/Mythen als Einstieg über das Tagesgeschehen (139 Checks, Debattenkarten, Studio).
5. **Lernen**: Website-Lernpfad → Akademie-Subdomain (Studium) → Zertifikatsprüfung.
Alle fünf Türen speisen sich aus demselben Kern: Glossar (2281), Bibliothek mit Statusregister, Quellenarchiv, Referenzbuch, Master Items.

## Verbindungsgewebe, das bereits gut funktioniert (erhalten & wiederverwenden)

- **Glossar-Hover/Verlinkung überall** (`glossaryTerms.js`) — Begriffe sind das Bindegewebe.
- **„Mein Wirkungsraum"** als persönliche Klammer (Merkliste via WÖk-ID, geräteübergreifend, privacy-schonend lokal-first).
- **Onlinefassungen mit Cite-Ankern** — jedes Kapitel zitierbar; Leser:innen können prüfen statt glauben.
- **Statusregister sichtbar** (`führend/ersetzt`-Badges in der Bibliothek) — Versionsvertrauen als UX-Feature.
- **Rang-Systematik** (`portale/index.html`) als mentale Landkarte der Themenwelt.
- **Utility-Leiste** (Suche · Frag die WÖk · Mein Wirkungsraum · EN) als konstanter Anker.

## UX-Brüche/Doppelstrukturen (Vermeidungsliste für alles Neue)

1. **Vier Navigationsstände** und Doppel-Footer auf Rang-Seiten → jede neue Fläche MUSS über `navigation.json` + Normalisierung laufen.
2. **Synonym-Konkurrenz**: drei „Kompasse", zwei „KWI", „Wirkungscheck" für drei verschiedene Produkte (App-Tab, Faktencheck, Bundestag-Check) — Namensraum ist übernutzt. Neue Produkte brauchen eindeutige, geschützte Namen (→ „Wirkungsportal Parlament", nicht „Wirkungscheck X").
3. **Tool-Versprechen ohne Tool** (45 Methodikseiten mit Rechner-Namen) — Erwartungsbruch; Badge-System nötig („Methodik" vs. „interaktiv").
4. **Doppelseiten** (Gesundheit ×2, SDG+ ×3, erleben ×2, downloads ×2) — Kanonisierung je Thema.
5. **EN-Insel** (7 Seiten) — Sprachwechsel bricht fast überall.
6. **„Demokratie schützen" ohne Hub** — Serie existiert, Ort fehlt.

## Nutzerwege zwischen den Systemen (Ist)

```
Bürger:in:  Social/Suche → Wirkungsradar-Check → Glossar-Hover → verwandtes Wirkungsfeld
            → Erleben-Rechner → (Mein Wirkungsraum) → Akademie-Lernpfad
MdB/Büro:   (bisher) Wahlkreis-Wirkungscheck V3 → Instrumentenkarten → Methodikseiten
            → künftig: Wirkungsportal Parlament als eigene Tür
Fachpublikum: Bibliothek (Status führend) → Onlinefassung/Zitat → Quellenarchiv → Institut
Lernende:   akademie.woek → Curriculum → Prüfungen → Zertifikat → zurück in Website-Vertiefung
```

## Konsequenzen für das Parlament-Portal (Claude-Arbeitsgrundlage)

1. **Eigene Subdomain-Tür mit institutioneller Herausgeber-Optik** (Institut!), aber dieselben Bindegewebe: Glossar-Hover, Quellen-Drawer, Status-Badges, „Mehr lernen"-Ausleitungen in Akademie/Bibliothek statt eigener Erklärwelten.
2. **Drei Nutzungstiefen** (60 Sekunden / interaktiv / Fachdossier) spiegeln das bewährte Muster Progressive Disclosure (Alltagssprache → Kurzerklärung → Fachbegriff).
3. **Fassungs-/Aktualitätsanzeige** übernimmt die Bibliotheks-Statuslogik (analysierte Fassung, letzte Prüfung, Korrekturhistorie sichtbar).
4. **Ein Namensraum**: „Wirkungscheck" im Portal ausschließlich für die Entscheidungs-Analyse verwenden; App-/Faktencheck-Produkte verlinken, nicht vermischen.
5. **Vertrauen als UX**: Trust-Card + „Warum dieses Vorhaben?"-Button + Herausgeberzeile auf jeder Analyse (kein Warnhinweis-Stil, sondern nachvollziehbare Gestaltung).
