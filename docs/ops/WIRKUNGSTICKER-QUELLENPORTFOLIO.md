# Wirkungsticker: Quellenportfolio und Source Governance

Stand: 5. September 2026

## Ziel

Das Portfolio bleibt so klein wie möglich und so vollständig wie nötig. Maßgeblich sind materieller Informationsgewinn, Aktualität, Quellenfunktion, technische und rechtliche Nutzbarkeit, Dublettenrisiko, Rauschen und Kosten - nicht politische Nähe oder Markenbekanntheit.

## Rollen

- A: aktiv automatisiert überwachen
- B: nur Entdeckungs-/Hinweisquelle
- C: nur fallbezogene Sekundär- oder Gegenquelle
- D: nur Primärquelle für eigene Aussagen oder Daten
- E: vorerst nicht nutzen
- F: ausdrücklich ausgeschlossen

Nur Rolle A darf in den Collector. Dafür müssen offizieller Endpunkt und technischer Zugang verifiziert sowie der Nutzungsstatus hinreichend geklärt sein. Technische Erreichbarkeit ist keine rechtliche Freigabe. Apollo News und NIUS bleiben Rolle F. BILD und WELT bleiben höchstens fallbezogen; eine alleinige Tatsachenbegründung ist ausgeschlossen.

## Audit-Ergebnis

Die maschinenlesbare Coverage-Matrix umfasst 40 Felder. Im Ausgangsaudit sind 27 gut, 12 teilweise und eines kritisch abgedeckt. Die kritische Lücke betrifft Biodiversität. EEA und perspektivisch IPBES sind dafür geeignete Primärquellen, bleiben aber fallbezogen: Der verifizierte EEA-RSS-Endpunkt wird durch die aktuelle robots.txt für automatisierte Abrufe gesperrt.

Neu im gemessenen Probebetrieb sind ausschließlich drei offizielle Heise-Feeds: Wirtschaft, Netzpolitik und Security. Sie schließen Digitalwirtschafts-, Plattform-, KI- und Cyberlücken. Produktmeldungen, Kaufberatung, Routine-Patches und triviale Techniknews werden lokal verworfen. Telepolis bleibt Rolle C, da der zusätzliche Nachrichtengewinn gegenüber Analyse-/Meinungsanteil und Rauschen noch nicht belegt ist. tagesschau.de bleibt Rolle E, weil der Anbieter die RSS-Nutzung auf private, nichtkommerzielle Nutzung begrenzt; das öffentliche Projekt ist nicht privat.

Für Wirtschaft reicht zunächst die Kombination aus Destatis, Bundesbank, EZB, Deutschlandfunk Wirtschaft, WirtschaftsWoche und manager magazin. Handelsblatt, FAZ, Capital, Focus und Börsen-Zeitung werden nicht parallel dauerhaft gepollt. Science, Nature und National Geographic bleiben fallbezogene Forschungsquellen; Europe PMC und Science Media Center bilden den Filter.

## Ereignis- und Agenturlogik

Ein Ereignis wird unabhängig von der Zahl der Artikel als eine Story oder Lageakte geführt. URL, Canonical URL, Titel, Entitäten, Ort, Datum, Ereignistyp, Organisation, Primärquelle und Agenturprovenienz fließen vor jeder Vollanalyse in Dedupe und Clustering ein.

Öffentlich erkennbare Provenienz wird als `dpa`, `reuters`, `afp`, `ap`, `unknown` oder `original_reporting` gespeichert. Mehrere Abdrucke derselben Agenturmeldung zählen nicht als mehrere unabhängige Belege. Eine neue Quelle ohne materiell neue Information ergänzt nur die Quellenliste; ein neuer Fakt aktualisiert die bestehende Story.

## Source Integrity und Zugriffsregeln

Vor Analyse und Veröffentlichung prüft das Source-Integrity-Gate Publisher/Domain, URL, Titel-/Themenpassung, Datum, Entitäten, Primärquellenrolle, Cache-Reste und Clusterkonflikte. Bei Unsicherheit gilt `source_integrity = open` und `publication_status = hold`.

Robots-Regeln werden bei Abruf eingehalten und gecacht. Explizit registrierte RSL-Dateien werden fail-closed geprüft: ein Verbot von `ai-input` sperrt die Quelle, mehrdeutige oder nicht erfüllbare Lizenz-/Reportingbedingungen führen zu HOLD. Eine restriktive Änderung erzeugt einen 24-Stunden-Governance-Hold; danach wird nur die Zugriffsprüfung erneut versucht. ETag, If-Modified-Since, Host-Limits, Timeouts und begrenzte Retries reduzieren Last.

## Funnel, Kosten und Review

Vor jedem KI-Aufruf laufen technischer Filter, URL-/Titel-/Agentur-Dedupe, Event-Clustering, bestehende Story-/Lageaktenprüfung und regelbasierte Materialität. Nur Grenzfälle erhalten eine kurze Klassifikation; nur materiell neue Sachverhalte gehen in die Vollanalyse.

Pro Quelle werden gesehen, lokal verworfen, dedupliziert, bestehender Story zugeordnet, kurz geprüft, voll analysiert, publiziert, aktualisiert, mit Primärquelle ergänzt, durch Integrity gehalten, später korrigiert sowie Token, Kosten und Fetch-/Parsefehler erfasst. Der interne Source Utility Score ist eine Betriebskennzahl, keine Medienqualitätsnote. Eine automatische Review-Markierung setzt frühestens nach acht Läufen und 20 Einträgen ein.

## Taktung und Artefakte

- Kernnetz: stündlich oder technisch angemessen häufig
- Fach-/Blindspotnetz: mehrmals täglich oder täglich
- Fallbezogene Quellen: nur für Verifikation, Gegenquelle, Fakten-/Framecheck oder WÖk-Analyse

Audit erzeugen und validieren:

```bash
npm run news:source-portfolio:audit -- --strict
```

Artefakte:

- `data/wirkungsticker/source-audit-2026-09-05.json`: versioniertes Ausgangsaudit
- `reports/wirkungsticker-source-portfolio.json`: automatisch fortgeschriebener interner Betriebsreport
