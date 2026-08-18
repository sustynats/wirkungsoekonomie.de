import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";

export type DeliverySlot = "AM" | "PM";
export type DeltaType = "NEW" | "UPDATED" | "STATUS_CHANGED" | "VOTE_ADDED" | "VOTE_CORRECTED" | "SOURCE_ADDED" | "SOURCE_CHANGED" | "RELATIONSHIP_CHANGED" | "WITHDRAWN" | "SUPERSEDED";
export type CandidateClass = "EFFECT_BEARING_CANDIDATE" | "FACT_ONLY_LIFECYCLE" | "VOTE_ONLY_UPDATE" | "NO_INDEPENDENT_EFFECT_OBJECT" | "OPEN_DATA_ISSUE";

export type VoteEventExport = {
  vote_event_id: string;
  parliamentary_case_id: string | null;
  date: string;
  question_official: string;
  vote_type: string;
  result: { yes: number | null; no: number | null; abstain: number | null; other: number | null; [key: string]: unknown };
  source_refs: string[];
};

export type IndividualVoteExport = {
  vote_event_id: string;
  mp_id: string;
  vote: "JA" | "NEIN" | "ENTHALTUNG" | "NICHT_TEILGENOMMEN" | "NICHT_ABGEGEBEN" | "SONSTIGER_AMTLICHER_STATUS";
  source_ref: string;
};

export type VerifiedPublicChange = {
  title: string;
  summary: string;
  url: string;
  section: "WIRKUNGSANALYSE" | "REALITY_CHECK" | "ABSTIMMUNG" | "LEBENSZYKLUS" | "KORREKTUR";
  topics: Array<"ALL_UPDATES" | "UPCOMING_DECISIONS" | "PUBLISHED_CHECKS" | "CORRECTIONS" | "HEALTH_CARE" | "HOUSING" | "WORK_AND_SKILLS" | "CLIMATE_AND_ENERGY" | "DEMOCRACY_AND_DIGITAL">;
};

export type ParliamentDeliveryLedgerEntry = {
  id: string;
  hash: string;
  created_at: string;
  processed_at: string | null;
  status: "READY" | "REVIEWED" | "DEPLOYED" | "BLOCKED" | "CONTENT_CHANGED_AFTER_HANDOFF";
  commit: string | null;
  deployment: string | null;
  cursor_after: string;
};

export type ParliamentReviewLedgerEntry = {
  id: string;
  filename: string;
  hash: string;
  created_at: string;
  processed_at: string | null;
  status: "APPROVED" | "BLOCKED" | "CONTENT_CHANGED_AFTER_HANDOFF";
  commit: string | null;
  deployment: string | null;
};

export type ParliamentDailyLedger = {
  schema_version: "1.0";
  deliveries: ParliamentDeliveryLedgerEntry[];
  fachreviews: ParliamentReviewLedgerEntry[];
  deployments: Array<{
    id: string;
    approval_id: string;
    requested_at: string;
    status: "REQUESTED" | "VERIFIED" | "FAILED";
    expected_public_hash: string;
    deployment: string | null;
    commit: string | null;
    public_items?: VerifiedPublicChange[];
    digest_status?: "PENDING" | "SENT" | "FAILED";
  }>;
};

export type DeployApproval = {
  review_id: string;
  input_delivery_id: string;
  input_hash: string;
  created_at: string;
  approved_object_ids: string[];
  excluded_object_ids?: string[];
  notes?: string | null;
};

export type DeliveryFile = { name: string; content: string; sha256: string; records: number | null };

function schema(name: string) {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "parliament", "daily", "contracts", name), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateVoteEvent = ajv.compile<VoteEventExport>(schema("vote-event.schema.json"));
const validateIndividualVote = ajv.compile<IndividualVoteExport>(schema("individual-vote.schema.json"));
const validateDeployApproval = ajv.compile<DeployApproval>(schema("deploy-approval.schema.json"));

export function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

export function emptyParliamentDailyLedger(): ParliamentDailyLedger {
  return { schema_version: "1.0", deliveries: [], fachreviews: [], deployments: [] };
}

export function berlinDateSlot(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const hour = Number(parts.hour);
  const slot: DeliverySlot | null = hour === 6 ? "AM" : hour === 16 ? "PM" : null;
  return { date, hour, slot };
}

function messages(errors: ErrorObject[] | null | undefined) {
  return (errors ?? []).map((error) => `${error.instancePath || "/"}: ${error.message ?? error.keyword}`);
}

export function validateVoteEvents(records: VoteEventExport[]) {
  return records.flatMap((record, index) => {
    const voteEventId = record.vote_event_id;
    return validateVoteEvent(record) ? [] : [{ index, vote_event_id: voteEventId, errors: messages(validateVoteEvent.errors) }];
  });
}

export function validateIndividualVotes(records: IndividualVoteExport[]) {
  return records.flatMap((record, index) => {
    const voteEventId = record.vote_event_id;
    const memberId = record.mp_id;
    return validateIndividualVote(record) ? [] : [{ index, vote_event_id: voteEventId, mp_id: memberId, errors: messages(validateIndividualVote.errors) }];
  });
}

export function parseDeployApproval(content: string) {
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch (error) {
    return { value: null, errors: [`Ungültiges JSON: ${error instanceof Error ? error.message : "Parsefehler"}`] };
  }
  if (!validateDeployApproval(value)) return { value: null, errors: messages(validateDeployApproval.errors) };
  return { value, errors: [] };
}

export function assertNoChangedHash(filename: string, hash: string, previous: Array<{ filename: string; hash: string }>) {
  const match = previous.find((entry) => entry.filename === filename);
  if (match && match.hash !== hash) throw new Error(`CONTENT_CHANGED_AFTER_HANDOFF: ${filename}`);
  return Boolean(match);
}

export function normalizeOfficialVote(value: string): IndividualVoteExport["vote"] {
  const mapping: Record<string, IndividualVoteExport["vote"]> = {
    YES: "JA",
    NO: "NEIN",
    ABSTENTION: "ENTHALTUNG",
    DID_NOT_VOTE: "NICHT_ABGEGEBEN",
  };
  return mapping[value] ?? "SONSTIGER_AMTLICHER_STATUS";
}

export function jsonl(values: unknown[]) {
  return values.map((value) => JSON.stringify(value)).join("\n") + (values.length ? "\n" : "");
}

export function deliveryFile(name: string, content: string, records: number | null = null): DeliveryFile {
  return { name, content, sha256: sha256(content), records };
}

export function deliveryPackageHash(files: DeliveryFile[]) {
  return sha256(files.slice().sort((a, b) => a.name.localeCompare(b.name)).map((file) => `${file.name}:${file.sha256}`).join("\n"));
}

export function isExAnteLanguageSafe(content: string) {
  const forbidden = /\b(?:bewirkt|führt\s+(?:unmittelbar\s+)?zu|hat\b[^.!?\n]{0,120}\b(?:verbessert|reduziert))\b/i;
  return !forbidden.test(content);
}

export function hasForbiddenImpactFields(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const forbidden = new Set(["impact_direction", "sdg_direction", "sdg_plus_direction", "mpd_direction", "net_impact", "positive_effect", "negative_effect", "democracy_score", "person_score", "party_score", "minister_score"]);
  const stack: unknown[] = [value];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    for (const [key, child] of Object.entries(current)) {
      if (forbidden.has(key)) return true;
      if (child && typeof child === "object") stack.push(child);
    }
  }
  return false;
}
