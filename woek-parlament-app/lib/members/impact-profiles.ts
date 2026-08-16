import decisionProfileData from "@/data/wirkungsprofile/decision-impact-profiles.json";
import factionProfileData from "@/data/wirkungsprofile/faction-impact-profiles.json";
import memberProfileData from "@/data/wirkungsprofile/member-impact-profiles.json";
import workingActData from "@/data/public-working-acts.json";
import { normalizedMemberName } from "@/lib/bundestag/member-stammdaten";
import type { PublicCalculationRequirement } from "@/data/cases";

export const impactDimensions = ["Mensch", "Planet", "Demokratie"] as const;
export const impactDirections = ["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "NEUTRAL", "AMBIVALENT", "OPEN", "NOT_APPLICABLE"] as const;

export type ImpactDimension = typeof impactDimensions[number];
export type ImpactDirection = typeof impactDirections[number];

export type DomainImpactProfile = {
  direction: ImpactDirection;
  path_direction_counts: Partial<Record<ImpactDirection, number>>;
  path_ids: string[];
  open_path_count: number;
  material_path_count: number;
};

export type DecisionDomainProfile = Record<ImpactDimension, DomainImpactProfile>;

export type ImpactCountBucket = Record<ImpactDimension, {
  decision_classification_counts: Partial<Record<ImpactDirection, number>>;
  direction_incidence_counts: Partial<Record<ImpactDirection, number>>;
}>;

export type MemberImpactDecision = {
  case_id: string;
  official_vote_id: string;
  decision_object: string;
  decision_date: string;
  official_vote: "YES" | "NO" | "ABSTENTION" | "DID_NOT_VOTE";
  relation: "SUPPORTED" | "REJECTED" | "ABSTAINED" | "DID_NOT_VOTE";
  decision_domain_profile: DecisionDomainProfile;
  non_compensable_boundaries: string[];
  source_url: string;
  interpretation: string;
};

export type MemberImpactProfile = {
  schema: "woek.parliament.member-impact-profile.v1.1";
  member: {
    member_id: string | null;
    name: string;
    family_name: string;
    given_name: string;
    faction_at_vote: string;
    match_status: string;
    profile_source_key: string;
  };
  coverage: {
    eligible_wok_roll_calls_in_current_28_case_set: number;
    official_member_vote_records_ingested: number;
    participated_votes: number;
    minimum_for_stable_summary: number;
    coverage_status: "VERY_LOW" | "LOW" | "SUFFICIENT" | string;
  };
  summary: {
    decision_relation_counts: Record<"SUPPORTED" | "REJECTED" | "ABSTAINED" | "DID_NOT_VOTE", number>;
    supported_decision_impact_profile: ImpactCountBucket;
    rejected_decision_impact_profile: ImpactCountBucket;
  };
  decisions: MemberImpactDecision[];
  profile_meaning: string;
  no_person_score: true;
  no_ranking: true;
  no_faction_vote_inference: true;
};

export type FactionImpactDecision = {
  case_id: string;
  decision_object: string;
  decision_date: string;
  collective_position: "YES" | "NO" | "ABSTAIN" | "MAJORITY_YES" | "MAJORITY_NO" | "MIXED_OR_TIED";
  relation: "SUPPORTED" | "REJECTED" | "ABSTAINED" | "MIXED";
  evidence_type: "REPORTED_PARLIAMENTARY_GROUP_POSITION" | "OFFICIAL_ROLL_CALL_AGGREGATE";
  roll_call: string;
  result: string;
  members: number | null;
  yes: number | null;
  no: number | null;
  abstention: number | null;
  did_not_vote: number | null;
  decision_domain_profile: DecisionDomainProfile;
  non_compensable_boundaries: string[];
  source_url: string;
  interpretation: string;
};

export type FactionImpactProfile = {
  schema: "woek.parliament.faction-impact-profile.v1";
  faction: { name: string };
  scope: {
    parliament: string;
    case_set: string;
    voted_cases_in_case_set: number;
    documented_faction_positions: number;
    data_as_of: string;
  };
  summary: {
    decision_relation_counts: Partial<Record<"SUPPORTED" | "REJECTED" | "ABSTAINED", number>>;
    supported_decision_impact_profile: ImpactCountBucket;
    rejected_decision_impact_profile: ImpactCountBucket;
    abstained_decision_impact_profile: ImpactCountBucket;
    mixed_decision_impact_profile: ImpactCountBucket;
  };
  decisions: FactionImpactDecision[];
  profile_meaning: string;
  no_faction_score: true;
  no_ranking: true;
  no_individual_vote_inference: true;
};

export type DecisionImpactProfile = {
  schema: "woek.parliament.decision-impact-profile.v1.1";
  case_id: string;
  decision: {
    object: string;
    date: string | null;
    parliamentary_status: string;
    actual_outcome: string | null;
    final_version: string | null;
    confirmation_status: string;
    source_ids: string[];
  };
  decision_domain_profile: DecisionDomainProfile;
  corrected_impact_paths: Array<{
    path_id: string;
    split_from?: string;
    lever?: string;
    hypothesis: string;
    direction: ImpactDirection;
    affected_mpd_dimensions: ImpactDimension[];
    affected_groups?: string[];
    normative_target_areas?: string[];
    prerequisites?: string[];
    risks_and_side_effects?: string[];
    change_lever_for_positive_net_impact?: string;
    evidence_boundary?: string;
    evidence_status: string;
  }>;
  non_compensable_boundaries: string[];
};

type WorkingActIndexEntry = { slug: string; fachakteId?: string; publicWorkingAct?: { reviewDetail?: { calculations?: PublicCalculationRequirement[] } } };

const memberProfiles = memberProfileData as MemberImpactProfile[];
const factionProfiles = factionProfileData as FactionImpactProfile[];
const decisionProfiles = decisionProfileData as DecisionImpactProfile[];

const memberBySourceKey = new Map(memberProfiles.map((profile) => [profile.member.profile_source_key, profile]));
const memberByNormalizedName = new Map(memberProfiles.map((profile) => [normalizedMemberName(profile.member.family_name, profile.member.given_name), profile]));
const factionSlugByName = new Map<string, string>([["CDU/CSU", "cdu-csu"], ["SPD", "spd"], ["AfD", "afd"], ["B90/Grüne", "gruene"], ["Die Linke", "linke"]]);
const factionBySlug = new Map(factionProfiles.map((profile) => [factionSlugByName.get(profile.faction.name) ?? profile.faction.name.toLocaleLowerCase("de-DE"), profile]));
const decisionByCaseId = new Map(decisionProfiles.map((profile) => [profile.case_id, profile]));
const indexedWorkingActs = workingActData as unknown as WorkingActIndexEntry[];
const decisionSlugByCaseId = new Map(indexedWorkingActs.flatMap((item) => {
  const caseId = item.fachakteId?.replace(/^case-/, "");
  return caseId ? [[caseId, item.slug] as const] : [];
}));
const decisionCalculationsByCaseId = new Map(indexedWorkingActs.flatMap((item) => {
  const caseId = item.fachakteId?.replace(/^case-/, "");
  return caseId ? [[caseId, item.publicWorkingAct?.reviewDetail?.calculations ?? []] as const] : [];
}));

export function listMemberImpactProfiles() {
  return memberProfiles;
}

export function getMemberImpactProfileBySourceKey(sourceKey: string) {
  return memberBySourceKey.get(sourceKey) ?? null;
}

export function getMemberImpactProfileByOfficialName(familyName: string, givenName: string) {
  return memberByNormalizedName.get(normalizedMemberName(familyName, givenName)) ?? null;
}

export function listFactionImpactProfiles() {
  return [...factionBySlug].map(([slug, profile]) => ({ slug, profile })).sort((left, right) => left.profile.faction.name.localeCompare(right.profile.faction.name, "de-DE"));
}

export function getFactionImpactProfile(slug: string) {
  return factionBySlug.get(slug) ?? null;
}

export function getDecisionImpactProfile(caseId: string) {
  return decisionByCaseId.get(caseId) ?? null;
}

export function getDecisionCalculations(caseId: string) {
  return decisionCalculationsByCaseId.get(caseId) ?? [];
}

export function decisionHref(caseId: string) {
  const slug = decisionSlugByCaseId.get(caseId);
  return slug ? `/entscheidungen/${slug}` : `/fachakten/case-${caseId}`;
}

export function factionHref(name: string) {
  const slug = factionSlugByName.get(name);
  return slug ? `/fraktionen/${slug}` : "/fraktionen";
}

export function impactDirectionLabel(value: ImpactDirection) {
  return ({
    POSITIVE_POTENTIAL: "positives Wirkungspotenzial",
    NEGATIVE_RISK: "negatives Wirkungsrisiko",
    NEUTRAL: "neutral",
    AMBIVALENT: "gegenläufige Potenziale und Risiken",
    OPEN: "Richtung offen",
    NOT_APPLICABLE: "kein materieller Bezug"
  } satisfies Record<ImpactDirection, string>)[value];
}

export function isImpactDimension(value: string | undefined): value is ImpactDimension {
  return Boolean(value && impactDimensions.includes(value as ImpactDimension));
}

export function isImpactDirection(value: string | undefined): value is ImpactDirection {
  return Boolean(value && impactDirections.includes(value as ImpactDirection));
}
