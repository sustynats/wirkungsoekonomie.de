/**
 * The public product is named "Wirkungsportal Parlament" deliberately: it
 * is not restricted to the Bundestag. A level describes a presentation and
 * routing scope; individual parliaments remain separate records in the
 * database and are connected to cases through `parliament_id`.
 *
 * Only levels with reviewed, public content may be shown in the public scope
 * navigation. This prevents empty country or EU areas from looking like an
 * already operating source of analyses.
 */
export type ParliamentLevel = {
  key: "BUND" | "LAENDER" | "EU";
  label: string;
  shortLabel: string;
  jurisdictions: readonly string[];
  publicPath: string;
  publicationState: "ACTIVE" | "PREPARING";
};

export const parliamentLevels: readonly ParliamentLevel[] = [
  {
    key: "BUND",
    label: "Bundespolitik",
    shortLabel: "Bund",
    jurisdictions: ["federal"],
    publicPath: "/bevorstehend",
    publicationState: "ACTIVE"
  },
  {
    key: "LAENDER",
    label: "Landespolitik",
    shortLabel: "Länder",
    jurisdictions: ["state"],
    publicPath: "/laender",
    publicationState: "PREPARING"
  },
  {
    key: "EU",
    label: "Europäische Politik",
    shortLabel: "Europa",
    jurisdictions: ["european_union"],
    publicPath: "/europa",
    publicationState: "PREPARING"
  }
] as const;

export function publicParliamentLevels() {
  return parliamentLevels.filter((level) => level.publicationState === "ACTIVE");
}
