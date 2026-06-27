import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "./components/layout/Loader";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgress from "./components/ui/scroll-progress";

// Eagerly loaded: landing page + the always-mounted 404 keep first paint instant.
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Route-level code splitting: every other page ships in its own chunk and is
// only fetched when the user navigates to it, shrinking the initial bundle.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const IlkalSarees = lazy(() => import("./pages/IlkalSarees"));
const OurStory = lazy(() => import("./pages/OurStory"));
const ShippingDelivery = lazy(() => import("./pages/ShippingDelivery"));
const ReturnsExchange = lazy(() => import("./pages/ReturnsExchange"));
const FAQs = lazy(() => import("./pages/FAQs"));
const TheArtisans = lazy(() => import("./pages/TheArtisans"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const YourAccount = lazy(() => import("./pages/YourAccount"));
const YourAddresses = lazy(() => import("./pages/YourAddresses"));
const SwitchAccount = lazy(() => import("./pages/SwitchAccount"));

// Non-critical, always-mounted widgets: deferred so they never block first paint.
const Chatbot = lazy(() => import("./components/Chatbot"));
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to handle scroll to section on navigation
const ScrollToSection = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation for any ID
    const hash = location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else if (location.state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(location.state.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location]);

  return null;
};

// Lightweight fallback shown only while a lazily-loaded route chunk is fetched.
const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/category/:slug/:subslug" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/account" element={<YourAccount />} />
            <Route path="/addresses" element={<YourAddresses />} />
            <Route path="/switch-account" element={<SwitchAccount />} />
            <Route path="/ilkal-sarees" element={<IlkalSarees />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/shipping-delivery" element={<ShippingDelivery />} />
            <Route path="/returns-exchange" element={<ReturnsExchange />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/artisans" element={<TheArtisans />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showLoader && <Loader onComplete={() => setShowLoader(false)} />}
        <ScrollProgress />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ScrollToSection />
          <AnimatedRoutes />
          <Suspense fallback={null}>
            <WhatsAppButton />
            <Chatbot />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
