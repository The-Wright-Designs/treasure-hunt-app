import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin"],
  images: {
    deviceSizes: [425, 800, 1280],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
