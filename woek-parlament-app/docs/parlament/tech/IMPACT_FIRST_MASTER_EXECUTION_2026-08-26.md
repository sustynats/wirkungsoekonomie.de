# Parliament Impact-First Masterausführung · 26.08.2026

> **Wirkungsbild-Update 27.08.2026:** Der finale 12/12-Asset-Handoff ersetzt
> ausschließlich den unten beschriebenen Bildstatus. Die später in
> #238/#240/#241 festgestellte Berlin/MV-Fachremediation bleibt davon
> unberührt und verhindert weiterhin jeden Parliament-Runtime-Release.

## Ergebnis

Der nach aktueller Governance zulässige GitHub-Zustand ist vollständig
materialisiert. Berlin ist für alle zwölf verifizierten finalen Programme
fachterminal. Mecklenburg-Vorpommern ist für alle zwölf verifizierten finalen
Programme fachterminal; sieben weitere Listeneinträge bleiben bis zur
Verifikation eines amtlichen finalen Programm-Artefakts fail-closed.

Sachsen-Anhalt ist 6/6 Impact-First veröffentlicht vorbereitet: kompakte
Programmvergleiche, Detailansichten, sechs korrigierte
`PROGRAM_SCENARIO`-v2-Bilder und sechs getrennte `CASE_SCENARIO`-Bilder sind
vollständig. Für alle zwölf Assets sind Hash, Alt-Text, Provenienz und finaler
Bild-Signoff gebunden; aus dem Bild wurde keine Fachinformation erzeugt.

- Ausgangs-`main`: `186e208e9da860e1aa0391faca9c1feeae9ae3f9`
- Browsergeprüfter Code-Commit: `a4ec39976f4c6c9dc7cf3752644af572b313f1cc`
- Release-Sperre: `NO_NEW_VERCEL_BUILD=true`
- Release-Freigabe: `PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`
- Route-Matrix: `data/executive-impact/route-coverage-v1.json`
- Nicht blockierende Projektionen: `data/executive-impact/nonblocking-projection-inventory-v1.json`
- Executive-Vertrag: `data/contracts/executive-impact-summary.schema.json`
- Visual-Descriptor: `data/impact-visuals/sachsen-anhalt-2026-v1.json`

## Vollprogramm-Coverage

| Korpus | Status | Nachweis |
| --- | --- | --- |
| Berlin | PASS · 12/12 terminal | 1.293 PDF-Seiten plus Die-PARTEI-HTML; 22.334 terminale Objekte; 78 explizite Fachfreigaben/-wiederverwendungen; 19.629 exakt begründete `REVIEWED_NOT_ASSESSABLE`; 2.627 Kontexte; 0 offen; Descriptor `c8c575cf2ae580773418662603774ced5dde4056e5a04aa33317194049833e7c`. |
| Mecklenburg-Vorpommern, verifizierter Teilkorpus | PASS · 12/12 terminal | 896 Seiten; 8.712 Source Units; 7.494 Effekt-Atome; 11.395 terminale Objekte; Descriptor `f5c0696f9e8c10ece572f26c7188cb97fa99f35a0ce7288d00960735e2523b71`. |
| Mecklenburg-Vorpommern, sieben weitere Listeneinträge | EXTERNAL_BLOCKER | Tierschutzpartei, Die PARTEI, ÖDP, Handwerker Partei Deutschland, KPD, Team Freiheit und WIR LEBEN DEMOKRATIE benötigen jeweils zuerst ein verifiziertes amtliches finales Programm-Artefakt. Ohne Quelle keine Fachbewertung. |

Die vollständigen maschinenlesbaren Matrizen liegen unter
`data/state-programmes/fach-content-residuals/`. Kein Programmeintrag wird aus
Parteiname, Schlagwort, Template, Score oder Quelltext technisch bewertet.

## Impact-First- und P0-Korrekturstatus

| Gegenstand | Status | Nachweis / Grenze |
| --- | --- | --- |
| Vollständiges Route-zu-Impact-Audit | PASS | 18 öffentliche Route-Familien: 6 `PASS`, 6 korrekt `NOT_APPLICABLE`, 6 mit endlichem `EXTERNAL_BLOCKER`. |
| Kernaussage und Relevanz vor Prozessdaten | PASS | Gemeinsame Executive-Ansicht und route-spezifisch korrekte fail-closed Zustände. |
| Sachsen-Anhalt Überblick 6/6 | PASS | Zwei-Spalten-Vergleich; Karte je 378-396 px bei 1.440 px; Gesamtbefund, MPD, höchstens drei SDG/SDG+, höchstens drei materielle Pfade, Evidenz und Schutzgrenze. |
| Stärkster AfD-Befund | PASS | Materielle negative Systemrisiken für Demokratie, Gleichbehandlung und Zugehörigkeit stehen vor Einzelmaßnahmen und Prozessdaten. |
| Mensch / Planet / Demokratie | PASS_FAIL_CLOSED | Nur explizit freigegebene Richtung, Materialität und Evidenz; fehlende Evidenz ist nie neutral. |
| SDG / SDG+ | PASS_FAIL_CLOSED | Nur explizite Referenzen und Richtungen; `SDG+` bleibt als WÖk-Erweiterung bezeichnet. |
| Materielle Pfade | PASS_FAIL_CLOSED | Drei im Überblick, höchstens fünf im Detail; keine technisch erzeugte Rangfolge. |
| Nichtkompensation | PASS | Schutzgrenzen stehen sichtbar vor Evidenz/Prozess; positive Einzelpfade verrechnen keine kritischen Risiken. |
| Evidenz, Unsicherheit und Reality Check | PASS | Von Wirkungsaussage und Richtung getrennt. |
| Kommunikationswirkung | PASS | Separater Fachstrang; keine Rückprojektion in Programmanalyse. |
| Sachsen-Anhalt Programmbilder | PASS_6_OF_6_V2 | Sechs eigenständige freigegebene `PROGRAM_SCENARIO`-v2-Assets mit unveränderten vier Editorial-v2-Pfaden, Provenienz, kanonischem Alt-Text und Aussagegrenzen; die alten v1-Dateien sind nicht mehr current public. |
| Sachsen-Anhalt Case-Deep-Dives | PASS_6_OF_6 | Sechs getrennte Case-Assets; Case-Auswahl, Brief, Pfadbindung, No-Marker-Entscheidung, nicht visualisierbare Wirkungen, Evidenz, Unsicherheit, Alt-Text und `FINAL_IMAGE_SIGNOFF=APPROVED` sind vollständig. Programmbilder werden nie wiederverwendet. |
| Kein Partei-Score / keine Recommendation-/DNS-Synthese | PASS | Automatisierte Fach- und UI-Gates. |
| Mobile / Responsive | PASS_BROWSER_AND_GATE | Überblick und AfD-Detail bei 320, 360, 375, 390 und 428 px ohne horizontalen Überlauf; 1.440-px-Referenz ebenfalls ohne Überlauf. |
| Accessibility | PASS | 109 Quellfiles automatisiert geprüft, 0 Findings; Text, Symbol und Farbe; semantische Reihenfolge und zugängliche Controls. |
| Build / Golden State | PASS | Produktionsbuild; 240/240 Routen; 17.033/17.033 Inhalts-Pfade; Regierung 63, EU 21, Parlament 28, Recommendations 13, Common Targets 13, Länder 16; Source-vs-View ohne Verlust. |

## Nicht blockierende Projektionen

Alle 129 ausdrücklich verlangten Objekte wurden deterministisch verarbeitet:
63 besitzen ausreichend explizite Quelldaten für eine Projektion, 66 bleiben
feldgenau fail-closed. Das Inventar umfasst Sachsen-Anhalt 6, 57 kompakte und
6 detaillierte Regierungsrecords, 21 EU-Fälle, Baden-Württemberg,
Rheinland-Pfalz, 28 historische Parlamentsfälle, 6 Bundesprogramme, eine
Koalitionsvereinbarung, eine Fachakte und das Wirkungsobservatorium.

## Noch benötigte externe Fach- und Quelleninputs

1. **Mecklenburg-Vorpommern Quellenreife:** je ein amtlich verifiziertes finales
   Programm-Artefakt für Tierschutzpartei, Die PARTEI, ÖDP, Handwerker Partei
   Deutschland, KPD, Team Freiheit und WIR LEBEN DEMOKRATIE. Erst danach ist
   eine source-bound Fachprüfung möglich.
2. **Regierungsbestand:** objektspezifische explizite MPD-/SDG-/SDG+-/
   Wirkpfad-/Grenz-/Evidenzfreigaben für die noch feldweise geschlossenen
   kompakten Records; für die sechs detaillierten Records die fehlenden
   Aggregat- und Materialitätsentscheidungen, einschließlich einer Auswahl von
   höchstens fünf aus sechs Pfaden bei Altersvorsorge.
3. **EU, 21 Fälle:** source-bound MPD-, SDG-/SDG+-, materielle Wirkpfad- und
   Nichtkompensationsprojektionen.
4. **Baden-Württemberg und Rheinland-Pfalz:** je eine dokumentweite Auswahl
   materieller Pfade sowie MPD-/SDG-Richtungsprojektionen; Kapitelbefunde
   werden nicht technisch zu Gesamturteilen verrechnet.
5. **Historische Bundesprogramme, Koalitionsobjekte und Fachakten:**
   objektspezifische strukturierte Freigaben für fehlende MPD-, SDG- und
   Materialitätsfelder.
6. **Wirkungsobservatorium:** case-spezifische Executive-Verknüpfung erst nach
   expliziter Fachfreigabe.
7. **Release:** zunächst die in #238/#240/#241 angeordnete Berlin/MV-
   Fachremediation. Unabhängig davon bleibt ein neuer Parliament-RC ohne
   spätere ausdrückliche Release-Freigabe gesperrt.

Berlin benötigt aus diesem Auftrag keinen weiteren Fachinput. Für den
verifizierten MV-12er-Teilkorpus ist ebenfalls kein Fachrest offen.

## Releasegrenze

`NO_NEW_VERCEL_BUILD=true` und
`PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED` bleiben bindend. Dieser Auftrag
erzeugt weder Preview noch Vercel-Build, Deployment oder Production-Promotion.
