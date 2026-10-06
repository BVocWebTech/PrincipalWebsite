import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BookOpen, Calendar, ExternalLink } from "lucide-react";
import { API_BASE } from "../lib/api";

interface Publication {
  _id: string;
  title: string;
  name: string;
  type: string;
  level: string;
  indexing?: string;
  link?: string;
  date?: string;
}

interface SectionItem {
  id: string;
  title: string;
  description?: string;
  organization?: string;
  date?: string;
  icon?: string;
}

const ResearchSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [interests, setInterests] = useState<SectionItem[]>([]);
  const [presentations, setPresentations] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPublications = async (page = 1) => {
    try {
      const res = await fetch(`${API_BASE}/api/research?page=${page}&limit=5`);
      if (!res.ok) throw new Error("Failed to fetch publications");
      const data = await res.json();
      setPublications(data.publications || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
    } catch (err) {
      console.error("Publication fetch error:", err);
      setPublications([]);
    }
  };

  const fetchInterests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sections/research_interest`);
      if (!res.ok) throw new Error("Failed to fetch interests");
      const data = await res.json();
      setInterests(data);
    } catch (err) {
      console.error("Research interests fetch error:", err);
      setInterests([]);
    }
  };

  const fetchPresentations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sections/paper_presentation`);
      if (!res.ok) throw new Error("Failed to fetch presentations");
      const data = await res.json();
      setPresentations(data);
    } catch (err) {
      console.error("Paper presentations fetch error:", err);
      setPresentations([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPublications(1), fetchInterests(), fetchPresentations()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handlePageChange = async (page: number) => {
    setLoading(true);
    await fetchPublications(page);
    setLoading(false);
  };

  return (
    <section id="research" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-primary">Research & Publications</h2>
        </div>

        {loading && <div className="text-center text-yellow-600">Loading...</div>}

        <Tabs defaultValue="interests">
          <TabsList className="grid w-full grid-cols-3 mb-10">
            <TabsTrigger value="interests">Research Interests</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="presentations">Paper Presentations</TabsTrigger>
          </TabsList>

          {/* ================= RESEARCH INTERESTS ================= */}
          <TabsContent value="interests">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {interests.length === 0 ? (
                <p className="text-center text-gray-500 col-span-2">
                  No research interests added yet.
                </p>
              ) : (
                interests.map((interest) => (
                  <Card key={interest.id} className="hover:shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{interest.icon || "🔬"}</span>
                        <h3 className="text-lg font-semibold">{interest.title}</h3>
                      </div>
                      {interest.description && (
                        <p className="text-sm text-muted-foreground">{interest.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ================= PUBLICATIONS ================= */}
          <TabsContent value="publications">
            <div className="space-y-6">
              {!loading && publications.length === 0 && (
                <div className="text-center text-gray-500">No publications available.</div>
              )}

              {publications.map((pub, index) => (
                <Card key={pub._id || index}>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>{pub.title}</CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {pub.name || "Unknown"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {pub.date ? new Date(pub.date).getFullYear() : "N/A"}
                          </div>
                          <Badge variant="outline">{pub.type || "N/A"}</Badge>
                          <Badge variant="secondary">{pub.level || "N/A"}</Badge>
                          {pub.indexing && <Badge>{pub.indexing}</Badge>}
                        </div>
                      </div>

                      {pub.link && (
                        <Button size="sm" onClick={() => window.open(pub.link, "_blank")}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Prev
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ================= PAPER PRESENTATIONS ================= */}
          <TabsContent value="presentations">
            <div className="space-y-6">
              {presentations.length === 0 ? (
                <div className="text-center text-gray-500">No paper presentations added yet.</div>
              ) : (
                presentations.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                        {item.organization && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {item.organization}
                          </div>
                        )}
                        {item.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.date).getFullYear()}
                          </div>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      )}
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ResearchSection;