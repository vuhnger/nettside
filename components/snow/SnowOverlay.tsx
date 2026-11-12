"use client";

import dynamic from "next/dynamic";

const SnowOverlay = dynamic(() => import("./Flakes"), { ssr: false });

export default SnowOverlay;
