import { notFound } from "next/navigation";

const pages: Record<string, { title: string; text: string }> = {
  unabhaengigkeit: { title: "Unabhängigkeit", text: "Das Portal bewertet keine Personen, Parteien oder Fraktionen. Es prüft nachvollziehbare Maßnahmen, deren Fassungen und mögliche Wirkpfade. Finanzierung, Firewall und Governance werden vor dem öffentlichen Launch dokumentiert." },
  auswahl: { title: "Warum prüfen wir das?", text: "Die Auswahl folgt einem veröffentlichten Wirkungsrelevanz-Standard. Solange dieser Standard und der amtliche Vorgang nicht vollständig belegt sind, bleibt der Status CONTENT_REQUIRED." },
  korrekturen: { title: "Korrekturen", text: "Korrekturen sind öffentlich, datiert und einer Fassung zugeordnet. Eine materielle Änderung löst eine Fachprüfung aus, aber kein automatisches Votum." },
  ki: { title: "Grenzen der WÖK-KI", text: "Die WÖK-KI unterstützt höchstens eine methodische Vertiefung. Sie erhält keine Partei-, Fraktions-, Personen- oder Vorgangsidentifikatoren und darf kein Fachvotum schreiben oder verändern." }
};

export default async function TransparencyTopic({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const page = pages[topic];
  if (!page) notFound();
  return <div className="container page-shell"><header className="page-intro"><p className="kicker">Trust Center</p><h1>{page.title}</h1><p>{page.text}</p></header></div>;
}
