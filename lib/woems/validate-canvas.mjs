export const REQUIRED_CANVAS_FIELDS = [
  "canvasId",
  "methodId",
  "version",
  "datum",
  "fall",
  "verantwortlicheModeration",
  "evidenzstatus",
  "unsicherheit",
  "negativeWirkung",
  "wirkungsgrenzen",
  "offeneFragen",
  "semantischeCodierung"
];

export function evaluateNonCompensation(instance) {
  const boundaries = Array.isArray(instance?.wirkungsgrenzen) ? instance.wirkungsgrenzen : [];
  const violated = boundaries.filter((boundary) => boundary?.status === "verletzt");
  const threatened = boundaries.filter((boundary) => boundary?.status === "gefaehrdet");
  if (violated.length) {
    return {
      decision: "stop_or_redesign",
      aggregationAllowed: false,
      violatedBoundaries: violated.map((boundary) => boundary.bezeichnung),
      threatenedBoundaries: threatened.map((boundary) => boundary.bezeichnung)
    };
  }
  return {
    decision: threatened.length ? "review_required" : "proceed",
    aggregationAllowed: true,
    violatedBoundaries: [],
    threatenedBoundaries: threatened.map((boundary) => boundary.bezeichnung)
  };
}

export function validateCanvasInstance(instance, canvasRegistry) {
  const errors = [];
  for (const field of REQUIRED_CANVAS_FIELDS) {
    if (instance?.[field] === undefined || instance?.[field] === null || instance?.[field] === "") {
      errors.push(`Pflichtfeld fehlt: ${field}`);
    }
  }
  const canvas = canvasRegistry?.canvases?.find((item) => item.id === instance?.canvasId);
  if (!canvas) errors.push(`Unbekannte canvasId: ${instance?.canvasId || "(leer)"}`);
  if (canvas && canvas.methodId !== instance.methodId) errors.push("methodId passt nicht zur Canvas-Spezifikation.");
  if (instance?.semantischeCodierung?.farbeNieAllein !== true) {
    errors.push("Farbe darf Bedeutung nie allein tragen.");
  }
  if (!instance?.semantischeCodierung?.zusaetzlicheCodierung?.length) {
    errors.push("Text- oder Symbolcodierung fehlt.");
  }
  const decision = evaluateNonCompensation(instance);
  if (!decision.aggregationAllowed && typeof instance?.aggregierterWert === "number") {
    errors.push("Aggregierter Wert ist bei verletzter Wirkungsgrenze unzulässig (Nichtkompensation)." );
  }
  return { valid: errors.length === 0, errors, decision };
}
