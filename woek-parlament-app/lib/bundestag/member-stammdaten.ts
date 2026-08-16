import JSZip from "jszip";
import { unstable_cache } from "next/cache";

const officialMemberDataUrl = "https://www.bundestag.de/resource/blob/472878/MdB-Stammdaten.zip";
const officialMembersPage = "https://www.bundestag.de/abgeordnete";

const stateCodes: Record<string, string> = {
  BB: "Brandenburg", BE: "Berlin", BW: "Baden-Württemberg", BY: "Bayern",
  HB: "Bremen", HE: "Hessen", HH: "Hamburg", MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen", NW: "Nordrhein-Westfalen", RP: "Rheinland-Pfalz",
  SH: "Schleswig-Holstein", SL: "Saarland", SN: "Sachsen",
  ST: "Sachsen-Anhalt", TH: "Thüringen"
};

export type OfficialMemberRecord = {
  externalMemberId: string;
  givenName: string;
  familyName: string;
  displayName: string;
  parliamentaryGroup: string | null;
  federalState: string | null;
  constituency: string | null;
  mandateType: string | null;
  officialMemberUrl: string;
};

function decodeXml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").trim();
}

function tag(value: string, name: string) {
  const match = new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i").exec(value);
  return match ? decodeXml(match[1]) : "";
}

function currentTerm(value: string) {
  return [...value.matchAll(/<WAHLPERIODE>([\s\S]*?)<\/WAHLPERIODE>/gi)]
    .map((match) => match[1])
    .find((term) => tag(term, "WP") === "21" && !tag(term, "MDBWP_BIS")) ?? null;
}

function currentGroup(value: string) {
  for (const institution of value.matchAll(/<INSTITUTION>([\s\S]*?)<\/INSTITUTION>/gi)) {
    if (tag(institution[1], "INSART_LANG") === "Fraktion/Gruppe") return tag(institution[1], "INS_LANG") || null;
  }
  return null;
}

function federalState(term: string) {
  const raw = tag(term, "WKR_LAND") || tag(term, "LISTE");
  return stateCodes[raw.replace(/G$/, "").toUpperCase()] ?? null;
}

function memberName(value: string) {
  const names = /<NAMEN>([\s\S]*?)<\/NAMEN>/i.exec(value)?.[1] ?? "";
  const name = /<NAME>([\s\S]*?)<\/NAME>/i.exec(names)?.[1] ?? "";
  const givenName = tag(name, "VORNAME");
  const familyName = tag(name, "NACHNAME");
  const prefix = tag(name, "PRAEFIX");
  const addition = tag(name, "ORTSZUSATZ");
  const title = tag(name, "ANREDE_TITEL") || tag(name, "AKAD_TITEL");
  return { givenName, familyName, displayName: [title, givenName, prefix, familyName, addition].filter(Boolean).join(" ") };
}

/** Parses the Bundestag’s official XML export without resolving external XML
 * entities. Portraits are intentionally not read or imported here. */
export async function fetchOfficialCurrentMembers() {
  const response = await fetch(officialMemberDataUrl, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Official member data request failed with ${response.status}.`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > 20 * 1024 * 1024) throw new Error("Official member data archive has an invalid size.");
  const zip = await JSZip.loadAsync(bytes);
  const xmlFile = Object.values(zip.files).find((file) => !file.dir && /MDB_STAMMDATEN\.XML$/i.test(file.name));
  if (!xmlFile) throw new Error("Official member data archive has no member XML.");
  const xml = await xmlFile.async("text");
  const members = [] as OfficialMemberRecord[];
  for (const match of xml.matchAll(/<MDB>([\s\S]*?)<\/MDB>/gi)) {
    const term = currentTerm(match[1]);
    if (!term) continue;
    const name = memberName(match[1]);
    const externalMemberId = tag(match[1], "ID");
    if (!externalMemberId || !name.givenName || !name.familyName) continue;
    members.push({
      externalMemberId,
      givenName: name.givenName,
      familyName: name.familyName,
      displayName: name.displayName,
      parliamentaryGroup: currentGroup(term),
      federalState: federalState(term),
      constituency: tag(term, "WKR_NAME") || null,
      mandateType: tag(term, "MANDATSART") || null,
      officialMemberUrl: officialMembersPage
    });
  }
  return members.sort((left, right) => left.displayName.localeCompare(right.displayName, "de-DE"));
}

/** Cache the official public roster so the large XML archive is not fetched
 * and parsed for every public profile request. */
export const fetchOfficialCurrentMembersCached = unstable_cache(
  fetchOfficialCurrentMembers,
  ["bundestag-current-members-wp21-active-v2"],
  { revalidate: 86_400, tags: ["bundestag-current-members"] }
);

export function normalizedMemberName(familyName: string, givenName: string) {
  return `${familyName}|${givenName}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}|]+/gu, "").toLocaleLowerCase("de-DE");
}

export function memberSlug(member: Pick<OfficialMemberRecord, "externalMemberId" | "displayName">) {
  const base = member.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `${base}-${member.externalMemberId}`;
}
