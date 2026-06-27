import dynamic from "next/dynamic";

// The whole application is the existing React Router SPA. We mount it via an
// optional catch-all route with SSR disabled, so Next.js serves a single HTML
// shell for every path and the client-side router takes over — preserving the
// original structure and functionality while Next replaces Vite as the
// build/dev/server.
const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => null,
});

export default function SpaCatchAll() {
  return <App />;
}
