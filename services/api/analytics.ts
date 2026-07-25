import { API_BASE_URL } from "./client";

/**
 * Fire-and-forget besøksnotis. Skal ALDRI kaste eller påvirke sidevisningen.
 *
 * Bruker `fetch`, ikke `sendBeacon`. Målt i produksjon med `sendBeacon`-varianten:
 * ingen request til `/site/visit` ved vanlig sidelasting (6 lastinger, 0 treff),
 * mens klientside-navigasjon ga 200. Altså ble akkurat landingsbesøket – det
 * eneste de fleste besøkende utløser – aldri registrert. `fetch` med `keepalive`
 * er verifisert mot samme endepunkt fra origin `vuhnger.dev` (200 `{"ok":true}`),
 * håndterer CORS-preflighten som `Content-Type: application/json` krever, og lar
 * kallet fullføre selv om brukeren navigerer bort med en gang.
 *
 * Hele kroppen ligger i `try` fordi URL-bygging utenfor `try` ville kunne kaste
 * ufanget. `.catch` tar async-avvisning; `try/catch` tar en synkron throw (skjer
 * når en nettleser-utvidelse wrapper `window.fetch`), som `.catch` ikke fanger.
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
