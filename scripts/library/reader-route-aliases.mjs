import path from "node:path";

/**
 * Öffentliche, dauerhaft unterstützte Reader-Umzüge.
 *
 * Die alten Pfade bleiben als noindex-Weiterleitungen bestehen, damit bereits
 * zitierte Links nicht ins Leere führen. Ihre Namen gehören jedoch nicht mehr
 * in Navigation, Sitemap oder Suchindex.
 */
export const readerRouteAliases = Object.freeze([
  {
    id: "political-standard-public-content-requirements",
    mode: "rename",
    from: "/bibliothek/eintraege/download-or-document-assets-downloads-woek-standard-politische-anschlussfaehigkeit-v0-1-pdf/lesen/07-7-mindestanforderungen-in-codex/",
    to: "/bibliothek/eintraege/download-or-document-assets-downloads-woek-standard-politische-anschlussfaehigkeit-v0-1-pdf/lesen/07-7-mindestanforderungen-fuer-oeffentliche-inhalte/",
    title: "7. Mindestanforderungen für öffentliche Inhalte",
  },
  {
    id: "broken-glossary-reader-fragment",
    mode: "retire",
    from: "/bibliothek/eintraege/leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html/lesen/07-und-codex/",
    to: "/bibliothek/eintraege/leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html/lesen/08-3-der-bewertungsrahmen-sdgs-agenda-2030/",
    predecessor: "/bibliothek/eintraege/leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html/lesen/06-social-media/",
    title: "3. Der Bewertungsrahmen: SDGs, Agenda 2030 und SDG+",
  },
]);

export function readerFileForRoute(root, route) {
  const relative = String(route || "").replace(/^\/+|\/+$/gu, "");
  return path.join(root, relative, "index.html");
}

export function routeSlug(route) {
  return String(route || "").replace(/^\/+|\/+$/gu, "").split("/").at(-1) || "";
}
