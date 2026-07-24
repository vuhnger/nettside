import { API_BASE_URL } from "./client";

/**
 * Sender en fire-and-forget besøksnotis til API-et. Skal ALDRI kaste eller
 * påvirke sidevisningen.
 *
 * Bruker `navigator.sendBeacon` når det finnes: det er laget nettopp for dette,
 * fullfører selv om brukeren navigerer bort, og påvirkes ikke av kode som
 * wrapper `window.fetch` (f.eks. nettleser-utvidelser som ellers kan få `fetch`
 * til å kaste synkront). Faller tilbake til `fetch` med `keepalive`. Alt er
 * pakket i try/catch fordi selv `.catch()` ikke fanger en synkron throw.
 */
export function recordVisit(path: string, referrer: string): void {
  const url = `${API_BASE_URL}/site/visit`;
  const payload = JSON.stringify({ path, referrer });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Besøksregistrering skal aldri velte siden.
  }
}
