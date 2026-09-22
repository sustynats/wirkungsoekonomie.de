import MinistryDetailPage, {
  generateMetadata as generateRessortMetadata,
  generateStaticParams as generateRessortStaticParams
} from "@/app/regierung/ressorts/[id]/page";

export const dynamicParams = false;

export function generateStaticParams() {
  return generateRessortStaticParams();
}

export const generateMetadata = generateRessortMetadata;

export default MinistryDetailPage;
