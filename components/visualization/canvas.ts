/**
 * Delte nettleser-hjelpere for canvas-bakgrunnene (A* og snake). Holder DOM- og
 * canvas-detaljene ett sted slik at selve visualiseringene bare beskriver hva
 * som skal tegnes.
 */

export type CssVarReader = (name: string, fallback: string) => string;

/**
 * Lager en funksjon som leser en CSS-variabel fra containeren, med fallback til
 * et designsystem-token på `:root`. Brukes til å la temaet styre canvas-fargene.
 */
export const createCssVarReader = (container: HTMLElement): CssVarReader => {
  const styles = getComputedStyle(container);
  const rootStyles = getComputedStyle(document.documentElement);
  return (name, fallback) =>
    styles.getPropertyValue(name).trim() || rootStyles.getPropertyValue(fallback).trim();
};

/**
 * Setter canvasens bakgrunnslager til å matche containerens størrelse ganget med
 * enhetens pikselforhold, og skalerer tegnekonteksten tilsvarende. Returnerer
 * CSS-størrelsen (i px) som visualiseringen regner rutenett ut fra.
 */
export const syncCanvasResolution = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  container: HTMLElement,
): { width: number; height: number } => {
  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(width * devicePixelRatio);
  const pixelHeight = Math.round(height * devicePixelRatio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  return { width, height };
};

/**
 * Kaller `onChange` hver gang temaet på `<html>` endrer seg (klasse,
 * `data-color-scheme` eller inline-stil). Returnerer en oppryddingsfunksjon.
 */
export const observeThemeChange = (onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-color-scheme", "style"],
  });
  return () => observer.disconnect();
};
