import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["http://host.docker.internal", "http://host.docker.internal:3000"],
};

export default nextConfig;
