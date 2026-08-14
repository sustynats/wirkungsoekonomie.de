# Wirkungsportal Parlament — Informationsarchitektur

Stand: 2026-08-14 · Grundlage: Master-Prompt §7/§8, `docs/woek-knowledge/PARLIAMENT_REUSE_MAP.md`, `UX_ECOSYSTEM_MAP.md`.

## Routenbaum (MVP-Zuschnitt fett)

```
parlament.wirkungsoekonomie.de
├── **/**                        Portalstart (Erstnutzer + Wiederkehrer)
├── **/bundestag/**              Parlamentsübersicht (MVP = einziges Parlament)
├── **/bevorstehend/**           Radar: bevorstehende Beratungen/Entscheidungen
├── /im-verfahren/               laufende Verfahren
├── **/entscheidungen/**         alle analysierten Vorgänge (Archivliste)
│   └── **/entscheidungen/<slug>/**  Dauerseite je Entscheidung (Lebenszyklus-Seite!)
│       ├── (Anker) #60-sekunden · #interaktiv · #dossier · #wirkpfad · #gegenprobe
│       │           #quellen · #versionen · #region · #werkzeuge · #ki
│       └── /entscheidungen/<slug>/fassung/<version_id>/   eingefrorene Fassungsansicht
├── /historie/                   historische Wirkungschecks (RETROSPECTIVE_CASE)
├── /monitor/                    Wirkungsmonitor beschlossener Entscheidungen
├── /dialog/                     Wirkungsdialog (Umfragen Parlament/Öffentlichkeit)
├── /werkzeuge/                  kontextueller WÖk-Werkzeugkasten (verlinkt Bestands-Tools)
├── /methodik/                   Entscheidungsstandard, Begriffe (verlinkt Glossar), Skalen
├── **/transparenz/**            Trust Center (inkl. /unabhaengigkeit als Kernseite)
│   ├── /transparenz/unabhaengigkeit/   Herausgeber, Finanzierung, Firewall
│   ├── /transparenz/auswahl/           Wirkungsrelevanz-Standard („Warum prüfen wir das?")
│   ├── /transparenz/korrekturen/       öffentliche Korrekturhistorie
│   └── /transparenz/ki/                Was die WÖK-KI darf/nicht darf
└── /api/parliament/…            read-only JSON (Codex; Muster /api/v1/)
```

Zukunftsfähig: `/europa/…` als Parallelast; alle Inhalte tragen `parliament_id/jurisdiction/legislative_term` (nur Datenmodell, keine UI im MVP).

## Navigationsmodell

- **Hauptnav (schlank, 6 Punkte)**: Anstehend · Entscheidungen · Historie · Monitor · Dialog · Methodik & Transparenz. Logo-Zeile = Portalname + Herausgeberzeile (Institut).
- **Utility**: Suche · Modus-Schalter „Für alle / Für Parlament" · Link „Wirkungsökonomie.de" (Rückweg ins Ökosystem).
- **Kein** Übernehmen der Website-Hauptnav — das Portal ist eine eigene Tür; Bindegewebe sind Glossar-Hover, Quellen-Drawer und Ausleitungen (Akademie/Bibliothek/Werkzeuge), nicht die Navigation.
- Footer: Institut (Impressum/Kontakt `wirkungscheck@wirkungsoekonomie.de`) · Transparenz-Links · Methodik · Datenschutz · keine Partei-/Kampagnenlinks.

## Die Entscheidungsseite als Dauerseite (zentrales IA-Muster)

Eine URL pro Vorgang, die den Lebenszyklus trägt (Entwurf→Beratung→Abstimmung→beschlossen→Umsetzung→Monitor→Ex-post). Der Seitenkopf zeigt immer: Kurztitel (Alltagssprache) + Originaltitel, Phase (Stepper), Termin, analysierte Fassung, Analyse-Status, Empfehlung (falls freigegeben). Danach die drei Nutzungstiefen als klar getrennte Abschnitte: **60 Sekunden** (immer zuerst, mobil = erster Viewport), **Interaktiv prüfen** (Szenario-Auswahl → deterministische Sofortreaktionen), **Fachdossier** (15-Punkte-Struktur §15 mit Ebenen-Kennzeichnung). Monitoring ersetzt nichts, sondern kommt als Abschnitt dazu, sobald beschlossen.

## Seitentypen-Inventar

| Typ | Muster | Reuse |
|---|---|---|
| Portalstart | Hero + „Diese Woche" + Pillar-Erklärung + Unabhängigkeitserklärung | Decision Card |
| Radarliste (bevorstehend/im-verfahren/entscheidungen/historie/monitor) | filterbare Card-Liste (Phase, Politikfeld, Relevanz, Status) | eine Listen-Komponente, 5 Konfigurationen |
| Entscheidungsseite | s.o. | Kernseite |
| Fassungsansicht | eingefrorene Analyse + Banner „historische Fassung" | Bibliotheks-Statuslogik |
| Dialog | Umfrage-Karten + Ergebnisdarstellung (n, Zeitraum, Unsicherheit, „kein Wirkungsnachweis"-Hinweis) | Akademie-Einreichungsmuster |
| Methodik/Transparenz | Editorial-Langform mit Ankern | Onlinefassungs-Muster |
| Werkzeugkasten | kontextuelle Tool-Karten je Falltyp | instruments-2026 + tool-registry |

## Modus-Logik (Public/Parlament)

Ein Schalter, ein Inhaltsbaum: Parlament-Modus blendet ZUSÄTZLICHE Blöcke ein (Drucksachen-Liste, Ausschüsse, Änderungsanträge, Prüffragen, Kurzbrief zum Kopieren, tiefere Evidenztabellen). Public-Modus zeigt Übersetzungsblöcke („Was bedeutet Ja/Nein?"). Voten, Zahlen und Quellen sind in beiden Modi identisch — der Schalter ändert Tiefe, nie Inhalt. Zustand in URL (`?modus=parlament`) für teilbare Links.

## Suche & Auffindbarkeit

Portal-Suche über Entscheidungen (Titel, Kurztitel, Politikfelder, Drucksachen-Nr.); Glossarbegriffe führen zum Website-Glossar (Hover-Definition lokal). Jede Entscheidungsseite: sprechende Slugs (`/entscheidungen/<thema-jahr>/`), stabile Anker, Canonical, strukturierte Meta (Termin, Phase, Fassung).
