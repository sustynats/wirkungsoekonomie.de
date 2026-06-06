# Sprint 6 Final Launch Review

Stand: 2026-05-22  
Pruefung: Redaktion, Struktur, Navigation, Begriffe, Tools, Visuals, Mobile, SEO, Accessibility und Regression.

## 1. Alle geprueften Seiten

Gepruefter Mindestumfang:

- `/`
- `/verstehen.html`
- `/wirkungsoekonomie.html`
- `/modell.html`
- `/kompass.html`
- `/anwendungen.html`
- `/ordnung/`
- `/akademie.html`
- `/fuer/`
- `/fuer/unternehmen.html`
- `/fuer/politik.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`
- `/fuer/journalismus.html`
- `/fuer/wissenschaft-forschung.html`
- `/fuer/gesundheit.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/anwendungen/scanner.html`
- `/sdg-plus/`
- `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- `/evidenz/`
- `/glossar.html`
- `/methodik/`
- `/downloads/` und `/downloads.html`
- `/blog/` und `/blog.html`
- `/mitmachen/` und `/mitmachen.html`
- `/buch/` und `/buch.html`
- `/natalie-weber.html`
- `/impressum.html`
- `/datenschutz.html`

Zusaetzliche Regression:

- 185 oeffentliche Nicht-Redirect-HTML-Seiten automatisiert auf Title, Meta Description, genau eine H1, Header, Footer und Hauptnavigation geprueft.
- 31 Redirect-/Alias-Seiten geprueft.
- Interner Linkcheck ueber HTML-Dateien: 0 fehlende lokale Ziele.

## 2. Navigationsstatus

Status: abnahmefaehig.

Finale Hauptnavigation ist zentral ueber `assets/data/navigation.json`, `templates/header.html`, `templates/footer.html` und `tools/sync_layout.py` abgebildet:

Start · Verstehen · Modell · Kompass · Fuer wen? · Anwendungen · Ordnung · Akademie · Mehr · Suche

Ergebnis:

- Scanner ist kein Hauptnavigationspunkt.
- Scanner ist unter Anwendungen verlinkt.
- Quellen ist kein Hauptnavigationspunkt.
- Evidenz liegt unter Mehr und im Footer.
- Akademie bleibt Hauptpunkt.
- Mobile Navigation schaltet frueh auf Toggle um.
- Keine oeffentliche Nicht-Redirect-Seite wich im automatisierten Check ab.

Hinweis:

- `/quellen/` bleibt als Quellenregister und Tiefenebene hinter Evidenz erhalten. Sichtbar gefuehrt wird der Bereich als Evidenz.

## 3. Footerstatus

Status: abnahmefaehig.

Footergruppen entsprechen der finalen Struktur:

- Verstehen
- Werkzeuge & Anwendungen
- Lernen
- Projekt
- Rechtliches

Keine abweichenden Footer in den geprueften oeffentlichen Nicht-Redirect-Seiten.

## 4. /fuer/-Seitenstatus

Status: abnahmefaehig, mit fachlicher Review-Kennzeichnung bei sensiblen Modellseiten.

Alle geprueften `/fuer/`-Seiten folgen der Sprint-Dramaturgie:

1. Hero
2. Warum diese Seite wichtig ist
3. Was das alte System falsch misst
4. Welche Fehlsteuerung daraus entsteht
5. Warum Reparatur / ESG / Reporting nicht reicht
6. Was die WÖk grundlegend veraendert
7. Was die Zielgruppe gewinnt
8. Was nicht passiert
9. Wirkungspfad
10. konkretes Beispiel
11. Visual
12. Quellenpanel
13. Weiterfuehrende Links

Besonders geprueft:

- Unternehmen: wirkungsorientiertes Management statt Nachhaltigkeitsmanagement.
- Politik: Reparaturstaat vs. Wirkungsarchitektur.
- Buerger:innen: falsche Signale statt moralischer Ueberforderung.
- Mieter:innen: Wohnen als Wirkungsraum.
- Journalismus: Faktencheck plus Wirkungsanalyse.
- Investor:innen: Kapitalwirkung, keine Anlageberatung.
- Kommunen: lokale Wirkungsraeume und Wirkungshaushalt.
- Akademie: Wirkungskompetenz.
- Wissenschaft & Forschung: WÖk als Forschungsprogramm.
- Gesundheit: Gesundheit als Systemwirkung.
- Rente: Wirkungsbiografie, Basisrente, Wirkungsdividende, Rechner als Modellrechnung.
- Wirkungseinkommen: Grunddividende, Markteinkommen, Wirkungsbonus, Finanzierungsstack als Modellrechnung.

## 5. Tools-Status

Status: abnahmefaehig als MVP / Demo / Konzept, wo entsprechend gekennzeichnet.

Gepruefte Tools:

- WÖk-Kompass: MVP, echte Oberflaeche, kein Chatbot, mit Wissenskarten, Startfragen und Quellenlogik.
- WÖk-Scanner: MVP, Demo-Ersteinschaetzungen, keine finale Bewertung.
- Suche: Vorschlaege, Filter, Synonyme, Wissenskarten, Anwendungen, Downloads und Audio indexiert.
- Glossar: zentrale Begriffsinfrastruktur.
- Wissenskarten: `content/wissen/wissenskarten.json`, im Suchindex enthalten.
- Wirkungseinkommen-Rechner: Modellrechnung / keine Leistungszusage.
- Wirkungsrente-Rechner: Arbeitspapier-Modellrechnung / keine Leistungszusage.
- Downloads: 14 PDFs erhalten.
- Audio-Player: 6 Audiodateien erhalten.

Korrektur in Sprint 6:

- Kompass-Hero mobil beruhigt und vor horizontalem Auslaufen geschuetzt.
- Blog-/Archivartikel erhalten einen einheitlichen Artikelstatus-Hinweis per `assets/js/main.js`, damit aeltere Arbeitsstaende nicht als fuehrender Modellstand gelesen werden.

## 6. Anwendungen-Status

Status: abnahmefaehig.

`/anwendungen.html` arbeitet als Hub, nicht als reine Liste:

- Wirkung analysieren
- Produkte und Maerkte
- Unternehmen und Kapital
- Staat und Gesellschaft
- Lernen und Orientierung

Jede Anwendung benennt Problem, WÖk-Frage, Methode, Status, Beispiel und Vertiefung. Unfertige Anwendungen bleiben sichtbar, aber als Demo, Konzept oder MVP markiert.

## 7. Kompass-Status

Status: abnahmefaehig als MVP.

Geprueft:

- H1 eindeutig.
- Kein Chatbot-Framing.
- Statushinweis gesetzt.
- Audio bleibt erhalten.
- Wissenskarten und Startfragen vorhanden.
- Verknuepfung zu Scanner, Zielgruppen, Glossar und Evidenz vorhanden.
- Mobile-Hero nach Sprint-6-Korrektur visuell kontrolliert.

Mobile-Pruefung:

- Screenshot: `/private/tmp/woek-s6-kompass-mobile-6.png`
- Ergebnis: keine abgeschnittene Hero-Typografie mehr im sichtbaren Bereich.

## 8. Scanner-Status

Status: abnahmefaehig als MVP.

Geprueft:

- `/anwendungen/scanner.html` ist die fuehrende Anwendungsseite.
- `/scanner.html` bleibt als Dossier/Altpfad erhalten und verweist auf die Anwendung.
- Scanner-Modi vorhanden.
- Keine finale Steuerklasse, keine finale Unternehmensbewertung, keine Zertifizierung, keine Anlage-, Rechts- oder Steuerberatung.
- Datenqualitaet, Datenluecken, Wirkungspotenziale und WÖk-Gegenfrage sind sichtbar.

Mobile-Pruefung:

- Screenshot: `/private/tmp/woek-s6-scanner-mobile-2.png`
- Ergebnis: Hero und Statushinweis mobil lesbar.

## 9. Suchstatus

Status: abnahmefaehig.

Search-Build:

- `python3 tools/build_search_index.py`
- Ergebnis: 214 Suchentries aus 194 HTML-Seiten plus 47 kuratierte Eintraege.

Geprueft:

- Filter: Seiten, Glossar, Wissenskarten, Anwendungen, Zielgruppen, Akademie, Blog, Evidenz, Downloads, Audio.
- Synonyme und Vorschlaege ueber Search-Assets vorbereitet.
- Interne Suchziele ohne fehlende lokale Links.

## 10. Audio-Status

Status: erhalten und eingebunden; Transkripte teilweise offen.

Gefundene Audios:

- `assets/audio/die-woek-akademie.mp3`
- `assets/audio/was-die-wirkungsoekonomie-unterscheidet.mp3`
- `assets/audio/wirkungsoekonomie-kurz-erklaert.mp3`
- `assets/audio/von-daten-zum-steuersatz.mp3`
- `assets/audio/grundidee-wirkungsoekonomie.mp3`
- `assets/audio/wirkung-politischer-sprache.mp3`

Bewertung:

- Keine Audiodatei geloescht oder umbenannt.
- Audio-Player auf Startseite, Verstehen, Kompass und politischer Sprache geprueft.
- Fehlende Volltranskripte bleiben als Feinschliff dokumentiert.

## 11. Natalie-Inhalte-Status

Status: abnahmefaehig.

Natalie Weber bleibt sichtbar als:

- Begruenderin der Wirkungsökonomie.
- Autorin.
- Entwicklerin des Modells.
- Physikerin und Nachhaltigkeitsstrategin.
- Verbindungspunkt zwischen Buch, Akademie, Website und WÖk-Systemlogik.

Gepruefte Seiten:

- Startseite mit Begruenderinnen-Box.
- `/natalie-weber.html`.
- Buch- und Akademie-Verlinkung.

## 12. Downloads-Status

Status: abnahmefaehig.

Geprueft:

- 14 PDFs in `assets/pdf`.
- `/downloads.html` strukturiert nach Hauptwerk, Lesereihenfolge und Working Papers.
- `/downloads/` ist noindex-Redirect auf `/downloads.html`.
- Alte Arbeitsstaende werden nicht geloescht.

Offen:

- Bei aelteren PDFs sollte langfristig je Download ein sichtbarer Hinweis auf moegliche aeltere Begriffsstaende gepflegt werden. Kein Launch-Blocker, weil Downloads als Bibliothek/Arbeitsmaterial erhalten bleiben.

## 13. Evidenz-Status

Status: abnahmefaehig.

Geprueft:

- `/evidenz/` ist der oeffentliche Einstieg.
- Quellenregister bleibt als Tiefenebene unter `/quellen/` erhalten.
- Evidenz unterscheidet Theorie, Standards, Daten, Studien, interne WÖk-Grundlagen und Visualnachweise.
- Kein PDF-Friedhof als Hauptlogik.

## 14. Politische Sprache / Frames / Narrative Status

Status: abnahmefaehig und oeffentlich erhalten.

Geprueft:

- Seite bleibt unter `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`.
- Verlinkung zu Scanner, Journalismus, Kompass und SDG+ vorhanden.
- Faktencheck vs. Wirkungsanalyse klar unterschieden.
- Wirkungspotenzial, Frame, Narrativ, Resonanzraum und SDG+ erklaert.
- AfD-Programm-Beispiele bleiben erhalten und methodisch eingeordnet.
- Keine Wahlempfehlung, keine Personenbewertung, keine Parteibeschimpfung.
- Audio bleibt erhalten.

Mobile-Pruefung:

- Screenshot: `/private/tmp/woek-s6-language-mobile-2.png`
- Ergebnis: Hero und Einordnung mobil lesbar.

## 15. Visual-Status

Status: abnahmefaehig.

Geprueft:

- Visual Registry vorhanden: 18 Eintraege in `content/visuals/visual-registry.json`.
- Zentrale Visuals liegen als kontrollierte SVG/PNG/WEBP-Assets vor.
- Zielgruppen-Visuals sind in den `/fuer/`-Seiten eingebunden.
- Keine Sprint-6-Loeschung von Visuals.
- Rejected-Policy bleibt: problematische Visuals nicht loeschen, sondern nach `/assets/visuals/rejected/` verschieben.

Offen:

- Einzelne sehr textreiche Diagramme sollten in spaeterer QA weiter auf mobile Zoom-/Lightbox-Komfort geprueft werden. Kein Launch-Blocker, weil sie aktuell mit Captions und Alternativtexten eingebunden sind.

## 16. Mobile-Status

Status: abnahmefaehig.

Geprueft per Headless-Chrome-Screenshots:

- Startseite: `/private/tmp/woek-s6-index-mobile.png`
- Kompass: `/private/tmp/woek-s6-kompass-mobile-6.png`
- Scanner: `/private/tmp/woek-s6-scanner-mobile-2.png`
- Politische Sprache: `/private/tmp/woek-s6-language-mobile-2.png`

Korrektur:

- Kompass-Hero und Audio-Karte erhielten mobile Breitenbegrenzung und kleinere mobile Hero-Typografie.
- Startseite blieb nach Hotfix ruhig und verstaendlich.

## 17. SEO-Status

Status: abnahmefaehig.

Automatisiert geprueft:

- 185 oeffentliche Nicht-Redirect-HTML-Seiten mit Title.
- 185 oeffentliche Nicht-Redirect-HTML-Seiten mit Meta Description.
- 185 oeffentliche Nicht-Redirect-HTML-Seiten mit genau einer H1.
- Redirect-Seiten besitzen `noindex, follow` und Canonical auf die fuehrende Seite.
- Search-Index neu gebaut.

## 18. Accessibility-Status

Status: abnahmefaehig mit Feinschliff.

Geprueft:

- Skip-Link wird zentral ergaenzt.
- Mobile Navigation hat `aria-expanded` und Escape-Schliessen.
- Scanner und Rechner haben Labels und `aria-live` fuer Ausgaben.
- Audio-Elemente haben Labels/Fallback.
- Visuals haben Alt-Texte und Captions.

Offen:

- Volltranskripte fuer alle Audios.
- Spaetere vertiefte Tastatur- und Screenreader-Pruefung der dynamischen Kompass-/Scanner-Interaktion.

## 19. Offene Blocker

Keine Blocker gefunden.

## 20. Offene schwere Maengel

Keine schweren launch-blockierenden Maengel gefunden.

Bekannte Auflagen:

- Einige Audio-Volltranskripte fehlen noch.
- Aeltere Blog-/LinkedIn-Archivtexte enthalten fruehere Arbeitsstaende und zugespitzte Formulierungen. Sprint 6 ergaenzt einen Artikelstatus-Hinweis, aber eine spaetere redaktionelle Tiefenpruefung bleibt sinnvoll.
- Downloads/alte PDFs bleiben erhalten; pro Download sollte langfristig der Status noch feiner sichtbar werden.

## 21. Feinschliff

- Kompass-/Scanner-MVP spaeter mit echter Datenanbindung und Backend sauber weiterentwickeln.
- Diagramm-Lightbox/Zoom fuer textreiche Grafiken ergaenzen.
- Audio-Transkripte vervollstaendigen.
- Blogarchiv schrittweise mit Status, Stand und fuehrender Ersatzseite anreichern.

## 22. Launch-Empfehlung

Empfehlung: go mit dokumentierten Auflagen.

Begruendung:

- Navigation und Footer sind konsistent.
- Scanner steht korrekt unter Anwendungen.
- Evidenz ersetzt Quellen als oeffentlichen Hauptbegriff.
- Startseite ist geschärft und nicht mehr diagrammlastig.
- `/fuer/`-Seiten tragen die Content-Master-Logik.
- Kompass, Scanner, Suche und Rechner sind als MVP/Modellrechnung gekennzeichnet.
- Politische Sprache / Frames / Narrative bleibt oeffentlich erhalten und methodisch eingeordnet.
- Audio, Natalie-Inhalte, Downloads, Blog und vorhandene Anwendungen wurden erhalten.
- Keine falschen finalen WÖk-Bewertungen oder Leistungsversprechen auf den geprueften Kernseiten.

Launchfaehig bedeutet hier: Die Website ist eine konsistente oeffentliche Systemfassung der Wirkungsökonomie. Sie ist nicht fertig im Sinne eines abgeschlossenen Produkts, aber sie ist nicht mehr eine lose Ideensammlung.
