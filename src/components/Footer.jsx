import { Link } from "react-router-dom";
import useSiteSettings from "../hooks/useSiteSettings";

export default function Footer() {
  const s = useSiteSettings();
  const siteName = s.site_name || "E-Commerce Store";
  const siteLogo = s.site_logo || "";

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-emerald-600">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt={siteName}
                  className="h-8 w-auto max-w-[140px] object-contain"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span aria-hidden>🛍️</span>
              )}
              <span>{siteName}</span>
            </Link>
            <p className="text-sm text-slate-400 text-center md:text-left max-w-xs">
              Discover amazing products at unbeatable prices. Shop the latest trends today.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-500 hover:text-emerald-600 transition">
              Shop
            </Link>
            <Link to="/cart" className="text-slate-500 hover:text-emerald-600 transition">
              Cart
            </Link>
            <Link to="/profile" className="text-slate-500 hover:text-emerald-600 transition">
              My account
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
