"use client";
import { useState, useEffect } from "react";
import { saveBook } from "@/app/study/actions";
import { supabaseBrowser } from "@/lib/supabase";

export default function BookEditor({ book, isNew }: { book: any, isNew: boolean }) {
  const [title, setTitle] = useState(book?.title || "");
  const [slug, setSlug] = useState(book?.slug || "");
  const [content, setContent] = useState(book?.source_text || "");
  const [cover, setCover] = useState(book?.cover_url || "");
  const [trail, setTrail] = useState(book?.trail_name || book?.trail_slug || "ember");
  const [trails, setTrails] = useState<any[]>([]);
  const [newTrailName, setNewTrailName] = useState("");
  const [showNewTrail, setShowNewTrail] = useState(false);

  const loadTrails = async () => {
    const db = supabaseBrowser();
    if (!db) return;
    const { data } = await db.from('trails').select('*').order('name');
    if (data) setTrails(data);
  };

  useEffect(() => { loadTrails(); }, []);

  const createTrail = async () => {
    if (!newTrailName.trim()) return;
    const db = supabaseBrowser();
    const newSlug = newTrailName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await db!.from('trails').insert({ slug: newSlug, name: newTrailName, color: '#d9682a' }).select().single();
    if (error) { alert("Trail error: " + error.message); return; }
    await loadTrails();
    setTrail(newSlug);
    setNewTrailName("");
    setShowNewTrail(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl">
      <div>
        <div className="rounded-2xl border-2 border-dashed h- flex items-center justify-center overflow-hidden" style={{ borderColor: 'rgba(212,197,160,0.3)', backgroundColor: '#162e1e' }}>
          {cover? <img src={cover} className="w-full h-full object-cover" /> : <span style={{ color: '#e8dcc0' }}>Cover</span>}
        </div>
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onload = (ev) => setCover(ev.target?.result as string); r.readAsDataURL(f);
        }} className="mt-2 text-xs" style={{ color: '#e8dcc0' }} />
      </div>

      <div className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border px-4 py-3" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0' }} />
        <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="slug" className="w-full rounded-xl border px-4 py-2 text-sm" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0' }} />

        {/* TRAIL BUILDER BUILT INTO BOOK PAGE */}
        <div className="rounded-xl p-3" style={{ backgroundColor: '#162e1e', border: '1px solid rgba(212,197,160,0.2)' }}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8dcc0' }}>Trail / World</label>
            <button onClick={()=>setShowNewTrail(!showNewTrail)} className="text- rounded-full px-2 py-1 border" style={{ borderColor: '#e8dcc0', color: '#e8dcc0' }}>+ New Trail</button>
          </div>
          
          <select value={trail} onChange={e=>setTrail(e.target.value)} className="w-full rounded-lg border px-3 py-2 mb-2" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0' }}>
            {trails.map(t => <option key={t.slug} value={t.slug}>{t.name} ({t.slug})</option>)}
          </select>

          {showNewTrail && (
            <div className="flex gap-2 mt-2">
              <input value={newTrailName} onChange={e=>setNewTrailName(e.target.value)} placeholder="New trail name: e.g. Ember Hollow" className="flex-1 rounded-lg border px-3 py-1.5 text-sm" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0' }} />
              <button onClick={createTrail} className="rounded-lg px-3 py-1.5 text-sm font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>Create</button>
            </div>
          )}
          <p className="text- mt-2" style={{ color: 'rgba(184,168,138,0.5)' }}>This is where the book lives in library. Create new worlds on the fly.</p>
        </div>

        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Paste -s book here..." className="w-full rounded-xl border p-4" style={{ backgroundColor: '#0e1f14', color: '#e8dcc0', minHeight: '320px' }} />

        <button onClick={async () => {
          const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g,"-");
          const res = await saveBook({ title, slug: finalSlug, trail_name: trail, trail_slug: trail, level: 'seed', source_text: content, cover_url: cover });
          alert(res.ok ? `Saved to ${trail}!` : `Failed: ${res.error}`);
          if (res.ok) window.location.href = "/library";
        }} className="w-full rounded-full py-3 font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>
          Publish to {trail} →
        </button>
      </div>
    </div>
  );
}