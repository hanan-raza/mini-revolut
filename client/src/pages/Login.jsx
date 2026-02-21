// Login.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { loginStyles as s } from "../styles/authStyles";

export default function Login() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Keep your existing loading for email/password login
  const [loading, setLoading] = useState(false);

  // Separate loading for Google so you don't disable normal login weirdly
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // --- GOOGLE LOGIN LOGIC ---
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let pollId = null;
    let rendered = false;

    const tryInit = () => {
      if (rendered) return;
      if (!window.google?.accounts?.id) return;
      if (!googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            setGoogleLoading(true);
            setError("");

            if (!API) throw new Error("VITE_API_URL is not defined.");

            const res = await axios.post(`${API}/api/auth/google`, {
              credential: resp.credential,
            });

            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
          } catch (e) {
            console.error("Google login failed", e);
            setError(
              e?.response?.data?.message ||
                "Google authentication failed. Try again."
            );
            triggerShake();
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "320",
        shape: "rectangular",
      });

      rendered = true;
      if (pollId) clearInterval(pollId);
    };

    // Try immediately, then poll briefly until the script is ready
    tryInit();
    pollId = setInterval(tryInit, 200);

    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [navigate, API]);

  // Existing Auto-hide error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);
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
      if (!API) throw new Error("VITE_API_URL is not defined.");

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

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={s.btnStyle}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        {/* --- OR DIVIDER --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
            color: "#666",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
          <span style={{ padding: "0 10px", fontSize: "12px", fontWeight: "600" }}>
            OR
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
        </div>

        {/* --- GOOGLE BUTTON TARGET --- */}
        <div
          ref={googleBtnRef}
          style={{ display: "flex", justifyContent: "center" }}
        />

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