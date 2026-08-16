import Link from "next/link";
import { portalTerminology, type PortalTermKey } from "@/lib/presentation/terminology";

export function TermInfoLink({ termKey }: { termKey: PortalTermKey }) {
  const term = portalTerminology[termKey];
  return <Link className="term-info-link" href={`/begriffe#${termKey}`} title={term.description} aria-label={`${term.label} verständlich erklärt`}>i</Link>;
}
