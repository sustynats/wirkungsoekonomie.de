// Editorial normalization must never rewrite executable code, URLs or examples.
export function normalizePublicPunctuation(text, extension) {
  const replace = (part) => part.replaceAll(String.fromCharCode(0x2014), "-");
  if ([".html", ".inc"].includes(extension)) {
    return text.replace(/<!--[\s\S]*?-->|<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*>|[^<]+/gi,
      (part) => part.startsWith("<") ? part : replace(part));
  }
  if ([".md", ".txt"].includes(extension)) {
    return text.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`|https?:\/\/[^\s)]+)/g)
      .map((part, index) => index % 2 ? part : replace(part)).join("");
  }
  return text;
}
