import type { NextConfig } from "next";

const IMAGE_CACHE_TIME_TO_LIVE_IN_SECONDS = 60 * 60 * 24 * 31;

const nextConfiguration: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@tulocal/authentication",
    "@tulocal/database",
    "@tulocal/environment",
    "@tulocal/storage",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    minimumCacheTTL: IMAGE_CACHE_TIME_TO_LIVE_IN_SECONDS,
  },
};

export default nextConfiguration;
