import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GovernmentSubnav } from "@/app/components/government/GovernmentSubnav";
import { governmentPublicationGatesPass } from "@/lib/government/publication-gates";

export function generateMetadata(): Metadata {
  const staging = process.env.GOVERNMENT_STAGING === "1";
  return {
    title: staging ? "Regierungshandeln & Wirkung - Staging" : "Regierungshandeln & Wirkung",
    robots: staging ? { index: false, follow: false, nocache: true } : { index: true, follow: true },
  };
}

export default function GovernmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const staging = process.env.GOVERNMENT_STAGING === "1";
  if (!staging && !governmentPublicationGatesPass()) notFound();
  return (
    <>
      {staging && <div className="government-stage-banner" role="status">
        <div className="shell"><strong>Staging:</strong> Fakten- und Darstellungsprüfung. Keine Production-Veröffentlichung.</div>
      </div>}
      <div className="shell"><GovernmentSubnav /></div>
      {children}
    </>
  );
}
