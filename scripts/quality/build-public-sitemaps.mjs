import path from "node:path";
import { buildPublicSitemaps } from "../lib/public-sitemaps.mjs";

const args = process.argv.slice(2);
const valueFor = (name) => args.find((argument) => argument.startsWith(`${name}=`))?.slice(name.length + 1);
const root = path.resolve(valueFor("--root") || "_site");
const result = buildPublicSitemaps(root, { check: args.includes("--check") });

console.log(
  `${args.includes("--check") ? "Verified" : "Built"} ${result.areas} public area sitemaps with ${result.routes} routes.`,
);
