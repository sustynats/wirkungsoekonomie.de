import fs from "node:fs";
import path from "node:path";

export function parseEnvText(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equals = line.indexOf("=");
    if (equals <= 0) continue;
    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value.replace(/\\n/g, "\n");
  }
  return values;
}

export function loadEnvFile(filePath = ".env.local") {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return fs.existsSync(absolutePath) ? parseEnvText(fs.readFileSync(absolutePath, "utf8")) : {};
}

export function readConfigValue(key, fileValues = {}) {
  return process.env[key] ?? fileValues[key] ?? "";
}

export function stringifyEnv(values) {
  return `${Object.entries(values).map(([key, value]) => `${key}=${String(value).replace(/\n/g, "\\n")}`).join("\n")}\n`;
}
