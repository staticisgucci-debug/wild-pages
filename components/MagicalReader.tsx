"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GnomeDance from "./GnomeDance";

type Page =
  | { type: "cover" }
  | { type: "content"; paras: string[]; chapterTitle?: string; chapterNum?: number }
  | { type: "gnome" };

const PAPER = {
  day: { bg: "#fdf8ec", tint: "rgba(210,150,90,0.18)", text: "#2b2216", muted: "rgba(43,34,22,0.45)" },
  night: { bg: "#1e1810", tint: "rgba(80,50,20,0.25)", text: "#e8d4b0", muted: "rgba(232,212,176,0.45)" },
};

export default function MagicalReader({ book }: { book: any }) {
  const raw = (book.source_text || book.content || "").replace(/\r/g, "");
  let titleOverride = "";
  const pages: Page[] = [{ type: "cover" }];
  let buffer: string[] = [];
  let pendingChapter: { title: string; num: number } | undefined = undefined;
  let chapterCounter = 0;

  const flush = () => {
    if (buffer.length === 0 &&!pendingChapter) return;
    let cur: string[] = [];
    let wc = 0;
    let first = true;
    buffer.forEach((para) => {
      const words = para.split(/\s+/).length;
      if (wc + words > 100 && cur.length > 0) {
        pages.push({ type: "content", paras: cur, chapterTitle: first? pendingChapter?.title : undefined, chapterNum: first? pendingChapter?.num : undefined });
        first = false;
        pendingChapter = undefined;
        cur = [para];
        wc = words;
      } else {
        cur.push(para);
        wc += words;
      }
    });
    if (cur.length > 0 || pendingChapter) {
      pages.push({ type: "content", paras: cur, chapterTitle: first? pendingChapter?.title : undefined, chapterNum: first? pendingChapter?.num : undefined });
    }
    buffer = [];
    pendingChapter = undefined;
  };

  raw.split("\n").forEach((line: string) => {
    const t = line.trim();
    if (!t) return;
    if (t.startsWith("# ") &&!t.startsWith("## ")) {
      titleOverride = t.slice(2).trim();
      return;
    }
    if (t.startsWith("## ")) {
      flush();
      chapterCounter++;
      pendingChapter = { title: t.slice(3).trim(), num: chapterCounter };
      return;
    }
    buffer.push(t);
  });
  flush();
  // ADD GNOME AS OWN LAST PAGE
  pages.push({ type: "gnome" });

  const displayTitle = titleOverride || book.title;
  const [pageIndex, setPageIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDir, setTurnDir] = useState<"next" | "prev">("next");
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [jarCount, setJarCount] = useState(0);
  const [showFly, setShowFly] = useState(false);
  const [campfire, setCampfire] = useState(false);
  const timerRef = useRef<any>(null);
  const startX = useRef<number | null>(null);

  const current = pages[pageIndex];
  const theme = campfire? PAPER.night : PAPER.day;
  const isCover = current.type === "cover";
  const isGnome = current.type === "gnome";
  const isLastContent = pageIndex === pages.length - 2;

  useEffect(() => {
    const saved = localStorage.getItem(`wildpages-progress-${book.slug}`);
    if (saved) {
      try {
        const { pi, col } = JSON.parse(saved);
        if (pi >= 0 && pi < pages.length) setPageIndex(pi);
        if (Array.isArray(col)) { setCollected(new Set(col)); setJarCount(col.length); }
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(`wildpages-progress-${book.slug}`, JSON.stringify({ pi: pageIndex, col: Array.from(collected) }));
  }, [pageIndex, collected]);

  useEffect(() => {
    setShowFly(false);
    if (isCover || isGnome) return;
    if (collected.has(pageIndex)) return;
    timerRef.current = setTimeout(() => setShowFly(true), 15000 + Math.random() * 10000);
    return () => clearTimeout(timerRef.current);
  }, [pageIndex, collected, isCover, isGnome]);

  const buzz = (p: any) => { try { if ("vibrate" in navigator) navigator.vibrate(p); } catch {} };
  const turn = (dir: "next" | "prev") => {
    if (isTurning) return;
    if (dir === "next" && pageIndex >= pages.length - 1) return;
    if (dir === "prev" && pageIndex <= 0) return;
    buzz(20);
    setTurnDir(dir);
    setIsTurning(true);
    setTimeout(() => { setPageIndex((p) => (dir === "next"? p + 1 : p - 1)); setIsTurning(false); buzz(10); }, 300);
  };
  const catchFly = () => { buzz([30, 50, 30]); setCollected((s) => new Set(s).add(pageIndex)); setShowFly(false); setJarCount((c) => c + 1); };
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 60) turn(dx < 0? "next" : "prev");
    startX.current = null;
  };

  return (
    <div className={`relative min-h- w-full flex flex-col items-center ${campfire? "bg-[#0f0b07]" : "bg-[#0d1b14]"}`}>
      <div className="sticky top-0 z-20 w-full max-w-4xl flex items-center justify-between px-3 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link href="/" className="w-11 h-11 rounded-full bg-[#1a2e1e] border border-[#d4c5a0]/20 flex items-center justify-center text-[#e8dcc0]">⌂</Link>
          <div className="rounded-full bg-[#1a2e1e] border border-[#d4c5a0]/20 px-3 py-2 max-w- truncate"><span className="font-serif text-[#e8dcc0] text-xs">{displayTitle}</span></div>
          <div className="text- font-mono text-[#b8a88a]/50">{pageIndex + 1}/{pages.length}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w- h- rounded- bg-[#0f1e14]/80 border border-[#d4c5a0]/20 flex items-center justify-center"><span>🫙</span><div className="absolute -bottom-1 -right-1 bg-[#e8dcc0] text-[#0e1f14] text- font-bold w-5 h-5 rounded-full flex items-center justify-center">{jarCount}</div></div>
          <button onClick={() => { buzz(20); setCampfire(!campfire); }} className={`w-11 h-11 rounded-full border flex items-center justify-center ${campfire? "bg-[#ff8a2a] border-[#ff8a2a] shadow-[0_0_20px_rgba(255,138,42,0.7)]" : "bg-[#1a2e1e] border-[#d4c5a0]/20"}`}>🔥</button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w- mt-2 px-3" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative mx-auto">
          <div className={`relative rounded- border overflow-hidden transition-colors duration-500 ${isTurning? (turnDir === "next"? "animate-[pageTurnOut_0.3s_ease-in]" : "animate-[pageTurnIn_0.3s_ease-in]") : ""}`} style={{ backgroundColor: isCover? "#000" : theme.bg, borderColor: campfire? "rgba(120,80,40,0.35)" : "rgba(214,201,168,0.6)" }}>
            {isCover? (
              <div className="relative min-h- flex flex-col items-center justify-center p-0 overflow-hidden">
                {book.cover_url? <img src={book.cover_url} alt={displayTitle} className="w-full h-full object-cover min-h-" /> : <div className="p-12 text-center"><h1 className="font-serif text-4xl text-[#e8dcc0]">{displayTitle}</h1></div>}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
                  <h1 className="font-serif text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{displayTitle}</h1>
                  <p className="text-white/60 text-xs mt-1">Tap to open →</p>
                </div>
              </div>
            ) : isGnome? (
              <GnomeDance jarCount={jarCount} campfire={campfire} />
            ) : (
              <>
                <div className="relative min-h- p-7 md:p-12">
                  {current.type === "content" && current.chapterTitle && (
                    <div className="mb-8">
                      <div className="text- tracking-[0.3em] uppercase mb-2" style={{ color: theme.muted }}>Chapter {current.chapterNum}</div>
                      <h2 className="font-serif text- md:text- leading-tight" style={{ color: theme.text, textShadow: campfire? "0 0 10px rgba(255,160,80,0.3)" : "none" }}>{current.chapterTitle}</h2>
                      <div className="mt-5 w-10 h-" style={{ backgroundColor: theme.muted }} />
                    </div>
                  )}
                  <div className="font-serif text- leading-[1.85]" style={{ color: theme.text, textShadow: campfire? "0 0 8px rgba(255,180,100,0.18)" : "none" }}>
                    {current.type === "content" && current.paras.map((para, i) => <p key={i} className="mb-6">{para}</p>)}
                  </div>
                  {showFly && <button onClick={catchFly} className="absolute right-[18%] top-[35%] w-20 h-20 z-20"><span className="text- drop-shadow-[0_0_12px_rgba(255,240,120,0.9)]">✦</span></button>}
                </div>
                <div className="flex items-center justify-between border-t px-6 py-3" style={{ borderColor: campfire? "rgba(232,212,176,0.12)" : "rgba(43,34,22,0.1)" }}>
                  <span className="text- tracking-[0.22em] uppercase" style={{ color: theme.muted }}>{book.trail_name || "Wild Pages"} • {campfire? "Campfire Mode" : "Daylight"}</span>
                  <span className="text- font-mono" style={{ color: theme.muted }}>{collected.has(pageIndex)? "✦ caught" : ""}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => turn("prev")} disabled={pageIndex === 0} className="rounded-full border border-[#d4c5a0]/20 bg-[#1a2e1e]/80 px-5 py-3 text-sm text-[#e8dcc0] disabled:opacity-30">← Back</button>
            <div className="flex gap-1.5">{pages.map((_, i) => <div key={i} className={`h-1.5 rounded-full ${i === pageIndex? "w-6 bg-[#e8dcc0]" : i === 0? "w-1.5 bg-[#e8dcc0]/60" : i === pages.length - 1? "w-1.5 bg-[#8a6a3a]" : "w-1.5 bg-white/20"}`} />)}</div>
            {isGnome? <Link href="/" className="rounded-full bg-[#e8dcc0] px-6 py-3 text-sm font-bold text-[#0e1f14]">Home ⌂</Link> : <button onClick={() => turn("next")} className="rounded-full bg-[#e8dcc0] px-5 py-3 text-sm font-semibold text-[#0e1f14]">Next →</button>}
          </div>

          {isGnome && (
            <div className="mt-6 text-center pb-16">
              <Link href="/" className="inline-flex rounded-full bg-[#1a2e1e] border border-[#d4c5a0]/20 px-8 py-3 text-[#e8dcc0]">Back to Library</Link>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pageTurnOut{0%{transform:rotateY(0);transform-origin:left}100%{transform:rotateY(-14deg);transform-origin:left;opacity:0.9}} @keyframes pageTurnIn{0%{transform:rotateY(14deg);transform-origin:right}100%{transform:rotateY(0);transform-origin:right}}`}</style>
    </div>
  );
}