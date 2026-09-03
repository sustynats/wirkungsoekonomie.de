# Wirkungscheck Bundestag V2 – Regel-Engine

**Status:** verbindlicher Implementierungsentwurf.  
**Modus:** deterministisch, inhaltsgesteuert, ohne generative KI im
Pflichtpfad. Keine automatischen Kurven, Scores, Rankings oder Kausalprognosen.

## Produktdatenmodell

Der Pflichtpfad speichert ausschließlich die folgenden Felder lokal im Browser:

| Feld | Typ | Regeln |
| --- | --- | --- |
| topic | enum | In Phase 1 nur housing oder care. |
| district_id | optional string | Amtliche Wahlkreisnummer; kein Personenmerkmal. |
| federal_objective | enum | Genau ein freigegebenes Ziel des Themenmoduls. |
| bottlenecks | enum array | Mindestens eins, höchstens zwei; „mehrere Punkte“ ist ein eigener Wert. |
| federal_success_signals | enum array | Mindestens eins, höchstens drei. |
| non_compensable_boundaries | enum array | Mindestens eins, höchstens zwei; „keine der genannten“ schließt weitere Auswahl aus. |
| policy_constraints | enum array | Null bis drei. |
| regional_feedback | enum or optional text | Eine Auswahl; Freitext maximal 300 Zeichen. |
| other_text | optional string | Maximal 300 Zeichen, nur bei jeweiliger „Andere“-Option. |

Nicht speichern oder abfragen: Name, Parteizugehörigkeit, Fraktion,
Geschlecht, E-Mail, Empfängeradresse, Abstimmungsverhalten, Kontaktstatus,
CRM-Kennung oder Einschätzung einer Person.

## Validierung

- Die Themenauswahl ist Pflicht.
- Ohne Wahlkreis wird Frage 7 als regionale oder praktische Rückmeldung gestellt.
- Eine Wahlkreis-PLZ-Suche darf keine automatische Zuordnung vornehmen.
- Auswahloberflächen verhindern Überschreitung der jeweiligen Maximalzahl,
  statt nachträglich Antworten zu verwerfen.
- „Noch nicht eindeutig“ führt zu einem Klärungsreport und nicht zu einer
  scheinpräzisen Maßnahme.
- „Andere Veränderung“ oder „Anderer Punkt“ ohne Freitext ist zulässig, löst
  aber keine spezifische Ursache-Wirkungs-Behauptung aus.
- Ein wiederholter Klick auf eine Option darf die Ansicht weder an den
  Seitenanfang noch zu einer anderen Frage springen lassen. Fokus bleibt in
  der aktuellen Frage; nach „Weiter“ erhält die Überschrift der nächsten Frage
  programmatischen Fokus.

## Interne Bundesrollen

Die Bundesrolle wird nicht abgefragt. Sie wird aus Engpässen abgeleitet:

| Bottleneck | Rolle |
| --- | --- |
| Regeln passen nicht ausreichend zum Ziel | Rechtsrahmen und Standards |
| Finanzierung oder Anreize lenken falsch | Finanzierung und Anreize |
| Personal/Fähigkeiten fehlen | Vollzug und Umsetzbarkeit |
| Verfahren/digitale Abläufe erschweren Umsetzung | Vollzug und Umsetzbarkeit |
| Bund, Länder und Kommunen greifen nicht ineinander | Vollzug und Umsetzbarkeit |
| Infrastruktur oder tatsächlicher Zugang fehlen | Vollzug und Umsetzbarkeit |
| Zu wenig Wissen über tatsächliche Wirkung | Wirkungsdaten und Rückkopplung |
| Mehrere Punkte greifen ineinander | Mehrere Rollen nach den zusätzlich gewählten Angaben; sonst Klärungsauftrag |
| Noch nicht eindeutig/Sonstiges | Klärungsauftrag |

Zwei verschiedene Rollen dürfen gleichrangig ausgeben werden. Mehr als zwei
Rollen werden nicht parallel ausgegeben. Die Priorisierung erfolgt nur aus
einer fachlich gepflegten, sichtbaren Regel pro Themenmodul; andernfalls lautet
das Ergebnis „noch nicht belastbar priorisierbar“.

## Report-Erzeugung

1. **Daten validieren.** Ungültige Kombinationen werden nicht gerendert.
2. **Modul laden.** Nur TOPIC_MODULES-Einträge zum gewählten Thema.
3. **Ziel setzen.** Der sichtbare Zieltext wird unverändert übernommen.
4. **Rollen ableiten.** Ein oder zwei plausible Bundesrollen mit konkreter
   Prüfspur bestimmen.
5. **Wirkungskette bauen.** Die Kette enthält Bundesauftrag, unmittelbare
   Veränderung, Erfolgssignal, regionale Rückmeldung und rote Linie.
6. **Beobachtungspunkte wählen.** Höchstens drei; zuerst ausdrücklich gewählte
   Erfolgssignale, dann nötige Risiko-Beobachtung. Jeder Punkt hat einen
   evidence_status.
7. **Prüffrage generieren.** Aus freigegebenen Satzbausteinen, Ziel, Mechanismus
   und roter Linie. Kein Freitext in sicherheits- oder rechtsrelevanter
   Behauptungsposition.
8. **Korrekturtrigger bauen.** Ein gewünschtes Signal und ein Risiko verbinden.
   Keine numerische Schwelle ohne freigegebene Evidenzbasis.
9. **Transparenzprotokoll liefern.** Nutzereingaben, Regel-IDs,
   Datenverwendungen und Evidenzgrenzen bereitstellen.
10. **Optionales Instrumentenmodul auswählen.** Erst nach abgeschlossenem
    Kurzreport, ohne Rückwirkung auf Schritt 1 bis 9.

## Wirkpfad-Template

Die Engine verwendet je Rolle und Thema einen freigegebenen Wirkpfad, keine
offene Textgenerierung:

| Rolle | Formel |
| --- | --- |
| Rechtsrahmen und Standards | Bund prüft und verändert einen Rechtsrahmen oder Standard → zuständige Stellen erhalten einen klareren Handlungsspielraum oder Schutz → wenn die Annahme trägt, verbessert sich das gewählte Zustandsmerkmal → rote Linie bleibt beobachtbar. |
| Finanzierung und Anreize | Bund prüft, ob Mittel und Anreize das Ziel unterstützen → Mittelverwendung und Verhalten der umsetzenden Stellen verändern sich → wenn die Annahme trägt, verbessert sich das gewählte Zustandsmerkmal → rote Linie bleibt beobachtbar. |
| Vollzug und Umsetzbarkeit | Bund prüft, welche Anforderungen Umsetzung, Personal, Verfahren oder Zugang blockieren → praktische Durchführung wird verlässlicher → wenn die Annahme trägt, verbessert sich das gewählte Zustandsmerkmal → rote Linie bleibt beobachtbar. |
| Wirkungsdaten und Rückkopplung | Bund prüft, welche verhältnismäßigen Daten und Rückmeldungen fehlen → Zielerreichung und Risiko werden früher sichtbar → Annahmen können korrigiert werden → rote Linie bleibt beobachtbar. |

Thematische Konkretionen stehen im Themenmodul. Die Wörter „führt zu“,
„bewirkt sicher“ oder „beweist“ sind in Report-Templates verboten.

## Evidenzregel

Jede Reportaussage trägt einen der folgenden Status:

- **Beobachtete Ausgangslage:** Nur bei freigegebenen, tatsächlich angezeigten
  Daten; Quelle und Zeitraum zwingend.
- **Wirkungspotenzial:** Plausibler, zu prüfender Mechanismus.
- **Wirkungsrisiko:** Mögliche negative Folge oder rote Linie.
- **Tatsächliche Wirkung:** Nur bei einer empirisch beobachteten, passend
  abgegrenzten Zustandsveränderung. In Phase 1 erzeugt die Engine diesen Status
  nicht automatisch.
- **Offene Evidenz:** Erforderliche Daten fehlen oder reichen nicht.

data-2025.js darf in Phase 1 nur für Wahlkreis-Suche und -Anzeige verwendet
werden. Der Engine ist eine Positivliste pro Thema übergeben; ist sie leer,
wird die Datenlücke angezeigt.

## Parteiinvarianz und Neutralität

Der Input- und Regelvertrag enthält keine Parteivariable. Ein Test muss für
identische inhaltliche Antworten denselben Report ergeben, unabhängig von
nicht verwendeten Metadaten. Der Renderer zeigt nie:

- Parteien, Fraktionen oder Personen;
- Ranglisten oder Vergleichswerte;
- Wahl- oder Stimmempfehlungen;
- persönliche Wirkungs-, Offenheits- oder Kompetenzscores.

## Fehler- und Sicherheitsverhalten

- Fehlt ein Themenmodul oder eine Reportregel, wird ein neutraler
  Fehlerzustand mit sicherer Wiederholung angeboten; kein generischer
  Ersatzreport.
- Unzulässiger Freitext wird als lokaler Text behandelt und nicht an eine
  externe KI oder Analyseplattform übertragen.
- Keine Produktanalyse darf Antwortwerte, Freitext, Wahlkreiswahl oder
  Instrumentenbewertung erfassen.
- Zulässig sind nur technische Ereignisse ohne Inhalt: Start, Frage erreicht,
  Report erzeugt, Druck/Kopie ausgelöst, freiwillige Vertiefung gestartet.
- Jeder Report muss ohne Netzwerkzugriff aus den lokalen, versionierten
  Content-Regeln reproduzierbar sein.

## Testfälle

| Fall | Erwartetes Ergebnis |
| --- | --- |
| Wohnen + Zugang + Finanzierung + Zugang leichter + niedrige Einkommen als Grenze | Rolle Finanzierung und Anreize; Wirkungskette ohne Neubau-Automatismus; Risiko Zugang einkommensschwächerer Haushalte. |
| Wohnen + Bestand besser nutzen + Regeln + Natur/Fläche als Grenze | Rolle Rechtsrahmen und Standards; Bestandsaktivierung als Prüfspur; keine Kennzahl „Fertigstellungen“ anzeigen. |
| Pflege + rechtzeitige Hilfe + Personal und Verfahren | Zwei gleichrangige Vollzugs-Prüfspuren nur, wenn sie unterscheidbar sind; sonst eine gebündelte Rolle mit Begründung. |
| Pflege + noch nicht eindeutig | Klärungsreport; keine Maßnahme oder Instrumentenkarte als Empfehlung. |
| Datenengpass + Wahlkreis | Regionale Beobachtung anzeigen, aber keine unpassende Sozial- oder Arbeitsmarktzahl. |
| Gleiche Antworten mit hypothetischer Parteimetadaten | Byte-identischer semantischer Report; Metadaten werden ignoriert. |
| Auswahl mehrerer Optionen auf einer Frage | Scrollposition bleibt stabil; Auswahl löst keine Navigation aus. |
| Freitext mit HTML | Inhalt wird als Text escaped; keine Ausführung, keine Übertragung. |

## Feature-Flags in Phase 1

- FEATURE_SENSITIVITY = false
- FEATURE_WOEK_AI = false
- FEATURE_REGIONAL_CURVES = false
- FEATURE_PERSONALIZATION_FROM_CRM = false
- FEATURE_ANSWER_VALUE_ANALYTICS = false

Eine spätere Änderung eines Flags erfordert eine fachliche, technische und
datenschutzrechtliche Freigabe samt Test.

