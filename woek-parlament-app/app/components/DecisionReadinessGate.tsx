import Link from "next/link";

type Gate = {
  title: string;
  question: string;
  detail: string;
};

const gates: Gate[] = [
  {
    title: "Entscheidungsgegenstand",
    question: "Ist klar, worüber entschieden wird?",
    detail: "Umfang, Zielgruppe, Schwellenwerte, Ausnahmen und Zeitbezug müssen hinreichend bestimmt sein."
  },
  {
    title: "Zuständigkeit",
    question: "Wer kann verbindlich entscheiden?",
    detail: "Entscheidungszuständigkeit und politischer Einflussweg – etwa Bundesrat, Verwaltung oder Initiative – werden getrennt ausgewiesen."
  },
  {
    title: "Wirkmechanismus",
    question: "Wie könnte sich ein Zustand verändern?",
    detail: "Ein Instrumentenname ist keine Wirkungsbeschreibung. Der mögliche Wirkpfad, seine Voraussetzungen und Risiken werden separat geprüft."
  },
  {
    title: "Wirkungsentscheidende Bedingungen",
    question: "Sind die entscheidenden Bedingungen sichtbar?",
    detail: "Finanzierung, Schutz, Vollzug, Rechtsrahmen und Verteilung können die Einordnung tragen oder verändern."
  },
  {
    title: "Alternativen",
    question: "Womit wird die Option verglichen?",
    detail: "Ohne plausible Vergleichsoption oder Gegenfaktum entsteht keine starke Aussage über zurechenbare Wirkung."
  }
];

const quickQuestions = [
  "Was wird konkret verändert?",
  "Wer kann es entscheiden?",
  "Über welchen Mechanismus soll es wirken?",
  "Wer trägt Nutzen und Lasten?",
  "Welche Folgen zweiter und dritter Ordnung sind plausibel?",
  "Welche Alternative wird verdrängt?",
  "Welche Bedingung könnte die Einordnung drehen?",
  "Welchen Resonanzraum setzt bereits die Formulierung?"
];

type Props = {
  decisionBasis?: string;
};

export function DecisionReadinessGate({ decisionBasis }: Props) {
  const objectStatus = decisionBasis === "PASS" ? "Klar dokumentiert" : "Noch zu klären";
  return <section className="decision-readiness-gate" aria-labelledby="decision-readiness-title">
    <header>
      <div>
        <p className="eyebrow">Vor dem Folgencheck</p>
        <h2 id="decision-readiness-title">Ist diese Entscheidung wirkungsbezogen entscheidungsreif?</h2>
        <p>Eine Entscheidung kann parlamentarisch abstimmungsfähig und trotzdem wirkungsbezogen noch nicht entscheidungsreif sein. Fehlen zentrale Voraussetzungen, wird keine scheinpräzise Bewertung erzeugt.</p>
      </div>
      {decisionBasis && <p className={`readiness-status${decisionBasis === "PASS" ? " readiness-status--clear" : ""}`}><span>Entscheidungsgegenstand</span><strong>{objectStatus}</strong></p>}
    </header>
    <ol className="decision-readiness-gates">
      {gates.map((gate, index) => <li key={gate.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{gate.title}</h3><strong>{gate.question}</strong><p>{gate.detail}</p></div></li>)}
    </ol>
    <details className="decision-readiness-questions">
      <summary>Die acht Kurzfragen für die Erstprüfung</summary>
      <ol>{quickQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
    </details>
    <p className="small-meta">Die Einstufung beschreibt die Prüfbasis, nicht die politische Qualität eines Vorschlags. <Link href="/methodik#entscheidungsreife">Entscheidungsreife in der Methodik erläutert</Link></p>
  </section>;
}
