"use client";

import { Network, Route } from "lucide-react";
import { useSyncExternalStore } from "react";

import {
  getBackgroundVisualization,
  setBackgroundVisualization,
  subscribeToBackgroundVisualization,
} from "@/lib/background-visualization";

const BackgroundVisualizationToggle = () => {
  const visualization = useSyncExternalStore(
    subscribeToBackgroundVisualization,
    getBackgroundVisualization,
    () => "astar",
  );
  const isAStar = visualization === "astar";

  const toggleVisualization = () => {
    setBackgroundVisualization(isAStar ? "mst" : "astar");
  };

  return (
    <button
      type="button"
      onClick={toggleVisualization}
      aria-label="A-star-bakgrunn"
      aria-pressed={isAStar}
      title={isAStar ? "Vis MST-bakgrunn" : "Vis A-star-bakgrunn"}
      style={{
        width: "2rem",
        height: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid var(--ds-color-accent-base-default)",
        borderRadius: "0.375rem",
        backgroundColor: "transparent",
        color: "var(--ds-color-accent-base-default)",
        cursor: "pointer",
        boxShadow: "var(--accent-shadow)",
        transition: "color 0.2s, background-color 0.2s, box-shadow 0.2s",
      }}
    >
      {isAStar ? (
        <Route aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
      ) : (
        <Network aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
      )}
    </button>
  );
};

export default BackgroundVisualizationToggle;
