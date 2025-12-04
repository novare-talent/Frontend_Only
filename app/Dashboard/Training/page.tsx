"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText, DownloadCloud } from "lucide-react";

// heroui components (Card style provided earlier)
import { Card, CardFooter, Image, Button } from "@heroui/react";

// shadcn Select (styled dropdown)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { motion, AnimatePresence } from "framer-motion"

const allCourses = [
  {
    id: "AI_ML_Engineer",
    title: "AI ML Engineer",
    description: "Intro to AI and Machine Learning",
    level: "Beginner",
    pdfUrl: "\Training\AI_ML_ENGINEER.pdf",
    imageUrl: "https://heroui.com/images/hero-card.jpeg",
  },
  {
    id: "Chief_of_Staff_Resources",
    title: "Chief of Staff Resources",
    description: "Comprehensive guide for Chiefs of Staff",
    level: "Beginner",
    pdfUrl: "\Training\Chief_of_Staff_Resources.pdf",
    imageUrl: "https://heroui.com/images/hero-card.jpeg",
  },
  {
    id: "Cloud_Engineer",
    title: "Cloud Engineer",
    description: "AWS, Azure, GCP fundamentals",
    level: "Intermediate",
    pdfUrl: "\Training\Cloud_Engineer.pdf",
    imageUrl: "https://heroui.com/images/hero-card.jpeg",
  },
  {
    id: "t-jenkins",
    title: "CI/CD with Jenkins",
    description: "Automating builds & pipelines",
    level: "Intermediate",
    pdfUrl: "",
    imageUrl: "https://heroui.com/images/hero-card.jpeg",
  },
  {
    id: "t-k8s",
    title: "Kubernetes Deep Dive",
    description: "Clusters, services, controllers",
    level: "Advanced",
    pdfUrl: "",
    imageUrl: "https://heroui.com/images/hero-card.jpeg",
  },
];

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, when: "beforeChildren" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, scale: 0.995, transition: { duration: 0.25 } },
};

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("none"); // "none", "title", "level"

  // computed filtered + sorted courses (keeps original allCourses unchanged)
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // filter
    let res = allCourses.filter((c) => {
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.level || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    });

    // sort
    if (sortBy === "title") {
      res = res.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "level") {
      const order: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
      res = res
        .slice()
        .sort(
          (a, b) =>
            (order[(a.level || "").toLowerCase()] || 99) -
            (order[(b.level || "").toLowerCase()] || 99)
        );
    }

    return res;
  }, [searchQuery, sortBy]);

  const badgeFor = (level: string) => {
    switch ((level || "").toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800";
      case "intermediate":
        return "bg-amber-100 text-amber-800";
      case "advanced":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full bg-background p-4 sm:p-6 lg:p-8">
      {/* Header: Search + Sort (inline on sm+) */}
      <header className="mb-6 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex w-full items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80 max-w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort (shadcn Select) */}
          <div className="hidden sm:block">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
              <SelectTrigger
                aria-label="Sort by"
                className="rounded-full bg-card/80 border px-3 py-1 h-10 text-sm shadow-sm min-w-[140px]"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 border rounded-md shadow-md">
                {/* placeholder must NOT have an empty string value */}
                <SelectItem value="none">Sort by</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="level">Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* On small screens show Sort below as full width */}
        <div className="sm:hidden w-full">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
            <SelectTrigger
              aria-label="Sort by"
              className="w-full rounded-lg bg-card/80 border px-3 py-2 h-10 text-sm shadow-sm"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 border rounded-md shadow-md">
              {/* also ensure non-empty value here */}
              <SelectItem value="none">Sort by</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="level">Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Course Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <AnimatePresence>
          {filteredCourses.length === 0 ? (
            <motion.p
              layout
              key="no-courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-muted-foreground p-8"
            >
              No courses found.
            </motion.p>
          ) : (
            filteredCourses.map((course) => (
              <motion.div
                layout
                key={course.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ scale: 1.02, y: -6, transition: { duration: 0.22 } }}
                className="will-change-transform"
              >
                <Card
                  isFooterBlurred
                  className="relative overflow-hidden rounded-2xl border bg-card/80 shadow-sm"
                  radius="lg"
                >
                  {/* Image */}
                  <div className="h-40 w-full overflow-hidden rounded-t-2xl">
                    <Image
                      alt={course.title}
                      className="object-cover w-full h-full"
                      height={160}
                      width={400}
                      src={course.imageUrl || "https://heroui.com/images/hero-card.jpeg"}
                    />
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                      </div>

                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badgeFor(
                          course.level
                        )}`}
                      >
                        {course.level}
                      </span>
                    </div>

                    {/* file icon + open link */}
                    <div className="mt-4 flex items-center gap-3 pb-0.5">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      {course.pdfUrl ? (
                        <a
                          href={course.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Open PDF
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">PDF not uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-b-s bottom-2 w-[calc(100%_-_16px)] shadow-small left-2 z-10">
                    <div className="flex items-center gap-2">
                      <Button
                        className="text-tiny bg-black/10"
                        color="default"
                        radius="lg"
                        size="sm"
                        variant="flat"
                        disabled={!course.pdfUrl}
                      >
                        {course.pdfUrl ? (
                          <a
                            href={course.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2"
                          >
                            <DownloadCloud className="h-4 w-4" />
                            <span className="text-sm">Download</span>
                          </a>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 opacity-80"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2v6" />
                              <path d="M5 12h14" />
                              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                            </svg>
                            <span className="text-sm">Notify me</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
