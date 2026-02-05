import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let success;
      if (isRegister) {
        success = await register(email, password, name || "User", "Viewer");
      } else {
        success = await login(email, password);
      }

      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-linear-to-br from-primary to-blue-600 flex items-center justify-center p-4"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundImage: "linear-gradient(to bottom right, #3b82f6, #2563eb)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8" style={{ marginBottom: "2rem" }}>
          <h1 className="text-4xl font-bold text-white mb-2">ReconcileAI</h1>
          <p className="text-blue-100">Smart Reconciliation & Audit System</p>
        </div>
        <div className="card">
          <h2
            className="text-2xl font-bold text-dark mb-6 text-center"
            style={{ marginBottom: "1.5rem", textAlign: "center" }}
          >
            {isRegister ? "Create Account" : "Sign In"}
          </h2>
          {error && (
            <div
              className="flex gap-3 p-4 bg-red-50 text-danger rounded-lg mb-4"
              style={{ marginBottom: "1rem" }}
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div style={{ marginBottom: "1rem" }}>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center" style={{ marginTop: "1.5rem" }}>
            <p className="text-gray-600 text-sm">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary font-semibold hover:underline"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>
          <div
            className="mt-6 pt-6 border-t"
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Email: demo@example.com</p>
            <p className="text-xs text-gray-500">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
