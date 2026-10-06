import { useState } from "react";
import { API_BASE } from "../lib/api";

// Same academic palette as AdminPanel (change these to restyle)
const THEME = {
  navy: "#1f3a5f",
  gold: "#b08d3c",
  text: "#374151",
  border: "#d6d0c0",
  pageBg: "#f7f5f0",
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

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Success! Please log in with your new password...");
        localStorage.removeItem("token");
        window.location.href = "/admin";
      } else {
        alert(data.message || "Error updating password");
        if (res.status === 401) window.location.href = "/admin";
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "oldPassword", label: "Current Password" },
    { name: "newPassword", label: "New Password" },
    { name: "confirmPassword", label: "Confirm New Password" },
  ];

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "32px 16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          border: `1px solid ${THEME.border}`,
          borderTop: `3px solid ${THEME.navy}`,
          borderRadius: "2px",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h3
          style={{
            fontFamily: serif,
            fontSize: "24px",
            fontWeight: "bold",
            color: THEME.navy,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Change Password
        </h3>
        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: THEME.gold,
            margin: "0 auto 24px",
          }}
        />

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.name} style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type="password"
                name={f.name}
                required
                value={formData[f.name]}
                onChange={handleChange}
                onFocus={() => setFocused(f.name)}
                onBlur={() => setFocused("")}
                style={{
                  ...inputStyle,
                  borderColor: focused === f.name ? THEME.navy : THEME.border,
                  boxShadow: focused === f.name ? `0 0 0 2px ${THEME.navy}22` : "none",
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              backgroundColor: loading ? "#9ca3af" : THEME.navy,
              color: "#ffffff",
              border: "none",
              borderRadius: "3px",
              fontFamily: serif,
              fontSize: "16px",
              fontWeight: "bold",
              letterSpacing: "0.05em",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
}