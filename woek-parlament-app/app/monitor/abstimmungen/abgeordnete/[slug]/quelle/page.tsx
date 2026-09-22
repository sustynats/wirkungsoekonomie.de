// P1: render the existing content; do not duplicate or reinterpret its data.
export { default, generateMetadata, generateStaticParams } from "@/app/abgeordnete/[slug]/quelle/page";
export const dynamic = "force-static";
export const dynamicParams = false;
