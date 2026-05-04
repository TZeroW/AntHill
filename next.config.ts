import type { NextConfig } from "next";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:5001";
const POSTS_API = process.env.NEXT_PUBLIC_POSTS_API || "http://localhost:5002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${AUTH_API}/api/auth/:path*`,
      },
      {
        source: "/api/posts/:path*",
        destination: `${POSTS_API}/api/posts/:path*`,
      },
      {
        source: "/api/colonias/:path*",
        destination: `${POSTS_API}/api/colonias/:path*`,
      },
    ];
  },
};

export default nextConfig;
