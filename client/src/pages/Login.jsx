// Login.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { loginStyles as s } from "../styles/authStyles";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Auto-hide error after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please check your email format");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      // ✅ FIX: call Render backend, not Vercel
      const API = import.meta.env.VITE_API_URL; // e.g. https://mini-revolut.onrender.com
      if (!API) throw new Error("VITE_API_URL is not defined in Vercel.");

      const res = await axios.post(`${API}/api/auth/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Incorrect email or password");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.pageStyle}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>

      {/* ULTRA BEAUTIFUL FLOATING ERROR */}
      {error && (
        <div style={s.floatingError}>
          <div style={s.errorDot} />
          {error}
        </div>
      )}

      <div
        style={{
          ...s.cardStyle,
          animation: isShaking ? "shake 0.5s border-box" : "none",
        }}
      >
        <h1 style={s.logoStyle}>
          Mini <span style={{ color: "#2563eb" }}>Revolut</span>
        </h1>
        <h2 style={s.titleStyle}>Welcome back</h2>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label style={s.labelStyle}>EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...s.inputStyle,
                borderColor:
                  error && !email.includes("@") ? "#ff4d4d" : s.inputStyle.border,
              }}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label style={s.labelStyle}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...s.inputStyle,
                borderColor:
                  error && password.length < 1 ? "#ff4d4d" : s.inputStyle.border,
              }}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={s.btnStyle}>
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        <p style={s.footerText}>
          New to Mini Revolut?{" "}
          <Link to="/register" style={s.linkStyle}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
