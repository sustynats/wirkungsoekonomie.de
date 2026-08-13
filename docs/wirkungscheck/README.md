# Wahlkreis-Wirkungscheck - Produkt- und UX-Dokumentation

Version 2026.4 · Stand 2026-08-13 · UX-Handoff und Produktumsetzung

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

## Öffentlicher Fragebogen

```
werkzeuge/wahlkreis-wirkungscheck/index.html
assets/css/wahlkreis-wirkungscheck.css
assets/js/wahlkreis-wirkungscheck/app.js
assets/js/wahlkreis-wirkungscheck/data-2025.js
assets/js/wahlkreis-wirkungscheck/check-config.js
assets/js/wahlkreis-wirkungscheck/instruments-2026.js
assets/js/wahlkreis-wirkungscheck/rules.js
scripts/wahlkreis-wirkungscheck/build-district-data.mjs
scripts/wahlkreis-wirkungscheck/validate-check.mjs
```

Der veröffentlichte Fragebogen ist ein lokales Werkzeug: Bundespolitik ist der
Kern, der freiwillig gewählte Wahlkreis liefert die Rückkopplung vor Ort. Er
bewertet keine Personen, Parteien oder Wahlchancen.

Lokal starten, nicht über `file://` öffnen, sonst greift die Content Security
Policy nicht und Skripte werden blockiert:

```bash
python3 -m http.server 8731
```

Danach `http://localhost:8731/werkzeuge/wahlkreis-wirkungscheck/index.html`.

### Was der Fragebogen kann

Amtliche Suche über alle 299 Wahlkreise einschließlich Verwaltungs-PLZ als
Suchhilfe, einen zusammenhängenden Fragebogen mit neutralem Kern und sechs
versionierten Instrumentenmodulen, Antworten prüfen, vollständiger lokaler Report,
deterministische Prüfpfade mit Regel-ID, unmittelbare Wirkungsvorschau während
der Auswahl, themen- und rollenbezogene Wirkungsketten, getrennte Bundes- und
Wahlkreisebene, Gesamtwirkungsbilanz ohne Punktzahl, direkten und indirekten
Folgen, Wirkungsrisiken, Quellen-Drawer, Sensitivität, Politik-Kit und
Lernlinks zur Wirkungsökonomie.

Der neutrale Kern wird vor dem Instrumententeil als Diagnosegrundlage lokal
fixiert. Instrumentenantworten können diese Diagnose nicht verändern. Wird eine
Kernangabe oder der Wahlkreis danach geändert, werden die Instrumentenantworten
lokal gelöscht und innerhalb desselben Fragebogens erneut erhoben. Die
Instrumente sind ausschließlich datengetrieben in `instruments-2026.js`
beschrieben; sie erzeugen weder einen WÖK-Score noch eine Personen-, Partei-
oder Wahleinschätzung.

### Daten, Regeln und Datenschutz

Die Wahlkreis- und Strukturdaten stammen aus den verlinkten Datensätzen der
Bundeswahlleiterin. Zeitstand, Ebene, territorialer Hinweis und Lizenz stehen
an jeder Quelle. Die Regeltexte und Themenprofile sind deklarativ. Aus
Schwerpunkt, Bundesrolle, Engpass und roten Linien entsteht eine konkrete
Wirkannahme: direkter Eingriff, Folgekette, prüfbare Signale, notwendige
Zusatzdaten und nicht kompensierbare Risiken. Sie ist als Modellannahme
kenntlich, nicht als Kausalitätsbehauptung. Regelpfade werden nur angezeigt,
wenn jede Bedingung einen freigegebenen Text hat. Fehlt er, lautet die sichtbare
Meldung exakt: „Die Herleitung dieser Regel ist noch nicht freigegeben."

Die regelbasierte Auswertung lädt weder `main.js` noch Tracking- oder
Analyse-Dienste. Antworten liegen ausschließlich unter `wc_state_v1` im
`localStorage`. Eine einzige Netzwerkverbindung ist eng in der CSP freigegeben:
der WÖK-KI-Dienst. Sie wird ausschließlich nach aktiver Einwilligung im
Reportabschnitt „Persönliche WÖK-KI-Auswertung“ ausgelöst. Übergeben werden nur
die dort offengelegten Wirkungsangaben und ein optionaler Hinweis, nie Name,
E-Mail-Adresse, Fraktion, Partei oder Wahlchance. Die lokale KI-Auswertung kann
einzeln gelöscht, als Textdatei gespeichert oder nach einer zweiten, nicht
vorausgewählten Bestätigung über einen selbst enthaltenen Freigabelink geteilt
werden. Ein solcher Link enthält die Auswertung und ihre Analysegrundlage im
Fragment; er wird nicht als Freigabeobjekt auf der Website gespeichert. Der
getrennte Analytics- und Betriebsdienst ist unter
`ops/wahlkreis-wirkungscheck/` dokumentiert, aber nicht an den öffentlichen
Fragebogen angeschlossen und wird nicht ohne eigenen Freigabeprozess aktiviert.

## Release-Prüfung

1. `node scripts/wahlkreis-wirkungscheck/validate-check.mjs` ausführen.
2. Daten- oder Regeländerungen nachvollziehbar prüfen; keine Regel ohne Text
   publizieren.
3. Die freiwillige WÖK-KI-Auswertung mit einer nicht-personenbezogenen Testantwort
   prüfen: ohne Einwilligung darf kein Request entstehen; die übermittelte
   Grundlage muss vollständig im Report sichtbar sein. Download, Druckansicht
   und Freigabelink müssen ausschließlich dieselbe sichtbare Grundlage
   enthalten; der Freigabelink braucht eine zweite Bestätigung.
4. Die allgemeinen Website-Gates für Suche, Taxonomie, Datenschutz, URLs und
   öffentliche Artefakte bestehen lassen.
5. Einen späteren Versand, Forschungsbeitrag oder Import von Kontaktdaten erst
   mit eigenem, dokumentiertem Freigabeprozess aktivieren.

## Grundregeln, die nicht verhandelbar sind

- Keine Bewertung von Personen, keine Rangliste, keine Wahlempfehlung.
- Keine Parteifarben als semantische Hauptfarben, keine Ampeln.
- Keine Bedeutung allein durch Farbe.
- Keine Empfehlung ohne sichtbaren Bezug zur Eingabe und ohne Regel-ID.
- Kein Zahlenwert ohne Quelle oder Kennzeichnung als Annahme.
- Datenlücken werden ausgewiesen, nicht überbrückt.
- KI-Auswertung nur nach aktiver, nicht vorausgewählter Einwilligung; ihre
  Übergabegrundlage bleibt im Report sichtbar.
- Keine Einwilligung vor dem persönlichen Nutzen, keine Vorauswahl.
