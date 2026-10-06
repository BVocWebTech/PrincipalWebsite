import { Button } from "./ui/button";
import { Sparkles, BookOpen, Heart, Download } from "lucide-react";
import researchHero from "../assets/research-hero.jpg";
import { API_BASE } from "../lib/api";

interface HeroData {
  name: string;
  title: string;
  portrait: string;
  caption?: string;
  cv?: string;
}

interface HeroSectionProps {
  hero: HeroData;
}

const HeroSection = ({ hero }: HeroSectionProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-serene bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${researchHero})` }}
      />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-6 h-6 bg-wisdom-blue/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-4 h-4 bg-inspiration-glow/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-20 w-8 h-8 bg-serenity-blue/20 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-wisdom-blue/15 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-wisdom-blue">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">{hero.caption}</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-serif font-bold text-energetic-blue">{hero.name}</h1>
              <h2 className="text-lg lg:text-3xl text-muted-foreground">{hero.title}</h2>

              <div className="bg-gradient-wisdom/10 border border-wisdom-blue/20 rounded-lg p-6">
                <p className="italic text-lg text-primary">
                  "Transforming minds, nurturing souls, and shaping the future through spiritual wisdom and academic excellence."
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="divine" size="lg" onClick={() => scrollToSection("research")}>
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Research
              </Button>
              <Button variant="enlightened" size="lg" onClick={() => scrollToSection("about")}>
                <Sparkles className="w-5 h-5 mr-2" />
                Learn More
              </Button>

              {hero.cv && (
                <Button variant="divine" size="lg" asChild>
                  <a
                    href={`https://drsrbeenajose.tech${hero.cv}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download CV
                  </a>
                </Button>
              )}
            </div>
          </div>
<div className="flex justify-center lg:justify-end">
  <div
    role="img"
    aria-label={hero.name}
    className="w-80 h-80 sm:w-[26rem] sm:h-[26rem] lg:w-[32rem] lg:h-[32rem] max-w-full rounded-xl  shadow-wisdom bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${API_BASE}${hero.portrait})`,
    }}
  />
</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
