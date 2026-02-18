// src/pages/Dashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { dashboardStyles as s } from "../styles/dashboardStyles";

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("");
  const [myId, setMyId] = useState("");

  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("all");

  const [txCursor, setTxCursor] = useState(null);
  const [hasMoreTxs, setHasMoreTxs] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(false);

  const MAX_AMOUNT = 10000;

  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const [toast, setToast] = useState({ show: false, type: "error", title: "", message: "" });
  const toastTimerRef = useRef(null);

  const listRef = useRef(null);

  const normalizeId = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "object" && v.$oid) return String(v.$oid);
    if (typeof v === "object" && v._id) return normalizeId(v._id);
    if (typeof v === "object" && v.id) return String(v.id);
    return String(v);
  };

  const getName = (u) => u?.fullName || u?.email || "User";
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  const toNumber = (v) => {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };

  const showToast = (type, title, message, ms = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, title, message });
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  async function refresh() {
    try {
      const res = await api.get("/dashboard");
      if (res.data?.user) {
        setUserName(res.data.user.fullName || res.data.user.email);
        setMyId(normalizeId(res.data.user._id));
      }
      if (res.data?.wallet) setBalance(res.data.wallet.balance);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    }
  }

  const getTxParamsFromFilter = (f) => {
    if (f === "deposit") return { type: "deposit" };
    if (f === "withdrawal") return { type: "withdrawal" };
    if (f === "sent") return { direction: "sent" };
    if (f === "received") return { direction: "received" };
    return {};
  };

  const fetchTxs = async ({ reset = false } = {}) => {
    if (loadingTxs) return;

    setLoadingTxs(true);
    try {
      const limit = 20;
      const cursor = reset ? null : txCursor;

      const params = {
        limit,
        ...getTxParamsFromFilter(filter),
        ...(cursor ? { cursor } : {}),
      };

      const res = await api.get("/transactions", { params });

      const newTxs = res.data?.transactions || [];
      setTxs((prev) => (reset ? newTxs : [...prev, ...newTxs]));
      setTxCursor(res.data?.nextCursor || null);
      setHasMoreTxs(!!res.data?.hasMore);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      showToast("error", "Oops", "Could not load transactions");
    } finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    refresh();
    fetchTxs({ reset: true });

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTxCursor(null);
    setHasMoreTxs(true);
    fetchTxs({ reset: true });

    if (listRef.current) listRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleAction = async () => {
    if (!confirmData) return;
    setLoading(true);
    try {
      const { type, amount, target } = confirmData;

      if (type === "deposit") await api.post("/wallet/deposit", { amount: Number(amount) });
      if (type === "withdraw") await api.post("/wallet/withdraw", { amount: Number(amount) });
      if (type === "transfer") await api.post("/transfer", { recipientEmail: target, amount: Number(amount) });

      setDepositAmount("");
      setWithdrawAmount("");
      setRecipientEmail("");
      setAmount("");
      setConfirmData(null);

      await refresh();
      setTxCursor(null);
      setHasMoreTxs(true);
      await fetchTxs({ reset: true });

      if (listRef.current) listRef.current.scrollTop = 0;

      showToast("success", "Done", "Action completed");
    } catch (e) {
      const msg = e?.response?.data?.message || "Action failed";
      showToast("error", "Oops", msg);
    } finally {
      setLoading(false);
    }
  };

  const displayTxs = useMemo(() => {
    const myIdStr = normalizeId(myId);

    return txs.filter((t) => {
      const senderId = normalizeId(t.sender);
      const receiverId = normalizeId(t.receiver);

      if (filter === "all") return true;
      if (filter === "deposit") return t.type === "deposit";
      if (filter === "withdrawal") return t.type === "withdrawal";
      if (filter === "sent") return t.type === "transfer" && senderId === myIdStr;
      if (filter === "received") return t.type === "transfer" && receiverId === myIdStr;
      return true;
    });
  }, [txs, filter, myId]);

  const onTxScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;

    if (nearBottom && hasMoreTxs && !loadingTxs) {
      fetchTxs();
    }
  };

  const openTransferConfirm = () => {
    const email = String(recipientEmail).trim();
    const n = toNumber(amount);

    if (!isValidEmail(email)) return showToast("error", "Invalid recipient", "Please enter a valid email address.");
    if (!Number.isFinite(n) || n <= 0) return showToast("error", "Invalid amount", "Please enter a valid amount.");
    if (n > MAX_AMOUNT) return showToast("error", "Limit reached", `Max transfer is €${MAX_AMOUNT.toLocaleString()}.`);
    setConfirmData({ type: "transfer", amount: n, target: email });
  };

  const openDepositConfirm = () => {
    const n = toNumber(depositAmount);
    if (!Number.isFinite(n) || n <= 0) return showToast("error", "Invalid deposit", "Please enter a valid deposit amount.");
    if (n > MAX_AMOUNT) return showToast("error", "Limit reached", `Max deposit is €${MAX_AMOUNT.toLocaleString()}.`);
    setConfirmData({ type: "deposit", amount: n });
  };

  const openWithdrawConfirm = () => {
    const n = toNumber(withdrawAmount);
    if (!Number.isFinite(n) || n <= 0) return showToast("error", "Invalid withdrawal", "Please enter a valid withdraw amount.");
    if (n > MAX_AMOUNT) return showToast("error", "Limit reached", `Max withdrawal is €${MAX_AMOUNT.toLocaleString()}.`);
    setConfirmData({ type: "withdraw", amount: n });
  };

  return (
    <Layout
      onLogout={() => {
        localStorage.removeItem("token");
        navigate("/");
      }}
    >
      <style>{`
        .txScroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(17,24,39,0.35) rgba(243,244,246,0.75);
        }
        .txScroll::-webkit-scrollbar {
          width: 10px;
        }
        .txScroll::-webkit-scrollbar-track {
          background: rgba(243,244,246,0.75);
          border-radius: 999px;
        }
        .txScroll::-webkit-scrollbar-thumb {
          background: rgba(17,24,39,0.28);
          border-radius: 999px;
          border: 2px solid rgba(243,244,246,0.75);
        }
        .txScroll::-webkit-scrollbar-thumb:hover {
          background: rgba(17,24,39,0.45);
        }
      `}</style>

      {toast.show && (
        <div style={{ ...s.toastWrap, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}>
          <div style={{ fontSize: 18 }}>{toast.type === "success" ? "✅" : "⚠️"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>{toast.title}</div>
            <div style={{ opacity: 0.95, fontSize: 12, marginTop: 2 }}>{toast.message}</div>
          </div>
          <button onClick={() => setToast((t) => ({ ...t, show: false }))} style={s.toastClose} type="button">
            ✕
          </button>
        </div>
      )}

      {confirmData && (
        <div style={s.modalOverlay} onClick={() => !loading && setConfirmData(null)}>
          <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 46, marginBottom: 14 }}>
              {confirmData.type === "deposit" ? "📥" : confirmData.type === "withdraw" ? "📤" : "💸"}
            </div>

            <h3 style={{ margin: 0, color: "#111827", fontSize: 22, fontWeight: 900 }}>Confirm {confirmData.type}</h3>

            <p style={{ color: "#6B7280", fontSize: 14, margin: "10px 0 18px 0" }}>
              Are you sure? <br />
              <strong style={{ color: "#111827", fontSize: 20 }}>€{Number(confirmData.amount).toFixed(2)}</strong>
            </p>

            <div style={s.modalBtnRow}>
              <button onClick={() => setConfirmData(null)} style={s.modalCancelBtn} disabled={loading} type="button">
                Cancel
              </button>
              <button onClick={handleAction} style={s.modalConfirmBtn} disabled={loading} type="button">
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.pageWrapper}>
        <div style={s.leftColumn}>
          <div style={s.headerSection}>
            <h2 style={{ color: "#111827", margin: 0, fontSize: 26, fontWeight: 900 }}>
              Hi, <span style={{ color: "#2563eb" }}>{userName}</span>
            </h2>
          </div>

          <div style={s.balanceCard}>
            <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>TOTAL BALANCE</div>
            <div
              style={{
                ...s.balanceText,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
              title={`€ ${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            >
              € {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Transfer Money</h3>
            <input
              placeholder="Recipient Email"
              inputMode="email"
              autoComplete="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={s.whiteInput}
            />
            <input
              placeholder="Amount €"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={s.whiteInput}
              max={MAX_AMOUNT}
            />
            <button onClick={openTransferConfirm} style={s.sendBtn} type="button">
              Send Now
            </button>
            <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>
              Max €{MAX_AMOUNT.toLocaleString()}
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Manage Funds</h3>
            <div style={s.inputGroup}>
              <input
                placeholder="Deposit €"
                type="number"
                inputMode="decimal"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={s.whiteGroupInput}
                max={MAX_AMOUNT}
              />
              <button onClick={openDepositConfirm} style={s.addBtn} type="button">
                Deposit Funds
              </button>
            </div>

            <div style={s.inputGroup}>
              <input
                placeholder="Withdraw €"
                type="number"
                inputMode="decimal"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={s.whiteGroupInput}
                max={MAX_AMOUNT}
              />
              <button onClick={openWithdrawConfirm} style={s.takeBtn} type="button">
                Withdraw Funds
              </button>
            </div>

            <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>
              Max €{MAX_AMOUNT.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={s.rightColumn}>
          <div style={s.listHeader}>
            <h3 style={{ ...s.cardTitle, color: "#0f172a", fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em" }}>
              Recent Transactions
            </h3>
            <div style={s.filterLinks}>
              {["all", "sent", "received", "deposit", "withdrawal"].map((f) => (
                <span
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...s.filterItem,
                    color: filter === f ? "#2563eb" : "#9ca3af",
                    borderBottom: filter === f ? "2px solid #2563eb" : "2px solid transparent",
                  }}
                >
                  {f === "withdrawal" ? "Withdraw" : f.charAt(0).toUpperCase() + f.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={onTxScroll}
            className="txScroll"
            style={{
              ...s.listContainer,
              maxHeight: 520,
              overflowY: "auto",
              paddingRight: 6,
            }}
          >
            {displayTxs.map((t) => {
              const myIdStr = normalizeId(myId);
              const senderId = normalizeId(t.sender);
              const receiverId = normalizeId(t.receiver);

              const isSender = t.type === "transfer" && senderId === myIdStr;
              const isReceiver = t.type === "transfer" && receiverId === myIdStr;

              let actionTitle = "";
              let personLabel = "";

              if (t.type === "deposit") {
                actionTitle = "Deposit";
              } else if (t.type === "withdrawal") {
                actionTitle = "Withdrawal";
              } else if (t.type === "transfer") {
                if (isSender) {
                  actionTitle = "Sent to";
                  personLabel = getName(t.receiver);
                } else if (isReceiver) {
                  actionTitle = "Received from";
                  personLabel = getName(t.sender);
                } else {
                  actionTitle = "Transfer";
                  personLabel = "";
                }
              }

              const isPositive = t.type === "deposit" || isReceiver;
              const txDate = new Date(t.createdAt);

              return (
                <div key={t._id} style={s.txRow}>
                  <div style={s.iconBox}>
                    {t.type === "deposit" ? "📥" : t.type === "withdrawal" ? "📤" : isSender ? "💸" : "💰"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.txTitle}>
                      {actionTitle} {personLabel ? <span style={{ color: "#2563eb" }}>{personLabel}</span> : null}
                    </div>
                    <div style={s.txDetailsRow}>
                      <span style={s.txDateText}>
                        {txDate.toLocaleDateString()} • {txDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span
                        style={{
                          ...s.statusBadge,
                          color: t.status === "completed" ? "#10b981" : "#ef4444",
                          background: t.status === "completed" ? "#ecfdf5" : "#fef2f2",
                        }}
                      >
                        <span style={{ ...s.statusDot, background: t.status === "completed" ? "#10b981" : "#ef4444" }} />
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: isPositive ? "#10b981" : "#ef4444" }}>
                    {isPositive ? "+" : "-"}€{Number(t.amount).toFixed(2)}
                  </div>
                </div>
              );
            })}

            {loadingTxs && (
              <div style={{ padding: 14, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                Loading more...
              </div>
            )}

            {!loadingTxs && !hasMoreTxs && displayTxs.length > 0 && (
              <div style={{ padding: 14, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                No more transactions
              </div>
            )}

            {!loadingTxs && displayTxs.length === 0 && (
              <div style={{ padding: 14, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}