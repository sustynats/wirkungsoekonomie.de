type GovernmentActionScopeExplainerProps = {
  compact?: boolean;
};

const sources = [
  {
    label: "Deutsche Nachhaltigkeitsstrategie 2025",
    href: "https://www.bundesregierung.de/resource/blob/975228/2335292/3962877378d74837d4f4c611749b6172/2025-05-13-dns-2025-data.pdf?download=1",
  },
  {
    label: "GGO – insbesondere §§ 44 und 62",
    href: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
  },
  {
    label: "§ 13 Bundes-Klimaschutzgesetz",
    href: "https://www.gesetze-im-internet.de/ksg/__13.html",
  },
  {
    label: "Aktionsplan Nachhaltigkeit 2026",
    href: "https://www.bundesregierung.de/resource/blob/975228/2447318/d0566f3dc91f903a9539aa8f9a29f63d/2026-07-16-aktionsplan-nachhaltigkeit-data.pdf?download=1",
  },
] as const;

export function GovernmentActionScopeExplainer({ compact = false }: GovernmentActionScopeExplainerProps) {
  return (
    <section className="notice notice-neutral" id="wirkungsrelevanz" aria-labelledby="wirkungsrelevanz-title">
      <p className="eyebrow">Prüfumfang</p>
      <h2 id="wirkungsrelevanz-title">Wirkungsrelevanz statt Rechtsform</h2>
      <p>
        Die WÖk prüft politisches Handeln nicht nur dort, wo ein Gesetz entsteht. Die Leitfrage lautet:
        <strong> Kann ein Vorhaben oder eine Maßnahme einen materiell bedeutenden Zustand verändern?</strong> Deshalb können neben
        Gesetzen und Rechtsverordnungen auch Strategien, Programme, Förder-, Investitions- und Beschaffungsentscheidungen,
        Infrastrukturvorhaben und andere politisch verantwortete Maßnahmen zu einem Wirkungsfall werden.
      </p>
      <p>
        Das ist keine Behauptung, dass für alle diese Gegenstände dieselbe staatliche Prüfpflicht gilt. Die Deutsche
        Nachhaltigkeitsstrategie 2025 reicht in ihrem Anspruch über Rechtsetzung hinaus: Ressorts sollen auch ihre
        Verwaltungspraxis nachhaltig ausrichten, Ressortstrategien einbeziehen, bei besonders relevanten Strategien und Programmen
        Nachhaltigkeitswirkungen benennen und bestehende Vorhaben regelmäßig an den Nachhaltigkeitszielen spiegeln. Besonders
        formalisiert ist die Nachhaltigkeitsprüfung aber in der Rechtsetzung; der Aktionsplan Nachhaltigkeit 2026 sieht für jeden
        Gesetzentwurf eine vollständige Nachhaltigkeitsprüfung vor. § 13 KSG enthält daneben eigene Klimaschutzanforderungen für
        Planungen und Entscheidungen öffentlicher Aufgabenträger sowie für Investitionen und Beschaffung des Bundes.
      </p>

      {!compact && (
        <div className="government-method-split">
          <article>
            <p className="eyebrow">Staatliche Prüfarchitektur</p>
            <h3>Nicht jede Maßnahme läuft durch dasselbe Verfahren</h3>
            <p>
              Gesetze und Rechtsverordnungen, Strategien und Programme, Beschaffung, Investitionen und sonstiges Verwaltungshandeln
              können unterschiedlichen Regeln und Prüftiefen unterliegen. Die genannten Regelwerke bilden deshalb keine einheitliche,
              identische eNAP-Pflicht für jede materiell relevante Einzelmaßnahme.
            </p>
          </article>
          <article>
            <p className="eyebrow">WÖk-Prüfarchitektur</p>
            <h3>Die Analyse folgt der möglichen Wirkungsmacht</h3>
            <p>
              WÖk erweitert nicht den Rechtsrahmen, sondern den Analyseumfang. Ein Gegenstand wird nur dann geprüft und veröffentlicht,
              wenn Entscheidungsgegenstand, verantwortlicher Akteur, Quellenlage und fachliche Abgrenzung nachvollziehbar sind. Auf
              anderen staatlichen Ebenen gilt dasselbe Auswahlprinzip; der jeweils geltende Rechts- und Nachhaltigkeitsrahmen wird
              objektspezifisch belegt und nicht vom Bund übertragen.
            </p>
          </article>
        </div>
      )}

      <p>
        <strong>Unternehmensentscheidung bleibt Unternehmensentscheidung.</strong> Bei Unternehmen mit Bundes- oder Landesbeteiligung
        wird ein Vorgang nicht allein wegen der Beteiligung zur Ministeriumsentscheidung. Eine staatliche Eigentümerrolle, konkrete
        Steuerung, ein öffentliches Mandat oder politische Flankierung werden – soweit vorhanden – getrennt belegt. Attribution und
        Verantwortung bleiben ausdrücklich offen, wenn die Quellen das nicht tragen.
      </p>

      <div className="reference-links" aria-label="Amtliche Grundlagen zum Prüfumfang">
        {sources.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
            {source.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
