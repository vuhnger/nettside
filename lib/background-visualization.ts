export type BackgroundVisualization = "mst" | "astar";

const STORAGE_KEY = "background-visualization";
const CHANGE_EVENT = "background-visualization-change";
let memoryVisualization: BackgroundVisualization | null = null;

export const parseBackgroundVisualization = (value: string | null): BackgroundVisualization =>
  value === "mst" ? "mst" : "astar";

export const getBackgroundVisualization = (): BackgroundVisualization => {
  try {
    memoryVisualization = parseBackgroundVisualization(window.localStorage.getItem(STORAGE_KEY));
    return memoryVisualization;
  } catch {
    return memoryVisualization ?? "astar";
  }
};

export const setBackgroundVisualization = (visualization: BackgroundVisualization) => {
  memoryVisualization = visualization;
  try {
    window.localStorage.setItem(STORAGE_KEY, visualization);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const subscribeToBackgroundVisualization = (onStoreChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange();
  };

  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
};
