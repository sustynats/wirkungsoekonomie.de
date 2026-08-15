import Link from "next/link";

type EditorialVisualProps = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  reversed?: boolean;
};

/** A reusable, text-equivalent visual block. The image reinforces an
 * explanation; its accessible text remains complete without the image. */
export function EditorialVisual({ src, alt, eyebrow, title, description, href, linkLabel, reversed = false }: EditorialVisualProps) {
  return <figure className={`editorial-visual${reversed ? " editorial-visual--reversed" : ""}`}>
    <div className="editorial-visual-art"><img src={src} alt={alt} /></div>
    <figcaption>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {href && linkLabel ? <Link className="text-link" href={href}>{linkLabel} <span aria-hidden="true">→</span></Link> : null}
    </figcaption>
  </figure>;
}
