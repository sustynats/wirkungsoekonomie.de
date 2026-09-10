import { callWoekAi } from './lib.mjs';
import { assertApiProcessing } from './processing-mode.mjs';
export class ApiProcessingProvider {
  process(stories, options) { assertApiProcessing(); return callWoekAi(stories, options); }
}
export { DropboxChatGPTBridgeProvider } from './bridge/provider.mjs';
