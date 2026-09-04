import { getPublicRegister } from "../../lib/register";
import { listPublishedCases } from "../../lib/cases";
import { portalStand } from "../../lib/portal-stand";

const objects = getPublicRegister();
const radar = listPublishedCases().filter((item) => item.kind === "RADAR");
console.log(JSON.stringify({ ...portalStand(objects, radar.map((item) => item.slug)), radarSlugs: radar.map((item) => item.slug), recordIds: objects.map((item) => item.id) }));
