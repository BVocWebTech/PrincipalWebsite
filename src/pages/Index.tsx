import { useEffect, useState } from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ResearchSection from "../components/ResearchSection";
import LeadershipSection from "../components/LeadershipSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

interface HeroData {
  name: string;
  title: string;
  portrait: string;
  caption?: string;
  email: string;
  cv?: string;
}

export default function Index() {
  const [hero, setHero] = useState<HeroData | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("https://drsrbeenajose.tech/api/hero");
        const data = await res.json();
        setHero(data);
      } catch (error) {
        console.error("Error fetching hero:", error);
      }
    };

    fetchHero();
  }, []);

  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header hero={hero} />

      <main className="pt-20">
        <HeroSection hero={hero} />
        <AboutSection />
        <ResearchSection />
        <LeadershipSection />
        <ContactSection />
      </main>

      <Footer hero={hero} />
    </div>
  );
}
