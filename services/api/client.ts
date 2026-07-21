import { z } from "zod";

const API_BASE_URL = "https://api.vuhnger.dev";
const API_REVALIDATE_SECONDS = 15 * 60;

export async function fetchApi<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: API_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`API-kallet feilet med status ${response.status}.`);
  }

  const body: unknown = await response.json();
  return schema.parse(body);
}
