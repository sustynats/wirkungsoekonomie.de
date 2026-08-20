import Link from "next/link";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { getGovernmentPublicData } from "@/lib/government/public-data";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { ActionPlanMetaPreview } from "@/app/components/government/StrategyImpactCase";

export default function GovernmentLandingPage() {
  const { actions } = getGovernmentPublicData();
  const impactCases = getPublicImpactCases();
  const upcoming = actions.filter((action) => ["SUBMITTED_TO_PARLIAMENT", "PARLIAMENTARY_PROCESS", "CONSULTATION"].includes(action.lifecycle_status)).slice(0, 3);
  const newlyDecided = actions.filter((action) => ["CABINET_DECIDED", "ADOPTED", "PROMULGATED", "IN_FORCE"].includes(action.lifecycle_status)).slice(0, 3);
  const realityChecks = impactCases.filter((record) => !["NOT_YET_OBSERVABLE", "NOT_APPLICABLE"].includes(record.reality_check_status));
  const criticalCases = impactCases.filter((record) => record.boundary_status === "BLOCK" || record.boundary_status === "WATCH" || ["NEGATIVE", "AMBIVALENT"].includes(record.primary_direction)).slice(0, 3);

  return (
    <>
      <section className="shell hero-shell">
        <div className="hero government-hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Bundesregierung seit 6. Mai 2025</p>
              <h1>Regierungshandeln &amp; Wirkung</h1>
              <p className="lead"><strong>Was bewirkt die Bundesregierung?</strong></p>
              <p>Hier werden politische Maßnahmen nicht nur danach betrachtet, was beschlossen oder angekündigt wurde. Im Mittelpunkt steht, welche Zustände sie für Mensch, Planet und Demokratie verändern können - und später tatsächlich verändert haben.</p>
              <p><strong>Vor der Umsetzung</strong> zeigen wir Wirkungspotenziale, Risiken und Bedingungen. <strong>Nach der Umsetzung</strong> prüfen Reality-Checks Beobachtung, Evidenz und mögliche Zurechnung.</p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/regierung/wirkungsanalysen">Aktuelle Wirkungsfälle</Link>
                <Link className="button button-secondary" href="/regierung/methodik">Methodik verstehen</Link>
              </div>
            </div>
            <aside className="hero-education" aria-labelledby="government-quick-title">
              <p className="eyebrow">Kurz erklärt</p>
              <h2 id="government-quick-title">Von der Ankündigung zur Wirkung</h2>
              <p>Ein Ministerium kündigt ein Förderprogramm an. Erst die veröffentlichte Förderrichtlinie belegt einen staatlichen Handlungsakt. Fließen Mittel, sehen wir Umsetzung. Entstehen Angebote, sehen wir Output. Erst eine reale Zustandsveränderung ist Wirkung.</p>
              <ol className="hero-education-steps">
                <li><span>1</span><div><strong>Entscheidung</strong><small>amtlich belegt</small></div></li>
                <li><span>2</span><div><strong>Umsetzung und Output</strong><small>getrennt dokumentiert</small></div></li>
                <li><span>3</span><div><strong>Zustandsveränderung</strong><small>Evidenz und Zurechnung geprüft</small></div></li>
              </ol>
              <Link className="hero-education-link" href="/regierung/methodik">So prüft die Wirkungsökonomie</Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Wirkung zuerst</p><h2>Was war vor dem Handeln über mögliche Folgen bekannt?</h2></div><Link className="text-link" href="/regierung/wirkungsanalysen">Alle Wirkungsanalysen</Link></div>
        <p className="lead">Prozessdaten zeigen, was beschlossen wurde. Die WÖk-Fachakten zeigen zusätzlich, welche Zustände sich über welche Mechanismen verändern können, in welcher Richtung und mit welcher Evidenz.</p>
        <div className="government-impact-list"><ActionPlanMetaPreview />{impactCases.slice(0, 2).map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div>
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Was als Nächstes entschieden wird</p><h2>Anstehende Entscheidungen</h2></div><Link className="text-link" href="/regierung/akte">Alle Faktenakten</Link></div>
        <p className="lead">Diese amtlich belegten Vorhaben befinden sich im Verfahren. Eine fehlende WÖk-Analyse bedeutet nicht neutrale Wirkung, sondern: Die fachliche Einordnung ist noch nicht veröffentlicht.</p>
        <div className="government-action-grid">{upcoming.map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}</div>
      </section>

      <section className="section section-surface">
        <div className="shell">
          <div className="section-heading"><div><p className="eyebrow">Neu beschlossen</p><h2>Maßnahmen mit fortgeschriebenem Lebenslauf</h2></div><Link className="text-link" href="/regierung/akte">Alle Regierungsakte</Link></div>
          <div className="government-action-grid">{newlyDecided.map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}</div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Wirkung nach Umsetzung</p><h2>Reality-Checks</h2></div><Link className="text-link" href="/regierung/wirkungsanalysen">Alle Analysen</Link></div>
        {realityChecks.length ? <div className="government-impact-list">{realityChecks.slice(0, 3).map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div> : <div className="open-state"><span aria-hidden="true">i</span><div><strong>Noch kein Fall ist reif für eine belastbare Wirkungszurechnung.</strong><p>Die Ex-ante-Analysen bleiben sichtbar. Sobald geeignete Beobachtungsdaten vorliegen, werden sie durch eine getrennte Reality-Check-Stufe ergänzt.</p></div></div>}
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Zielkonflikte und Schutzgrenzen</p><h2>Wo besonders genau hingesehen werden muss</h2></div></div>
        <div className="government-impact-list">{criticalCases.map((record) => <GovernmentImpactCase key={record.impact_case_id} record={record} compact />)}</div>
      </section>

      <section className="section section-surface">
        <div className="shell">
          <p className="eyebrow">Was wir untersuchen</p>
          <h2>Gemeinsame Beschlüsse und eigenständiges Ressorthandeln</h2>
          <div className="government-domain-grid">
            <article><span aria-hidden="true">K</span><h3>Kabinett</h3><p>Gesetzentwürfe, Verordnungen, Strategien, Berichte und Programme, die die Bundesregierung gemeinsam beschließt.</p><Link href="/regierung/kabinett">Kabinett ansehen</Link></article>
            <article><span aria-hidden="true">R</span><h3>Ministerien</h3><p>Eigenständiges Handeln der Bundesministerien - auch dort, wo kein gesonderter Kabinettsbeschluss nötig ist.</p><Link href="/regierung/ministerien">Ministerien ansehen</Link></article>
            <article><span aria-hidden="true">B</span><h3>Bundeskanzleramt und Gremien</h3><p>Materielle Organisationsakte des Bundeskanzleramts und zentraler Kabinettsausschüsse bleiben institutionell getrennt sichtbar.</p><Link href="/regierung/ressorts/BKAmt">Bundeskanzleramt ansehen</Link></article>
            <article><span aria-hidden="true">P</span><h3>Parlament und Recht</h3><p>Regierungsvorhaben werden mit parlamentarischem Verfahren, Verkündung und Inkrafttreten verknüpft, ohne Regierung und Parlament gleichzusetzen.</p><Link href="/regierung/mandat-praxis">Mandat &amp; Praxis</Link></article>
            <article><span aria-hidden="true">U</span><h3>Umsetzung</h3><p>Haushaltsvollzug, Förderung, Beschaffung und Verwaltung werden erst angezeigt, wenn belastbare Daten angebunden sind.</p><Link href="/regierung/umsetzung">Datenstatus Umsetzung</Link></article>
            <article><span aria-hidden="true">W</span><h3>Wirkung</h3><p>Zustandsveränderungen, Evidenz und Zurechnung sind eine eigene Prüfebene. Wirkung wird nicht aus einem Beschluss behauptet.</p><Link href="/regierung/wirkungsmonitor">Datenstatus Wirkung</Link></article>
          </div>
        </div>
      </section>

      <section className="section shell government-explanation">
        <div><p className="eyebrow">Was ist ein Regierungsakt?</p><h2>Nicht jede Pressemitteilung ist Regierungshandeln.</h2></div>
        <div><p>Ein Regierungsakt ist ein nachvollziehbarer staatlicher Handlungsgegenstand - etwa ein Kabinettsbeschluss, Regierungsentwurf, eine Verordnung, Strategie, Förderrichtlinie oder amtliche Vereinbarung. Eine Pressemitteilung kann ihn dokumentieren, ist aber nicht automatisch selbst eine neue Handlung.</p><p>Auch private Unternehmensentscheidungen bleiben getrennt. Ein Liefervertrag eines Unternehmens ist nicht automatisch eine Entscheidung der Bundesregierung. Eine staatliche Garantie oder amtliche Energiepartnerschaft kann dagegen Regierungshandeln sein.</p></div>
      </section>

      <section className="section shell">
        <div className="notice"><strong>WÖk Regierungswirkungsportal - laufender Aufbau</strong><p>Der Datenbestand und die Wirkungsanalysen werden fortlaufend erweitert. Neue Entscheidungen werden materialitätsorientiert aufgenommen und später mit Reality-Checks ergänzt. Der Faktenbestand umfasst {actions.length.toLocaleString("de-DE")} objektweise freigegebene Government-Data-1.2-Akten; {impactCases.length} fachlich freigegebene Wirkungsfälle bilden eine davon getrennte Coverage.</p></div>
        <div className="government-link-row">
          <Link className="button button-primary" href="/regierung/transparenz">Datenabdeckung prüfen</Link>
          <Link className="button button-secondary" href="/regierung/methodik">Wirkungsprüfung verstehen</Link>
        </div>
      </section>
    </>
  );
}
