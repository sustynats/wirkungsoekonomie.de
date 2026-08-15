import { portalTerminology, type PortalTermKey } from "@/lib/presentation/terminology";

export function GlossaryBasics({ termKeys, title = "Begriffe im Check" }: { termKeys: PortalTermKey[]; title?: string }) {
  const uniqueTerms = [...new Set(termKeys)].map((termKey) => portalTerminology[termKey]);
  return (
    <aside className="glossary-basics" aria-labelledby="glossary-basics-title">
      <div className="glossary-basics-heading">
        <p className="eyebrow">Kurz nachschlagen</p>
        <h2 id="glossary-basics-title">{title}</h2>
      </div>
      <dl>
        {uniqueTerms.map((term) => <div key={term.label}><dt>{term.label}</dt><dd>{term.description}</dd></div>)}
      </dl>
      <Link href="/begriffe">Alle Begriffe der Wirkungsökonomie <span aria-hidden="true">→</span></Link>
    </aside>
  );
}
import Link from "next/link";
