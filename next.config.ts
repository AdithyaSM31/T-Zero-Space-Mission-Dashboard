import type { NextConfig } from "next";

// Check if we are building for Android (Static Export)
const isAndroid = process.env.BUILD_TARGET === 'android';

const nextConfig: NextConfig = {
  // Only use static export for Android build
  ...(isAndroid ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allow all origins for APK access
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
