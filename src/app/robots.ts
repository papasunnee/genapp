import type { MetadataRoute } from "next";

const rootDomain = process.env.ROOT_DOMAIN || "thelabsuite.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/platform", "/api", "/payment/callback", "/signup/success", "/unauthorized"],
    },
    sitemap: `https://${rootDomain}/sitemap.xml`,
  };
}
