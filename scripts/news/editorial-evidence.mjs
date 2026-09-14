// Evidence checks extend the existing article gate. Signals request a contextual
// editorial decision; they never derive political direction or censor a word.
export const EDITORIAL_EVIDENCE_VERSION = '2026-09-14';
export const SOURCE_FUNCTIONS = ['primary_fact','official_data','legal_source','original_statement','scientific_evidence','secondary_reporting','context','analysis','woek_reference'];
export const EDITORIAL_EVIDENCE_RULE = 'Eigenen quellengetreuen headline liefern. Titel/Teaser nie sicherer als Belege. event_claims: claim_type (event_fact,official_election_result,parliamentary_proceeding,legal_fact,original_statement,impact_potential,observed_effect); attribution_required,attributed_to,headline_claim,headline_qualifier (exakte Attributionsform im Titel). Amtliche Fakten mit Originalbeleg prüfen. Fremdframes/Zitate attribuieren. Medien: Aussage,Faktenprüfung,Resonanzpotenzial und beobachtete Folge trennen. Ex ante≠beobachtet; Relevanz≠Evidenz≠Richtung.';
const normalize = s => String(s || '').normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleLowerCase('de');
const primary = s => s?.primary_source === true || s?.source_type === 'primary' || ['primary_fact','official_data','legal_source','original_statement'].includes(s?.source_function);
const frames = /\b(?:feindliche Übernahme|geheim(?:e|er|en)?|verheerend|autark|vernichtet|zerstört)\b/giu;
export function editorialEvidenceIssues(record = {}) {
  const issues = [], analysis = record.analysis || record;
  const title = analysis.headline || record.title || '';
  const sources = [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])];
  const claims = [...(analysis.event_claims || []), ...(record.editorial_evidence?.claims || [])];
  const add = (code, severity, detail) => issues.push({code,severity,detail});
  for (const [index,c] of claims.entries()) {
    if (c.attribution_required === true && c.headline_claim !== false) {
      const qualifier = normalize(c.headline_qualifier);
      // Explicit binding prevents an unrelated name or quotation mark elsewhere
      // in the title from satisfying attribution for this particular claim.
      if (qualifier.length < 5 || !normalize(title).includes(qualifier)) add('EDITORIAL_HEADLINE_ATTRIBUTION_REQUIRED','error',`Claim ${index+1}: Täter-/Ursachenzuordnung im Titel attribuieren.`);
    }
    const bound = sources.filter(s => (c.source_ids || []).includes(s.source_id) || (c.source_urls || []).includes(s.url));
    if (['official_election_result','parliamentary_proceeding','legal_fact'].includes(c.claim_type) && !bound.some(primary)) add('EDITORIAL_PRIMARY_SOURCE_REQUIRED','warning',`Claim ${index+1}: amtlicher Fakt braucht einen gebundenen Originalbeleg; Sekundärquelle nicht als amtliche Bestätigung ausgeben.`);
    if (c.claim_type === 'observed_effect' && c.temporal_status === 'ex_ante') add('EDITORIAL_FUTURE_EFFECT_AS_OBSERVED','error',`Claim ${index+1}: erwartete Folge ist keine beobachtete Wirkung.`);
  }
  for (const match of title.matchAll(frames)) add('EDITORIAL_HEADLINE_FRAME_REVIEW','warning',`„${match[0]}“ im Kontext prüfen: Fakt, attribuiertes Zitat oder eigener Frame?`);
  for (const [surface,value] of Object.entries(record.editorial_evidence?.headline_surfaces || {})) {
    if (value != null && normalize(value) !== normalize(title)) add('EDITORIAL_HEADLINE_SURFACE_MISMATCH','error',`${surface}: Titelstand weicht vom Artikel ab.`);
  }
  return issues;
}
export const editorialEvidenceErrors = record => editorialEvidenceIssues(record).filter(i=>i.severity==='error').map(i=>i.code);
