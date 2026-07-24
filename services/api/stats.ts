import { z } from "zod";
import { fetchApi } from "./client";

const stravaYtdSchema = z.object({
  data: z.object({
    run: z.object({ distance: z.number().nonnegative() }).optional(),
  }),
});

const stravaActivitiesSchema = z.object({
  total: z.number().nonnegative().optional(),
  data: z.array(
    z.object({
      distance: z.number().nonnegative(),
      moving_time: z.number().nonnegative().optional(),
    }),
  ),
});

const wakaTimeSchema = z.object({
  data: z.object({
    range: z.string().optional(),
    categories: z
      .array(z.object({ name: z.string(), total_seconds: z.number().nonnegative().optional() }))
      .optional(),
    total_seconds: z.number().nonnegative().optional(),
    languages: z.array(z.object({ name: z.string() })).optional(),
  }),
});

export type RunningActivity = {
  distance: number;
  movingTime?: number;
};

export type CodingStats = {
  range?: string;
  totalSeconds?: number;
  languages: string[];
};

export async function fetchRunningDistance(signal?: AbortSignal): Promise<number | undefined> {
  const response = await fetchApi("/strava/stats/ytd", stravaYtdSchema, signal);
  return response.data.run?.distance;
}

// API-et avviser limit over 200 (HTTP 422), så vi henter én side av gangen.
const ACTIVITIES_PAGE_SIZE = 200;
// Sikkerhetsgrense mot uendelig løkke (opptil 4000 turer på ett år).
const ACTIVITIES_MAX_PAGES = 20;

export async function fetchRunningActivities(
  year: number,
  signal?: AbortSignal,
): Promise<RunningActivity[]> {
  const activities: RunningActivity[] = [];

  for (let page = 0; page < ACTIVITIES_MAX_PAGES; page += 1) {
    const offset = page * ACTIVITIES_PAGE_SIZE;
    const response = await fetchApi(
      `/strava/activities?year=${year}&activity_type=Run&limit=${ACTIVITIES_PAGE_SIZE}&offset=${offset}`,
      stravaActivitiesSchema,
      signal,
    );

    for (const activity of response.data) {
      activities.push({ distance: activity.distance, movingTime: activity.moving_time });
    }

    // Kortere side enn sidestørrelsen (eller vi har nådd total) = siste side.
    const reachedTotal =
      response.total !== undefined && offset + response.data.length >= response.total;
    if (response.data.length < ACTIVITIES_PAGE_SIZE || reachedTotal) break;
  }

  return activities;
}

export async function fetchCodingStats(signal?: AbortSignal): Promise<CodingStats> {
  const response = await fetchApi("/wakatime/stats/weekly", wakaTimeSchema, signal);
  const data = response.data;
  const codingCategory = data.categories?.find((category) => category.name === "Coding");
  const languages = data.languages?.map((language) => language.name) ?? [];
  const totalSeconds = codingCategory?.total_seconds ?? data.total_seconds;

  return {
    range: data.range,
    totalSeconds,
    languages: languages.slice(0, 4),
  };
}
