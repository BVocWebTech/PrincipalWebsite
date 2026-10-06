import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/api";

// Same academic palette as AdminPanel (change these to restyle)
const THEME = {
  navy: "#1f3a5f",
  gold: "#b08d3c",
  border: "#d6d0c0",
  softBg: "#f7f5f0",
  danger: "#8b1e2d",
};

// Notification colours
const NOTICE = {
  success: { bg: "#e6f0e8", border: "#bcd6c2", edge: "#2f6b3f", color: "#2f6b3f" },
  error: { bg: "#fbeeee", border: "#e6c2c2", edge: "#8b1e2d", color: "#8b1e2d" },
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

// Stricter than the browser's type="email": needs a dot and a 2+ letter ending (a@b is rejected)
const EMAIL_RE =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const isValidEmail = (v) => v.length <= 254 && !v.includes("..") && EMAIL_RE.test(v);
const EMAIL_MESSAGE = "Enter a valid email address, like name@example.com.";

// CV upload limits (to allow PDF only, keep just "application/pdf" here,
// and change the label, error message and accept attribute below)
const CV_MAX_MB = 5;
const CV_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function HeroSection({ onUnauthorized }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState("");

  // CV: cvUrl is the file already saved on the server, cvFile is a newly chosen one
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState("");
  const [cvError, setCvError] = useState("");
  const cvInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  // Notification shown above the form: { type: "success" | "error", text }
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchHero();
    return () => clearTimeout(timerRef.current);
  }, []);

  const showNotice = (type, text) => {
    clearTimeout(timerRef.current);
    setNotice({ type, text });
    if (type === "success") {
      timerRef.current = setTimeout(() => setNotice(null), 4000);
    }
  };

  const fetchHero = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hero`);
      const data = await res.json();

      setName(data?.name || "");
      setTitle(data?.title || "");
      setCaption(data?.caption || "");
      setEmail(data?.email || "");

      if (data?.portrait) {
        setPortraitPreview(`${API_BASE}${data.portrait}`);
      }
      setCvUrl(data?.cv ? `${API_BASE}${data.cv}` : "");
    } catch (err) {
      console.error("Error fetching hero:", err);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return; // dialog was cancelled
    setCvError("");

    if (!CV_ALLOWED_TYPES.includes(file.type)) {
      setCvFile(null);
      e.target.value = "";
      return setCvError("CV must be a PDF, DOC or DOCX file.");
    }
    if (file.size > CV_MAX_MB * 1024 * 1024) {
      setCvFile(null);
      e.target.value = "";
      return setCvError(`CV must be smaller than ${CV_MAX_MB} MB.`);
    }
    setCvFile(file);
  };

  const clearChosenCv = () => {
    setCvFile(null);
    setCvError("");
    if (cvInputRef.current) cvInputRef.current.value = "";
  };

  const saveHero = async () => {
    setEmailError("");

    // Same required fields as the server
    if (!name.trim() || !title.trim() || !email.trim()) {
      return showNotice("error", "Name, title and email are required.");
    }

    // type="email" is not checked without a <form>, so the format is checked here
    if (!isValidEmail(email.trim())) {
      return setEmailError(EMAIL_MESSAGE);
    }

    if (cvError) {
      return showNotice("error", cvError);
    }

    try {
      setLoading(true);
      setNotice(null);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("title", title.trim());
      formData.append("caption", caption.trim());
      formData.append("email", email.trim().toLowerCase());

      if (portraitFile) {
        formData.append("portrait", portraitFile);
      }
      if (cvFile) {
        formData.append("cv", cvFile);
      }

      const res = await fetch(`${API_BASE}/api/hero`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.status === 401) {
        showNotice("error", "Session expired. Please log in again.");
        onUnauthorized?.();
        return;
      }

      if (res.ok) {
        showNotice("success", "Hero section updated successfully.");
        fetchHero(); // reload fresh data
        setPortraitFile(null);
        clearChosenCv();
      } else {
        // the server sends the reason in `message` (or `error`)
        showNotice(
          "error",
          data.message || data.error || `Could not save (server replied ${res.status}).`
        );
      }
    } catch (err) {
      console.error("Error saving hero:", err);
      showNotice("error", "Network error. Check that the server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Style for a text input, with a navy border while focused
  const field = (key) => ({
    ...inputStyle,
    borderColor: focused === key ? THEME.navy : THEME.border,
    boxShadow: focused === key ? `0 0 0 2px ${THEME.navy}22` : "none",
  });

  const focusProps = (key) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(""),
  });

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "32px 16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          backgroundColor: "#ffffff",
          border: `1px solid ${THEME.border}`,
          borderTop: `3px solid ${THEME.navy}`,
          borderRadius: "2px",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            fontFamily: serif,
            fontSize: "26px",
            fontWeight: "bold",
            color: THEME.navy,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Hero Section Editor
        </h2>
        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: THEME.gold,
            margin: "0 auto 28px",
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
              marginBottom: "20px",
              fontSize: "14px",
              color: NOTICE[notice.type].color,
            }}
          >
            {notice.text}
          </div>
        )}

        {/* Name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={field("name")}
            {...focusProps("name")}
          />
        </div>

        {/* Title */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={field("title")}
            {...focusProps("title")}
          />
        </div>

        {/* Caption */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={field("caption")}
            {...focusProps("caption")}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Email * (Stored only, not public)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            onFocus={() => setFocused("email")}
            onBlur={() => {
              setFocused("");
              if (email.trim() && !isValidEmail(email.trim())) setEmailError(EMAIL_MESSAGE);
            }}
            style={{
              ...field("email"),
              ...(emailError && { borderColor: THEME.danger }),
            }}
            aria-invalid={!!emailError}
            placeholder="example@gmail.com"
          />
          {emailError && (
            <p role="alert" style={{ margin: "5px 0 0", fontSize: "13px", color: THEME.danger }}>
              {emailError}
            </p>
          )}
        </div>

        {/* Portrait Upload */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Portrait Image</label>

          {portraitPreview && (
            <img
              src={portraitPreview}
              alt="preview"
              style={{
                width: "128px",
                height: "128px",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
                margin: "0 auto 14px",
                border: `3px solid ${THEME.gold}`,
                padding: "2px",
                backgroundColor: "#ffffff",
              }}
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return; // dialog was cancelled
              setPortraitFile(file);
              setPortraitPreview(URL.createObjectURL(file));
            }}
            style={{
              ...inputStyle,
              padding: "8px",
              backgroundColor: THEME.softBg,
              cursor: "pointer",
            }}
          />
        </div>

        {/* CV Upload */}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>CV (PDF, DOC or DOCX, max {CV_MAX_MB} MB)</label>

          {/* Currently saved CV */}
          {cvUrl && !cvFile && (
            <p style={{ margin: "0 0 10px", fontSize: "14px", color: THEME.navy }}>
              Current CV:{" "}
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: THEME.navy, fontWeight: "bold", textDecoration: "underline" }}
              >
                View / download
              </a>
            </p>
          )}

          {/* Newly chosen file, not saved yet */}
          {cvFile && (
            <p style={{ margin: "0 0 10px", fontSize: "14px", color: THEME.navy }}>
              Selected: <strong>{cvFile.name}</strong>{" "}
              <button
                type="button"
                onClick={clearChosenCv}
                style={{
                  marginLeft: "8px",
                  background: "none",
                  border: "none",
                  color: THEME.danger,
                  fontSize: "13px",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </p>
          )}

          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleCvChange}
            style={{
              ...inputStyle,
              padding: "8px",
              backgroundColor: THEME.softBg,
              cursor: "pointer",
              ...(cvError && { borderColor: THEME.danger }),
            }}
          />
          {cvError && (
            <p role="alert" style={{ margin: "5px 0 0", fontSize: "13px", color: THEME.danger }}>
              {cvError}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={saveHero}
          disabled={loading}
          style={{
            width: "100%",
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
          {loading ? "Saving..." : "Save Hero Section"}
        </button>
      </div>
    </section>
  );
}