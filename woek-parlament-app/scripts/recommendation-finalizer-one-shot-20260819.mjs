#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = "/WOEK";
const EXPECTED_BRANCH = "automation/recommendation-finalize-20260819-r2";
const BATCH_ID = "2026-08-19-FINAL-R1";
const BATCH_CREATED_AT = "2026-08-19T18:30:00+02:00";
const ANALYSIS_ROOT = `${ROOT}/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis`;
const CONTROL_ROOT = `${ROOT}/WOEK-AUTOPILOT/CONTROL`;
const LEDGER_ROOT = `${ROOT}/WOEK-AUTOPILOT/LEDGERS`;
const LEDGER_CURRENT = `${LEDGER_ROOT}/RECOMMENDATION-BACKFILL-LEDGER.json`;
const QUEUE_PATH = `${CONTROL_ROOT}/RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl`;
const PATH_CONVENTION = `${CONTROL_ROOT}/PATH-AND-FILENAME-CONVENTION-2.1-FINAL.md`;
const RECOMMENDATION_GATE = `${CONTROL_ROOT}/WOEK-DECISION-RECOMMENDATION-GATE-2.3-FINAL.md`;
const TECHNICAL_GATE = `${CONTROL_ROOT}/CODEX-RECOMMENDATION-BACKFILL-AND-COMPLETENESS-GATE-2.3-FINAL.md`;
const TARGETS = {
  recommendations_jsonl: `${ANALYSIS_ROOT}/GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.jsonl`,
  summary_md: `${ANALYSIS_ROOT}/GOVERNMENT-RECOMMENDATIONS-${BATCH_ID}.md`,
  validation: `${CONTROL_ROOT}/RECOMMENDATION-SCHEMA-VALIDATION-${BATCH_ID}.json`,
  precommit_snapshot: `${LEDGER_ROOT}/RECOMMENDATION-BACKFILL-LEDGER-${BATCH_ID}-PRECOMMIT.json`,
  final_snapshot: `${LEDGER_ROOT}/RECOMMENDATION-BACKFILL-LEDGER-${BATCH_ID}.json`,
  handoff: `${CONTROL_ROOT}/RECOMMENDATION-BACKFILL-HANDOFF-${BATCH_ID}-FINAL.json`,
};

const TERMINAL = new Set([
  "COMPLETED_APPROVED",
  "NO_ROBUST_RECOMMENDATION",
  "REVIEW_REQUIRED_WITH_EXACT_REASON",
  "BLOCKED_WITH_EXACT_REASON",
  "NOT_APPLICABLE",
]);

const canonicalAliases = new Map([
  ["WOEK-IMPACT-BUND-SICHERE-HERKUNFT-VO-2025-2026", "WOEK-IMPACT-BUND-SAFE-COUNTRY-REGULATION-2026"],
  ["WOEK-IMPACT-BUND-RECHTSBEISTAND-ABSCHIEBEHAFT-2025-2026", "WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026"],
  ["WOEK-IMPACT-BUND-GEAS-UMSETZUNG-2025-2026", "WOEK-IMPACT-GEAS-DE-2026"],
  ["WOEK-IMPACT-BUND-DIGITALE-MIGRATIONSVERWALTUNG-2025-2026", "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026"],
]);

const handAuthoredRecords = [
  {
    "recommendation_id": "WOEK-REC-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026-R1",
    "impact_case_id": "WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026",
    "jurisdiction_id": "DE-BUND",
    "recommendation_status": "NO_ROBUST_RECOMMENDATION",
    "analysis_mode": "CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK",
    "decision_date": "2025-12-05",
    "knowledge_cutoff_date": "2026-08-19",
    "evidence_available_at_decision_time": [
      "BT-Drs. 21/780 und die Ausschussfassung 21/3079 dokumentierten die beabsichtigte Aufhebung der verpflichtenden anwaltlichen Bestellung in Abschiebungshaft und Ausreisegewahrsam.",
      "Die parlamentarische Anhörung machte sowohl Vollzugs- und Aufwandsargumente als auch die besondere Rechtsschutzrelevanz freiheitsentziehender Verfahren sichtbar.",
      "Die hohe Eingriffsintensität von Freiheitsentzug und die Notwendigkeit praktisch wirksamer gerichtlicher Kontrolle waren als Schutzbedingungen bekannt."
    ],
    "evidence_only_available_later": [
      "Belastbare Vorher-Nachher-Daten zu realer Vertretungsquote, Haftdauer, Beschwerden, erfolgreichen Aufhebungen und festgestellter Rechtswidrigkeit nach Inkrafttreten.",
      "Belastbare Größenordnungen zu tatsächlich eingespartem Verfahrensaufwand und zu einem möglichen Einfluss der früheren Pflichtbestellung auf Entziehungsrisiken."
    ],
    "hindsight_limitations": "Der heutige Reality Check trennt spätere Implementationsbeobachtungen strikt vom Wissen am 5. Dezember 2025. Spätere Daten dürfen eine neue Empfehlung begründen, werden aber nicht so behandelt, als hätten sie dem Bundestag damals bereits vorgelegen.",
    "problem_state": "Ein zusätzlicher administrativer Aufwand durch automatische anwaltliche Bestellung war plausibel, seine Materialität als bindender Vollzugsengpass war aber nicht robust belegt; zugleich betrifft die Reform effektiven Rechtsschutz bei Freiheitsentzug.",
    "target_state": "Abschiebungshaft und Ausreisegewahrsam werden rechtmäßig, verhältnismäßig und so kurz wie erforderlich vollzogen, während jede betroffene Person rechtzeitig praktisch wirksamen Zugang zu unabhängiger Rechtsberatung und gerichtlicher Fehlerkorrektur erhält.",
    "root_cause_or_binding_bottleneck": "Der vorhandene Fachbestand belegt keinen einzelnen bindenden Engpass, der eine eindeutige Wahl zwischen universeller automatischer Beiordnung und einem anders organisierten garantierten Rechtszugang erlaubt. Robust ist nur, dass Rechtsschutz unter Haft-, Sprach- und Zeitdruck tatsächlich erreichbar sein muss; die behauptete Vollzugsentlastung ist nicht ausreichend quantifiziert.",
    "option_set": [
      {"option_id":"A","label":"Heutiger Rechtsrahmen ohne automatische Pflichtbestellung","description":"Fortführung des geltenden Modells ohne obligatorische anwaltliche Bestellung; allgemeine Beratungs-, Rechtsbehelfs- und Zugangswege bleiben bestehen.","status_quo":true,"dimensions":{"comparison_role":"REFERENZOPTION","rights_access":"ABHAENGIG_VON_REALER_ZUGAENGLICHKEIT","administrative_burden":"NIEDRIGER"}},
      {"option_id":"B","label":"Universelle automatische anwaltliche Bestellung","description":"Für jedes Verfahren über Abschiebungshaft oder Ausreisegewahrsam wird frühzeitig und unabhängig ein anwaltlicher Vertreter bestellt.","status_quo":false,"dimensions":{"comparison_role":"SCHUTZMAXIMIERENDE_OPTION","rights_access":"HOCH","administrative_burden":"HOEHER"}},
      {"option_id":"C","label":"Garantierter Erstkontakt mit risikobasierter Beiordnung","description":"Jede betroffene Person erhält vor der maßgeblichen Haftprüfung unabhängigen Rechtskontakt; automatische Beiordnung greift bei Vulnerabilität, Sprachbarriere, Komplexität oder fehlender Eigenvertretungsfähigkeit.","status_quo":false,"dimensions":{"comparison_role":"GEZIELTE_SCHUTZOPTION","rights_access":"HOCH_WENN_TRIGGER_ZUVERLAESSIG","selection_risk":"VORHANDEN"}}
    ],
    "woek_preferred_option": null,
    "recommendation_core_summary": "Zwischen universeller Pflichtbeiordnung und einem gezielt garantierten Rechtszugang lässt sich auf der verfügbaren Evidenz keine robuste Präferenz ableiten. Robust ist die Schutzgrenze: Der Wegfall automatischer Bestellung darf den praktisch wirksamen Zugang zu unabhängiger Beratung und gerichtlicher Fehlerkorrektur bei Freiheitsentzug nicht verschlechtern.",
    "why_preferred": [
      "Für den behaupteten Vollzugs- und Kostenvorteil der Abschaffung fehlt eine belastbare Größenordnung; zugleich fehlen vergleichbare Daten dazu, welche zusätzliche Fehlerkorrektur die universelle Pflichtbestellung bewirkt.",
      "Die Eingriffsintensität des Freiheitsentzugs begründet unabhängig vom Organisationsmodell eine nicht kompensierbare Schutzbedingung für real zugänglichen Rechtsschutz."
    ],
    "key_tradeoffs": [
      "Verfahrensaufwand und mögliche Vollzugsgeschwindigkeit gegenüber praktisch wirksamem Rechtsschutz bei Freiheitsentzug.",
      "Universelle Absicherung gegenüber zielgenauerer, aber fehleranfälliger Risikoselektion.",
      "Frühe anwaltliche Information gegenüber behaupteten Koordinations- oder Entziehungsrisiken."
    ],
    "cascade_effects": [
      "Schwächerer realer Rechtszugang kann zu späterer Fehlerkorrektur, längerer oder rechtswidriger Haft und damit zu höheren individuellen und rechtsstaatlichen Schäden führen.",
      "Universelle automatische Bestellung erhöht organisatorische und fiskalische Verfahrenslast; nur bei tatsächlich bindenden Engpässen kann daraus eine relevante Verzögerungskaskade entstehen.",
      "Ein Trigger-Modell kann universelle Last senken, birgt aber das Risiko, schwer erkennbare Vulnerabilität oder Sprachbarrieren falsch zu klassifizieren."
    ],
    "system_leverage": "Der stärkste Hebel liegt nicht im formalen Etikett Pflichtbeiordnung, sondern darin, ob unabhängiger Rechtskontakt rechtzeitig, sprachlich zugänglich und vor der entscheidenden Haftprüfung praktisch wirksam wird.",
    "first_order_effects": ["Veränderung der anwaltlichen Vertretungsquote","Veränderung von Koordinationsaufwand und Verfahrensschritten","Veränderung des Zeitpunkts unabhängiger Rechtsberatung"],
    "second_order_effects": ["Veränderung von Beschwerde- und Aufhebungsquoten","Veränderung von Haftdauer und Verfahrenskosten","mögliche Veränderung von Vollzugs- und Entziehungsquoten"],
    "third_order_effects": ["Vertrauen in gerichtliche Kontrolle freiheitsentziehender Migrationsmaßnahmen","institutionelle Lernwirkung aus dokumentierten Haftfehlern","langfristige Rechtsstaats- und Legitimationswirkungen"],
    "affected_groups": ["Personen in Abschiebungshaft oder Ausreisegewahrsam","vulnerable und sprachlich benachteiligte Betroffene","Rechtsanwältinnen und Rechtsanwälte","Ausländerbehörden","Polizei","Gerichte","öffentliche Haushalte"],
    "distributional_effects": ["Ein Wegfall automatischer Bestellung trifft vor allem Personen, die aufgrund von Sprache, Haftbedingungen, fehlenden Kontakten oder Vulnerabilität Rechtsbeistand nicht eigenständig organisieren können; bereits vertretene oder gut informierte Personen sind deutlich weniger betroffen."],
    "time_and_generation_effects": ["Rechtsschutzwirkungen treten unmittelbar im einzelnen Haftverfahren ein; institutionelle Effekte auf Fehlerkorrektur und Vertrauen kumulieren über viele Verfahren, ohne dass eine belastbare intergenerationelle Quantifizierung vorliegt."],
    "resilience_effects": ["Ein System mit verlässlicher, schneller Fehlerkorrektur ist gegenüber Fehlentscheidungen robuster; ein Modell, das nur bei idealer Eigeninitiative funktioniert, ist unter Haft-, Sprach- und Kapazitätsstress weniger resilient."],
    "transformation_effects": ["Ein datenbasiert überprüftes Zugangsmodell könnte Verfahrenseffizienz und Rechtsschutz gemeinsam verbessern, darf aber nicht durch administrative Risikoselektion neue unsichtbare Zugangshürden erzeugen."],
    "rebound_spillover_leakage": ["Eingesparte Verfahrenskosten können als spätere Gerichts-, Haft- oder Entschädigungskosten wieder auftreten, wenn Fehler erst später erkannt werden; umgekehrt kann eine schlecht organisierte Pflichtbestellung Ressourcen binden, ohne rechtzeitig wirksam zu werden."],
    "competence_scope": "DE_BUND_GESETZGEBUNG_MIT_LAENDER_GERICHTS_UND_VOLLZUGSUMSETZUNG",
    "implementation_route": "Bundesrechtliche Regeln im Aufenthalts- und Freiheitsentziehungsrecht; operative Umsetzung durch zuständige Behörden, Gerichte sowie unabhängige anwaltliche Beratungs- und Bereitschaftsstrukturen der Länder.",
    "legal_constraints": ["Art. 2 Abs. 2 Satz 2 GG","Art. 104 GG","Gebot wirksamen Rechtsschutzes und rechtlichen Gehörs","Art. 5 Abs. 4 EMRK","Art. 47 EU-Grundrechtecharta soweit Unionsrecht anwendbar ist","Aufenthaltsgesetz","FamFG"],
    "rights_and_boundary_conditions": ["Freiheit der Person","Menschenwürde","praktisch wirksamer Zugang zu gerichtlicher Überprüfung","Sprachzugang und Schutz vulnerabler Personen","keine pauschale Behauptung, universelle Pflichtbeiordnung sei verfassungsrechtlich zwingend"],
    "non_compensation_check": "PASS_WITH_HARD_BOUNDARY: Administrative Entlastung oder eine höhere Vollzugsquote kann eine materielle Verschlechterung wirksamer gerichtlicher Fehlerkorrektur bei Freiheitsentzug nicht kompensieren.",
    "reversibility": "Gesetzgeberisch hoch; bereits vollzogene rechtswidrige oder unnötig lange Haft ist nachträglich nicht vollständig reversibel.",
    "resource_and_capacity_constraints": ["kurzfristig verfügbare unabhängige Rechtsberatung","Dolmetschkapazität","gerichtliche und behördliche Dokumentation","vergleichbare Vorher-Nachher-Daten"],
    "safeguards": ["Rechtsinformation in verständlicher Sprache unmittelbar bei Freiheitsentzug","nachweisbar erreichbare unabhängige Beratung vor der ersten maßgeblichen Haftprüfung","automatische Eskalation bei Vulnerabilität, Sprachbarrieren oder fehlender Eigenvertretungsfähigkeit","Dokumentation eines Verzichts erst nach unabhängigem informiertem Kontakt","unabhängiges Monitoring von Haftfehlern und Rechtszugang"],
    "monitoring_indicators": ["Vertretungsquote vor erster Haftentscheidung","Zeit bis unabhängigem Rechtskontakt","Haftdauer","Beschwerde- und Rechtsmittelquote","erfolgreiche Aufhebungen und festgestellte Rechtswidrigkeit","Dolmetsch- und Beratungszugang","Verfahrenskosten","Vollzugs- und Entziehungsquote"],
    "reality_check_plan": "Mindestens zwölf Monate vor und nach Reform vergleichbar auswerten, nach Gericht, Haftgrund, Sprache, Vulnerabilität und Verfahrensart stratifizieren und Vollzugsindikatoren gemeinsam mit Rechtsschutz- und Haftqualitätsindikatoren prüfen; Rückführungsquote allein ist kein Erfolgsmaß.",
    "fallback_option": "Wenn die Vertretungsquote vor der ersten Haftprüfung deutlich sinkt oder erfolgreiche Rechtsmittel beziehungsweise rechtswidrige Haft zunehmen, bis zu einer belastbaren Neugestaltung eine automatische unabhängige anwaltliche Bestellung wiederherstellen.",
    "evidence_grade": "LOW",
    "uncertainty": "Die Schutzrelevanz ist hoch, aber der kausale Nettoeffekt der früheren Pflichtbestellung und ihrer Abschaffung ist nicht belastbar quantifiziert; insbesondere fehlen saubere Vorher-Nachher-Daten und eine belastbare Kosten- und Verzögerungsbaseline.",
    "recommendation_version": "2.3-R1",
    "supersedes_recommendation_version": null,
    "triggering_evidence_event_ids": [],
    "public_change_summary": "Erste fachliche WÖk-Empfehlung; mangels belastbarer Vergleichsdaten wird keine Scheinsicherheit zwischen universeller und gezielter Rechtsbeistandsarchitektur erzeugt.",
    "fach_status": "APPROVED_WITH_OPEN_DATA",
    "source_refs": [
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl#WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.md#4-abschaffung-der-verpflichtenden-anwaltlichen-vertretung-bei-abschiebungshaft-und-ausreisegewahrsam",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-2-OF-4-20260819T1227CEST.jsonl#WOEK-IMPACT-BUND-ABSCHIEBEHAFT-RECHTSBEISTAND-2026",
      "https://www.bundestag.de/parlament/plenum/abstimmung/abstimmung?id=986"
    ]
  },
  {
    "recommendation_id": "WOEK-REC-GEAS-DE-2026-R1",
    "impact_case_id": "WOEK-IMPACT-GEAS-DE-2026",
    "jurisdiction_id": "DE-BUND",
    "recommendation_status": "PREFERRED_DESIGN",
    "analysis_mode": "CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK",
    "decision_date": "2026-02-27",
    "knowledge_cutoff_date": "2026-08-19",
    "evidence_available_at_decision_time": [
      "Die 2024 beschlossenen GEAS-Rechtsakte und ihre 2026 einsetzende Anwendung begrenzten den nationalen Gestaltungsspielraum bereits am deutschen Entscheidungsdatum.",
      "Die deutschen GEAS-Anpassungsgesetze, parlamentarischen Beratungen und Anhörungen machten Zuständigkeits-, Screening-, Daten-, Grenzverfahrens-, Unterbringungs- und Rechtsschutzfragen sichtbar.",
      "Der Zielkonflikt zwischen schnellerer Zuständigkeitsklärung und individueller Schutzqualität sowie die besondere Relevanz vulnerabler Personen war fachlich erkennbar."
    ],
    "evidence_only_available_later": [
      "Reale Betriebsdaten der seit Mitte 2026 praktisch relevanten Verfahren und Einrichtungen.",
      "Verfahrens- und Transferzeiten, Rechtsmittel- und Aufhebungsquoten, Daten zu Freiheitsbeschränkungen und Vulnerabilitätserkennung nach Umsetzung.",
      "Tatsächliche Wirkungen auf Sekundärbewegungen, Unterbringungsqualität und Schutzoutcomes."
    ],
    "hindsight_limitations": "Spätere Implementations- und Outcome-Daten werden nur im Reality Check genutzt. Sie werden nicht so dargestellt, als seien sie dem Bundestag am 27. Februar 2026 bereits bekannt gewesen; EU-vorgegebene und national gestaltbare Wirkpfade bleiben getrennt.",
    "problem_state": "Uneinheitliche und teils langsame europäische Asylverfahren, Zuständigkeitskonflikte und ungleiche Belastungen sind als Problem tragfähig; zugleich darf die Lösung die Qualität individueller Schutzprüfung, Beratung und Rechtsschutz nicht verschlechtern.",
    "target_state": "Deutschland setzt den verbindlichen GEAS-Rahmen so um, dass Zuständigkeiten und Verfahren zügiger und konsistenter werden, während individuelle Schutzprüfung, Vulnerabilitätserkennung, effektiver Rechtszugang, Kindeswohl, Gesundheit und Datenschutz mindestens gleichwertig abgesichert bleiben.",
    "root_cause_or_binding_bottleneck": "Der nationale Engpass liegt nicht in maximaler Beschleunigung, sondern in der gleichzeitigen Verfügbarkeit von Verfahrenskapazität, früher verlässlicher Information, interoperablen und korrigierbaren Daten, rechtzeitigem Rechtszugang und Schutzkompetenz. Ohne diese Kapazitäten verlagert Beschleunigung Fehler und Belastungen in Rechtsmittel, Unterbringung und spätere Korrektur.",
    "option_set": [
      {"option_id":"A","label":"Beschlossene nationale GEAS-Umsetzung als Referenz","description":"Umsetzung der beschlossenen deutschen Anpassungsgesetze mit den vorgesehenen Zuständigkeits-, Screening-, Daten-, Transfer- und Verfahrensregeln innerhalb des verbindlichen EU-Rahmens.","status_quo":true,"dimensions":{"comparison_role":"REFERENZOPTION","eu_constraint":"HOCH","capacity_gate":"TEILWEISE"}},
      {"option_id":"B","label":"Kapazitäts- und grundrechtssichere nationale Ausgestaltung","description":"Alle nationalen Organisations- und Ermessensspielräume werden auf frühe Vulnerabilitätserkennung, unabhängigen Rechtszugang, qualifizierte Individualprüfung, verhältnismäßige Freiheitsbeschränkung, Datenprovenienz und schnelle Fehlerkorrektur ausgerichtet; Kapazität wächst vor zusätzlichem Beschleunigungsdruck.","status_quo":false,"dimensions":{"comparison_role":"WOEK_PRAEFERIERTE_AUSGESTALTUNG","protection_floor":"NICHT_KOMPENSIERBAR","resilience":"HOCH"}},
      {"option_id":"C","label":"Vollzugs- und geschwindigkeitsmaximierende Ausgestaltung","description":"Nationale Spielräume werden primär zur Verkürzung von Verfahren, leichteren Transfers und restriktiverer Aufenthaltssteuerung genutzt, solange formale unionsrechtliche Mindestanforderungen eingehalten werden.","status_quo":false,"dimensions":{"comparison_role":"ALTERNATIVE","speed":"HOCH","rights_risk_under_capacity_stress":"HOCH"}}
    ],
    "woek_preferred_option": "Option B: Den verbindlichen EU-Rahmen kapazitäts- und grundrechtssicher umsetzen. Nationale Spielräume sollen zuerst Verfahrensqualität, Rechtszugang, Vulnerabilitätserkennung, Datenkorrektur und verhältnismäßige Unterbringung absichern; Beschleunigung ist nur dann ein positiver Outcome, wenn Fehler- und Schutzindikatoren nicht schlechter werden.",
    "recommendation_core_summary": "Die robustere deutsche GEAS-Ausgestaltung koppelt jede Beschleunigung an ausreichende Verfahrenskapazität und harte Schutzindikatoren. Einheitlichere Regeln und schnellere Zuständigkeitsklärung sind sinnvoll, aber nur dann eine Verbesserung, wenn individuelle Prüfung, Rechtsbehelf, Vulnerabilitätserkennung, Kindeswohl und Datenschutz praktisch funktionieren.",
    "why_preferred": [
      "Der GEAS-Rahmen setzt viele Regeln unionsrechtlich vor; die wirksamsten deutschen Hebel liegen deshalb in Kapazität, Organisation, Rechtszugang, Schutzscreening, Datenqualität und der konkreten Nutzung verbleibender Spielräume.",
      "Option B ist robuster gegen beide Fehlerarten: Sie ermöglicht Beschleunigung und Transfers, verhindert aber, dass Überlastung, Datenfehler oder zu enge Fristen auf vulnerable Personen und Gerichte ausgelagert werden.",
      "Non-Refoulement, Individualprüfung und effektiver Rechtsbehelf sind keine verrechenbaren Nebenindikatoren, sondern Grenzen der zulässigen Optimierung."
    ],
    "key_tradeoffs": ["Verfahrensgeschwindigkeit gegenüber Ermittlungs- und Beratungsqualität","Transfer- und Erreichbarkeitseffizienz gegenüber Bewegungsfreiheit und Teilhabe","Datenintegration gegenüber Datenschutz, Zweckbindung und Fehlerfortpflanzung","EU-weite Standardisierung gegenüber national erforderlicher Kapazitätsanpassung"],
    "cascade_effects": [
      "Frühe Zuständigkeitsklärung plus ausreichende Kapazität kann Unsicherheitszeit und Doppelarbeit verringern und dadurch Verwaltungs- und Integrationsfolgekosten senken.",
      "Beschleunigung ohne Beratung und Vulnerabilitätserkennung kann Fehlentscheidungen oder verspätete Schutzfeststellung erhöhen und dadurch mehr Rechtsmittel, längere Unsicherheit und potenziell irreversible Schutzverletzungen auslösen.",
      "Breitere Datenintegration ohne Provenienz und Korrektur kann Fehler zwischen Behörden und Mitgliedstaaten verbreiten und spätere Korrektur deutlich verteuern.",
      "Verhältnismäßig organisierte Transfers können tatsächliche Überstellungsfähigkeit erhöhen; übermäßige Restriktion kann gesundheitliche und soziale Belastung sowie zusätzliche Vollzugs- und Rechtsmittelkosten erzeugen."
    ],
    "system_leverage": "Der stärkste nationale Hebel liegt in der Reihenfolge der Umsetzung: erst ausreichende personelle, rechtliche, sprachliche, medizinische und digitale Kapazität samt Fehlerkorrektur aufbauen, dann schnellere und stärker standardisierte Verfahren in real tragfähigem Umfang nutzen.",
    "first_order_effects": ["standardisiertere Zuständigkeits- und Screeningabläufe","mehr migrationsbezogener Datenaustausch","veränderte Transfer- und Aufenthaltsorganisation","veränderte Verfahrensfristen und Fallsteuerung"],
    "second_order_effects": ["Veränderung von Verfahrens- und Transferzeiten","Veränderung von Rechtsmittel- und Aufhebungsquoten","Veränderung von Unterbringungs- und Freiheitsbelastung","Veränderung der Behördenfalllast"],
    "third_order_effects": ["Veränderung von Sekundärbewegungen und europäischer Lastenverteilung","Vertrauen in europäische Asylverfahren","langfristige Integrations- oder Rückkehrfolgen früher Verfahrensentscheidungen","institutionelle Resilienz des Asylsystems bei Lastspitzen"],
    "affected_groups": ["Asylsuchende und Schutzberechtigte","Kinder und vulnerable Personen","BAMF und Ausländerbehörden","Länder und Kommunen","Gerichte und Rechtsberatung","Gesundheits- und Unterbringungssysteme","andere EU-Mitgliedstaaten"],
    "distributional_effects": ["Beschleunigte oder restriktive Verfahren treffen Personen mit komplexen, schwer dokumentierbaren oder vulnerabilitätsbezogenen Schutzgründen stärker; administrative Entlastung fällt dagegen bei Behörden und aufnehmenden Gebietskörperschaften an. Regionale Kapazitätsunterschiede können Schutzqualität ungleich verteilen."],
    "time_and_generation_effects": ["Prozessgewinne können kurzfristig eintreten; Fehlentscheidungen bei Schutz, Gesundheit, Bildung oder Familienleben können langfristige Folgen haben. Bei Minderjährigen können Verfahrens- und Unterbringungsbedingungen Entwicklungs- und Bildungschancen über Jahre beeinflussen."],
    "resilience_effects": ["Ein kapazitätsbasiertes System mit klarer Fehlerkorrektur ist bei Lastspitzen robuster als ein System, das Fristen und Restriktionen unabhängig von realer Personal-, Beratungs- und Unterbringungskapazität verschärft."],
    "transformation_effects": ["Die GEAS-Umsetzung kann fragmentierte Prozesse zu stärker interoperablen europäischen Abläufen transformieren; ohne Governance kann Interoperabilität jedoch auch Fehler und restriktive Entscheidungen schneller skalieren."],
    "rebound_spillover_leakage": ["Kürzere Erstverfahren können Aufwand in Gerichte und Folgeanträge verlagern, wenn Fehlerquoten steigen. Restriktive nationale Umsetzung kann Bewegungen auf andere Staaten verlagern. Digitale Effizienz kann zu mehr Datenerhebung führen, wenn Datenminimierung nicht als eigene Grenze geführt wird."],
    "competence_scope": "EU_RECHTSRAHMEN_MIT_DEUTSCHER_GESETZGEBUNGS_UND_VOLLZUGSAUSGESTALTUNG",
    "implementation_route": "Bundesrechtliche GEAS-Anpassungs- und Folgegesetze; Umsetzung durch BAMF, Bundes- und Landesbehörden, Gerichte sowie Länder und Kommunen; nationale Ausgestaltung stets innerhalb unmittelbar geltender beziehungsweise verbindlicher EU-GEAS-Regeln.",
    "legal_constraints": ["GEAS-Rechtsakte einschließlich Verordnung (EU) 2024/1348","EU-Grundrechtecharta","Genfer Flüchtlingskonvention und Non-Refoulement","EMRK","Grundgesetz","Datenschutz-Grundverordnung und migrationsspezifische Datenregeln"],
    "rights_and_boundary_conditions": ["Non-Refoulement und individuelle Schutzprüfung","effektiver Rechtsbehelf und rechtzeitiger Beratungszugang","Freiheit und Verhältnismäßigkeit von Aufenthalts- oder Haftmaßnahmen","Kindeswohl, Gesundheit und Schutz vulnerabler Personen","Datenschutz, Datenrichtigkeit und Korrekturmöglichkeit"],
    "non_compensation_check": "PASS_WITH_MULTIPLE_HARD_BOUNDARIES: Kürzere Verfahren, höhere Transferquoten oder geringere Verwaltungskosten kompensieren keine konkrete Verletzung von Non-Refoulement, unzulässigen Freiheitsentzug oder einen praktisch unwirksamen Rechtsbehelf.",
    "reversibility": "Mittel bei organisatorischen und nationalen Ausgestaltungsparametern; gering bei bereits vollzogenen Rückführungen, Freiheitsentzug oder versäumten Schutz- und Entwicklungsfenstern.",
    "resource_and_capacity_constraints": ["qualifiziertes BAMF- und Behördenpersonal","unabhängige Rechtsberatung und Dolmetschen","Unterbringungs- und Gesundheitskapazität","Vulnerabilitätserkennung","interoperable und korrigierbare IT-Systeme","Gerichtskapazität","Koordination zwischen Bund, Ländern, Kommunen und EU-Partnern"],
    "safeguards": ["frühes standardisiertes Vulnerabilitätsscreening mit menschlicher Nachprüfung","rechtzeitiger unabhängiger Rechts- und Sprachzugang","Kapazitätsgate vor Ausweitung beschleunigter Verfahren","individuelle Verhältnismäßigkeitsprüfung für Freiheits- und Aufenthaltsbeschränkungen","Datenprovenienz, Zweckbindung und schneller Korrekturprozess","eigene Kinder- und Gesundheitsstandards","unabhängiges Grundrechts- und Qualitätsmonitoring"],
    "monitoring_indicators": ["Verfahrensdauer nach Verfahrensart","Zeit bis Zuständigkeitsklärung und tatsächlicher Transfer","Rechtsmittel- und gerichtliche Aufhebungsquote","Zugang zu Beratung und Dolmetschen","Dauer von Aufenthalts- und Freiheitsbeschränkungen","Zeit und Qualität der Vulnerabilitätserkennung","Unterbringungs- und Gesundheitsindikatoren","Datenkorrekturen und Identitäts- oder Zuständigkeitsfehler","Sekundärbewegungen","Behördenfalllast je Vollzeitäquivalent"],
    "reality_check_plan": "Quartalsweise zunächst Implementationsqualität und Schutzindikatoren getrennt von Outcome messen; nach mindestens zwölf Monaten Verfahrenszeiten und Transfers gemeinsam mit Rechtsmittel-, Aufhebungs-, Freiheits-, Gesundheits- und Vulnerabilitätsdaten auswerten. EU-bedingte Effekte und deutsche Ausgestaltung sind in der Zurechnung getrennt zu halten.",
    "fallback_option": "Wenn beschleunigte Verfahrensarten oder besondere Zentren bei gegebener Kapazität überproportionale Aufhebungs-, Schutz- oder Gesundheitsprobleme zeigen, nationale Nutzung der betreffenden Spielräume vorübergehend begrenzen und zusätzliche Kapazität sowie Schutzverfahren vorschalten, soweit der EU-Rahmen dies zulässt.",
    "evidence_grade": "MEDIUM",
    "uncertainty": "Die Wirkmechanismen von Standardisierung, Fristen, Transfers und Datenintegration sind plausibel; die deutsche Netto-Wirkung war am Entscheidungstag nicht beobachtbar und hängt stark von Vollzugskapazität, konkreter Nutzung nationaler Spielräume und europäischer Kooperation ab.",
    "recommendation_version": "2.3-R1",
    "supersedes_recommendation_version": null,
    "triggering_evidence_event_ids": [],
    "public_change_summary": "Erste fachliche WÖk-Handlungsoption: nationale GEAS-Spielräume nicht auf Geschwindigkeit allein, sondern auf kapazitätsgesicherte Verfahrensqualität mit harten Schutzgrenzen ausrichten.",
    "fach_status": "APPROVED",
    "source_refs": [
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl#WOEK-IMPACT-GEAS-DE-2026",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.md#7-nationale-umsetzung-des-gemeinsamen-europaeischen-asylsystems-geas",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-3-OF-4-20260819T123140CEST.jsonl#WOEK-IMPACT-GEAS-DE-2026",
      "https://www.bundestag.de/dokumente/textarchiv/2026/kw09-de-geas-1149762",
      "https://eur-lex.europa.eu/eli/reg/2024/1348/oj/eng"
    ]
  },
  {
    "recommendation_id": "WOEK-REC-BUND-MIGRATION-DIGITAL-2026-R1",
    "impact_case_id": "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
    "jurisdiction_id": "DE-BUND",
    "recommendation_status": "PREFERRED_DESIGN",
    "analysis_mode": "CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK",
    "decision_date": "2026-07-09",
    "knowledge_cutoff_date": "2026-08-19",
    "evidence_available_at_decision_time": [
      "BT-Drs. 21/4080 und die Ausschussfassung 21/7004 beschrieben den Ausbau des Datenaustauschs und die wiederholte Nutzbarkeit migrationsbezogener Daten.",
      "Die Sachverständigenanhörung und Fachunterlagen machten Effizienzpotenziale ebenso wie Datenqualitäts-, Datenschutz- und Zweckbindungsrisiken sichtbar.",
      "Medienbrüche und Mehrfacherhebungen waren als reale Prozessprobleme belegt, ohne dass Digitalisierung als einziger bindender Engpass nachgewiesen war."
    ],
    "evidence_only_available_later": [
      "Reale Bearbeitungszeiten, vermiedene Mehrfacherhebungen und behördenübergreifende Prozessdaten nach Umsetzung.",
      "Reale Datenkorrekturen, Identitätsfehler, Datenschutzvorfälle, Fehlzugriffe und Beschwerden nach dem neuen Datenaustausch."
    ],
    "hindsight_limitations": "Der aktuelle Reality Check nutzt nur frühe Implementationssignale als spätere Evidenz und behandelt sie nicht als Wissen des Bundestages am 9. Juli 2026. Eine sinkende Bearbeitungszeit allein wird nicht als Netto-Wirkungsbeleg interpretiert.",
    "problem_state": "Medienbrüche, wiederholte Datenerhebung und schwer nutzbare Informationen erzeugen reale Reibung in der Migrationsverwaltung; Digitalisierung ist jedoch nicht der einzige bindende Engpass, weil Datenqualität, Zuständigkeiten, Personal, Korrekturwege und Rechtsanforderungen den Prozess mitbestimmen.",
    "target_state": "Migrationsverfahren nutzen Daten möglichst einmalig, nachvollziehbar und behördenübergreifend, verkürzen vermeidbare Prozesszeiten und bewahren zugleich Datenrichtigkeit, Zweckbindung, Korrekturmöglichkeiten, Datenschutz, IT-Sicherheit und funktionsfähige Fallback-Prozesse.",
    "root_cause_or_binding_bottleneck": "Der wirksamste Hebel ist nicht maximale Zentralisierung, sondern die Kombination aus interoperablen Daten, eindeutiger Provenienz, klarer Zuständigkeit, schneller Korrektur und rollenbasiertem Zugriff. Ohne diese Governance skaliert Digitalisierung nicht nur Effizienz, sondern auch falsche oder veraltete Daten über mehrere Behörden.",
    "option_set": [
      {"option_id":"A","label":"Beschlossene breite Datenaustauscharchitektur als Referenz","description":"Die beschlossene Ausweitung der Datenverfügbarkeit und Wiederverwendung wird umgesetzt; Schutz und Korrektur folgen den vorgesehenen rechtlichen und technischen Kontrollen.","status_quo":true,"dimensions":{"comparison_role":"REFERENZOPTION","data_reuse":"HOCH","error_propagation_risk":"MITTEL_BIS_HOCH"}},
      {"option_id":"B","label":"Once-only mit Provenienz, Korrektur und segmentiertem Zugriff","description":"Daten werden nur für klar definierte Zwecke wiederverwendet; Herkunft, Aktualität und Änderungshistorie bleiben sichtbar, Korrekturen propagieren kontrolliert und Zugriffe sind rollen- und zweckgebunden sowie vollständig auditierbar.","status_quo":false,"dimensions":{"comparison_role":"WOEK_PRAEFERIERTE_AUSGESTALTUNG","data_quality":"HOCH","privacy_governance":"HOCH","resilience":"HOCH"}},
      {"option_id":"C","label":"Dezentraler Datenaustausch mit begrenzter Wiederverwendung","description":"Behörden behalten stärker getrennte Datenbestände und tauschen nur fallbezogen notwendige Informationen aus; Mehrfacherhebung und Medienbrüche werden dadurch weniger stark reduziert.","status_quo":false,"dimensions":{"comparison_role":"DATENSPARSAME_ALTERNATIVE","data_reuse":"NIEDRIGER","process_friction":"HOEHER"}}
    ],
    "woek_preferred_option": "Option B: Once-only-Prinzip und Wiederverwendung nur mit sichtbarer Datenprovenienz, schneller behördenübergreifender Korrektur, strikter Zweckbindung, segmentierten Zugriffsrechten, Audit-Logs und einem funktionierenden manuellen Fallback verbinden.",
    "recommendation_core_summary": "Die Digitalisierung ist aus WÖk-Sicht vorzugswürdig, wenn sie Medienbrüche und Mehrfacherhebung reduziert, ohne Datenfehler und Zweckausweitungen zu skalieren. Der robuste Designhebel ist deshalb nicht möglichst viel Zentralisierung, sondern nachweisbar richtige, korrigierbare und zweckgebunden verfügbare Information mit klarer Verantwortung und Fallback.",
    "why_preferred": [
      "Option B adressiert den realen Prozessengpass früher als bloße zusätzliche Datensammlung: Sie verbessert Wiederverwendung und zugleich die Qualität der Information, auf der Verwaltungsentscheidungen beruhen.",
      "Provenienz und propagierte Korrektur reduzieren die systemische Kaskade, in der ein einzelner falscher Datensatz mehrere Behördenentscheidungen vorprägt.",
      "Segmentierter Zugriff und Zweckbindung begrenzen Datenschutz- und Missbrauchsrisiken, ohne das Once-only-Potenzial aufzugeben."
    ],
    "key_tradeoffs": ["weniger Mehrfacherhebung gegenüber höherer Zentralisierungs- und Missbrauchsreichweite","schneller Datenaustausch gegenüber Datenrichtigkeits- und Korrekturaufwand","breite Verfügbarkeit gegenüber Zweckbindung und Datenminimierung","Automatisierung gegenüber resilientem manuellem Fallback"],
    "cascade_effects": [
      "Saubere Wiederverwendung kann Datenerhebung und Rückfragen reduzieren, Bearbeitungszeit verkürzen und Personal für komplexe Fälle freisetzen.",
      "Ein falscher zentral verfügbarer Datensatz kann ohne Provenienz und propagierte Korrektur mehrere Behördenprozesse beeinflussen und dadurch Fehler, Rechtsmittel und Korrekturkosten vervielfachen.",
      "Breitere Zugriffsmöglichkeiten können organisatorische Bequemlichkeit erzeugen und schrittweise Zweckausweitung begünstigen, wenn Zugriffe nicht begründet und auditierbar bleiben."
    ],
    "system_leverage": "Der Systemhebel liegt bei Datenqualität und Fehlerkorrektur vor der Prozessbeschleunigung: Nur Daten, deren Herkunft, Aktualität, Zweck und Korrekturweg klar sind, dürfen als wiederverwendbare Infrastruktur skaliert werden.",
    "first_order_effects": ["weniger wiederholte Datenerhebung","weniger Medienbrüche und Rückfragen","mehr behördenübergreifend verfügbare Daten","mehr technische Zugriffs- und Protokollierungsereignisse"],
    "second_order_effects": ["kürzere Bearbeitungszeiten bei guter Datenqualität","schnellere oder breitere Fehlerfortpflanzung bei schlechter Datenqualität","mehr Bedarf an Korrektur-, Berechtigungs- und Sicherheitsgovernance"],
    "third_order_effects": ["Vertrauen in digitale Verwaltung","Pfadabhängigkeit zentraler Registerarchitekturen","institutionelle Lernfähigkeit aus Fehler- und Zugriffsprotokollen","langfristige Datenschutz- und Sicherheitsresilienz"],
    "affected_groups": ["Antragstellende und Betroffene migrationsrechtlicher Verfahren","BAMF und Ausländerbehörden","Visa- und Leistungsbehörden","Gerichte und Justiz","Datenschutzaufsicht","IT-Betrieb und Sicherheitsverantwortliche"],
    "distributional_effects": ["Menschen mit häufig wechselnden, transliterierten oder fehleranfälligen Identitätsdaten sowie Personen mit geringer digitaler oder sprachlicher Durchsetzungsfähigkeit tragen ein höheres Risiko aus fortgepflanzten Datenfehlern; Verwaltungsentlastung fällt dagegen bei mehreren Behörden an."],
    "time_and_generation_effects": ["Prozessentlastung kann kurzfristig eintreten; falsch verknüpfte oder nur schwer korrigierbare Identitäts- und Verfahrensdaten können Betroffene über längere Zeit und über mehrere Verwaltungsverfahren hinweg belasten."],
    "resilience_effects": ["Provenienz, Audit-Logs, segmentierte Rechte, propagierte Korrektur und manueller Fallback erhöhen Resilienz gegen Datenfehler, Ausfälle und Missbrauch; eine monolithische Architektur ohne diese Eigenschaften erzeugt größere gemeinsame Fehlerdomänen."],
    "transformation_effects": ["Ein sauber gestaltetes Once-only-Prinzip kann die Verwaltung von formular- und dokumentenzentrierten Medienbrüchen zu einer nachvollziehbaren Dateninfrastruktur transformieren, ohne den Grundsatz der Zweckbindung aufzugeben."],
    "rebound_spillover_leakage": ["Zeitgewinne können durch zusätzliche Datenerhebung aufgezehrt werden, wenn Verfügbarkeit zum Selbstzweck wird. Fehlerkorrekturkosten können in Gerichte und andere Behörden verlagert werden, wenn die Ursprungsbehörde nicht für propagierte Korrektur verantwortlich bleibt."],
    "competence_scope": "DE_BUND_GESETZGEBUNG_MIT_BEHOERDENUEBERGREIFENDER_UND_LAENDERSEITIGER_UMSETZUNG",
    "implementation_route": "Bundesrechtliche Register-, Aufenthalts- und Datenverarbeitungsregeln; technische und organisatorische Umsetzung durch zuständige Bundes- und Landesbehörden mit Datenschutz- und IT-Sicherheitsaufsicht.",
    "legal_constraints": ["Grundrecht auf informationelle Selbstbestimmung","Datenschutz-Grundverordnung soweit anwendbar","spezifisches Aufenthalts- und Registerrecht","Zweckbindungs-, Erforderlichkeits- und Verhältnismäßigkeitsanforderungen","IT-Sicherheitsanforderungen"],
    "rights_and_boundary_conditions": ["Datenminimierung und Zweckbindung","Datenrichtigkeit und wirksames Korrekturrecht","Datensicherheit und rollenbasierte Zugriffe","vollständige Zugriffsprotokollierung","kein faktischer Verlust von Rechtsschutz durch fehlerhafte Datenübernahme"],
    "non_compensation_check": "PASS_WITH_HARD_BOUNDARY: Kürzere Bearbeitungszeiten kompensieren keine systematisch falschen Identitätszuordnungen, unzulässige Zweckausweitung oder fehlende Korrekturmöglichkeit.",
    "reversibility": "Mittel: Zugriffs- und Prozessregeln sind änderbar, aber breit replizierte Datenfehler und langfristige Registerarchitekturen können nur mit erheblichem Aufwand korrigiert beziehungsweise zurückgebaut werden.",
    "resource_and_capacity_constraints": ["Datenqualitätsverantwortliche","schnelle behördenübergreifende Korrekturprozesse","Identity- und Access-Management","Audit- und Sicherheitsmonitoring","interoperable Schnittstellen","manuelle Fallback-Kapazität"],
    "safeguards": ["feld- und zweckspezifische Datenprovenienz","verbindliche Aktualitäts- und Löschregeln","propagierte Korrektur mit Nachweis an betroffene Systeme","rollenbasierte Zugriffe nach Least-Privilege-Prinzip","unveränderbare Zugriffsprotokolle und regelmäßige Stichproben","sicherer manueller Fallback bei Datenkonflikt oder Systemausfall"],
    "monitoring_indicators": ["Bearbeitungsdauer nach Verfahrensart","Anzahl vermiedener Mehrfacherhebungen","Datenkorrekturen und Zeit bis vollständiger propagierter Korrektur","Identitäts- und Zuordnungsfehler","unberechtigte oder auffällige Zugriffe","Datenschutz- und Sicherheitsvorfälle","behördenübergreifende Rückfragen","Beschwerden wegen Datenfehlern","Fallback-Nutzung und Systemausfälle"],
    "reality_check_plan": "Nach sechs und zwölf Monaten Prozesszeit, Mehrfacherhebung und Personalaufwand gemeinsam mit Datenfehler-, Korrektur-, Zugriffs-, Beschwerde- und Sicherheitsindikatoren auswerten. Nur wenn Effizienzgewinne ohne Verschlechterung der Schutzindikatoren eintreten, gilt das Design als bestätigt.",
    "fallback_option": "Bei hoher Fehlerfortpflanzung, nicht zeitnah korrigierbaren Daten oder materiellen Datenschutzvorfällen die betroffenen automatischen Wiederverwendungspfade auf fallbezogenen Austausch zurücksetzen, bis Provenienz, Rechte und Korrektur technisch nachgebessert sind.",
    "evidence_grade": "MEDIUM",
    "uncertainty": "Das Potenzial zur Prozessentlastung und die Datenschutzmechanismen sind plausibel; konkrete Netto-Wirkungen hängen von Implementationsqualität, Datenqualität und tatsächlicher Nutzung der erweiterten Zugriffe ab und sind noch nicht reif beobachtbar.",
    "recommendation_version": "2.3-R1",
    "supersedes_recommendation_version": null,
    "triggering_evidence_event_ids": [],
    "public_change_summary": "Erste fachliche WÖk-Empfehlung: Digitalisierung als Once-only- und Qualitätsarchitektur gestalten, nicht als möglichst breite Datensammlung.",
    "fach_status": "APPROVED",
    "source_refs": [
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl#WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.md#6-weiterentwicklung-der-digitalisierung-in-der-migrationsverwaltung-mdwg",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1238CEST.jsonl#WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
      "https://www.bundestag.de/mediathek/video?videoid=7655676"
    ]
  },
  {
    "recommendation_id": "WOEK-REC-BUND-KI-MIGRATION-2026-R1",
    "impact_case_id": "WOEK-IMPACT-BUND-KI-MIGRATION-2026",
    "jurisdiction_id": "DE-BUND",
    "recommendation_status": "PILOT_AND_LEARN",
    "analysis_mode": "IMPACT_POTENTIAL_EX_ANTE",
    "knowledge_cutoff_date": "2026-08-19",
    "problem_state": "Asyl- und aufenthaltsrechtliche Verwaltungsverfahren enthalten zeit- und personalintensive Analyse-, Recherche- und Konsistenzaufgaben. Der aktuelle Fachreview zeigt aber, dass KI selbst kein Problemlösungsziel ist und der Engpass nicht robust auf fehlende KI reduziert werden kann.",
    "target_state": "Verfahren werden rechtmäßig, fair, konsistent, zeitnah und korrigierbar bearbeitet; Routineanalyse wird entlastet, ohne dass KI Entscheidungen faktisch vorprägt, diskriminierende Fehler skaliert oder die menschliche Verantwortung und den effektiven Rechtsschutz schwächt.",
    "root_cause_or_binding_bottleneck": "Der bindende Engpass ist nicht das Fehlen von KI als Technologie, sondern die Kombination aus Fallkomplexität, Datenqualität, Rechercheaufwand, begrenzter Fachkapazität und konsistenter Fehlerkorrektur. Weil die Netto-Wirkung konkreter KI-Module noch nicht beobachtbar ist, muss der Instrumenteneinsatz selbst als Hypothese getestet werden.",
    "option_set": [
      {"option_id":"A","label":"Breiter produktiver KI-Einsatz nach gesetzlicher Freigabe","description":"Zulässige KI-Funktionen werden nach Inkrafttreten zügig in reguläre Fallbearbeitung ausgerollt; menschliche Letztentscheidung und allgemeine Kontrollen bleiben bestehen.","status_quo":false,"dimensions":{"comparison_role":"SCHNELLER_ROLLOUT","learning_speed":"HOCH","automation_bias_risk":"HOCH"}},
      {"option_id":"B","label":"Begrenzter Shadow-Mode-Pilot mit harten Ausstiegskriterien","description":"KI-Module laufen zunächst zeitlich, sachlich und fallgruppenspezifisch begrenzt parallel zur menschlichen Bearbeitung; ihre Hinweise prägen die verbindliche Entscheidung erst nach unabhängiger Fehler-, Bias-, Datenschutz- und Nutzenprüfung.","status_quo":false,"dimensions":{"comparison_role":"WOEK_PRAEFERIERTER_NAECHSTER_SCHRITT","reversibility":"HOCH","evidence_generation":"HOCH"}},
      {"option_id":"C","label":"Keine KI in materieller Fallanalyse","description":"Digitale Standardisierung und regelbasierte Werkzeuge werden weiterentwickelt, KI wird in materiell grundrechtsrelevanten Analyse- und Rechercheaufgaben vorerst nicht eingesetzt.","status_quo":true,"dimensions":{"comparison_role":"KONSERVATIVE_REFERENZ","automation_bias_risk":"NIEDRIG","potential_efficiency_gain":"NIEDRIGER"}}
    ],
    "woek_preferred_option": "Option B als nächster Schritt: KI nur in klar abgegrenzten Modulen und zunächst im Shadow Mode pilotieren. Produktive Nutzung wird erst erweitert, wenn vorab definierte Schwellen für Fehler, Gruppenunterschiede, Human Overrides, Datenschutz, Bearbeitungszeit und Rechtsmittelqualität eingehalten werden.",
    "recommendation_core_summary": "Bei heutiger Evidenz ist kein flächiger Rollout, sondern ein begrenzter und reversibler Pilot die robusteste Entscheidung. KI ist hier Instrument, nicht Ziel. Sie darf nur dort produktiv werden, wo ein konkreter Engpass belegt ist, menschliche Verantwortung praktisch wirksam bleibt und unabhängige Tests zeigen, dass Zeit- oder Konsistenzgewinne nicht durch Bias, Datenfehler, Automation Bias oder schwächeren Rechtsschutz erkauft werden.",
    "why_preferred": [
      "Für konkrete KI-Module liegen noch keine belastbaren Outcome-Daten im deutschen Migrationsvollzug vor; ein Pilot erzeugt die fehlende Evidenz, ohne sofort systemweite Pfadabhängigkeit zu schaffen.",
      "Shadow Mode erlaubt einen direkten Vergleich zwischen KI-Hinweisen und unabhängiger menschlicher Bearbeitung und macht Fehler, Gruppenunterschiede und Automation-Bias-Risiken messbar, bevor sie materielle Entscheidungen prägen.",
      "Die Option adressiert den eigentlichen Zielzustand - rechtmäßige, faire, schnelle und korrigierbare Verfahren - statt den Technologieeinsatz selbst zum Erfolgskriterium zu machen."
    ],
    "key_tradeoffs": ["mögliche Zeit- und Konsistenzgewinne gegenüber Bias- und Fehlerskalierung","Lerngewinn durch Pilotierung gegenüber zusätzlichem Parallelaufwand","Erklärbarkeit und menschliche Verantwortung gegenüber Automatisierungsgrad","schneller Rollout gegenüber Reversibilität und institutioneller Pfadabhängigkeit"],
    "cascade_effects": [
      "Gute KI-Unterstützung kann Routineanalyse verkürzen, Fachzeit für komplexe Fälle freisetzen und dadurch Verfahrensqualität und -tempo gleichzeitig verbessern.",
      "Fehlerhafte oder verzerrte Hinweise können über Automation Bias menschliche Entscheidungen vorprägen, in Rechtsmitteln wieder auftauchen und gruppenspezifische Fehlwirkungen systematisch skalieren.",
      "Erfolgreiche Pilotmodule können neue Daten- und Modellabhängigkeiten erzeugen; ohne Versionierung und Exit-Pfad entsteht technologischer Lock-in.",
      "Ein transparenter Shadow Mode kann organisationsweit Lernkompetenz über Grenzen und geeignete Einsatzfelder von KI aufbauen, statt nur ein einzelnes Modell zu validieren."
    ],
    "system_leverage": "Der Systemhebel liegt in der Governance vor dem Rollout: problembezogene Modulauswahl, unabhängige Baseline, Shadow-Mode-Vergleich, menschliche Letztverantwortung, subgruppenbezogene Fehlerprüfung, Modellversionierung und vordefinierte Stop-Kriterien.",
    "first_order_effects": ["zusätzliche KI-generierte Analyse- oder Recherchehinweise","Veränderung von Bearbeitungszeit und Facharbeitsanteilen","Human Overrides und Abweichungen zwischen KI-Hinweis und menschlicher Entscheidung"],
    "second_order_effects": ["mögliche Veränderung von Fehler- und Korrekturquoten","mögliche gruppenspezifische Unterschiede","Veränderung von Beschwerde- und Rechtsmittelmustern","neue Modell- und Datenpflegekosten"],
    "third_order_effects": ["institutioneller Technologie-Lock-in oder lernfähige modulare Architektur","Vertrauen in migrationsrechtliche Entscheidungen","langfristige Verschiebung menschlicher Fachkompetenz","Präzedenzwirkung für KI in anderen grundrechtsintensiven Verwaltungsbereichen"],
    "affected_groups": ["Asylsuchende und andere Betroffene migrationsrechtlicher Verfahren","BAMF und Ausländerbehörden","Fachbeschäftigte und Entscheider","Rechtsberatung und Gerichte","Datenschutz- und Antidiskriminierungsaufsicht","IT- und Modellverantwortliche"],
    "distributional_effects": ["Fehler treffen Gruppen ungleich, wenn Sprache, Herkunft, Dokumentenlage oder Fallkomplexität unterschiedlich gut in Daten und Modellen abgebildet sind. Zeitgewinne fallen zunächst bei Behörden an; Schutzrisiken tragen dagegen unmittelbar die Betroffenen einzelner Entscheidungen."],
    "time_and_generation_effects": ["Effizienzsignale können bereits im Pilot kurzfristig messbar sein, während institutioneller Lock-in, Kompetenzverschiebung und Vertrauensfolgen erst über Jahre sichtbar werden. Besonders bei jungen Schutzsuchenden können fehlerhafte Entscheidungen langfristige Bildungs- und Teilhabefolgen auslösen."],
    "resilience_effects": ["Eine modulare, versionierte Pilotarchitektur mit menschlichem Fallback ist gegenüber Modellfehlern, Drift und Ausfällen resilienter als ein breit integriertes System, dessen Hinweise faktisch unverzichtbar werden."],
    "transformation_effects": ["Richtig gestaltet kann der Pilot eine evidenzbasierte Verwaltungspraxis für KI etablieren, in der Einsatzfelder nach Wirkung und Risiko freigegeben werden. Falsch gestaltet kann er den Erfolg an KI-Nutzung statt an Verfahrensqualität koppeln."],
    "rebound_spillover_leakage": ["Zeitersparnis kann durch zusätzlichen Prüf-, Dokumentations- und Modellpflegeaufwand teilweise aufgehoben werden. Schnellere Fallbearbeitung kann neue Falllast erzeugen. Fehler können in Gerichte oder Folgebehörden verlagert werden, wenn KI-Provenienz nicht erhalten bleibt."],
    "competence_scope": "DE_BUND_GESETZGEBUNG_UND_BUNDESBEHOERDEN_MIT_EU_AI_ACT_UND_DATENSCHUTZRAHMEN",
    "implementation_route": "Bundesrechtliche Rechtsgrundlage für zulässige KI-Verarbeitung; anschließend modulbezogene technische Freigabe, Datenschutz- und Risikoprüfung, Pilotbetrieb bei zuständigen Behörden und unabhängige Evaluation vor Ausweitung.",
    "legal_constraints": ["EU AI Act mit use-case-spezifischer Risikoklassifizierung","EU-Grundrechtecharta","Grundgesetz","Datenschutz-Grundverordnung und migrationsspezifisches Datenschutzrecht","Antidiskriminierungsrecht","verwaltungsverfahrensrechtliche Begründungs- und Rechtsschutzanforderungen"],
    "rights_and_boundary_conditions": ["keine automatisierte oder faktisch automatisierte Letztentscheidung","wirksame menschliche Aufsicht mit echter Abweichungsmöglichkeit","Datenminimierung und dokumentierte Datenherkunft","subgruppenbezogene Genauigkeits- und Fehlerprüfung","Erklärbarkeit des relevanten Entscheidungsbeitrags","wirksame Beschwerde und Korrektur","Diskriminierungsschutz"],
    "non_compensation_check": "PASS_WITH_HARD_BOUNDARY: Zeit- oder Personaleinsparungen kompensieren keine systematische gruppenspezifische Fehlklassifikation, keine faktische automatisierte Letztentscheidung und keinen Verlust wirksamen Rechtsschutzes.",
    "reversibility": "Hoch bei echtem Shadow Mode und modularer Pilotierung; deutlich geringer nach breiter Prozessintegration und organisatorischer Abhängigkeit von Modelloutputs.",
    "resource_and_capacity_constraints": ["repräsentative und rechtmäßig nutzbare Testdaten","unabhängige Fachbaseline","subgruppenbezogene Qualitätsmessung","Datenschutz- und IT-Sicherheitskompetenz","Modellversionierung und Driftmonitoring","Zeit für parallele menschliche Prüfung","Rollback- und Fallback-Kapazität"],
    "safeguards": ["Shadow Mode vor materieller Nutzung","keine Übernahme von KI-Hinweisen ohne verantwortliche menschliche Prüfung","Protokollierung von Modellversion, Quellen und Human Override","unabhängige Fehler- und Bias-Tests je relevante Gruppe","vordefinierte Stop-Schwellen","Beschwerde- und Korrekturweg mit Zugriff auf KI-Provenienz","regelmäßige Neubewertung nach Modell- oder Datenänderung"],
    "monitoring_indicators": ["Bearbeitungszeit und Facharbeitszeit","Abweichungsrate KI-Hinweis gegenüber finaler Entscheidung","Human-Override-Rate","Fehler- und gerichtliche Korrekturquote","False-positive- und False-negative-Raten nach relevanten Gruppen","Quellen- und Recherchefehler","Beschwerden","Datenschutz- und Sicherheitsvorfälle","Modellversionsdrift","Zeit und Kosten der zusätzlichen menschlichen Prüfung"],
    "reality_check_plan": "Pilot vorab registrieren, Baseline ohne KI festhalten und im Shadow Mode mindestens mehrere repräsentative Fallgruppen vergleichen. Produktive Ausweitung nur, wenn Fehler- und Gruppenindikatoren definierte Schwellen einhalten, menschliche Overrides real genutzt werden, Schutzindikatoren nicht schlechter werden und der Netto-Zeitgewinn nach Prüfaufwand positiv bleibt.",
    "fallback_option": "Bei überschrittenen Fehler-, Bias-, Datenschutz- oder Automation-Bias-Schwellen das betroffene Modul auf Shadow Mode beziehungsweise manuelle Bearbeitung zurücksetzen und erst nach Ursachenanalyse, Modell- oder Prozessänderung neu pilotieren.",
    "evidence_grade": "MEDIUM",
    "uncertainty": "Die Mechanismen von Assistenz, Automation Bias und Fehlerfortpflanzung sind plausibel, aber für die konkreten deutschen Module fehlen noch Outcome-Daten. Deshalb ist die Recommendation bewusst auf einen evidenzgenerierenden, reversiblen nächsten Schritt begrenzt.",
    "recommendation_version": "2.3-R1",
    "supersedes_recommendation_version": null,
    "triggering_evidence_event_ids": [],
    "public_change_summary": "Erste fachliche WÖk-Empfehlung: kein flächiger KI-Rollout ohne Evidenz, sondern begrenzter Shadow-Mode-Pilot mit harten Qualitäts-, Grundrechts- und Stop-Kriterien.",
    "fach_status": "APPROVED_WITH_OPEN_DATA",
    "source_refs": [
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl#WOEK-IMPACT-BUND-KI-MIGRATION-2026",
      "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/FACHVOLLSTAENDIGKEIT-SHARD-1-OF-4-20260819T1238CEST.jsonl#WOEK-IMPACT-BUND-KI-MIGRATION-2026",
      "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/kuenstliche-intelligenz-asylverfahren-2448638"
    ]
  }
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function dropboxContentHash(bytes) {
  const blockSize = 4 * 1024 * 1024;
  const blockDigests = [];
  for (let offset = 0; offset < bytes.length; offset += blockSize) {
    blockDigests.push(createHash("sha256").update(bytes.subarray(offset, Math.min(bytes.length, offset + blockSize))).digest());
  }
  return createHash("sha256").update(Buffer.concat(blockDigests)).digest("hex");
}
function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function parseJsonl(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));
}
function managedPath(pathValue) {
  if (pathValue !== ROOT && !pathValue.startsWith(`${ROOT}/`)) throw new Error(`PATH_NAMING_VIOLATION: ${pathValue}`);
  if (pathValue.startsWith("/WÖK") || pathValue.startsWith("/W�K") || pathValue.includes("�") || /[^\x00-\x7F]/.test(pathValue)) throw new Error(`DATA_PATH_ERROR: ${pathValue}`);
  if (pathValue.split("/").some((part) => part === ".." || /\s/.test(part))) throw new Error(`PATH_NAMING_VIOLATION: ${pathValue}`);
  return pathValue;
}
function requirePreview() {
  if (process.env.VERCEL_ENV !== "preview") throw new Error("P0_FAIL_CLOSED: recommendation finalizer may run only in Vercel preview.");
  if (process.env.VERCEL_GIT_COMMIT_REF !== EXPECTED_BRANCH) throw new Error(`P0_FAIL_CLOSED: unexpected branch ${process.env.VERCEL_GIT_COMMIT_REF ?? "MISSING"}.`);
  for (const key of ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN"]) if (!process.env[key]) throw new Error(`TECHNICAL_WRITE_RETRY: missing ${key}`);
  for (const target of [LEDGER_CURRENT, QUEUE_PATH, PATH_CONVENTION, RECOMMENDATION_GATE, TECHNICAL_GATE, ...Object.values(TARGETS)]) managedPath(target);
}
async function accessToken() {
  const form = new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.DROPBOX_REFRESH_TOKEN });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: token refresh ${response.status}`);
  const body = await response.json();
  if (!body.access_token) throw new Error("TECHNICAL_WRITE_RETRY: Dropbox access token missing");
  return body.access_token;
}
async function apiJson(token, endpoint, body) {
  const response = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: Dropbox ${endpoint} ${response.status} ${(await response.text()).slice(0, 400)}`);
  return response.json();
}
async function download(token, pathValue, allowMissing = false) {
  managedPath(pathValue);
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path: pathValue }) },
    signal: AbortSignal.timeout(45000),
  });
  if (response.status === 409 && allowMissing) return null;
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: download ${response.status} ${pathValue} ${(await response.text()).slice(0, 300)}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const header = response.headers.get("dropbox-api-result");
  const metadata = header ? JSON.parse(header) : await apiJson(token, "files/get_metadata", { path: pathValue, include_deleted: false });
  return { bytes, metadata };
}
async function listFolder(token, folder) {
  managedPath(folder);
  let result = await apiJson(token, "files/list_folder", { path: folder, recursive: false, include_deleted: false, limit: 2000 });
  const entries = [...result.entries];
  while (result.has_more) {
    result = await apiJson(token, "files/list_folder/continue", { cursor: result.cursor });
    entries.push(...result.entries);
  }
  return entries;
}
async function verifyReadback(token, pathValue, expected, outcome) {
  const read = await download(token, pathValue);
  const localSha = sha256(expected);
  const readSha = sha256(read.bytes);
  const localDropboxHash = dropboxContentHash(expected);
  const metadataHash = String(read.metadata.content_hash ?? "");
  const byteEqual = expected.equals(read.bytes);
  if (!byteEqual || localSha !== readSha || localDropboxHash !== metadataHash || Number(read.metadata.size) !== expected.length) throw new Error(`P0_READBACK_MISMATCH: ${pathValue}`);
  return { path: pathValue, file_id: String(read.metadata.id), rev: String(read.metadata.rev), dropbox_content_hash: metadataHash, bytes: expected.length, local_sha256: localSha, readback_sha256: readSha, byte_equal: true, outcome };
}
async function writeHistory(token, pathValue, bytes) {
  const existing = await download(token, pathValue, true);
  if (existing) {
    if (!bytes.equals(existing.bytes)) throw new Error(`HISTORY_CONFLICT: ${pathValue}`);
    return verifyReadback(token, pathValue, bytes, "IDEMPOTENT_IDENTICAL");
  }
  const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream", "dropbox-api-arg": JSON.stringify({ path: pathValue, mode: "add", autorename: false, mute: true, strict_conflict: true }) },
    body: bytes,
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: history upload ${response.status} ${pathValue} ${(await response.text()).slice(0, 300)}`);
  return verifyReadback(token, pathValue, bytes, "WRITTEN");
}
async function updateExactRevision(token, pathValue, bytes, rev) {
  const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/octet-stream", "dropbox-api-arg": JSON.stringify({ path: pathValue, mode: { ".tag": "update", update: rev }, autorename: false, mute: true, strict_conflict: true }) },
    body: bytes,
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    if (response.status === 409) throw new Error(`TECHNICAL_WRITE_RETRY: ledger revision conflict ${detail}`);
    throw new Error(`TECHNICAL_WRITE_RETRY: ledger upload ${response.status} ${detail}`);
  }
  return verifyReadback(token, pathValue, bytes, "UPDATED_FROM_EXACT_REV");
}
function validateRecommendationRecords(records) {
  const contractDir = path.resolve(process.cwd(), "data/autopilot/contracts");
  const recommendationSchema = JSON.parse(readFileSync(path.join(contractDir, "recommendation-record.schema.json"), "utf8"));
  const optionSchema = JSON.parse(readFileSync(path.join(contractDir, "option-set.schema.json"), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(optionSchema, "woek-option-set-2.3.schema.json");
  const validate = ajv.compile(recommendationSchema);
  const valid = [];
  const invalid = [];
  for (const record of records) {
    if (validate(record)) valid.push(record);
    else invalid.push({ impact_case_id: record.impact_case_id, recommendation_id: record.recommendation_id, errors: structuredClone(validate.errors ?? []) });
  }
  return { valid, invalid };
}
function canonicalId(id) {
  return canonicalAliases.get(id) ?? id;
}
function approvedReviewMap() {
  const file = path.resolve(process.cwd(), "data/method/public-decision-reviews.jsonl");
  const records = parseJsonl(readFileSync(file, "utf8"));
  const map = new Map();
  for (const review of records) {
    if (!["APPROVED", "APPROVED_WITH_OPEN_DATA", "REVIEWED_NOT_ASSESSABLE"].includes(review.fach_status ?? review.review_status)) continue;
    map.set(canonicalId(review.impact_case_id), review);
  }
  return map;
}
function exactReviewReason(queueEntry, review) {
  const p = review?.problem_review ?? {};
  const g = review?.goal_review ?? {};
  const fach = review?.fach_status ?? review?.review_status ?? "NO_APPROVED_REVIEW";
  const pStatus = p.problem_adequacy_status ?? p.review_disposition ?? "NO_APPROVED_PROBLEM_STATUS";
  const gStatus = g.goal_adequacy_status ?? g.review_disposition ?? "NO_APPROVED_GOAL_STATUS";
  const pRationale = p.rationale ?? p.review_rationale ?? "Im aktuellen Fachoverlay ist keine weitergehende freigegebene Problembegründung hinterlegt.";
  const gRationale = g.rationale ?? g.review_rationale ?? "Im aktuellen Fachoverlay ist keine weitergehende freigegebene Zielbegründung hinterlegt.";
  const gaps = [...(Array.isArray(p.data_gaps) ? p.data_gaps : []), ...(Array.isArray(g.data_gaps) ? g.data_gaps : [])].slice(0, 6);
  const sources = [...new Set([...(queueEntry.available_fach_sources ?? []), ...(p.source_refs ?? []), ...(g.source_refs ?? [])])].slice(0, 8);
  return {
    reason: `Fachstatus ${fach}. Problemprüfung ${pStatus}: ${pRationale} Zielprüfung ${gStatus}: ${gRationale} Für diesen Queue-Fall liegt im aktuellen freigegebenen Fachbestand noch kein objektspezifisch hergeleiteter RecommendationRecord-2.3-OptionSet-Vergleich vor, der Root Cause, echte Alternativen, Kaskaden, Rechts-/Kompetenzweg, Schutzgrenzen, Monitoring und Fallback gemeinsam trägt. Eine Präferenz aus Richtung, Score, Partei, Keyword oder Template wäre gate-widrig. Deshalb fachlich abschließend REVIEW_REQUIRED_WITH_EXACT_REASON statt Scheinsicherheit.${gaps.length ? ` Offene Daten: ${gaps.join("; ")}.` : ""}`,
    fach_status: fach,
    problem_status: pStatus,
    goal_status: gStatus,
    source_refs: sources,
  };
}
function classificationFor(queueEntry, review, authoredById) {
  const id = canonicalId(queueEntry.impact_case_id);
  if (authoredById.has(id)) {
    const record = authoredById.get(id);
    return {
      impact_case_id: id,
      status: record.recommendation_status === "NO_ROBUST_RECOMMENDATION" ? "NO_ROBUST_RECOMMENDATION" : "COMPLETED_APPROVED",
      recommendation_id: record.recommendation_id,
      recommendation_version: record.recommendation_version,
      recommendation_status: record.recommendation_status,
      fach_status: record.fach_status,
      evidence_grade: record.evidence_grade,
      analysis_mode: record.analysis_mode,
      exact_reason: record.recommendation_status === "NO_ROBUST_RECOMMENDATION" ? record.recommendation_core_summary : undefined,
      source_refs: record.source_refs,
    };
  }
  if (id === "WOEK-IMPACT-BUND-BHH-2027" || id === "bt21-dip-c262bf7797f8") {
    return {
      impact_case_id: id,
      status: "NOT_APPLICABLE",
      exact_reason: "Der Bundeshaushalt 2027 ist im freigegebenen B06-Fachgate ausdrücklich nicht als einheitlicher Wirkungsgegenstand aggregierbar. Er enthält heterogene Programme und Titelgruppen mit gegenläufigen Wirkpfaden; ein einzelner RecommendationRecord auf Gesamtbudget-Ebene würde unzulässige Kompensation und Scheingenauigkeit erzeugen. Recommendation-Prüfung erfolgt nur auf materieller Programm-, Titelgruppen- oder Maßnahmenebene.",
      fach_status: review?.fach_status ?? review?.review_status ?? "APPROVED_WITH_OPEN_DATA",
      source_refs: ["data/method/fachvollstaendigkeit-b06-manifest.json#gates.budget_2027_non_aggregable"],
    };
  }
  if (!review) {
    return {
      impact_case_id: id,
      status: "REVIEW_REQUIRED_WITH_EXACT_REASON",
      exact_reason: `Für ${id} liegt im aktuellen B06-Vollscope kein fachlich freigegebener Problem-/Goal-Review-Overlay unter dieser kanonischen ID vor. Die Queue nennt als Fachquellen ${(queueEntry.available_fach_sources ?? []).join(", ") || "keine"} und ${(queueEntry.available_evidence_refs ?? []).length} explizite Evidence-Referenz(en). Ohne freigegebene Root-Cause- und Zielprüfung wäre jeder OptionSet-Vergleich eine unzulässige automatische oder narrative Ableitung. Deshalb fachlich abschließend REVIEW_REQUIRED_WITH_EXACT_REASON.`,
      fach_status: "REVIEW_REQUIRED",
      source_refs: queueEntry.available_fach_sources ?? [],
    };
  }
  const exact = exactReviewReason(queueEntry, review);
  return { impact_case_id: id, status: "REVIEW_REQUIRED_WITH_EXACT_REASON", exact_reason: exact.reason, fach_status: exact.fach_status, problem_status: exact.problem_status, goal_status: exact.goal_status, source_refs: exact.source_refs };
}
function markdown(records, classifications, queueCount) {
  const terminalCounts = classifications.reduce((acc, item) => { acc[item.status] = (acc[item.status] ?? 0) + 1; return acc; }, {});
  const lines = [
    `# WÖk Recommendation Backfill ${BATCH_ID}`,
    "",
    `Canonical Root: \`${ROOT}\``,
    `Original Queue-Fälle: ${queueCount}`,
    `Neu fachlich authorisierte RecommendationRecords: ${records.length}`,
    "",
    "## Neue RecommendationRecords",
    "",
  ];
  for (const record of records) {
    lines.push(`### ${record.impact_case_id}`, "", `- Recommendation: \`${record.recommendation_id}\``, `- Status: \`${record.recommendation_status}\``, `- Evidenz: \`${record.evidence_grade}\``, `- Fachstatus: \`${record.fach_status}\``, "", record.recommendation_core_summary, "");
  }
  lines.push("## Finalklassifikation der ursprünglichen Queue", "");
  for (const [status, count] of Object.entries(terminalCounts).sort()) lines.push(`- ${status}: ${count}`);
  lines.push("", "Alle ursprünglichen Queue-Fälle sind entweder fachlich freigegeben oder mit objektspezifischem fachlichem Endgrund terminal klassifiziert. REVIEW_REQUIRED ist keine automatische Empfehlung und erzeugt keine öffentliche Präferenz.", "");
  return `${lines.join("\n")}\n`;
}
function stableVerification(v) {
  return { path: v.path, file_id: v.file_id, rev: v.rev, dropbox_content_hash: v.dropbox_content_hash, bytes: v.bytes, local_sha256: v.local_sha256, readback_sha256: v.readback_sha256, byte_equal: v.byte_equal, status: "VERIFIED_BYTE_IDENTICAL" };
}

async function main() {
  requirePreview();
  const schema = validateRecommendationRecords(handAuthoredRecords);
  if (schema.invalid.length) throw new Error(`P0_SCHEMA_GATE: ${JSON.stringify(schema.invalid)}`);

  const token = await accessToken();

  // Mandatory read-first gate. No mutation occurs before these reads and checks.
  const [ledgerInitial, queueRead, namingRead, recommendationGateRead, technicalGateRead] = await Promise.all([
    download(token, LEDGER_CURRENT),
    download(token, QUEUE_PATH),
    download(token, PATH_CONVENTION),
    download(token, RECOMMENDATION_GATE),
    download(token, TECHNICAL_GATE),
  ]);
  const queue = parseJsonl(queueRead.bytes.toString("utf8"));
  const queueIds = queue.map((entry) => canonicalId(entry.impact_case_id));
  if (new Set(queueIds).size !== queueIds.length) throw new Error("P0_QUEUE_IDENTITY: canonical alias resolution produced duplicate queue IDs.");

  const localManifest = JSON.parse(readFileSync(path.resolve(process.cwd(), "data/method/fachvollstaendigkeit-b06-manifest.json"), "utf8"));
  if (localManifest?.canonical_root !== ROOT || localManifest?.problem_goal?.records !== 99) throw new Error("P0_OVERLAY_GATE: B06 manifest is not the expected 99-record canonical-root release.");
  const overlayReads = [];
  for (const source of [...localManifest.problem_goal.sources, ...localManifest.common_targets.sources]) {
    const current = await download(token, source.source);
    const currentSha = sha256(current.bytes);
    if (source.sha256 && currentSha !== source.sha256) throw new Error(`P0_OVERLAY_CHANGED: ${source.source}`);
    if (source.dropbox_content_hash && String(current.metadata.content_hash) !== source.dropbox_content_hash) throw new Error(`P0_OVERLAY_DROPBOX_HASH_CHANGED: ${source.source}`);
    overlayReads.push({ path: source.source, file_id: String(current.metadata.id), rev: String(current.metadata.rev), dropbox_content_hash: String(current.metadata.content_hash), bytes: current.bytes.length, sha256: currentSha });
  }
  const analysisEntries = await listFolder(token, ANALYSIS_ROOT);
  const editorialEvidenceNames = analysisEntries.filter((entry) => entry[".tag"] === "file" && (/^GOVERNMENT-EDITORIAL-LAYER-MANIFEST-/.test(entry.name) || /^GOVERNMENT-EDITORIAL-EVIDENCE-BACKFILL-.*\.jsonl$/.test(entry.name) || /^EVIDENCE-MANIFEST-WAVE-.*\.md$/.test(entry.name))).sort((a,b) => a.name.localeCompare(b.name));
  for (const entry of editorialEvidenceNames) {
    const current = await download(token, entry.path_display ?? entry.path_lower);
    overlayReads.push({ path: entry.path_display ?? entry.path_lower, file_id: String(current.metadata.id), rev: String(current.metadata.rev), dropbox_content_hash: String(current.metadata.content_hash), bytes: current.bytes.length, sha256: sha256(current.bytes) });
  }

  // Re-read current ledger immediately before computing the canonical commit.
  const ledgerRead = await download(token, LEDGER_CURRENT);
  const ledger = JSON.parse(ledgerRead.bytes.toString("utf8"));
  const ledgerRev = String(ledgerRead.metadata.rev ?? "");
  if (!ledgerRev) throw new Error("P0_LEDGER_REV_MISSING");
  const existingRecords = Array.isArray(ledger.records) ? ledger.records : [];
  const terminalExisting = new Map(existingRecords.filter((entry) => TERMINAL.has(String(entry.status))).map((entry) => [canonicalId(entry.impact_case_id), entry]));
  const finalAlready = queueIds.every((id) => terminalExisting.has(id));
  if (finalAlready && Number(ledger.remaining_unreviewed_count ?? 0) === 0) {
    console.log(JSON.stringify({ status: "FINAL_ALREADY_COMPLETE", final_classified_count: queueIds.length, remaining_unreviewed_count: 0 }, null, 2));
    return;
  }

  const reviews = approvedReviewMap();
  const authoredById = new Map(schema.valid.map((record) => [record.impact_case_id, record]));
  for (const record of schema.valid) {
    if (!reviews.has(record.impact_case_id)) throw new Error(`P0_FACH_OVERLAY_MISSING_FOR_AUTHORED_RECORD: ${record.impact_case_id}`);
  }
  const authoredBatch = schema.valid.filter((record) => !terminalExisting.has(record.impact_case_id));
  const authoredValidation = validateRecommendationRecords(authoredBatch);
  if (authoredValidation.invalid.length) throw new Error(`P0_SCHEMA_GATE_AFTER_IDEMPOTENCE: ${JSON.stringify(authoredValidation.invalid)}`);

  const newClassifications = [];
  for (const queueEntry of queue) {
    const id = canonicalId(queueEntry.impact_case_id);
    if (terminalExisting.has(id)) continue;
    const classification = classificationFor(queueEntry, reviews.get(id), authoredById);
    if (!TERMINAL.has(classification.status)) throw new Error(`P0_NON_TERMINAL_CLASSIFICATION: ${id}`);
    newClassifications.push(classification);
  }

  const recommendationsJsonl = Buffer.from(`${authoredBatch.map((record) => JSON.stringify(record)).join("\n")}${authoredBatch.length ? "\n" : ""}`, "utf8");
  const allProjectedClassifications = [
    ...queueIds.filter((id) => terminalExisting.has(id)).map((id) => ({ impact_case_id: id, status: terminalExisting.get(id).status })),
    ...newClassifications,
  ];
  if (allProjectedClassifications.length !== queueIds.length || !allProjectedClassifications.every((item) => TERMINAL.has(item.status))) throw new Error("P0_FINAL_CLASSIFICATION_COVERAGE");
  const summaryMd = Buffer.from(markdown(authoredBatch, allProjectedClassifications, queueIds.length), "utf8");
  const sourceReceipt = {
    ledger_first_read: { path: LEDGER_CURRENT, file_id: String(ledgerInitial.metadata.id), rev: String(ledgerInitial.metadata.rev), content_hash: String(ledgerInitial.metadata.content_hash), bytes: ledgerInitial.bytes.length, sha256: sha256(ledgerInitial.bytes) },
    ledger_precommit_read: { path: LEDGER_CURRENT, file_id: String(ledgerRead.metadata.id), rev: ledgerRev, content_hash: String(ledgerRead.metadata.content_hash), bytes: ledgerRead.bytes.length, sha256: sha256(ledgerRead.bytes) },
    queue: { path: QUEUE_PATH, file_id: String(queueRead.metadata.id), rev: String(queueRead.metadata.rev), content_hash: String(queueRead.metadata.content_hash), bytes: queueRead.bytes.length, sha256: sha256(queueRead.bytes), records: queueIds.length },
    naming: { path: PATH_CONVENTION, sha256: sha256(namingRead.bytes) },
    recommendation_gate: { path: RECOMMENDATION_GATE, sha256: sha256(recommendationGateRead.bytes) },
    technical_gate: { path: TECHNICAL_GATE, sha256: sha256(technicalGateRead.bytes) },
    fach_overlays: overlayReads,
  };
  const validationDoc = {
    schema_version: "2.3",
    batch_id: BATCH_ID,
    canonical_root: ROOT,
    created_at: BATCH_CREATED_AT,
    status: "PASS",
    schema_gate: { recommendation_record: "2.3", option_set: "2.3", additional_properties: "FAIL_CLOSED", valid_records: authoredBatch.length, invalid_records: 0 },
    fach_gate: { no_score_derivation: true, no_party_derivation: true, no_keyword_derivation: true, no_template_derivation: true, authored_by: "ChatGPT / Institut fuer Wirkungsoekonomie", approved_overlay_required: true },
    hindsight_gate: { current_or_retrospective_records: authoredBatch.filter((r) => r.analysis_mode !== "IMPACT_POTENTIAL_EX_ANTE").length, required_fields_checked: true },
    final_classification_gate: { original_queue_count: queueIds.length, previously_terminal: terminalExisting.size, newly_classified: newClassifications.length, projected_final_classified_count: queueIds.length, projected_remaining_unreviewed_count: 0 },
    records: authoredBatch.map((record) => ({ impact_case_id: record.impact_case_id, recommendation_id: record.recommendation_id, recommendation_status: record.recommendation_status, fach_status: record.fach_status, evidence_grade: record.evidence_grade, sha256: sha256(Buffer.from(JSON.stringify(record), "utf8")) })),
    source_read_receipt: sourceReceipt,
  };
  const validationBytes = jsonBytes(validationDoc);
  const precommitSnapshotBytes = Buffer.from(ledgerRead.bytes);

  const artifactChecks = [];
  artifactChecks.push(await writeHistory(token, TARGETS.recommendations_jsonl, recommendationsJsonl));
  artifactChecks.push(await writeHistory(token, TARGETS.summary_md, summaryMd));
  artifactChecks.push(await writeHistory(token, TARGETS.validation, validationBytes));
  artifactChecks.push(await writeHistory(token, TARGETS.precommit_snapshot, precommitSnapshotBytes));

  const verificationByPath = new Map(artifactChecks.map((item) => [item.path, item]));
  const outputJsonVerification = verificationByPath.get(TARGETS.recommendations_jsonl);
  const validationVerification = verificationByPath.get(TARGETS.validation);
  const now = BATCH_CREATED_AT;
  const nextRecords = existingRecords.map((record) => ({ ...record }));
  for (const classification of newClassifications) {
    const authored = authoredById.get(classification.impact_case_id);
    const entry = {
      impact_case_id: classification.impact_case_id,
      status: classification.status,
      completed_at: now,
      exact_reason: classification.exact_reason,
      fach_status: classification.fach_status,
      problem_status: classification.problem_status,
      goal_status: classification.goal_status,
      source_refs: classification.source_refs ?? [],
      handoff_batch_id: BATCH_ID,
      canonical_handoff_path: TARGETS.handoff,
    };
    if (authored) {
      Object.assign(entry, {
        recommendation_id: authored.recommendation_id,
        recommendation_version: authored.recommendation_version,
        recommendation_status: authored.recommendation_status,
        evidence_grade: authored.evidence_grade,
        analysis_mode: authored.analysis_mode,
        recommendation_content_sha256: sha256(Buffer.from(JSON.stringify(authored), "utf8")),
        canonical_output_reference: `${TARGETS.recommendations_jsonl}#${authored.recommendation_id}`,
        source_hashes: {
          recommendation_output_file_id: outputJsonVerification.file_id,
          recommendation_output_rev: outputJsonVerification.rev,
          recommendation_jsonl_sha256: outputJsonVerification.local_sha256,
          schema_validation_sha256: validationVerification.local_sha256,
        },
      });
    }
    nextRecords.push(entry);
  }
  const finalIds = new Set(nextRecords.filter((entry) => TERMINAL.has(String(entry.status))).map((entry) => canonicalId(entry.impact_case_id)).filter((id) => queueIds.includes(id)));
  if (finalIds.size !== queueIds.length) throw new Error(`P0_LEDGER_PROJECTED_COVERAGE: ${finalIds.size}/${queueIds.length}`);
  const finalLedger = {
    ...ledger,
    updated_at: now,
    records: nextRecords,
    final_classified_count: queueIds.length,
    remaining_unreviewed_count: 0,
    remaining_backlog_count: 0,
    final_end_status: "COMPLETE",
    terminal_statuses: [...TERMINAL],
    terminal_processing_rule_v2: "Every original queue impact_case_id is skipped after any documented terminal status: COMPLETED_APPROVED, NO_ROBUST_RECOMMENDATION, REVIEW_REQUIRED_WITH_EXACT_REASON, BLOCKED_WITH_EXACT_REASON or NOT_APPLICABLE.",
    last_batch_id: BATCH_ID,
    last_batch_handoff: TARGETS.handoff,
    canonical_root: ROOT,
  };
  const finalSnapshotBytes = jsonBytes(finalLedger);
  const finalSnapshotVerification = await writeHistory(token, TARGETS.final_snapshot, finalSnapshotBytes);
  artifactChecks.push(finalSnapshotVerification);

  const handoff = {
    schema_version: "2.3",
    batch_id: BATCH_ID,
    created_at: BATCH_CREATED_AT,
    canonical_root: ROOT,
    status: "FINAL_RECOMMENDATION_BACKLOG_CLASSIFIED_CANONICAL_ARTIFACTS_VERIFIED_LEDGER_COMMIT_AUTHORIZED",
    original_queue_count: queueIds.length,
    previously_terminal_count: terminalExisting.size,
    new_recommendation_records: authoredBatch.map((record) => ({ impact_case_id: record.impact_case_id, recommendation_id: record.recommendation_id, recommendation_status: record.recommendation_status, fach_status: record.fach_status })),
    newly_terminal_classifications: newClassifications,
    expected_final_classified_count: queueIds.length,
    expected_remaining_unreviewed_count: 0,
    expected_current_ledger_sha256: sha256(finalSnapshotBytes),
    canonical_targets: { ...TARGETS, current_ledger: LEDGER_CURRENT },
    verified_artifacts: artifactChecks.map(stableVerification),
    source_read_receipt: sourceReceipt,
    coordinator_instruction: "Recommendation backlog final classification is complete after the Current Ledger matches expected_current_ledger_sha256. Re-enter Common Targets review for newly approved RecommendationRecords and continue final public source-vs-view / production coordination. Do not infer recommendations for REVIEW_REQUIRED classifications.",
    recommendations_generated_by_codex: false,
    code_generated_recommendations: false,
    historical_files_overwritten: false,
    writer_environment: "VERCEL_PREVIEW_ONLY",
    production_promotion_by_writer: false,
  };
  const handoffBytes = jsonBytes(handoff);
  const handoffVerification = await writeHistory(token, TARGETS.handoff, handoffBytes);

  // Current ledger is the only mutable canonical target and is updated only after all historical writes + final handoff readback.
  const ledgerVerification = await updateExactRevision(token, LEDGER_CURRENT, finalSnapshotBytes, ledgerRev);
  const ledgerReadback = await download(token, LEDGER_CURRENT);
  const ledgerAfter = JSON.parse(ledgerReadback.bytes.toString("utf8"));
  const afterTerminal = new Set((ledgerAfter.records ?? []).filter((entry) => TERMINAL.has(String(entry.status))).map((entry) => canonicalId(entry.impact_case_id)).filter((id) => queueIds.includes(id)));
  if (afterTerminal.size !== queueIds.length || Number(ledgerAfter.final_classified_count) !== queueIds.length || Number(ledgerAfter.remaining_unreviewed_count) !== 0 || Number(ledgerAfter.remaining_backlog_count) !== 0 || ledgerAfter.final_end_status !== "COMPLETE") {
    throw new Error(`P0_LEDGER_READBACK_COUNT_MISMATCH: terminal=${afterTerminal.size}/${queueIds.length}`);
  }
  if (sha256(ledgerReadback.bytes) !== sha256(finalSnapshotBytes)) throw new Error("P0_LEDGER_READBACK_SHA_MISMATCH");

  console.log(JSON.stringify({
    status: "FINAL_COMPLETE",
    batch_id: BATCH_ID,
    final_classified_count: queueIds.length,
    remaining_unreviewed_count: 0,
    remaining_backlog_count: 0,
    newly_authored_recommendations: authoredBatch.length,
    newly_terminal_classifications: newClassifications.length,
    handoff: stableVerification(handoffVerification),
    ledger: stableVerification(ledgerVerification),
  }, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
