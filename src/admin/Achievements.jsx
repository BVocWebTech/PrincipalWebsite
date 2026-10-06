import { useState, useEffect } from "react";
import { API_BASE } from "../lib/api";
import SectionAdmin from "./SectionAdmin";

const API = `${API_BASE}/api/achievements`;

const categories = [
  "International",
  "National",
  "State",
  "Institutional",
  "University",
];

// Same academic palette as AdminPanel (change these to restyle)
const THEME = {
  navy: "#1f3a5f",
  gold: "#b08d3c",
  text: "#374151",
  muted: "#6b7280",
  border: "#d6d0c0",
  softBg: "#f7f5f0",
  editBg: "#eef2f8",
  danger: "#8b1e2d",
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

const AchievementsList = () => {
  const [achievements, setAchievements] = useState([]);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding, id = editing

  const getToken = () => localStorage.getItem("token");

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();

      if (res.ok) {
        const flat = [];
        Object.keys(data).forEach((cat) => {
          data[cat].forEach((item) => {
            flat.push({ ...item, category: cat });
          });
        });
        setAchievements(flat);
      } else {
        console.error("Invalid API response:", data);
        setAchievements([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const saveAchievement = async (e) => {
    e.preventDefault();

    if (!category || !title || !order) {
      alert("All fields required");
      return;
    }

    try {
      const res = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ category, title, order }),
      });

      const data = await res.json();

      if (res.ok) {
        resetForm();
        fetchAchievements();
      } else {
        alert(data.message || (editingId ? "Failed to update" : "Failed to add"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAchievement = async (id) => {
    if (!confirm("Delete this achievement?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        if (editingId === id) resetForm();
        fetchAchievements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setCategory("");
    setTitle("");
    setOrder("");
    setEditingId(null);
  };

  const startEdit = (item) => {
    setCategory(item.category || "");
    setTitle(item.title || "");
    setOrder(String(item.order ?? ""));
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Input style with a navy border while focused
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
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Add form */}
      <form
        onSubmit={saveAchievement}
        style={{
          backgroundColor: editingId ? THEME.editBg : THEME.softBg,
          border: `1px solid ${THEME.border}`,
          borderLeft: `4px solid ${editingId ? THEME.navy : THEME.gold}`,
          borderRadius: "2px",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <h3
          style={{
            fontFamily: serif,
            fontSize: "18px",
            fontWeight: "bold",
            color: THEME.navy,
            marginBottom: "16px",
          }}
        >
          {editingId ? "Edit Achievement" : "Add New Achievement"}
        </h3>

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={field("category")}
            {...focusProps("category")}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={field("title")}
            {...focusProps("title")}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Order</label>
          <input
            type="number"
            placeholder="Order"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            style={field("order")}
            {...focusProps("order")}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: THEME.navy,
            color: "#ffffff",
            padding: "10px 26px",
            border: "none",
            borderRadius: "3px",
            fontFamily: serif,
            fontSize: "15px",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          {editingId ? "Save changes" : "Add Achievement"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              backgroundColor: "transparent",
              color: THEME.text,
              padding: "10px 22px",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: "3px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "12px",
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* List */}
      {loading ? (
        <p style={{ color: THEME.muted }}>Loading...</p>
      ) : achievements.length === 0 ? (
        <p style={{ color: THEME.muted, fontStyle: "italic" }}>No achievements found</p>
      ) : (
        achievements.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              backgroundColor: editingId === item.id ? THEME.editBg : "#ffffff",
              border: `1px solid ${THEME.border}`,
              borderLeft: `4px solid ${THEME.navy}`,
              borderRadius: "2px",
              padding: "14px 16px",
              marginBottom: "10px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: serif,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: THEME.navy,
                  marginBottom: "6px",
                }}
              >
                {item.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span
                  style={{
                    backgroundColor: THEME.softBg,
                    color: THEME.navy,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: "2px",
                    padding: "2px 10px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.category}
                </span>
                <span style={{ fontSize: "13px", color: THEME.muted }}>
                  Order: {item.order}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => startEdit(item)}
              style={{
                backgroundColor: "transparent",
                color: THEME.navy,
                padding: "6px 16px",
                border: `1.5px solid ${THEME.navy}`,
                borderRadius: "3px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => deleteAchievement(item.id)}
              style={{
                backgroundColor: "transparent",
                color: THEME.danger,
                padding: "6px 16px",
                border: `1.5px solid ${THEME.danger}`,
                borderRadius: "3px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Delete
            </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const SUB_TABS = [
  { key: "achievements", label: "Achievements" },
  { key: "resource_person", label: "Resource Person" },
  { key: "position_held", label: "Position Held" },
];

// ================= WRAPPER WITH SUB-TABS =================
const Achievements = ({ onUnauthorized }) => {
  const [subTab, setSubTab] = useState("achievements");

  return (
    <div className="p-6">
      <h1
        style={{
          fontFamily: serif,
          fontSize: "26px",
          fontWeight: "bold",
          color: THEME.navy,
          marginBottom: "6px",
        }}
      >
        Achievements
      </h1>
      <div style={{ width: "60px", height: "3px", backgroundColor: THEME.gold, marginBottom: "20px" }} />

      {/* Sub-tabs: segmented, classic look */}
      <div style={{ display: "inline-flex", flexWrap: "wrap", marginBottom: "24px" }}>
        {SUB_TABS.map((tab, i) => {
          const isActive = subTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              aria-current={isActive ? "page" : undefined}
              style={{
                backgroundColor: isActive ? THEME.navy : "#ffffff",
                color: isActive ? "#ffffff" : THEME.navy,
                padding: "9px 22px",
                border: `1px solid ${THEME.navy}`,
                marginLeft: i === 0 ? 0 : "-1px",
                borderRadius:
                  i === 0
                    ? "3px 0 0 3px"
                    : i === SUB_TABS.length - 1
                    ? "0 3px 3px 0"
                    : 0,
                fontFamily: serif,
                fontSize: "15px",
                fontWeight: isActive ? "bold" : "normal",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === "achievements" && <AchievementsList />}
      {subTab === "resource_person" && (
        <SectionAdmin
          section="resource_person"
          label="Resource Person"
          onUnauthorized={onUnauthorized}
        />
      )}
      {subTab === "position_held" && (
        <SectionAdmin
          section="position_held"
          label="Position Held"
          onUnauthorized={onUnauthorized}
        />
      )}
    </div>
  );
};

export default Achievements;