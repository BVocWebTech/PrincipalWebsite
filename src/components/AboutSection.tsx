import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Globe,
  TrendingUp,
  Landmark,
  Home,
} from "lucide-react";

interface AchievementItem {
  category: string;
  icon: any;
  list: string[];
}

const iconMap: any = {
  International: Globe,
  National: Landmark,
  "State Level": TrendingUp,
  Institutional: Home,
};

const qualities = [
  {
    icon: Heart,
    title: "Spiritual Leadership",
    description:
      "Guided by divine wisdom and spiritual enlightenment in educational leadership",
  },
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description:
      "Distinguished scholar with extensive research contributions",
  },
  {
    icon: Users,
    title: "Educational Vision",
    description: "Transformative leader fostering holistic development",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Implementing modern educational methodologies",
  },
  {
    icon: BookOpen,
    title: "Research Dedication",
    description: "Committed researcher with scholarly impact",
  },
  {
    icon: Award,
    title: "Professional Excellence",
    description: "High standards of professionalism",
  },
];

const AboutSection = () => {
  const [allAchievements, setAllAchievements] = useState<AchievementItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // =============================
  // FETCH ACHIEVEMENTS
  // =============================

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch("https://drsrbeenajose.tech/api/achievements");

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (!data || typeof data !== "object") {
          throw new Error("Invalid API response");
        }

        const formatted = Object.keys(data).map((category) => ({
          category,
          icon: iconMap[category] || Award,
          list: data[category].map((item: any) => item.title),
        }));

        setAllAchievements(formatted);
      } catch (error) {
        console.error("Failed to load achievements", error);
        setAllAchievements([]);
      }

      setLoading(false);
    };

    fetchAchievements();
  }, []);

  const totalSlides = allAchievements.length;

  const nextSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading achievements...
      </div>
    );
  }

  const currentAchievement = allAchievements[currentSlideIndex];

  return (
    <section id="about" className="py-20 bg-gradient-divine">
      <div className="container mx-auto px-6">

        {/* HEADER */}

        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-wisdom-blue mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              About Dr Sr Beena Jose
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
 <br /><br /> </p>
<h1><b>Teaching Interests</b></h1>
<p className="text-base text-gray-700 max-w-3xl mx-auto text-justify leading-relaxed">General Chemistry, Biochemistry, Organic Chemistry, Physical Chemistry, Inorganic Chemistry, Molecules of Life, Synthetic life, Ethics implications in the Recent developments in Genetic Sciences 
 <br /><br /> </p>
        </div>
        {/* ================= ACHIEVEMENTS HEADING ================= */}
<div className="flex justify-center mb-10">
  <div className="flex items-center gap-2 bg-blue-100 px-5 py-2 rounded-full shadow">
    <Award className="w-5 h-5 text-blue-600" />
    <span className="text-sm font-medium text-blue-700">
      Achievements
    </span>
  </div>
</div>

        {/* ACHIEVEMENTS CAROUSEL */}

        {totalSlides > 0 && currentAchievement && (
          <div className="flex justify-center mb-20">
            <div className="relative w-full max-w-4xl">

              <ChevronLeft
                onClick={prevSlide}
                className="absolute -left-16 top-1/2 -translate-y-1/2 w-9 h-9 cursor-pointer text-gray-500 hover:text-primary"
              />

              <ChevronRight
                onClick={nextSlide}
                className="absolute -right-16 top-1/2 -translate-y-1/2 w-9 h-9 cursor-pointer text-gray-500 hover:text-primary"
              />

              <Card className="bg-white shadow-xl rounded-2xl">
                <CardHeader className="bg-blue-100 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <currentAchievement.icon className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl">
                      {currentAchievement.category}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {currentAchievement.list.map((item, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="mt-2 w-2 h-2 bg-primary rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* QUALITIES */}

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
                <CardDescription className="text-center">
                  {quality.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;