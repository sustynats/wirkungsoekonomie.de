# Importvertrag: landesspezifische SDG-Ziele

## Zweck

Jedes Landesportal arbeitet mit zwei verbundenen, aber unterschiedlichen
Ebenen:

1. **Agenda 2030 und die 17 SDGs** sind der gemeinsame, übergeordnete
   Referenzrahmen für alle Länder. Sie bleiben bei jeder Landesanalyse
   sichtbar.
2. **Landesspezifische Nachhaltigkeitsstrategien** konkretisieren diesen
   Rahmen mit eigenen, versionierten Zielen und Indikatoren. Sie ersetzen die
   SDGs nicht und werden nicht als Verfassungsrecht dargestellt.

Ein Landesportal kann die SDGs deshalb nicht nur mit allgemeinen Kacheln
zeigen. Es braucht zusätzlich die vom jeweiligen Land abgeleiteten Ziele und
Indikatoren als versionierte Daten. Für Sachsen-Anhalt ist die führende Quelle
die *Nachhaltigkeitsstrategie des Landes Sachsen-Anhalt - Neuauflage 2022*.

Die Quelle erklärt 28 Nachhaltigkeitsziele, die durch das Land beeinflussbar
sind. Diese Ziele sind eine **versionierte Landesstrategie**, nicht Teil der
Landesverfassung. Verfassungs- und Gesetzesbezüge werden daneben geführt.

## Erwartete Ausgabe pro Ziel

```json
{
  "id": "st-sa-2022-001",
  "jurisdiction_id": "sachsen-anhalt",
  "label": "…",
  "source_quote": "…",
  "source_location": { "page": 0, "section": "…" },
  "sdg_codes": ["SDG_00"],
  "indicator_refs": ["…"],
  "target_type": "QUANTIFIED | DIRECTIONAL | RULE_BASED",
  "target_value": { "value": null, "unit": null, "target_date": null },
  "measurement_boundary": "…",
  "valid_from": "2022-09-20",
  "valid_to": null,
  "source_ref": "sachsen-anhalt-nachhaltigkeitsstrategie-2022"
}
```

`target_value` bleibt `null`, wenn die Strategie keine belastbare
Zielgröße enthält. Es darf kein Wert ergänzt oder geschätzt werden.

## Vollständigkeitsprüfung

Der Import wird nur freigegeben, wenn:

1. exakt 28 voneinander unterscheidbare Ziele aus der Quelle vorliegen oder
   jede Differenz zur Quellenzählung begründet dokumentiert ist;
2. jedes Ziel eine Seiten- und Abschnittsfundstelle besitzt;
3. jedes Ziel mindestens einem SDG oder als bewusst nicht direkt zugeordnet
   gekennzeichnet ist;
4. Indikatoren, Zielwerte und Geltungszeiträume nicht erfunden werden;
5. Landesverfassungsanker und Strategieziel nicht in demselben Feld stehen;
6. externe Wirkungen auf Bund, andere Länder, Europa oder globale öffentliche
   Güter als möglicher Wirkungsraum erfasst werden.

## Öffentliche Darstellung

Die Zielansicht zeigt zuerst die verständliche Zielaussage und ihren Status:

- übergeordneter Referenzrahmen: Agenda 2030 und betroffene SDGs;
- Landesstrategie, Fassung 2022;
- Zielwert vorhanden / kein Zielwert veröffentlicht;
- zugehöriger Indikator;
- betroffene SDGs und gegebenenfalls SDG+;
- Quelle und Fundstelle.

Sie zeigt ausdrücklich nicht: eine Parteiennote, eine Gesamtpunktzahl oder
eine Behauptung, ein Strategieziel sei Verfassungsrecht.
