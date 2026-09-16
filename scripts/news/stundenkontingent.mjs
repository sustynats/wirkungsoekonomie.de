// Ein Kontingent für alles, was bezahlt wird.
//
// Natalie am 16.09.2026: „Sonst machen wir Meinung und Analyse, wenn es eng
// wird, und Nachberichte als Teil der Veröffentlichung. Das heißt, dann kommt
// dann ein Artikel jeweils weniger." Bisher liefen zwei Zähler getrennt: die
// Stundengrenze der Nachrichtenspur und das Tagesbudget der Redaktionsspur.
// Zusammen konnten sie mehr ausgeben als die eine Zahl, die sie gesetzt hat.
//
// Jetzt zählt beides auf dieselbe Stundengrenze. Die Redaktionsspur nimmt
// zuerst - eine Nachbesprechung oder eine Analyse ist der teurere, seltenere
// Beitrag -, die Nachrichtenspur sieht danach entsprechend weniger Plätze.
// Automatisch erzeugt wird weiter beides; wartende Aufträge verfallen nicht,
// sie kommen im nächsten Lauf dran und landen wie immer in Natalies Freigabe.
export const EDITORIAL_HOUR_KEY = 'editorial-hour-usage';
const WINDOW_MINUTES = 60;

const times = (value) => (Array.isArray(value?.drafts) ? value.drafts : Array.isArray(value) ? value : [])
  .map((entry) => Date.parse(typeof entry === 'string' ? entry : entry?.at || ''))
  .filter((at) => Number.isFinite(at));

export function editorialDraftsInWindow(observation, now, windowMinutes = WINDOW_MINUTES) {
  const at = Date.parse(now);
  if (!Number.isFinite(at)) return 0;
  const cutoff = at - Math.max(1, Number(windowMinutes) || WINDOW_MINUTES) * 60000;
  return times(observation).filter((stamp) => stamp > cutoff && stamp <= at).length;
}

// Der Vermerk hält nur, was noch zählt: zwei Fenster weit, damit ein Lauf am
// Rand nichts verliert, aber die Liste nicht wächst.
export function noteEditorialDraft(observation, at, windowMinutes = WINDOW_MINUTES) {
  const stamp = Date.parse(at);
  if (!Number.isFinite(stamp)) return observation || { drafts: [] };
  const cutoff = stamp - 2 * Math.max(1, Number(windowMinutes) || WINDOW_MINUTES) * 60000;
  const drafts = [...times(observation).filter((value) => value > cutoff), stamp]
    .sort((a, b) => a - b).map((value) => new Date(value).toISOString());
  return { drafts };
}

export function sharedHourlyRoom({ configured, tickerStories = 0, editorialDrafts = 0 }) {
  const limit = Math.max(0, Number(configured) || 0);
  const used = Math.max(0, Number(tickerStories) || 0) + Math.max(0, Number(editorialDrafts) || 0);
  return Math.max(0, limit - used);
}

// Die Nachrichtenspur fuehrt ihre bezahlten Meldungen in data/news/usage.json,
// die Redaktionsspur ihren Vermerk in der Ablage. Beide Seiten brauchen beide
// Zahlen, deshalb liegt das Lesen hier - und nicht in einem der beiden Laeufe.
export function tickerStoriesInWindow(usage, now, windowMinutes = WINDOW_MINUTES) {
  const at = Date.parse(now);
  if (!Number.isFinite(at)) return 0;
  const cutoff = at - Math.max(1, Number(windowMinutes) || WINDOW_MINUTES) * 60000;
  return (usage?.runs || []).reduce((sum, run) => {
    const startedAt = Date.parse(run?.started_at || run?.completed_at || '');
    if (!Number.isFinite(startedAt) || startedAt <= cutoff || startedAt > at) return sum;
    return sum + Math.max(0, Number(run?.counts?.ai_stories ?? run?.ai?.requests ?? 0) || 0);
  }, 0);
}

export const configuredHourlyQuota = (env = process.env) => Math.max(0,
  Number(env.WOEK_NEWS_MAX_AI_STORIES_PER_HOUR || env.WOEK_NEWS_MAX_AI_CALLS_PER_HOUR || 4));
