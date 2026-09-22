import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const appRoot = path.join(root, "app");
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function filesBelow(directory) {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? filesBelow(target) : [target];
  });
}

const layout = read("app/layout.tsx");
if (/force-dynamic|\bconnection\s*\(/.test(layout)) failures.push("Root layout must remain prerenderable (no force-dynamic or connection()).");

const proxy = read("proxy.ts");
if (!/"\/autopilot\/status\/:path\*"/.test(proxy) || !/"\/pruefstandard\/transparenz\/datenbetrieb\/:path\*"/.test(proxy)) {
  failures.push("Proxy matcher must stay limited to the two private operational routes.");
}
if (/source:\s*"\/\(\(\?!api/.test(proxy) || /Cache-Control["']?\s*,\s*["']private, no-store/.test(proxy.split("export const config")[1] ?? "")) {
  failures.push("Public routes must not pass through a broad no-store proxy.");
}

for (const filename of filesBelow(appRoot).filter((file) => /\/(page|layout)\.tsx$/.test(file))) {
  const source = readFileSync(filename, "utf8");
  const relative = path.relative(root, filename);
  if (/export const dynamic = ["']force-dynamic["']/.test(source)) failures.push(`${relative} forces request-time rendering.`);
  if (relative.includes("[") && relative.endsWith("/page.tsx") && !/generateStaticParams/.test(source)) {
    failures.push(`${relative} has a dynamic segment without generateStaticParams().`);
  }
}

for (const filename of filesBelow(appRoot).filter((file) => /\/route\.ts$/.test(file) && !file.includes(`${path.sep}api${path.sep}`))) {
  const source = readFileSync(filename, "utf8");
  const relative = path.relative(root, filename);
  if (/export const dynamic = ["']force-dynamic["']/.test(source)) failures.push(`${relative} forces a public route into request-time rendering.`);
  if (relative.includes("[") && !/generateStaticParams/.test(source)) failures.push(`${relative} has a dynamic segment without generateStaticParams().`);
}

for (const relative of [
  "app/api/parliament/cases/route.ts",
  "app/api/parliament/cases/[slug]/route.ts",
  "app/api/parliament/cases/[slug]/[resource]/route.ts",
  "app/api/parliament/upcoming/route.ts",
  "app/api/health/route.ts",
  "app/fachakten/[id]/route.ts",
  "app/regierung/akte/index.json/route.ts",
  "app/ebenen/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/index.json/route.ts",
  "app/wirkungsakten/fachakten/[id]/route.ts",
]) {
  if (!/export const dynamic = ["']force-static["']/.test(read(relative))) failures.push(`${relative} must remain a static read route.`);
}

if (failures.length) {
  console.error("STATIC_PUBLIC_RUNTIME=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("STATIC_PUBLIC_RUNTIME=PASS");
console.log("PUBLIC_PROXY_SCOPE=/autopilot/status/:path*,/pruefstandard/transparenz/datenbetrieb/:path*");
console.log("PUBLIC_READ_ROUTES=PRERENDERED");
