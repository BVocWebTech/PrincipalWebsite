import { useEffect, useState } from "react";

export default function HeroSection() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [email, setEmail] = useState("");
const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const res = await fetch("https://drsrbeenajose.tech/api/hero");
      const data = await res.json();

      setName(data?.name || "");
      setTitle(data?.title || "");
      setCaption(data?.caption || "");
      setEmail(data?.email || "");

      if (data?.portrait) {
        setPortraitPreview("https://drsrbeenajose.tech" + data.portrait);
      }

      if (data?.cv) {
        setCvUrl("https://drsrbeenajose.tech" + data.cv);
      }
    } catch (err) {
      console.error("Error fetching hero:", err);
    }
  };

  const saveHero = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("email", email);

      if (portraitFile) {
        formData.append("portrait", portraitFile);
      }

      if (cvFile) {
        formData.append("cv", cvFile);
      }

      const res = await fetch("https://drsrbeenajose.tech/api/hero", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Hero Section Updated Successfully");
        fetchHero(); // reload fresh data
        setPortraitFile(null);
        setCvFile(null);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Error saving hero:", err);
      alert("Error saving hero section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center items-start pt-20 pb-10 bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">

        <h2 className="text-2xl font-bold text-center">
          Hero Section Editor
        </h2>

        {/* Name */}
        <div>
          <label className="font-semibold block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        {/* Title */}
        <div>
          <label className="font-semibold block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="font-semibold block mb-1">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-semibold block mb-1">Email (Stored only, not public)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
        </div>

        {/* Portrait Upload */}
        <div>
          <label className="font-semibold block mb-2">Portrait Image</label>

          {portraitPreview && (
            <img
              src={portraitPreview}
              alt="preview"
              className="w-32 h-32 object-cover rounded-full mb-3 mx-auto"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files) return;
              const file = e.target.files[0];
              setPortraitFile(file);
              setPortraitPreview(URL.createObjectURL(file));
            }}
            className="w-full p-2 border rounded-xl"
          />
        </div>

        {/* CV Upload */}
        <div>
          <label className="font-semibold block mb-2">CV (PDF)</label>

          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary underline mb-3"
            >
              View current CV
            </a>
          )}

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              if (!e.target.files) return;
              const file = e.target.files[0];
              setCvFile(file);
            }}
            className="w-full p-2 border rounded-xl"
          />
          {cvFile && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {cvFile.name}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={saveHero}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Hero Section"}
        </button>

      </div>
    </section>
  );
}
