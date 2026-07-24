import { API_BASE_URL } from "./client";

/**
 * Fire-and-forget besøksnotis. Skal ALDRI kaste eller påvirke sidevisningen.
 *
 * Bruker `fetch` (ikke `sendBeacon`): endepunktet er cross-origin og krever
 * `Content-Type: application/json`, som utløser en CORS-preflight. `fetch`
 * håndterer preflighten (backend svarer på `OPTIONS`), mens `sendBeacon` ikke
 * kan preflighte og derfor ikke ville levere. `keepalive` lar kallet fullføre
 * selv om brukeren navigerer bort med en gang.
 *
 * `.catch` tar async-avvisning; `try/catch` tar en synkron throw (kan skje når
 * en nettleser-utvidelse wrapper `window.fetch`), som `.catch` alene ikke fanger.
 */
export function recordVisit(path: string, referrer: string): void {
  try {
    void fetch(`${API_BASE_URL}/site/visit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path, referrer }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Besøksregistrering skal aldri velte siden.
  }
}
