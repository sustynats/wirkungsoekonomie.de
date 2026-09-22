import type { MetadataRoute } from "next";

const siteUrl = "https://parlament.wirkungsoekonomie.de";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/redaktion/"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
