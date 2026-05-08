import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) return alert("Fill all fields");


      const res = await fetch("https://drsrbeenajose.tech/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      

     let data = {};
try {
  data = await res.json();
} catch {}

if (res.ok) {
  alert("✅ Login successful"); 
  localStorage.setItem("token", data.token);
  onLogin();
} else {
  alert("❌ " + (data.message || "Login failed"));
}
    
  };


return (
   <section className="min-h-screen flex justify-center items-start pt-20 pb-10 bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-6">

      <h2 className="text-3xl font-bold mb-6 text-center text-primary">
        Admin Login
      </h2>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full p-3 border rounded-xl mb-4 bg-background"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-3 border rounded-xl mb-4 bg-background"
      />

      <button
        onClick={handleLogin}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition"
      >
        Login
      </button>

    </div>
  </section>
);

}
