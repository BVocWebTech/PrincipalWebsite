import { useState, useEffect } from "react";

export default function ResearchAdmin() {

  const getToken = () => localStorage.getItem("token");

  const types = [
    "Journal",
    "Full paper in proceedings",
    "Book",
    "Article",
    "Book Chapter",
    
  ];

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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchPublications(currentPage);
  }, [currentPage]);

  const fetchPublications = async (page = 1) => {
    const res = await fetch(
      `https://drsrbeenajose.tech/api/research?page=${page}&limit=${limit}`
    );
    const data = await res.json();
    setPublications(data.publications || []);
    setTotalPages(data.totalPages || 1);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= PREVIEW =================
  const handleAddToPreview = () => {
    if (!form.type || !form.name || !form.title || !form.date) {
      alert("Required fields missing");
      return;
    }

    setPreviewList([...previewList, form]);

    setForm({
      type: "",
      name: "",
      title: "",
      level: "International",
      indexing: "",
      link: "",
      date: "",
    });
  };

  const removePreview = (index) =>
    setPreviewList(previewList.filter((_, i) => i !== index));

  const handleSaveAll = async () => {
    const res = await fetch("https://drsrbeenajose.tech/api/research", {
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

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ...item,
      date: item.date.split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    const res = await fetch(
      `https://drsrbeenajose.tech/api/research/${editingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    alert("Updated successfully");
    setEditingId(null);
    fetchPublications(currentPage);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    await fetch(`https://drsrbeenajose.tech/api/research/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchPublications(currentPage);
  };

  return (
    <section className="min-h-screen flex justify-center pt-20 bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 space-y-6">

        <h2 className="text-2xl font-bold">
          {editingId ? "Update Research" : "Research Admin"}
        </h2>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4">
          <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
            <option value="">Select Type</option>
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>

          <select name="level" value={form.level} onChange={handleChange} className="border p-2 rounded">
            {levels.map((l) => <option key={l}>{l}</option>)}
          </select>

          <input name="name" value={form.name} onChange={handleChange} placeholder="Journal Name" className="border p-2 rounded" />
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-2 rounded" />
          <input name="indexing" value={form.indexing} onChange={handleChange} placeholder="Indexing" className="border p-2 rounded" />
          <input name="link" value={form.link} onChange={handleChange} placeholder="Link" className="border p-2 rounded" />
          <input type="date" max={today} name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <button
          onClick={editingId ? handleUpdate : handleAddToPreview}
          className="bg-primary text-white px-6 py-2 rounded"
        >
          {editingId ? "Update" : "Add to Preview"}
        </button>

        {/* PREVIEW */}
{previewList.length > 0 && (
  <div className="bg-gray-100 p-4 rounded mt-6">
    <h3 className="font-bold mb-4 text-lg">Preview</h3>

    {previewList.map((item, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded mb-3 shadow-sm border"
      >
    {/* PREVIEW ITEM */}
<div className="flex justify-between items-center bg-white p-3 rounded shadow-sm mb-2">

  {/* Text Section */}
  <p className="text-sm flex-1 pr-4 break-words">
    {item.type} | {item.name} | {item.title} | {item.level} | {item.indexing || "-"} |{" "}
    {item.link ? (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View
      </a>
    ) : (
      "-"
    )} | {new Date(item.date).toLocaleDateString()}
  </p>

  {/* Remove Button */}
  <button
    onClick={() => removePreview(index)}
    className="bg-primary text-white px-3 py-1 rounded text-sm"
  >
    Remove
  </button>

</div>
      </div>
    ))}

    <button
      onClick={handleSaveAll}
      className="bg-primary text-white px-6 py-2 rounded mt-3"
    >
      Save All
    </button>
  </div>
)}
           

        {/* LIST */}
       {publications.map((item) => (
  <div
    key={item._id}
    className="flex justify-between items-center border p-4 rounded mb-2 bg-white"
  >

    {/* Text Section */}
    <p className="font-semibold text-sm flex-1 pr-4 break-words">
      {item.title} | {item.type} | {item.name} | {item.level} |{" "}
      {item.indexing || "-"} |{" "}
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View
        </a>
      ) : (
        "-"
      )} | {new Date(item.date).toLocaleDateString()}
    </p>

    {/* Buttons Section */}
    <div className="flex gap-2">
      <button
        onClick={() => handleEdit(item)}
        className="bg-primary text-white px-3 py-1 rounded text-sm"
      >
        Edit
      </button>

      <button
        onClick={() => handleDelete(item._id)}
        className="bg-primary text-white px-3 py-1 rounded text-sm"
      >
        Delete
      </button>
    </div>

  </div>
))}

        {totalPages > 1 && (
  <div className="flex justify-center gap-2 mt-6">

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`px-3 py-1 border rounded ${
          currentPage === i + 1
            ? "bg-primary text-white"
            : "bg-white"
        }`}
      >
        {i + 1}
      </button>
    ))} 

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(currentPage + 1)}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>

  </div>
   
  )}
  </div></section>)
}