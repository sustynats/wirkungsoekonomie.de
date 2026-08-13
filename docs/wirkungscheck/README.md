# Wahlkreis-Wirkungscheck — UX-Handoff

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Vollständiger Design- und UX-Handoff für den Wahlkreis-Wirkungscheck, einen
parteiunabhängigen Wirkungscheck für Mitglieder des Deutschen Bundestages.

## Dokumente

| Datei | Inhalt |
|---|---|
| [UX_SPEC.md](UX_SPEC.md) | User Journey, Seiten, Zustände, Interaktionen, responsive Regeln, Abnahme |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Farben, Typografie, Abstände, Radius, Schatten, Icons, States, Accessibility |
| [COMPONENTS.md](COMPONENTS.md) | Alle Komponenten mit Props und Varianten |
| [COPY.md](COPY.md) | Alle sichtbaren Texte mit stabilen Schlüsseln |
| [RESULT_EXPLAINABILITY.md](RESULT_EXPLAINABILITY.md) | UX-Konzept für „Warum wird mir das vorgeschlagen?" |
| [SCREENS.md](SCREENS.md) | Alle Screens und Zustände, Messwerte der Abnahme |

Empfohlene Lesereihenfolge für die Umsetzung: UX_SPEC, dann DESIGN_SYSTEM,
dann COMPONENTS. RESULT_EXPLAINABILITY ist die inhaltlich anspruchsvollste
Stelle und definiert das Kernfeature.

## Prototyp

```
werkzeuge/wahlkreis-wirkungscheck/index.html
assets/css/wahlkreis-wirkungscheck.css
assets/js/wahlkreis-wirkungscheck/app.js
assets/js/wahlkreis-wirkungscheck/mock-data.js
```

Der Prototyp ist ein **Gestaltungsprototyp**, keine Vorstufe der Produktion.
Er dient der Abnahme von Interaktion, Layout, Bedienbarkeit und Tonalität.

Lokal starten, nicht über `file://` öffnen, sonst greift die Content Security
Policy nicht und Skripte werden blockiert:

```bash
python3 -m http.server 8731
```

Danach `http://localhost:8731/werkzeuge/wahlkreis-wirkungscheck/index.html`.

### Was der Prototyp kann

Landing, Wahlkreis-Suche mit Combobox, zehn Fragen mit allen Antworttypen,
Antworten prüfen, Ladezustand, vollständiger Report, Herleitungs-Drawer,
Wirkpfad in zwei Ansichten, Quellen-Drawer, Sensitivität, Politik-Kit,
Forschungs-Opt-in, Vertrauens-Drawer, lokales Löschen.

### Was der Prototyp nicht kann

Keine Recommendation Engine. Die Regeln, Wahlkreisdaten, Indikatorwerte, Quellen
und Handlungspfade sind erfunden und in `mock-data.js` als solche markiert. Der
Regeltext im Herleitungs-Drawer ist fest hinterlegt und reagiert nicht auf die
Eingaben; im Drawer steht das ausdrücklich. Die Screens S-12 sowie S-19 bis S-23
sind spezifiziert, aber nicht interaktiv gebaut.

Keine Datenübertragung. Kein Analytics, kein `main.js` der Website, keine
Dienste Dritter. Antworten liegen ausschliesslich unter `wc_state_v1` im
`localStorage`.

## Vor einer Veröffentlichung zwingend

1. `mock-data.js` vollständig durch geprüfte Daten ersetzen.
2. Regelwerk deterministisch definieren, siehe RESULT_EXPLAINABILITY §4.
3. Themenliste in Frage 1 redaktionell auf Ausgewogenheit prüfen und freigeben.
   Das ist die politisch heikelste Stelle des Produkts.
4. Betreiberangaben, Kontakt und Datenschutztexte eintragen, alle mit
   **[ENTWURF]** markierten Stellen in COPY.md auflösen.
5. Rechtliche Prüfung der Opt-in-Texte und des Veröffentlichungsverfahrens.
6. Unabhängige Zweitprüfung der Neutralität, analog zum Wirkungswahl-Kompass.
7. `noindex, nofollow` und den Prototyp-Hinweis erst danach entfernen.

## Grundregeln, die nicht verhandelbar sind

- Keine Bewertung von Personen, keine Rangliste, keine Wahlempfehlung.
- Keine Parteifarben als semantische Hauptfarben, keine Ampeln.
- Keine Bedeutung allein durch Farbe.
- Keine Empfehlung ohne sichtbaren Bezug zur Eingabe und ohne Regel-ID.
- Kein Zahlenwert ohne Quelle oder Kennzeichnung als Annahme.
- Datenlücken werden ausgewiesen, nicht überbrückt.
- Keine Einwilligung vor dem persönlichen Nutzen, keine Vorauswahl.
