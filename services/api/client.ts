const API_BASE_URL = "https://api.vuhnger.dev";

export async function fetchApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`API-kallet feilet med status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function fetchApiStatus(signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/strava/health`, {
    cache: "no-store",
    signal,
  });

  return response.ok;
}
