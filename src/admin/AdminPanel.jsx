import { useState } from "react";
import HeroSection from "./HeroSection";
import Achievements from "./Achievements";
import Research from "./Research";
import ChangePassword from "./ChangePassword";

export default function AdminPanel({ onLogout }) {
  const [currentSection, setCurrentSection] = useState("hero");

  const renderSection = () => {
    switch (currentSection) {
      case "hero":
        return <HeroSection />;
      case "achievements":
        return <Achievements />;
      case "research":
        return <Research />;
      case "password":
        return <ChangePassword />;
      default:
        return null;
    }
  };

  return (
    <div className="p-10">
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setCurrentSection("hero")}
          className="section-btn px-6 py-3 rounded-2xl font-bold bg-purple-100 text-purple-800"
        >
          🎨 Hero
        </button>
        <button
          onClick={() => setCurrentSection("achievements")}
          className="section-btn px-6 py-3 rounded-2xl font-bold bg-green-100 text-green-800"
        >
          🏆 Achievements
        </button>
        <button
          onClick={() => setCurrentSection("research")}
          className="section-btn px-6 py-3 rounded-2xl font-bold bg-indigo-100 text-indigo-800"
        >
          📚 Research
        </button>
        <button
          onClick={() => setCurrentSection("password")}
          className="section-btn px-6 py-3 rounded-2xl font-bold bg-yellow-100 text-yellow-800"
        >
          🔑 Change Password
        </button>
        <button
          onClick={onLogout}
          className="ml-auto px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Logout
        </button>
      </div>

      {/* Render selected section */}
      {renderSection()}
    </div>
  );
}
