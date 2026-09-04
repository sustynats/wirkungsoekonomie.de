import SectionPage from "@/app/[section]/page";
import ImpactCasesPage from "@/app/wirkungsfaelle/page";
import FachanalysenPage from "@/app/fachanalysen/page";
import GovernmentImpactCasesPage from "@/app/regierung/wirkungsanalysen/page";
import GovernmentLayout from "@/app/regierung/layout";
import EuImpactCasesPage from "@/app/eu/wirkungsfaelle/page";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";
import { registerViews } from "@/lib/navigation";

export const metadata = { title: "Bestandskontext der Wirkungsakten", robots: { index: false, follow: true } };

/** Every earlier collection explanation and full preview remains reachable here. */
export default async function RegisterContextPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selected = registerViews.find((view) => view.key === params.bestand)?.key ?? "wirkungsfaelle";
  const query = Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string | string[]] => entry[1] !== undefined));
  return <>
    <div className="shell"><p className="eyebrow">Wirkungsakten</p><p>Die vollständigen Erläuterungen und Kurzfassungen der bisherigen Listen bleiben hier zugänglich. Das gemeinsame Register bietet den kompakten Einstieg.</p><p><SamePageStateLink href="/wirkungsakten">Zum gemeinsamen Wirkungsakten-Register</SamePageStateLink></p><nav className="portal-register-views" aria-label="Bestandsansichten">{registerViews.map((view) => <SamePageStateLink key={view.key} href={{ pathname: "/wirkungsakten/bestand", query: { ...query, bestand: view.key } }} aria-current={selected === view.key ? "page" : undefined}>{view.label}</SamePageStateLink>)}</nav></div>
    {selected === "wirkungsfaelle" && <ImpactCasesPage />}
    {selected === "entscheidungen" && <SectionPage params={Promise.resolve({ section: "entscheidungen" })} />}
    {selected === "fachanalysen" && <FachanalysenPage />}
    {selected === "regierung" && <GovernmentLayout><GovernmentImpactCasesPage /></GovernmentLayout>}
    {selected === "eu" && <EuImpactCasesPage />}
  </>;
}
