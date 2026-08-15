import { createHash } from "node:crypto";
import { supabaseRest } from "@/lib/database/supabase-admin";

type StoredDocumentVersion = { id: string };
export const maximumStoredDocumentTextCharacters = 1_000_000;

function normalizeText(value: string) {
  return value.replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function chunkText(value: string, maximumLength = 3_500) {
  const paragraphs = value.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const splitLongText = (text: string) => {
    const parts: string[] = [];
    let remaining = text.trim();
    while (remaining.length > maximumLength) {
      // Preserve words and, where possible, complete sentences. A number of
      // official full-text exports contain one very long paragraph; keeping
      // only its first 3,500 characters would silently drop the rest of the
      // primary source from the review corpus.
      const window = remaining.slice(0, maximumLength + 1);
      const breakAt = Math.max(
        window.lastIndexOf("\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf("; "),
        window.lastIndexOf(" ")
      );
      const cut = breakAt >= Math.floor(maximumLength * 0.55) ? breakAt + 1 : maximumLength;
      parts.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    if (remaining) parts.push(remaining);
    return parts;
  };

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= maximumLength) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    if (paragraph.length > maximumLength) {
      const parts = splitLongText(paragraph);
      chunks.push(...parts.slice(0, -1));
      current = parts.at(-1) ?? "";
    } else {
      current = paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function persistStructuredDocumentVersion({
  documentId,
  sourceHash,
  sourceUrl,
  documentDate,
  rawText,
  sourceMetadata
}: {
  documentId: string;
  sourceHash: string;
  sourceUrl: string;
  documentDate: string | null;
  rawText: string | null;
  sourceMetadata: Record<string, unknown>;
}) {
  const completeText = rawText ? normalizeText(rawText) : null;
  const normalizedText = completeText && completeText.length > maximumStoredDocumentTextCharacters
    ? completeText.slice(0, maximumStoredDocumentTextCharacters)
    : completeText;
  const normalizedTextTruncated = Boolean(completeText && normalizedText && completeText.length !== normalizedText.length);
  const rows = await supabaseRest<StoredDocumentVersion[]>("parliament.document_versions?on_conflict=document_id,source_hash", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      document_id: documentId,
      source_hash: sourceHash,
      source_url: sourceUrl,
      retrieved_at: new Date().toISOString(),
      document_date: documentDate,
      normalized_text: normalizedText,
      normalized_text_truncated: normalizedTextTruncated,
      source_metadata: sourceMetadata
    })
  });
  const version = rows[0];
  if (!version) throw new Error("Could not persist document version.");
  if (!normalizedText) return { versionId: version.id, chunkCount: 0, normalizedTextTruncated };

  await persistDocumentChunks(version.id, normalizedText);
  return { versionId: version.id, chunkCount: chunkText(normalizedText).length, normalizedTextTruncated };
}

/**
 * Idempotently (re-)indexes an already stored official text. This is used
 * when the chunking strategy improves; the raw normalized text remains the
 * immutable source of truth and all chunks keep content hashes.
 */
export async function persistDocumentChunks(documentVersionId: string, normalizedText: string) {
  const chunks = chunkText(normalizedText);
  for (const [index, text] of chunks.entries()) {
    await supabaseRest("parliament.document_chunks?on_conflict=document_version_id,chunk_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        document_version_id: documentVersionId,
        chunk_key: `chunk-${String(index + 1).padStart(4, "0")}`,
        heading_path: "",
        page_or_location: null,
        normalized_text: text,
        content_hash: createHash("sha256").update(text).digest("hex")
      })
    });
  }
  return chunks.length;
}
