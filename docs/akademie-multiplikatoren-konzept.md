# Konzept: Akademie-Bereich „Multiplikator:innen für Wirkungsökonomie"

Status: Vorschlag (Claude-Lane, Design/Content) · Stand 2026-07-08 · zur Abnahme durch Natalie

## Warum

Die Wirkungsökonomie soll nicht über die öffentliche Verfügbarkeit einer einzelnen
Person skaliert werden, sondern über ein tragfähiges Wissens-, Schulungs- und
Multiplikator:innensystem. Der neue Akademie-Bereich qualifiziert Menschen, die die
Methode **erklären, anwenden und weitervermitteln** — unabhängig, qualitätsgesichert
und skalierbar. Er ist die strukturelle Entsprechung zur strategischen Fokussierung
im Pressebereich (`/w/natalie-weber/presse/`).

## Zielgruppen

Coaches · Trainer:innen · Wissenschaftler:innen · Fachautor:innen · Berater:innen ·
Lehrende · Nachhaltigkeits-/Impact-/ESG-Verantwortliche · politische Bildner:innen ·
Journalist:innen · Organisationsentwickler:innen — als Multiplikator:innen für
Unternehmen, Bildung, Politik, Verwaltung, Medien und Zivilgesellschaft.

## Curriculum (10 Module)

1. Grundlagen der Wirkungsökonomie
2. Wirkung, Wirkstoff, Wirkungspotenzial und Wirkungspfad
3. Wirkungsmanagement
4. Wirkungscontrolling
5. Netto-Wirkung, T-SROI, NWI und Impact-of-Investment
6. Wirkungsökonomie in Unternehmen
7. Wirkungsökonomie in Politik und Verwaltung
8. Wirkungskommunikation ohne Greenwashing
9. Umgang mit Medien, Narrativen und gesellschaftlicher Wirkung
10. Abschlussprüfung / Zertifizierung

Die Module knüpfen an bestehende Akademie-Inhalte (Grundstudium, Fachlehrgänge
Wirkungsmanagement/Impact-Controlling) und das Glossar an — Modul 5 z. B. an
`/begriffe/netto-wirkung/`, `/begriffe/impact-of-investment/`,
`/begriffe/wirkungssteuer/`; Modul 2 an `/begriffe/wirkpfad/`,
`/begriffe/wirkungspotenzial/`.

## Rollen / Zertifizierungsstufen (Vorschlag)

- **WÖk-Multiplikator:in** — Grundzertifikat (Module 1–4 + Prüfung): darf die
  Wirkungsökonomie erklären und in Bildungs-/Beratungskontexten einsetzen.
- **WÖk-Trainer:in / Coach** — Aufbaustufe (Module 5–9 + Lehrprobe): darf Schulungen
  und Workshops im Namen der Methode geben.
- **Wissenschaftliche:r / Fachpartner:in** — für Einordnung, Fachgespräche und
  Medienformate als autorisierte:r Ansprechpartner:in (Bezug zum Wirkungsinstitut).

Qualitätssicherung: Prüfung, Praxisnachweis, Wiederzertifizierung; Führung eines
Verzeichnisses autorisierter Multiplikator:innen (perspektivisch), auf das der
Pressebereich verweisen kann.

## Anbindung an die Plattform (statt Discord)

Rollen-, Rechte- und Autorisierungsverwaltung gehören auf die Plattform (Akademie/
Institut), nicht auf Discord (vgl. Snowflake-ID-Fehler in der Discord-Rollenlogik).
Multiplikator:innen-Status = plattformseitige Rolle mit sichtbarer Zertifikatsbasis;
Discord bleibt optionaler Community-Kanal.

## Umsetzungsvorschlag / offene Punkte (für Codex-Kern-Lane)

1. **Website-Teaser** (erledigt in dieser Lane): Abschnitt „Akademie für
   Multiplikator:innen" auf der Presseseite mit Zielgruppen + Modulliste.
2. **Programm-Landingpage** `/akademie/multiplikatoren/` (Claude-Lane, Folge-PR):
   öffentliche Vorstellung, Modulraster, Stufenmodell, „Interesse anmelden"-CTA
   auf das bestehende Kontaktformular.
3. **Akademie-App-Integration** (Codex/Kern): Rollen `multiplikator`, `trainer`,
   `fachpartner`; Kurszuordnung; Zertifikatsausgabe über bestehende
   `build-certificates`-Pipeline; Verzeichnis autorisierter Personen.
4. **Datenschutz:** keine Zertifikatsinhaber-Daten ins Website-Repo — Verzeichnis
   über Akademie-API + geschützte Quelle (vgl. Zertifikat-Privacy-Regel).

## Nächster Schritt

Nach Abnahme dieses Konzepts baue ich (Claude-Lane) die öffentliche Landingpage
`/akademie/multiplikatoren/` im Akademie-Farbraum; die App-/Rollenintegration läuft
über die Kern-Lane.
