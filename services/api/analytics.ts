import { API_BASE_URL } from "./client";

/**
 * Sender en fire-and-forget besøksnotis til API-et. Feiler stille og blokkerer
 * aldri sidevisningen. `keepalive` lar requesten fullføre selv om brukeren
 * navigerer bort med en gang.
 */
export function recordVisit(path: string, referrer: string): void {
  void fetch(`${API_BASE_URL}/site/visit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, referrer }),
    keepalive: true,
  }).catch(() => {});
}
