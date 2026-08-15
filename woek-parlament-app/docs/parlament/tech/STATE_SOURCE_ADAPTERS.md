# Landesquellen und Adapterplan

Stand: 15. August 2026. Dieses Dokument unterscheidet strikt zwischen einer
amtlich verfügbaren Quelle und einer bereits automatisiert angeschlossenen
Schnittstelle.

## Grundsatz

Es gibt für die Länder keinen zentralen DIP-Ersatz und keinen gemeinsamen
API-Schlüssel. Jedes Landesparlament veröffentlicht seine Daten über eigene
Dokumentationssysteme. Der Portaladapter normalisiert erst **nach** dem Abruf
auf dieselben Kernobjekte:

```text
Vorgang → Entscheidungseinheit → Dokumentfassung → Verfahrensereignis
       → Abstimmung / Beschluss → Quelle → Wirkungscheck
```

Ein öffentlicher Suchzugang wird nicht als API ausgegeben. Wenn eine stabile,
dokumentierte API oder ein strukturierter Export fehlt, nutzt der Adapter nur
die zulässigen amtlichen Dokumentseiten, mit Caching, Rate-Limits,
Fassungs-Hashes und einer Quellenspur. Vor produktivem Abruf wird die
Nutzungs- und Zugriffsregel der jeweiligen Stelle technisch geprüft.

## Priorität 1: junge Wahlperioden

| Land | Regierungsstart für Monitoring | Amtliche Datenbasis | Zugang heute | Adapterstatus |
| --- | --- | --- | --- | --- |
| Baden-Württemberg | 13.05.2026 | PARLIS, Landtags-Dokumente, Beschlüsse, Sitzungsplan | öffentliches Dokumentationsportal; keine dokumentierte Schlüssel-API als Voraussetzung eingeplant | Quellenmodell angelegt, technischer Abruf als nächster Schritt |
| Rheinland-Pfalz | 18.05.2026 | Dokumentenserver des Landtags, Drucksachen/Protokolle, veröffentlichte XML-Bestände, Open Data RLP | öffentliche strukturierte Exporte und Dokumente, kein Schlüssel erforderlich | Quellenmodell angelegt, XML-/Dokumentadapter als nächster Schritt |
| Hamburg | 07.05.2025 | Parlamentsdatenbank der Bürgerschaft | öffentliches Dokumentationsportal; eine stabile Automationsschnittstelle wird vor Einsatz geprüft | Quellenmodell angelegt, technische Schnittstellenprüfung ausstehend |

Die Stichtage bezeichnen den Beginn der jeweiligen neuen Regierungsarbeit und
sind keine Aussage darüber, dass bereits eine vollständige Wirkungsbewertung
vorliegt.

## Sachsen-Anhalt: vor der Wahl

Für Sachsen-Anhalt läuft bis zum Wahltag am **6. September 2026** ausschließlich
der Wahlprogramm-Workflow:

1. Originalprogramme und Fassungen der Parteien als Primärquellen sichern;
2. Zusagen mit Fundstellen extrahieren;
3. Wirkungspotenziale, Risiken, Datenlücken und Zielbezüge prüfen;
4. die öffentliche Darstellung erst mit nachvollziehbarer Quellenbasis
   freigeben.

Es werden vor der Wahl keine fiktiven Landtagsentscheidungen oder
Abstimmungsdaten gezeigt. Erst danach schaltet derselbe Landtagsadapter auf
Drucksachen, Ausschuss- und Plenarverfahren, Beschlüsse und – soweit amtlich
verfügbar – namentliche Abstimmungen um.

## Weitere Wahlen 2026

| Gebiet | Wahl | Datum | Startarbeit |
| --- | --- | --- | --- |
| Sachsen-Anhalt | Landtagswahl | 06.09.2026 | vollständiges Quellenregister für Wahlprogramme |
| Berlin | Abgeordnetenhauswahl | 20.09.2026 | Quellen- und Programmregister |
| Mecklenburg-Vorpommern | Landtagswahl | 20.09.2026 | Quellen- und Programmregister |

Die drei Wahlbereiche werden getrennt geführt. Eine Auswahl nach aktuellen
Umfragen darf höchstens die interne Beschaffungsreihenfolge steuern; sie darf
weder die fachliche Einordnung noch die spätere öffentliche Vollständigkeit
bestimmen.

## Welche Daten werden pro Land benötigt?

### Vor der Wahl

- Originalfassung des Wahlprogramms mit Quelle, Datum und Hash;
- konkrete Zusagen und Bedingungen;
- vorhandene belastbare Daten für Ausgangslage und Wirkungspfad;
- landesspezifischer Referenzrahmen: SDGs, SDG+, Landesverfassung,
  Nachhaltigkeits- und Fachziele;
- Wirkungen auf Kommunen, andere Länder, Bund, Europa und globale Güter.

### In der Wahlperiode

- Vorgang, Drucksache und finale Fassung;
- Tagesordnung, Ausschussstand, Beschluss und Abstimmungsart;
- bei namentlicher Abstimmung ausschließlich die amtlichen Einzelstimmen;
- amtliche Haushalts- und Vollzugsdaten, Evaluationen und Zeitreihen;
- Koalitionsvereinbarung sowie Verbindung Programm → Vereinbarung →
  Entscheidung → Umsetzung → beobachtbare Entwicklung.

## Rechtliche und technische Schutzregeln

- Kein Scraping hinter Logins, Captchas oder Zugangsbeschränkungen.
- Keine Umgehung von Rate-Limits; Abrufe sind cache- und diffbasiert.
- Öffentliche Dokumente bleiben bei der amtlichen Quelle oder im geschützten
  Speicher; nur veröffentlichungsfähige, nötige Ausschnitte erscheinen im
  Portal.
- Keine individuelle Stimme aus nicht namentlichen Abstimmungen ableiten.
- Kein Landes- oder Parteien-Score; es werden Fälle und Programme anhand
  derselben veröffentlichten Wirkungslogik erschlossen.

## Amtliche Einstiegsquellen

- [Landtagswahl Sachsen-Anhalt 2026](https://wahlen.sachsen-anhalt.de/zu-den-wahlen/landtagswahl/faq-zur-landtagswahl-2026)
- [PARLIS Baden-Württemberg](https://parlis.landtag-bw.de/)
- [Landtag Baden-Württemberg: Parlamentsdokumentation](https://www.landtag-bw.de/de/dokumente/parlamentsdokumentation)
- [Dokumente des Landtags Rheinland-Pfalz](https://dokumente.landtag.rlp.de/)
- [Parlamentsdatenbank der Hamburgischen Bürgerschaft](https://www.hamburgische-buergerschaft.de/recherche-info/parlamentsdatenbank)
- [Berliner Wahlen 2026](https://www.statistik-berlin-brandenburg.de/abgeordnetenhauswahlen-bvv-berlin/)
- [Wahltermin Mecklenburg-Vorpommern 2026](https://www.regierung-mv.de/Landesregierung/im/Aktuell/?id=212920&processor=processor.sa.pressemitteilung)
