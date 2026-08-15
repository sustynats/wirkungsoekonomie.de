# Website Quality Review Matrix

Stand: 22. Mai 2026  
Pruefumfang: Sprint-1-Abnahme nach WÖk-Logik, Navigation, Content-Master, Begriffslogik, Visuals, Mobile und Links.

## Pruefmethodik

- Statische Navigation geprueft: alle geprüften Seiten verwenden die Hauptnavigation `Start · Verstehen · Modell · Kompass · Für wen? · Anwendungen · Ordnung · Akademie · Mehr · Suche`.
- `/fuer/`-Seiten gegen Content-Master-Dramaturgie geprueft: Warum, alte Fehlsteuerung, Reparatur-/ESG-Grenze, WÖk-Verschiebung, Nutzen, Was nicht passiert, Wirkungspfad, Beispiel, Quellenpanel.
- Begriffspruefung per Suchlauf gegen Stop-Begriffe; problematische Stellen wurden korrigiert. Verbleibende Treffer sind Negationen wie `keine Personenbewertung` oder `kein Social Credit`.
- Linkcheck auf 213 HTML-Dateien: keine oeffentlich gebrochenen internen Links; nur Template-Platzhalter mit `{{BASE}}`.
- Browser-Stichprobe lokal auf Desktop fuer `/`, `/fuer/unternehmen.html`, `/fuer/politik.html`, `/fuer/wirkungseinkommen.html`, `/fuer/rente.html`, `/wissen/sechster-kondratieff.html`, `/glossar.html`: keine Body-Overflow-Probleme, Navigation konsistent, keine fehlenden Alt-Texte.
- Mobile-Pruefung: CSS-Schaltung auf Burger-Navigation unter 1480 px, keine Wortzerreissung in Hauptnavigation, Visuals in Scrollcontainern bzw. mit Mobile-SVGs. Chrome-Headless-DOM fuer `/fuer/politik.html` erfolgreich geladen.

## Fehlerklassen

| Klasse | Bedeutung |
|---|---|
| A - Blocker | Seite wirkt falsch, Begriffe falsch, Navigation kaputt, alte Inhalte, mobile unbrauchbar. |
| B - Schwerer Mangel | Seite ist online, aber zu duenn, zu generisch, zu ESG-lastig oder visuell schwach. |
| C - Mittlerer Mangel | Inhalt grundsaetzlich richtig, aber einzelne Abschnitte, Links, Visuals oder Begriffe muessen verbessert werden. |
| D - Feinschliff | Typografie, Abstaende, Captions, kleine Textkorrekturen. |

## Seitenmatrix

| Seite | Navigation ok | Content-Master ok | WÖk-Logik ok | Begriffe ok | Visual ok | Mobile ok | Status | Offene Punkte |
|---|---|---|---|---|---|---|---|---|
| `/` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Hero-H1 ist sehr lang, aber mobil abgesichert. |
| `/verstehen.html` | n/a | n/a | n/a | n/a | n/a | n/a | needs_revision | Datei existiert nicht; Navigation nutzt `/wirkungsoekonomie.html`. Optional Redirect/Alias anlegen. |
| `/wirkungsoekonomie.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/modell.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/kompass.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/anwendungen.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig_mit_notiz | Kann in Sprint 2 weiter als Anwendungshub verdichtet werden. |
| `/ordnung/` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/akademie.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/fuer/` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Hub funktioniert als Zugang in Wirkungsraeume. |
| `/fuer/unternehmen.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Content-Master und Zusatzlogik zu Fuehrung, Kultur, Mitarbeitenden, Resilienz umgesetzt. |
| `/fuer/politik.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Status ist `veröffentlicht`. |
| `/fuer/buergerinnen.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/fuer/mieter.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Status ist freigegeben/veröffentlicht. |
| `/fuer/investoren.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig_mit_hinweis | Anlageberatungs-Disclaimer vorhanden. |
| `/fuer/kommunen.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/fuer/akademie.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/fuer/journalismus.html` | ja | ja | ja | ja | ja | ja | abnahmefaehig | Keine Blocker. |
| `/fuer/wissenschaft-forschung.html` | ja | ja | ja | ja | ja | ja | needs_review | Fachliche Freigabe offen; Status bewusst `needs_review`. |
| `/fuer/gesundheit.html` | ja | ja | ja | ja | ja | ja | needs_review | Fachliche Freigabe offen; Status bewusst `needs_review`. |
| `/fuer/rente.html` | ja | ja | ja | ja | ja | ja | needs_review | Modellrechnung korrekt markiert; fachliche/fiskalische Freigabe offen. |
| `/fuer/wirkungseinkommen.html` | ja | ja | ja | ja | ja | ja | needs_review | Modellwert 2.000 Euro und Rechner klar als Modellstand; fachliche/fiskalische Freigabe offen. |
| `/evidenz/` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Oeffentliche Bezeichnung `Evidenz`, nicht Hauptnavigation `Quellen`. |
| `/glossar.html` | ja | n/a | ja | ja | ja | ja | abnahmefaehig | Problematische Preis-/Positivwirkungsformulierung korrigiert. |
| `/methodik/` | n/a | n/a | n/a | n/a | n/a | n/a | needs_revision | Kein `/methodik/index.html`; Footer zeigt auf `/methodik/datenbasis.html`. Optional Hub/Redirect anlegen. |
| `/sdg-plus/` | n/a | n/a | n/a | n/a | n/a | n/a | needs_revision | Kein `/sdg-plus/index.html`; kanonische Seite ist `/sdg-plus.html`. Optional Redirect/Alias anlegen. |

## Wichtigste Befunde

- Keine A-Blocker in den Sprint-1-Kernseiten.
- Die `/fuer/`-Seiten tragen die WÖk-Logik und wirken nicht wie ESG-Beratung. ESG/CSRD erscheinen als Anschlussraeume, nicht als Primaerlogik.
- `verstehen.html`, `methodik/index.html` und `sdg-plus/index.html` sind Alias-/Routing-Fragen, keine inhaltlichen Blocker.
- Sensitive Seiten mit Modell- oder Beratungsnaehe sind entweder `veröffentlicht` oder bewusst `needs_review` markiert.

