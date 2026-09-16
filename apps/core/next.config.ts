import type { NextConfig } from "next";

const nextConfiguration: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@tulocal/authentication",
    "@tulocal/database",
    "@tulocal/environment",
    "@tulocal/storage",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfiguration;
