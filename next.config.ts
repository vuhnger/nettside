import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["http://host.docker.internal", "http://host.docker.internal:3000"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
