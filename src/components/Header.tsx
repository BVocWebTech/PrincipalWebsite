import { useState } from "react";
import { Button } from "./ui/button";
import { BookOpen, GraduationCap, Heart, Users, Menu, X } from "lucide-react";

interface HeroData {
  name: string;
  title: string;
}

interface HeaderProps {
  hero: HeroData;
}

const Header = ({ hero }: HeaderProps) => {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-serene backdrop-blur-md border-b border-wisdom-blue/10 shadow-gentle">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-wisdom rounded-full flex items-center justify-center animate-divine-pulse">
              <Heart className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-serif font-semibold text-primary">
                {hero.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {hero.title}
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="serene" size="sm" onClick={() => scrollToSection("about")}>
              <Users className="w-4 h-4 mr-1" />
              About
            </Button>

            <Button variant="serene" size="sm" onClick={() => scrollToSection("research")}>
              <BookOpen className="w-4 h-4 mr-1" />
              Research
            </Button>

            <Button variant="serene" size="sm" onClick={() => scrollToSection("leadership")}>
              <GraduationCap className="w-4 h-4 mr-1" />
              Leadership
            </Button>

            <Button variant="divine" size="sm" onClick={() => scrollToSection("contact")}>
              Connect
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden text-primary" onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden mt-4 flex flex-col gap-2 bg-white rounded-xl p-4 shadow-divine">
            <Button variant="serene" onClick={() => scrollToSection("about")}>
              About
            </Button>
            <Button variant="serene" onClick={() => scrollToSection("research")}>
              Research
            </Button>
            <Button variant="serene" onClick={() => scrollToSection("leadership")}>
              Leadership
            </Button>
            <Button variant="divine" onClick={() => scrollToSection("contact")}>
              Connect
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;