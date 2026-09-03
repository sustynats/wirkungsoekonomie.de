import fs from "node:fs";

function parseScalar(raw) {
  const value = String(raw ?? "").trim();
  if (value === "[]" || value === "") return value === "[]" ? [] : "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => parseScalar(part.trim()));
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function readYamlList(filePath, rootKey) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const items = [];
  let current = null;
  let activeArrayKey = null;
  let inRoot = false;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!line.startsWith(" ") && line.trim() === `${rootKey}:`) {
      inRoot = true;
      continue;
    }
    if (!inRoot) continue;

    const itemMatch = line.match(/^  -\s+([A-Za-z0-9_-]+):\s*(.*)$/);
    if (itemMatch) {
      if (current) items.push(current);
      current = {};
      activeArrayKey = null;
      current[itemMatch[1]] = parseScalar(itemMatch[2]);
      continue;
    }

    if (!current) continue;

    const keyMatch = line.match(/^    ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, raw] = keyMatch;
      const parsed = parseScalar(raw);
      current[key] = parsed;
      activeArrayKey = raw.trim() === "" ? key : null;
      if (activeArrayKey) current[activeArrayKey] = [];
      continue;
    }

    const arrayMatch = line.match(/^      -\s*(.*)$/);
    if (arrayMatch && activeArrayKey) {
      current[activeArrayKey].push(parseScalar(arrayMatch[1]));
    }
  }

  if (current) items.push(current);
  return items;
}

export function readKeyedSynonyms(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const result = {};
  let key = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const root = line.match(/^([A-Za-z0-9_+.-]+):\s*$/);
    if (root) {
      key = root[1];
      result[key] = [];
      continue;
    }
    const item = line.match(/^  -\s*(.*)$/);
    if (key && item) result[key].push(parseScalar(item[1]));
  }
  return result;
}

