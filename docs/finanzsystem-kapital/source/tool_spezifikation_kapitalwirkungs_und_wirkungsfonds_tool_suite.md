# Tool-Spezifikation: Kapitalwirkungs- und Wirkungsfonds-Tool-Suite

**Autorin:** Natalie Weber
**Referenz:** Wirkungsökonomie
**Version:** v0.2 · T-SROI-Rechenstandard v1.1
**Stand:** 2. August 2026

## Zweck

Die Tool-Suite macht Kapitalwirkung modellhaft sichtbar. Sie ist keine Anlageberatung, keine Kreditentscheidung, keine Steuerberatung und kein Versicherungsrating. Sie dient der strukturierten Reflexion von Wirkung, Risiko, Resilienz und Finanzierung.

## Module

1. **Kapitalwirkungscheck**
   Prüft, ob eine Kapitalentscheidung positive Netto-Wirkung ermöglicht oder negative Wirkung skaliert.

2. **Portfolio-Wirkungsrisiko-Rechner**
   Bewertet Portfolios nach NWI, T-SROI, Stranded-Asset-Risiko, Datenqualität und SDG+/Governance-Risiken.

3. **Fonds-T-SROI-Rechner**
   Bewertet Fondsinvestitionen erst nach offenem Schutz-Gate anhand dokumentierter direkter und separat belegter transformativer Nutzen- und Schadenströme in Euro derselben Preisbasis. Resilienz, Reichweite und Systemhebel werden als Wirkpfad- und Evidenzangaben geprüft, nicht als Multiplikatoren verrechnet.

4. **Kreditwirkungsprüfung**
   Ergänzt klassische Kreditprüfung um Wirkungsrisiko, Transformationspfad, Datenqualität und Resilienzbonus.

5. **Versicherbarkeits- und Resilienzcheck**
   Prüft, ob Objekte, Portfolios oder Regionen durch Prävention, Anpassung und Governance versicherbarer werden.

6. **Wirkungsfonds-Simulator**
   Zeigt Einzahlungen, Fondslogik, Auszahlungen und Wirkungsnachweise verschiedener Fondsarten.

7. **Steuer- und Fondsarchitektur-Modul**
   Verknüpft WUStG, WEstG, WKStG, WGewStG, Kapitalwirkungsaufschläge, Wirkungsvermögensteuer, Wirkungserbschaftsteuer und Automatisierungsdividende.

## Eingaben

- Akteurstyp: Bank, Versicherung, Fonds, Unternehmen, Kommune, Bürger:in
- Kapitalart: Kredit, Eigenkapital, Anleihe, Versicherung, Garantie, Fonds, Steuer, Zuschuss
- Wirkungsfeld: Produkte, Unternehmen, Wohnen, Arbeit, Rente, Bildung, Gesundheit, Medien, Klima, Wissenschaft
- Investitions-/Finanzierungsvolumen
- SDG-/SDG+-Zuordnung
- WÖk-IDs und Scorecardwerte
- Datenqualität und Evidenzstatus
- Transformationswirkpfad mit Vergleichsfall und Zurechnung
- Resilienz-, Reichweiten- und Skalierungsnachweise
- negative Engpässe / Reverse Merit Order

## Modellhafte Ergebnisgrößen

- Kapitalwirkungsprofil
- NWI nur bei offenem Schutz-Gate
- Prüfstatus des Transformationspfads (kein Rechenmultiplikator)
- T-SROI nach Rechenstandard v1.1 – nur bei belegten Euro-Nutzen- und Schadenströmen sowie offenem Schutz-Gate
- Resilienz- und Wirkpfad-Evidenz
- Stranded-Asset-Risiko
- Datenqualitätsstufe
- mögliche institutionelle Rückkopplung: Bonus, Malus, Fondsfähigkeit, Kreditkondition, Versicherbarkeitsverbesserung oder Steuerbezug – jeweils nur nach zuständiger, rechtsgebundener Entscheidung

Ein Profilwert, ein NWI und ein T-SROI beantworten unterschiedliche Fragen. Der Profilwert fasst dimensionsgleiche Scores zusammen. Der NWI darf nur bei erfüllten roten Linien, klarer Systemgrenze, Zurechnung und ausreichender Evidenz ausgewiesen werden. T-SROI setzt zusätzlich voraus, dass direkter und transformativer Nutzen, Schäden sowie Ressourcen in Euro derselben Preisbasis vorliegen. Reichweite, Resilienz, Diffusion und Datenqualität sind wichtige Wirkpfad- oder Evidenzangaben; sie erhöhen keinen Geldwert von selbst.

## T-SROI-Rechenregel v1.1

T-SROI ist kein Punktwert und kein Multiplikator. Er setzt den Barwert kausal zurechenbarer direkter und separat belegter transformativer Nettonutzen zum Barwert aller eingesetzten Ressourcen ins Verhältnis. Eine Zahl darf nur ausgewiesen werden, wenn das Schutz-Gate offen ist: rote Linien sind geprüft, Systemgrenze, Vergleichsfall, Preisbasis und Zurechnung sind dokumentiert und die Evidenz reicht für die beanspruchten Nutzenströme.

T-SROI = Summe t=1..T [((B_direkt,t + B_transformativ,t) * a_t * (1-d_t) * (1-v_t) - S_t) / (1+r)^t] / Summe t=0..T [(I_t + K_t) / (1+r_K)^t].

a_t (Zurechnung), d_t (Deadweight) und v_t (Verdrängung) begrenzen nur den beanspruchten Nutzen. S_t bezeichnet Schäden innerhalb der Bilanzgrenze und wird stets vollständig abgezogen. I_0 liegt bei t=0; alle Werte nutzen dieselbe Preisbasis. Für die konservative Untergrenze wird die Unsicherheit u_t nur auf Nutzen angewandt: PV_N^L = Summe t [((B_direkt,t + B_transformativ,t) * (1-u_t) * a_t * (1-d_t) * (1-v_t) - S_t)/(1+r)^t]. Der Schaden wird nie mitgekürzt.

## Schutzlinien

- keine Personenbewertung
- keine automatische Kredit-, Steuer-, Versicherungs- oder Förderentscheidung
- keine Anlageberatung
- keine personenbezogene Bonität
- keine Kompensation schwerer Negativwirkung
- transparente Modellannahmen
- Datenqualität sichtbar machen
- Beschwerde- und Korrekturpfad vorsehen

Diese öffentliche Lesefassung verweist für die vollständige Methode auf den [T-SROI-Rechenstandard v1.1](/werkzeuge/t-sroi/) und den zugehörigen [Quellennachweis WÖK-Q-1024](/quellenarchiv/wok-q-1024/). Sie enthält keine Produktions- oder Repository-Hinweise.
