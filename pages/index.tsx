import dynamic from "next/dynamic";

// The whole application is the existing React Router SPA. We mount it here with
// SSR disabled, so the static export produces a single index.html shell and the
// client-side router takes over. Deep routes (e.g. /products) are served this
// same shell via the host's SPA fallback rewrite (_redirects / vercel.json /
// Amplify rewrite), and via the dev-only rewrite in next.config for `next dev`.
const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return <App />;
}
