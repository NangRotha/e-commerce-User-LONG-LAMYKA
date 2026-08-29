import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser] = useState(null);

  // ទាញ Profile ពេញ (ឈ្មោះ + រូប Profile) ពី /api/users/me
  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return null;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      return me;
    } catch {
      // Token មិនត្រឹមត្រូវ -> ប្រើព័ត៌មានពី JWT ជាបណ្ដោះអាសន្ន
      const payload = parseJwt(getToken());
      setUser(
        payload && payload.sub
          ? { email: payload.sub, role: payload.role || "user" }
          : null
      );
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setUser(null);
    }
  }, [token, refreshUser]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.access_token);
    setTokenState(data.access_token);
    await refreshUser();
  };

  const register = async (name, email, password) => {
    // គ្រាន់តែបង្កើតគណនី (អត់ auto-login) — តម្រូវឱ្យផ្ទៀងផ្ទាត់ OTP មុន
    return api.register({ name, email, password });
  };

  const verifyOtp = async (email, code) => {
    const data = await api.verifyOtp({ email, code });
    setToken(data.access_token);
    setTokenState(data.access_token);
    await refreshUser();
  };

  const resendOtp = async (email) => api.resendOtp({ email });

  const loginWithTelegram = async (tgData) => {
    // tgData = { id, first_name, last_name, username, photo_url, auth_date, hash }
    const data = await api.telegramLogin(tgData);
    setToken(data.access_token);
    setTokenState(data.access_token);
    await refreshUser();
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        verifyOtp,
        resendOtp,
        loginWithTelegram,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
