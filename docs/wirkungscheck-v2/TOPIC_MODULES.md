# Wirkungscheck Bundestag V2 - Themenmodule

**Status:** Entwurf zur fachlichen Abnahme.  
**Phase 1:** Wohnen sowie Gesundheit und Pflege.

Ein Themenmodul ist kein Maßnahmenkatalog und keine Empfehlung. Es beschreibt
welche Zustandsveränderungen geprüft werden können, welche Engpässe plausibel
sind und woran Annahmen widerlegt werden müssten. Der Report darf keine
Veränderung als bereits eingetreten darstellen.

## Gemeinsames Modul-Schema

| Feld | Zweck |
| --- | --- |
| objective | Gewünschter Zustand bei betroffenen Menschen oder in der Versorgungslage. |
| bottleneck | Genannter Engpass; löst eine oder mehrere interne Bundesrollen aus. |
| success_signal | Beobachtbares Zustandsmerkmal, kein Budget-, Projekt- oder Outputnachweis. |
| boundary | Nicht hinnehmbare Verschlechterung; sie wird nicht mit anderem Fortschritt verrechnet. |
| constraint | Politische Anforderung an die Ausgestaltung; keine Persönlichkeits- oder Parteienzuordnung. |
| regional_feedback | Qualitative oder künftig belegte Rückmeldung zur lokalen Praxis. |
| evidence_status | Amtlicher Indikator vorhanden, Ergänzungsdaten erforderlich oder Datenlücke. |

Die Engine verwendet nur freigegebene Kombinationen aus diesem Dokument. Bei
einer offenen oder widersprüchlichen Kombination erzeugt sie einen Prüfauftrag
statt einer künstlich genauen Aussage.

## Modul Wohnen

### Fachlicher Fokus

Das Modul prüft nicht die verkürzte Annahme „Neubau führt automatisch zu
bezahlbarem Wohnen“. Wohnungsversorgung hängt von Bedarf, Lage, Bestand,
Zugänglichkeit, gesamten Wohnkosten, Flächennutzung, Barrierefreiheit und
Verdrängungsrisiken ab. Neubau kann Teil eines Wirkpfads sein; ebenso
Bestandsaktivierung, Umnutzung, Teilung großen Wohnraums, Aufstockung,
freiwilliger Wohnungstausch und altersgerechter Wechsel.

### Ziele

| ID | Sichtbarer Zielzustand | Konkretisierung |
| --- | --- | --- |
| housing_access | Mehr Haushalte finden passenden und bezahlbaren Wohnraum. | Zugang passend zu Haushaltsgröße, Lage, Bedarf und Zahlungsfähigkeit. |
| housing_existing_use | Vorhandener Wohnraum wird besser genutzt. | Leerstand und vermeidbare Fehlbelegung verringern, ohne Zwang oder Verdrängung. |
| housing_total_cost | Die gesamten Wohnkosten aus Miete, Energie und Nebenkosten werden tragbarer. | Gesamtbelastung, nicht allein Angebotsmiete. |
| housing_need_based_supply | Mehr benötigter Wohnraum entsteht dort, wo tatsächlich Bedarf besteht. | Bedarfsgerechter, nutzbarer Wohnraum statt bloßer Einheitenzahl. |
| housing_accessible | Mehr geeigneter barrierearmer oder altersgerechter Wohnraum steht zur Verfügung. | Nutzbarkeit, Erreichbarkeit und Wechselmöglichkeiten. |
| housing_stability | Menschen müssen seltener wegen steigender Wohnkosten ihr Umfeld verlassen. | Unfreiwillige Umzüge, Wohnungsverluste und soziale Entwurzelung begrenzen. |
| housing_unclear | Noch nicht eindeutig. | Kein Ziel priorisieren; zunächst Klärungsauftrag. |
| housing_other | Andere Veränderung. | Optionaler Freitext ohne automatische Kausalaussage. |

### Erfolgssignale

| ID | Sichtbares Signal | Evidenzstatus in Phase 1 |
| --- | --- | --- |
| housing_cost_burden_down | Die Wohnkostenbelastung der adressierten Haushalte sinkt. | Ergänzungsdaten erforderlich; im aktuellen Wahlkreisdatensatz nicht passend. |
| housing_access_easier | Passender Wohnraum wird tatsächlich leichter zugänglich. | Ergänzungsdaten erforderlich. |
| housing_vacancy_activated | Bestehender leerer oder schlecht genutzter Wohnraum wird tatsächlich bewohnt. | Ergänzungsdaten erforderlich; lokale Definitionen nötig. |
| housing_subsidy_reaches_target | Geförderter Wohnraum erreicht die vorgesehene Zielgruppe. | Ergänzungsdaten erforderlich; Belegungs- und Haushaltsdaten nötig. |
| housing_no_displacement | Unfreiwillige Wohnungsverluste oder Verdrängung nehmen nicht zu. | Datenlücke im vorhandenen Wahlkreisdatensatz. |
| housing_accessible_available | Geeigneter barrierearmer Wohnraum wird besser verfügbar. | Ergänzungsdaten erforderlich. |

### Rote Linien

| ID | Nicht kompensierbare Grenze | Konsequenz für den Report |
| --- | --- | --- |
| housing_boundary_cost | Wohnkosten der adressierten Haushalte | Mehr Angebot rechtfertigt keinen Anstieg der Belastung für die adressierte Gruppe. |
| housing_boundary_tenant_rights | Miet- und Rechtsschutz | Keine Wirkungsbehauptung ohne Prüfung der rechtlichen Absicherung. |
| housing_boundary_low_income_access | Zugang einkommensschwächerer Haushalte | Zielerreichung ist unvollständig, wenn diese Haushalte ausgeschlossen werden. |
| housing_boundary_health_safety | Gesundheit und Sicherheit des Wohnraums | Keine Absenkung von Sicherheit oder Wohnqualität als vermeintlicher Zielkonflikt. |
| housing_boundary_accessibility | Barrierefreiheit | Kein Fortschritt, der Zugänglichkeit verschlechtert. |
| housing_boundary_displacement | Verdrängung aus bestehenden Quartieren | Aufwertung oder Sanierung muss auf Verdrängungsfolgen geprüft werden. |
| housing_boundary_land | Natur und Fläche | Mehr Einheiten sind nicht automatisch vorrangig, wenn unverhältnismäßig Fläche verloren geht. |

### Wirklogiken und mögliche Bundesrollen

| Engpass | Aktivierte Bundesrolle | Fachliche Prüfspur |
| --- | --- | --- |
| Regeln passen nicht | Rechtsrahmen und Standards | Prüfen, ob Planungs-, Miet-, Förder- oder Zugangsregeln das Ziel unterstützen oder blockieren. |
| Finanzierung oder Anreize | Finanzierung und Anreize | Prüfen, ob Förderung, steuerliche Regeln und Kostenverteilung den adressierten Haushalten zugutekommen statt nur Aktivitäten auszulösen. |
| Personal oder Fähigkeiten | Vollzug und Umsetzbarkeit | Prüfen, ob Planung, Bewilligung, Beratung und Baukapazitäten den Wirkpfad praktisch begrenzen. |
| Verfahren oder digitaler Ablauf | Vollzug und Umsetzbarkeit | Prüfen, ob Genehmigung, Nachweis und Datenaustausch die Umsetzung unnötig verzögern. |
| Ebenen greifen nicht ineinander | Vollzug und Umsetzbarkeit | Prüfen, ob Bundesvorgaben, Länderprogramme und kommunale Praxis zusammenwirken. |
| Infrastruktur oder Zugang fehlen | Vollzug und Umsetzbarkeit | Prüfen, ob Verkehr, Versorgung, Beratung oder Zugang zum Bestand die Nutzung begrenzen. |
| Wirkung ist zu wenig bekannt | Wirkungsdaten und Rückkopplung | Prüfen, welche Haushalte erreicht werden und ob Kosten, Zugang und Verdrängung sich tatsächlich verändern. |
| Mehrere Punkte greifen ineinander | Mehrere Bundesrollen | Zwei klare Prüfspuren nennen; keine Scheingenauigkeit. |

### Regionale Rückkopplung

Die folgenden Beobachtungen sind keine amtlichen Wahlkreiskennzahlen. Sie
werden als Rückmeldung aus der Praxis verwendet:

- Suchende finden passenden Wohnraum nachweisbar leichter.
- Leerstand oder schlecht genutzter Bestand wird sichtbar aktiviert.
- Geförderte Wohnungen erreichen die vorgesehenen Haushalte.
- Die gesamte Wohnkostenbelastung sinkt auch vor Ort.
- Sanierung senkt die Gesamtbelastung, ohne Verdrängung auszulösen.
- Bundesweiter Fortschritt ist vor Ort bislang nicht erkennbar.

### Datenregel für Phase 1

Der vorhandene Wert „fertiggestellte Wohnungen je 1.000 Einwohner:innen“ ist ein
Aktivitäts- bzw. Outputwert. Er belegt weder Zugang noch Bezahlbarkeit noch
bedarfsgerechte Nutzung. Er wird im V2-Report deshalb nicht als Erfolgs- oder
Regionalindikator angezeigt. Der Report benennt die konkrete Datenlücke und die
erforderlichen Ergänzungsdaten.

## Modul Gesundheit und Pflege

### Fachlicher Fokus

Das Modul prüft Versorgung als zusammenhängenden Weg: Prävention, Zugang,
ambulante und stationäre Behandlung, Pflege, Reha, Beratung und kommunale
Unterstützung. Mehr Fälle, mehr Plätze oder höhere Ausgaben sind allein kein
Nachweis für bessere Versorgung. Entscheidend ist, ob Menschen rechtzeitig,
sicher und passend unterstützt werden und ob Belastung auf Betroffene,
Angehörige oder Fachkräfte verlagert wird.

### Ziele

| ID | Sichtbarer Zielzustand | Konkretisierung |
| --- | --- | --- |
| care_timely_help | Menschen erhalten rechtzeitig die gesundheitliche oder pflegerische Hilfe, die sie benötigen. | Zugang, Wartezeit, Erreichbarkeit und Übergänge. |
| care_self_determined | Pflegebedürftige Menschen können möglichst selbstbestimmt und sicher leben. | Unterstützte Autonomie und Sicherheit, nicht bloß Verbleib zu Hause. |
| care_relatives_relief | Angehörige werden durch Pflege nicht dauerhaft überlastet. | Planbarkeit, Entlastung und Zugang zu Unterstützung. |
| care_workforce_time | Fachkräfte haben genügend Zeit für gute Versorgung statt für vermeidbaren Verwaltungsaufwand. | Versorgungszeit, Arbeitsbedingungen und Umsetzbarkeit. |
| care_continuity | Hilfen greifen zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune besser ineinander. | Weniger Informations-, Zuständigkeits- und Versorgungsbrüche. |
| care_prevent_crisis | Gesundheitliche Verschlechterungen werden früher erkannt und vermeidbare Krisen seltener. | Prävention, frühzeitige Unterstützung und vermeidbare Akutlagen. |
| care_unclear | Noch nicht eindeutig. | Kein Ziel priorisieren; zunächst Klärungsauftrag. |
| care_other | Andere Veränderung. | Optionaler Freitext ohne automatische Kausalaussage. |

### Erfolgssignale

| ID | Sichtbares Signal | Evidenzstatus in Phase 1 |
| --- | --- | --- |
| care_timely_continuous | Menschen erhalten notwendige Versorgung rechtzeitig und ohne vermeidbare Brüche. | Ergänzungsdaten erforderlich. |
| care_reliable_support | Pflegebedürftige Menschen und ihre Angehörigen finden verlässlich passende Unterstützung. | Ergänzungsdaten erforderlich. |
| care_avoidable_crisis_down | Vermeidbare Verschlechterungen, Krisen und Krankenhausaufenthalte nehmen ab. | Ergänzungsdaten erforderlich; Kausalität nicht aus Routinedaten allein schließen. |
| care_more_time | Fachkräfte verbringen mehr Zeit mit Versorgung und weniger mit vermeidbarer Bürokratie. | Ergänzungsdaten erforderlich. |
| care_equitable_access | Versorgung erreicht Menschen unabhängig von Wohnort, Einkommen oder Unterstützungsnetz besser. | Datenlücke im vorhandenen Wahlkreisdatensatz. |
| care_self_determined_longer | Menschen können länger selbstbestimmt und sicher in ihrem gewählten Umfeld leben. | Ergänzungsdaten erforderlich. |

### Rote Linien

| ID | Nicht kompensierbare Grenze | Konsequenz für den Report |
| --- | --- | --- |
| care_boundary_dignity_safety | Sicherheit und Würde der versorgten Menschen | Effizienzgewinn ersetzt keine sichere und würdige Versorgung. |
| care_boundary_access | Zugang zu notwendiger Versorgung, auch bei geringem Einkommen | Erfolg ist unvollständig, wenn Zugangshürden wachsen. |
| care_boundary_self_determination | Selbstbestimmung und informierte Entscheidung | Entlastung darf nicht gegen den erklärten Willen Betroffener organisiert werden. |
| care_boundary_relatives | Schutz von Angehörigen vor Überlastung | Verlagerung unbezahlter Pflege ist kein neutraler Nebeneffekt. |
| care_boundary_workforce | Arbeitsbedingungen und Gesundheit der Fachkräfte | Kapazität darf nicht durch Überlastung erkauft werden. |
| care_boundary_rural_access | Verlässlichkeit im ländlichen Raum und in belasteten Regionen | Zentralisierung erfordert Prüfung der tatsächlichen Erreichbarkeit. |
| care_boundary_data | Schutz persönlicher Gesundheitsdaten | Datengewinnung muss erforderlich, rechtssicher und verhältnismäßig sein. |

### Wirklogiken und mögliche Bundesrollen

| Engpass | Aktivierte Bundesrolle | Fachliche Prüfspur |
| --- | --- | --- |
| Regeln passen nicht | Rechtsrahmen und Standards | Prüfen, ob Leistungs-, Berufs-, Zulassungs- und Datenschutzregeln den Versorgungsweg unnötig unterbrechen. |
| Finanzierung oder Anreize | Finanzierung und Anreize | Prüfen, ob Vergütung und Förderung rechtzeitige, koordinierte und bedarfsgerechte Versorgung belohnen. |
| Personal oder Fähigkeiten | Vollzug und Umsetzbarkeit | Prüfen, ob Qualifizierung, Personalbemessung, Anerkennung und Aufgabenverteilung die Versorgung begrenzen. |
| Verfahren oder digitaler Ablauf | Vollzug und Umsetzbarkeit | Prüfen, ob interoperable, sichere Abläufe Fachzeit freisetzen oder neue Belastung erzeugen. |
| Ebenen greifen nicht ineinander | Vollzug und Umsetzbarkeit | Prüfen, wie Finanzierung, Länderzuständigkeiten, Kommunen und Leistungserbringer verbunden werden. |
| Infrastruktur oder Zugang fehlen | Vollzug und Umsetzbarkeit | Prüfen, ob ambulante Angebote, Pflegeplätze, Mobilität, Beratung oder digitale Zugänge fehlen. |
| Wirkung ist zu wenig bekannt | Wirkungsdaten und Rückkopplung | Prüfen, ob Daten Versorgungsbrüche, Belastung und Zugangsungleichheit sichtbar machen, ohne Persönlichkeitsrechte zu verletzen. |
| Mehrere Punkte greifen ineinander | Mehrere Bundesrollen | Zwei klare Prüfspuren nennen; Zielkonflikte nicht verdecken. |

### Regionale Rückkopplung

- Menschen und Angehörige finden vor Ort schneller passende Hilfe.
- Übergänge zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune funktionieren verlässlicher.
- Fachkräfte berichten über weniger vermeidbare Dokumentation und Koordination.
- Unterstützung ist auch außerhalb großer Zentren erreichbar.
- Pflegebedürftige Menschen können häufiger im gewünschten Umfeld bleiben.
- Bundesweiter Fortschritt ist vor Ort bislang nicht erkennbar.

### Datenregel für Phase 1

Der aktuelle Wahlkreisdatensatz enthält keine fachlich passende Gesundheits- oder
Pflegekennzahl. Das Modul zeigt daher keine zufälligen Sozial- oder
Arbeitsmarktwerte an. Es benennt die Datenlücke und macht transparent, welche
Ergänzungsdaten für eine belastbare Prüfung erforderlich wären.

## Zurückgestellte Themen

Diese Themen gehören zur späteren Produkt-Roadmap, aber nicht zum sichtbaren
V2-Pilotumfang: Bildung und Teilhabe, Arbeit und Qualifizierung, Wirtschaft und
Transformation, Energie und Netze, Mobilität, Klimaresilienz, digitale
staatliche Infrastruktur sowie handlungsfähiger Staat und Verwaltung. Für jedes
ist vor Freischaltung ein vollständiges Modul nach diesem Schema, ein
Daten-Audit und ein Verständlichkeitstest erforderlich.

