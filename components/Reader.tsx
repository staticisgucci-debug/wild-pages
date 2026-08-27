"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageMote from "./PageMote";

export default function Reader({ book, pages }: { book: any, pages?: string[] }) {
  const safePages = (pages && pages.length ? pages : (book?.source_text || "").split(/\n\s*\n+/).filter(Boolean).length ? (book?.source_text || "").split(/\n\s*\n+/).filter(Boolean) : [""]);
  const [pageIndex, setPageIndex] = useState(0);
  const [showFirefly, setShowFirefly] = useState(false);
  const router = useRouter();
  const timerRef = useRef<any>(null);

  // Firefly every 15-25 seconds
  useEffect(() => {
    const schedule = () => {
      const delay = 15000 + Math.random() * 10000; // 15-25s
      timerRef.current = setTimeout(() => {
        setShowFirefly(true);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, []);

  const nextPage = () => {
    if (pageIndex < safePages.length - 1) setPageIndex(i => i + 1);
  };
  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(i => i - 1);
  };

  const onFireflyCaught = () => {
    setShowFirefly(false);
    // Auto turn page when caught
    setTimeout(() => {
      nextPage();
    }, 600);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0' }}>
      {/* ALWAYS VISIBLE TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(14,31,20,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(212,197,160,0.15)' }}>
        <div className="flex gap-2">
          <Link href="/" className="rounded-full px-4 py-1.5 text-xs font-bold border" style={{ borderColor: '#e8dcc0', color: '#e8dcc0' }}>Home</Link>
          <Link href="/library" className="rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>Library</Link>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={prevPage} disabled={pageIndex===0} className="rounded-full px-3 py-1.5 text-xs border disabled:opacity-30" style={{ borderColor: '#e8dcc0' }}>← Back</button>
          <span className="text-xs" style={{ color: 'rgba(232,220,192,0.5)' }}>{pageIndex+1} / {safePages.length}</span>
          <button onClick={nextPage} disabled={pageIndex===safePages.length-1} className="rounded-full px-3 py-1.5 text-xs border disabled:opacity-30" style={{ borderColor: '#e8dcc0' }}>Next →</button>
        </div>
      </div>

      <div className="pt-20 max-w-2xl mx-auto px-6 pb-20">
        <div className="font-serif text- leading-[1.9] whitespace-pre-wrap">
          {safePages[pageIndex] ?? ""}
        </div>
      </div>

      {showFirefly && <PageMote onCatch={onFireflyCaught} />}

      {/* Click areas for page turn */}
      <button onClick={prevPage} className="fixed left-0 top-20 bottom-0 w-[20%] z-10" aria-label="Previous page" />
      <button onClick={nextPage} className="fixed right-0 top-20 bottom-0 w-[20%] z-10" aria-label="Next page" />
    </div>
  );
}
