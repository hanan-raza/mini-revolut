export default function Layout({ children, onLogout }) {
  return (
    <div
      style={{
        background: "#F9FAFB",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ 
        width: "100%", 
        maxWidth: 1000, 
        padding: "24px 20px" 
      }}>
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            background: "white",
            padding: "16px 24px",
            borderRadius: 20,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* FIXED LOGO SECTION */}
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.05em" }}>
            <span style={{ color: "#111827" }}>Mini</span> <span style={{ color: "#2563eb" }}>Revolut</span>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Logout
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}