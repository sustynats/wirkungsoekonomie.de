// Operational research failures must not become final epistemic judgments.
// These are transport/completion diagnostics, never topic or direction rules.
export function impactResearchHealth(assessment = {}) {
  const issues = [];
  const failed = /(?:Suchzugriff|Recherche|Suche|Prüfung).{0,500}(?:nicht erfolgreich abgeschlossen|nicht durchgef[üu]hrt|Zugriffsfehler|Zugangsfehler|Toolfehler)|(?:HTTP\s*(?:403|429|5\d\d)|ROBOTS_DENIED|ARTICLE_FETCH_FAILED|SOURCE_DISABLED|SOURCE_METADATA_ONLY)/iu;
  const searches = assessment.research_check?.searches || [];
  // A failed endpoint is not a failed investigation when a documented fallback
  // supplies evidence. Do not punish transparent access logs.
  const recovered = searches.some(s => !failed.test(s.result || '') && s.source_ids?.length > 0);
  if (assessment.research_check?.status === 'completed' && !recovered && searches.some(s => failed.test(s.result || ''))) {
    issues.push('IMPACT_RESEARCH_OPERATION_INCOMPLETE');
  }
  return issues;
}
