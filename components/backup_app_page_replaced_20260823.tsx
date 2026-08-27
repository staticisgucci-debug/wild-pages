"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabaseBrowser, supabaseReady } from "@/lib/supabase";

// Dynamically load decorative components without SSR in case they are server-only
const Motes = dynamic(() => import("@/components/Motes"), { ssr: false });
const ForestHorizon = dynamic(() => import("@/components/ForestHorizon"), { ssr: false });

type Trail = "all" | "ember" | "jungle" | "frost" | "shadow" | "star" | "codex";
type Level = "all" | "seed" | "sprout" | "sapling" | "canopy" | "shadow_star";

const TRAILS = [
  { id: "all" as Trail, label: "All" },
  { id: "ember" as Trail, label: "Ember" },
  { id: "jungle" as Trail, label: "Jungle" },
  { id: "frost" as Trail, label: "Frost" },
  { id: "shadow" as Trail, label: "Shadow" },
  { id: "star" as Trail, label: "Star" },
  { id: "codex" as Trail, label: "Codex" },
];

const LEVELS: { id: Level; label: string; age?: string }[] = [
  { id: "all", label: "All" },
  { id: "seed", label: "Seed", age: "3-5" },
  { id: "sprout", label: "Sprout 🌱", age: "3-6" },
  { id: "sapling", label: "Sapling 🌿", age: "7-9" },
  { id: "canopy", label: "Canopy 🌳", age: "10-12" },
  { id: "shadow_star", label: "Shadow/Star", age: "12-15" },
];

function BookCard({ book }: { book: any }) {
  return (
    <Link href={`/read/${book.slug}`} className="group block rounded-xl border border-white/10 bg-white/5 p-4 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="w-20 h-28 flex-shrink-0 rounded-md bg-[#111] overflow-hidden">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs opacity-60">No cover</div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase opacity-70">{book.trail}</div>
          <h3 className="mt-1 text-lg font-bold">{book.title}</h3>
          <p className="mt-2 text-sm opacity-60">{book.level}</p>
          <div className="mt-3 flex items-center justify-between text-sm opacity-70">
            <div>{book.word_count || 0} words</div>
            <div className={`px-2 py-1 rounded text-xs ${book.status === 'published' ? 'bg-green-500/20' : 'bg-yellow-500/10'}`}>{book.status}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [selectedTrail, setSelectedTrail] = useState<Trail>("all");
  const [selectedLevel, setSelectedLevel] = useState<Level>("all");
  const [perfMode, setPerfMode] = useState<"LITE" | "EPIC">("EPIC");
  const [books, setBooks] = useState<any[] | null>(null);
  const [packMembers, setPackMembers] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = supabaseBrowser();
      if (!supabase) {
        console.warn("Supabase not ready in browser. Set NEXT_PUBLIC_SUPABASE_* env vars to enable live data.");
        setBooks([]);
        return;
      }

      // fetch books
      const { data: booksData, error: booksError } = await supabase.from('books').select('*');
      if (booksError) {
        console.error('Error fetching books', booksError);
        setBooks([]);
      } else if (mounted) setBooks(booksData || []);

      // fetch pack members if pack_id in localStorage
      try {
        const packId = window.localStorage.getItem('pack_id');
        if (packId) {
          const { data: pmData, error: pmError } = await supabase.from('pack_members').select('*').eq('pack_id', packId);
          if (pmError) console.error('Error fetching pack members', pmError);
          else if (mounted) setPackMembers(pmData || []);
        }
      } catch (e) {
        console.warn('localStorage not accessible', e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (perfMode !== 'EPIC' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: any[] = [];
    const count = Math.min(40, 40);
    for (let i = 0; i < count; i++) {
      particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 3 + 1, alpha: Math.random() * 0.6 + 0.2 });
    }

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [perfMode]);

  const filteredBooks = (books || []).filter((b: any) => (selectedTrail === 'all' || b.trail === selectedTrail) && (selectedLevel === 'all' || b.level === selectedLevel));

  return (
    <main className={`min-h-screen text-stone-100 relative overflow-hidden ${selectedTrail === 'ember' ? 'bg-ember' : selectedTrail === 'jungle' ? 'bg-jungle' : 'bg-[#0a1f0a]'} `}>
      {perfMode === 'EPIC' && <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />}

      <header className="sticky top-0 z-50 bg-[#0a1f0a] border-b border-white/10">
        <div className="max-w- mx-auto px-4 md:px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">🌲</div>
            <div className="font-black tracking-tight">WILD PAGES</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPerfMode(perfMode === 'EPIC' ? 'LITE' : 'EPIC')} className="text- px-3 py-1 rounded-full border border-white/20"> {perfMode} </button>
            <button onClick={() => alert('Fuel the Forest')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold"> Fuel the Forest <span className="text-orange-300">🔥 87%</span> </button>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">🐺</div>
          </div>
        </div>
      </header>

      <div className="max-w- mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-6 relative z-10">
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded- bg-black/30 backdrop-blur border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🐺</div>
              <div><div className="font-bold">Nuns Pack</div><div className="text-xs opacity-60">Pack Forest: {packMembers.length} members</div></div>
            </div>
            <div className="space-y-2">
              {packMembers.map((m) => (
                <button key={m.id} onClick={() => {}} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-white/5 border-white/5`}>
                  <div className="flex items-center gap-2"><span className="text-lg">{m.avatar || '🙂'}</span><span className="text-sm font-medium">{m.display_name}</span></div>
                  <div className="text-xs opacity-70">{m.level || ''}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9">
          <h1 className="text- md:text- font-black tracking-tight">Welcome back! Who's reading?</h1>

          <div className="mt-6 mb-4 flex gap-2 overflow-x-auto scrollbar-none">
            {TRAILS.map((t) => (
              <button key={t.id} onClick={() => setSelectedTrail(t.id)} className={`shrink-0 px-3 py-1.5 rounded-full border text-xs ${selectedTrail === t.id ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/5'}`}>{t.label}</button>
            ))}
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto scrollbar-none">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => setSelectedLevel(l.id as any)} className={`shrink-0 px-3 py-1.5 rounded-full border text-xs ${selectedLevel === l.id ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/5'}`}>{l.label}{l.age ? ` · ${l.age}` : ''}</button>
            ))}
          </div>

          {/* INJECT BOOKS HERE - map your Supabase books */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {books === null ? (
              <div className="col-span-12 text-center py-8">Loading…</div>
            ) : filteredBooks.length === 0 ? (
              <div className="rounded- border border-dashed border-white/15 bg-black/20 backdrop-blur p-16 text-center col-span-12">
                <div className="mb-3 opacity-70 mb-3">🌱</div>
                <h3 className="font-bold">No books in this Trail yet</h3>
                <p className="text-sm opacity-60">Forest is growing... Add books in Study</p>
              </div>
            ) : (
              filteredBooks.map((b: any) => (
                <div key={b.id}><BookCard book={b} /></div>
              ))
            )}
          </div>
        </main>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 w-full">
        <ForestHorizon />
      </div>

      <Link href="/study" className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-[#ebd7a0]/20 bg-[#122218]/80 px-3 py-2 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[#f7e7c4] shadow-[0_18px_42px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#ebd7a0]/35 hover:bg-[#183022]">
        Author
      </Link>
    </main>
  );
}
