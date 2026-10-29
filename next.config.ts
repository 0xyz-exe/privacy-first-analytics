import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite", "pg", "bcryptjs"],
  experimental: {
    // optional optimizations
  },
};

export default nextConfig;
