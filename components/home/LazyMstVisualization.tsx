"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MstVisualization = dynamic(() => import("./MstVisualization"), {
  ssr: false,
});

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const LazyMstVisualization = () => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setShouldRender(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return shouldRender ? <MstVisualization showGrid={false} /> : null;
};

export default LazyMstVisualization;
