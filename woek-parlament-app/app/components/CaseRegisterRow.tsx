import type { ParliamentaryCase } from "@/data/cases";
import { CaseCard } from "./CaseCard";

/** Identical content budget and signature in list and card layouts. */
export function CaseRegisterRow({ item }: { item: ParliamentaryCase }) {
  return <CaseCard item={item} variant="row" />;
}
