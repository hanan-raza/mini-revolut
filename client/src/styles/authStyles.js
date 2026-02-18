export const registerStyles = {
  pageStyle: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#F9FAFB",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
  },

  floatingError: {
    position: "absolute",
    top: "40px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 77, 77, 0.2)",
    padding: "12px 24px",
    borderRadius: "100px",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
    animation: "slideIn 0.3s ease-out",
    zIndex: 100,
  },

  errorDot: {
    width: "8px",
    height: "8px",
    background: "#ff4d4d",
    borderRadius: "50%",
    marginRight: "12px",
  },

  logoStyle: {
    fontSize: 32,
    fontWeight: 900,
    color: "#111827",
    letterSpacing: "-0.05em",
    margin: 0,
  },

  cardStyle: {
    width: "100%",
    maxWidth: 400,
    background: "white",
    padding: "40px 32px",
    borderRadius: 30,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
  },

  titleStyle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 8,
    color: "#111827",
  },

  subtitleStyle: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 24,
  },

  inputStyle: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    background: "#F9FAFB",
    color: "#111827",
  },

  labelStyle: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 6,
    letterSpacing: "0.05em",
  },

  btnStyle: {
    width: "100%",
    padding: "16px",
    borderRadius: 16,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
  },

  footerStyle: {
    marginTop: 24,
    textAlign: "center",
    borderTop: "1px solid #F3F4F6",
    paddingTop: 20,
  },

  linkStyle: {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
  },
};



// 🔥 LOGIN STYLES

export const loginStyles = {
  pageStyle: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
  },

  floatingError: registerStyles.floatingError,
  errorDot: registerStyles.errorDot,

  cardStyle: {
    width: "100%",
    maxWidth: "400px",
    background: "white",
    padding: "48px 40px",
    borderRadius: "32px",
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.04)",
    textAlign: "left",
  },

  logoStyle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: "32px",
    letterSpacing: "-1px",
  },

  titleStyle: {
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "24px",
    color: "#0f172a",
  },

  inputStyle: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "2px solid #f1f5f9",
    background: "#f8fafc",
    fontSize: "15px",
    color: "#0f172a",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },

  labelStyle: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  },

  btnStyle: {
    width: "100%",
    padding: "16px",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "18px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.3)",
  },

  footerText: {
    marginTop: "32px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },

  linkStyle: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
  },
};
