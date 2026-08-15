import { GlossaryRegistry } from "./glossary-registry";

export const GlossaryRelations = Object.fromEntries(
  GlossaryRegistry.map((entry) => [entry.slug, entry.relatedTerms])
);
