"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, FormEvent, FormHTMLAttributes, MouseEvent, ReactNode } from "react";

type SamePageStateLinkProps = Omit<ComponentProps<typeof Link>, "scroll">;

export function SamePageStateLink(props: SamePageStateLinkProps) {
  const { onClick, ...linkProps } = props;
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || process.env.NEXT_PUBLIC_WOEK_STATIC_HOST !== "1") return;
    const target = new URL(event.currentTarget.href);
    if (target.pathname !== window.location.pathname) return;
    event.preventDefault();
    window.history.pushState(null, "", target.href);
  }
  return <Link {...linkProps} data-same-page-state scroll={false} onClick={navigate} />;
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
    if (process.env.NEXT_PUBLIC_WOEK_STATIC_HOST === "1") window.history.pushState(null, "", target);
    else router.push(target, { scroll: false });
  }

  return <form {...props} action={pathname} method="get" onSubmit={submit}>{children}</form>;
}
