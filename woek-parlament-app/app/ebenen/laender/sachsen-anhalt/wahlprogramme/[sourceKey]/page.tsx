// P1: render the existing content; do not duplicate or reinterpret its data.
export { default, generateMetadata, generateStaticParams } from "@/app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page";
export const dynamic = "force-static";
export const dynamicParams = false;
