/** One public route tree. No assessment, party or Fachdata enters navigation. */
export type NavigationItem = { label: string; href: string; children?: NavigationItem[] };

export const registerViews = [
  { key: "wirkungsfaelle", label: "Wirkungsfälle" },
  { key: "entscheidungen", label: "Vorgänge und Wirkungschecks" },
  { key: "fachanalysen", label: "WÖk-Fachanalysen" },
  { key: "regierung", label: "Regierungs-Wirkungsanalysen" },
  { key: "eu", label: "EU-Wirkungsfälle" },
] as const;

export const governmentNavigation: NavigationItem[] = [
  ["Regierungsakte", "akte"], ["Wirkungsanalysen", "wirkungsanalysen"],
  ["Kabinett", "kabinett"], ["Ministerien", "ministerien"], ["Ressorts", "ressorts"],
  ["Mandat & Praxis", "mandat-und-praxis"], ["Mandat & Praxis – Dokumente", "mandat-praxis"],
  ["Haushalt & Förderung", "haushalt-foerderung"], ["Umsetzung", "umsetzung"],
  ["Wirkungsmonitor", "wirkungsmonitor"], ["Methodik", "methodik"], ["Transparenz", "transparenz"],
].map(([label, path]) => ({ label, href: `/ebenen/bundesregierung/${path}` }));

export const portalNavigation: NavigationItem[] = [
  { label: "Aktuell", href: "/aktuell", children: [
    { label: "Parlamentsradar", href: "/aktuell/radar" },
    { label: "Im Verfahren", href: "/aktuell/im-verfahren" },
    { label: "Neu veröffentlicht", href: "/aktuell/neu" },
    { label: "Radar per E-Mail", href: "/aktuell/radar-abo" },
  ] },
  { label: "Wirkungsakten", href: "/wirkungsakten" },
  { label: "Wirkungsmonitor", href: "/monitor", children: [
    { label: "Observatorium", href: "/monitor/observatorium" },
    { label: "Reality-Checks", href: "/monitor/reality-checks" },
    { label: "Versprechen & Praxis", href: "/monitor/mandat-und-praxis" },
    { label: "Abstimmungsbilanz", href: "/monitor/abstimmungen" },
    { label: "Wirkungsgedächtnis", href: "/monitor/historie" },
  ] },
  { label: "Bund, Länder & EU", href: "/ebenen", children: [
    { label: "Bundestag", href: "/ebenen/bundestag" },
    { label: "Bundesregierung", href: "/ebenen/bundesregierung", children: governmentNavigation },
    { label: "Bundesländer", href: "/ebenen/laender" },
    { label: "Europäische Union", href: "/ebenen/eu", children: [
      { label: "Europäische Kommission", href: "/ebenen/eu/kommission" },
      { label: "Gesetzgebung", href: "/ebenen/eu/gesetzgebung" },
      { label: "Mandat", href: "/ebenen/eu/mandat" },
      { label: "Wirkungsfälle", href: "/ebenen/eu/wirkungsfaelle" },
    ] },
  ] },
  { label: "Prüfstandard", href: "/pruefstandard", children: [
    { label: "So prüfen wir", href: "/pruefstandard/methodik" },
    { label: "Referenzrahmen", href: "/pruefstandard/referenzrahmen" },
    { label: "Wirkindikatoren", href: "/pruefstandard/wirkindikatoren" },
    { label: "Begriffe", href: "/pruefstandard/begriffe" },
    { label: "Quellenarchiv", href: "/pruefstandard/quellen" },
    { label: "Über uns & Grenzen", href: "/pruefstandard/transparenz" },
  ] },
];

/** Order matters: list exceptions precede complete family moves. */
export const portalRedirects = [
  ["/entscheidungen", "/wirkungsakten?bestand=entscheidungen"],
  ["/wirkungsfaelle", "/wirkungsakten?bestand=wirkungsfaelle"],
  ["/fachakten", "/wirkungsakten?bestand=entscheidungen"],
  ["/fachanalysen", "/wirkungsakten?bestand=fachanalysen"],
  ["/regierung/wirkungsanalysen", "/wirkungsakten?bestand=regierung"],
  ["/eu/wirkungsfaelle", "/wirkungsakten?bestand=eu"],
  ["/ebenen/bundesregierung/wirkungsanalysen", "/wirkungsakten?bestand=regierung"],
  ["/ebenen/eu/wirkungsfaelle", "/wirkungsakten?bestand=eu"],
  ["/bevorstehend", "/aktuell/radar"],
  ["/im-verfahren", "/aktuell/im-verfahren"],
  ["/historie", "/monitor/historie"],
  ["/bundestag", "/ebenen/bundestag"],
  ["/wirkungsobservatorium", "/monitor/observatorium"],
  ["/abstimmungen", "/monitor/abstimmungen"],
  ["/abgeordnete", "/monitor/abstimmungen"],
  ["/methodik", "/pruefstandard/methodik"],
  ["/werkzeuge", "/pruefstandard/methodik#werkzeuge"],
  ["/transparenz", "/pruefstandard/transparenz"],
  ["/begriffe", "/pruefstandard/begriffe"],
  ["/dialog", "/"],
  ["/wirkungsfaelle/:path+", "/wirkungsakten/faelle/:path+"],
  ["/fachanalysen/:path+", "/wirkungsakten/fachanalysen/:path+"],
  ["/fachakten/:path+", "/wirkungsakten/fachakten/:path+"],
  ["/abgeordnete/:path+", "/monitor/abstimmungen/abgeordnete/:path+"],
  ["/abstimmungen/:path+", "/monitor/abstimmungen/:path+"],
  ["/regierung/:path*", "/ebenen/bundesregierung/:path*"],
  ["/laender/:path*", "/ebenen/laender/:path*"],
  ["/eu/:path*", "/ebenen/eu/:path*"],
  ["/mandat-und-praxis/:path*", "/monitor/mandat-und-praxis/:path*"],
  ["/methodik/wirkindikatoren/:path*", "/pruefstandard/wirkindikatoren/:path*"],
  ["/quellen/:path*", "/pruefstandard/quellen/:path*"],
  ["/wirkungsradar-updates/:path*", "/aktuell/radar-abo/:path*"],
  ["/autopilot/status", "/pruefstandard/transparenz/datenbetrieb"],
].map(([source, destination]) => ({ source, destination, permanent: true as const }));

/** Preserve query values and deep-link fragments; external URLs stay external. */
export function canonicalPortalHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://parlament.wirkungsoekonomie.de");
  for (const { source, destination } of portalRedirects) {
    const [prefix, modifier] = source.split("/:path");
    const suffix = url.pathname.slice(prefix.length);
    const matches = modifier === undefined ? url.pathname === source
      : url.pathname === prefix ? modifier === "*" : url.pathname.startsWith(`${prefix}/`);
    if (!matches) continue;
    const target = new URL(destination.replace(/\/:path[+*]/, suffix), url.origin);
    for (const key of new Set(url.searchParams.keys())) {
      // The legacy list determines its own collection; all other filters survive.
      if (target.searchParams.has(key)) continue;
      for (const value of url.searchParams.getAll(key)) target.searchParams.append(key, value);
    }
    if (url.hash) target.hash = url.hash;
    return `${target.pathname}${target.search}${target.hash}`;
  }
  return href;
}

export function activePortalBranch(path: string): NavigationItem | undefined {
  const pathname = canonicalPortalHref(path).split(/[?#]/)[0];
  if (pathname.startsWith("/entscheidungen/")) return portalNavigation[1];
  return portalNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

const segmentLabels: Record<string, string> = {
  abgeordnete: "Abgeordnete", wahl: "Wahl", regierung: "Landesregierung", "mandat-und-praxis": "Versprechen & Praxis",
  wahlprogramme: "Wahlprogramme", quellen: "Quellen", quelle: "Quellen", ziele: "Landesziele",
  faelle: "Wirkungsfälle", fachakten: "Vollständige Fachakten", fachanalysen: "Fachanalysen",
  abmelden: "Abmelden", bestaetigen: "Bestätigen", datenbetrieb: "Datenbetrieb",
};

function flatten(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}
export const allNavigationItems = flatten(portalNavigation);

export function portalBreadcrumbs(path: string): NavigationItem[] {
  const pathname = canonicalPortalHref(path).split(/[?#]/)[0];
  const root = { label: "Startseite", href: "/" };
  if (pathname === "/") return [root];
  if (pathname === "/suche") return [root, { label: "Suche", href: pathname }];
  if (pathname.startsWith("/woek-newsletter/")) return [root, { label: "Newsletter", href: "/aktuell/radar-abo" }, { label: segmentLabels[pathname.split("/").at(-1)!] ?? "Newsletter", href: pathname }];
  const branch = activePortalBranch(pathname);
  if (!branch) return [root, { label: "Seite", href: pathname }];
  const ancestors = allNavigationItems.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (pathname.startsWith("/entscheidungen/")) ancestors.push(branch);
  const items = [root, ...ancestors];
  if (!items.some((item) => item.href === pathname)) {
    const segment = pathname.split("/").at(-1)!;
    const label = segmentLabels[segment] ?? (pathname.includes("/quellen/") ? "Quellendetail" : pathname.includes("/wahlprogramme/") ? "Wahlprogrammanalyse" : pathname.includes("/laender/") && pathname.split("/").length === 4 ? decodeURIComponent(segment).split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join("-") : "Detailansicht");
    items.push({ label, href: pathname });
  }
  return items;
}

export function sectionNavigation(path: string): NavigationItem[] {
  const branch = activePortalBranch(path);
  const nested = branch?.children?.find((item) => item.children && (path === item.href || path.startsWith(`${item.href}/`)));
  return nested?.children ?? branch?.children ?? [];
}
