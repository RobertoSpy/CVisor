import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://backend:5000/api/:path*" },
      { source: "/uploads/:path*", destination: "http://backend:5000/uploads/:path*" },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: true, // Dezactivat temporar pentru debugging pe mobil
  register: true,
  workboxOptions: {
    importScripts: ["/custom-sw.js"],
    skipWaiting: true,
  }
})(nextConfig);
