<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v89-datenschutz-cyberresilienz-digitale-souveraenitaet.md curriculum=4.0 sanitized=true -->
# V89 · Datenschutz, Cyberresilienz und digitale Souveränität

**lecture_id:** `WOEK-G-BASE-089`  
**display_code:** `V89`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED_VERSION_SENSITIVE`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 behandelt digitale Wirkung als Dreieck aus Datenschutz/Grundrechten, Cyberresilienz und strategischer Handlungsfähigkeit. Bestehendes EU-/deutsches Recht wird als Rahmen anerkannt; digitale Souveränität wird nicht als Autarkie missverstanden.

## 20-Sekunden-Einstieg

Eine Wirkungsdatenarchitektur kann nur funktionieren, wenn Menschen und Organisationen ihr vertrauen können. Dafür braucht sie **Datenschutz**, **Cybersicherheit** und **digitale Handlungsfähigkeit**. Datenschutz schützt Personen und Grundrechte. Cyberresilienz schützt Funktionen und Daten vor Ausfall/Angriff. Digitale Souveränität bedeutet, kritische digitale Fähigkeiten und Wahlmöglichkeiten zu erhalten – nicht, jede Technologie im eigenen Land selbst zu bauen.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Datenschutz, Informationssicherheit/Cyberresilienz und digitale Souveränität trennen.
2. Datenminimierung, Zweckbindung, Zugriff und Provenienz in WÖk-Systemen anwenden.
3. Vertraulichkeit, Integrität und Verfügbarkeit als Sicherheitsziele erklären.
4. Abhängigkeit, Portabilität, Interoperabilität und Exit-Fähigkeit als Souveränitäts-State-Variables analysieren.
5. Sicherheits-/Datenschutzmaßnahmen gegen Nutzen- und Zugangsfolgen abwägen.
6. aktuelle EU-/deutsche Rechtsrahmen als versionsempfindliche Referenz behandeln.

## 1. Drei verschiedene Fragen

### Datenschutz

Welche personenbezogenen Daten dürfen zu welchem Zweck verarbeitet werden? Welche Rechte haben Betroffene?

### Cyberresilienz

Bleiben Systeme/Daten unter Angriff, Fehler und Ausfall sicher und funktionsfähig?

### Digitale Souveränität

Bleibt die Fähigkeit erhalten, Anbieter/Technologien zu wählen, zu wechseln, zu verstehen und kritische Funktionen selbst zu kontrollieren?

Diese drei Ziele können zusammenwirken, aber auch in Spannung stehen.

## 2. Datenschutz: nicht erst nach dem Datenmodell

Datenschutzfreundliches Design beginnt vor der Datensammlung.

Fragen:

- Brauchen wir personenbezogene Rohdaten überhaupt?
- reicht Aggregation/Pseudonymisierung?
- ist Zweck klar?
- wie lange speichern?
- wer hat Zugriff?
- welche Betroffenenrechte?
- welche Rechtsgrundlage?

Für WÖk gilt:

> Wirkungstransparenz ist kein Freibrief für maximale Datensammlung.

## 3. Datenminimierung als Wirkungsprinzip

Mehr Daten können bessere Analysen ermöglichen.

Aber zusätzliche Datensammlung kann selbst negative Wirkung erzeugen:

- Privatsphärenverlust,
- Missbrauchsrisiko,
- Sicherheitskosten,
- Misstrauen,
- Ausschluss sensibler Gruppen.

Darum wird Datenbedarf wie jede andere Intervention geprüft:

`NECESSITY -> PROPORTIONALITY -> ALTERNATIVES -> SAFEGUARDS`.

## 4. Cyberresilienz: CIA und darüber hinaus

Klassische Schutzziele:

- **Confidentiality** – nur Berechtigte sehen Daten.
- **Integrity** – Daten/Software bleiben unverfälscht.
- **Availability** – Systeme/Daten sind verfügbar.

Für Wirkungssysteme kommen hinzu:

- Provenienz,
- Wiederherstellbarkeit,
- Logging,
- Versionssicherheit,
- Lieferketten-/Softwareabhängigkeiten.

Ein manipuliertes Wirkungsregister könnte Entscheidungen systematisch verzerren.

## 5. Resilienz statt perfekte Sicherheit

100 % Sicherheit existiert nicht.

Cyberresilienz fragt:

- Wie schnell erkennen wir Vorfälle?
- Wie begrenzen wir Schaden?
- Können wir aus Backups/alternativen Systemen weiterarbeiten?
- Wie schnell stellen wir Funktionen wieder her?
- lernen wir aus dem Vorfall?

`PREVENT -> DETECT -> RESPOND -> RECOVER -> LEARN`.

## 6. Digitale Souveränität ist nicht Autarkie

Ein Land/Unternehmen ist nicht automatisch souverän, wenn es jede Software selbst schreibt.

Relevante State Variables:

- Anbieter-/Cloudkonzentration,
- Datenportabilität,
- offene Standards,
- Exit-Kosten,
- technisches Know-how,
- Zugriff auf Quell-/Sicherheitsinformationen,
- Ersatz-/Fallbackoptionen,
- geopolitische Abhängigkeit.

Souveränität bedeutet **realistische Handlungsoptionen**, nicht Isolation.

## 7. Lock-in

Digitaler Lock-in entsteht, wenn Wechsel sehr teuer/schwierig wird.

Mechanismen:

- proprietäre Formate,
- hohe Datenmigrationkosten,
- technische Abhängigkeit,
- Vertragsbindung,
- Skill-Abhängigkeit,
- Ökosystem-/Netzwerkeffekte.

WÖk prüft deshalb bei digitalen Systemen `REVERSIBILITY/LOCK_IN`.

## 8. Rechtsrahmen

Für konkrete Fälle können relevant sein:

- DSGVO,
- EU Data Act,
- NIS2-/nationale Umsetzung,
- Cyber Resilience Act,
- sektorspezifisches Recht,
- Grundrechte.

Die genaue Anwendbarkeit und aktuelle Umsetzung muss jeweils frisch geprüft werden.

Diese Vorlesung ist deshalb `VERSION_SENSITIVE`.

## 9. Beispiel: zentrales Wirkungsregister

Option A:

alle Rohdaten zentral speichern.

Option B:

föderierte Quellen, zentrale Metadaten/IDs, selektive Abrufe.

WÖk-Vergleich:

- Analysequalität,
- Datenschutz,
- Cyberangriffsfläche,
- Verfügbarkeit,
- Governance,
- Aktualität,
- Exit-Fähigkeit,
- Kosten.

Oft ist Föderation robuster – aber nicht immer. Der konkrete Use Case entscheidet.

## 10. Security vs. Accessibility

Mehr Sicherheit kann Zugänglichkeit verschlechtern.

Beispiel:

sehr komplexe Authentifizierung schützt Konten, kann aber bestimmte Nutzergruppen ausschließen.

Darum braucht digitale Wirkung auch:

- Barrierefreiheit,
- Nutzerfreundlichkeit,
- Recovery/Support,
- alternative Zugangswege.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Datenschutz | Schutz personenbezogener Daten und damit verbundener Rechte |
| Cyberresilienz | Fähigkeit digitaler Systeme, Angriffe/Ausfälle zu widerstehen, zu begrenzen und sich zu erholen |
| Digitale Souveränität | reale Handlungs-/Wahl-/Exit-Fähigkeit in digitalen Abhängigkeiten |
| Datenminimierung | nur für Zweck erforderliche Daten verarbeiten |
| Integrity | Unversehrtheit/Authentizität von Daten/Systemen |
| Lock-in | hohe Wechsel-/Ausstiegskosten aus einem technischen/kommerziellen System |
| Exit-Fähigkeit | Möglichkeit, Anbieter/Technik zu wechseln, ohne kritische Funktion zu verlieren |

## 12. Typische Fehlinterpretationen

### „Mehr Daten = bessere WÖk.“
Nicht automatisch.

### „Datenschutz verhindert Wirkungsmessung.“
Zu pauschal; datensparsame/aggregierte Designs sind möglich.

### „Cybersecurity = Angriffe vollständig verhindern.“
Falsch.

### „Digitale Souveränität = alles national selbst bauen.“
Falsch.

### „Open Source = automatisch sicher/souverän.“
Falsch; Governance, Betrieb und Fähigkeiten zählen.

## 13. WÖk-Abgrenzung

Datenschutz, Informationssicherheit und digitale Souveränität sind etablierte Rechts-/Technikfelder. WÖk ergänzt eine gemeinsame Wirkungsbewertung ihrer Trade-offs, Distribution, Lock-ins und Resilienzfolgen.

## 14. Quellen

- DSGVO: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- EU Data Act: https://digital-strategy.ec.europa.eu/en/policies/data-act
- EU Cyber Resilience Act: https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
- BSI: https://www.bsi.bund.de/
- BfDI: https://www.bfdi.bund.de/
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 15. Transferaufgabe

Entwirf die Datenarchitektur eines Wirkungsportals.

Bewerte zwei Optionen – zentral vs. föderiert – nach:

- Datenminimierung,
- Analysebedarf,
- CIA,
- Recovery,
- Lock-in,
- Exit,
- Barrierefreiheit,
- Kosten.

## 17. Prüfungsrelevanz

- Datenschutz/Cyber/Souveränität getrennt,
- Datenminimierung,
- CIA/Recovery,
- Lock-in/Exit,
- Version-sensitives Recht,
- Security vs. Accessibility.

## 18. Sprechertext

Wenn wir Wirkung besser messen wollen, liegt ein Gedanke nahe:

Dann sammeln wir einfach mehr Daten.

Aber Daten selbst haben Wirkung.

Sie können Privatsphäre verletzen. Sie können gestohlen werden. Sie können Menschen ausschließen. Und sie können Abhängigkeit erzeugen.

Darum brauchen wir drei Perspektiven.

Datenschutz fragt: Welche personenbezogenen Daten dürfen wir wofür verarbeiten?

Cyberresilienz fragt: Bleibt unser System funktionsfähig, wenn etwas schiefgeht oder angegriffen wird?

Und digitale Souveränität fragt: Können wir Anbieter wechseln? Haben wir Standards, Know-how und Fallbacks? Oder sind wir gefangen?

Souveränität heißt übrigens nicht, jede Software selbst zu bauen.

Sie heißt, reale Handlungsoptionen zu behalten.

Auch Sicherheit ist nicht absolut.

Wir verhindern, erkennen, reagieren, stellen wieder her und lernen.

Und manchmal ist ein föderiertes System robuster als eine zentrale Riesendatenbank.

Der Merksatz lautet:

**Eine gute Wirkungsdatenarchitektur sammelt nicht maximal viele Daten. Sie sammelt die richtigen – und bleibt sicher, korrigierbar und verlassbar.**
