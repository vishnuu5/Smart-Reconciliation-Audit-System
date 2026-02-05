import React, { createContext, useState, useCallback, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      getProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      setError(null);

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email, password, name, role = "Viewer") => {
      setLoading(true);
      try {
        const response = await authAPI.register(email, password, name, role);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        setError(null);

        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    getProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
