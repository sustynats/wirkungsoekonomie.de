import { getPublicationSource } from "@/lib/publication/fachakten";
import { escapeHtml, renderPublicationMarkdown } from "@/lib/publication/markdown-renderer";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";

export const dynamic = "force-dynamic";

function localReturnPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

function publicTitle(source: NonNullable<Awaited<ReturnType<typeof getPublicationSource>>>) {
  if (source.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW" || source.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER") {
    const programme = saxonyAnhaltElectionProgrammes.find((entry) => entry.sourceKey === source.sourceKey);
    if (programme) return `${programme.party} · ${source.kind === "SAXONY_ANHALT_COMMITMENT_REGISTER" ? "Zusageregister" : "Wirkungsakte"}`;
  }
  if (source.kind === "FEDERAL_ELECTION_PROGRAMME" || source.kind === "COALITION_AGREEMENT") {
    const programme = politicalSourceCatalog.find((entry) => entry.sourceKey === source.sourceKey);
    if (programme) return `${programme.actor} · ${programme.sourceType === "COALITION_AGREEMENT" ? "Koalitionsvertrag" : "Wahlprogramm"}`;
  }
  return source.title;
}

function overviewSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const summary = (value as Record<string, unknown>).summary;
  return typeof summary === "string" ? summary.trim() : "";
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const source = await getPublicationSource((await params).id);
  if (!source) return new Response("Nicht gefunden", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });

  const rendered = renderPublicationMarkdown(source.markdown);
  const toc = rendered.toc.length ? `<nav class="toc" aria-label="Inhaltsverzeichnis"><strong>Direkt zu einem Kapitel</strong><ol>${rendered.toc.map((entry) => `<li class="${entry.level > 2 ? "nested" : ""}"><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.text)}</a></li>`).join("")}</ol></nav>` : "";
  const sourceRecords = source.sourceRecords.map((record) => `<li><strong>${escapeHtml(record.kind)}</strong>: ${escapeHtml(record.sha256)}</li>`).join("");
  const title = escapeHtml(publicTitle(source));
  const summary = overviewSummary(source.overview);
  const back = escapeHtml(localReturnPath(source.renderedRoute));
  const document = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,follow" />
  <title>${title} · Vollständige Fachakte</title>
  <link rel="stylesheet" href="/fachakte.css" />
</head>
<body>
  <a class="skip-link" href="#fachtext">Zum Fachtext springen</a>
  <header class="document-header"><div class="shell"><a class="brand" href="/">Wirkungsportal Parlament</a><a class="back-link" href="${back}">← Zur Einordnung</a></div></header>
  <main class="shell" id="fachtext">
    <p class="eyebrow">Vollständige Fachakte · Institut für Wirkungsökonomie</p>
    <h1>${title}</h1>
    <p class="lead">${escapeHtml(summary || "Diese Lesefassung enthält den vollständigen freigegebenen Fachtext. Sie lässt keine Wirkpfade, Datenlücken, Quellen oder Einschränkungen weg.")}</p>
    <dl class="provenance"><div><dt>Fachstand</dt><dd>${escapeHtml(formatDate(source.verifiedAt))}</dd></div><div><dt>Referenzstand</dt><dd>WÖk-Begriffsleitfaden v${escapeHtml(source.terminologyVersion)}</dd></div><div><dt>Fachliche Inhaltspfade</dt><dd>${source.suppliedContentPathsCount.toLocaleString("de-DE")}</dd></div></dl>
    ${toc}
    <article class="publication-source-body">${rendered.html}</article>
    <footer class="source-footer"><p><strong>Nachweis der Fassung:</strong> SHA-256 ${escapeHtml(source.markdownSha256)}</p><ul>${sourceRecords}</ul><p><a href="${back}">← Zur Einordnung dieser Fachakte</a></p></footer>
  </main>
</body>
</html>`;
  return new Response(document, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
