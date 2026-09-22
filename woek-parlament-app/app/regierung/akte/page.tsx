import type { Metadata } from "next";
import { Suspense } from "react";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { GovernmentActionDirectory } from "@/app/components/government/GovernmentActionDirectory";
import { getGovernmentPublicData } from "@/lib/government/public-data";

export const metadata: Metadata = { title: "Regierungsakte" };

export default function GovernmentActionsPage() {
  const { actions } = getGovernmentPublicData();
  const types = [...new Set(actions.map((action) => action.action_type))].sort();
  return (
    <section className="section shell government-list-page">
      <p className="eyebrow">Government Data 1.2</p>
      <h1>Regierungsakte</h1>
      <p className="lead">Hier stehen ausschließlich faktisch bestätigte Regierungsakte mit amtlicher Primärquelle. Der kanonische Arbeitsbestand ist größer; ungeklärte Kandidaten erscheinen nicht in dieser Liste.</p>
      <Suspense fallback={<p className="government-result-count">Die statische Suche wird vorbereitet …</p>}>
        <GovernmentActionDirectory
          totalCount={actions.length}
          types={types}
          initialCards={actions.slice(0, 120).map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}
        />
      </Suspense>
    </section>
  );
}
