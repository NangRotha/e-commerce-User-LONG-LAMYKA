import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useSiteSettings from "../hooks/useSiteSettings";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const s = useSiteSettings();
  const siteName = s.site_name || "ShopNow";
  const siteLogo = s.site_logo || "";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold text-emerald-600 shrink-0">
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
          <span className="truncate">{siteName}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Shop
          </NavLink>

          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
                title="My profile"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden md:inline text-sm text-slate-600 max-w-[140px] truncate">
                  {user.name || user.email}
                </span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}

          <Link
            to="/cart"
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition active:scale-90"
            aria-label={`Cart, ${count} items`}
          >
            <span aria-hidden className="text-xl leading-none">
              🛒
            </span>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center animate-pop-in"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
