import { parliamentaryCases } from "@/data/cases";

export const revalidate = 900;

const portalUrl = (process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de").replace(/\/$/, "");

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);
}

function rssDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export function GET() {
  const items = parliamentaryCases
    .filter((item) => item.editorialStatus === "PUBLISHED")
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .map((item) => {
      const link = `${portalUrl}/entscheidungen/${item.slug}`;
      const category = item.retrospective ? "WÖk-Rückblick" : "Wirkungscheck";
      const conclusion = item.publishedConclusion ? ` Abschlusseinordnung: ${item.publishedConclusion.summary}` : "";
      return `<item>\n<title>${escapeXml(item.plainTitle)}</title>\n<link>${escapeXml(link)}</link>\n<guid isPermaLink="false">${escapeXml(`${item.slug}:${item.lastUpdated}`)}</guid>\n<pubDate>${rssDate(item.lastUpdated)}</pubDate>\n<category>${category}</category>\n<description>${escapeXml(`${item.summary}${conclusion}`)}</description>\n</item>`;
    })
    .join("\n");

  const updated = items.length > 0
    ? rssDate(parliamentaryCases.filter((item) => item.editorialStatus === "PUBLISHED").sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0].lastUpdated)
    : new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>Wirkungsportal Parlament</title>\n<link>${escapeXml(portalUrl)}</link>\n<description>Neue veröffentlichte Wirkungschecks und abgeschlossene WÖk-Rückblicke des Wirkungsportals Parlament.</description>\n<language>de-DE</language>\n<lastBuildDate>${updated}</lastBuildDate>\n<atom:link href="${escapeXml(`${portalUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>\n${items}\n</channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400"
    }
  });
}
