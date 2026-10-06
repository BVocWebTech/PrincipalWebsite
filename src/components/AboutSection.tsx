import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Heart,
  GraduationCap,
  Users,
  Lightbulb,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Home,
  Flag,
} from "lucide-react";

import { API_BASE } from "../lib/api";

interface SectionItem {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  date?: string;
  startDate?: string;
  endDate?: string | null;
}

// A single slide in the combined carousel. Achievement categories carry a
// plain string list; Resource Person / Position Held carry the fuller
// SectionItem objects so organization/date can be shown too.
type Slide =
  | { kind: "achievement"; items: { title: string; category: string }[] }
  | { kind: "resource_person"; items: SectionItem[] }
  | { kind: "position_held"; items: SectionItem[] };

const iconMap: any = {
  State: TrendingUp,
  Institutional: Home,
  University: GraduationCap,
};

const qualities = [
  { icon: Heart, title: "Spiritual Leadership", description: "Guided by divine wisdom and spiritual enlightenment in educational leadership" },
  { icon: GraduationCap, title: "Academic Excellence", description: "Distinguished scholar with extensive research contributions" },
  { icon: Users, title: "Educational Vision", description: "Transformative leader fostering holistic development" },
  { icon: Lightbulb, title: "Innovation", description: "Implementing modern educational methodologies" },
  { icon: BookOpen, title: "Research Dedication", description: "Committed researcher with scholarly impact" },
  { icon: Award, title: "Professional Excellence", description: "High standards of professionalism" },
];

// Dates are saved as UTC midnight, so read the year in UTC (same as the admin panel)
const yearOf = (d?: string | null) => (d ? new Date(d).getUTCFullYear() : null);

// "2019-Present" when no end date, "2020-2024" for a range, "2020" if both years match
const formatYearRange = (item: SectionItem) => {
  const start = yearOf(item.startDate) ?? yearOf(item.date); // older entries only have `date`
  const end = yearOf(item.endDate);

  if (!start) return "";
  if (!end) return `${start}-Present`;
  if (end === start) return String(start);
  return `${start}-${end}`;
};

const AboutSection = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (path: string) => {
      try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    const fetchAll = async () => {
      const built: Slide[] = [];

      // ---- Achievements, ALL in one slide, each line tagged with its category ----
      const achievementData = await load("/api/achievements");
      if (achievementData && typeof achievementData === "object") {
        const allAchievements: { title: string; category: string }[] = [];
        Object.keys(achievementData).forEach((category) => {
          achievementData[category].forEach((item: any) => {
            allAchievements.push({ title: item.title, category });
          });
        });
        if (allAchievements.length > 0) {
          built.push({ kind: "achievement", items: allAchievements });
        }
      }

      // ---- Resource Person, one slide listing all entries ----
      const resourcePerson = await load("/api/sections/resource_person");
      if (Array.isArray(resourcePerson) && resourcePerson.length > 0) {
        built.push({ kind: "resource_person", items: resourcePerson });
      }

      // ---- Position Held, one slide listing all entries ----
      const positions = await load("/api/sections/position_held");
      if (Array.isArray(positions) && positions.length > 0) {
        built.push({ kind: "position_held", items: positions });
      }

      setSlides(built);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const total = slides.length;
  const current = slides[slideIndex];

  const next = () => {
    if (total === 0) return;
    setSlideIndex((prev) => (prev + 1) % total);
  };
  const prev = () => {
    if (total === 0) return;
    setSlideIndex((prev) => (prev - 1 + total) % total);
  };

  const renderSlideHeader = (slide: Slide) => {
    if (slide.kind === "achievement") {
      return (
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Achievements</CardTitle>
        </div>
      );
    }

    if (slide.kind === "resource_person") {
      return (
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Resource Person</CardTitle>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-primary" />
        <CardTitle className="text-2xl">Position Held</CardTitle>
      </div>
    );
  };

  const renderSlideBody = (slide: Slide) => {
    if (slide.kind === "achievement") {
      return (
        <ul className="space-y-4">
          {slide.items.map((item, index) => {
            const isFlagCategory = item.category === "International" || item.category === "National";
            const CategoryIcon = iconMap[item.category] || Award;

            return (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-2 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="flex-1">
                  <span>{item.title}</span>
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground border rounded-full px-2 py-0.5">
                    {isFlagCategory ? (
                      <Flag className="w-3 h-3 text-blue-600 fill-blue-600" />
                    ) : (
                      <CategoryIcon className="w-3 h-3 text-primary" />
                    )}
                    {item.category}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      );
    }

    // resource_person / position_held
    return (
      <ul className="space-y-4">
        {slide.items.map((item) => {
          const years = slide.kind === "position_held" ? formatYearRange(item) : "";
          return (
            <li key={item.id} className="flex gap-3 text-sm">
              <span className="mt-2 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span>
                <span className="font-medium">{item.title}</span>
                {item.organization && (
                  <span className="text-muted-foreground"> — {item.organization}</span>
                )}
                {years && (
                  <span className="ml-2 text-xs font-medium text-muted-foreground border rounded-full px-2 py-0.5">
                    {years}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section id="about" className="py-20 bg-gradient-divine">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-wisdom-blue mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              About Prof (Dr) Sr Beena Jose
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-primary">
            A Journey of Faith, Wisdom & Excellence
          </h2>

          <p className="text-base text-gray-700 max-w-3xl mx-auto text-justify leading-relaxed">
            I am Dr. Sr. Beena Jose, a Catholic nun belonging to the Congregation of Mother of Carmel (CMC), and a dedicated academician with a passion for leadership and education. I have been serving as the Principal-in-Charge of Vimala College (Autonomous), Thrissur since 2018.
            <br /><br />
            My journey in academia has been guided by a strong commitment to excellence, continuous growth, and meaningful contributions to the field of education. Over the years, I have had the privilege of taking on various responsibilities that have shaped my leadership and strengthened my vision for institutional development.
            <br /><br />
            I strive to inspire and empower students while fostering an environment that promotes academic integrity, innovation, and holistic development.
            <br /><br />
          </p>
        </div>

        {/* ================= SINGLE COMBINED CAROUSEL ================= */}
        <div className="mb-20">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : total > 0 && current ? (
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl">
                <ChevronLeft
                  onClick={prev}
                  className="absolute -left-16 top-1/2 -translate-y-1/2 w-9 h-9 cursor-pointer text-gray-500 hover:text-primary"
                />
                <ChevronRight
                  onClick={next}
                  className="absolute -right-16 top-1/2 -translate-y-1/2 w-9 h-9 cursor-pointer text-gray-500 hover:text-primary"
                />

                <Card className="bg-white shadow-xl rounded-2xl">
                  <CardHeader className="bg-blue-100 rounded-t-2xl">
                    {renderSlideHeader(current)}
                  </CardHeader>

                  <CardContent className="p-8 max-h-[420px] overflow-y-auto">
                    {renderSlideBody(current)}
                  </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  {slideIndex + 1} / {total}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Nothing added yet.</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualities.map((quality, index) => (
            <Card key={index} className="hover:scale-105 transition">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <quality.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle>{quality.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">{quality.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;