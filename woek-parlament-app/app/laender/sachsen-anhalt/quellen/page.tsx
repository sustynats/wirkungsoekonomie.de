import Link from "next/link";
import { jurisdictionById } from "@/lib/parliament/jurisdictions";

const saxonyAnhalt = jurisdictionById("sachsen-anhalt");

export const metadata = {
  title: "Quellen zur Landtagswahl Sachsen-Anhalt 2026",
  description: "Quellenregister für den Wahlbereich Sachsen-Anhalt des Wirkungsportals Parlament."
};

export default function SaxonyAnhaltSourcesPage() {
  return (
    <div className="shell content-page source-directory-page">
      <header className="page-intro">
        <p className="eyebrow">Sachsen-Anhalt · Quellen</p>
        <h1>Woher die Angaben kommen.</h1>
        <p className="lead">Dieses Register erklärt Zweck und Status jeder Quelle, bevor zu ihr weitergeleitet wird. Für eine veröffentlichte Programmeinordnung werden zusätzlich Fassung, Abrufzeitpunkt, Hash und konkrete Fundstellen gespeichert.</p>
      </header>
      <div className="source-directory-list">
        {saxonyAnhalt?.sourceSystems.map((source) => (
          <article key={source.slug}>
            <p className="eyebrow">{source.institution}</p>
            <h2>{source.title}</h2>
            <p>{source.use}</p>
            <p className="source-directory-note">{source.notes}</p>
            <a className="text-link" href={source.url} target="_blank" rel="noreferrer">Zur amtlichen Quelle <span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </div>
      <section className="source-directory-reference" id="referenzrahmen" aria-labelledby="reference-directory-title">
        <p className="eyebrow">Referenzrahmen</p>
        <h2 id="reference-directory-title">Welche Ziele und Schutzgrenzen gelten?</h2>
        <p>Die folgende Einordnung trennt zwischen dauerhaftem Rahmen, landesspezifischer Strategie und der Frage, ob eine konkrete Maßnahme Wirkungen außerhalb Sachsen-Anhalts entfaltet. Sie ist kein verstecktes Punktesystem.</p>
        <div className="source-directory-list">
          {saxonyAnhalt?.referenceFramework?.map((reference) => (
            <article key={reference.id}>
              <p className="eyebrow">{reference.authority === "GLOBAL" ? "Gemeinsamer Referenzrahmen" : reference.authority === "CONSTITUTIONAL" ? "Landesverfassung" : reference.authority === "STATE_STRATEGY" ? "Landesstrategie" : "Wirkungsraum"}</p>
              <h3>{reference.label}</h3>
              <p>{reference.description}</p>
              <p className="source-directory-note">Status: {reference.stability === "ENDURING" ? "dauerhaft geltender Rahmen" : reference.stability === "VERSIONED_CURRENT" ? "aktuelle, versionierte Referenz" : "wird für jeden Fall konkret dokumentiert"}</p>
            </article>
          ))}
        </div>
      </section>
      <p><Link className="text-link" href="/laender/sachsen-anhalt">Zurück zum Wahlbereich <span aria-hidden="true">→</span></Link></p>
    </div>
  );
}
