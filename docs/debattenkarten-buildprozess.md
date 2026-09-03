# Debattenkarten-Buildprozess

Stand: 2026-06-07

Neue Debattenkarten werden nicht direkt in HTML geschrieben. Der Standardprozess ist:

1. Karte als strukturierte JSON-Datei unter `content/wirkungsradar/imports/` ablegen.
2. Quellen mit öffentlicher URL, Belegfunktion und Grenze eintragen.
3. Import ausführen:

```bash
CARD_FILE=content/wirkungsradar/imports/<slug>.json npm run debate:import-card
```

4. Qualität prüfen:

```bash
npm run check:links
npm run check:search
```

5. Committen, auf `main` pushen, GitHub-Pages-Deployment abwarten.
6. Live prüfen:

```bash
https://wirkungsoekonomie.de/wirkungsradar/live/<slug>/?v=<commit>
https://wirkungsoekonomie.de/wirkungsradar/debattenkarten/?v=<commit>
https://wirkungsoekonomie.de/assets/search/search-index.json?v=<commit>
```

Pflichtstruktur:

- Was wird behauptet?
- Sofortantwort: 10 Sekunden, 30 Sekunden, 2 Minuten
- Folgencheck: Resonanzraum, Wirkung erster, zweiter und dritter Ordnung, WÖk-Korrektur
- Wirkpfad
- Kritische Fragen
- Faktenlage
- Quellen mit Belegfunktion
- Warum zieht das Narrativ?
- Methodik

Regeln:

- Keine `file:`-Links.
- Keine öffentlichen `.md`, `.doc`, `.docx` oder `.rtf`-Quellen.
- Keine Absichtsunterstellung ohne Primärquelle.
- Politische Programme als Wirkungsversprechen analysieren, nicht als Personenurteil.
- Wirkung neutral verwenden; bei Sprache und Narrativen sauber zwischen Wirkungspotenzial, Wirkpfad und Wirkungsrisiko unterscheiden.
