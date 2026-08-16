import Link from "next/link";
import { directionLabels, evidenceLabels, type ImpactAssessmentExplanation, type ImpactDirection } from "@/lib/methodology";

const statusLabels = {
  OFFICIAL_FACT: "amtlich belegter Fakt",
  EMPIRICALLY_SUPPORTED: "empirisch gestützt",
  PLAUSIBLE_PATH: "plausibler Wirkpfad",
  MODEL_ASSUMPTION: "Modellannahme",
  OPEN: "offen"
} as const;

const dataLabels = {
  MEASURED: "gemessen",
  OBSERVED: "beobachtet",
  MODELLED: "modelliert",
  ESTIMATED: "geschätzt",
  SECONDARY: "aus Sekundärdaten",
  MISSING: "Daten fehlen"
} as const;

const effectLabels = {
  NOT_ESTABLISHED_EX_ANTE: "noch nicht festgestellt - Ex-ante-Einordnung",
  OBSERVED: "beobachtet, aber noch nicht zwingend zugerechnet",
  EVALUATED: "evaluiert",
  OPEN: "offen"
} as const;

const competenceLabels = {
  LAND: "Land",
  BUND: "Bund",
  EU: "Europäische Union",
  KOMMUNE: "Kommune",
  MIXED: "mehrere Ebenen",
  OPEN: "unklar"
} as const;

function directionClass(direction: ImpactDirection) {
  return direction.toLocaleLowerCase("de-DE").replaceAll("_", "-");
}

function List({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function ImpactAssessmentExplanationPanel({ assessment }: { assessment: ImpactAssessmentExplanation }) {
  return (
    <article className="method-full-example" aria-labelledby="full-example-title">
      <header>
        <p className="eyebrow">Vollständiges Beispiel</p>
        <h3 id="full-example-title">Von der Originalaussage bis zur späteren Messfrage</h3>
        <p>Dieses Beispiel zeigt eine Ex-ante-Einordnung. Es behauptet keine bereits eingetretene Wirkung.</p>
      </header>

      <section className="method-source-quote" aria-labelledby="example-source-title">
        <div><span>01</span><h4 id="example-source-title">Originalquelle</h4></div>
        <blockquote>„{assessment.source.quote}“</blockquote>
        <p><strong>{assessment.source.title}</strong>{assessment.source.locator ? `, ${assessment.source.locator}` : ""}</p>
        {assessment.source.href && <Link href={assessment.source.href}>Quelle und vollständige Fachakte öffnen <span aria-hidden="true">→</span></Link>}
      </section>

      <div className="method-example-flow">
        <section><span>02</span><h4>Auslöser</h4><p>{assessment.trigger}</p></section>
        <section><span>03</span><h4>Wirkungsempfänger</h4><List items={assessment.recipients} /></section>
        <section><span>04</span><h4>Wirkungsraum</h4><List items={assessment.impactSpace} /></section>
        <section><span>05</span><h4>Wirkmechanismus</h4><p>{assessment.mechanism}</p></section>
      </div>

      <details className="method-disclosure" open>
        <summary><span>06</span><strong>Richtung je Referenzziel und ausführliche Begründung</strong></summary>
        <div className="method-disclosure-body">
          <div className="method-target-mappings">
            {assessment.targetMappings.map((mapping) => <article key={mapping.targetId} className={`method-target-card method-direction-${directionClass(mapping.direction)}`}>
              <div><span className="method-target-code">{mapping.targetId}</span><strong>{mapping.targetLabel}</strong></div>
              <p className="method-direction-label"><span aria-hidden="true">{mapping.direction === "POSITIVE_POTENTIAL" ? "↗" : mapping.direction === "NEGATIVE_RISK" ? "↘" : mapping.direction === "AMBIVALENT" ? "↕" : mapping.direction === "NEUTRAL" ? "−" : "?"}</span>{directionLabels[mapping.direction]}</p>
              <p>{mapping.rationale}</p>
            </article>)}
          </div>
          <p className="method-no-average"><strong>Keine Mittelung:</strong> Zielrichtungen bleiben getrennt sichtbar und werden nicht zu einer Parteipunktzahl verrechnet.</p>
        </div>
      </details>

      <details className="method-disclosure">
        <summary><span>07</span><strong>Annahmen, Evidenz und tatsächlicher Wirkungsstatus</strong></summary>
        <div className="method-disclosure-body method-disclosure-columns">
          <section><h4>Annahmen</h4><List items={assessment.assumptions} /></section>
          <section><h4>Was trägt die Einordnung?</h4><dl><div><dt>Evidenzsicherheit</dt><dd>{evidenceLabels[assessment.evidence.level]}</dd></div><div><dt>Aussagestatus</dt><dd>{statusLabels[assessment.evidence.status]}</dd></div><div><dt>Datenstatus</dt><dd>{dataLabels[assessment.evidence.dataStatus]}</dd></div><div><dt>Tatsächliche Wirkung</dt><dd>{effectLabels[assessment.actualEffectStatus]}</dd></div></dl></section>
        </div>
      </details>

      <details className="method-disclosure">
        <summary><span>08</span><strong>Kompetenz, Recht und Schutzprüfung</strong></summary>
        <div className="method-disclosure-body method-disclosure-columns">
          <section><h4>Politische Ebene</h4><p><strong>{assessment.competence ? competenceLabels[assessment.competence.level] : "nicht angegeben"}</strong></p><p>{assessment.competence?.rationale}</p></section>
          <section><h4>Rechtsprüfung</h4><p><strong>{assessment.legalReview?.status}</strong></p>{assessment.legalReview && <List items={assessment.legalReview.references} />}<p>{assessment.legalReview?.rationale}</p></section>
          <section><h4>Wirkungsrisiken</h4><List items={assessment.risks} /></section>
          <section><h4>Nicht verrechenbare Schutzgrenzen</h4><List items={assessment.boundaries} /></section>
        </div>
      </details>

      <details className="method-disclosure">
        <summary><span>09</span><strong>Was später gemessen und verglichen werden müsste</strong></summary>
        <div className="method-disclosure-body method-disclosure-columns">
          <section><h4>Datenbedarf</h4><List items={assessment.dataNeeds} /></section>
          <section><h4>Baseline und Gegenfaktum</h4><p>Vor einer späteren Wirkungsberechnung braucht es einen dokumentierten Ausgangszustand und ein belastbares Modell dafür, wie sich dieselben Zielgrößen ohne die Änderung entwickelt hätten.</p><p><strong>Aktueller Stand:</strong> noch nicht beobachtbar. Daten werden erst nach einer tatsächlichen Umsetzung benötigt.</p></section>
        </div>
      </details>

      <footer className="method-version-strip">
        <div><span>Regel</span><strong>{assessment.method.ruleId}</strong></div>
        <div><span>Methodenstand</span><strong>{assessment.method.version}</strong></div>
        <div><span>Fachlich geprüft</span><strong>{assessment.method.reviewedAt}</strong></div>
        {assessment.method.changeLogHref && <Link href={assessment.method.changeLogHref}>Änderungsverlauf ansehen</Link>}
      </footer>
    </article>
  );
}
