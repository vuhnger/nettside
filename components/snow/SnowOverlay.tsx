"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const Snowfall = dynamic(() => import("react-snowfall"), { ssr: false });

const SnowOverlay = () => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion !== false) return null;

  return (
    <Snowfall
      color="#b8c4dc"
      snowflakeCount={120}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 50 }}
    />
  );
};

export default SnowOverlay;
