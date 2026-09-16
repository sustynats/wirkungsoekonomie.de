// Natalie am 16.09.2026: „Es wäre gut, wenn ich in der App quasi Aufträge
// einstellen könnte und dann noch Informationen nachliefern könnte, die damit
// bearbeitet werden sollen. Aber ich sollte halt jederzeit quasi noch was
// nachliefern können, dann wird es mir wieder zur Freigabe vorgelegt."
//
// Die Nachlieferung ist ein eigener Auftrag, der den ursprünglichen fortschreibt.
// Der Server kennt nur die Vertragsfelder (brief, links, attachments), deshalb
// steht die Bindung in der ersten Zeile des Auftragstexts. Sie wird
// deterministisch gelesen, nie geraten: ohne gültige Auftragskennung gilt der
// Text als gewöhnlicher Auftrag.
export const SUPPLEMENT_PREFIX = 'Nachlieferung zu Auftrag';
export const JOB_ID_PATTERN = /wt_[0-9]{8}T[0-9]{6}Z_[a-f0-9]{24}/;
const MARKER = new RegExp(`^\\s*${SUPPLEMENT_PREFIX} (${JOB_ID_PATTERN.source})\\s*$`, 'm');

export function supplementTarget(brief) {
  const match = MARKER.exec(String(brief || ''));
  return match ? match[1] : null;
}

// Der Marker gehört nicht in den Lesetext: er ist Technik, keine Aussage.
export function supplementText(brief) {
  return String(brief || '').replace(MARKER, '').trim();
}

export function supplementBrief(jobId, text) {
  if (!JOB_ID_PATTERN.test(String(jobId || ''))) throw new Error('EDITORIAL_SUPPLEMENT_TARGET_INVALID');
  return `${SUPPLEMENT_PREFIX} ${jobId}\n\n${String(text || '').trim()}`;
}

// Alle Nachlieferungsziele, die in den Aufträgen vorkommen. Ein fortgeschriebener
// Auftrag wird nicht mehr allein bearbeitet: die Nachlieferung trägt beides und
// ein zweiter Entwurf ohne den Zusatz wäre eine veraltete Fassung.
export function supersededBySupplement(rows = []) {
  const ids = new Set();
  for (const row of rows) {
    if (row?.input?.job_type !== 'editorial_request') continue;
    const target = supplementTarget(row.input?.request?.brief);
    if (target && target !== row.input.job_id) ids.add(target);
  }
  return ids;
}

// Material des ursprünglichen Auftrags plus, falls vorhanden, die bisher
// gelieferte Fassung. Beides geht nur in die Prompt-Kopie; das abgelegte Paket
// und sein input_hash bleiben unberührt.
export async function supplementContext(session, targetId, { paths = [] } = {}) {
  const job = await session.store.get(targetId).catch(() => null);
  if (!job) return null;
  const request = job.input?.request || {};
  const context = {
    job_id: targetId,
    kind: job.input?.request?.kind || job.intake?.kind || null,
    submitted_at: job.created_at || job.input?.created_at || null,
    brief: String(request.brief || ''),
    links: Array.isArray(request.links) ? request.links : [],
    author_notes: String(request.author_notes || ''),
    attachments: (Array.isArray(request.attachments) ? request.attachments : []).map((a) => ({ name: a?.name || null, type: a?.type || null })),
  };
  for (const candidate of paths) {
    let previous = null;
    try { previous = JSON.parse(await session.transport.read(candidate)); } catch { continue; }
    const preview = previous?.preview || previous?.output?.preview;
    if (!preview) continue;
    context.previous_version = { title: preview.title || null, subtitle: preview.subtitle || null, markdown: String(preview.markdown || ''),
      sources: Array.isArray(preview.sources) ? preview.sources : [] };
    break;
  }
  return context;
}

// Prompt-Kopie: der Zusatztext bleibt der Auftrag, das Frühere kommt als Material.
export function withSupplement(packet, context) {
  if (!context) return packet;
  return { ...packet,
    request: { ...(packet.request || {}), brief: supplementText(packet.request?.brief),
      links: [...new Set([...(context.links || []), ...(packet.request?.links || [])])] },
    origin: { ...(packet.origin || {}), supplement_of: context } };
}
