import { API_BASE_URL } from "./client";

/**
 * Fire-and-forget besøksnotis. Skal ALDRI kaste eller påvirke sidevisningen.
 *
 * Bruker `fetch` med `keepalive` framfor `sendBeacon`. Begge leverer i praksis,
 * men `fetch` gir en response vi kan observere og teste — `sendBeacon` returnerer
 * bare «lagt i kø» og er dermed umulig å verifisere. Endepunktet er cross-origin
 * og krever `Content-Type: application/json`, som utløser en CORS-preflight;
 * backend svarer på `OPTIONS`. `keepalive` lar kallet fullføre selv om brukeren
 * navigerer bort med en gang.
 *
 * NB for framtidig feilsøking: `keepalive`-requests dukker IKKE opp i Resource
 * Timing, og verktøy som lytter utenfor sidekonteksten kan også gå glipp av dem.
 * At du ikke ser requesten betyr ikke at den ikke ble sendt. Verifiser ved å
 * wrappe `window.fetch` før hydrering (f.eks. via en same-origin iframe).
 * Verifisert i produksjon: 200 `{"ok":true}` ved vanlig sidelasting.
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
