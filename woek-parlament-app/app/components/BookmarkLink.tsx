"use client";

import { useEffect, useState } from "react";
import { isPendingParliamentBookmark, parliamentBookmark, toggleParliamentBookmark, type ParliamentBookmark } from "@/lib/wirkungsraum-client";
import type { WirkungsraumItemType } from "@/lib/wirkungsraum";

export function BookmarkLink({
  title,
  path,
  itemType = "document",
  compact = false
}: {
  title: string;
  path: string;
  itemType?: WirkungsraumItemType;
  compact?: boolean;
}) {
  const item = parliamentBookmark({ title, path, itemType }) as ParliamentBookmark;
  const [saved, setSaved] = useState(false);

  useEffect(() => setSaved(isPendingParliamentBookmark(item.id)), [item.id]);

  return (
    <button
      type="button"
      className={compact ? "bookmark-link bookmark-link-compact" : "bookmark-link"}
      aria-pressed={saved}
      onClick={() => setSaved(toggleParliamentBookmark(item))}
    >
      <span aria-hidden="true">{saved ? "◆" : "◇"}</span> {saved ? "Gemerkt" : "Merken"}
      <span className="sr-only">: {title}</span>
    </button>
  );
}
