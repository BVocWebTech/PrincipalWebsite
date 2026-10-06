import { useState, useEffect } from "react";
import { API_BASE } from "../lib/api";

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

const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#e8edf5",
  color: THEME.navy,
  border: "1px solid #c4d0e3",
  borderRadius: "2px",
  padding: "2px 10px",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
};

const primaryBtn = (disabled = false) => ({
  backgroundColor: disabled ? "#9ca3af" : THEME.navy,
  color: "#ffffff",
  padding: "10px 26px",
  border: "none",
  borderRadius: "3px",
  fontFamily: serif,
  fontSize: "15px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  cursor: disabled ? "not-allowed" : "pointer",
});

const outlineBtn = (color) => ({
  backgroundColor: "transparent",
  color,
  padding: "6px 16px",
  border: `1.5px solid ${color}`,
  borderRadius: "3px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
});

const linkOrDash = (link) =>
  link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: THEME.navy, textDecoration: "underline" }}
    >
      View
    </a>
  ) : (
    "-"
  );

// Defined outside the component so inputs keep focus while typing
const Field = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

export default function ResearchAdmin() {
  const getToken = () => localStorage.getItem("token");

  const types = ["Journal", "Full paper in proceedings", "Book", "Article", "Book Chapter"];
  const levels = ["International", "National", "State", "Local"];
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    type: "",
    name: "",
    title: "",
    level: "International",
    indexing: "",
    link: "",
    date: "",
  });

  const [previewList, setPreviewList] = useState([]);
  const [publications, setPublications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [focused, setFocused] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchPublications(currentPage);
  }, [currentPage]);

  const fetchPublications = async (page = 1) => {
    const res = await fetch(`${API_BASE}/api/research?page=${page}&limit=${limit}`);
    const data = await res.json();
    setPublications(data.publications || []);
    setTotalPages(data.totalPages || 1);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddToPreview = () => {
    if (!form.type || !form.name || !form.title || !form.date) {
      alert("Required fields missing");
      return;
    }

    setPreviewList([...previewList, form]);

    setForm({ type: "", name: "", title: "", level: "International", indexing: "", link: "", date: "" });
  };

  const removePreview = (index) => setPreviewList(previewList.filter((_, i) => i !== index));

  const handleSaveAll = async () => {
    const res = await fetch(`${API_BASE}/api/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(previewList),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    alert("Saved successfully");
    setPreviewList([]);
    fetchPublications(currentPage);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ ...item, date: item.date.split("T")[0] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    const res = await fetch(`${API_BASE}/api/research/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    alert("Updated successfully");
    setEditingId(null);
    fetchPublications(currentPage);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/api/research/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchPublications(currentPage);
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
    <section style={{ padding: "24px", maxWidth: "860px", margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: serif,
          fontSize: "26px",
          fontWeight: "bold",
          color: THEME.navy,
          marginBottom: "6px",
        }}
      >
        {editingId ? "Update Publications" : "Publications"}
      </h2>
      <div style={{ width: "60px", height: "3px", backgroundColor: THEME.gold, marginBottom: "24px" }} />

      {/* Add / edit form */}
      <div
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
          {editingId ? "Edit Publication" : "Add New Publication"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <Field label="Type">
            <select name="type" value={form.type} onChange={handleChange} style={field("type")} {...focusProps("type")}>
              <option value="">Select Type</option>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Level">
            <select name="level" value={form.level} onChange={handleChange} style={field("level")} {...focusProps("level")}>
              {levels.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>

          <Field label="Journal Name">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Journal Name" style={field("name")} {...focusProps("name")} />
          </Field>

          <Field label="Title">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" style={field("title")} {...focusProps("title")} />
          </Field>

          <Field label="Indexing">
            <input name="indexing" value={form.indexing} onChange={handleChange} placeholder="Indexing" style={field("indexing")} {...focusProps("indexing")} />
          </Field>

          <Field label="Link">
            <input name="link" value={form.link} onChange={handleChange} placeholder="Link" style={field("link")} {...focusProps("link")} />
          </Field>

          <Field label="Date">
            <input
              type="date"
              max={today}
              name="date"
              value={form.date}
              onChange={handleChange}
              onClick={(e) => e.currentTarget.showPicker?.()}
              style={field("date")}
              {...focusProps("date")}
            />
          </Field>
        </div>

        <button onClick={editingId ? handleUpdate : handleAddToPreview} style={primaryBtn()}>
          {editingId ? "Update" : "Add to Preview"}
        </button>
      </div>

      {/* Preview */}
      {previewList.length > 0 && (
        <div
          style={{
            backgroundColor: THEME.softBg,
            border: `1px solid ${THEME.border}`,
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
            Preview
          </h3>

          {previewList.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                backgroundColor: "#ffffff",
                border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${THEME.gold}`,
                borderRadius: "2px",
                padding: "12px 16px",
                marginBottom: "10px",
              }}
            >
              <p style={{ fontSize: "14px", color: THEME.text, flex: 1, wordBreak: "break-word" }}>
                {item.type} | {item.name} | {item.title} | {item.level} | {item.indexing || "-"} |{" "}
                {linkOrDash(item.link)} | {new Date(item.date).toLocaleDateString()}
              </p>
              <button onClick={() => removePreview(index)} style={{ ...outlineBtn(THEME.danger), flexShrink: 0 }}>
                Remove
              </button>
            </div>
          ))}

          <button onClick={handleSaveAll} style={{ ...primaryBtn(), marginTop: "6px" }}>
            Save All
          </button>
        </div>
      )}

      {/* Saved publications */}
      {publications.map((item) => (
        <div
          key={item._id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            backgroundColor: editingId === item._id ? THEME.editBg : "#ffffff",
            border: `1px solid ${THEME.border}`,
            borderLeft: `4px solid ${THEME.navy}`,
            borderRadius: "2px",
            padding: "14px 16px",
            marginBottom: "10px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: serif,
                fontSize: "16px",
                fontWeight: "bold",
                color: THEME.navy,
                marginBottom: "6px",
                wordBreak: "break-word",
              }}
            >
              {item.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <span style={badgeStyle}>{item.type}</span>
              <span style={badgeStyle}>{item.level}</span>
              <span style={{ fontSize: "13px", color: THEME.muted }}>
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: "14px", color: THEME.text, wordBreak: "break-word" }}>
              {item.name} | Indexing: {item.indexing || "-"} | Link: {linkOrDash(item.link)}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button onClick={() => handleEdit(item)} style={outlineBtn(THEME.navy)}>
              Edit
            </button>
            <button onClick={() => handleDelete(item._id)} style={outlineBtn(THEME.danger)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px", flexWrap: "wrap" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{
              ...pageBtn(false),
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} style={pageBtn(currentPage === i + 1)}>
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              ...pageBtn(false),
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

// Pagination button: filled navy when it is the current page
const pageBtn = (active) => ({
  backgroundColor: active ? THEME.navy : "#ffffff",
  color: active ? "#ffffff" : THEME.navy,
  padding: "6px 14px",
  border: `1px solid ${THEME.navy}`,
  borderRadius: "3px",
  fontFamily: serif,
  fontSize: "14px",
  fontWeight: active ? "bold" : "normal",
  cursor: "pointer",
});