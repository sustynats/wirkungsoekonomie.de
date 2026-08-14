import "server-only";

import { createHash } from "node:crypto";

export const AI_MICROTASK_TYPES = [
  "AI_CLASSIFY_BOUNDED",
  "AI_COMPARE_CANDIDATES",
  "AI_IMPACT_LINK_DRAFT",
  "AI_SECOND_ORDER_CANDIDATES",
  "AI_EVIDENCE_CONFLICT_SUMMARY",
  "AI_DIFF_IMPACT_HINT",
  "AI_COUNTERARGUMENT_DRAFT",
  "AI_DATA_GAP_HINT",
  "AI_PLAIN_LANGUAGE_DRAFT"
] as const;

export type AiMicrotaskType = (typeof AI_MICROTASK_TYPES)[number];

export type MinimumContextBlock = {
  id: string;
  content: string;
  whyRequired: string;
  sourceHash?: string;
};

export type AiBudgetConfig = {
  enabled: boolean;
  maxInputTokensPerMicrotask: number;
  maxOutputTokensPerMicrotask: number;
  maxAutomaticMicrotasksPerCase: number;
  maxTotalTokensPerCase: number;
};

export type AiCaseUsage = {
  automaticMicrotasks: number;
  totalTokens: number;
};

export type AiPreflight =
  | { allowed: true; estimatedInputTokens: number; estimatedOutputTokens: number; totalEstimatedTokens: number; cacheKey: string }
  | { allowed: false; code: "EDITORIAL_AI_DISABLED" | "AI_BUDGET_EXCEEDED" | "AI_CONTEXT_INVALID"; reason: string };

const defaults: Omit<AiBudgetConfig, "enabled"> = {
  maxInputTokensPerMicrotask: 1200,
  maxOutputTokensPerMicrotask: 300,
  maxAutomaticMicrotasksPerCase: 3,
  maxTotalTokensPerCase: 4000
};

function positiveEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** Defaults to off.  A shared WÖK-AI provider may only be connected after its
 * source scope, storage behaviour and prompt-injection boundary are approved. */
export function getAiBudgetConfig(): AiBudgetConfig {
  return {
    enabled: process.env.EDITORIAL_AI_ENABLED === "true",
    maxInputTokensPerMicrotask: positiveEnv("AI_MAX_INPUT_TOKENS_PER_MICROTASK", defaults.maxInputTokensPerMicrotask),
    maxOutputTokensPerMicrotask: positiveEnv("AI_MAX_OUTPUT_TOKENS_PER_MICROTASK", defaults.maxOutputTokensPerMicrotask),
    maxAutomaticMicrotasksPerCase: positiveEnv("AI_MAX_AUTOMATIC_MICROTASKS_PER_CASE", defaults.maxAutomaticMicrotasksPerCase),
    maxTotalTokensPerCase: positiveEnv("AI_MAX_TOTAL_TOKENS_PER_CASE", defaults.maxTotalTokensPerCase)
  };
}

/** An explicitly labelled preflight estimate. Provider-reported usage replaces
 * this later in the ledger when the selected shared service supports it. */
export function estimateTokens(value: string) {
  return Math.ceil(value.trim().length / 4);
}

function stableContext(context: MinimumContextBlock[]) {
  return context.map((block) => ({
    id: block.id,
    content: block.content.trim(),
    why_required: block.whyRequired.trim(),
    source_hash: block.sourceHash ?? null
  }));
}

export function createAiCacheKey(input: {
  taskType: AiMicrotaskType;
  context: MinimumContextBlock[];
  candidateOptions: unknown;
  woekReferenceSnapshot: string;
  promptTemplateVersion: string;
  modelVersion: string;
}) {
  return createHash("sha256").update(JSON.stringify({
    task_type: input.taskType,
    context: stableContext(input.context),
    candidate_options: input.candidateOptions,
    woek_reference_snapshot: input.woekReferenceSnapshot,
    prompt_template_version: input.promptTemplateVersion,
    model_version: input.modelVersion
  })).digest("hex");
}

/**
 * Enforces the minimum-context principle before a future shared AI adapter is
 * allowed to send anything.  Document text remains data for the fixed prompt,
 * never instructions.  This function has no model or network dependency.
 */
export function preflightAiMicrotask(input: {
  taskType: AiMicrotaskType;
  question: string;
  context: MinimumContextBlock[];
  candidateOptions: unknown;
  expectedOutputTokens: number;
  woekReferenceSnapshot: string;
  promptTemplateVersion: string;
  modelVersion: string;
  caseUsage: AiCaseUsage;
  config?: AiBudgetConfig;
}): AiPreflight {
  const config = input.config ?? getAiBudgetConfig();
  if (!config.enabled) return { allowed: false, code: "EDITORIAL_AI_DISABLED", reason: "Der redaktionelle KI-Schalter ist deaktiviert." };
  if (!input.question.trim() || !input.context.length || input.context.some((block) => !block.id.trim() || !block.content.trim() || !block.whyRequired.trim())) {
    return { allowed: false, code: "AI_CONTEXT_INVALID", reason: "Jeder Kontextblock braucht Inhalt und eine dokumentierte Erforderlichkeit." };
  }
  const estimatedInputTokens = estimateTokens(JSON.stringify({ question: input.question.trim(), context: stableContext(input.context), candidateOptions: input.candidateOptions }));
  const estimatedOutputTokens = Math.max(1, Math.ceil(input.expectedOutputTokens));
  const totalEstimatedTokens = estimatedInputTokens + estimatedOutputTokens;
  if (
    estimatedInputTokens > config.maxInputTokensPerMicrotask ||
    estimatedOutputTokens > config.maxOutputTokensPerMicrotask ||
    input.caseUsage.automaticMicrotasks >= config.maxAutomaticMicrotasksPerCase ||
    input.caseUsage.totalTokens + totalEstimatedTokens > config.maxTotalTokensPerCase
  ) {
    return { allowed: false, code: "AI_BUDGET_EXCEEDED", reason: "Das konfigurierbare Fall- oder Microtask-Budget würde überschritten. Es wird eine menschliche Aufgabe erzeugt, nicht mehr Kontext gesendet." };
  }
  return {
    allowed: true,
    estimatedInputTokens,
    estimatedOutputTokens,
    totalEstimatedTokens,
    cacheKey: createAiCacheKey(input)
  };
}
