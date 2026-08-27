"use client";
import { useState, useTransition } from "react";
import { saveBook } from "@/app/study/actions";
import type { Level, Trail } from "@/lib/taxonomy";

export default function BookForm({ trails, levels, existing }: any) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<{error?:string; ok?:string}>({});
  const [title, setTitle] = useState(existing?.title?? "TLS");
  const [trail, setTrail] = useState(existing?.trail?? "forest-trail");
  const [level, setLevel] = useState(existing?.level?? "sprout");
  const [sourceText, setSourceText] = useState(existing?.source_text?? "");
  const [coverColor, setCoverColor] = useState(existing?.cover_color?? "#d9682a");
  const [sortOrder, setSortOrder] = useState(existing?.sort_order?? 5);

  async function handleSubmit(formData: FormData) {
    formData.set("source_text", sourceText);
    formData.set("title", title);
    formData.set("trail", trail);
    formData.set("level", level);
    formData.set("cover_color", coverColor);
    formData.set("sort_order", String(sortOrder));
    startTransition(async () => {
      const res: any = await saveBook(formData);
      setState(res);
      if (res.slug) window.location.href = `/study/book/${res.slug}`;
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-[#1a3320] border border-[#2a4d32] p-6 space-y-4">
        <input name="title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required className="w-full rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white" />
        <div className="grid grid-cols-2 gap-4">
          <select value={trail} onChange={e=>setTrail(e.target.value)} required className="rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white">
            {trails.map((t:Trail)=><option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
          <select value={level} onChange={e=>setLevel(e.target.value)} required className="rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white">
            {levels.map((l:Level)=><option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
        </div>
        <textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} required className="w-full min-h- rounded-xl bg-[#0e1f14] border-2 border-[#3f8f4f] p-4 text-white text-" />
        <div className="grid grid-cols-2 gap-4">
          <input name="cover" type="file" accept="image/*" className="w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-[#3f8f4f] file:px-4 file:py-2 file:text-white" />
        </div>
        <input value={sortOrder} onChange={e=>setSortOrder(e.target.value)} className="w-full rounded-xl bg-[#0e1f14] border border-[#2a4d32] p-3 text-white" />
        {state.error && <p className="rounded-xl bg-red-900/30 border border-red-800 p-3 text-red-200">{state.error}</p>}
        {state.ok && <p className="rounded-xl bg-green-900/30 border border-green-800 p-3 text-green-200">{state.ok}</p>}
        <button disabled={pending} className="w-full rounded-full bg-[#3f8f4f] py-3 font-bold text-white">{pending? "Saving..." : "Create Book"}</button>
      </div>
    </form>
  );
}