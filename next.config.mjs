/** @type {import('next').NextConfig} */
const apiTarget = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  // The codebase was built under Vite/esbuild, which never type-checked or
  // linted during build. Keep those from blocking the production build so the
  // migration preserves existing behavior; tighten later as desired.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Using plain <img> tags throughout the SPA, so skip the Image Optimization
  // pipeline (no next/image usage to optimize).
  images: {
    unoptimized: true,
  },
  // Replaces the old Vite dev proxy: same-origin /api and /uploads requests are
  // forwarded to the backend, avoiding CORS.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiTarget}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiTarget}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
