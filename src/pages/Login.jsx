import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TelegramLoginButton from "../components/TelegramLoginButton";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.redirect || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirect, { replace: true });
    } catch (err) {
      // បើគណនីមិនទាន់បានផ្ទៀងផ្ទាត់ OTP -> បញ្ជូនទៅទំព័រ Verify OTP
      if (err.message.toLowerCase().includes("verify")) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`, {
          state: { email, redirect },
        });
        return;
      }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-8 sm:p-10 animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
            🛍️
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Log in to your account to continue shopping.
          </p>
        </div>

        {error && (
          <p className="mt-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400 uppercase">or</span>
          <span className="flex-1 border-t border-slate-200" />
        </div>
        <div className="mt-4 flex justify-center">
          <TelegramLoginButton redirect={redirect} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            state={{ redirect }}
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
