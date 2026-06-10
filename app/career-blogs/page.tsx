"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, FileText, DownloadCloud, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { allBlogs, type BlogPost } from "./blogData";

const levelColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-rose-100 text-rose-800 border-rose-200",
};

const levelFilters = ["All", "Beginner", "Intermediate", "Advanced"] as const;

function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-5 sm:px-8 bg-neutral-950/95 backdrop-blur-sm border-b border-white/10">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image src="/images/logo.svg" alt="Novare Talent" width={130} height={24} />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="https://arena.novaretalent.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-violet-500 text-violet-300 text-xs font-semibold px-3 sm:px-4 py-1.5 hover:bg-violet-500/20 transition-colors whitespace-nowrap"
        >
          Try ArenaX <sup className="text-[9px] leading-none">beta</sup>
        </a>
        <a
          href="/sign-in"
          className="inline-flex items-center rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 sm:px-4 py-1.5 transition-colors whitespace-nowrap"
        >
          Start your Journey
        </a>
      </div>
    </header>
  );
}

export default function CareerNavigatorBlogsPage() {
  const [selectedId, setSelectedId] = useState<string>(allBlogs[0].id);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const mainRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBlogs.filter((b) => {
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.level.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q);
      const matchesLevel = levelFilter === "All" || b.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [search, levelFilter]);

  const selected = allBlogs.find((b) => b.id === selectedId) ?? allBlogs[0];

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <BlogHeader />

      {/* Spacer to push content below fixed header */}
      <div className="h-14 shrink-0" />

      {/* Mobile topic pills */}
      <div className="md:hidden border-b bg-card/50 px-4 py-3 overflow-x-auto flex gap-2 shrink-0">
        {filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedId(b.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              b.id === selectedId
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-card text-muted-foreground border-border hover:border-violet-400"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      {/* Two-panel layout fills remaining viewport */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 border-r bg-card/40 overflow-hidden">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              <h1 className="font-serif font-semibold text-base text-foreground leading-tight">
                Career Blogs
              </h1>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blogs…"
                className="pl-9 h-9 text-sm bg-background/70"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {levelFilters.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevelFilter(lv)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors ${
                    levelFilter === lv
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-background text-muted-foreground border-border hover:border-violet-400"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No blogs found.</p>
            ) : (
              filtered.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors group ${
                    b.id === selectedId
                      ? "bg-violet-50 dark:bg-violet-950/30 border-l-2 border-violet-500"
                      : "hover:bg-muted/50 border-l-2 border-transparent"
                  }`}
                >
                  <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-muted mt-0.5 relative">
                    <Image
                      src={b.imageUrl}
                      alt={b.title}
                      fill
                      sizes="40px"
                      className="object-contain"
                      loading="eager"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug line-clamp-2 ${
                        b.id === selectedId ? "text-violet-700 dark:text-violet-300" : "text-foreground"
                      }`}
                    >
                      {b.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border ${levelColors[b.level]}`}
                      >
                        {b.level}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{b.readTime}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-3.5 w-3.5 mt-1 shrink-0 transition-opacity ${
                      b.id === selectedId ? "text-violet-500 opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Main blog content ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <BlogContent blog={selected} />
        </main>
      </div>
    </div>
  );
}

function BlogContent({ blog }: { blog: BlogPost }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-10 pb-20">
      {/* Cover image */}
      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 bg-muted shadow-md">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 768px"
          className="object-contain"
          priority
        />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${levelColors[blog.level]}`}>
          {blog.level}
        </span>
        <span className="text-xs text-muted-foreground">{blog.readTime}</span>
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
        {blog.title}
      </h1>

      {/* Summary / intro */}
      <p className="font-serif italic text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-violet-400 pl-4">
        {blog.summary}
      </p>

      {/* What you'll learn */}
      <div className="rounded-xl border bg-violet-50/60 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-800/40 p-5 mb-10">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-3">What You&apos;ll Learn</h2>
        <ul className="space-y-2">
          {blog.whatYouLearn.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-violet-500 text-white flex items-center justify-center text-[9px] font-bold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {blog.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{section.heading}</h2>
            <div className="space-y-4">
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-base leading-8 text-foreground/80">{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Key tools */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Key Tools &amp; Skills</h2>
        <div className="flex flex-wrap gap-2">
          {blog.keyTools.map((tool) => (
            <span key={tool} className="rounded-full bg-muted border border-border px-3 py-1 text-xs font-medium text-foreground/70">
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* PDF Resources */}
      <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-1">PDF Resource</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Download or view the full structured guide for {blog.title}.
        </p>

        {blog.pdfUrl ? (
          <>
            <div className="w-full h-[560px] rounded-xl overflow-hidden border bg-muted mb-5">
              <iframe src={blog.pdfUrl} title={`${blog.title} PDF`} className="w-full h-full" style={{ border: "none" }} />
            </div>
            <div className="flex gap-3 flex-wrap">
              <a
                href={blog.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Open PDF
              </a>
              <a
                href={blog.pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border hover:border-violet-400 bg-background text-foreground text-sm font-medium px-5 py-2.5 transition-colors"
              >
                <DownloadCloud className="h-4 w-4" />
                Download
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">PDF coming soon for this resource.</p>
          </div>
        )}
      </div>
    </article>
  );
}
