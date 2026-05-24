# Lieferketten, Importlogik und Wirkungsvorsteuer


**Untertitel:** Wie Wirkung entlang globaler Wertschöpfungsketten steuerlich rückgekoppelt wird


**Autorin:** Natalie Weber

**Referenz:** Wirkungsökonomie

**Version:** v1.0

**Stand:** 24. Mai 2026


> Negative Wirkung darf nicht als Durchlaufposten durch die Lieferkette verschwinden.


## Kurzprofil

- **Unterbereich:** Lieferketten, Import, Einfuhrumsatzsteuer, Vorsteuer, Bonuslogik

- **Ziel:** Vorleistungen, Importe und Lieferantenwahl als zentrale Hebel der Produktwirkungssteuer ausarbeiten.

- **Abgrenzung:** Keine Rechts- oder Steuerberatung; konzeptionelle Architektur für Produktwirkung, Lieferkettensteuerung und Arbeitsbibliothek.

- **Toolbezug:** Lieferketten-Scorecard, Vorsteuer-Simulator, T-Shirt-Demo, Import-Wirkungscheck

- **Hauptverknüpfung:** CSDDD, CBAM, DPP, WUStG, Wirtschaft & Unternehmen


## Inhaltsübersicht

1. Executive Summary

2. Ausgangsdiagnose: Warum Lieferketten heute Wirkung verstecken

3. Lieferkette als verdichteter Wirkungsraum

4. Wirkungsvorsteuer: Prinzip und Berechnungsidee

5. Bonuslogik: Der positive Hebel

6. Importwirkung und Grenzlogik

7. T-Shirt-Lieferkette als Modellfall

8. Konzern- und Produktgruppenlogik

9. Datenqualität, Auditierung und KMU-Schutz

10. Politische Anschlussfähigkeit und Umsetzungsoptionen

11. Website- und Tool-Integration

12. Fazit

13. Internationale Fairness und Nicht-Protektionismus

14. Rechenbeispiel Wirkungsvorsteuer

15. Daten- und Rollenmodell in der Lieferkette

16. Roadmap für Lieferketten-Pilotierung


## Executive Summary


Dieses Detailkonzept beschreibt die Lieferketten-, Import- und Wirkungsvorsteuerlogik der Wirkungsumsatzsteuer. Es zeigt, warum die Produktwirkungssteuer nicht erst am Regal beginnen darf, sondern entlang der gesamten Wertschöpfungskette wirken muss.

Der zentrale Satz lautet: Negative Wirkung darf nicht als steuerlicher Durchlaufposten verschwinden. Wenn eine Vorleistung Kinderarbeit, Entwaldung, toxische Chemie, hohen Wasserstress, hohe Emissionen oder systemische Intransparenz enthält, muss diese Wirkung für Einkauf, Vorsteuer und Importkosten relevant werden.

Die Logik ersetzt keine klassische Sorgfaltspflicht, sondern macht deren Daten wirtschaftlich wirksam. CSDDD, CSRD/ESRS, DPP und CBAM werden zu Anschlussstellen einer breiteren Rückkopplungsarchitektur.


## Ausgangsdiagnose: Warum Lieferketten heute Wirkung verstecken


Globale Lieferketten sind leistungsfähig, aber häufig wirkungsblind. Ein Produkt kann billig erscheinen, weil ökologische und soziale Kosten in Vorstufen ausgelagert werden. Die Umsatzsteuer behandelt viele Vorleistungen als technische Durchläufe. Dadurch entsteht ein Preis, der viel über Kapitalaufwand, aber wenig über Wirkung sagt.

Für Unternehmen ist das ebenfalls ein Risiko. Lieferketten ohne Wirkungsdaten erzeugen Reputations-, Haftungs-, Finanzierungs- und Versorgungsrisiken. Die WÖk macht aus dieser Risikoinformation ein Steuerungssignal.

Die zentrale Frage lautet: Welche Vorleistungen dürfen steuerlich durchlässig sein und welche nicht?

| Heutiger Zustand | Wirkungsökonomische Korrektur |

| --- | --- |

| Vorsteuer meist wirkungsneutral | Vorsteuerfähigkeit abhängig vom FinalScore |

| Importe nach Zollwert bewertet | Wirkungsimportbewertung ergänzt Zollwert |

| Lieferantenwahl nach Preis und Verfügbarkeit | Lieferantenwahl nach Preis, Resilienz und Wirkung |

| Berichtsdaten ohne Preissignal | Berichtsdaten werden steuer- und einkaufsrelevant |

| Greenwashing über Durchschnittswerte | Reverse Merit Order und rote Linien |


## Lieferkette als verdichteter Wirkungsraum


Ein Endprodukt ist verdichtete Lieferkette. Im T-Shirt stecken Baumwolle, Wasser, Boden, Arbeitsbedingungen, Färberei, Chemie, Energie, Transport, Verpackung, Plattformlogik und Entsorgung. Im Polyamid stecken Rohstoffe, Energie, Chemie, Prozesswasser, Standortdaten und Recyclingfähigkeit.

Die Wirkungsumsatzsteuer muss deshalb jede wesentliche Vorleistung mitdenken. Sie bewertet nicht nur den letzten Händler, sondern die Wirkung der Kette. Dadurch verschiebt sich Wettbewerb: Nicht der billigste Zulieferer gewinnt, sondern der verlässlich wirkende Zulieferer mit guter Datenqualität und positiver Netto-Wirkung.

| Stufe | Wirkungsrisiken | WÖk-Rückkopplung |

| --- | --- | --- |

| Rohstoff | Entwaldung, Wasserstress, Arbeitsrechte | Rohstoffscore, Lieferanten-WÖk-ID |

| Verarbeitung | Energie, Chemie, Abwasser, Arbeitsschutz | Prozessscore und Auditpfad |

| Fertigung | Löhne, Arbeitszeit, Sicherheit, Qualität | Sozial- und Gesundheitsindikatoren |

| Transport / Import | Emissionen, Datenlage, Grenzausgleich | Wirkungs-EUSt, CBAM-Anschluss |

| Handel | Transparenz, Lagerung, Preisschild | DPP und Verbraucherinformation |


## Wirkungsvorsteuer: Prinzip und Berechnungsidee


Die klassische Vorsteuerlogik wird nicht abgeschafft, sondern qualifiziert. Positive Vorleistungen bleiben steuerlich durchlässig und können zusätzlich bonifiziert werden. Neutrale Vorleistungen bleiben zunächst durchlässig, aber ohne Transformationsvorteil. Negative Vorleistungen verlieren ganz oder teilweise ihre Vorsteuerfähigkeit.

Damit entsteht ein direkter finanzieller Anreiz, Lieferanten zu verbessern oder zu wechseln. Unternehmen, die ihre Lieferkette transformieren, profitieren nicht nur reputativ, sondern betriebswirtschaftlich.

Die genaue Ausgestaltung kann politisch abgestuft werden: harte rote Linien, eingeschränkte Abzugsfähigkeit, Bonusgutschriften, Übergangskorridore und KMU-Schutz.

| Vorleistungs-Score | Vorsteuerstatus | Lenkungswirkung |

| --- | --- | --- |

| +3 / +2 | voll vorsteuerfähig plus Bonusoption | transformative Lieferanten werden attraktiver |

| +1 | voll vorsteuerfähig | positive Mindestwirkung lohnt sich |

| 0 | durchlässig ohne Bonus | Übergangs- und Standardzone |

| -1 / -2 | eingeschränkt vorsteuerfähig | negative Wirkung wird Kostenfaktor |

| -3 / rote Linie | nicht vorsteuerfähig, ggf. Ausschluss | schwere Schäden werden nicht durchgereicht |


## Bonuslogik: Der positive Hebel


Die WÖk ist keine reine Malus-Architektur. Entscheidend ist der positive Hebel: Lieferanten mit nachweislich guter Wirkung erhalten Marktvorteile. Sie werden für Abnehmer attraktiver, weil sie Vorsteuerfähigkeit, Bonusgutschriften, bessere Finanzierung und niedrigere Risikoaufschläge ermöglichen.

Die Bonuslogik sollte aber niemals schwere Negativwirkung kompensieren. Sie kann Übererfüllung honorieren, aber keine roten Linien aufheben. Das schützt den Unterschied zwischen Verbesserung und Ablasshandel.

- Wirkungsgutschrift für +2/+3-Vorleistungen.

- Bessere Zahlungsbedingungen und Rahmenverträge für positive Lieferanten.

- Priorisierung in öffentlicher Beschaffung.

- Günstigerer Kapitalzugang über Banken und Wirkungsfonds.

- Offene Lieferantendatenbanken mit geprüften Scoreprofilen.


## Importwirkung und Grenzlogik


Importe sind ein Kernfall, weil viele Wirkungen außerhalb Europas entstehen, aber im europäischen Markt konsumiert werden. Die Wirkungsökonomie behandelt Import nicht als moralisches Herkunftsproblem, sondern als Daten- und Rückkopplungsproblem.

Die Wirkungs-Einfuhrbewertung kann an bestehende Mechanismen wie CBAM anschließen. CBAM adressiert emissionsintensive Importgüter; die WÖk erweitert die Logik auf mehrere Wirkungsfelder: Arbeit, Wasser, Gesundheit, Biodiversität, Ressourcen, Datenqualität und SDG+ Risiken.

Dort, wo ausländische Produzenten bereits vergleichbare Standards erfüllen oder lokale Wirkung positiv ist, kann ein guter Score entstehen. Die WÖk ist daher kein Protektionismus, sondern ein fairer Wirkungsstandard.

| Mechanismus | Fokus | WÖk-Erweiterung |

| --- | --- | --- |

| EUSt | Warenwert und Importsteuer | Wirkungsklasse ergänzt Steuerlogik |

| CBAM | eingebettete Emissionen bestimmter Sektoren | mehrdimensionale Produkt- und Lieferkettenwirkung |

| CSDDD | Sorgfaltspflicht in Wertschöpfungsketten | steuerliche Rückkopplung von Sorgfaltsdaten |

| DPP | Produktdaten und Rückverfolgbarkeit | Wirkungsdaten für Vorsteuer und Verbraucherinformation |


## T-Shirt-Lieferkette als Modellfall


Das T-Shirt eignet sich als Modellfall, weil die Wirkungsrisiken über mehrere Länder und Stufen verteilt sind: Baumwolle, Spinnerei, Färberei, Konfektion, Transport, Handel, Nutzung und Entsorgung. Die alte Logik bewertet am Ende den Preis. Die WÖk bewertet den Engpass der Kette.

Ein T-Shirt mit erneuerbarer Energie in der Endfertigung kann nicht positiv sein, wenn in der Baumwollproduktion Kinderarbeit oder hoher Wasserstress eine rote Linie verletzt. Ebenso kann ein Bio-Anteil nicht toxische Färberei neutralisieren.

| Stufe | Mögliche rote Linie | WÖk-Reaktion |

| --- | --- | --- |

| Baumwolle | Kinder-/Zwangsarbeit, Wasserstress | Scorebegrenzung und Vorsteuerbeschränkung |

| Färberei | toxische Chemie, Abwasser | Chemie- und Wasserindikatoren als Engpass |

| Konfektion | Arbeitszeit, Sicherheit, Living Wage | Arbeits-Score als Mindestbedingung |

| Transport | hohe Emission ohne Pfad | Klima-Score und Verbesserungsplan |

| Handel | irreführende Claims | SDG+ Informationsqualität |


## Konzern- und Produktgruppenlogik


In komplexen Konzernen verschwindet Produktwirkung oft im Durchschnitt. Das BASF-Polyamid-Beispiel zeigt, warum CSRD-Daten von Konzern- oder Standortebene auf Produktgruppen heruntergebrochen werden müssen. Sonst werden gute und schlechte Produktwirkungen in aggregierten Zahlen unsichtbar.

Die WÖk nutzt NACE, Produktgruppen, Anlagendaten, EPDs, Benchmarks und DPP, um aus Berichtsdaten Steuerungsdaten zu machen. Das ist aufwendig, aber nicht willkürlich. Gerade große Konzerne verfügen bereits über Datenstrukturen, die für Wirkung nutzbar gemacht werden können.


## Datenqualität, Auditierung und KMU-Schutz


Die Lieferkettenlogik darf nicht zur Bürokratiefalle für kleine Unternehmen werden. Datenpflichten müssen dort ansetzen, wo Steuerungsmacht und Datenfähigkeit liegen: bei großen Herstellern, Importeuren, Plattformen, Konzernen und datenreichen Lieferanten.

KMU brauchen vereinfachte Branchenprofile, geprüfte Lieferantendatenbanken, Standardtools und Übergangsfristen. Sie sollen nicht die gesamte globale Lieferkette allein prüfen müssen, sondern auf verlässliche Infrastrukturen zugreifen können.

Datenqualität wird stufenweise bewertet: Selbstauskunft, plausible Daten, unabhängiges Audit, laufende Überwachung. Je größer Steuer- oder Bonusvorteil und je höher das Risiko, desto höher die Prüftiefe.


## Politische Anschlussfähigkeit und Umsetzungsoptionen


Die politische Aufgabe besteht darin, einen fairen Rahmen zu schaffen: Wirkung sichtbar machen, KMU schützen, internationale Wettbewerbsfähigkeit erhalten, rote Linien definieren und soziale Folgen abfedern. Verschiedene Parteien können unterschiedliche Gewichtungen wählen, ohne die Grundlogik aufzugeben.

Liberale Perspektiven können Bürokratiearmut und faire Standards betonen, soziale Perspektiven Arbeitsrechte, grüne Perspektiven Klima und Ressourcen, konservative Perspektiven Versorgungssicherheit und Mittelstand, wirtschaftsnahe Perspektiven Investitionssicherheit und Datenstandardisierung.

| Ebene | Umsetzungsoption |

| --- | --- |

| Pilotierung | Textil, Lebensmittel, Batterien, Bauprodukte, Chemie |

| KMU-Schutz | Vereinfachte Nachweise und digitale Standardtools |

| Internationaler Anschluss | CSDDD, CBAM, DPP, Taxonomie, WTO-Prüfung |

| Sozialausgleich | Kaufkraftschutz für Grundbedarf |

| Rechtsschutz | Einspruch gegen Einstufung, offene Methodik, unabhängige Prüfung |


## Website- und Tool-Integration


Die Website sollte eine visuelle Lieferkettenlinie zeigen, in der jede Stufe Score, Datenqualität, Vorsteuerstatus und Engpassfeld erhält. Nutzer:innen sollen sehen, warum ein Endprodukt günstiger oder teurer wird.

Toolkarten: Lieferketten-Scorecard, Vorsteuer-Simulator, Import-Wirkungscheck, T-Shirt-Demo und Konzern-zu-Produktgruppen-Mapping.

- Verlinkung zu WUStG, WÖk-IDs, Scorecards, DPP, Wirtschaft & Unternehmen, Finanzsystem & Kapital.

- Online-Volltext vollständig bereitstellen, nicht nur Teaser.

- Tabellen mobil als Karten ausgeben.

- Bestehendes Lieferkettenpapier als Grundlagen-Download behalten.


## Fazit


Die Lieferketten-, Import- und Vorsteuerlogik ist der systemische Kern der Produktwirkungssteuer. Ohne sie bliebe die WUStG am Endprodukt hängen und würde globale Vorwirkungen zu spät erfassen.

Mit ihr werden Nachhaltigkeitsdaten zu Marktdaten: Gute Lieferanten gewinnen, destruktive Vorleistungen verlieren steuerliche Durchlässigkeit und Unternehmen erhalten einen klaren Grund, Lieferketten zu verbessern.


## Internationale Fairness und Nicht-Protektionismus


Eine wirkungsbasierte Importlogik muss sorgfältig zwischen fairem Grenzausgleich und verstecktem Protektionismus unterscheiden. Der Maßstab darf nicht lauten: Inland gut, Ausland schlecht. Der Maßstab lautet: Welche Wirkung ist nachweisbar, welche Risiken bestehen und welche Verbesserungspfade sind möglich?

Für Produzenten in Entwicklungs- und Schwellenländern braucht es Unterstützungslogiken. Wenn europäische Märkte Wirkungsdaten verlangen, müssen kleine Produzenten Zugang zu einfachen Datentools, Standardnachweisen, fairer Finanzierung und Übergangsfristen erhalten. Sonst würde eine eigentlich faire Wirkungsordnung neue Markteintrittsbarrieren schaffen.

Die WÖk sollte daher mit Wirkungspartnerschaften arbeiten: Datentransfer, Schulung, Finanzierung, Beschwerdemechanismen und gemeinsamer Benchmarkaufbau.

| Risiko | Gegenmaßnahme |

| --- | --- |

| Protektionismusvorwurf | gleiche Methodik für Inland und Ausland |

| Überforderung kleiner Produzenten | vereinfachte Datenpfade und technische Unterstützung |

| Datenmonopol großer Plattformen | offene Standards und öffentliche Register |

| Kostenverlagerung auf Lieferanten | faire Zahlungsbedingungen und Bonuslogik |

| Handelskonflikte | EU- und WTO-rechtliche Prüfung, Übergangsphasen |


## Rechenbeispiel Wirkungsvorsteuer


Die Wirkungsvorsteuer kann als Demo-Rechner auf der Website modelliert werden. Ein Unternehmen kauft drei Vorleistungen ein: eine positive, eine neutrale und eine negative. Der Rechner zeigt, wie sich der steuerliche Abzug verändert und warum ein negativer Lieferant betriebswirtschaftlich unattraktiver wird.

Das Ziel ist nicht, einen endgültigen Steuersatz festzulegen, sondern die Kostenlogik zu zeigen. Wenn negative Vorleistungen nicht mehr vollständig durchgereicht werden können, entsteht ein finanzieller Anreiz zur Lieferkettenverbesserung.

Besonders wichtig ist der Vergleich mit der heutigen Logik: Heute bleibt schlechte Wirkung häufig steuerlich neutral. In der WÖk wird sie zu einem sichtbaren Kostenbestandteil.

| Vorleistung | Score | Heutige Logik | WÖk-Demo-Logik |

| --- | --- | --- | --- |

| Bio-Rohstoff / faire Arbeit | +2 | normaler Vorsteuerabzug | voller Abzug plus Bonusoption |

| Standard-Vorprodukt | 0 | normaler Vorsteuerabzug | Abzug ohne Bonus |

| kritische Chemie / Arbeitsrisiko | -2 | normaler Vorsteuerabzug | eingeschränkt oder nicht vorsteuerfähig |

| rote Linie | -3 | normaler Vorsteuerabzug möglich | Ausschluss-/Sanktionspfad |


## Daten- und Rollenmodell in der Lieferkette


Damit Lieferkettenwirkung funktioniert, müssen Rollen klar sein. Der Primärproduzent liefert bestimmte Basisdaten. Der Importeur trägt die Verantwortung für Marktzugang und Datenvollständigkeit. Der Hersteller aggregiert Vorleistungen. Der Händler stellt Verbraucherinformation bereit. Der Wirkungsrat bzw. die zuständige Governance sichert Methodik und Korrektur.

Ohne Rollenmodell entsteht entweder Bürokratiechaos oder Verantwortungsdiffusion. Die WÖk ordnet deshalb Datenpflichten an Steuerungsmacht, Risiko und Marktrelevanz. Wer mehr Einfluss auf Lieferketten hat, trägt mehr Verantwortung.

| Akteur | Pflicht | Schutz |

| --- | --- | --- |

| Primärproduzent | Basisdaten und Nachweise | vereinfachte Standards, Finanzierungshilfe |

| Importeur | Datenvollständigkeit und Risikoerklärung | klare Methodik, Nachreichungsfristen |

| Hersteller | Aggregation und Produktgruppen-Score | standardisierte Schnittstellen |

| Händler/Plattform | Preisschild und Verbraucherinfo | keine eigene Vollprüfung jeder Vorstufe |

| Wirkungsrat/Behörde | Methodik, Register, Prüfung | Transparenz und Rechtsstaatlichkeit |


## Roadmap für Lieferketten-Pilotierung


Die Lieferkettenlogik sollte nicht in allen Branchen gleichzeitig starten. Geeignet sind Produktgruppen mit hoher Wirkungsrelevanz, vorhandenen Daten, klaren Lieferketten und bestehenden EU-Anschlussstellen. Textilien, Batterien, bestimmte Lebensmittel, Bauprodukte und Chemie eignen sich als frühe Felder.

Die Roadmap muss mit Bestandsschutz und Übergängen arbeiten. Bestehende Grobkonzepte, Lieferkettenpapiere und Konzernbeispiele bleiben Grundlagen; die neuen Detailkonzepte liefern die steuerliche und methodische Vertiefung.

Nach jeder Pilotphase müssen Datenqualität, Preiswirkung, Lieferantenverhalten, KMU-Belastung und Verbraucherverständlichkeit evaluiert werden.

| Phase | Fokus | Ergebnis |

| --- | --- | --- |

| 1 | Schatten-Scorecards in Pilotbranchen | Methodik und Datenlücken erkennen |

| 2 | freiwillige Vorsteuer-Demo | Unternehmen testen Einkaufswirkung |

| 3 | begrenzte steuerliche Wirkung | Marktreaktionen prüfen |

| 4 | Import- und Grenzlogik ergänzen | internationale Fairness prüfen |

| 5 | Regelbetrieb mit Evaluation | lernende Anpassung |


## Quellen und Anschlussdokumente

- Natalie Weber: Die neue Ordnung des Wohlstands, Teile V-VIII zu WÖk-IDs, Scorecards, WUStG, DPP, Produkten und Märkten.

- Natalie Weber: WP_Produkte - Produktbesteuerung durch Wirkung.

- Natalie Weber: Beispiel Apfel Wirkungssteuer Bonusregel.

- Natalie Weber: Technische Leitlinien zum Wirkungssteuergesetz (WUStG) - Extended v2.

- Natalie Weber: Wirkungsökonomie in der Lieferkette.

- Natalie Weber: Beispiel-Konzern - Von der CSRD zur Produktscorecard am Beispiel BASF Polyamid.

- Natalie Weber: Führender Begriffsleitfaden der Wirkungsökonomie v1.0.

- Europäische Kommission: Corporate Sustainability Reporting / CSRD und ESRS.

- Europäische Kommission: Ecodesign for Sustainable Products Regulation (ESPR) und Digital Product Passport.

- Europäische Kommission: Corporate Sustainability Due Diligence Directive (CSDDD).

- Europäische Kommission: Carbon Border Adjustment Mechanism (CBAM).

## Vertiefung: Vom Lieferkettengesetz zur Preisrückkopplung

Sorgfaltspflichten und Berichtspflichten sind notwendig, aber sie erzeugen noch keine automatische Marktlogik. Unternehmen können Risiken identifizieren, Prozesse dokumentieren und Berichte veröffentlichen, ohne dass der Preis eines Produkts die Lieferkettenwirkung unmittelbar abbildet. Die Wirkungsumsatzsteuer ergänzt diese Pflichten nicht durch mehr Symbolik, sondern durch Preisrückkopplung.

Der Unterschied ist zentral: Eine Compliance-Pflicht fragt, ob ein Unternehmen bestimmte Prozesse erfüllt. Eine Wirkungssteuer fragt zusätzlich, ob die Produkt- und Lieferkettenwirkung in den wirtschaftlichen Anreiz eingeht. Damit entsteht ein praktischer Hebel, der über reine Berichtspflicht hinausgeht.

| Instrument | Was es leistet | Was die WÖk ergänzt |
| --- | --- | --- |
| Lieferkettengesetz / CSDDD | Sorgfaltspflichten, Risikoanalyse, Beschwerdemechanismen | Steuerliche und preisliche Rückkopplung der Wirkung. |
| CSRD/ESRS | Berichtsdaten und doppelte Wesentlichkeit | Überführung in Produkt- und Lieferkettenscorecards. |
| DPP | Produkt- und Materialinformationen | Verknüpfung mit FinalScore, Vorsteuer und Verbraucherinformation. |
| Zoll/Importlogik | Warenwert, Herkunft, Einfuhrprozess | Wirkungsabhängige Importsteuer und Datenqualitätsprüfung. |



## Vertiefung: Rote Linien in globalen Lieferketten

Nicht alle Wirkungen sind verrechenbar. Die Wirkungsökonomie braucht rote Linien, damit schwere Schäden nicht durch gute Teilwerte kompensiert werden. In Lieferketten betrifft das insbesondere Kinderarbeit, Zwangsarbeit, schwere Arbeitsschutzverstöße, gravierende Umweltgifte, Entwaldung, massive Wassergefährdung, Korruption, systematische Diskriminierung und demokratiefeindliche Einflussnahme.

- Rote Linien lösen keine automatische moralische Vernichtung eines Unternehmens aus, aber sie verhindern positive Gesamtbewertung.
- Abhilfepläne können anerkannt werden, wenn sie überprüfbar, zeitgebunden und wirksam sind.
- Sofortige Ausschlüsse sollten bei schweren, akuten und nicht behobenen Verstößen möglich sein.
- Lieferanten dürfen nicht allein gelassen werden: Transformation ist besser als bloßes De-Listing, sofern Rechte und Umwelt wirksam geschützt werden.



## Vertiefung: Lieferantenschutz und Entwicklungswirkung

Eine europäische Wirkungslogik darf nicht dazu führen, dass große Unternehmen kleine Lieferanten aus dem globalen Süden wegen Datenlücken fallen lassen. Das wäre wirkungsökonomisch falsch. Der bessere Pfad ist eine Kombination aus Mindestschutz, Transformationsunterstützung und Datenaufbau. Gute Lieferanten sollen Zugang zu Märkten, Finanzierung und technischen Verbesserungen erhalten.

| Risiko | WÖk-Schutzmechanismus |
| --- | --- |
| Datenanforderungen verdrängen kleine Lieferanten | Stufenmodell, kooperative Audits, gemeinsame Datenpools, technische Hilfe. |
| Große Käufer wälzen Kosten ab | Faire Vertragsbedingungen, Transformationsbudgets, Lieferantenfonds. |
| De-Listing statt Verbesserung | Abhilfeplan vor Ausschluss, außer bei schweren roten Linien. |
| Zertifikatsabhängigkeit | Mehrquellenprüfung: Daten, Audits, Stichproben, Beschwerdemechanismen. |
| Greenwashing durch Selbstauskunft | Assurance, Whistleblowerkanäle, Stichproben und Wirkungsrat-Standards. |



## Vertiefung: Mindestanforderungen an Import- und Vorsteuer-Tools

Die Website und spätere Rechner sollten die Lieferkettenlogik in drei Ebenen erklären: erstens Lieferkettenscore, zweitens Vorsteuerfähigkeit, drittens Importwirkung. Ein gutes Tool zeigt nicht nur das Ergebnis, sondern die Engstelle. Wo entsteht der negative Score? Welche Daten fehlen? Welche Verbesserung würde die Steuerklasse verändern?

- Lieferketten-Scorecard mit Stufen: Rohstoff, Verarbeitung, Fertigung, Transport, Handel.
- Vorsteuer-Modul: Welche Vorleistungen sind voll, teilweise oder nicht vorsteuerfähig?
- Import-Modul: Warenwert plus FinalScore plus Datenqualität.
- Verbesserungsmodus: Welche Lieferanten- oder Prozessänderung hebt das schwächste Feld?
- Sicherheitsmodus: Rote Linien und Datenunsicherheiten separat anzeigen.
