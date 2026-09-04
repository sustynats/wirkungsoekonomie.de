# Codex-Auftrag — Strukturneubau Wirkungsportal Parlament

**Datum:** 2026-09-03
**Auftraggeberin:** Natalie (Institut für Wirkungsökonomie)
**Lane:** Claude = UX/CD (dieser Entwurf) · Codex = Umsetzung
**Gegenstand:** `parlament.wirkungsoekonomie.de` — App unter `woek-parlament-app/`
**Design-Vorlage (klickbar, drei Artboards):** Artefakt „Wirkungsportal Neubau" — Befund, Zielstruktur, visuelle Sprache, Portalstart, Register, Einzelakte, Regeln. Diese Datei ist die verbindliche Textfassung; bei Abweichung gilt diese Datei.

---

## 0. Auftrag in einem Satz

Das Portal hat starke Inhalte und eine schwache Ordnung. Aus 13 gleichrangigen Navigationspunkten werden fünf Bereiche mit echten Landing-Pages, Übersichtsseiten hören auf, vollständige Analysen zu zitieren, und Ergebnisse bekommen eine feste visuelle Sprache — **ohne dass ein einziger Inhalt entfernt wird.**

---

## 1. Befund (am laufenden Portal überprüfbar)

| # | Befund | Belegstelle |
|---|---|---|
| B1 | **13 gleichrangige Navigationslinks** aus drei unvereinbaren Logiken gemischt: Organe (Bundestag, Bundesregierung, Länder, EU), Inhaltsarten (Wirkungsfälle, Fachanalysen, Abstimmungsbilanz, Quellenarchiv), Portalinfos (Methodik, Transparenz). Keine aktive Markierung, keine Brotkrumen, mobil ein `<details>` mit denselben 13 Zielen. | `app/components/PortalNav.tsx` |
| B2 | **Teaser-Karten rendern die vollständige Kurzbewertung** — Wirkungspotenzial kompakt, Wirkungskern, Key Finding, Wirkungsrichtung, Evidenzstatus, Reality-Check, Einordnungsstand, vier Metazeilen. ~400 Wörter pro Karte, ~1.200 Wörter je Dreierraster. | `app/components/CaseCard.tsx` → `OverviewAssessment` (`compact` kürzt faktisch nichts) + `PublicMaturity` |
| B3 | **Startseite = elf gestapelte Textabschnitte**, davon sechs zu Methode und Selbstverständnis, bevor das erste Ergebnis erscheint. >2.500 Wörter, keine einzige Kennzahl über den Portalbestand. | `app/page.tsx` |
| B4 | **Kein Ergebnisbild.** `directionKind`, Evidenzstatus, `materiality`, Reifestufen und Prüfebenen sind bereits typisierte Werte, werden aber ausschließlich als Fließtextsätze ausgegeben. Vorhandene Visualkomponenten (`ImpactProfileRadar`, `NormativeImpactTiles`, `ImpactReviewMap`, `impact-visuals/*`) erscheinen auf keiner Übersichtsseite. | `lib/presentation/overview-assessment.ts`, `lib/presentation/public-maturity.ts` |
| B5 | **Zwei konkurrierende Navigationen.** `/regierung` bringt eine eigene Unternavigation mit acht Punkten mit, die weder in Benennung noch Logik zur Hauptnavigation passt. | `app/regierung/page.tsx` |
| B6 | **Verwaiste Routen** ohne Menüplatz: `/bevorstehend`, `/im-verfahren`, `/historie`, `/monitor`, `/werkzeuge`, `/abstimmungen`, `/begriffe`, `/suche`, `/fachakten`. | `app/[section]/page.tsx`, `app/*` |
| B7 | **Statusfarben sind nicht unterscheidbar.** Maschinell geprüft: `--farbe-status-ambivalent #825f2d` ↔ `--farbe-status-negativ #a54537` = ΔE 9,1 (normales Sehen, harter Fail unter 15) und ΔE 0,9 (Deuteranopie). Zusätzlich `--farbe-aktion #c8a24a` = 2,35:1 gegen die Kartenfläche. Ausgerechnet die folgenreichste Unterscheidung des Portals ist farblich keine. | `app/tokens.css` |
| B8 | **Titel-Bug:** Bereichsseiten senden den Suffix doppelt, z. B. `Bundesländer · Wirkungsportal Parlament · Wirkungsportal Parlament`. | `app/laender/page.tsx` metadata |

---

## 2. Zielstruktur — fünf Bereiche

Das Ordnungsprinzip existiert bereits: die „Vier Säulen" am Fuß der Startseite. Sie werden zur Navigation.

```
Aktuell                /aktuell
  Parlamentsradar      /aktuell/radar              ← /bevorstehend
  Im Verfahren         /aktuell/im-verfahren       ← /im-verfahren
  Neu veröffentlicht   /aktuell/neu                ← neu
  Radar per E-Mail     /aktuell/radar-abo          ← /wirkungsradar-updates

Wirkungsakten          /wirkungsakten              ← EIN Register mit Facetten
  Einzelakte           /entscheidungen/[slug]      ← bleibt kanonisch, unverändert
  ersetzt als Liste    /entscheidungen · /wirkungsfaelle · /fachakten ·
                       /fachanalysen · /regierung/wirkungsanalysen · /eu/wirkungsfaelle

Wirkungsmonitor        /monitor
  Observatorium        /monitor/observatorium      ← /wirkungsobservatorium
  Reality-Checks       /monitor/reality-checks     ← neu (Filteransicht)
  Versprechen & Praxis /monitor/mandat-und-praxis  ← /mandat-und-praxis
  Abstimmungsbilanz    /monitor/abstimmungen       ← /abgeordnete, /abstimmungen
  Wirkungsgedächtnis   /monitor/historie           ← /historie

Bund, Länder & EU      /ebenen
  Bundestag            /ebenen/bundestag           ← /bundestag
  Bundesregierung      /ebenen/bundesregierung/**  ← /regierung/** (Pfadstruktur 1:1)
  Bundesländer         /ebenen/laender/**          ← /laender/**
  Europäische Union    /ebenen/eu/**               ← /eu/**

Prüfstandard           /pruefstandard
  So prüfen wir        /pruefstandard/methodik     ← /methodik (+ /werkzeuge)
  Referenzrahmen       /pruefstandard/referenzrahmen ← /transparenz#referenzrahmen
  Wirkindikatoren      /pruefstandard/wirkindikatoren ← /methodik/wirkindikatoren
  Begriffe             /pruefstandard/begriffe     ← /begriffe
  Quellenarchiv        /pruefstandard/quellen      ← /quellen
  Über uns & Grenzen   /pruefstandard/transparenz  ← /transparenz

Utility (Kopfzeile):   Suche · Merkliste · Radar abonnieren
```

**Der entscheidende Schnitt:** Ebene und Organ sind keine Bereiche mehr, sondern **Filter**. Derselbe Objekttyp lag bisher unter sechs Pfaden — deshalb ist nicht erkennbar, ob „Wirkungsfälle" eine Teilmenge von „Bundestag" ist oder etwas anderes. `/ebenen/…` bleibt als institutioneller Einstieg bestehen, zeigt dort aber nur noch das Profil des Organs plus eine vorgefilterte Registeransicht.

**Redirects:** Jede in der Tabelle genannte Altroute bekommt eine `permanentRedirect` (308) in `next.config.ts`. `/entscheidungen/[slug]` bleibt unverändert, weil extern darauf verlinkt wird. Kein 404 auf einer heute erreichbaren URL — das ist Teil der Definition of Done.

---

## 3. Visuelle Sprache für Ergebnisse

Sechs Bausteine, jeder mit genau einer Bedeutung, überall identisch. Sie ersetzen keinen Text; sie stehen davor.

### 3.1 Wirkungssignatur — Kernkomponente

Neue Komponente `app/components/ImpactSignature.tsx`. Erscheint überall, wo eine Akte auftaucht: Karte, Registerzeile, Aktenkopf. **Drei getrennte Achsen, nie verrechnet.**

| Achse | Quelle | Darstellung |
|---|---|---|
| **Wirkungsrichtung** | `OverviewAssessmentData.directionKind` / `directionLabel` | Symbolmarke + Wortlaut + Positionsmarke auf einer Achse „entfernt sich ↔ nähert sich" |
| **Evidenz** | Evidenzstatus aus `overview-assessment` | 4 Stufen-Pips, gefüllt bis zum erreichten Grad, Beschriftung „Stufe n von 4" |
| **Reifegrad** | `PublicMaturityProjection.primary` | 4-Punkt-Pipeline: Ex ante → In Umsetzung → Beobachtet → Zugerechnet, aktueller Punkt hervorgehoben |

Zwei Größen: `compact` (Karte/Zeile, nur Marke + Label + Miniachse) und `full` (Aktenkopf, mit Achsenbeschriftung und Hinweistext).

**Der ambivalente Fall:** zwei Marken auf der Achse — eine links, eine rechts — plus eine geteilte Symbolmarke (Grün/Rot je zur Hälfte). **Nie ein Mittelwert, nie eine dritte Farbe.** Das ist zugleich die methodisch richtige Darstellung: ambivalent ist kein dritter Wert, sondern beides zugleich.

### 3.2 Wirkpfad-Kette

`app/components/ImpactChain.tsx`. Vier Glieder: **Entscheidung → Umsetzung → Zustandsveränderung → Zurechnung**. Jedes Glied trägt seinen Evidenzstatus. Glieder ohne Beleg werden gestrichelt umrandet und schraffiert gefüllt, mit Klartext („nicht belegt", „Datenlücke", „offen"). Die Grafik zeigt damit genau das, was das Portal methodisch behauptet: Wissen endet an einer bestimmten Stelle — und diese Stelle ist sichtbar.

### 3.3–3.6 Weitere Bausteine

- **Prüffragen-Ring** — beantwortete von n konkreten Prüffragen, als Ring mit Bruchzahl in der Mitte. Ersetzt den Satz „10 konkrete Prüffragen offen".
- **Referenzchips** — berührte SDGs, SDG+-Prüffelder und Rechtsbezüge als Chip-Gitter. Nur Berührtes leuchtet; unberührte Ziele bleiben sichtbar ausgegraut (das ist die Aussage). **Recht bleibt eine eigene, golden markierte Ebene** und wird nie mit SDGs vermischt.
- **Verfahrensschritte** — horizontaler Stepper aus dem parlamentarischen Status, nur amtlich belegte Schritte mit Datum, künftige Schritte grau ohne Datum.
- **Länder-Kartogramm** — 16 Kacheln in Deutschlandanmutung, eingefärbt nach Fachstand (vollständig analysiert / initialer Fachstand / Materialitätsreview / ausdrücklich offen) mit Zähler je Stufe. Ersetzt drei Absätze auf `/ebenen/laender`, die heute in Prosa erklären, wie unvollständig der Bestand ist. Die Ehrlichkeit bleibt — sie wird in einer Sekunde statt in einer Minute lesbar.
- **Reifeband (Portalstand)** — gestapelte Leiste über den gesamten Aktenbestand nach Reifegrad, mit absoluten Zahlen in der Legende.

### 3.7 Farbkorrektur (aus B7)

```
--farbe-status-positiv       #1f6f5c   bleibt
--farbe-status-negativ       #a54537   bleibt
--farbe-status-bedingt       #c8a24a   bleibt
--farbe-status-offen         #7a8798   bleibt
--farbe-status-ambivalent    #825f2d   ENTFÄLLT als Markenfarbe
```

Ambivalent wird zur **geteilten Marke** aus Positiv und Negativ. Damit sinkt die Zahl der Farbmarken von fünf auf vier; die schlechteste Paarung steigt von ΔE 9,1 auf 18,2 (normales Sehen) — der harte Fail ist behoben.

Verbleibend und **zwingend zu kompensieren**: Positiv ↔ Negativ liegen bei Protanopie bei ΔE 6,9, Gold hat 2,35:1 gegen die Kartenfläche. Beides ist nur mit sichtbarer Zweitkodierung zulässig — **jede Statusmarke führt daher immer Symbol *und* ausgeschriebenen Wortlaut.** Farbe allein trägt nirgends eine Aussage. Kein `title`-Attribut als Ersatz.

Prüfbefehl für die Regression (aus dem dataviz-Toolkit):
`node scripts/validate_palette.js "#1f6f5c,#a54537,#c8a24a,#7a8798" --mode light`

---

## 4. Seitentypen

### 4.1 Portalstart `/` — Zielumfang ≈ 450 Wörter (heute >2.500)

Sechs Blöcke in dieser Reihenfolge:

1. **Hero, kompakt** — H1 unverändert, ein Lead-Satz statt vier, Unabhängigkeitszeile klein, zwei Buttons.
2. **Portalstand** — Kennzahlenband auf Navy: veröffentlichte Akten · Vorgänge im Radar · Länder mit Fachstand (n/16) · geprüfte amtliche Quellen. Darunter das Reifeband. **Alle Zahlen aus dem Bestand berechnen, mit Stichtag ausweisen** — keine gepflegten Konstanten.
3. **Parlamentsradar** — drei Karten im neuen, kurzen Format.
4. **Signatur-Legende** — dreispaltig, erklärt die visuelle Sprache genau einmal.
5. **Vier Wege ins Portal** — Kacheln auf die vier übrigen Bereiche. Ersetzt „Was Sie hier bekommen": aus Beschreibung wird Navigation.
6. **Länder-Kartogramm + Vertrauensband** — Vertrauensband auf vier Zeilen gekürzt, Volltext unter `/pruefstandard/transparenz`.

**Umzug statt Löschung.** Was von der heutigen Startseite wohin geht:

| Heutiger Abschnitt | Neues Zuhause |
|---|---|
| „Was ist Wirkungsökonomie?" (Hero-Aside), „Die gemeinsame Wirkungsarchitektur", „Vier Säulen", Schulgebäude-Beispiel, `EditorialVisual` Wirkung/Wirkungspotenzial | `/pruefstandard/methodik` als zusammenhängende Erklärstrecke — dort stärker als verstreut auf der Startseite |
| „Was Sie hier bekommen" (drei Artikel) | wird zu „Vier Wege ins Portal" |
| Vertrauensabschnitt (Langfassung) | `/pruefstandard/transparenz` |
| Teaser Mandat & Praxis, Fachanalysen | Ziele in „Vier Wege" bzw. `/monitor` |
| Regierungs-Teaser (`GOVERNMENT_STAGING`) | `/ebenen/bundesregierung` |

### 4.2 Karte und Registerzeile — Zielumfang ≤ 60 Wörter (heute ~400)

Neue Reihenfolge in `CaseCard`:

```
[Typ-Chip] [Prüfrelevanz-Chip]
H3 Titel (verlinkt)
Key Finding — EIN Satz, hart auf 140 Zeichen gekürzt
<ImpactSignature compact />
Verfahrensstand · Datum        →  Akte öffnen
```

Was aus der Karte verschwindet und **in der Akte vollständig erhalten bleibt**: „Wirkungspotenzial kompakt", „Wirkungskern", die dreizeilige `overview-assessment-axis`, der komplette `PublicMaturity`-Block, die vierzeilige `case-meta`-Liste.

### 4.3 Register `/wirkungsakten`

- Filterzeile: **Ebene · Organ · Wirkungsfeld · Richtung · Evidenz · Reifegrad**. Filter in einer Zeile über der Liste, Zustand in der URL (`?ebene=bund&richtung=gegenlaeufig`), damit Ansichten teilbar und vorfilterbar sind (`/ebenen/bundestag` verlinkt hierher mit gesetztem Filter).
- **Verteilungsleiste** über der Liste: gestapelt nach Wirkungsrichtung mit absoluten Zahlen in der Legende. Sie beantwortet die häufigste Frage sofort — wie sieht der Bestand insgesamt aus.
- **„Offen / nicht aggregierbar" ist eine eigene Kategorie** mit eigener Zahl in jeder Verteilung, jedem Filter und jeder Legende — nie ein Restposten, nie Null.
- Liste als Zeilen: links Titel + Verfahrensmeta, rechts `<ImpactSignature compact />`.

### 4.4 Einzelakte — drei Tiefen

**Tier 1, sofort sichtbar (≈150 Wörter):** Brotkrumen · Typ-Chips · Lesemodus-Umschalter · H1 · `<ImpactSignature full />` · Key Finding als hervorgehobener Satz · zwei Sätze Worum-geht-es · Wirkpfad-Kette · Referenzchips · Prüffragen-Ring · Verfahrensschritte.

**Tier 2, Reiter:** Sachverhalt · Wirkungsanalyse · Evidenz & Grenzen · Quellen · Verlauf. Hier liegt der heutige Fließtext vollständig.

**Tier 3, Aufklapper:** „Rechenweg, Annahmen und Versionsstand öffnen" — die heutige Transparenzansicht **unverändert**, nur eine Ebene tiefer.

**Seitenspalte (sticky ab 960px):** Status-Liste · „Merken" + „Bei Änderung benachrichtigen" · „Korrektur melden".

**Lesemodus** — vorhandene `AudienceModeSwitch` formalisieren zu zwei Registern:
- *Verständlich* (Standard): kurze Sätze, Fachbegriff beim ersten Auftreten erklärt.
- *Fachlich*: die heutige Fassung mit allen Aussagegrenzen, Qualifikationen und Evidenzeinschränkungen.

Beide Fassungen liegen im Datensatz; der Umschalter blendet um, er kürzt nicht. Der Zustand wird pro Nutzerin in `localStorage` gemerkt.

### 4.5 Bereichsseiten — ein gemeinsames Muster

Alle fünf Bereiche und alle Unterseiten nutzen dasselbe Landing-Muster: Brotkrumen → Bereichs-Unternavigation → H1 + ein Lead-Satz → Kennzahlen oder Visual des Bereichs → Inhalt. **Bereichseigene Sondernavigationen wie heute unter `/regierung` werden aufgelöst.**

---

## 5. Bindende Regeln

| Regel | Begründung / Prüfung |
|---|---|
| **Kein Inhalt wird entfernt** | Jede heute veröffentlichte Passage bleibt erreichbar. Vor jedem Merge ein Textbestands-Diff: entfernte Absätze einzeln als „verschoben nach X" ausweisen. Siehe Nicht-Rückbau-Politik des Projekts. |
| **Keine Gesamtnote, kein Score** | Drei getrennte Achsen. Keine Sortierung nach aggregiertem Wert, keine Rangliste von Fällen, keine Bewertung von Personen, Parteien oder Fraktionen. |
| **Farbe trägt nie allein** | Jede Statusmarke führt Symbol und Wortlaut (Messwerte in §3.7). |
| **Ambivalent ist eine Form, keine Farbe** | Zwei Marken auf der Achse, geteilte Symbolmarke. |
| **Ex ante und ex post bleiben getrennt** | Der Reifegrad ist eine eigene Achse. Späteres Wissen darf nie als damaliges erscheinen — auch nicht implizit über gemeinsame Farbe oder Sortierung. |
| **„Offen" ist eine Kategorie** | Eigener Wert mit eigener Zahl in jeder Verteilung, Legende und Filterliste. |
| **Alle alten URLs bleiben erreichbar** | 308 für jede Altroute; `/entscheidungen/[slug]` unverändert kanonisch. |
| **Ein Navigationsmuster** | Fünf Bereiche, je Bereich dieselbe Unternavigation, darüber Brotkrumen. |
| **Design-Tokens bleiben** | `app/tokens.css` v1.0.0 wird nicht ersetzt. Neu kommen ausschließlich Tokens für Signaturachsen und Reifestufen hinzu. |
| **Neutralitätstest bleibt grün** | `same_case + different_party = identical_verdict` in CI. Keine der neuen Visualisierungen darf Parteibezug als Eingang haben. |

---

## 6. Reihenfolge und Definition of Done

Jede Phase ist ein eigener Branch + PR mit Preview. Kein direkter Push auf `main`.

**P1 · Navigation und Routen** — fünf Bereiche in `PortalNav`, Brotkrumen-Komponente, aktiver Zustand (`aria-current`), mobiles Drawer-Muster, alle 308-Weiterleitungen, Titel-Bug (B8) beheben, verwaiste Routen (B6) einhängen.
*DoD:* Keine heute erreichbare URL liefert 404. Jede Seite hat Brotkrumen und genau einen Platz im Baum. `npm run typecheck` und `npm run lint` grün.

**P2 · Wirkungssignatur** — `ImpactSignature` in beiden Größen, gespeist aus den bereits typisierten Feldern; danach `CaseCard` und Registerzeile auf ≤ 60 Wörter.
*DoD:* Palettenprüfung grün, jede Marke mit Symbol + Wortlaut, Screenreader-Ausgabe nennt alle drei Achsen einzeln, Karte hält das Wortbudget.

**P3 · Register** — `/wirkungsakten` mit Facetten, URL-Zustand, Verteilungsleiste; die sechs Listenpfade werden zusammengeführt und umgeleitet.
*DoD:* Jeder heute gelistete Fall erscheint im Register. Filterkombinationen sind teilbar. „Offen" hat eine eigene Zahl.

**P4 · Startseite** — Kennzahlenband aus dem Bestand berechnet, sechs Blöcke, Methodikstrecke nach `/pruefstandard/methodik` umgezogen.
*DoD:* Umzugstabelle §4.1 vollständig abgearbeitet und im PR belegt; Startseite ≤ 500 Wörter; keine Kennzahl hartkodiert.

**P5 · Einzelakte** — drei Tiefen, Lesemodus, Wirkpfad-Kette, Referenzchips, Prüffragen-Ring.
*DoD:* Der gesamte heutige Aktentext ist auffindbar; Tier-3-Aufklapper enthält die Transparenzansicht unverändert; Lesemodus wechselt Sprache, nicht Substanz.

**P6 · Bereichsseiten** — `/ebenen`, `/monitor`, `/pruefstandard` auf das gemeinsame Landing-Muster; Kartogramm auf der Länderseite; `/regierung`-Sondernavigation aufgelöst.
*DoD:* Ein Navigationsmuster im gesamten Portal; Kartogramm-Zahlen aus dem Bestand berechnet.

**Querschnitt in jeder Phase:** Mobil zuerst prüfen (375 px), Tastaturbedienung vollständig, sichtbarer Fokus, `prefers-reduced-motion` respektiert, Neutralitätstest grün.

---

## 7. Rückfragen an Natalie — nur bei echter Zweifelsentscheidung

Nicht rückfragen zu Benennung, Reihenfolge oder Detailgestaltung; das ist hiermit entschieden. Rückfragen ausschließlich, wenn:

- eine Zusammenführung Daten verlöre, die nicht anderswo abgebildet sind,
- eine Weiterleitung einen extern zitierten Deep-Link brechen würde,
- oder eine geplante Kennzahl im Bestand nicht belastbar berechenbar ist (dann: Kennzahl weglassen und melden, **nicht** schätzen).

---

*Erstellt von Claude (UX/CD-Lane) am 2026-09-03. Klickbare Vorlage: Artefakt „Wirkungsportal Neubau".*
