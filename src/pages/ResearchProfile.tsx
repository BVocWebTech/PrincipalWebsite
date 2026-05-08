import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Publication = {
  title: string;
  journal: string;
  year: string;
  citations: number | string;
  type: string;
};

const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    title: "Transformative Leadership in Higher Education: A Spiritual Perspective",
    journal: "Journal of Educational Excellence",
    year: "2024",
    citations: 45,
    type: "Research Article",
  },
  {
    title: "Integrating Values-Based Education in Autonomous Colleges",
    journal: "International Education Review",
    year: "2023",
    citations: 38,
    type: "Case Study",
  },
  {
    title: "Women Leadership in Academic Institutions: Challenges and Opportunities",
    journal: "Higher Education Quarterly",
    year: "2023",
    citations: 52,
    type: "Review Article",
  },
  {
    title: "Spiritual Intelligence in Educational Leadership",
    journal: "Journal of Leadership Studies",
    year: "2022",
    citations: 67,
    type: "Research Article",
  },
];

const ResearchProfile = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("researchData") || "{}");
      if (data.allPublications && data.allPublications.length > 0) {
        setPublications(data.allPublications);
      } else {
        setPublications(DEFAULT_PUBLICATIONS);
      }
    } catch {
      setPublications(DEFAULT_PUBLICATIONS);
    }
  }, []);

  return (
    <section className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* HEADER */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-wisdom-blue">
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Research Profile
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-primary">
            Complete Publications
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A complete list of scholarly publications reflecting academic
            excellence, leadership research, and spiritual pedagogy.
          </p>
        </div>

        {/* BACK BUTTON */}
        <div className="mb-10">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Button>
        </div>

        {/* PUBLICATIONS LIST */}
        <div className="space-y-6">
          {publications.map((pub, index) => (
            <Card
              key={index}
              className="hover:shadow-divine transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 leading-tight">
                      {pub.title}
                    </CardTitle>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {pub.journal}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {pub.year}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {pub.citations} citations
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{pub.type}</Badge>
                    <Button
                      variant="serene"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Button>
                  </div>

                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResearchProfile;
