import path from "node:path";

/**
 * Erstellt explizite, dauerhaft pflegbare Aliasrouten für eine zurückgezogene
 * Lesefassung. Die Route-Liste bleibt absichtlich vollständig: Auch einzelne
 * ehemals zitierbare Kapitel-URLs müssen nach dem Rückzug des Volltexts noch
 * zu einer fachlich passenden, aktuellen Einordnung führen.
 */
function retiredReaderRoutes({ id, root, successor, title, routes }) {
  return routes.map((route, index) => ({
    id: `${id}-${index === 0 ? "detail" : `reader-${index}`}`,
    mode: "retire",
    historical: true,
    from: `${root}${route}`,
    to: successor,
    title,
  }));
}

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
  // Die früheren PDF-Transkriptionen enthielten verworfene automatische
  // Personen-, Preis- oder Leistungslogiken. Die PDF-Quellenfassungen bleiben
  // im klar gekennzeichneten Archiv erreichbar; die alten Detail- und
  // Kapiteladressen leiten hingegen direkt zu der aktuellen fachlichen
  // Einordnung. So führen alte Zitate nicht ins Leere und stellen den
  // historischen Volltext zugleich nicht als aktuellen Modellstand dar.
  ...retiredReaderRoutes({
    id: "historical-product-taxation-paper",
    root: "/bibliothek/eintraege/download-or-document-assets-pdf-working-paper-produktbesteuerung-durch-wirkung-pdf/",
    successor: "/wirkungsfelder/produkte-konsum/dossier/",
    title: "Dossier Produkte & Konsum",
    routes: [
      "",
      "lesen/",
      "lesen/00-teil-i-grundlagen/",
      "lesen/01-wirkungsokonomie/",
      "lesen/02-teil-ii-fallstudien/",
      "lesen/03-fallstudien/",
      "lesen/04-teil-ii-fazit-systemische-schlussfolgerung-aus-den/",
      "lesen/05-teil-iii-systemische-wirkung-steuerarchitektur/",
      "lesen/06-teil-iv-die-wirkungsgesellschaft-der/",
      "lesen/07-zukunftsausblick/",
      "lesen/08-teil-v-schlussfolgerung-manifest-der/",
    ],
  }),
  ...retiredReaderRoutes({
    id: "historical-pension-paper",
    root: "/bibliothek/eintraege/download-or-document-public-downloads-originals-wp-rente-pdf/",
    successor: "/wirkungsfelder/rente-soziale-sicherung/",
    title: "Rente & soziale Sicherung",
    routes: [
      "",
      "lesen/",
      "lesen/00-kapitel-5-wirkungsmechanik-im-lebensverlauf/",
      "lesen/01-kapitel-5-zeigt-wie-sich-das-system-uber-ein-ganzes-leben-hi/",
      "lesen/02-kapitel-6-beispielrechnungen-und-systemsimulationen/",
      "lesen/03-kapitel-6-hat-gezeigt-dass-die-wirkungsrente-funktioniert-ma/",
      "lesen/04-kapitel-7-wie-die-wirkungsrente-das-rentenproblem-lost/",
    ],
  }),
]);

export function readerFileForRoute(root, route) {
  const relative = String(route || "").replace(/^\/+|\/+$/gu, "");
  return path.join(root, relative, "index.html");
}

export function routeSlug(route) {
  return String(route || "").replace(/^\/+|\/+$/gu, "").split("/").at(-1) || "";
}
