import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../lib/api";

// Same academic palette as AdminPanel (change these to restyle)
const THEME = {
  navy: "#1f3a5f",
  gold: "#b08d3c",
  text: "#374151",
  muted: "#6b7280",
  border: "#d6d0c0",
  pageBg: "#f7f5f0",
  danger: "#8b1e2d",
};

// Notification colours
const NOTICE = {
  success: { bg: "#e6f0e8", border: "#bcd6c2", edge: "#2f6b3f", color: "#2f6b3f" },
  error: { bg: "#fbeeee", border: "#e6c2c2", edge: THEME.danger, color: THEME.danger },
};

const serif = "Georgia, 'Times New Roman', serif";

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "bold",
  color: THEME.navy,
  marginBottom: "6px",
  fontFamily: serif,
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: `1px solid ${THEME.border}`,
  borderRadius: "3px",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};

const primaryBtn = (disabled) => ({
  width: "100%",
  padding: "12px",
  backgroundColor: disabled ? "#9ca3af" : THEME.navy,
  color: "#ffffff",
  border: "none",
  borderRadius: "3px",
  fontFamily: serif,
  fontSize: "16px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  cursor: disabled ? "not-allowed" : "pointer",
});

const linkBtn = {
  background: "none",
  border: "none",
  color: THEME.navy,
  fontSize: "14px",
  textDecoration: "underline",
  cursor: "pointer",
  display: "block",
  margin: "16px auto 0",
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  // Opened from the emailed link: /admin?reset=<token>
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get("reset") || ""
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [focused, setFocused] = useState("");
  // Notification shown inside the card: { type: "success" | "error", text }
  const [notice, setNotice] = useState(null);

  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleLogin = async () => {
    if (!username || !password) {
      return setNotice({ type: "error", text: "Please fill in both username and password." });
    }

    try {
      setLoading(true);
      setNotice(null);

      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setNotice({ type: "success", text: "Login successful. Opening the dashboard..." });
        // short pause so the message can be seen
        timerRef.current = setTimeout(() => onLogin(), 800);
      } else {
        setNotice({ type: "error", text: data.message || "Login failed. Please try again." });
        setLoading(false);
      }
    } catch (err) {
      setNotice({ type: "error", text: "Network error. Please check your connection and try again." });
      setLoading(false);
    }
  };

  const leaveResetMode = () => {
    // remove ?reset=... from the address bar
    window.history.replaceState({}, "", window.location.pathname);
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      return setNotice({ type: "error", text: "Password must be at least 6 characters." });
    }
    if (newPassword !== confirmPassword) {
      return setNotice({ type: "error", text: "Passwords do not match." });
    }

    try {
      setResetting(true);
      setNotice(null);

      const res = await fetch(`${API_BASE}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        leaveResetMode();
        setForgotMode(false);
        setNotice({
          type: "success",
          text: data.message || "Password updated. Please log in with your new password.",
        });
      } else {
        setNotice({ type: "error", text: data.message || "Reset failed. Request a new link." });
      }
    } catch {
      setNotice({ type: "error", text: "Network error. Please try again." });
    } finally {
      setResetting(false);
    }
  };

  const handleLoginKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleForgotPassword = async () => {
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.ok) {
        setNotice({
          type: "success",
          text: data.message || "If an admin account exists, a reset link has been sent.",
        });
      } else {
        setNotice({ type: "error", text: data.message || "Something went wrong. Try again." });
      }
    } catch {
      setNotice({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setSending(false);
    }
  };

  // Input style with a navy border while focused
  const field = (key, extra = {}) => ({
    ...inputStyle,
    ...extra,
    borderColor: focused === key ? THEME.navy : THEME.border,
    boxShadow: focused === key ? `0 0 0 2px ${THEME.navy}22` : "none",
  });

  const focusProps = (key) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(""),
  });

  const switchMode = (toForgot) => {
    setForgotMode(toForgot);
    setNotice(null);
  };

  return (
    <section
      style={{
        backgroundColor: THEME.pageBg,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          border: `1px solid ${THEME.border}`,
          borderTop: `3px solid ${THEME.navy}`,
          borderRadius: "2px",
          padding: "36px 32px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        }}
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: THEME.gold,
            fontWeight: "bold",
            marginBottom: "6px",
          }}
        >
          Portfolio Management
        </p>
        <h2
          style={{
            fontFamily: serif,
            fontSize: "30px",
            fontWeight: "bold",
            color: THEME.navy,
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          {resetToken ? "Set New Password" : forgotMode ? "Reset Password" : "Admin Login"}
        </h2>
        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: THEME.gold,
            margin: "0 auto 24px",
          }}
        />

        {/* Notification */}
        {notice && (
          <div
            role="alert"
            style={{
              backgroundColor: NOTICE[notice.type].bg,
              border: `1px solid ${NOTICE[notice.type].border}`,
              borderLeft: `4px solid ${NOTICE[notice.type].edge}`,
              borderRadius: "2px",
              padding: "10px 14px",
              marginBottom: "18px",
              fontSize: "14px",
              color: NOTICE[notice.type].color,
            }}
          >
            {notice.text}
          </div>
        )}

        {resetToken ? (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                style={field("newPassword")}
                {...focusProps("newPassword")}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={labelStyle}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                placeholder="Confirm new password"
                style={field("confirmPassword")}
                {...focusProps("confirmPassword")}
              />
            </div>

            <button onClick={handleResetPassword} disabled={resetting} style={primaryBtn(resetting)}>
              {resetting ? "Updating..." : "Update Password"}
            </button>

            <button
              onClick={() => {
                leaveResetMode();
                setNotice(null);
              }}
              style={linkBtn}
            >
              Back to login
            </button>
          </>
        ) : !forgotMode ? (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleLoginKeyDown}
                placeholder="Username"
                style={field("username")}
                {...focusProps("username")}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleLoginKeyDown}
                  placeholder="Password"
                  style={field("password", { paddingRight: "64px" })}
                  {...focusProps("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: THEME.navy,
                    fontSize: "13px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading} style={primaryBtn(loading)}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <button onClick={() => switchMode(true)} style={linkBtn}>
              Forgot password?
            </button>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "14px",
                color: THEME.text,
                textAlign: "center",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}
            >
              A password reset link will be emailed to the registered recovery address.
              The link expires in 15 minutes.
            </p>

            <button onClick={handleForgotPassword} disabled={sending} style={primaryBtn(sending)}>
              {sending ? "Sending..." : "Send Reset Link"}
            </button>

            <button onClick={() => switchMode(false)} style={linkBtn}>
              Back to login
            </button>
          </>
        )}
      </div>
    </section>
  );
}