import { Heart, Mail } from "lucide-react";

interface HeroData {
  name: string;
  title: string;
  email: string;
}

interface FooterProps {
  hero: HeroData;
}

const Footer = ({ hero }: FooterProps) => {
  return (
    <footer className="bg-gradient-divine py-12 border-t border-wisdom-blue/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">

          {/* Left Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 bg-gradient-wisdom rounded-full flex items-center justify-center animate-divine-pulse">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold text-primary">
                  {hero?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hero?.title}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated to educational excellence through spiritual wisdom and academic rigor.
            </p>
          </div>

          {/* Center Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Quick Links</h4>
            <div className="space-y-2">
              <a href="#about" className="block text-sm text-muted-foreground hover:text-wisdom-blue">
                About
              </a>
              <a href="#research" className="block text-sm text-muted-foreground hover:text-wisdom-blue">
                Research
              </a>
              <a href="#leadership" className="block text-sm text-muted-foreground hover:text-wisdom-blue">
                Leadership
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Connect</h4>

            {hero?.email && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-wisdom-blue" />
                <a
                  href={`mailto:${hero.email}`}
                  className="text-sm text-muted-foreground hover:text-wisdom-blue"
                >
                  {hero.email}
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-wisdom-blue/10 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 {hero?.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;