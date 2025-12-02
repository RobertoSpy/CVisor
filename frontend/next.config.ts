import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://backend:5000/api/:path*" },
    ];
  },
};

export default withPWA({
  dest: "public",
  disable: false, // Enable PWA in dev for testing
  register: true,
})(nextConfig);
