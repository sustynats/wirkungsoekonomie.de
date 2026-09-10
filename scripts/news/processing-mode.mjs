export const PROCESSING_MODES = Object.freeze(['api', 'dropbox_chatgpt_bridge', 'disabled']);

export function processingMode(env = process.env) {
  const mode = env.WIRKUNGSTICKER_PROCESSING_MODE ?? 'api';
  if (!PROCESSING_MODES.includes(mode)) throw new Error('PROCESSING_MODE_INVALID');
  return mode;
}

// Check at the transport boundary, including scripts invoked outside the scheduler.
export function assertApiProcessing(env = process.env) {
  if (processingMode(env) !== 'api') throw Object.assign(new Error('API_PROCESSING_DISABLED'), {
    requestAttempts: 0, providerNotCalled: true, localRefusal: true,
  });
}

export function visualGenerationProvider(env = process.env) {
  const mode = processingMode(env);
  const provider = env.VISUAL_GENERATION_PROVIDER || (mode === 'api' ? 'higgsfield' : mode === 'disabled' ? 'disabled' : 'chatgpt_bridge');
  if (!['higgsfield', 'chatgpt_bridge', 'disabled'].includes(provider)) throw new Error('VISUAL_PROVIDER_INVALID');
  if (mode === 'dropbox_chatgpt_bridge' && !['chatgpt_bridge', 'higgsfield'].includes(provider) || mode === 'disabled' && provider !== 'disabled') throw new Error('VISUAL_PROVIDER_MODE_CONFLICT');
  return provider;
}

export function assertHiggsfieldProcessing(env = process.env) {
  if (visualGenerationProvider(env) !== 'higgsfield') throw Object.assign(new Error('HIGGSFIELD_DISABLED'), {
    code: 'HIGGSFIELD_DISABLED', requestAttempts: 0, providerNotCalled: true, localRefusal: true,
  });
}
