import type { PublicNormativeMapping } from "@/data/cases";
import { questionCoverage, verifiedProcedureSteps, type ReviewedQuestion, type OfficialProcedureStep } from "@/lib/presentation/decision-depth";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";

export function ReferenceChips({ mapping, slug }: { mapping?: PublicNormativeMapping; slug: string }) {
  if (!mapping) return null;
  const href = `/entscheidungen/${slug}?ansicht=wirkungsanalyse#normative-impact-tiles-title`;
  // Canonical codes only; no mapping inferred from keywords, subjects or direction.
  const matched = new Set(mapping.sdgItems.map(item => item.code));
  const sdgCodes = Array.from({ length: 17 }, (_, index) => `SDG ${index + 1}`);
  return <section className="decision-references" aria-label="Referenzchips">
    <h2>Referenzrahmen</h2>
    <p>● Zugeordnet · — Nicht zugeordnet. Zielbezug ist kein Wirkungsnachweis.</p>
    <ul aria-label="SDGs">{sdgCodes.map(code => <li key={code} className={matched.has(code) ? "is-mapped" : "is-unmapped"}>{matched.has(code)
      ? <SamePageStateLink href={href}><span aria-hidden="true">● </span>{code}<span className="sr-only"> · Zugeordnet</span></SamePageStateLink>
      : <span><span aria-hidden="true">— </span>{code}<span className="sr-only"> · Nicht zugeordnet</span></span>}</li>)}</ul>
    {mapping.sdgPlusItems.length > 0 && <ul aria-label="SDG+">{mapping.sdgPlusItems.map(item => <li key={item.id} className="is-mapped"><SamePageStateLink href={href}>● {item.code} · {item.label}</SamePageStateLink></li>)}</ul>}
    {mapping.constitutionalAnchorItems.length > 0 && <div className="decision-law-references"><h3>Rechtsbezüge – eigene Ebene</h3><ul>{mapping.constitutionalAnchorItems.map(item => <li key={item.id}><SamePageStateLink href={href}>§ {item.legalReference || item.code}</SamePageStateLink></li>)}</ul></div>}
  </section>;
}

export function QuestionRing({ questions }: { questions?: readonly ReviewedQuestion[] }) {
  const coverage = questionCoverage(questions);
  if (!coverage) return null;
  const circumference = 2 * Math.PI * 42;
  return <figure className="decision-question-ring"><svg viewBox="0 0 100 100" role="img" aria-label={`${coverage.answered} von ${coverage.total} konkreten Prüffragen beantwortet`}>
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" opacity=".2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray={`${circumference * coverage.answered / coverage.total} ${circumference}`} transform="rotate(-90 50 50)" />
    <text x="50" y="54" textAnchor="middle">{coverage.answered}/{coverage.total}</text>
  </svg><figcaption>Konkrete Prüffragen beantwortet</figcaption></figure>;
}

export function ProcedureStepper({ steps }: { steps?: readonly OfficialProcedureStep[] }) {
  const verified = verifiedProcedureSteps(steps);
  if (!verified) return null;
  return <section className="decision-procedure"><h2>Amtlicher Verfahrensverlauf</h2><ol>{verified.map(step => <li key={step.id} className={step.date ? "" : "is-open"}><strong>{step.label}</strong>{step.date
    ? <a href={step.officialSourceHref!}><time dateTime={step.date}>{step.date}</time> · Amtliche Quelle</a>
    : <span>? Künftiger Schritt · Datum offen</span>}</li>)}</ol></section>;
}
