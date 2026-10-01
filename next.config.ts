import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
  serverExternalPackages: ["firebase-admin"],
  images: {
    deviceSizes: [425, 800, 1280],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
