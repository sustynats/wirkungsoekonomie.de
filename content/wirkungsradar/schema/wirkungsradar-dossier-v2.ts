export type WirkungsradarStatusV2 =
  | "draft"
  | "draft_incomplete"
  | "draft_missing_positive_example"
  | "draft_example_amplifies_frame"
  | "draft_dehumanization_risk"
  | "draft_not_maus_mode"
  | "draft_problem_first"
  | "draft_bad_counterquestion"
  | "draft_linear"
  | "draft_missing_sources"
  | "draft_energy_architecture_error"
  | "draft_core_error"
  | "checked_v2_positive_examples";

export type WirkungsradarDossierV2 = {
  slug: string;
  title: string;
  claim: string;
  claimVariants: string[];
  topicCluster: string[];
  status: WirkungsradarStatusV2;
  cockpit: {
    shortJudgement: string;
    sayThisNow: string;
    positiveExample: {
      title: string;
      text: string;
      whatGetsBetter: string[];
      hostLine: string;
      whyItWorks?: string;
      avoidFrameTerms?: string[];
    };
    betterQuestion: string;
    frameShift: {
      oldFrame: string;
      whatItShouldTrigger?: string[];
      whyProblematic: string;
      doNotAnswer: string[];
      betterAnswer: string;
      whyBetter: string;
    };
  };
  explain: {
    whatIsTrue: string[];
    whatIsMissing: string[];
    simpleMechanism: string;
  };
  impactFan: {
    title?: string;
    dimensions: {
      label: string;
      sentence: string;
      example?: string;
      icon?: string;
    }[];
  };
  psychologyLite: {
    title?: string;
    items: {
      simple: string;
      technical?: string;
      debateEffect: string;
      howToBypass: string;
    }[];
  };
  consequenceStack: {
    title?: string;
    order1: { label: "Sofort"; text: string };
    order2: { label: "Danach"; text: string };
    order3: { label: "Auf Dauer"; text: string };
  };
  solution: {
    plainLanguage: string;
    measures: { title: string; text: string }[];
  };
  trustBlock: {
    dataStand: string;
    sicher: string[];
    unsicherOderPruefpflichtig: string[];
    bilanzgrenze: string;
    gegenposition?: string;
  };
  sources: {
    label: string;
    url: string;
    useFor: string[];
    warning?: string;
  }[];
  internalLinks: {
    glossary?: string[];
    narratives?: string[];
    relatedDossiers?: string[];
    woek?: string[];
  };
  deepDive?: {
    sections: { title: string; body: string }[];
  };
  quality: {
    hasPositiveExample: boolean;
    hasFrameShift: boolean;
    hasBetterQuestion: boolean;
    hasImpactFan: boolean;
    hasPsychologyLite: boolean;
    hasConsequenceStack: boolean;
    hasSolution: boolean;
    hasTrustBlock: boolean;
    hasSources: boolean;
    jargonCountInCockpit: number;
    hostileFrameTermCountInExample: number;
    lastReviewed: string;
  };
};
