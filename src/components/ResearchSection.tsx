import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import {
  BookOpen,
  Calendar,
  ExternalLink,
} from "lucide-react";

// ================= TYPES =================
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

const ResearchSection = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ================= FETCH =================
  const fetchPublications = async (page = 1) => {
    try {
      const res = await fetch(
        `https://drsrbeenajose.tech/api/research?page=${page}&limit=5`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch publications");
      }

      const data = await res.json();
      console.log("API RESPONSE:", data);

      setPublications(data.publications || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);

    } catch (err) {
      console.error("Publication fetch error:", err);
      setPublications([]);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPublications(1);
      setLoading(false);
    };

    loadData();
  }, []);

  // ================= PAGINATION =================
  const handlePageChange = async (page: number) => {
    setLoading(true);
    await fetchPublications(page);
    setLoading(false);
  };

  // ================= RENDER =================
  return (
    <section id="research" className="py-20 bg-background">
      <div className="container mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-primary">
            Research & Publications
          </h2>
        </div>

        {loading && (
          <div className="text-center text-yellow-600">
            Loading...
          </div>
        )}

        {/* ✅ DEFAULT TAB CHANGED HERE */}
        <Tabs defaultValue="interests">

          {/* ✅ ORDER CHANGED HERE */}
          <TabsList className="grid w-full grid-cols-2 mb-10">
            <TabsTrigger value="interests">
              Research Interests
            </TabsTrigger>
            <TabsTrigger value="publications">
              Publications
            </TabsTrigger>
          </TabsList>

          {/* ================= RESEARCH INTERESTS ================= */}
          <TabsContent value="interests">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">

              <Card className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <h3 className="text-lg font-semibold">
                      Natural Products Chemistry
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Study of bioactive compounds derived from natural sources.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧪</span>
                    <h3 className="text-lg font-semibold">
                      Phytochemistry
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analysis of chemical compounds produced by plants.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚛️</span>
                    <h3 className="text-lg font-semibold">
                      Nano Chemistry
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Research on materials and reactions at nanoscale level.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <h3 className="text-lg font-semibold">
                      Green Synthesis
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Eco-friendly and sustainable chemical synthesis methods.
                  </p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ================= PUBLICATIONS ================= */}
          <TabsContent value="publications">
            <div className="space-y-6">

              {!loading && publications.length === 0 && (
                <div className="text-center text-gray-500">
                  No publications available.
                </div>
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
                            {pub.date
                              ? new Date(pub.date).getFullYear()
                              : "N/A"}
                          </div>

                          <Badge variant="outline">
                            {pub.type || "N/A"}
                          </Badge>

                          <Badge variant="secondary">
                            {pub.level || "N/A"}
                          </Badge>

                          {pub.indexing && (
                            <Badge>{pub.indexing}</Badge>
                          )}
                        </div>
                      </div>

                      {pub.link && (
                        <Button
                          size="sm"
                          onClick={() =>
                            window.open(pub.link, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">

                  <Button
                    disabled={currentPage === 1}
                    onClick={() =>
                      handlePageChange(currentPage - 1)
                    }
                  >
                    Prev
                  </Button>

                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={
                        currentPage === i + 1
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handlePageChange(i + 1)
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      handlePageChange(currentPage + 1)
                    }
                  >
                    Next
                  </Button>

                </div>
              )}

            </div>
          </TabsContent>

        </Tabs>

      </div>
    </section>
  );
};

export default ResearchSection;