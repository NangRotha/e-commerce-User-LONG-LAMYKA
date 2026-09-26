import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ApiStatusBanner from "./components/ApiStatusBanner";
import AlertCenter from "./components/AlertCenter";
import ChatWidget from "./components/ChatWidget";
import SocialContactDock from "./components/SocialContactDock";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import useSiteSettings from "./hooks/useSiteSettings";

/**
 * Storefront — គ្មាន Login / Sign Up / Profile
 * អតិថិជនអាចជ្រើសរើសទំនិញ រួចបង់ប្រាក់ជា Guest ដោយស្កេន KHQR (ABA / Bakong)។
 */
export default function App() {
  // ភ្ជាប់ Branding (Site Name / Tab Favicon Logo ពី Database)
  useSiteSettings();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden overflow-x-clip flex flex-col admin-mesh-bg text-slate-800 dark:text-slate-100 transition-colors duration-300 relative selection:bg-pink-100 selection:text-pink-900 font-sans">


      <ScrollToTop />
      <ApiStatusBanner />
      <Navbar />
      {/* Alerts / Popups ពី Admin (real-time auto-update) */}
      <AlertCenter />
      <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-x-clip">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      {/* Social Media floating dock (Telegram · Facebook · Instagram) */}
      <SocialContactDock />
      {/* AI Chatbot (DeepSeek) — floating widget */}
      <ChatWidget />
    </div>
  );
}

