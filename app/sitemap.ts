import type { MetadataRoute } from "next";

const BASE_URL = "https://vuhnger.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/projects", "/cv", "/master", "/mst", "/running"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
