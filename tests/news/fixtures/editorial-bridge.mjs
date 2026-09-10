import { editorialSourceRef } from '../../../scripts/news/editorial-analysis.mjs';
import { EDITORIAL_QUALITY_KEYS } from '../../../scripts/news/editorial-judgment.mjs';
function source(id, publisher, primary = false) {
  return { source_id: id, source_item_id: `${id}-item`, publisher_id: id, publisher, url: `https://${id}.example.org/article`, title: `Quellenbericht ${publisher}`, summary: `Der Bericht dokumentiert den Sachverhalt und nennt überprüfbare Angaben zu Infrastruktur, Kosten, Zuständigkeiten und offenen Fragen.`, published_at: "2026-09-05T08:00:00Z", primary_source: primary, provenance: { origin: `publisher:${id}` } };
}

export function highStory(id = "critical") {
  const sources = [source(`${id}-authority`, "Behörde", true), source(`${id}-media-a`, "Medium A"), source(`${id}-media-b`, "Medium B")];
  return {
    story_id: `wt-${id}`, slug: `${id}-story`, title: `Kritische Infrastruktur in ${id} vor einer systemischen Entscheidung`,
    source_summary: "Eine verbindliche Entscheidung verändert Schutzstandards für kritische Infrastruktur. Betroffen sind Versorgungssicherheit, langfristige Investitionen und staatliche Handlungsfähigkeit.\n\nDie Umsetzung, Folgekosten und beobachtbaren Ergebnisse bleiben zu prüfen.",
    topic: ["Energie", "Demokratie"], published: true, listed: true, current_version: 1, content_hash: `${id}-hash`, first_seen: "2026-09-05T08:00:00Z", last_updated: "2026-09-05T09:00:00Z",
    sources,
    source_integrity: { status: "verified" },
    claims: sources.map((item, index) => ({ claim: `Quellengebundener Fakt ${index + 1} zu Schutzstandard und Umsetzung.`, source_id: item.source_id, evidence: [{ source_id: item.source_id, url: item.url, excerpt: item.summary.slice(0, 80) }] })),
    analysis: {
      importance: "sehr hoch", human: { relevance: "hoch" }, planet: { relevance: "hoch" }, democracy: { relevance: "hoch" },
      summary: "Die Entscheidung betrifft kritische Versorgungssysteme.", detail_summary: "Die Entscheidung verändert Regeln, Investitionen und Resilienz kritischer Infrastruktur.",
      impact_potential: "Sehr hohes Wirkungspotenzial für Versorgung und Sicherheit.", impact_risks: ["Kaskaden und Verteilungseffekte sind möglich."], mechanisms: ["Standards verändern Investitionsanreize."],
      first_order: ["Unmittelbar ändern sich Schutzanforderungen."], second_order: ["Investitionen und Kosten können sich verlagern."], third_order: ["Regeln, Märkte, Institutionen und Kapitalströme können sich langfristig verändern."],
      systemic_relevance: "Kritische Infrastruktur verbindet Versorgung, staatliche Handlungsfähigkeit und wirtschaftliche Stabilität.",
      transformation_potential: "Standards können technologische Pfade und langfristige Investitionslogiken verändern.",
      resilience: "Prävention, Redundanz und Anpassungsfähigkeit entscheiden über die Dämpfung möglicher Kaskaden.",
      uncertainties: ["Umsetzung und Langzeitdaten sind offen."], watch_next: ["Umsetzungsdaten und unabhängige Evaluation."], reference_frameworks: ["Agenda 2030/SDG 9"],
    },
  };
}

export function registryFor(stories) {
  return { sources: stories.flatMap(story => story.sources.map(source => ({
    ...source, name: source.publisher, enabled: true, source_type: "media_rss", publisher_kind: "journalism",
    feed_url: source.url, canonical_domain: new URL(source.url).hostname,
  }))) };
}

export function validEditorial(story) {
  const ids = story.sources.map(editorialSourceRef);
  const paragraph = "Die Entscheidung setzt bei einem konkreten Schutzstandard an. Daraus folgt noch keine beobachtete Wirkung, doch Regeln können Investitionen, Zuständigkeiten und Vorsorge verändern. Für die Einordnung sind unmittelbare Kosten, mögliche vermiedene Schäden, Verteilung und die Fähigkeit zur Korrektur gemeinsam zu betrachten. Die Quellen tragen den beschriebenen Ausgangspunkt; Umsetzung und langfristige Ergebnisse bleiben offen. Diese Grenze verhindert, dass Zielsetzung, Output und tatsächliche Zustandsveränderung miteinander verwechselt werden.";
  const sections = [
    ["lage", "Was tatsächlich beschlossen wurde"], ["system", "Warum die Nachricht größer ist"],
    ["mpd", "Mensch, Planet und Demokratie greifen ineinander"], ["wirkungsordnungen", "Die Wirkungspfade in drei Ordnungen"],
    ["resilienz", "Prävention verändert die Kostenkurve"], ["externalitaeten", "Wer Kosten trägt"],
    ["unsicherheit", "Was wir nicht wissen"], ["beobachtung", "Worauf jetzt zu achten ist"], ["synthese", "Wirkungsökonomische Einordnung"],
  ].map(([id, title]) => ({ id, title, paragraphs: [paragraph, paragraph] }));
  sections[3].visual = { type: "cascade", caption: "Vom Standard zur möglichen Wirkung", items: [
    {title:"Schutzstandard",text:"Eine verbindliche Entscheidung ist dokumentiert.",status:"fact",relation:"scope",source_ids:[ids[0]]},
    {title:"Vorsorge",text:"Investitionen können sich verändern.",status:"analytical_inference",relation:"impact_path",direction:"positive",condition:"Wenn der Standard zu wirksamer Vorsorge führt.",source_ids:[]},
    {title:"Resilienz",text:"Unterlassene Vorsorge kann Kaskadenrisiken erhöhen.",status:"scenario",relation:"impact_path",direction:"negative",condition:"Wenn notwendige Vorsorge ausbleibt.",source_ids:[]},
  ] };
  return {
    executive_finding: paragraph,
    assessment_context: "potential", assessment_condition: "Bedingt durch wirksame Umsetzung des Schutzstandards; noch keine gemessene Wirkung.",
    subject_dimensions: Object.fromEntries(["human", "planet", "democracy"].map(key => [key, { relevance: "hoch", rationale: "Schutz, Versorgung und Vorsorge hängen zusammen.", implementation_status: "adopted", likelihood: "open", direction: "positive", magnitude: "open", evidence: "plausible_path" }])),
    author_perspective: { paragraphs: ["Für mich steht nach dieser Analyse die Frage im Zentrum, ob aus einem Schutzstandard im Alltag verlässliche Vorsorge wird. Entscheidend ist nicht der Beschluss allein, sondern die Umsetzung. Erst belastbare Daten können zeigen, welche Zustandsveränderung erreicht und wie sie verursacht wurde."], claim_indices: [0, 2, 3] },
    editorial_quality: Object.fromEntries(EDITORIAL_QUALITY_KEYS.map(key => [key, true])),
    positive_path_checks: [{measure:"Schutzstandard",source_ids:[ids[0]],mechanism:"Regeln verändern Vorsorge und Investitionen."}],
    editorial_question: "Wie verändert der neue Schutzstandard die Resilienz kritischer Infrastruktur?", analysis_type: "resilience_analysis",
    title: "Was neue Schutzstandards für kritische Infrastruktur bedeuten", subtitle: "Warum Prävention, Investitionen und staatliche Handlungsfähigkeit gemeinsam betrachtet werden müssen.",
    teaser: "Die Entscheidung ist mehr als eine technische Vorgabe. Sie verschiebt Vorsorgekosten, Haftungsfragen und Investitionspfade – während die tatsächliche Wirkung erst mit Umsetzung und belastbaren Daten sichtbar wird.",
    seo_description: "Die WÖK-Analyse erklärt, wie neue Schutzstandards Vorsorgekosten, Investitionen und die Resilienz kritischer Infrastruktur verändern können.",
    additional_value: "Die Analyse verbindet die isolierte Regelungsnachricht mit Präventionskosten, möglichen Kaskaden, Verteilung und langfristigen Investitionspfaden.",
    research_summary: "Drei voneinander getrennte Quellen tragen den Ausgangspunkt. Gegenbefunde und fehlende Umsetzungsdaten begrenzen die Zurechnung.", sections,
    claim_ledger: [
      { claim: "Eine verbindliche Entscheidung ist dokumentiert.", type: "fact", source_ids: [ids[0]], evidence_level: "high", data_status: "confirmed", uncertainty: "Die Umsetzung ist offen.", date: "2026-09-05" },
      { claim: "Mehrere Quellen beschreiben die Infrastrukturrelevanz.", type: "observation", source_ids: ids.slice(1), evidence_level: "medium", data_status: "attributed", uncertainty: "Die Berichte können gemeinsame Vorlagen nutzen.", date: "2026-09-05" },
      { claim: "Investitionsanreize können sich verändern.", type: "impact_potential", source_ids: [], evidence_level: "medium", data_status: "inferred", uncertainty: "Ex ante; keine gemessene Wirkung.", date: null },
      { claim: "Unterlassene Vorsorge kann Kaskadenrisiken erhöhen.", type: "impact_risk", source_ids: [], evidence_level: "medium", data_status: "inferred", uncertainty: "Eintritt und Größenordnung sind offen.", date: null },
      { claim: "Zurechnung bleibt ohne Umsetzungsdaten begrenzt.", type: "attribution", source_ids: [ids[0]], evidence_level: "medium", data_status: "open", uncertainty: "Gegenfaktum fehlt.", date: null },
    ],
    counter_evidence: [{ finding: "Bisher liegen keine beobachteten Langzeitwirkungen vor.", source_ids: ids, effect_on_assessment: "Die Einordnung bleibt ex ante und darf Zielsetzung nicht als Erfolg behandeln." }],
    what_changes_the_assessment: ["Veröffentlichte Umsetzungsdaten und eine unabhängige Evaluation würden Potenzial und Zurechnung präzisieren."],
    self_frame_check: { passed: true, issues: [], recommended_title: "", recommended_summary: "", recommended_meta_description: "" },
  };
}
