import { useState } from "react";
import HeroSection from "./HeroSection";
import Achievements from "./Achievements";
import Research from "./Research";
import ChangePassword from "./ChangePassword";
import SectionAdmin from "./SectionAdmin";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "achievements", label: "Achievements" },
  { key: "research", label: "Publications" },
  { key: "paper_presentation", label: "Paper Presentation" },
  { key: "community_engagement", label: "Community Engagement" },
  { key: "research_interest", label: "Research Interest" },
  { key: "password", label: "Change Password" },
];

// Academic palette: navy + gold on soft ivory (change these to restyle)
const THEME = {
  pageBg: "#f7f5f0",    // soft ivory page background
  cardBg: "#ffffff",
  navy: "#1f3a5f",      // headings, selected tab
  gold: "#b08d3c",      // accent line
  text: "#374151",      // normal tab text
  border: "#e2ddd0",
  logout: "#8b1e2d",    // deep maroon
};

const serif = "Georgia, 'Times New Roman', serif";

export default function AdminPanel({ onLogout }) {
  const [currentSection, setCurrentSection] = useState("hero");

  const renderSection = () => {
    switch (currentSection) {
      case "hero":
        return <HeroSection onUnauthorized={onLogout} />;
      case "achievements":
        // Achievements contains its own sub-tabs for
        // Resource Person and Position Held internally.
        return <Achievements onUnauthorized={onLogout} />;
      case "research":
        return <Research />;
      case "paper_presentation":
        return <SectionAdmin section="paper_presentation" label="Paper Presentation" onUnauthorized={onLogout} />;
      case "community_engagement":
        return <SectionAdmin section="community_engagement" label="Community Engagement" onUnauthorized={onLogout} />;
      case "research_interest":
        return <SectionAdmin section="research_interest" label="Research Interest" onUnauthorized={onLogout} />;
      case "password":
        return <ChangePassword />;
      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: THEME.pageBg, minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingBottom: "14px",
            borderBottom: `3px double ${THEME.gold}`,
            marginBottom: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: THEME.gold,
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              Portfolio Management
            </p>
            <h1
              style={{
                fontFamily: serif,
                fontSize: "32px",
                fontWeight: "bold",
                color: THEME.navy,
                lineHeight: 1.1,
              }}
            >
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={onLogout}
            style={{
              backgroundColor: "transparent",
              color: THEME.logout,
              padding: "8px 22px",
              border: `1.5px solid ${THEME.logout}`,
              borderRadius: "2px",
              fontWeight: "bold",
              fontSize: "14px",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Tab bar: classic underline style */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 28px",
            borderBottom: `1px solid ${THEME.border}`,
            marginBottom: "24px",
          }}
        >
          {TABS.map((tab) => {
            const isActive = currentSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCurrentSection(tab.key)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: `3px solid ${isActive ? THEME.navy : "transparent"}`,
                  marginBottom: "-1px",
                  padding: "10px 2px",
                  fontFamily: serif,
                  fontSize: "17px",
                  fontWeight: isActive ? "bold" : "normal",
                  color: isActive ? THEME.navy : THEME.text,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <div
          style={{
            backgroundColor: THEME.cardBg,
            border: `1px solid ${THEME.border}`,
            borderTop: `3px solid ${THEME.navy}`,
            borderRadius: "2px",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          {renderSection()}
        </div>
      </div>
    </div>
  );
}