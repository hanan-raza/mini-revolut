// Register.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { registerStyles as s } from "../styles/authStyles";

export default function Register() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const API = import.meta.env.VITE_API_URL;

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

            // Same backend endpoint: it will create user if not exists, then return your JWT
            const res = await axios.post(`${API}/api/auth/google`, {
              credential: resp.credential,
            });

            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
          } catch (e) {
            console.error("Google signup/login failed", e);
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

    tryInit();
    pollId = setInterval(tryInit, 200);

    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [navigate, API]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      triggerShake();
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Use 8+ chars with Uppercase, Number & Symbol");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      if (!API) {
        throw new Error("VITE_API_URL is not defined.");
      }

      await axios.post(
        `${API}/api/auth/register`,
        { fullName, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (err) {
      console.error("Register error:", err);
      setError(err?.response?.data?.message || "Registration failed");
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

      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={s.logoStyle}>
          Mini <span style={{ color: "#2563eb" }}>Revolut</span>
        </h1>
      </div>

      <div
        style={{
          ...s.cardStyle,
          animation: isShaking ? "shake 0.5s border-box" : "none",
        }}
      >
        <h2 style={s.titleStyle}>Get started</h2>
        <p style={s.subtitleStyle}>Create an account to manage your money.</p>
        <div style={{ marginTop: 6, marginBottom: 16, textAlign: "center" }}>
          <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center" }} />
        </div>

        {/* --- OR DIVIDER --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "10px 0 20px",
            color: "#666",
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
          <span style={{ padding: "0 10px", fontSize: "12px", fontWeight: "600" }}>
            OR
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
        </div>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label style={s.labelStyle}>FULL NAME</label>
            <input
              required
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={s.inputStyle}
            />
          </div>

          <div>
            <label style={s.labelStyle}>EMAIL ADDRESS</label>
            <input
              required
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.inputStyle}
            />
          </div>

          <div>
            <label style={s.labelStyle}>PASSWORD</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={s.btnStyle}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div style={s.footerStyle}>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Already have an account?{" "}
            <Link to="/" style={s.linkStyle}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}