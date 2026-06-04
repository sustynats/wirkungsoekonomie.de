import { GlossaryRegistry } from "./glossary-registry";

export const GlossaryQualityRules = {
  hoverMaxCharacters: 240,
  shortDefinitionMaxCharacters: 180,
  leadingEffectDefinition: "Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein.",
};

export const GlossaryQualityWarnings = GlossaryRegistry.flatMap((entry) => {
  const warnings: string[] = [];
  if (entry.hoverDefinition.length > GlossaryQualityRules.hoverMaxCharacters) warnings.push("hover_too_long");
  if (entry.shortDefinition.length > GlossaryQualityRules.shortDefinitionMaxCharacters) warnings.push("short_definition_too_long");
  return warnings.map((warning) => ({ slug: entry.slug, warning }));
});
