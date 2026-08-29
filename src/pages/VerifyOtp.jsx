import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const { user, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || new URLSearchParams(location.search).get("email") || "";
  const redirect = location.state?.redirect || "/";
  const devOtp = location.state?.devOtp || null;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devHint, setDevHint] = useState(devOtp);

  // បើអ្នកប្រើបានផ្ទៀងផ្ទាត់រួចហើយ (login រួច) -> រំលងទំព័រនេះ
  useEffect(() => {
    if (user && email && user.email.toLowerCase() === email.toLowerCase()) {
      navigate(redirect, { replace: true });
    }
  }, [user, email, redirect, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const doVerify = async (val) => {
    if (!email) {
      setError("Missing email. Please go back and register first.");
      return;
    }
    if (val.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, val.trim());
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(v);
    setError("");
    // បញ្ចូលគ្រប់ 6 ខ្ទង់ -> ផ្ញើដោយស្វ័យប្រវត្តិ
    if (v.length === 6 && !loading) {
      doVerify(v);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doVerify(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setError("");
    setResent(false);
    setCode(""); // លុបលេខកូដចាស់ ដើម្បីឱ្យអ្នកប្រើបញ្ចូលលេខថ្មី
    try {
      const data = await resendOtp(email);
      if (data.dev_otp) setDevHint(data.dev_otp);
      setResent(true);
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!email) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No email found</h1>
        <p className="mt-2 text-slate-500">
          Please register first to receive a verification code.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700"
        >
          Go to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
            📧
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-700">{email}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        {devHint && (
          <p className="mt-5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            🧪 <strong>Dev mode:</strong> SMTP not configured, so the code was
            printed in the backend console instead. Try:{" "}
            <code className="font-bold">{devHint}</code>
          </p>
        )}

        {error && (
          <p className="mt-5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {resent && !error && (
          <p className="mt-5 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            ✓ A new code has been sent to your email.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={handleCodeChange}
              placeholder="••••••"
              className="mt-1.5 w-full text-center text-2xl font-bold tracking-[0.5em] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & continue"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-emerald-600 font-medium hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-400">
          <Link to="/login" className="hover:text-slate-600">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
