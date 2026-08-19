import { createHash } from "node:crypto";

const ROOT = "/WOEK";
const EXPECTED_BRANCH = "automation/common-targets-finalize-20260819";
const REVIEW_ID = "20260819T1905CEST-FINAL";
const ANALYSIS_ROOT = `${ROOT}/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis`;
const CONTROL_ROOT = `${ROOT}/WOEK-AUTOPILOT/CONTROL`;
const FINAL_RECOMMENDATIONS = `${ANALYSIS_ROOT}/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl`;
const FINAL_RECOMMENDATION_HANDOFF = `${CONTROL_ROOT}/RECOMMENDATION-BACKFILL-HANDOFF-2026-08-19-FINAL-R1-FINAL.json`;
const TARGET_JSONL = `${ANALYSIS_ROOT}/COMMON-TARGETS-REVIEW-${REVIEW_ID}.jsonl`;
const TARGET_MD = `${ANALYSIS_ROOT}/COMMON-TARGETS-REVIEW-${REVIEW_ID}.md`;
const TARGET_VALIDATION = `${CONTROL_ROOT}/COMMON-TARGETS-VALIDATION-${REVIEW_ID}.json`;
const TARGET_HANDOFF = `${CONTROL_ROOT}/BRIDGE/WOEK-COMMON-TARGETS-NEW-RECOMMENDATIONS-${REVIEW_ID}.json`;

const records = [
  {
    common_targets_review_id: "WOEK-CTR-ABSCHIEBEHAFT-RECHTSBEISTAND-2026-R1",
    recommendation_id: "WOEK-REC-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026-R1",
    impact_case_id: "WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026",
    review_version: "1.0",
    reviewed_at: "2026-08-19T19:05:00+02:00",
    knowledge_cutoff_date: "2026-08-19",
    fach_status: "APPROVED_WITH_OPEN_DATA",
    actual_option: { option_id: "A", label: "Heutiger Rechtsrahmen ohne automatische Pflichtbestellung" },
    woek_option: { option_id: "NR", label: "Keine robuste Präferenz - gemeinsamer Schutzkorridor für praktisch wirksamen Rechtsschutz" },
    source_catalog: {
      PG: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1227CEST.jsonl#WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026",
      REC: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026-R1",
      DNS: "/WOEK/WOEK-WIRKINDIKATORENREGISTER-1.0/REGISTRY/DNS-INDICATOR-SOURCE-SEED-1.0.csv"
    },
    layer_status: {
      MPD: "APPROVED_WITH_OPEN_DATA",
      UN_SDG: "APPROVED_WITH_OPEN_DATA",
      WOEK_SDGPLUS: "REVIEWED_NOT_ASSESSABLE",
      CONSTITUTIONAL_RIGHTS_PRINCIPLES: "APPROVED_WITH_OPEN_DATA",
      STATE_GOALS_AND_BINDING_LAW: "SCREENED",
      DNS_2025: "REVIEWED_NOT_ASSESSABLE",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "NOT_APPLICABLE_NO_APPROVED_CASE_LINK",
      WOEK_BOUNDARIES_NONCOMPENSATION: "APPROVED",
      SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS: "APPROVED_WITH_OPEN_DATA"
    },
    layer_notes: {
      WOEK_SDGPLUS: "Keine fallbezogene zusätzliche WÖk-SDG+-Target-ID fachlich freigegeben.",
      DNS_2025: "Kein hinreichend direkter DNS-Indikator wird als fallbezogene Wirkungsrichtung veröffentlicht; Monitoring nutzt primär Verfahrens- und Rechtsschutzdaten.",
      STATE_GOALS_AND_BINDING_LAW: "Grundrechte und wirksamer Rechtsschutz werden getrennt als harte Rechts- und Schutzebene geführt.",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "Kein freigegebener konkreter Missions- oder Maßnahmenbezug."
    },
    mappings: [
      { target_reference_id: "MPD-MENSCH", target_label: "Mensch", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Weniger Verfahrensaufwand kann Abläufe erleichtern, während schwächerer realer Rechtszugang bei Freiheitsentzug erhebliche individuelle Schäden erzeugen kann. Der WÖk-Korridor setzt den praktisch wirksamen Rechtszugang als nicht kompensierbare Bedingung.", evidence_grade: "LOW", uncertainty: "HIGH", source_refs: ["PG", "REC"], limitations: ["Keine robuste Präferenz zwischen universeller und risikobasierter Beiordnung."] },
      { target_reference_id: "MPD-DEMOCRATIE", target_label: "Demokratie und Rechtsstaat", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Gerichtliche Fehlerkorrektur bei Freiheitsentzug ist ein zentraler rechtsstaatlicher Mechanismus. Organisationsentlastung ist positiv nur, solange Zugang und Kontrolle praktisch wirksam bleiben.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "UN-SDG-16", target_label: "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen", direction_actual: "AMBIVALENT_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Effektiver Rechtszugang und belastbare gerichtliche Kontrolle stärken institutionelle Rechtsstaatlichkeit; rein administrative Beschleunigung ohne Korrekturzugang kann sie schwächen.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: ["SDG-Zuordnung beschreibt den Wirkmechanismus, nicht eine kausale Veränderung des SDG-Zustands."] },
      { target_reference_id: "GG-ART2-2-GG-ART104", target_label: "Freiheit der Person und verfassungsrechtliche Sicherungen des Freiheitsentzugs", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Freiheitsentzug verlangt besonders belastbare Verfahrens- und Kontrollsicherungen. Ein Design ist nur vertretbar, wenn unabhängiger Rechtskontakt und gerichtliche Überprüfung tatsächlich erreichbar bleiben.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: ["Keine Behauptung, dass universelle Pflichtbeiordnung als konkrete Organisationsform verfassungsrechtlich zwingend ist."] },
      { target_reference_id: "BOUNDARY-EFFEKTIVER-RECHTSSCHUTZ-FREIHEITSENTZUG", target_label: "Nichtkompensation wirksamen Rechtsschutzes bei Freiheitsentzug", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Verfahrens- oder Vollzugsgewinne kompensieren keine materielle Verschlechterung wirksamer gerichtlicher Fehlerkorrektur.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "RESILIENCE-RECHTSSCHUTZ-FEHLERKORREKTUR", target_label: "Resilienz durch frühe unabhängige Fehlerkorrektur", direction_actual: "OPEN_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Früher unabhängiger Rechtskontakt und dokumentierte Korrekturwege machen das System robuster gegen Fehlentscheidungen unter Zeit-, Sprach- und Kapazitätsstress.", evidence_grade: "LOW", uncertainty: "HIGH", source_refs: ["REC"], limitations: ["Nettoeffekt verschiedener Organisationsmodelle nicht belastbar quantifiziert."] }
    ],
    hindsight_guard: "Entscheidungswissen vom 05.12.2025 und spätere Implementationsdaten bleiben getrennt. Der aktuelle Common-Targets-Review nutzt die RecommendationVersion vom 19.08.2026, behauptet aber nicht, spätere Outcomes seien damals bekannt gewesen.",
    causal_attribution_disclaimer: "Zielzuordnung beschreibt fachlich geprüfte Wirkmechanismen, Schutzgrenzen und Monitoringbezüge. Sie beweist keine spätere kausale Zielveränderung durch die Reform.",
    aggregation_rule: "Keine Gesamtnote und keine Verrechnung von Rechtsschutz mit Verfahrensgeschwindigkeit oder Vollzugskennzahlen.",
    machine_mapping_public_allowed: false,
    dns_source_catalog_count: 82
  },
  {
    common_targets_review_id: "WOEK-CTR-GEAS-DE-2026-R1",
    recommendation_id: "WOEK-REC-GEAS-DE-2026-R1",
    impact_case_id: "WOEK-IMPACT-GEAS-DE-2026",
    review_version: "1.0",
    reviewed_at: "2026-08-19T19:05:00+02:00",
    knowledge_cutoff_date: "2026-08-19",
    fach_status: "APPROVED_WITH_OPEN_DATA",
    actual_option: { option_id: "A", label: "Beschlossene nationale GEAS-Umsetzung als Referenz" },
    woek_option: { option_id: "B", label: "Kapazitäts- und grundrechtssichere nationale Ausgestaltung" },
    source_catalog: {
      PG: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-3-OF-4-20260819T123140CEST.jsonl#WOEK-IMPACT-GEAS-DE-2026",
      REC: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-GEAS-DE-2026-R1",
      DNS: "/WOEK/WOEK-WIRKINDIKATORENREGISTER-1.0/REGISTRY/DNS-INDICATOR-SOURCE-SEED-1.0.csv"
    },
    layer_status: {
      MPD: "APPROVED_WITH_OPEN_DATA",
      UN_SDG: "APPROVED_WITH_OPEN_DATA",
      WOEK_SDGPLUS: "REVIEWED_NOT_ASSESSABLE",
      CONSTITUTIONAL_RIGHTS_PRINCIPLES: "APPROVED_WITH_OPEN_DATA",
      STATE_GOALS_AND_BINDING_LAW: "SCREENED",
      DNS_2025: "REVIEWED_NOT_ASSESSABLE",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "NOT_APPLICABLE_NO_APPROVED_CASE_LINK",
      WOEK_BOUNDARIES_NONCOMPENSATION: "APPROVED",
      SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS: "APPROVED_WITH_OPEN_DATA"
    },
    layer_notes: {
      WOEK_SDGPLUS: "Keine zusätzliche fallbezogene WÖk-SDG+-Target-ID fachlich freigegeben.",
      DNS_2025: "GEAS-spezifische Schutz- und Verfahrensqualität wird besser über Fall- und Prozessindikatoren als über einen einzelnen DNS-Indikator überwacht.",
      STATE_GOALS_AND_BINDING_LAW: "Verbindlicher EU-Rechtsrahmen begrenzt den deutschen Gestaltungsspielraum; nationale Organisations- und Ermessensspielräume bleiben relevant.",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "Kein freigegebener konkreter Missions- oder Maßnahmenbezug."
    },
    mappings: [
      { target_reference_id: "MPD-MENSCH", target_label: "Mensch", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Einheitlichere und schnellere Verfahren können Unsicherheit reduzieren. Ohne ausreichende Beratung, Vulnerabilitätserkennung und Unterbringungskapazität können Schutz- und Gesundheitsrisiken steigen. Die WÖk-Option koppelt Beschleunigung an reale Kapazität.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "MPD-DEMOCRATIE", target_label: "Demokratie und Rechtsstaat", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Klare Zuständigkeit kann institutionelle Leistungsfähigkeit erhöhen; zu enge Fristen oder unzureichender Rechtszugang können Fehlerkorrektur schwächen. Die bevorzugte Ausgestaltung hält beides zusammen.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "UN-SDG-16", target_label: "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen", direction_actual: "AMBIVALENT_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Verfahrensklarheit, Zugang zu Rechtsschutz und belastbare Institutionen wirken auf SDG 16. Die WÖk-Option reduziert das Risiko, dass Geschwindigkeit durch höhere Fehlerraten erkauft wird.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: ["Keine Kausalattribution späterer SDG-Änderungen."] },
      { target_reference_id: "REF-NON-REFOULEMENT", target_label: "Non-Refoulement und individuelle Schutzprüfung", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Beschleunigte oder transferorientierte Abläufe dürfen eine individuelle Schutzprüfung und wirksame Fehlerkorrektur nicht praktisch entleeren.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "BOUNDARY-NON-REFOULEMENT-RECHTSBEHELF", target_label: "Nichtkompensation von Non-Refoulement und effektivem Rechtsbehelf", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Kürzere Verfahren, mehr Transfers oder geringere Verwaltungskosten kompensieren keine konkrete Schutzrechtsverletzung.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "RESILIENCE-GEAS-KAPAZITAET", target_label: "Resilienz durch kapazitätsgebundene Verfahrenssteuerung", direction_actual: "NEGATIVE_RISK_IF_ADMIN_BARRIER", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Ein System, das Fristen, Beratung, Unterbringung, Gerichte und Schutzscreening auf reale Last abstimmt, ist bei Spitzenbelastung robuster als reine Geschwindigkeitssteuerung.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["REC"], limitations: [] }
    ],
    hindsight_guard: "Spätere Implementations- und Outcome-Daten werden nicht so behandelt, als hätten sie dem Bundestag am 27.02.2026 vorgelegen. EU-vorgegebene und national gestaltbare Wirkpfade bleiben getrennt.",
    causal_attribution_disclaimer: "Die Zuordnung beschreibt Zielnähe und Risiken entlang geprüfter Mechanismen. Spätere Veränderungen von Verfahrenszeiten, Schutzoutcomes oder SDG-Zuständen sind erst nach eigenständiger Zurechnungsprüfung kausal bewertbar.",
    aggregation_rule: "Keine Gesamtampel; Non-Refoulement, Freiheit und effektiver Rechtsbehelf werden nicht mit Verfahrensgeschwindigkeit verrechnet.",
    machine_mapping_public_allowed: false,
    dns_source_catalog_count: 82
  },
  {
    common_targets_review_id: "WOEK-CTR-MIGRATION-DIGITAL-2026-R1",
    recommendation_id: "WOEK-REC-BUND-MIGRATION-DIGITAL-2026-R1",
    impact_case_id: "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
    review_version: "1.0",
    reviewed_at: "2026-08-19T19:05:00+02:00",
    knowledge_cutoff_date: "2026-08-19",
    fach_status: "APPROVED_WITH_OPEN_DATA",
    actual_option: { option_id: "A", label: "Beschlossene breite Datenaustauscharchitektur als Referenz" },
    woek_option: { option_id: "B", label: "Once-only mit Provenienz, Korrektur und segmentiertem Zugriff" },
    source_catalog: {
      PG: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1238CEST.jsonl#WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
      REC: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-BUND-MIGRATION-DIGITAL-2026-R1",
      DNS: "/WOEK/WOEK-WIRKINDIKATORENREGISTER-1.0/REGISTRY/DNS-INDICATOR-SOURCE-SEED-1.0.csv"
    },
    layer_status: {
      MPD: "APPROVED_WITH_OPEN_DATA",
      UN_SDG: "APPROVED_WITH_OPEN_DATA",
      WOEK_SDGPLUS: "REVIEWED_NOT_ASSESSABLE",
      CONSTITUTIONAL_RIGHTS_PRINCIPLES: "APPROVED_WITH_OPEN_DATA",
      STATE_GOALS_AND_BINDING_LAW: "SCREENED",
      DNS_2025: "REVIEWED_NOT_ASSESSABLE",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "NOT_APPLICABLE_NO_APPROVED_CASE_LINK",
      WOEK_BOUNDARIES_NONCOMPENSATION: "APPROVED",
      SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS: "APPROVED_WITH_OPEN_DATA"
    },
    layer_notes: {
      WOEK_SDGPLUS: "Keine zusätzliche fallbezogene WÖk-SDG+-Target-ID fachlich freigegeben.",
      DNS_2025: "Die maßgeblichen Wirkungen werden primär mit Prozess-, Datenqualitäts-, Korrektur- und Sicherheitsindikatoren gemessen; kein einzelner DNS-Indikator wird als Kausalattribution verwendet.",
      STATE_GOALS_AND_BINDING_LAW: "Datenschutz, Datenrichtigkeit und Zweckbindung sind eigenständige Rechts- und Governancebedingungen.",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "Kein freigegebener konkreter Missions- oder Maßnahmenbezug."
    },
    mappings: [
      { target_reference_id: "MPD-MENSCH", target_label: "Mensch", direction_actual: "AMBIVALENT_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Weniger Mehrfacherhebung und Rückfragen können Verfahren erleichtern; falsch fortgepflanzte Identitäts- oder Falldaten können Betroffene über mehrere Behörden hinweg belasten. Die WÖk-Option priorisiert Korrekturfähigkeit und Provenienz.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "MPD-DEMOCRATIE", target_label: "Demokratie und leistungsfähige Verwaltung", direction_actual: "POSITIVE_POTENTIAL_WITH_IMPLEMENTATION_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Interoperabilität kann staatliche Handlungsfähigkeit erhöhen. Auditierbare Zugriffe, klare Verantwortung und Fehlerkorrektur sind nötig, damit Effizienz nicht zulasten rechtsstaatlicher Nachvollziehbarkeit geht.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "UN-SDG-16", target_label: "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen", direction_actual: "POSITIVE_POTENTIAL_WITH_IMPLEMENTATION_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Effiziente, nachvollziehbare und korrigierbare Verwaltungsprozesse stärken institutionelle Qualität; schlechte Daten-Governance kann den gleichen Mechanismus umkehren.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["PG", "REC"], limitations: ["Keine Kausalattribution späterer SDG-Änderungen."] },
      { target_reference_id: "RIGHTS-INFORMATIONELLE-SELBSTBESTIMMUNG-DATENRICHTIGKEIT", target_label: "Informationelle Selbstbestimmung, Datenrichtigkeit und wirksame Korrektur", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Breitere Wiederverwendung vergrößert die Reichweite eines Fehlers. Provenienz, Zweckbindung, Least Privilege und propagierte Korrektur begrenzen dieses systemische Risiko.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "BOUNDARY-DATENKORREKTUR-ZWECKBINDUNG", target_label: "Nichtkompensation von Datenrichtigkeit, Zweckbindung und Korrekturmöglichkeit", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Kürzere Bearbeitungszeiten kompensieren keine systematisch falsche Zuordnung, unzulässige Zweckausweitung oder fehlende Korrekturmöglichkeit.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "RESILIENCE-DATEN-GOVERNANCE-FALLBACK", target_label: "Resilienz durch Datenprovenienz, Audit und manuellen Fallback", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Segmentierte Rechte, Audit-Logs, propagierte Korrektur und Fallback verkleinern gemeinsame Fehlerdomänen und erleichtern Wiederanlauf nach Daten- oder Systemproblemen.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["REC"], limitations: [] }
    ],
    hindsight_guard: "Frühe Implementationssignale nach dem 09.07.2026 bleiben als spätere Evidenz getrennt. Eine sinkende Bearbeitungszeit wird nicht rückwirkend zum alleinigen Beleg der damaligen Entscheidung.",
    causal_attribution_disclaimer: "Die Zielzuordnung beschreibt fachlich geprüfte Mechanismen. Spätere Prozess- oder Datenqualitätsänderungen müssen getrennt gegen Baseline, Gegenfaktum und externe Digitalisierungseffekte geprüft werden.",
    aggregation_rule: "Keine Gesamtnote; Datenschutz-, Datenrichtigkeits- und Korrekturgrenzen werden nicht durch Effizienzgewinne kompensiert.",
    machine_mapping_public_allowed: false,
    dns_source_catalog_count: 82
  },
  {
    common_targets_review_id: "WOEK-CTR-KI-MIGRATION-2026-R1",
    recommendation_id: "WOEK-REC-BUND-KI-MIGRATION-2026-R1",
    impact_case_id: "WOEK-IMPACT-BUND-KI-MIGRATION-2026",
    review_version: "1.0",
    reviewed_at: "2026-08-19T19:05:00+02:00",
    knowledge_cutoff_date: "2026-08-19",
    fach_status: "APPROVED_WITH_OPEN_DATA",
    actual_option: { option_id: "A", label: "Breiter produktiver KI-Einsatz nach gesetzlicher Freigabe" },
    woek_option: { option_id: "B", label: "Begrenzter Shadow-Mode-Pilot mit harten Ausstiegskriterien" },
    source_catalog: {
      PG: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1238CEST.jsonl#WOEK-IMPACT-BUND-KI-MIGRATION-2026",
      REC: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-BUND-KI-MIGRATION-2026-R1",
      DNS: "/WOEK/WOEK-WIRKINDIKATORENREGISTER-1.0/REGISTRY/DNS-INDICATOR-SOURCE-SEED-1.0.csv"
    },
    layer_status: {
      MPD: "APPROVED_WITH_OPEN_DATA",
      UN_SDG: "APPROVED_WITH_OPEN_DATA",
      WOEK_SDGPLUS: "REVIEWED_NOT_ASSESSABLE",
      CONSTITUTIONAL_RIGHTS_PRINCIPLES: "APPROVED_WITH_OPEN_DATA",
      STATE_GOALS_AND_BINDING_LAW: "SCREENED",
      DNS_2025: "REVIEWED_NOT_ASSESSABLE",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "NOT_APPLICABLE_NO_APPROVED_CASE_LINK",
      WOEK_BOUNDARIES_NONCOMPENSATION: "APPROVED",
      SCIENTIFIC_THRESHOLDS_RESILIENCE_GENERATIONS: "APPROVED_WITH_OPEN_DATA"
    },
    layer_notes: {
      WOEK_SDGPLUS: "Keine zusätzliche fallbezogene WÖk-SDG+-Target-ID fachlich freigegeben.",
      DNS_2025: "KI-Modulqualität wird primär über Fall-, Fehler-, Gruppen-, Rechtsmittel- und Prozessindikatoren geprüft; kein einzelner DNS-Indikator ist als Attribution geeignet.",
      STATE_GOALS_AND_BINDING_LAW: "EU AI Act, Datenschutz, Diskriminierungsschutz und Verfahrensrecht bilden getrennte bindende Ebenen.",
      AKTIONSPLAN_NACHHALTIGKEIT_2026: "Kein freigegebener konkreter Missions- oder Maßnahmenbezug."
    },
    mappings: [
      { target_reference_id: "MPD-MENSCH", target_label: "Mensch", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "KI-Unterstützung kann Bearbeitungszeit reduzieren und Fachzeit freisetzen; Fehlklassifikation, Automation Bias und gruppenspezifische Fehler können Schutzsuchende unmittelbar treffen. Shadow Mode erzeugt Evidenz vor materieller Skalierung.", evidence_grade: "MEDIUM", uncertainty: "HIGH", source_refs: ["PG", "REC"], limitations: ["Konkrete deutsche Outcome-Daten der geplanten Module fehlen noch."] },
      { target_reference_id: "MPD-DEMOCRATIE", target_label: "Demokratie und rechtsstaatliche Verwaltung", direction_actual: "AMBIVALENT_CONDITIONAL_WITH_RIGHTS_RISK", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Konsistenz und schnellere Recherche können Verwaltung stärken, während nicht nachvollziehbare faktische Vorprägung menschliche Verantwortung und Rechtsschutz schwächen kann. Der Pilot hält menschliche Kontrolle messbar.", evidence_grade: "MEDIUM", uncertainty: "HIGH", source_refs: ["PG", "REC"], limitations: [] },
      { target_reference_id: "UN-SDG-16", target_label: "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen", direction_actual: "AMBIVALENT_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Nachvollziehbare, faire und korrigierbare Verwaltungsentscheidungen stärken institutionelle Qualität. Der Shadow-Mode-Ansatz prüft diesen Mechanismus, bevor Automatisierung Pfadabhängigkeit erzeugt.", evidence_grade: "MEDIUM", uncertainty: "HIGH", source_refs: ["PG", "REC"], limitations: ["Keine Kausalattribution späterer SDG-Zustände."] },
      { target_reference_id: "RIGHTS-MENSCHLICHE-LETZTVERANTWORTUNG-DISKRIMINIERUNGSSCHUTZ", target_label: "Menschliche Letztverantwortung, wirksamer Rechtsschutz und Diskriminierungsschutz", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Produktive KI-Unterstützung darf weder eine faktisch automatisierte Entscheidung noch systematische Gruppenfehler erzeugen. Reale menschliche Abweichungsmöglichkeit und subgruppenbezogene Tests sind Schutzbedingungen.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "BOUNDARY-KEINE-FAKTISCHE-AUTOMATISCHE-LETZTENTSCHEIDUNG", target_label: "Nichtkompensation menschlicher Verantwortung und wirksamen Rechtsschutzes", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "BOUNDARY_PROTECTIVE_DESIGN", mechanism_rationale: "Zeit- oder Personaleinsparungen kompensieren keine faktische automatisierte Letztentscheidung, systematische Diskriminierung oder einen Verlust wirksamer Korrektur.", evidence_grade: "MEDIUM", uncertainty: "LOW", source_refs: ["REC"], limitations: [] },
      { target_reference_id: "RESILIENCE-KI-SHADOW-MODE-FALLBACK", target_label: "Resilienz durch Shadow Mode, Versionierung und menschlichen Fallback", direction_actual: "NEGATIVE_RISK_CONDITIONAL", direction_woek: "POSITIVE_POTENTIAL_CONDITIONAL", mechanism_rationale: "Modularer Pilot, Modellversionierung, Stop-Schwellen und manueller Fallback begrenzen Drift-, Ausfall- und Lock-in-Risiken und erhöhen institutionelle Lernfähigkeit.", evidence_grade: "MEDIUM", uncertainty: "MEDIUM", source_refs: ["REC"], limitations: [] }
    ],
    hindsight_guard: "Ex-ante-Review mit Wissensstichtag 19.08.2026. Spätere Pilot- oder Produktivdaten dürfen die RecommendationVersion verändern, werden aber nicht in diese ex-ante Zuordnung vorweggenommen.",
    causal_attribution_disclaimer: "Zielzuordnung beschreibt Wirkungspotenzial und Schutzrisiken der geprüften KI-Ausgestaltung. Spätere Verfahrens- oder Schutzoutcomes müssen gegen Baseline, Fallmix, Personal- und Prozessänderungen zugerechnet werden.",
    aggregation_rule: "Keine Gesamtnote; menschliche Letztverantwortung, Diskriminierungsschutz und effektiver Rechtsschutz sind nicht durch Effizienzgewinne kompensierbar.",
    machine_mapping_public_allowed: false,
    dns_source_catalog_count: 82
  }
] as const;

function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}
function dropboxContentHash(bytes: Uint8Array) {
  const block = 4 * 1024 * 1024;
  const chunks: Buffer[] = [];
  for (let i = 0; i < bytes.length; i += block) chunks.push(createHash("sha256").update(bytes.slice(i, Math.min(bytes.length, i + block))).digest());
  return createHash("sha256").update(Buffer.concat(chunks)).digest("hex");
}
function assertManagedPath(value: string) {
  if (!value.startsWith("/WOEK/") || /[^\x00-\x7F]/.test(value) || value.includes("..") || value.split("/").some((part) => /\s/.test(part))) throw new Error(`PATH_NAMING_VIOLATION: ${value}`);
}
function validateReview(record: any) {
  const requiredStrings = ["common_targets_review_id","recommendation_id","impact_case_id","review_version","reviewed_at","knowledge_cutoff_date","fach_status","hindsight_guard","causal_attribution_disclaimer","aggregation_rule"];
  if (!requiredStrings.every((key) => typeof record[key] === "string" && record[key].trim())) throw new Error(`COMMON_TARGETS_SCHEMA_FAIL: ${record.impact_case_id}`);
  if (!record.actual_option?.option_id || !record.actual_option?.label || !record.woek_option?.option_id || !record.woek_option?.label) throw new Error(`COMMON_TARGETS_OPTION_FAIL: ${record.impact_case_id}`);
  if (!record.source_catalog || typeof record.source_catalog !== "object") throw new Error(`COMMON_TARGETS_SOURCE_CATALOG_FAIL: ${record.impact_case_id}`);
  if (!Array.isArray(record.mappings) || !record.mappings.length) throw new Error(`COMMON_TARGETS_MAPPING_EMPTY: ${record.impact_case_id}`);
  for (const mapping of record.mappings) {
    for (const key of ["target_reference_id","target_label","direction_actual","direction_woek","mechanism_rationale","evidence_grade","uncertainty"]) if (typeof mapping[key] !== "string" || !mapping[key].trim()) throw new Error(`COMMON_TARGETS_MAPPING_FAIL: ${record.impact_case_id}:${key}`);
    if (!Array.isArray(mapping.source_refs) || !Array.isArray(mapping.limitations)) throw new Error(`COMMON_TARGETS_MAPPING_ARRAY_FAIL: ${record.impact_case_id}`);
  }
  if (record.machine_mapping_public_allowed !== false) throw new Error(`COMMON_TARGETS_MACHINE_MAPPING_FORBIDDEN: ${record.impact_case_id}`);
}
async function accessToken() {
  for (const key of ["DROPBOX_APP_KEY","DROPBOX_APP_SECRET","DROPBOX_REFRESH_TOKEN"]) if (!process.env[key]) throw new Error(`TECHNICAL_WRITE_RETRY: missing ${key}`);
  const form = new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.DROPBOX_REFRESH_TOKEN! });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", { method: "POST", headers: { authorization: `Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" }, body: form, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: token ${response.status}`);
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error("TECHNICAL_WRITE_RETRY: token missing");
  return body.access_token;
}
async function download(token: string, target: string, allowMissing = false) {
  assertManagedPath(target);
  const response = await fetch("https://content.dropboxapi.com/2/files/download", { method: "POST", headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path: target }) }, signal: AbortSignal.timeout(30_000) });
  if (response.status === 409 && allowMissing) return null;
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: download ${response.status} ${target}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const meta = response.headers.get("dropbox-api-result");
  return { bytes, metadata: meta ? JSON.parse(meta) : {} };
}
async function writeHistory(token: string, target: string, bytes: Buffer) {
  assertManagedPath(target);
  const existing = await download(token, target, true);
  if (existing) {
    if (!existing.bytes.equals(bytes)) throw new Error(`HISTORY_CONFLICT: ${target}`);
    return verify(token, target, bytes, "IDEMPOTENT_IDENTICAL");
  }
  const response = await fetch("https://content.dropboxapi.com/2/files/upload", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream", "dropbox-api-arg": JSON.stringify({ path: target, mode: "add", autorename: false, mute: true, strict_conflict: true }) }, body: bytes, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: upload ${response.status} ${target} ${(await response.text()).slice(0,200)}`);
  return verify(token, target, bytes, "WRITTEN");
}
async function verify(token: string, target: string, expected: Buffer, outcome: string) {
  const got = await download(token, target);
  if (!got) throw new Error(`READBACK_MISSING: ${target}`);
  const localSha = sha256(expected);
  const readSha = sha256(got.bytes);
  const expectedDb = dropboxContentHash(expected);
  const actualDb = String(got.metadata.content_hash ?? "");
  if (!expected.equals(got.bytes) || localSha !== readSha || expectedDb !== actualDb || Number(got.metadata.size) !== expected.length) throw new Error(`READBACK_MISMATCH: ${target}`);
  return { path: target, file_id: String(got.metadata.id), rev: String(got.metadata.rev), dropbox_content_hash: actualDb, bytes: expected.length, local_sha256: localSha, readback_sha256: readSha, byte_equal: true, outcome };
}
function parseJsonl(text: string) { return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function md() {
  const lines = ["# Common Targets Review - neue RecommendationRecords", "", `Stand: 2026-08-19`, `Canonical Root: ${ROOT}`, "", "Vier neue fachlich authorisierte RecommendationRecords wurden unabhängig von Scores oder maschinellen Mappings gegen gemeinsame Referenzebenen geprüft.", ""];
  for (const r of records) {
    lines.push(`## ${r.impact_case_id}`, "", `- Recommendation: ${r.recommendation_id}`, `- Fachstatus: ${r.fach_status}`, `- Vergleich: ${r.actual_option.label} -> ${r.woek_option.label}`, "", ...r.mappings.map((m) => `- ${m.target_label}: ${m.direction_actual} -> ${m.direction_woek} - ${m.mechanism_rationale}`), "");
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  if (process.env.VERCEL_ENV !== "preview") throw new Error("P0_FAIL_CLOSED: Common Targets writer runs only in Vercel preview.");
  if (process.env.VERCEL_GIT_COMMIT_REF !== EXPECTED_BRANCH) throw new Error(`P0_FAIL_CLOSED: unexpected branch ${process.env.VERCEL_GIT_COMMIT_REF ?? "MISSING"}`);
  [FINAL_RECOMMENDATIONS,FINAL_RECOMMENDATION_HANDOFF,TARGET_JSONL,TARGET_MD,TARGET_VALIDATION,TARGET_HANDOFF].forEach(assertManagedPath);
  records.forEach(validateReview);
  if (new Set(records.map((r) => r.impact_case_id)).size !== records.length || new Set(records.map((r) => r.recommendation_id)).size !== records.length) throw new Error("COMMON_TARGETS_DUPLICATE_ID");

  const token = await accessToken();
  const recommendationSource = await download(token, FINAL_RECOMMENDATIONS);
  const recommendationHandoff = await download(token, FINAL_RECOMMENDATION_HANDOFF);
  if (!recommendationSource || !recommendationHandoff) throw new Error("P0_RECOMMENDATION_SOURCE_MISSING");
  const recs = parseJsonl(recommendationSource.bytes.toString("utf8"));
  const sourceById = new Map(recs.map((r: any) => [r.recommendation_id, r]));
  for (const review of records) {
    const rec: any = sourceById.get(review.recommendation_id);
    if (!rec || rec.impact_case_id !== review.impact_case_id || !["APPROVED","APPROVED_WITH_OPEN_DATA"].includes(rec.fach_status)) throw new Error(`P0_RECOMMENDATION_JOIN_FAIL: ${review.recommendation_id}`);
  }
  const handoff = JSON.parse(recommendationHandoff.bytes.toString("utf8"));
  if (handoff.canonical_root !== ROOT || handoff.expected_remaining_unreviewed_count !== 0 || handoff.expected_final_classified_count !== 133) throw new Error("P0_RECOMMENDATION_HANDOFF_NOT_FINAL");

  const jsonlBytes = Buffer.from(`${records.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  const mdBytes = Buffer.from(md(), "utf8");
  const validationDoc = {
    schema_version: "woek-common-targets-review-validation-1.0",
    canonical_root: ROOT,
    review_batch: REVIEW_ID,
    created_at: "2026-08-19T19:05:00+02:00",
    status: "PASS_4_OF_4",
    records: records.map((r) => ({ common_targets_review_id: r.common_targets_review_id, recommendation_id: r.recommendation_id, impact_case_id: r.impact_case_id, fach_status: r.fach_status, mappings: r.mappings.length })),
    gates: { recommendation_join: "PASS_4_OF_4", machine_mapping_public_allowed: false, no_score_derivation: true, no_party_derivation: true, causal_attribution_separate: true, non_compensation_preserved: true },
    source_recommendations: { path: FINAL_RECOMMENDATIONS, file_id: String(recommendationSource.metadata.id), rev: String(recommendationSource.metadata.rev), dropbox_content_hash: String(recommendationSource.metadata.content_hash), sha256: sha256(recommendationSource.bytes), bytes: recommendationSource.bytes.length },
    source_recommendation_handoff: { path: FINAL_RECOMMENDATION_HANDOFF, file_id: String(recommendationHandoff.metadata.id), rev: String(recommendationHandoff.metadata.rev), dropbox_content_hash: String(recommendationHandoff.metadata.content_hash), sha256: sha256(recommendationHandoff.bytes), bytes: recommendationHandoff.bytes.length }
  };
  const validationBytes = Buffer.from(`${JSON.stringify(validationDoc, null, 2)}\n`, "utf8");
  const checks = [];
  checks.push(await writeHistory(token, TARGET_JSONL, jsonlBytes));
  checks.push(await writeHistory(token, TARGET_MD, mdBytes));
  checks.push(await writeHistory(token, TARGET_VALIDATION, validationBytes));
  const commonTargetJsonl = checks[0];
  const finalHandoff = {
    schema_version: "woek-common-targets-new-recommendations-handoff-1.0",
    canonical_root: ROOT,
    created_at: "2026-08-19T19:05:00+02:00",
    status: "READY_FOR_PORTAL_IMPORT",
    recommendation_handoff: FINAL_RECOMMENDATION_HANDOFF,
    common_targets_jsonl: TARGET_JSONL,
    common_targets_validation: TARGET_VALIDATION,
    records: records.length,
    recommendation_ids: records.map((r) => r.recommendation_id),
    impact_case_ids: records.map((r) => r.impact_case_id),
    fach_status: "APPROVED_WITH_OPEN_DATA_4_OF_4",
    source_vs_view_required_before_publication: true,
    public_machine_mapping_created: false,
    recommendations_changed: false,
    historical_files_overwritten: false,
    verified_artifacts: checks,
    canonical_jsonl_verification: { sha256: commonTargetJsonl.local_sha256, dropbox_content_hash: commonTargetJsonl.dropbox_content_hash, file_id: commonTargetJsonl.file_id, rev: commonTargetJsonl.rev, bytes: commonTargetJsonl.bytes },
    coordinator_instruction: "Add these four Common-Targets reviews to the approved public set only together with their four canonical RecommendationRecords. Run exact source-vs-view and re-evaluate public exclusions. REVIEW_REQUIRED recommendation classifications remain non-public recommendations and must not receive machine-generated target mappings."
  };
  const handoffBytes = Buffer.from(`${JSON.stringify(finalHandoff, null, 2)}\n`, "utf8");
  const handoffCheck = await writeHistory(token, TARGET_HANDOFF, handoffBytes);
  console.log(JSON.stringify({ status: "COMMON_TARGETS_FINAL_READY", records: 4, jsonl: commonTargetJsonl, handoff: handoffCheck }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
