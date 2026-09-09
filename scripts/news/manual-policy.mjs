// Manual editions are not news candidates. Keep this guard independent of the
// content loader: automation must never load the author-supplied manuscripts.
export const isManualEditorial = value => Boolean(value && (value.manual_only === true
  || value.manualOnly === true || value.format === "book_and_impact" || value.format === "Buch & Wirkung"));

export function assertAutomatable(value) {
  if (isManualEditorial(value)) throw new Error("MANUAL_EDITORIAL_AUTOMATION_FORBIDDEN");
}
