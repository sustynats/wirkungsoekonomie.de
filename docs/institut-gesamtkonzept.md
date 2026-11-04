# WÖk-Institut (Wirkungsinstitut / ThinkTank) — Gesamtkonzept

Stand: 2026-07-03
Status: **Arbeitspapier / verbindliche Spec für den Aufbau** (v1)
Domain: `https://institut.wirkungsoekonomie.de`
Verwandte Docs:
- `docs/claude-institut-architecture-handoff.md` — technische Übergabe / Infrastruktur
- `docs/institut-datenmodell.md` — Tabellen, Mandantenmodell, RLS
- `docs/institut-arbeitsteilung-claude-codex.md` — Prozess Claude ↔ Codex
- `docs/institut-entscheidungen.md` — Decision-Log
- `docs/PHASE_2_DISCUSSION_ARCHITECTURE.md` — Vorarbeit Diskursforum
- `AGENTS.md` — WÖk-Leitplanken · `BRAND-GUIDE.md` — Design

> Dieses Dokument beschreibt **was** das Institut ist und können soll. Das **Wie** der Daten
> steht in `institut-datenmodell.md`, das **Wer/Wann** im Prozessdokument. Die drei Docs sind
> die verbindliche Grundlage für alle Bau-Aufgaben (Claude wie Codex).

---

## 1. Auftrag und Abgrenzung

Das **Wirkungsinstitut** ist die Forschungs-, Standardisierungs-, Publikations- und
Projektplattform der Wirkungsökonomie. Es ergänzt die beiden bestehenden Säulen:

| Säule | Domain | Zweck |
|---|---|---|
| **Website** | `wirkungsoekonomie.de` | öffentliche Wissensbasis, Glossar, Suche, Journal |
| **Akademie** | `akademie.wirkungsoekonomie.de` | Lernen, Prüfungen, Zertifikate |
| **Institut** | `institut.wirkungsoekonomie.de` | Wissen **produzieren**: Projekte, Reviews, Publikationen |

**Leitgedanke:** Das Institut ist kein Projektmanagement-Tool für Agenturen, sondern ein
**Wissensproduktionssystem**. Die zentrale Frage ist nicht „Wer macht was bis wann?", sondern
„Wie wird aus einer Idee ein belastbarer, veröffentlichbarer Wirkungsbeitrag?"

**Kernkette:** Idee → Diskussion → Projekt → Aufgabe → Dokument → Review → Veröffentlichung.

**Kein** Institut-Merkmal: keine Personenbewertung, kein Social Credit, keine öffentliche
Rangliste von Menschen, keine amtliche Akkreditierung. (Siehe §8 Leitplanken.)

### Rechtlicher Rahmen (Impressum)
Das Institut ist **kein eigener Rechtsträger**, sondern ein Projektbereich der bestehenden
Plattform. Das vorhandene Impressum gilt subdomainübergreifend (§ 5 DDG: von jeder Subdomain
leicht erkennbar, unmittelbar erreichbar, ständig verfügbar). Ergänzung im Impressum:
> Verantwortlich für journalistisch-redaktionelle Inhalte nach § 18 Abs. 2 MStV: Natalie Weber, [ladungsfähige Anschrift].

---

## 2. Modul-Landkarte

```
Wirkungsinstitut
│
├── Wirkungsboard          → räumliches Brainstorming (Miro-light)
├── Diskursforum           → strukturierte Diskussion (baut auf PHASE_2_DISCUSSION_ARCHITECTURE)
├── Dokumentenwerkstatt    → kollaboratives Schreiben
├── Projektwerkstatt       → Kanban, Backlog, Arbeitszyklen, Aufgaben  ◀ Taktgeber
├── Quellenarchiv          → Studien, Links, Belege, Evidenz
├── Veröffentlichungen     → fertige Outputs (Wirkungscheck, Policy Brief, Dossier …)
├── Methoden               → Begriffe, Standards, Templates
└── Discord-Anbindung      → Calls, Rollen, Community
```

Rollenverteilung der Module:
- Das **Forum** diskutiert. Das **Wirkungsboard** denkt räumlich. Die **Dokumentenwerkstatt**
  schreibt. Die **Projektwerkstatt** organisiert. Die **Veröffentlichungen** machen sichtbar.
- Die **Projektwerkstatt** ist der **Taktgeber**, aber nicht das Zentrum. Das Zentrum bleibt
  die Wissensgenerierung.

**Design-Prinzip Verknüpfung:** Alle Module hängen zusammen. Eine Aufgabe kann verknüpft sein
mit einem Forumthread, einer Wirkungsboard-Karte, einem Dokument, einer Quelle, einer
Veröffentlichung oder einem Discord-Call-Protokoll. So entsteht aus vielen kleinen Beiträgen
ein geordnetes Wissenssystem (technisch: `institut_links`, siehe Datenmodell).

---

## 3. Arbeitsbereiche

Oberste Gliederungsebene. Jeder Arbeitsbereich hat eigenes Backlog, eigene Projekte, eigenes
Kanban, eigene Dokumente, eigene Forumthreads, eigene Boards und eigene Beteiligte.

Start-Set (erweiterbar):
- Wirkungsfinanzpolitik
- Wirkungswirtschaft
- Medien, Demokratie & Narrative
- Klima, Energie & Finanzmarkt
- Bildung & Wirkungskompetenz
- Methoden & Begriffe
- Plattform & Community

---

## 4. Projektwerkstatt (Taktgeber-Modul)

### 4.1 Projekt und Projektseite
Ein **Projekt** ist ein konkretes Vorhaben (z. B. „Wirkungscheck: Gasheizung als Stranded
Asset", „Policy Brief: Wirkungsrente"). Jede Projektseite enthält minimal:

Titel · Kurzbeschreibung · Arbeitsbereich · Status · Ziel/Output · Verantwortliche Person ·
Mitwirkende · Kanban-Board · verknüpfte Dokumente · verknüpfte Forumthreads · verknüpfte
Wirkungsboards · Quellen · Entscheidungen · Nächste Schritte.

### 4.2 Projektarten (nach Output-Typ)
| Projektart | Ergebnis |
|---|---|
| Wirkungscheck | kurzer Analyseartikel |
| Policy Brief | politisches Empfehlungspapier |
| Methodenpapier | Begriff / Methode / Standard |
| Dossier | lange Tiefenanalyse |
| Glossarprojekt | neue Begriffe |
| Plattformprojekt | technische Weiterentwicklung |
| Communityprojekt | Beteiligung / Format / Call |
| Akademieprojekt | Lerninhalt / Kurs / Prüfung |

### 4.3 Kanban-Board (Standardspalten)
`Backlog` → `Zu klären` → `Bereit` → `In Arbeit` → `Review` → `Redaktion` →
`Bereit zur Veröffentlichung` → `Veröffentlicht / Erledigt`

Diese Spalten sind der **Aufgaben-Fluss** (Task-Board). Sie sind **nicht** identisch mit dem
öffentlichen **Projekt-Status** aus §5 (das ist die Außensicht auf das ganze Projekt).

### 4.4 Arbeitszyklen (leichte Sprints, kein Scrum)
Zeitfenster (z. B. 2–4 Wochen) mit: Ziel des Zyklus · ausgewählte Aufgaben aus dem Backlog ·
Verantwortliche · geplantes Ergebnis · Abschlussnotiz. Bewusst schlank — kein Scrum-Theater.

### 4.5 Aufgabenkarten
Pflichtfelder: Titel · Beschreibung · Status · Projekt · Arbeitsbereich · zuständige Person ·
Priorität · Typ · verknüpfte Inhalte. Optional: Fälligkeitsdatum.

Kartentypen: `Idee` · `Recherche` · `These` · `Textaufgabe` · `Review` · `Design/Visual` ·
`Plattform` · `Entscheidung`.

---

## 5. Transparenzmodell

**Leitsatz:** *Öffentlich ist der Weg. Geschützt ist das Rohdenken. Final ist das Ergebnis.*

Transparenz über den **Prozess** — nicht öffentliche Rohheit aller Gedanken. Drei
Sichtbarkeitsstufen (technisch: Feld `visibility` je Objekt):

| Stufe | Wert | Wer sieht es | Inhalte |
|---|---|---|---|
| Öffentlich | `public` | alle | laufende Projekte, Status, Fragestellung, offene Punkte, Quellenbedarf, geplante & veröffentlichte Outputs, Mitwirkende (sofern gewünscht) |
| Mitwirkende | `members` | eingeloggte Rollen | Forum, detaillierte Quellenarbeit, Entwurfs-Kommentierung, Wirkungsboard, Review-Hinweise, Gegenargumente |
| Intern/Redaktion | `internal` | Redaktion/Governance | Rohgedanken, persönliche Notizen, sensible/ungeprüfte Aussagen über Personen/Organisationen, Moderationsentscheidungen, personenbezogene Daten |

### Öffentliche Statuslogik (Projekt-Außensicht)
`Idee` → `Recherche` → `Brainstorming` → `Entwurf` → `Review` → `Redaktion` →
`Veröffentlichungsbereit` → `Veröffentlicht` → `Aktualisiert` → `Archiviert`.

Alle Stufen sind öffentlich sichtbar. **Pflicht-Hinweis** an Entwürfen:
> Entwürfe sind Arbeitsstände. Sie sind nicht zitierfähig und können sich ändern.

### Öffentliche Seite „Aktuelle Arbeiten"
Speist sich direkt aus der DB (`visibility='public'`). Zeigt pro Projekt: Titel, Status,
Arbeitsbereich, Fragestellung, offene Punkte, Quellenbedarf, nächste Schritte, veröffentlichte
Versionen, „Mitwirken"-Hinweis. **Kein** vollständiger Rohentwurf im Default.

Institut-Transparenzsatz (prominent platzieren):
> Das Wirkungsinstitut arbeitet transparent. Laufende Projekte, Arbeitsstände und offene Fragen
> sind sichtbar. Rohentwürfe, interne Redaktionsnotizen und personenbezogene Beiträge bleiben
> geschützt. Ziel ist nachvollziehbare Wissensgenerierung — nicht öffentliche Unordnung.

---

## 6. Rollen- und Rechtemodell (reconciled)

Ein einziges, eindeutiges Modell. Die Projekt-Arbeitsrollen aus der ChatGPT-Ausarbeitung werden
auf die technischen Institut-Rollen des Handoff-Docs gemappt. Supabase bleibt führend für
Berechtigungen; Discord kann Rollen spiegeln/initial vergeben (siehe offene Entscheidung).

| Technische Rolle (DB/Guard) | Arbeitsrolle (Sprache) | Rechte (Kurz) |
|---|---|---|
| *(kein Login)* | Öffentlichkeit | `public`-Inhalte lesen |
| `institut_member` | Registriert / Impulsgeber:in | `members`-Inhalte lesen, Aufgaben/Ideen vorschlagen, kommentieren |
| `researcher` | Mitwirkende:r | eigene Aufgaben bearbeiten, an Projekten/Dossiers mitarbeiten |
| `reviewer` | Reviewer:in | Review-Aufgaben kommentieren, Qualitätsprüfung |
| `editor` | Redaktion | Board organisieren, Veröffentlichung vorbereiten, Publikationspflege |
| `governance` | Projektleitung / Herausgeberin | finale Freigabe, Arbeitsprogramm, sensible Einstellungen |
| `admin` | Technik | technische Administration |

Wichtig: Nicht jede:r darf Karten verschieben/löschen. Schreibrechte sind rollenabhängig
(RLS, siehe Datenmodell).

---

## 7. Minimal-Workflow (Referenzablauf)

1. Thema entsteht im Forum oder Wirkungsboard.
2. Redaktion macht daraus ein Projekt.
3. Projekt bekommt Backlog.
4. Aufgaben werden priorisiert.
5. Arbeitszyklus wird geplant.
6. Aufgaben wandern durch das Kanban.
7. Dokument entsteht in der Dokumentenwerkstatt.
8. Review erfolgt.
9. Veröffentlichung geht online.
10. Projekt wird archiviert.

Einfach, aber vollständig.

---

## 8. WÖk-Leitplanken (verbindlich, aus `AGENTS.md`)

- Wirkung ist neutral und relational; Wirkung = tatsächliche Veränderung von Zuständen.
- Wirkung, Wirkungspotenzial und Wirkungsrisiko klar unterscheiden; Begriffe nie vermischen.
- Positive Wirkung am Referenzrahmen SDGs / Agenda 2030 / SDG+ bewerten; Zielgröße =
  positive Netto-Wirkung.
- Reichweite ist nicht Wirkung. Reporting ist nicht Rückkopplung.
- Nichtkompensation und Reverse Merit Order nennen, wenn Steuerung/Bewertung/Priorisierung
  beschrieben wird.
- WÖk ist keine Planwirtschaft, keine Sprachpolizei, kein Social-Credit-System.
- Keine Personenbewertung, keine moralische Rangliste von Menschen.
- Modellhafte Inhalte immer als Modell / Demo / Entwurf / Arbeitspapier kennzeichnen.
- Inhalte auch für Menschen verständlich, die die WÖk noch nie gehört haben.

---

## 9. Design / Branding

Maßgeblich ist der **offizielle WÖk Brand Guide** (von Natalie geteilt, verbindlich). Das
Institut übernimmt die Marken-Identität, mit eigener Institut-Klarheit (nicht Akademie).

- **Farbwelt:** Navy `#0B1020` · Ivory `#F6F1EB` · Green `#2F7D5C` · Gold `#C89B3C` ·
  Coral `#C85A3C` · Text `#2C2C2E`. Coral **ausschließlich** für Warnung/Risiko/negative
  Wirkung. Wenige Farben pro Seite.
- **Typografie:** Headlines **Playfair Display**; Fließtext **Source Sans 3**; Zahlen/Tabellen/UI
  **Source Sans 3**; Print/PDF **Merriweather**.
- **Logo/Signet:** WÖk-Mark = drei überlappende Ringe (Ivory oben, Grün unten-links, Gold
  unten-rechts) + Kompassnadel im Zentrum, auf Navy. Umgesetzt als `WoekMark`-Komponente;
  App-Icon/Favicon = Navy-Kachel mit dem Mark.

> ⚠ **Zu reconcilen:** `New project/BRAND-GUIDE.md` weicht aktuell vom offiziellen Guide ab
> (Fonts Source Serif 4/Inter, Ivory `#F6F1E8`, Coral `#C85A4A`). Für den Institut-Bau gilt der
> **offizielle Guide**; die Repo-Datei sollte darauf angeglichen werden (Website-Repo → Codex).

---

## 10. MVP-Staging (v1 → v4)

**v1 (MVP):** Arbeitsbereiche · Projekte · einfache Kanban-Boards · Aufgaben · Status ·
Verknüpfung zu Dokumenten/Forum · öffentliche „Aktuelle Arbeiten"-Seite (Transparenz-Kern).

**v2:** Arbeitszyklen · Prioritäten · Verantwortliche · Kommentare an Aufgaben ·
Projekt-Dashboard.

**v3:** Quellenverknüpfung (Quellenarchiv) · Review-Workflow · Benachrichtigungen ·
Discord-Rollen-Sync.

**v4:** Forumsideen → Aufgaben · Wirkungsboard-Karten → Aufgaben · Veröffentlichungs-Pipeline ·
Projektarchiv mit Wissensgraph.

Die technische Umsetzung dieser Stufen ist in der Bau-Roadmap
(`claude-institut-architecture-handoff.md` §13 und Plan) verankert.
