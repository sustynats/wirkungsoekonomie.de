import { fachanalysen } from "@/data/fachanalysen";

export function listFachanalysen() {
  return fachanalysen;
}

export function getFachanalyse(slug: string) {
  return fachanalysen.find((analysis) => analysis.slug === slug);
}
