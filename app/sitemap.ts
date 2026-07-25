import type { MetadataRoute } from "next";
import { isRunningHeatmapEnabled } from "@/lib/features";

const BASE_URL = "https://vuhnger.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // `/running` svarer 404 når bryteren er av, så den skal ikke ligge her og
  // invitere søkemotorer til en død adresse.
  const routes = ["", "/projects", "/cv", "/master", "/mst"];
  if (isRunningHeatmapEnabled) routes.push("/running");

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
