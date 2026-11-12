import { z } from "zod";

const FORECAST_URL =
  "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.91&lon=10.75";
const FORECAST_REVALIDATE_SECONDS = 30 * 60;
const FORECAST_TIMEOUT_MS = 3_000;

const forecastSchema = z.object({
  properties: z.object({
    timeseries: z.array(
      z.object({
        time: z.string(),
        data: z.object({
          next_1_hours: z.object({ summary: z.object({ symbol_code: z.string() }) }).optional(),
        }),
      }),
    ),
  }),
});

type Forecast = z.output<typeof forecastSchema>;

const osloDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" });

export function snowsOnDay(forecast: Forecast, now: Date): boolean {
  const today = osloDate.format(now);
  return forecast.properties.timeseries.some(
    (entry) =>
      osloDate.format(new Date(entry.time)) === today &&
      entry.data.next_1_hours?.summary.symbol_code.includes("snow") === true,
  );
}

export async function isSnowingInOsloToday(): Promise<boolean> {
  try {
    const response = await fetch(FORECAST_URL, {
      headers: { "User-Agent": "vuhnger.dev https://vuhnger.dev" },
      next: { revalidate: FORECAST_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FORECAST_TIMEOUT_MS),
    });
    if (!response.ok) return false;
    return snowsOnDay(forecastSchema.parse(await response.json()), new Date());
  } catch {
    return false;
  }
}
