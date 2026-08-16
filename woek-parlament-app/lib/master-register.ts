import fs from "node:fs";
import path from "node:path";
import type { MasterRegisterItem } from "./master-register-shared";
export { isOpenRegisterStatus, polarityLabel, validityLabel } from "./master-register-shared";
export type { MasterRegisterItem } from "./master-register-shared";

export type MasterRegisterData = {
  schema_version: string;
  register_version: string;
  published_at: string;
  publisher: string;
  status: string;
  interpretation_boundary: string;
  statistics: {
    woek_ids: number;
    indicator_families: number;
    scoring_rules: number;
    sdg_plus_assignments: number;
  };
  public_schema: Array<Record<string, string>>;
  items: MasterRegisterItem[];
};

let registerCache: MasterRegisterData | null = null;

export function getMasterRegister(): MasterRegisterData {
  if (registerCache) return registerCache;
  const source = path.join(process.cwd(), "public", "downloads", "woek-masterregister", "v1.4", "register-v1.4.json");
  registerCache = JSON.parse(fs.readFileSync(source, "utf8")) as MasterRegisterData;
  return registerCache;
}

export function getMasterRegisterItem(woekId: string): MasterRegisterItem | undefined {
  const normalized = decodeURIComponent(woekId).toLocaleUpperCase("de-DE");
  return getMasterRegister().items.find((item) => item.WOK_ID.toLocaleUpperCase("de-DE") === normalized);
}
