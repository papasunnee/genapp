import type { MetadataRoute } from "next";

const rootDomain = process.env.ROOT_DOMAIN || "thelabsuite.com";
const baseUrl = `https://${rootDomain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/demo", "/signup", "/terms", "/privacy", "/contact"];
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
