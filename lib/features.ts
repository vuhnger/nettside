/**
 * Funksjonsbrytere.
 *
 * Leses på serveren, ikke i nettleseren: alt som gates her ligger i Server
 * Components, så verdien trenger ikke ut til klienten. Uten `NEXT_PUBLIC_`
 * havner den heller ikke i klientbunten.
 *
 * Alle brytere er av som standard. En bryter som må slås eksplisitt på kan ikke
 * lekke ut i produksjon fordi noen glemte å sette den; motsatt vei kan den det.
 */
export function isFeatureEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/**
 * Varmekartet over løpeturer: både `/running` og teaseren på forsiden.
 *
 * Verdien leses ved modulinnlasting, som for statisk prerenderte sider betyr
 * ved bygg. Å endre bryteren krever altså ny deploy — den er en utrullingsbryter,
 * ikke en kill switch man kan vri på i drift.
 */
export const isRunningHeatmapEnabled = isFeatureEnabled(
  process.env.RUNNING_HEATMAP_ENABLED,
);
