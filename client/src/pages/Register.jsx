import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { registerStyles as s } from "../styles/authStyles";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

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
      const API = import.meta.env.VITE_API_URL;

      if (!API) {
        throw new Error("VITE_API_URL is not defined in Vercel.");
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
        <p style={s.subtitleStyle}>
          Create an account to manage your money.
        </p>

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

          <button type="submit" disabled={loading} style={s.btnStyle}>
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
