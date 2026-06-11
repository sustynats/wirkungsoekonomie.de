export type DistributionPack = {
  dossierSlug: string;
  status: "draft" | "ready" | "needs_review" | "blocked_frame_risk" | "published";
  platformAssets: {
    comment?: CommentAsset;
    live?: LiveAsset;
    tiktok?: TikTokAsset;
    instagram?: InstagramCarouselAsset;
    sharepic?: SharepicAsset;
    newsletter?: NewsletterAsset;
    workshop?: WorkshopAsset;
    embed?: EmbedAsset;
    classroom?: ClassroomAsset;
  };
  safety: {
    avoidsFrameAmplification: boolean;
    usesPositiveExample: boolean;
    avoidsDehumanization: boolean;
    includesBetterQuestion: boolean;
    includesSourceHint: boolean;
    noUnverifiedNumbers: boolean;
    noRageHook: boolean;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    generatedFromDossierVersion: string;
    reviewedBy?: string;
    lastReviewed?: string;
  };
};

export type CommentAsset = {
  text: string;
  maxChars: number;
  copyLabel: string;
};

export type LiveAsset = {
  short: string;
  medium: string;
  long: string;
};

export type TikTokAsset = {
  title: string;
  hook: string;
  script30s: string;
  script60s: string;
  script90s?: string;
  onScreenText: string[];
  caption: string;
  hashtags: string[];
  doNotSay: string[];
};

export type InstagramCarouselAsset = {
  title: string;
  slides: {
    headline: string;
    body: string;
    visualHint?: string;
  }[];
  caption: string;
  altText: string;
};

export type SharepicAsset = {
  title: string;
  subtitle: string;
  mainLine: string;
  betterQuestion: string;
  sourceNote: string;
  altText: string;
};

export type NewsletterAsset = {
  subject: string;
  preheader: string;
  intro: string;
  mainBlock: string;
  goodImage: string;
  betterQuestion: string;
  sourceBlock: string;
  cta: string;
};

export type WorkshopAsset = {
  title: string;
  durationMinutes: number;
  goal: string;
  materials: string[];
  flow: {
    step: string;
    minutes: number;
    instructions: string;
  }[];
  handoutText: string;
};

export type EmbedAsset = {
  widgetTitle: string;
  compactAnswer: string;
  betterQuestion: string;
  iframePath: string;
};

export type ClassroomAsset = {
  gradeLevel?: string;
  learningGoal: string;
  impulseQuestion: string;
  exercise: string;
  reflection: string;
};
