"use client";

import Link from "next/link";
import type { BookSummary } from "@/lib/types";
import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/settings";

export default function BookCard({ book }: { book: BookSummary }) {
  const [status, setStatus] = useState<"new" | "reading" | "finished">("new");

  useEffect(() => {
    const p = loadProgress(book.slug);
    if (!p) return;
    const finished = localStorage.getItem(`wild-pages:finished:${book.slug}`);
    if (finished) setStatus("finished");
    else setStatus("reading");
  }, [book.slug]);

  const chapterCount = book.chapterCount || 1;
  const callToAction =
    status === "reading" ? "Continue" : status === "finished" ? "Read again" : "Enter";

  return (
    <Link
      href={`/read/${book.slug}`}
      className="group relative block rounded-2xl overflow-hidden bg-[#1a2e1e] border border-[#2a4a30] hover:border-[#d4c5a0]/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(217,104,42,0.15)]"
    >
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
        style={{
          background: `radial-gradient(at 50% 0%, ${book.coverColor || "#d9682a"}40, transparent 70%)`,
        }}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <span
            className="text- tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-medium"
            style={{
              background: `${book.coverColor || "#d9682a"}20`,
              color: book.coverColor || "#d9682a",
              border: `1px solid ${book.coverColor || "#d9682a"}30`,
            }}
          >
            {book.trailName}
          </span>
          <span className="text-xs text-[#b8a88a]/50">{book.minutes} min</span>
        </div>

        <h3 className="font-serif text-xl leading-tight text-[#e8dcc0] group-hover:text-white transition-colors">
          {book.title}
        </h3>

        <p className="mt-2 text-sm text-[#b8a88a]/60 line-clamp-2">
          {book.trailBlurb || "A story from the wild."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#b8a88a]/40">
            <span>{chapterCount} chapters</span>
            <span>·</span>
            <span>{book.wordCount?.toLocaleString()} words</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#e8dcc0] text-[#1a2e1e] font-medium">
            {callToAction}
          </span>
        </div>
      </div>
    </Link>
  );
}