/** @type {import('next').NextConfig} */
const apiTarget = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  // Static HTML/JS export (-> `out/`). The whole app is a client-rendered SPA,
  // so a static export is the right deployment artifact (replaces Vite's `dist`).
  output: "export",
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
  // Plain <img> tags throughout the SPA; export requires unoptimized images.
  images: {
    unoptimized: true,
  },
  // Dev-only proxy (replaces the old Vite dev proxy). In production the app calls
  // NEXT_PUBLIC_API_URL directly, and static export has no server to rewrite — so
  // these are only registered for `next dev`.
  ...(isDev
    ? {
        async rewrites() {
          return [
            { source: "/api/:path*", destination: `${apiTarget}/api/:path*` },
            { source: "/uploads/:path*", destination: `${apiTarget}/uploads/:path*` },
            // SPA fallback: serve the index shell for any other deep route on a
            // hard refresh in dev (mirrors the host rewrite used in production).
            { source: "/:path*", destination: "/" },
          ];
        },
      }
    : {}),
};

export default nextConfig;
