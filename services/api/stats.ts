import { fetchApi } from "./client";

type StravaYtdResponse = {
  data?: {
    run?: {
      distance?: unknown;
    };
  };
};

type StravaActivitiesResponse = {
  data?: unknown;
};

type WakaTimeResponse = {
  data?: {
    range?: unknown;
    categories?: unknown;
    total_seconds?: unknown;
    languages?: unknown;
  };
};

export type RunningActivity = {
  distance: number;
  movingTime?: number;
};

export type RunningStats = {
  distanceMeters?: number;
  activities: RunningActivity[];
};

export type CodingStats = {
  range?: string;
  totalSeconds?: number;
  languages: string[];
};

export async function fetchRunningStats(year: number, signal?: AbortSignal): Promise<RunningStats> {
  const [ytd, activitiesResponse] = await Promise.all([
    fetchApi<StravaYtdResponse>("/strava/stats/ytd", signal),
    fetchApi<StravaActivitiesResponse>(
      `/strava/activities?year=${year}&activity_type=Run&limit=500`,
      signal,
    ),
  ]);

  const distance = ytd.data?.run?.distance;
  const activities = Array.isArray(activitiesResponse.data)
    ? activitiesResponse.data.flatMap((activity): RunningActivity[] => {
        if (typeof activity !== "object" || activity === null || !("distance" in activity)) {
          return [];
        }

        const activityDistance = activity.distance;
        if (typeof activityDistance !== "number") return [];

        const movingTime = "moving_time" in activity ? activity.moving_time : undefined;
        return [
          {
            distance: activityDistance,
            movingTime: typeof movingTime === "number" ? movingTime : undefined,
          },
        ];
      })
    : [];

  return {
    distanceMeters: typeof distance === "number" ? distance : undefined,
    activities,
  };
}

export async function fetchCodingStats(signal?: AbortSignal): Promise<CodingStats> {
  const response = await fetchApi<WakaTimeResponse>("/wakatime/stats/weekly", signal);
  const data = response.data;
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const codingCategory = categories.find(
    (category) =>
      typeof category === "object" &&
      category !== null &&
      "name" in category &&
      category.name === "Coding",
  );
  const categorySeconds =
    typeof codingCategory === "object" &&
    codingCategory !== null &&
    "total_seconds" in codingCategory
      ? codingCategory.total_seconds
      : undefined;
  const languages = Array.isArray(data?.languages)
    ? data.languages.flatMap((language): string[] => {
        if (
          typeof language === "object" &&
          language !== null &&
          "name" in language &&
          typeof language.name === "string"
        ) {
          return [language.name];
        }
        return [];
      })
    : [];
  const totalSeconds =
    typeof categorySeconds === "number"
      ? categorySeconds
      : typeof data?.total_seconds === "number"
        ? data.total_seconds
        : undefined;

  return {
    range: typeof data?.range === "string" ? data.range : undefined,
    totalSeconds,
    languages: languages.slice(0, 4),
  };
}
