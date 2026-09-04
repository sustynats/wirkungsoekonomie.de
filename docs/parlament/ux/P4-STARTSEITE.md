# P4 – Portalstart, berechneter Bestand und verlustfreier Umzug

Ausgangsstand: `fc194b2053f68800c300ecf7974be715ece177ee` (P3 #366 gemergt).
Frischer, sauberer Branch: `codex/parliament-p4-home-20260904`.

## Umsetzung

Sechs Blöcke: Hero → Portalstand → drei Parlamentsradar-Karten → Signatur-Legende → vier Einstiege → Länder-Kartogramm und vier Vertrauenszeilen. Das Browser-Gate misst die tatsächlich sichtbaren Wörter (≤500), nicht nur den JSX-Quelltext.

Keine Änderung an Fachurteilen, kanonischen Daten, Veröffentlichungsfiltern, Root-Tokens, Vercel-Konfiguration oder Release-Controller. Keine neue Fachbewertung aus Metadaten. Zahlen folgen eindeutigen Registerobjekten, veröffentlichten Radar-Vorgängen und expliziten Landesprüfungen. Keine Projektion der Beispielzahlen aus dem UX-Prototyp.

## Vollständige Umzugstabelle

| Bisheriger Startseiteninhalt | Erreichbares Ziel | Erhalt |
|---|---|---|
| Beide Hero-Modi einschließlich langer Leads, Aside, Kernfrage und Dreischritt | `/pruefstandard/methodik` | `OriginalHeroExplanation`; Parlament-Modus zusätzlich tastaturbedienbar aufklappbar |
| Drei Artikel „Was Sie hier bekommen“ | `/pruefstandard/methodik` | `HomeMethodology`, wörtlich; neue vier Einstiege ergänzen nur Navigation |
| Gemeinsame Wirkungsarchitektur | `/pruefstandard/methodik` | gleicher Wortlaut und Sechsschritt |
| EditorialVisual Wirkung/Wirkungspotenzial | `/pruefstandard/methodik` | identisches Asset, Alt-Text, Beschreibung, Link |
| Schulgebäude-Beispiel | `/pruefstandard/methodik` | beide vollständigen Artikel |
| Vier Säulen | `/pruefstandard/methodik` | alle vier Texte |
| Vertrauensabschnitt / Referenzrahmen | `/pruefstandard/transparenz` | `HomeTrust`, vollständiger Langtext |
| Mandat & Praxis, Fachanalysen-Verweis und aktuelle Wirkungsakten | `/monitor` | `HomeMonitorContext`, bisherige Texte und Auswahlregeln |
| Regierungs-Teaser | `/ebenen/bundesregierung` | `HomeGovernmentContext`, gleiche Veröffentlichungs-/Staging-Bedingung |
| Länder-Einführung mit Sachsen-Anhalt-Hinweis | `/ebenen/laender` | `HomeStatesContext`, als bisheriger Einführungstext erreichbar, nicht als neuer Vollständigkeitsanspruch |
| Radar-Geltungsbereich / bisheriger Leerzustand | `/aktuell/radar` | `HomeRadarScope`, jetzt auch bei vorhandenen Vorgängen erreichbar |

Die Bausteine in `HomeContentSections.tsx` wurden mechanisch aus dem vorherigen JSX extrahiert. Die ursprünglichen Datenquellen und dynamischen Falllisten werden weiter genutzt. Der Textbestands-Diff weist jeden erfassten Text samt Zielpfad aus; ein zusätzlicher Test verlangt, dass jeder verschobene Baustein tatsächlich an seiner öffentlichen Zielroute gerendert wird.

## Ehrliche Kennzahlen und Auslassung nach §7

- Aktenzahl: exakt der eindeutige P3-Registerbestand, **nicht** alle Programme, Quellen oder atomaren Zusagen des Portals; keine Behauptung, jede registrierte Akte sei fachlich abgeschlossen.
- Radar: exakt veröffentlichte Datensätze mit bestehendem Typ `RADAR`.
- Reife: vier getrennte Stufen plus eigene Kategorie „Offen / nicht zugeordnet“. Keine Ableitung späterer Wirkung aus abgeschlossener Analyse.
- Datum: jüngstes vorhandenes Aktenstandsdatum, ausdrücklich kein Verifikationsdatum aller Quellen; undatierte Akten separat.
- Länder: genau die Menge des bestehenden Länderregisters. Sachsen-Anhalt „Prüfpaket vollständig“ nur bei erfüllten bestehenden Terminal-Gates des Sechserkorpus. BW/RP bleiben initial; BE/MV Materialitätsreview, kein Vollprogrammabschluss. Übrige Länder ausdrücklich offen.
- **Nicht berechenbar:** „fachlich geprüfte amtliche Quellen“. Es fehlt eine einheitliche explizite Fach-Verifikationsklassifikation im Quellenregister. Kennzahl gemäß §7 ausgelassen und öffentlich in der Zählmethodik erklärt. Quelle vorhanden ≠ Quelle fachlich geprüft; keine Schätzung.
- Die Zählmethodik ist unter `/pruefstandard/transparenz#portalstand` verlinkt.

## Prüfungen

Die bestehende Exact-Head-Preview führt alle P1–P3-Gates weiter und ergänzt P4 bei 320/360/375/390/428/1440 px: sechs Blöcke in Reihenfolge, ≤500 Wörter, source-gebundene Zähler, alle Länder genau einmal, offene Kategorien, echte SVG-Geometrie unter unverändertem CSP, kein horizontaler Überlauf, WCAG-A/AA-Prüfung und Tastaturbedienung der umgezogenen Aufklapper.

Weitere Gates: alle Tests, Typecheck, Lint, vollständiger Production-Build inklusive bestehender Source-vs-View-/Fach-/Golden-Prüfungen und Root-Website-/Such-/Privatsphäre-/Linkgates in GitHub. GitHub-Artefakt ist die commitgebundene Preview. Kein Vercel-Build, keine Production-Promotion. Konkrete Ergebnisse werden mit dem exakten getesteten Head im PR belegt.

## Lokaler Erhaltungsnachweis

172 Textobjekte gegenüber dem P3-Merge, 784 kumulativ gegenüber dem Beginn des Strukturumbaus: jeweils 0 fehlend. Zusätzlich wurden beide bisherigen Home-Modi am unveränderten P3-Produktionsserver gegen die gerenderten neuen Zielseiten verglichen: 73 eindeutige längere Passagen, 0 fehlend. Dieser DOM-Vergleich verwendet normalisierten `textContent`, sodass reine CSS-Großschreibung nicht als Textänderung erscheint. Der aktuelle volle Browserlauf und die Exact-Head-CI bilden die abschließende Abnahme.
