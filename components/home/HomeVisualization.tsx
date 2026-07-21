"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import {
  getBackgroundVisualization,
  subscribeToBackgroundVisualization,
} from "@/lib/background-visualization";

const MstVisualization = dynamic(() => import("./MstVisualization"), {
  ssr: false,
});
const AStarVisualization = dynamic(() => import("./AStarVisualization"), {
  ssr: false,
});

const HomeVisualization = () => {
  const visualization = useSyncExternalStore(
    subscribeToBackgroundVisualization,
    getBackgroundVisualization,
    () => "astar",
  );

  return visualization === "astar" ? (
    <AStarVisualization />
  ) : (
    <MstVisualization showGrid={false} />
  );
};

export default HomeVisualization;
