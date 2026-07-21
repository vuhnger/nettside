import { z } from "zod";
import { fetchApi } from "./client";

const stravaYtdSchema = z.object({
  data: z.object({
    run: z.object({ distance: z.number().nonnegative() }).optional(),
  }),
});

const stravaActivitiesSchema = z.object({
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

export type RunningStats = {
  distanceMeters?: number;
  activities: RunningActivity[];
  distanceError: boolean;
  activitiesError: boolean;
};

export type CodingStats = {
  range?: string;
  totalSeconds?: number;
  languages: string[];
};

export async function fetchRunningStats(year: number): Promise<RunningStats> {
  const [ytdResult, activitiesResult] = await Promise.allSettled([
    fetchApi("/strava/stats/ytd", stravaYtdSchema),
    fetchApi(
      `/strava/activities?year=${year}&activity_type=Run&limit=500`,
      stravaActivitiesSchema,
    ),
  ]);

  const distance = ytdResult.status === "fulfilled" ? ytdResult.value.data.run?.distance : undefined;
  const activities =
    activitiesResult.status === "fulfilled"
      ? activitiesResult.value.data.map((activity) => ({
          distance: activity.distance,
          movingTime: activity.moving_time,
        }))
      : [];

  return {
    distanceMeters: distance,
    activities,
    distanceError: ytdResult.status === "rejected",
    activitiesError: activitiesResult.status === "rejected",
  };
}

export async function fetchCodingStats(): Promise<CodingStats> {
  const response = await fetchApi("/wakatime/stats/weekly", wakaTimeSchema);
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
