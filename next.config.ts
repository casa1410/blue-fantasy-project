import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, smaller than the 5MB image limit our upload actions allow.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
