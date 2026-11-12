"use client";

import { useState } from "react";
import Snowfall from "react-snowfall";
import { motion } from "framer-motion";

const SKIP_QUERY = "(max-width: 767px), (prefers-reduced-motion: reduce)";
const SNOW_SECONDS = 10;

const Flakes = () => {
  const [falling, setFalling] = useState(() => !window.matchMedia(SKIP_QUERY).matches);

  if (!falling) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: SNOW_SECONDS, times: [0, 0.8, 1] }}
      onAnimationComplete={() => setFalling(false)}
    >
      <Snowfall color="#b8c4dc" snowflakeCount={120} radius={[1, 4]} />
    </motion.div>
  );
};

export default Flakes;
