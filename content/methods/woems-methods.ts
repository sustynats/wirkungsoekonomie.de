import canvasRegistryJson from "./woems-canvas.json";
import methodRegistryJson from "./woems-methoden.json";

export type WoemsCategoryId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type WoemsMethodId = `${WoemsCategoryId}${number}`;

export type WoemsMethod = {
  id: WoemsMethodId;
  kategorie: WoemsCategoryId;
  kategorieName: string;
  name: string;
  docxSeite: number;
  zweck: string;
  inputs: string[];
  schritte: string[];
  outputs: string[];
  qualitaetsregeln: string[];
  schutzregeln: string[];
  schnittstellen: {
    bautAuf: WoemsMethodId[];
    fuehrtZu: WoemsMethodId[];
  };
  canvasRef: string;
};

export type CanvasField = {
  key: string;
  label: string;
  leitfrage: string;
};

export type WoemsCanvasSpecification = {
  id: string;
  methodId: WoemsMethodId;
  relatedMethodIds?: WoemsMethodId[];
  anwendungsmodul?: string;
  name: string;
  felder: CanvasField[];
  pflichtfelder: string[];
};

export type WoemsMethodRegistry = {
  schemaVersion: string;
  registryId: string;
  title: string;
  version: string;
  stand: string;
  source: string;
  sourceSha256: string;
  counts: { categories: number; methods: number };
  kategorien: Array<{ id: WoemsCategoryId; name: string }>;
  methods: WoemsMethod[];
};

export type WoemsCanvasRegistry = {
  schemaVersion: string;
  registryId: string;
  title: string;
  version: string;
  stand: string;
  source: string;
  counts: { methodCanvases: number; variants: number; total: number };
  mindeststandard: {
    metadaten: string[];
    pflichtfelder: string[];
    semantik: {
      farbeNieAllein: boolean;
      zusaetzlicheCodierung: string[];
      erlaubtePfeilbeziehungen: string[];
    };
    nichtkompensation: {
      harteRegel: boolean;
      regel: string;
      entscheidungBeiGrenzverletzung: "stop_or_redesign";
    };
  };
  canvases: WoemsCanvasSpecification[];
};

export const woemsMethodRegistry = methodRegistryJson as WoemsMethodRegistry;
export const woemsCanvasRegistry = canvasRegistryJson as WoemsCanvasRegistry;

export const woemsMethodsById = new Map(
  woemsMethodRegistry.methods.map((method) => [method.id, method] as const)
);

export const woemsCanvasesById = new Map(
  woemsCanvasRegistry.canvases.map((canvas) => [canvas.id, canvas] as const)
);
