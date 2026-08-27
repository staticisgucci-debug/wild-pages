"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import Link from "next/link";

type Book = {
  slug: string;
  title: string;
  cover_url: string | null;
  trail_name: string;
  trail_slug: string;
  level: string;
  source_text: string;
};

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  const [activeTrail, setActiveTrail] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db) return;
    Promise.all([
      db.from("books").select("*").order("created_at", { ascending: false }),
      db.from("trails").select("*").order("name"),
    ]).then(([{ data: booksData }, { data: trailsData }]) => {
      if (booksData) setBooks(booksData as Book[]);
      if (trailsData) setTrails(trailsData);
      setLoading(false);
    });
  }, []);

  const filtered = activeTrail === "all"? books : books.filter(b => b.trail_slug === activeTrail || b.trail_name === activeTrail);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e1f14' }}>
      <div className="sticky top-0 z-10 backdrop-blur border-b px-4 md:px-6 py-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(14,31,20,0.9)', borderColor: 'rgba(212,197,160,0.15)' }}>
        <div className="flex gap-4 text-sm" style={{ color: '#b8a88a' }}>
          <Link href="/" className="font-bold" style={{ color: '#e8dcc0' }}>Wild Pages</Link>
          <Link href="/study" className="hidden md:inline">The Study</Link>
        </div>
        <Link href="/study" className="rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>+ Write</Link>
      </div>

      <div className="max-w- mx-auto p-4 md:p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-3">
          <h1 className="font-serif text-2xl md:text-3xl" style={{ color: '#e8dcc0' }}>Library</h1>
          <div className="flex-1" />
          <select value={activeTrail} onChange={e => setActiveTrail(e.target.value)} className="md:hidden w-full rounded-full border px-4 py-2.5 text-sm" style={{ backgroundColor: '#162e1e', color: '#e8dcc0', borderColor: 'rgba(212,197,160,0.2)' }}>
            <option value="all">All Trails ({books.length})</option>
            {trails.map(t => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
          <div className="hidden md:flex flex-wrap gap-2">
            <button onClick={() => setActiveTrail("all")} className="rounded-full px-4 py-1.5 text-xs border" style={{ backgroundColor: activeTrail==="all"? '#e8dcc0' : 'transparent', color: activeTrail==="all"? '#0e1f14' : '#b8a88a', borderColor: activeTrail==="all"? '#e8dcc0' : 'rgba(212,197,160,0.2)' }}>All</button>
            {trails.map(t => (
              <button key={t.slug} onClick={() => setActiveTrail(t.slug)} className="rounded-full px-4 py-1.5 text-xs border" style={{ backgroundColor: activeTrail===t.slug? (t.color || '#e8dcc0') : 'transparent', color: activeTrail===t.slug? '#0e1f14' : '#b8a88a', borderColor: activeTrail===t.slug? (t.color || '#e8dcc0') : 'rgba(212,197,160,0.2)' }}>{t.name}</button>
            ))}
          </div>
        </div>

        {loading? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-2xl animate-pulse" style={{ backgroundColor: '#162e1e' }} />)}
          </div>
        ) : filtered.length === 0? (
          <div className="text-center py-24">
            <p className="font-serif text-xl mb-2" style={{ color: '#e8dcc0' }}>No books in {activeTrail}</p>
            <p className="text-sm mb-6" style={{ color: '#b8a88a' }}>Write your first book in The Study</p>
            <Link href="/study" className="rounded-full px-6 py-2 text-sm font-bold inline-block" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>Go to Study</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map(book => (
              <Link key={book.slug} href={`/read/${book.slug}`} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#e8dcc0] transition-all shadow-lg" style={{ backgroundColor: '#162e1e' }}>
                  {book.cover_url? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <span className="font-serif text-4xl mb-2" style={{ color: '#e8dcc0' }}>{book.title[0]}</span>
                      <span className="text-xs" style={{ color: '#b8a88a' }}>{book.title}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 px-1">
                  <h3 className="font-serif text-sm leading-tight line-clamp-2" style={{ color: '#e8dcc0' }}>{book.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text- rounded-full px-2 py-0.5" style={{ backgroundColor: 'rgba(212,197,160,0.15)', color: '#b8a88a' }}>{book.trail_name}</span>
                    <span className="text-" style={{ color: 'rgba(184,168,138,0.5)' }}>{book.level}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}