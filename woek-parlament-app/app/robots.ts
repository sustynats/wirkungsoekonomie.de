import type { MetadataRoute } from "next";

const siteUrl = "https://parlament.wirkungsoekonomie.de";

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
