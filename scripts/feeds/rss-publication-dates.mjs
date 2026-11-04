// A fresh checkout/build timestamp must not republish an existing undated item.
// Read only the simple RSS item fields emitted by build-rss-feeds.mjs.
export function previousPublicationDates(xml) {
  if (typeof xml !== "string" || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error("RSS_HISTORY_INVALID");
  }
  const body = xml.trim().replace(/^<\?xml[^?]*\?>\s*/, "");
  if (!/^<rss\b[^>]*>\s*<channel\b[^>]*>[\s\S]*<\/channel>\s*<\/rss>$/.test(body) ||
      (body.match(/<channel\b/g) || []).length !== 1) {
    throw new Error("RSS_HISTORY_INVALID");
  }
  const decode = value => {
    const text = value.trim();
    const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(text);
    if (cdata) return cdata[1];
    if (/[<>]/.test(text) || /&(?!#x[0-9a-f]+;|#\d+;|amp;|lt;|gt;|quot;|apos;)/i.test(text)) {
      throw new Error("RSS_HISTORY_ENTITY_INVALID");
    }
    return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
      const named = {amp: "&", lt: "<", gt: ">", quot: '"', apos: "'"};
      if (!entity.startsWith("#")) return named[entity.toLowerCase()];
      const n = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isInteger(n) || n <= 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) {
        throw new Error("RSS_HISTORY_ENTITY_INVALID");
      }
      return String.fromCodePoint(n);
    });
  };
  const dates = new Map();
  const items = [...body.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)];
  if (items.length !== (body.match(/<item\b/g) || []).length ||
      items.length !== (body.match(/<\/item>/g) || []).length) {
    throw new Error("RSS_HISTORY_ITEM_INVALID");
  }
  for (const item of items) {
    const fields = name => [...item[1].matchAll(new RegExp("<" + name + "\\b[^>]*>([\\s\\S]*?)<\\/" + name + ">", "g"))];
    const guids = fields("guid"), published = fields("pubDate");
    if (guids.length !== 1 || published.length !== 1) throw new Error("RSS_HISTORY_ITEM_INVALID");
    const guid = decode(guids[0][1]), date = new Date(decode(published[0][1]));
    if (!guid || Number.isNaN(date.getTime()) || dates.has(guid)) throw new Error("RSS_HISTORY_ITEM_INVALID");
    dates.set(guid, date);
  }
  return dates;
}

export function publicationDate(candidates, previousDate, fileMtime) {
  for (const candidate of candidates) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  for (const fallback of [previousDate, fileMtime]) {
    if (fallback instanceof Date && !Number.isNaN(fallback.getTime())) return new Date(fallback.getTime());
  }
  throw new Error("RSS_PUBLICATION_DATE_UNAVAILABLE");
}
