import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Bun runtime
  experimental: {
    // Allow server-side code to use Bun APIs
  },
  // Allow images from any domain (for favicons)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
