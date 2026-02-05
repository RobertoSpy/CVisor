import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://backend:5000/api/:path*" },
      { source: "/uploads/:path*", destination: "http://backend:5000/uploads/:path*" },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Enable in production
  register: true,
  workboxOptions: {
    importScripts: ["/custom-sw.js"],
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-assets",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\/api\/users\/me|\/api\/wallet/,
        handler: "NetworkFirst",
        options: {
          cacheName: "user-data",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 24 * 60 * 60, // 1 Day
          },
        },
      },
      {
        urlPattern: /\/api\/opportunities|\/api\/organizations\/explore/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "public-feeds",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 Day
          },
        },
      },
      {
        urlPattern: /\/api\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "apis",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 Day
          },
        },
      },
    ],
  },
})(nextConfig);
