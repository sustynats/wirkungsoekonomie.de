// Ticker 2.1: a disclosed ordinal estimate of one concrete pathway. This is
// neither a probability model nor the general WÖk -3..+3 scorecard.
export const MAGNITUDE_METHOD_VERSION = '2.1';
export const MAGNITUDE_FACTORS = {
  reach: { symbol: 'R', label: 'Reichweite', levels: ['keine', 'einzelne Empfänger', 'begrenzte Gruppe / lokal', 'regional oder sektorweit', 'landes- oder bundesweit', 'global / gesamtes System'] },
  intensity: { symbol: 'I', label: 'Intensität', levels: ['keine', 'gering', 'begrenzt', 'deutlich', 'schwer', 'existenziell / fundamental'] },
  duration: { symbol: 'D', label: 'Dauer', levels: ['keine', 'sehr kurzfristig', 'kurzfristig', 'mittel- bis längerfristig', 'lang anhaltend', 'generationenübergreifend / strukturell dauerhaft'] },
  irreversibility: { symbol: 'U', label: 'Unumkehrbarkeit', levels: ['sofort reversibel / keine Veränderung', 'leicht reversibel', 'mit begrenztem Aufwand reversibel', 'nur mit erheblichem Aufwand reversibel', 'sehr schwer reversibel', 'irreversibel'] },
  vulnerability: { symbol: 'V', label: 'Verteilung / Vulnerabilität', levels: ['nicht relevant', 'gering', 'begrenzt', 'deutlich', 'stark ungleich / vulnerable Gruppen', 'fundamentale Schutzbedürftigkeit / extreme Lastkonzentration'] },
  system_depth: { symbol: 'S', label: 'Systemtiefe', levels: ['keine', 'isolierter Einzelfall', 'begrenzter Folgepfad', 'zweite Ordnung / relevante Rückkopplung', 'starke strukturelle Wirkung', 'dritte Ordnung / Regeln, Institutionen oder Systemzustand'] },
};
export const FACTOR_KEYS = Object.keys(MAGNITUDE_FACTORS);
const score = value => Number.isInteger(value) && value >= 0 && value <= 5;
const text = value => typeof value === 'string' && value.trim().length >= 12;

export function calculateMagnitude(factors, { protectionBoundaryDecisive = false } = {}) {
  const values = FACTOR_KEYS.map(key => factors?.[key]?.value);
  if (!values.every(score)) throw Error('IMPACT_MAGNITUDE_FACTORS_REQUIRED');
  const sum = values.reduce((total, value) => total + value, 0);
  // Integer thresholds avoid rounding 1.499... up before classification.
  const rounded = sum === 0 ? 0 : Math.max(1, Math.floor((sum + 3) / 6));
  return { method_version: MAGNITUDE_METHOD_VERSION, sum, divisor: 6, raw: sum / 6,
    rounded, protection_floor: protectionBoundaryDecisive ? 4 : 0,
    final: Math.max(rounded, protectionBoundaryDecisive ? 4 : 0) };
}

export function pathwayMagnitudeErrors(path, sourceIds = new Set()) {
  const errors = [], bound = ids => Array.isArray(ids) && ids.length > 0 && ids.every(id => sourceIds.has(id));
  for (const key of FACTOR_KEYS) {
    const factor = path.magnitude_factors?.[key];
    if (!score(factor?.value) || !text(factor.rationale) || !bound(factor.source_ids)) errors.push(`IMPACT_FACTOR_REQUIRED:${key}`);
  }
  const boundary = path.protection_boundary;
  if (!boundary || typeof boundary.decisive !== 'boolean' || !text(boundary.rationale)) errors.push('IMPACT_BOUNDARY_REVIEW_REQUIRED');
  if (boundary?.decisive && (path.direction !== 'negative' || !path.same_target || !path.same_baseline
    || !text(boundary.reference_frame) || !bound(boundary.source_ids)
    || !['observed','conditional'].includes(boundary.status)
    || path.temporal_status === 'ex_ante' && boundary.status !== 'conditional'
    || path.temporal_status === 'ex_post' && boundary.status !== 'observed')) errors.push('IMPACT_BOUNDARY_UNSUPPORTED');
  if (errors.length) return errors;
  const calculation = calculateMagnitude(path.magnitude_factors, { protectionBoundaryDecisive: boundary.decisive });
  if (!score(path.magnitude) || path.magnitude !== calculation.final) errors.push('IMPACT_MAGNITUDE_CALCULATION_MISMATCH');
  if (path.magnitude_calculation && Object.entries(calculation).some(([key,value]) => path.magnitude_calculation[key] !== value)) errors.push('IMPACT_STORED_CALCULATION_MISMATCH');
  return errors;
}

export function aggregateMainPaths(paths = []) {
  const relevant = paths.filter(path => path.same_target && path.same_baseline);
  if (!relevant.length || relevant.some(path => !score(path.magnitude))) throw Error('IMPACT_MAIN_MAGNITUDE_REQUIRED');
  const magnitude = Math.max(...relevant.map(path => path.magnitude));
  const decisive = relevant.filter(path => path.direction === 'negative' && path.protection_boundary?.decisive);
  if (decisive.length) return { direction: 'negative', dominance: 'dominant_negative', magnitude: Math.max(...relevant.filter(path => path.direction === 'negative').map(path => path.magnitude)),
    protection_boundary_decisive: true, positive_paths_separate: true };
  const positive = relevant.filter(path => path.direction === 'positive'), negative = relevant.filter(path => path.direction === 'negative');
  if (relevant.some(path => path.direction === 'open')) return { direction: 'open', dominance: 'none', magnitude, protection_boundary_decisive: false };
  if (positive.length && negative.length) {
    const difference = Math.max(...positive.map(path => path.magnitude)) - Math.max(...negative.map(path => path.magnitude));
    return { direction: 'mixed', dominance: Math.abs(difference) <= 1 ? 'balanced' : difference > 0 ? 'dominant_positive' : 'dominant_negative', magnitude, protection_boundary_decisive: false };
  }
  const direction = negative.length ? 'negative' : positive.length ? 'positive' : 'neutral';
  return { direction, dominance: ['positive','negative'].includes(direction) ? `dominant_${direction}` : 'none', magnitude, protection_boundary_decisive: false };
}

export const MAGNITUDE_PATH_SCHEMA = {
  magnitude_factors: Object.fromEntries(FACTOR_KEYS.map(key => [key, { value: '0|1|2|3|4|5 (Zahl)', rationale: 'Begründete Einordnung der möglichen Zustandsänderung im definierten Wirkungsraum; Modellannahmen offenlegen', source_ids: ['source_id'] }])),
  protection_boundary: { decisive: false, rationale: 'Schutzgrenze objektspezifisch prüfen, keine Schlagwortentscheidung', reference_frame: 'konkretes Schutzgut bei maßgeblicher Grenzverletzung', source_ids: ['source_id'], status: 'observed|conditional|not_decisive' },
};
