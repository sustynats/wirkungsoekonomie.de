import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { assertSchema, visualBriefSchema, hash } from './contract.mjs';
import { createTitleImagePipeline } from '../title-image/pipeline.mjs';

// Rendering continues through the existing Higgsfield/asset pipeline. This
// provider only binds the editorial brief and isolates the test asset sink.
export class HiggsfieldBridgeVisualProvider {
  constructor({ directory, pipeline = createTitleImagePipeline }) {
    this.directory = directory;
    this.pipeline = pipeline;
  }
  async receive(job, now, { output, record, staged }) {
    // Native API news deliberately has no image-generation brief. Its absence
    // is valid in outputSchema and must use the existing free impact card.
    // A supplied invalid brief still fails validation; never invent one.
    const brief = Object.hasOwn(output, 'visual_brief')
      ? assertSchema(visualBriefSchema, output.visual_brief, '$.visual_brief') : null;
    const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const duplicate = brief && job.input.visual_context.recent_visual_concepts.some(v => v.story_id !== record.story_id && v.description_verified && normalize(v.concept) === normalize(brief.concept));
    const cardsOnly = !brief || brief.required === false || duplicate;
    const result = { status: cardsOnly ? 'fallback' : 'brief_validated',
      ...(brief ? { brief, brief_hash: hash(brief) } : {}),
      ...(cardsOnly ? { reason: !brief ? 'BRIDGE_VISUAL_BRIEF_MISSING' : duplicate ? 'BRIDGE_VISUAL_DUPLICATE' : 'BRIDGE_VISUAL_NOT_REQUIRED' } : {}) };
    if (!staged) return result;
    // The real pipeline writes its normal assets, but a test can never call the
    // public GitHub release store. Only the rendered wide PNG enters SQLite.
    const root = path.join(this.directory, job.input.job_id);
    const files = new Map();
    const prepare = this.pipeline({ root, now: () => now,
      publish: async paths => Object.fromEntries(paths.map(file => {
        const url = `/private-staging/${path.basename(file)}`;
        files.set(url, file); return [path.basename(file), url];
      })),
    });
    const prepared = await prepare({ ...record, ...(brief ? { visual_brief: brief } : {}) }, { cardsOnly });
    const image = prepared.title_image;
    const file = files.get(image?.wide?.url);
    const bytes = file ? fs.readFileSync(file) : null;
    return { ...result, status: 'staged', sha256: bytes ? createHash('sha256').update(bytes).digest('hex') : null,
      staging: { title_image: image, report: prepared.report,
        ...(bytes ? { mime: 'image/png', png_base64: bytes.toString('base64') } : { fallback_url: image?.og?.url }),
      } };
  }
}
