"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { saveBook } from "@/app/study/actions";

export default function StudyAuthorStudio() {
  const [title, setTitle] = useState("The Ember Fox of Wild Hollow");
  const [slug, setSlug] = useState("the-ember-fox-of-wild-hollow");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState("");
  const [trail, setTrail] = useState("ember");
  const [level, setLevel] = useState("seed");
  const [trails, setTrails] = useState<any[]>([]);
  const txtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db) return;
    db.from("trails").select("*").then(({ data }) => {
      if (data && data.length) {
        setTrails(data);
        setTrail(data[0].slug);
      }
    });
  }, []);

  useEffect(() => {
    if (title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title]);

  const onTxtFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#0e1f14" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 mb-6 text-sm" style={{ color: "#b8a88a" }}>
          <b style={{ color: "#e8dcc0" }}>The Study</b>
          <a href="/library">Library</a>
          <a href="/">View site</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_320px] gap-6">
          <div>
            <div
              className="rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer"
              style={{ backgroundColor: "#162e1e", borderColor: "rgba(212,197,160,0.3)", minHeight: "480px" }}
              onClick={() => document.getElementById("coverInput")?.click()}
            >
              {cover ? <img src={cover} className="w-full h-full object-cover" /> : <span style={{ color: "#e8dcc0" }}>Click to add cover image</span>}
            </div>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              hidden
              onChange={(e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev: any) => setCover(ev.target?.result);
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <div>
            <h1 className="font-serif text-3xl mb-4" style={{ color: "#e8dcc0" }}>Author Studio</h1>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 mb-3"
              style={{ backgroundColor: "#0e1f14", color: "#e8dcc0" }}
            />
            <div className="flex gap-2 mb-3">
              <div className="flex-1 rounded-xl border px-4 py-2 text-sm truncate" style={{ backgroundColor: "#0e1f14", color: "#b8a88a" }}>
                {slug} • {content.split(/\s+/).filter(Boolean).length} words
              </div>
              <button
                onClick={() => txtRef.current?.click()}
                className="rounded-full px-4 py-2 text-xs border"
                style={{ borderColor: "#d9682a", color: "#e8dcc0" }}
              >
                Upload.txt
              </button>
              <input ref={txtRef} type="file" accept=".txt" hidden onChange={onTxtFile} />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Click here then Ctrl+V"
              className="w-full rounded-xl border p-4"
              style={{ backgroundColor: "#0e1f14", color: "#e8dcc0", minHeight: "380px" }}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: "#1a2e1e", border: "1px solid rgba(212,197,160,0.15)" }}>
              <label className="text-xs uppercase tracking-widest block mb-2" style={{ color: "#b8a88a" }}>
                Trail - dropdown
              </label>
              <select
                value={trail}
                onChange={(e) => setTrail(e.target.value)}
                className="w-full rounded-lg border px-3 py-3"
                style={{ backgroundColor: "#0e1f14", color: "#e8dcc0" }}
              >
                {trails.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
                {trails.length === 0 && <option value="ember">ember</option>}
              </select>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: "#1a2e1e", border: "1px solid rgba(212,197,160,0.15)" }}>
              <label className="text-xs uppercase tracking-widest block mb-2" style={{ color: "#b8a88a" }}>
                Level - dropdown
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border px-3 py-3"
                style={{ backgroundColor: "#0e1f14", color: "#e8dcc0" }}
              >
                <option value="seed">Seed</option>
                <option value="sprout">Sprout</option>
                <option value="bloom">Bloom</option>
                <option value="canopy">Canopy</option>
              </select>
            </div>
            <button
              onClick={async () => {
                const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const uniqueSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
                const res = await saveBook({
                  title,
                  slug: uniqueSlug,
                  trail_name: trail,
                  trail_slug: trail,
                  level,
                  source_text: content,
                  cover_url: cover,
                });

                if (res.ok) {
                  alert("Saved to " + trail);
                  window.location.href = "/library";
                } else {
                  alert(res.error);
                }
              }}
              className="w-full rounded-full py-4 font-bold"
              style={{ backgroundColor: "#e8dcc0", color: "#0e1f14" }}
            >
              Publish to {trail} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
