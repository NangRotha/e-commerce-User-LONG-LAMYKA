import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ApiStatusBanner from "./components/ApiStatusBanner";
import AlertCenter from "./components/AlertCenter";
import ChatWidget from "./components/ChatWidget";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <ApiStatusBanner />
      <Navbar />
      {/* Alerts / Popups ពី Admin (real-time auto-update) */}
      <AlertCenter />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      {/* AI Chatbot (DeepSeek) — floating widget */}
      <ChatWidget />
    </div>
  );
}

