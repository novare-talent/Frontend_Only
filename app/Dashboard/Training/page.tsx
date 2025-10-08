"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Search } from "lucide-react";

// Data for the training courses
const allCourses = [
  {
    title: "DevOps Fundamentals",
    description: "Beginner • 10 modules",
  },
  {
    title: "Git & GitHub for Beginners",
    description: "Beginner • 8 modules",
  },
  {
    title: "Docker & Containerization",
    description: "Intermediate • 15 hours",
  },
  {
    title: "CI/CD with Jenkins",
    description: "Intermediate • 20 hours",
  },
  {
    title: "Kubernetes Deep Dive",
    description: "Advanced • 45 hours",
  },
  {
    title: "Infrastructure as Code: Terraform",
    description: "Advanced • 25 hours",
  },
  {
    title: "Advanced Observability with Prometheus",
    description: "Advanced • 18 hours",
  },
  {
    title: "Python for DevOps",
    description: "Intermediate • 22 hours",
  },
];

export default function FileManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(allCourses);

  useEffect(() => {
    const results = allCourses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(results);
  }, [searchQuery]);

  return (
    <div className="w-full bg-background p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Tabs Navigation */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Enrolled</TabsTrigger>
          <TabsTrigger value="shared">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          {/* Grid of File Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <Card key={course.title} className="overflow-hidden border-border/60 shadow-none transition-shadow hover:shadow-md pt-0">
                
                <div className="flex aspect-video w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-full w-12 text-muted-foreground/20" />
                </div>
                
                <div className="px-4 ">
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="starred">
          <p className="p-10 text-center text-muted-foreground">No starred courses.</p>
        </TabsContent>
        <TabsContent value="shared">
          <p className="p-10 text-center text-muted-foreground">No shared courses.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}