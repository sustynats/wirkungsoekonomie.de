import Link from "next/link";
import type { ReactNode } from "react";
import type { RegisterObject } from "@/lib/register-model";

/** Fixed cross-page destination, never a same-page state control. */
export function InstitutionRegisterLink({ level, organ, children }: {
  level: RegisterObject["level"]; organ?: RegisterObject["organ"]; children: ReactNode;
}) {
  return <Link href={{ pathname: "/wirkungsakten", query: { ebene: level, ...(organ ? { organ } : {}) } }}>{children}</Link>;
}
