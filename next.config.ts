import type { NextConfig } from "next";

// Check if we are building for Android (Static Export)
const isAndroid = process.env.BUILD_TARGET === 'android';

const nextConfig: NextConfig = {
  // Only use static export for Android build
  ...(isAndroid ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
