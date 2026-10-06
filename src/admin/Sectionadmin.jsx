import { useState, useEffect } from "react";
import { API_BASE } from "../lib/api";

const LEVELS = ["National", "International"];
const STATUSES = ["Completed", "Active"];

// Earliest allowed date (stops typos like year 1099)
const MIN_DATE = "1900-01-01";

// A date input value is always exactly YYYY-MM-DD; anything else (e.g. a 5-digit year) is invalid
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

// Today in the user's own time zone as YYYY-MM-DD. Used as the latest allowed date,
// because these sections record work that has already happened.
// Built by hand (not toLocaleDateString) so the format can never change between browsers.
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

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

// Community engagement has two statuses: Completed and Active (still running)
const isOngoing = (status) => status === "Active";

// Small coloured badges for status / level
const STATUS_BADGE = {
  Completed: { bg: "#e6f0e8", color: "#2f6b3f", border: "#bcd6c2" },
  Active: { bg: "#f6efdc", color: "#7a5c10", border: "#e3d3a3" },
};
const LEVEL_BADGE = { bg: "#e8edf5", color: THEME.navy, border: "#c4d0e3" };

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

const badgeStyle = ({ bg, color, border }) => ({
  display: "inline-block",
  backgroundColor: bg,
  color,
  border: `1px solid ${border}`,
  borderRadius: "2px",
  padding: "2px 10px",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
});

const outlineButton = (color) => ({
  backgroundColor: "transparent",
  color,
  padding: "6px 16px",
  border: `1.5px solid ${color}`,
  borderRadius: "3px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
});

// Fields shown in the form for each section
const SECTION_FIELDS = {
  paper_presentation: [
    { name: "title", label: "Title", required: true },
    { name: "level", label: "Select level", type: "select", options: LEVELS, required: true },
    { name: "organization", label: "Organization (optional)" },
    { name: "date", label: "Date", type: "date" },
    { name: "order", label: "Order", type: "number" },
  ],
  community_engagement: [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description (optional)", type: "textarea" },
    { name: "status", label: "Select completion status", type: "select", options: STATUSES, required: true },
    { name: "startDate", label: "Start date", type: "date", required: true },
    {
      name: "endDate",
      label: "End date",
      type: "date",
      minFrom: "startDate", // picker cannot go before the start date
      // end date only applies once the work is not ongoing
      showIf: (form) => !isOngoing(form.status),
    },
    { name: "order", label: "Order", type: "number" },
  ],
  position_held: [
    { name: "title", label: "Position", required: true },
    { name: "organization", label: "Organization (optional)" },
    { name: "description", label: "Description (optional)", type: "textarea" },
    { name: "startDate", label: "Start date", type: "date", required: true },
    // UI-only: when ticked the position is still held and shows "start-Present"
    { name: "continuing", label: "Currently continuing in this position (shows start year - Present)", type: "checkbox" },
    { name: "endDate", label: "End date", type: "date", minFrom: "startDate", showIf: (form) => !form.continuing },
    { name: "order", label: "Order", type: "number" },
  ],
  research_interest: [
    { name: "title", label: "Area", required: true }, // stored in `title`
    { name: "description", label: "Description", type: "textarea" },
  ],
};

// Used by sections not listed above (e.g. resource_person)
const DEFAULT_FIELDS = [
  { name: "title", label: "Title", required: true },
  { name: "description", label: "Description (optional)", type: "textarea" },
  { name: "organization", label: "Organization (optional)" },
  { name: "date", label: "Date", type: "date" },
  { name: "order", label: "Order", type: "number" },
];

// Full dates are stored; only the year is displayed.
// UTC is used because date inputs are saved as UTC midnight.
const yearOf = (d) => (d ? new Date(d).getUTCFullYear() : null);

// "2019-Present" when ongoing, "2020-2024" when completed
const formatYears = ({ startDate, endDate, status, date }, section) => {
  const start = yearOf(startDate);
  const end = yearOf(endDate);
  if (start) {
    if (isOngoing(status)) return `${start}-Present`;
    // a position with no end date is still being held
    if (section === "position_held" && !end) return `${start}-Present`;
    if (end && end !== start) return `${start}-${end}`;
    return String(start);
  }
  // single-date entries (Resource Person, Paper Presentation, older entries)
  const single = yearOf(date);
  return single ? String(single) : null;
};

// "Select completion status" -> "Completion status"
const visibleLabel = (label = "") => {
  const text = label.replace(/^Select /, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Label of a field as shown to the user (used in forms and error messages)
const nameOf = (f) => visibleLabel(f.label || f.name);

// The model's toJSON exposes `id`; fall back to `_id` just in case
const getId = (item) => item.id ?? item._id;

// Usage: <SectionAdmin section="paper_presentation" label="Paper Presentation" onUnauthorized={onLogout} />
const SectionAdmin = ({ section, label, onUnauthorized }) => {
  const API = `${API_BASE}/api/sections`;
  const fields = SECTION_FIELDS[section] || DEFAULT_FIELDS;

  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState(null); // null = adding, id = editing
  const [focused, setFocused] = useState("");

  const setField = (name) => (e) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const handleUnauthorized = (res) => {
    if (res.status === 401) {
      setError("Session expired. Please log in again.");
      onUnauthorized?.();
      return true;
    }
    return false;
  };

  // Reset form when switching sections
  useEffect(() => {
    setForm({});
    setEditingId(null);
    setError("");
  }, [section]);

  // Fetch entries (aborts stale requests)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/${section}`, { signal: controller.signal });
        const data = await res.json();
        setItems(res.ok ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setItems([]);
          setError("Could not load entries.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [API, section, refreshKey]);

  const saveItem = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    for (const f of fields) {
      if (f.showIf && !f.showIf(form)) continue;
      if (f.required && !String(form[f.name] ?? "").trim()) {
        return setError(`${nameOf(f)} is required.`);
      }
    }

    // Every date must be real, from 1900 up to today (no future dates).
    // The picker enforces this too, but a date can still be typed by hand.
    // YYYY-MM-DD strings compare correctly as text.
    for (const f of fields) {
      if (f.type !== "date" || (f.showIf && !f.showIf(form))) continue;
      const v = form[f.name];
      if (!v) continue;
      if (!DATE_FORMAT.test(v) || v < MIN_DATE) {
        return setError(`${nameOf(f)} must be a valid date.`);
      }
      if (v > today()) {
        return setError(`${nameOf(f)} cannot be in the future.`);
      }
    }

    // Community engagement: completed entries need an end date
    if (section === "community_engagement") {
      if (form.status === "Completed" && !form.endDate) {
        return setError("End date is required for completed entries.");
      }
      if (form.endDate && form.startDate && form.endDate < form.startDate) {
        return setError("End date cannot be before start date.");
      }
    }

    // Position held: either tick "continuing" or give an end date
    if (section === "position_held" && !form.continuing) {
      if (!form.endDate) {
        return setError('End date is required, or tick "Currently continuing".');
      }
      if (form.startDate && form.endDate < form.startDate) {
        return setError("End date cannot be before start date.");
      }
    }

    // Build payload from this section's fields only
    const payload = { section };
    for (const f of fields) {
      if (f.type === "checkbox") continue; // UI-only, never sent
      // hidden fields (e.g. end date while Active) are cleared
      if (f.showIf && !f.showIf(form)) {
        payload[f.name] = editingId ? null : undefined;
        continue;
      }
      const v = form[f.name] ?? "";
      if (f.type === "number") payload[f.name] = Number(v) || 0;
      // when editing, send null so a cleared date is removed
      else if (f.type === "date") payload[f.name] = v || (editingId ? null : undefined);
      else payload[f.name] = String(v).trim();
    }

    try {
      setSaving(true);
      const res = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (handleUnauthorized(res)) return;
      const data = await res.json();

      if (res.ok) {
        setForm({});
        setEditingId(null);
        setRefreshKey((k) => k + 1);
      } else {
        setError(data.message || (editingId ? "Failed to update entry." : "Failed to add entry."));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    const values = {};
    for (const f of fields) {
      if (f.type === "date") {
        let d = item[f.name];
        // older Position Held entries only had `date`; use it as the start date
        if (!d && section === "position_held" && f.name === "startDate") d = item.date;
        values[f.name] = d ? String(d).slice(0, 10) : "";
      } else if (f.type === "checkbox") {
        values[f.name] = Boolean(item.startDate) && !item.endDate;
      } else values[f.name] = item[f.name] ?? "";
    }
    setForm(values);
    setEditingId(getId(item));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm({});
    setEditingId(null);
    setError("");
  };

  const deleteItem = async (id) => {
    if (!confirm(`Delete this ${label} entry?`)) return;
    setError("");
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (handleUnauthorized(res)) return;

      if (res.ok) {
        if (editingId === id) cancelEdit();
        setRefreshKey((k) => k + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to delete entry.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const renderField = (f) => {
    if (f.showIf && !f.showIf(form)) return null;

    if (f.type === "checkbox") {
      return (
        <label
          key={f.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
            cursor: "pointer",
            color: THEME.navy,
            fontFamily: serif,
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={!!form[f.name]}
            onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.checked }))}
            style={{ width: "18px", height: "18px", accentColor: THEME.navy }}
          />
          {f.label}
        </label>
      );
    }

    const common = {
      value: form[f.name] ?? "",
      onChange: setField(f.name),
      onFocus: () => setFocused(f.name),
      onBlur: () => setFocused(""),
      style: {
        ...inputStyle,
        borderColor: focused === f.name ? THEME.navy : THEME.border,
        boxShadow: focused === f.name ? `0 0 0 2px ${THEME.navy}22` : "none",
      },
    };

    let control;
    if (f.type === "textarea") {
      control = <textarea rows={3} {...common} placeholder={f.label} />;
    } else if (f.type === "select") {
      control = (
        <select {...common}>
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    } else if (f.type === "date") {
      control = (
        <input
          {...common}
          type="date"
          min={(f.minFrom && form[f.minFrom]) || MIN_DATE}
          max={today()} // latest selectable date is today
          // open the calendar when clicking anywhere in the box, not just the icon
          onClick={(e) => e.currentTarget.showPicker?.()}
        />
      );
    } else {
      control = <input {...common} type={f.type || "text"} placeholder={f.label} />;
    }

    return (
      <div key={f.name} style={{ marginBottom: "14px" }}>
        <label style={labelStyle}>{nameOf(f)}</label>
        {control}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "860px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: serif,
          fontSize: "26px",
          fontWeight: "bold",
          color: THEME.navy,
          marginBottom: "6px",
        }}
      >
        {label}
      </h1>
      <div
        style={{
          width: "60px",
          height: "3px",
          backgroundColor: THEME.gold,
          marginBottom: "24px",
        }}
      />

      {error && (
        <div
          style={{
            marginBottom: "16px",
            backgroundColor: "#fbeeee",
            border: "1px solid #e6c2c2",
            borderLeft: `4px solid ${THEME.danger}`,
            borderRadius: "2px",
            padding: "10px 14px",
            fontSize: "14px",
            color: THEME.danger,
          }}
        >
          {error}
        </div>
      )}

      {/* Add / edit form */}
      <form
        onSubmit={saveItem}
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
          {editingId ? `Edit ${label}` : `Add New ${label}`}
        </h3>

        {fields.map(renderField)}

        <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: saving ? "#9ca3af" : THEME.navy,
              color: "#ffffff",
              padding: "10px 26px",
              border: "none",
              borderRadius: "3px",
              fontFamily: serif,
              fontSize: "15px",
              fontWeight: "bold",
              letterSpacing: "0.05em",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : editingId ? "Save changes" : `Add ${label}`}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                ...outlineButton(THEME.text),
                padding: "10px 22px",
                fontSize: "15px",
                border: `1.5px solid ${THEME.border}`,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Entry list */}
      {loading ? (
        <p style={{ color: THEME.muted }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: THEME.muted, fontStyle: "italic" }}>No entries found</p>
      ) : (
        items.map((item) => {
          const isEditing = editingId === getId(item);
          const years = formatYears(item, section);
          return (
            <div
              key={getId(item)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                backgroundColor: isEditing ? THEME.editBg : "#ffffff",
                border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${THEME.navy}`,
                borderRadius: "2px",
                padding: "14px 16px",
                marginBottom: "10px",
              }}
            >
              <div style={{ minWidth: 0 }}>
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

                {(item.level || item.status || years) && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "4px",
                    }}
                  >
                    {item.level && <span style={badgeStyle(LEVEL_BADGE)}>{item.level}</span>}
                    {item.status && (
                      <span style={badgeStyle(STATUS_BADGE[item.status] || { bg: "#eceff3", color: "#4b5563", border: "#d1d5db" })}>
                        {item.status}
                      </span>
                    )}
                    {section === "position_held" && item.startDate && !item.endDate && (
                      <span style={badgeStyle(STATUS_BADGE.Active)}>Continuing</span>
                    )}
                    {years && <span style={{ fontSize: "13px", color: THEME.muted }}>{years}</span>}
                  </div>
                )}

                {item.organization && (
                  <p style={{ fontSize: "14px", color: THEME.text }}>{item.organization}</p>
                )}
                {item.description && (
                  <p style={{ fontSize: "14px", color: THEME.muted, marginTop: "2px" }}>
                    {item.description}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => startEdit(item)} style={outlineButton(THEME.navy)}>
                  Edit
                </button>
                <button onClick={() => deleteItem(getId(item))} style={outlineButton(THEME.danger)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SectionAdmin;