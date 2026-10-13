import path from "node:path";
import { DEFAULT_MANIFEST, writePublicRoutes } from "../lib/public-routes.mjs";

const args = process.argv.slice(2);
const valueFor = (name) => args.find((argument) => argument.startsWith(`${name}=`))?.slice(name.length + 1);
const root = path.resolve(valueFor("--root") || "_site");
const output = path.resolve(valueFor("--output") || path.join(root, DEFAULT_MANIFEST));
const check = args.includes("--check");

const manifest = writePublicRoutes(root, output, { check });
console.log(
  `${check ? "Verified" : "Built"} public route manifest: ${manifest.counts.routes} routes from ${manifest.counts.htmlFiles} HTML files; `
  + `${Object.values(manifest.counts.excluded).reduce((total, count) => total + count, 0)} intentionally excluded.`,
);
