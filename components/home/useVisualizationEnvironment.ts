"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export type VisualizationEnvironment = {
  mobile: boolean;
  reducedMotion: boolean;
};

/**
 * Følger med på skjermbredde og `prefers-reduced-motion` og gir tilbake en
 * stabil `{ mobile, reducedMotion }`-tilstand. Delt av bakgrunnsvisualiseringene
 * som velger ulike innstillinger per miljø.
 */
export const useVisualizationEnvironment = (): VisualizationEnvironment => {
  const [environment, setEnvironment] = useState<VisualizationEnvironment>({
    mobile: false,
    reducedMotion: false,
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      const next = {
        mobile: mobileQuery.matches,
        reducedMotion: reducedMotionQuery.matches,
      };
      setEnvironment((current) =>
        current.mobile === next.mobile && current.reducedMotion === next.reducedMotion
          ? current
          : next,
      );
    };

    update();
    mobileQuery.addEventListener("change", update);
    reducedMotionQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      reducedMotionQuery.removeEventListener("change", update);
    };
  }, []);

  return environment;
};
