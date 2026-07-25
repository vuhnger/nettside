import { z } from "zod";

/**
 * Kan peke et annet sted for å kjøre mot et lokalt API eller et mock-endepunkt,
 * uten at koden endres. Uten variabelen går alt mot produksjon som før.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vuhnger.dev";
const API_REVALIDATE_SECONDS = 5 * 60;
const API_TIMEOUT_MS = 5_000;

export async function fetchApi<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  signal?: AbortSignal,
): Promise<z.output<TSchema>> {
  const options =
    typeof window === "undefined"
      ? { next: { revalidate: API_REVALIDATE_SECONDS } }
      : undefined;
  const timeoutSignal = AbortSignal.timeout(API_TIMEOUT_MS);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  });

  if (!response.ok) {
    throw new Error(`API-kallet feilet med status ${response.status}.`);
  }

  const body: unknown = await response.json();
  return schema.parse(body);
}
