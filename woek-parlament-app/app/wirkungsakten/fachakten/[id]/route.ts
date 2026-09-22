// P1: render the existing content; do not duplicate or reinterpret its data.
export { GET, generateStaticParams } from "@/app/fachakten/[id]/route";
export const dynamic = "force-static";
export const dynamicParams = false;
