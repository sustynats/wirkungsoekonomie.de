// Einstiegspunkt Direktbetrieb: Import → lokale Bewertung → genau ein
// OpenAI-Aufruf je Meldung → deterministisches Gate → Build. Keine Bridge.
process.env.WIRKUNGSTICKER_PROCESSING_MODE ||= 'api';
process.env.VISUAL_GENERATION_PROVIDER ||= 'higgsfield';
const dryRun = process.argv.includes('--dry-run');
if (dryRun) process.env.WOEK_NEWS_AI_ENABLED = 'false';
if (process.env.WIRKUNGSTICKER_PROCESSING_MODE !== 'api') { console.error('DIRECT_OPERATION_REQUIRES_API_MODE'); process.exit(1); }
const [{ runWirkungsticker }, { callOpenAiDirect, newsModel }] = await Promise.all([import('./run.mjs'), import('./openai-transport.mjs')]);
if (!dryRun && !process.env.OPENAI_API_KEY) { console.error('OPENAI_API_KEY_MISSING'); process.exit(1); }
const model = newsModel();
try {
  const report = await runWirkungsticker({ dryRun, callAiImpl: (stories, options) => callOpenAiDirect(stories, { ...options, model }) });
  console.log(JSON.stringify({ ...report, transport: 'direct-single-call-1', configured_model: model }, null, 2));
  // Ein gestörter Anbieter ist eine Betriebsmeldung des Health-Schritts, kein
  // Grund, den Importstand zu verwerfen: Zustand wird gebaut und committet,
  // betroffene Meldungen bleiben als AI_PROVIDER_UNAVAILABLE wiederholbar.
  if (report.ai_error) console.error(JSON.stringify({ ai_error: report.ai_error, note: 'provider degraded; state committed, health step reports' }));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
