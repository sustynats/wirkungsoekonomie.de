import { normalizePublicationTypography } from '../../lib/public-typography.mjs';
// Same protected-section contract as the pinned v4 importer. Do not publish keys.
export const protectedHeading = /(?:\bquiz\b|prüfungsfragen?|lösungen?(?:\s+mit\s+begründung)?|lösungsschlüssel|musterlösung|answer\s*key|instructor[^\n]*(?:solution|answer|rubric)|dozierenden[^\n]*(?:lösung|korrektur))/i;
export function publicScriptBody(source) {
  const output = [];
  let skipLevel = null;
  for (const line of source.replace(/^<!-- WOEK_PUBLIC_MASTER[^\n]*-->\n/, '').split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (skipLevel !== null) {
      if (heading && heading[1].length <= skipLevel) skipLevel = null;
      else continue;
    }
    if (heading && protectedHeading.test(heading[2])) { skipLevel = heading[1].length; continue; }
    output.push(line);
  }
  return normalizePublicationTypography(output.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n');
}

export const scriptMetadataField = /^\*\*(?:lecture_id|display_code|curriculum_version|legacy_source|legacy_sources|migration_class|status|source_version|reviewed_at|change_reason|part|module|current_status_checked_at|offering_id|subtitle|Freshness):\*\*/;

// Display projection: preserve actual teaching content, omit production metadata
// and speaker/exam-production instructions. The canonical source stays intact.
export function learningScriptBody(source) {
  const output = [];
  let skipLevel = null;
  for (const line of publicScriptBody(source).split('\n')) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (skipLevel !== null) {
      if (heading && heading[1].length <= skipLevel) skipLevel = null;
      else continue;
    }
    if (heading && heading[1].length > 1 && /Sprechertext|Prüfungsrelevanz|Versions-Gate|Version\s*\/\s*Stand\s*\/\s*Änderungsgrund|chart[- ]?spec|Bildvorgabe|Produktionshinweise/i.test(heading[2])) { skipLevel = heading[1].length; continue; }
    if (/^`document_status\s*=/.test(line) || /^Für (?:die historische Analyse der Juli-Fassung|den aktuellen Stand) gilt(?: dagegen)?:$/.test(line) || scriptMetadataField.test(line) || /Vor jeder Präsentationsproduktion erneut prüfen\./.test(line)) continue;
    output.push(line);
  }
  let body = output.join('\n').replace(/\n### Zeitabhängiger Status\s*$/, '').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  const labels = {
    PRIMARY_STATISTICAL_SOURCE: 'primäre statistische Quelle',
    'GOVERNANCE/TARGET_CONTEXT': 'Kontext zu Steuerung und Zielen',
    ATTRIBUTION_PROOF: 'Kausalitätsnachweis',
    NOT_PUBLICLY_ESTABLISHED: 'öffentlich nicht belegt',
    NOT_ASSESSED: 'nicht geprüft',
    STATE_GFA_ENAP_BENCHMARK: 'staatlicher GFA-/eNAP-Benchmark',
    STATE_ASSESSMENT_BENCHMARK: 'staatliche Referenzprüfung',
    HISTORICAL_POLICY_DRAFT: 'historischer Strategieentwurf',
    MISSION_SOURCE: 'Quelle für Missionen',
    'GOVERNANCE/DELIVERY_CONTEXT': 'Kontext zu Steuerung und Umsetzung',
    PARENT_STRATEGY_REFERENCE: 'übergeordnete Strategiereferenz',
  };
  for (const [code, label] of Object.entries(labels)) body = body.replaceAll(code, label);
  return body.replaceAll('**OPEN:**', '**Offen:**');
}
