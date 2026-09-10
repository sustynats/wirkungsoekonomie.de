import fs from 'node:fs';
import { visualGenerationProvider } from '../processing-mode.mjs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sanitizeFeedText } from '../lib.mjs';
import { inspectImage } from '../title-image/image-file.mjs';
import { checkEditorialAsset } from '../title-image/quality.mjs';
import { visualSchema, assertSchema, bridgePath, hash } from './contract.mjs';

export function visualContext(candidate, stories) {
  const recent = stories.filter(s => s.title_image?.source_visual?.url).sort((a, b) =>
    Date.parse(b.title_image.generated_at || b.updated_at || 0) - Date.parse(a.title_image.generated_at || a.updated_at || 0)).slice(0, 30);
  return {
    required: true, format: 'editorial_symbolic_image', type: 'editorial_symbolic_image', aspect_ratio: '16:9', brand: 'Wirkungsticker / Gesellschaft für Wirkungsökonomie',
    recent_image_descriptions: recent.map(s => sanitizeFeedText(s.title_image.source_visual.alt_text || s.title_image.source_visual.concept || 'Bildbeschreibung fehlt – Bildreferenz prüfen.', 4000)), organisations_relevant: [],
    recent_visual_concepts: recent.map(s => ({ story_id: s.story_id,
      concept: sanitizeFeedText(s.title_image.source_visual.concept || s.title_image.source_visual.alt_text || `Bildbeschreibung fehlt; zugehörige Meldung: ${s.title}`, 4000),
      image_url: s.title_image.source_visual.url, description_verified: Boolean(s.title_image.source_visual.concept || s.title_image.source_visual.alt_text) })),
    avoid_concepts: ['Generische Waage, dramatischer Bundestagshimmel, zerbrochene Erde', 'Automatisch düstere oder rote Bildsprache aufgrund negativer Einordnung'],
    existing_story_images: [candidate.existing_story?.title_image?.source_visual?.url].filter(Boolean),
    people_relevant: [], locations_relevant: [].concat(candidate.event_geography || []).filter(x => typeof x === 'string'),
    visual_notes: ['Genau ein finales Symbolbild, ohne Text, fremde Medienlogos oder Wasserzeichen. Keine vermeintliche Ereignisfotografie.',
      'Fakt und Einordnung trennen. Keine parteipolitische Wertung, unnötige Dramatik oder erfundene Fakten.',
      'Reale Personen nicht fotorealistisch erfinden. Sachliches symbolisches oder institutionelles Motiv bevorzugen.',
      'Auf Smartphone prüfen: Fokus, Motivpassung, Anatomie und Objekte. Menschen, Planet und Demokratie nicht zwanghaft symbolisieren.',
      'Vorhandene Bilder bei fehlender semantischer Beschreibung ansehen; zugehörige Überschrift ist keine Bildbeschreibung.',
      'Bei Qualitätsfehlern höchstens zwei Regenerierungen (drei Versuche insgesamt); danach visual status failed, keine Ersatzprovider.',
      visualGenerationProvider() === 'higgsfield' ? 'Bridge-3: nur visual_brief im output.json; kein ChatGPT-PNG und kein visual.json. output.json atomar zuletzt schreiben. Higgsfield rendert serverseitig, Wirkungskarte bei Fehlschlag.' : 'title.png und visual.json zuerst vollständig hochladen; output.json als letztes Freigabesignal. input_hash und image_sha256 in visual.json binden die Dateien.'],
  };
}

// Accepts only returned bytes; it has no generation endpoint or fallback provider.
export class ChatGPTBridgeVisualProvider {
  constructor({ transport, directory, quality = checkEditorialAsset, decode = decodePng }) {
    this.transport = transport; this.directory = directory; this.quality = quality; this.decode = decode;
  }
  async receive(job, now) {
    const id = job.input.job_id;
    const manifestPath = bridgePath('20_OUTPUT_READY', `${id}.visual.json`);
    const imagePath = bridgePath('20_OUTPUT_READY', `${id}.title.png`);
    const manifestExists = Boolean(await this.transport.metadata(manifestPath));
    const imageExists = Boolean(await this.transport.metadata(imagePath));
    if (manifestExists !== imageExists) return { status: 'pending', reason: 'BRIDGE_VISUAL_PENDING' };
    if (!manifestExists) return { status: 'missing', reason: 'BRIDGE_VISUAL_MISSING' };
    const visual = assertSchema(visualSchema, JSON.parse(await this.transport.read(manifestPath)));
    if (visual.job_id !== id || visual.input_hash !== job.input.input_hash) throw new Error('BRIDGE_VISUAL_BINDING_MISMATCH');
    if (Date.parse(visual.generated_at) < Date.parse(job.input.created_at) || Date.parse(visual.generated_at) > Date.parse(now) + 300000) throw new Error('BRIDGE_VISUAL_TIME_INVALID');
    if (visual.contains_real_person_depiction || visual.editorial_safety.warnings.length) throw new Error('BRIDGE_VISUAL_REVIEW_REQUIRED');
    const normalized = s => s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (job.input.visual_context.recent_visual_concepts.some(v => v.description_verified && normalized(v.concept) === normalized(visual.concept))) throw new Error('BRIDGE_VISUAL_DUPLICATE');
    const bytes = await this.transport.readBinary(imagePath);
    const info = inspectImage(bytes);
    if (info.mime !== 'image/png' || info.sha256 !== visual.image_sha256 || Math.abs(info.width / info.height - 16 / 9) > 0.025) throw new Error('BRIDGE_VISUAL_FORMAT_INVALID');
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    const file = path.join(this.directory, `${id}.${info.sha256}.png`);
    fs.writeFileSync(file, bytes, { mode: 0o600 });
    await this.decode(file);
    const quality = await this.quality(file);
    if (quality.status !== 'passed') throw new Error('BRIDGE_VISUAL_QUALITY_FAILED');
    return { status: 'validated', file, visual, sha256: info.sha256, width: info.width, height: info.height, mime: info.mime, quality, manifest_hash: hash(visual) };
  }
}

async function decodePng(file) {
  // Header inspection alone cannot prove valid pixels. Fully decode with limits.
  const args = ['-limit', 'memory', '128MiB', '-limit', 'map', '256MiB', '-limit', 'disk', '256MiB', file, 'null:'];
  const options = { timeout: 30000, maxBuffer: 10000 };
  try {
    try { await promisify(execFile)('magick', args, options); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await promisify(execFile)('convert', args, options); // ImageMagick 6 on Ubuntu
    }
  }
  catch { throw new Error('BRIDGE_VISUAL_DECODE_FAILED'); }
}
