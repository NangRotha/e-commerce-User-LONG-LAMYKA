import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function IconBase({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </IconBase>
  );
}

function LoaderIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </IconBase>
  );
}

function SaveIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconBase>
  );
}

function KeyIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </IconBase>
  );
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // សម្រាប់ប្តូរពាក្យសម្ងាត់
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfileImage(user.profile_image || "");
    }
  }, [user]);

  // បើមិនទាន់ចូលប្រើ -> បញ្ជូនទៅ Login
  useEffect(() => {
    if (user === null && !localStorage.getItem("shop_token")) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const flash = (setter, text) => {
    setter(text);
    setTimeout(() => setter(""), 3000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await api.uploadProfileImage(file);
      setProfileImage(res.url);
      await refreshUser();
      flash(setMsg, "✓ Profile photo updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSavingName(true);
    setError("");
    try {
      await api.updateProfile({ name: name.trim(), profile_image: profileImage });
      await refreshUser();
      flash(setMsg, "✓ Name updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    if (newPw.length < 6) {
      setPwMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg("New passwords do not match.");
      return;
    }
    setChangingPw(true);
    try {
      const res = await api.changePassword({
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      flash(setPwMsg, `✓ ${res.message}`);
    } catch (err) {
      setPwMsg(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const input =
    "mt-1.5 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm";
  const label = "block text-sm font-medium text-slate-700";

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your photo, name and password.
        </p>
      </div>

      {/* ============ Profile photo + info ============ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-emerald-100">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="profile-image"
            />
            <label
              htmlFor="profile-image"
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition shadow"
              title="Upload profile photo"
            >
              {uploading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CameraIcon className="w-4 h-4" />
              )}
            </label>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">
              {user.name || user.email}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {user.role === "admin" ? "Admin" : "Customer"}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {msg && (
          <p className="mt-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {msg}
          </p>
        )}

        {/* ============ Name ============ */}
        <form onSubmit={saveName} className="mt-6">
          <label className={label}>Name</label>
          <div className="mt-2 flex gap-3">
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <button
              type="submit"
              disabled={savingName}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-sm disabled:opacity-60"
            >
              <SaveIcon className="w-4 h-4" />
              {savingName ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>


      {/* ============ Password ============ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <KeyIcon className="w-5 h-5 text-emerald-600" />
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your current password and a new one.
        </p>

        {pwMsg && (
          <p
            className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
              pwMsg.startsWith("✓")
                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                : "text-rose-600 bg-rose-50 border-rose-200"
            }`}
          >
            {pwMsg}
          </p>
        )}

        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <div>
            <label className={label}>Current password</label>
            <input
              type="password"
              className={input}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>New password</label>
              <input
                type="password"
                className={input}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div>
              <label className={label}>Confirm new password</label>
              <input
                type="password"
                className={input}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={changingPw}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition text-sm disabled:opacity-60"
            >
              {changingPw ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyIcon className="w-4 h-4" />
                  Update password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

