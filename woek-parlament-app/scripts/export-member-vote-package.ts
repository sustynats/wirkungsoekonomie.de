import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import { listOfficialNamedVoteSources, parseOfficialNamedVoteWorkbook } from "@/lib/bundestag/named-votes";

const publisher = "Institut für Wirkungsökonomie";
const generatedAt = new Date().toISOString();
const sourceRoot = path.resolve(process.cwd(), ".local/fachbasis-source-release-1.1/02_parlament_28_and_votes");

type VotePosition = "YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE";
type CaseIndexRow = {
  case_id: string;
  decision_object: string;
  review_status: string;
  decision_confirmation: string;
  decision_date: string | null;
  decision_readiness: string;
  vote_status: string;
  roll_call: string;
};
type VoteLayer = {
  status: string;
  roll_call: string;
  date?: string;
  result?: string;
  overall?: { members?: number; total?: number; yes?: number; no?: number; abstain?: number; not_voted?: number };
  factions?: Record<string, string | { members?: number; yes?: number; no?: number; abstain?: number; not_voted?: number }>;
  url?: string;
  note?: string;
  source_note?: string;
  source_conflict?: string;
  individual_records_status?: string;
};

function argument(name: string, fallback: string) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
}

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return `${headers.map(csvCell).join(",")}\n${rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")).join("\n")}\n`;
}

function collectivePosition(value: string | Record<string, number | undefined>) {
  if (typeof value === "string") return value;
  const yes = value.yes ?? 0;
  const no = value.no ?? 0;
  const abstention = value.abstain ?? 0;
  if (yes > no && yes > abstention) return "MAJORITY_YES";
  if (no > yes && no > abstention) return "MAJORITY_NO";
  if (abstention > yes && abstention > no) return "MAJORITY_ABSTENTION";
  return "MIXED_OR_TIED";
}

function normalizedFaction(value: string) {
  if (value === "BÜ90/GR") return "BÜNDNIS 90/DIE GRÜNEN";
  if (value.toLocaleLowerCase("de-DE") === "fraktionslos") return "fraktionslos";
  return value;
}

async function loadJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

async function main() {
  const output = path.resolve(argument("output", path.resolve(process.cwd(), "output/WOEK-PARLAMENT-ABSTIMMUNGSVERHALTEN-28-FAELLE-2026-08-16.zip")));
  const index = await loadJson<{ cases: CaseIndexRow[] }>(path.join(sourceRoot, "case-and-vote-index.json"));
  if (index.cases.length !== 28) throw new Error(`Expected 28 cases, received ${index.cases.length}.`);

  const caseRows = [] as Array<Record<string, unknown>>;
  const factionRows = [] as Array<Record<string, unknown>>;
  const namedCases = [] as Array<{ row: CaseIndexRow; vote: VoteLayer }>;

  for (const row of index.cases) {
    const supplement = await loadJson<{ vote_layer: VoteLayer }>(path.join(sourceRoot, "cases", row.case_id, "decision-and-vote-supplement.json"));
    const vote = supplement.vote_layer;
    caseRows.push({
      case_id: row.case_id,
      decision_object: row.decision_object,
      decision_confirmation: row.decision_confirmation,
      decision_date: row.decision_date,
      vote_status: vote.status,
      roll_call: vote.roll_call,
      result: vote.result ?? null,
      individual_records_available: vote.roll_call === "ROLL_CALL_OFFICIAL",
      individual_records_included: false,
      source_url: vote.url ?? null,
      note: vote.note ?? vote.source_note ?? vote.source_conflict ?? null
    });
    for (const [faction, position] of Object.entries(vote.factions ?? {})) {
      const counts = typeof position === "string" ? {} : position;
      factionRows.push({
        case_id: row.case_id,
        decision_object: row.decision_object,
        decision_date: row.decision_date,
        vote_status: vote.status,
        roll_call: vote.roll_call,
        result: vote.result ?? null,
        faction: normalizedFaction(faction),
        collective_position: collectivePosition(position),
        members: counts.members ?? null,
        yes: counts.yes ?? null,
        no: counts.no ?? null,
        abstention: counts.abstain ?? null,
        did_not_vote: counts.not_voted ?? null,
        source_url: vote.url ?? null,
        evidence_type: typeof position === "string" ? "REPORTED_PARLIAMENTARY_GROUP_POSITION" : "OFFICIAL_ROLL_CALL_AGGREGATE",
        note: vote.note ?? vote.source_note ?? vote.source_conflict ?? null
      });
    }
    if (vote.roll_call === "ROLL_CALL_OFFICIAL") namedCases.push({ row, vote });
  }

  const zip = new JSZip();
  const files = new Map<string, Buffer>();
  const add = (name: string, value: string | Buffer) => {
    const data = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
    files.set(name, data);
    zip.file(name, data);
  };

  add("data/all-28-cases-vote-register.json", json(caseRows));
  add("data/all-28-cases-vote-register.csv", csv(caseRows));
  add("data/parliamentary-group-votes.json", json(factionRows));
  add("data/parliamentary-group-votes.csv", csv(factionRows));

  const namedVoteIndex = [] as Array<Record<string, unknown>>;
  for (const { row, vote } of namedCases) {
    if (!vote.date) throw new Error(`${row.case_id} has no vote date.`);
    const sources = await listOfficialNamedVoteSources(vote.date, vote.date);
    const candidates = sources.filter((source) => /familiennachzug/i.test(source.officialTitle) && /familiennachzug/i.test(row.decision_object));
    if (candidates.length !== 1) throw new Error(`${row.case_id}: expected one exact official named-vote source, received ${candidates.length}.`);
    const source = candidates[0];
    const [xlsxResponse, pdfResponse] = await Promise.all([
      fetch(source.sourceUrl, { cache: "no-store", signal: AbortSignal.timeout(30_000) }),
      fetch(source.resultPdfUrl, { cache: "no-store", signal: AbortSignal.timeout(30_000) })
    ]);
    if (!xlsxResponse.ok || !pdfResponse.ok) throw new Error(`${row.case_id}: official source download failed.`);
    const xlsxArrayBuffer = await xlsxResponse.arrayBuffer();
    const xlsx = Buffer.from(xlsxArrayBuffer);
    const pdf = Buffer.from(await pdfResponse.arrayBuffer());
    const workbook = await parseOfficialNamedVoteWorkbook(source.sourceUrl, xlsxArrayBuffer);
    const individuals = workbook.rows
      .map((member) => ({
        case_id: row.case_id,
        official_vote_id: workbook.externalVoteId,
        vote_date: source.voteDate,
        family_name: member.familyName,
        given_name: member.givenName,
        display_name: `${member.givenName} ${member.familyName}`.trim(),
        parliamentary_group: normalizedFaction(member.parliamentaryGroup ?? "nicht ausgewiesen"),
        actual_vote: member.actualVote,
        source_url: member.sourceUrl
      }))
      .sort((left, right) => left.family_name.localeCompare(right.family_name, "de-DE") || left.given_name.localeCompare(right.given_name, "de-DE"));
    const totals = individuals.reduce((sum, member) => {
      sum[member.actual_vote as VotePosition] += 1;
      return sum;
    }, { YES: 0, NO: 0, ABSTENTION: 0, DID_NOT_VOTE: 0 });
    const expected = vote.overall;
    if (individuals.length !== (expected?.members ?? expected?.total) || totals.YES !== expected?.yes || totals.NO !== expected?.no || totals.ABSTENTION !== expected?.abstain || totals.DID_NOT_VOTE !== expected?.not_voted) {
      throw new Error(`${row.case_id}: official individual rows do not reproduce the supplied official aggregate.`);
    }
    const prefix = `named-votes/${row.case_id}`;
    add(`${prefix}/individual-votes.json`, json(individuals));
    add(`${prefix}/individual-votes.csv`, csv(individuals));
    add(`${prefix}/official-source.xlsx`, xlsx);
    add(`${prefix}/official-result.pdf`, pdf);
    add(`${prefix}/source-manifest.json`, json({
      publisher,
      case_id: row.case_id,
      official_vote_id: workbook.externalVoteId,
      vote_date: source.voteDate,
      official_title: source.officialTitle,
      individual_rows: individuals.length,
      unassignable_rows: workbook.unassignableRows,
      totals,
      sources: [
        { source_type: "OFFICIAL_NAMED_VOTE_XLSX", url: source.sourceUrl, sha256: sha256(xlsx) },
        { source_type: "OFFICIAL_NAMED_VOTE_RESULT_PDF", url: source.resultPdfUrl, sha256: sha256(pdf) },
        { source_type: "OFFICIAL_NAMED_VOTE_INDEX", url: source.sourcePageUrl }
      ]
    }));
    const caseEntry = caseRows.find((candidate) => candidate.case_id === row.case_id);
    if (caseEntry) caseEntry.individual_records_included = true;
    namedVoteIndex.push({ case_id: row.case_id, official_vote_id: workbook.externalVoteId, vote_date: source.voteDate, individual_rows: individuals.length, totals, directory: prefix });
  }

  // Refresh the register after the named-vote import flag has been set.
  files.delete("data/all-28-cases-vote-register.json");
  files.delete("data/all-28-cases-vote-register.csv");
  zip.file("data/all-28-cases-vote-register.json", json(caseRows));
  zip.file("data/all-28-cases-vote-register.csv", csv(caseRows));
  files.set("data/all-28-cases-vote-register.json", Buffer.from(json(caseRows)));
  files.set("data/all-28-cases-vote-register.csv", Buffer.from(csv(caseRows)));
  add("named-votes/index.json", json(namedVoteIndex));

  const votedCases = caseRows.filter((row) => row.vote_status === "VOTED").length;
  const readme = `# Abstimmungsverhalten zu 28 parlamentarischen Fällen\n\n` +
    `Herausgeber: ${publisher}\n\n` +
    `Dieses Paket dokumentiert den parlamentarischen Abstimmungsstand der 28 geprüften Fälle. Es enthält ${votedCases} bereits entschiedene und ${28 - votedCases} noch nicht entschiedene Fälle. Für ${namedVoteIndex.length} exakt passende namentliche Abstimmung enthält es die amtliche Namensliste mit ${namedVoteIndex.reduce((sum, item) => sum + Number(item.individual_rows), 0)} individuellen Datensätzen.\n\n` +
    `## Methodische Grenze\n\n` +
    `Individuelle Stimmen werden ausschließlich aus der amtlichen XLSX-Datei des Deutschen Bundestags übernommen. Bei nicht namentlichen Abstimmungen werden keine individuellen Stimmen rekonstruiert. Fraktionsangaben beschreiben das amtlich dokumentierte parlamentarische Abstimmungsverhalten und sind keine Bewertung von Parteien oder Personen.\n\n` +
    `Dieses Paket enthält noch keine wirkungsökonomische Übereinstimmungsbewertung. Dafür ist je exakter namentlicher Decision Unit zusätzlich eine fachlich freigegebene Ex-ante-Abstimmungsoption erforderlich.\n\n` +
    `## Dateien\n\n` +
    `- \`data/all-28-cases-vote-register.*\`: alle 28 Fälle und Abstimmungsart\n` +
    `- \`data/parliamentary-group-votes.*\`: dokumentiertes Fraktionsverhalten\n` +
    `- \`named-votes/index.json\`: Verzeichnis exakt passender namentlicher Abstimmungen\n` +
    `- \`named-votes/<case-id>/individual-votes.*\`: Namen und individuelle Stimmen\n` +
    `- \`named-votes/<case-id>/official-source.xlsx\`: unveränderte amtliche Quelle\n` +
    `- \`named-votes/<case-id>/source-manifest.json\`: Herkunft, Prüfsummen und Kontrollsummen\n`;
  add("README.md", readme);

  const manifest = {
    schema_version: "1.0.0",
    package_id: "WOEK-PARLAMENT-ABSTIMMUNGSVERHALTEN-28-FAELLE-2026-08-16",
    publisher,
    generated_at: generatedAt,
    cases: 28,
    decided_cases: votedCases,
    pending_cases: 28 - votedCases,
    exact_named_vote_cases: namedVoteIndex.length,
    individual_vote_rows: namedVoteIndex.reduce((sum, item) => sum + Number(item.individual_rows), 0),
    parliamentary_group_rows: factionRows.length,
    privacy_and_integrity: {
      source_scope: "OFFICIAL_PARLIAMENTARY_PUBLIC_DATA",
      non_named_individual_votes_reconstructed: false,
      political_profiles_created: false,
      local_paths_in_package: false
    },
    files: [...files.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([name, data]) => ({ path: name, bytes: data.length, sha256: sha256(data) }))
  };
  zip.file("manifest.json", json(manifest));
  await writeFile(output, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } }));
  console.log(json({ output, ...manifest }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Abstimmungsdatenpaket konnte nicht erzeugt werden.");
  process.exit(1);
});
