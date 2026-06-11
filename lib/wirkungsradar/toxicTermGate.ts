export type ToxicTermGateResult = {
  passed: boolean;
  blockedTerms: string[];
  requiresLabel: boolean;
  sharepicAllowed: boolean;
  issues: string[];
};

export const ToxicSeedTerms = [
  "Überfremdung",
  "Umvolkung",
  "Bevölkerungsaustausch",
  "Volksverräter",
  "Sozialschmarotzer",
  "Gender-Wahn",
  "Lügenpresse",
  "Kulturmarxismus",
  "Great Reset",
  "Corona-Diktatur",
  "Klimadiktatur",
  "EU-Diktatur",
];

export function toxicTermGate(input: {
  title?: string;
  hook?: string;
  body?: string;
  isClaimOrQuote?: boolean;
  hasFrameShift?: boolean;
  hasPositiveExample?: boolean;
  hasBetterQuestion?: boolean;
  reviewed?: boolean;
}): ToxicTermGateResult {
  const haystack = `${input.title ?? ""} ${input.hook ?? ""} ${input.body ?? ""}`.toLowerCase();
  const blockedTerms = ToxicSeedTerms.filter((term) => haystack.includes(term.toLowerCase()));
  const issues: string[] = [];

  if (!blockedTerms.length) {
    return { passed: true, blockedTerms: [], requiresLabel: false, sharepicAllowed: true, issues: [] };
  }

  if (!input.isClaimOrQuote) issues.push("toxic_term_not_marked_as_claim_or_quote");
  if (!input.hasFrameShift) issues.push("frame_shift_missing");
  if (!input.hasPositiveExample) issues.push("positive_example_missing");
  if (!input.hasBetterQuestion) issues.push("better_question_missing");
  if (input.hook && blockedTerms.some((term) => input.hook?.toLowerCase().includes(term.toLowerCase()))) {
    issues.push("toxic_term_in_export_hook");
  }
  if (input.title && blockedTerms.some((term) => input.title?.toLowerCase().includes(term.toLowerCase())) && !input.title.startsWith("Jemand sagt:")) {
    issues.push("toxic_term_in_title_without_label");
  }

  return {
    passed: issues.length === 0,
    blockedTerms,
    requiresLabel: true,
    sharepicAllowed: Boolean(input.reviewed) && !issues.includes("toxic_term_in_export_hook"),
    issues,
  };
}
