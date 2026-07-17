import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB. Kept well above the 5MB image limit our upload actions
      // allow, so an oversized file always reaches our own validation (a clear
      // "too big" message) instead of a generic framework body-limit crash.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
