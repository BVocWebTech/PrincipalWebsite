import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Target, Lightbulb, Heart, Star } from "lucide-react";

const LeadershipSection = () => {
  const leadershipQualities = [
    {
      icon: Crown,
      title: "Visionary Leadership",
      description: "Setting strategic direction for educational excellence and institutional growth",
      impact: "Transformed Vimala College into a leading autonomous institution"
    },
    {
      icon: Heart,
      title: "Spiritual Guidance",
      description: "Integrating values-based education with spiritual wisdom and compassion",
      impact: "Created an environment of holistic student development"
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Fostering collaborative relationships among faculty, students, and stakeholders",
      impact: "Built strong academic and spiritual communities"
    },
    {
      icon: Target,
      title: "Strategic Planning",
      description: "Developing comprehensive strategies for academic and administrative excellence",
      impact: "Achieved autonomous status and academic recognition"
    },
    {
      icon: Lightbulb,
      title: "Innovation Champion",
      description: "Promoting innovative teaching methodologies and educational technologies",
      impact: "Modernized curriculum and learning approaches"
    },
    {
      icon: Star,
      title: "Inspirational Mentor",
      description: "Guiding and inspiring faculty and students toward personal and professional growth",
      impact: "Mentored numerous successful academics and leaders"
    }
  ];

  const initiatives = [
    {
      title: "Digital Transformation Initiative",
      description: "Led comprehensive digitization of academic processes and online learning platforms",
      year: "2020-2024",
      status: "Ongoing"
    },
    {
      title: "Women Empowerment Program",
      description: "Launched initiatives to support women's leadership in education and society",
      year: "2019-Present",
      status: "Active"
    },
    {
      title: "Research Excellence Center",
      description: "Established dedicated research facilities and mentorship programs",
      year: "2021-2023",
      status: "Completed"
    },
    {
      title: "Spiritual Development Program",
      description: "Integrated values-based education with spiritual growth opportunities",
      year: "2018-Present",
      status: "Active"
    }
  ];

  const leadership_philosophy = [
    "Lead with compassion and spiritual wisdom",
    "Foster inclusive and collaborative environments",
    "Inspire excellence through personal example",
    "Integrate spiritual values with academic rigor",
    "Empower others to achieve their full potential",
    "Maintain unwavering commitment to service"
  ];

  return (
    <section id="leadership" className="py-20 bg-gradient-serene">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-wisdom-blue mb-4">
            <Crown className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">Leadership Excellence</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-primary">
            Visionary Leadership
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transforming educational landscapes through spiritual wisdom, innovative thinking, 
            and unwavering commitment to excellence in academic leadership.
          </p>
        </div>

        {/* Leadership Qualities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {leadershipQualities.map((quality, index) => (
            <Card 
              key={index} 
              className="animate-fade-in hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm" 
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-wisdom rounded-full flex items-center justify-center mx-auto mb-4 animate-divine-pulse">
                  <quality.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{quality.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {quality.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-serenity-blue/30 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium">
                    <span className="text-wisdom-blue">Impact:</span> {quality.impact}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leadership Philosophy */}
        <div className="mb-16">
          <Card className="bg-gradient-divine shadow-divine">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-serif text-primary">Leadership Philosophy</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Core principles that guide transformational leadership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {leadership_philosophy.map((principle, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-4 bg-white/60 rounded-lg animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="w-3 h-3 bg-wisdom-blue rounded-full flex-shrink-0"></div>
                    <span className="text-primary font-medium">{principle}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Initiatives */}
        <div>
          <h3 className="text-3xl font-serif font-semibold text-primary text-center mb-12">
            Strategic Initiatives
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {initiatives.map((initiative, index) => (
              <Card 
                key={index} 
                className="animate-fade-in hover:shadow-divine transition-all duration-300" 
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{initiative.title}</CardTitle>
                      <CardDescription className="text-muted-foreground mb-3">
                        {initiative.description}
                      </CardDescription>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {initiative.year}
                        </Badge>
                        <Badge 
                          variant={initiative.status === 'Active' ? 'divine' : initiative.status === 'Ongoing' ? 'serene' : 'wisdom'}
                          className="text-xs"
                        >
                          {initiative.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;