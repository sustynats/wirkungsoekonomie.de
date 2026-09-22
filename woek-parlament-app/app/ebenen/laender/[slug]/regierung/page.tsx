// P1: render the existing content; do not duplicate or reinterpret its data.
export { default, generateStaticParams } from "@/app/laender/[slug]/regierung/page";
export const dynamicParams = false;
export const metadata = { title: "Bundesländer" };
