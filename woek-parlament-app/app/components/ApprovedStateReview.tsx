import { Fragment, type ReactNode } from "react";
import type { StateReviewMeta } from "@/lib/states/public-content";
import styles from "./ApprovedStateReview.module.css";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "rule" };

function isBlockStart(line: string) {
  return /^#{1,6}\s/.test(line) || /^---+$/.test(line) || /^-\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines = [raw.trimEnd()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraphLines.push(lines[index].trimEnd());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
  }

  return blocks;
}

function stripTrailingUrlPunctuation(value: string) {
  let url = value;
  let suffix = "";
  while (/[.,;:]$/.test(url)) {
    suffix = url.slice(-1) + suffix;
    url = url.slice(0, -1);
  }
  return { url, suffix };
}

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g).filter(Boolean);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code className={styles.code} key={`${index}-${token}`}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`${index}-${token}`}>{token.slice(2, -2)}</strong>;
    }
    if (/^https?:\/\//.test(token)) {
      const { url, suffix } = stripTrailingUrlPunctuation(token);
      return <Fragment key={`${index}-${token}`}><a className={styles.link} href={url}>{url}</a>{suffix}</Fragment>;
    }
    return <Fragment key={`${index}-${token}`}>{token}</Fragment>;
  });
}

function renderParagraph(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={`${index}-${line}`}>
      {index > 0 ? <br /> : null}
      {renderInline(line)}
    </Fragment>
  ));
}

function headingId(text: string, index: number) {
  const id = text
    .replace(/`|\*\*/g, "")
    .toLocaleLowerCase("de-DE")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${id || "abschnitt"}-${index + 1}`;
}

export default function ApprovedStateReview({ markdown, meta }: { markdown: string; meta: StateReviewMeta }) {
  const blocks = parseMarkdown(markdown);
  return <section aria-labelledby="vollstaendige-fachanalyse">
    <div className={styles.sourceBox}>
      <strong id="vollstaendige-fachanalyse">Vollständige freigegebene WÖk-Fachanalyse</strong>
      <p>Status: {meta.statusLabel} · Freigabestand: {meta.approvedAt} · {meta.caseCount} Wirkungsgegenstände</p>
      <p>Canonical Source: <code>{meta.sourcePath}</code></p>
      <p>Die Fachanalyse wird vollständig wiedergegeben. Strukturierung und Typografie verändern weder Aussage noch Fachinhalt.</p>
    </div>
    <article className={styles.document}>
      {blocks.map((block, index) => {
        if (block.type === "rule") return <hr className={styles.rule} key={`rule-${index}`} />;
        if (block.type === "unordered-list") return <ul className={styles.list} key={`ul-${index}`}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>)}</ul>;
        if (block.type === "ordered-list") return <ol className={styles.list} key={`ol-${index}`}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>)}</ol>;
        if (block.type === "paragraph") return <p className={styles.paragraph} key={`p-${index}`}>{renderParagraph(block.text)}</p>;
        const id = headingId(block.text, index);
        if (block.level === 1) return <h2 className={styles.title} id={id} key={`h-${index}`}>{renderInline(block.text)}</h2>;
        if (block.level === 2) return <h3 className={styles.heading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h3>;
        if (block.level === 3) return <h4 className={styles.subheading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h4>;
        return <h4 className={styles.minorHeading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h4>;
      })}
    </article>
  </section>;
}
