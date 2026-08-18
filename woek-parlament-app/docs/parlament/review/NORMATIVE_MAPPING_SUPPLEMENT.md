# Ergänzungsprüfung: vollständige normative Einordnung

## Auftrag

Ergänze die bereits erstellten Fall-Reviews. Die bestehende Sachverhalts-, Wirkpfad-, Evidenz- und Berechnungsarbeit wird **nicht** neu geschrieben. Ergänzt wird ausschließlich die strukturierte Zuordnung der materiell berührten Wirkpfade zu:

1. den SDGs der Agenda 2030;
2. den sieben SDG+-Dimensionen der Wirkungsökonomie;
3. gegebenenfalls Staatszielen, Grundrechten, Staatsstrukturprinzipien und Schutzaufträgen.

Ein Mapping ist keine Gesamtpunktzahl und keine Rechtsfeststellung. Es macht transparent, welche Ziele, Schutzgüter und Prüfgrenzen ein belegter Wirkpfad berührt.

## Arbeitsgrundlage

Verwende je Fall ausschließlich:

- das ursprüngliche Fallpaket mit `source_manifest`, `fact_package` und `normative_reference_catalog`;
- den bereits vorliegenden strukturierten Review.

`case_id`, `review_type`, `input_package_hash` und `woek_reference_snapshot` werden unverändert übernommen. Alle bestehenden Aussagen bleiben erhalten, soweit sie nicht für die Ergänzung präzisiert werden müssen.

Keine Quelle, Zahl, Zurechnung, Gewichtung, Rechtsfolge oder Beobachtung erfinden. Fehlt die Beleglage, lautet die Richtung `EVIDENCE_OPEN` und die Datenlücke bleibt erhalten.

## Verbindliche Trennung

- **SDG**: global vereinbartes Ziel der Agenda 2030.
- **SDG+**: transparente WÖk-Erweiterung für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung. SDG+ ist keine UN-Kategorie.
- **CONSTITUTIONAL_ANCHOR**: Grundrechte, Staatsstrukturprinzipien, Staatsziele, Schutzaufträge, Landesverfassung oder EU-Primärrecht. Diese Ebene ist nicht als SDG+ auszugeben.

Mehrere Anker für dieselbe Veränderung begründen **keine** mehrfachen Wirkungspunkte. Eine negative Zuordnung zu einem Anker ist kein Rechtsurteil.

## Vollständige, zugelassene IDs

Verwende ausschließlich die IDs aus `normative_reference_catalog` des jeweiligen Fallpakets. Für die Bundesfälle umfasst der Katalog:

### SDGs

| ID | Ziel |
| --- | --- |
| `SDG_01` | Keine Armut |
| `SDG_02` | Kein Hunger |
| `SDG_03` | Gesundheit und Wohlergehen |
| `SDG_04` | Hochwertige Bildung |
| `SDG_05` | Geschlechtergleichstellung |
| `SDG_06` | Sauberes Wasser und Sanitäreinrichtungen |
| `SDG_07` | Bezahlbare und saubere Energie |
| `SDG_08` | Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung |
| `SDG_09` | Industrie, Innovation und Infrastruktur |
| `SDG_10` | Weniger Ungleichheiten |
| `SDG_11` | Nachhaltige Städte und Gemeinden |
| `SDG_12` | Nachhaltiger Konsum und Produktion |
| `SDG_13` | Klimaschutz |
| `SDG_14` | Leben unter Wasser |
| `SDG_15` | Leben an Land |
| `SDG_16` | Frieden, Gerechtigkeit und starke Institutionen |
| `SDG_17` | Partnerschaften zur Erreichung der Ziele |

### SDG+

| ID | Dimension |
| --- | --- |
| `SDG_PLUS_DEMOCRACY` | Demokratie |
| `SDG_PLUS_MEDIA_QUALITY` | Medienqualität |
| `SDG_PLUS_RULE_OF_LAW` | Rechtsstaatlichkeit |
| `SDG_PLUS_DISCOURSE_CAPACITY` | Diskursfähigkeit |
| `SDG_PLUS_INSTITUTIONAL_TRUST` | Institutionelles Vertrauen |
| `SDG_PLUS_SOCIAL_COHESION` | Gesellschaftlicher Zusammenhalt |
| `SDG_PLUS_DIGITAL_SELF_DETERMINATION` | Digitale Selbstbestimmung |

### Staatsziele, Grundrechte und Schutzaufträge

| ID | Anker |
| --- | --- |
| `GG_FUNDAMENTAL_RIGHTS` | Menschenwürde, Freiheit, Gleichheit und Rechtsschutz |
| `GG_ART_20_STATE_STRUCTURE` | Demokratischer und sozialer Rechtsstaat |
| `GG_ART_3_2_EQUALITY` | Tatsächliche Gleichberechtigung |
| `GG_ART_20A_NATURAL_FOUNDATIONS` | Natürliche Lebensgrundlagen |
| `GG_ART_20A_ANIMAL_PROTECTION` | Tierschutz und Tierwohl |
| `GG_ART_23_EUROPEAN_INTEGRATION` | Europäische Einigung |
| `GG_ART_109_2_MACROECONOMIC_BALANCE` | Gesamtwirtschaftliches Gleichgewicht |
| `AEUV_ART_13_ANIMAL_WELFARE` | Tiere als fühlende Wesen; nur bei tatsächlich EU-bezogenem Fall |

**Tierschutz und Tierwohl** sind mit `GG_ART_20A_ANIMAL_PROTECTION` eigenständig zu prüfen. Sie dürfen weder als bloße Unterkategorie von Biodiversität noch als Synonym für `SDG_15` behandelt werden. Berührt ein Fall sowohl Biodiversität als auch Tierwohl, müssen zwei unterscheidbare Wirkpfade oder Begründungen vorliegen.

Nicht jede ID gehört in jeden Fall. Zu erfassen sind alle **materiell berührten** Einträge, nicht eine schematische Vollständigkeitsliste.

## Ausgabeschritt je Fall

Ergänze oder ersetze nur `normative_mapping` im jeweiligen `review-result.json`:

```json
{
  "reference_frame": "SDGs, SDG+ und gegebenenfalls Verfassungs- und Staatszielrahmen",
  "mapping_status": "PROVISIONAL",
  "tile_mappings": [
    {
      "id": "SDG_03",
      "framework": "SDG",
      "direction": "POSITIVE_POTENTIAL",
      "evidence_status": "LIMITED",
      "rationale": "Kurze, fallbezogene Begründung mit klarer Wirkpfadgrenze.",
      "impact_path_refs": ["IP-01"],
      "source_refs": ["SOURCE-01"]
    },
    {
      "id": "GG_ART_20A_ANIMAL_PROTECTION",
      "framework": "CONSTITUTIONAL_ANCHOR",
      "direction": "EVIDENCE_OPEN",
      "evidence_status": "DATA_GAP",
      "rationale": "Es fehlt eine belastbare Quelle zur konkreten Veränderung der Lebensbedingungen von Tieren.",
      "impact_path_refs": ["IP-02"],
      "source_refs": ["SOURCE-02"]
    }
  ]
}
```

Die Felder `code`, `label`, `constitutional_anchor_type` und `legal_reference` nicht frei formulieren. Falls sie ausgegeben werden, müssen sie exakt dem mitgelieferten Katalog entsprechen; erforderlich sind sie nicht.

Zulässige Richtungen:

- `POSITIVE_POTENTIAL`
- `NEGATIVE_RISK`
- `AMBIVALENT`
- `EVIDENCE_OPEN`
- `OBSERVED_POSITIVE`
- `OBSERVED_NEGATIVE`

Bei bevorstehenden Entscheidungen sind ausschließlich Wirkungspotenzial, Risiko, Ambivalenz oder offene Evidenz zulässig. `OBSERVED_*` setzt eine getrennt dokumentierte Ex-post-Quelle voraus.

## Quellen- und Rechenregeln

- Jedes `source_refs`-Element muss exakt einer `source_id` im `source_manifest` desselben Fallpakets entsprechen.
- Jede Kachel verweist auf mindestens einen Wirkpfad und mindestens eine Quelle.
- Keine neue quantitative Wirkung, keinen Score und keine Gewichtung ergänzen.
- Eine nicht gewählte politische Option bleibt Gegenfaktum; sie darf nie als beobachtet ausgegeben werden.
- Bei möglicher nicht kompensierbarer Grenze diese in `non_compensable_boundaries` belassen oder präzisieren; nicht durch positive Mappings relativieren.

## Rückgabe

Erzeuge für jeden bearbeiteten Fall eine vollständige, aktualisierte `review-result.json` unter:

`case-results/<case-id>/review-result.json`

Zusätzlich eine kurze `batch-summary.md` mit:

- Zahl bearbeiteter Fälle;
- Zahl der SDG-, SDG+- und Rechts-/Schutzanker-Mappings;
- Fälle mit `EVIDENCE_OPEN`;
- Fälle, bei denen Tierschutz/Tierwohl oder andere Schutzgrenzen materiell berührt sind;
- offene Quellen- oder Methodenlücken.

Keine lokalen Pfade, Zugangsdaten, internen Arbeitsnotizen oder Namen technischer Hilfsmittel in die Rückgabe aufnehmen.
