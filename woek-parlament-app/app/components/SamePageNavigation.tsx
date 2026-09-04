"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, FormEvent, FormHTMLAttributes, ReactNode } from "react";

type SamePageStateLinkProps = Omit<ComponentProps<typeof Link>, "scroll">;

export function SamePageStateLink(props: SamePageStateLinkProps) {
  return <Link {...props} scroll={false} />;
}

type SamePageQueryFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "method" | "onSubmit"> & {
  children: ReactNode;
};

export function SamePageQueryForm({ children, ...props }: SamePageQueryFormProps) {
  const pathname = usePathname();
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value.trim()) query.append(name, value);
    }
    const target = query.size ? `${pathname}?${query.toString()}` : pathname;
    router.push(target, { scroll: false });
  }

  return <form {...props} action={pathname} method="get" onSubmit={submit}>{children}</form>;
}
