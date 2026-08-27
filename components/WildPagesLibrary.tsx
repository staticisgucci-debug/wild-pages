"use client";
import { useState, useEffect, useRef } from "react";
import { Flame, Leaf, Snowflake, Moon, Star, BookOpen, Zap, Trees } from "lucide-react";

type Trail = "all" | "ember" | "jungle" | "frost" | "shadow" | "star" | "codex";
type Level = "all" | "seed" | "sprout" | "sapling" | "canopy" | "shadow_star";

export default function WildPagesLibrary() {
  const [selectedTrail, setSelectedTrail] = useState<Trail>("all");
  const [selectedLevel, setSelectedLevel] = useState<Level>("all");
  const [perfMode, setPerfMode] = useState<"LITE" | "EPIC">("EPIC");
  const [activeMember, setActiveMember] = useState("leo");
  const [showFuel, setShowFuel] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const packMembers = [
    { id: "leo", name: "Leo", avatar: "🐺", trees: 5 },
    { id: "milo", name: "Milo", avatar: "🦊", trees: 3 },
    { id: "mom", name: "Mom", avatar: "🦁", trees: 2 },
    { id: "dad", name: "Dad", avatar: "🐻", trees: 4 },
  ];

  const TRAILS = [
    { id: "all", label: "All", icon: Trees },
    { id: "ember", label: "Ember", icon: Flame },
    { id: "jungle", label: "Jungle", icon: Leaf },
    { id: "frost", label: "Frost", icon: Snowflake },
    { id: "shadow", label: "Shadow", icon: Moon },
    { id: "star", label: "Star", icon: Star },
    { id: "codex", label: "Codex", icon: BookOpen },
  ];

  const LEVELS = [
    { id: "all", label: "All", age: "" },
    { id: "seed", label: "Seed", age: "3-5" },
    { id: "sprout", label: "Sprout 🌱", age: "3-6" },
    { id: "sapling", label: "Sapling 🌿", age: "7-9" },
    { id: "canopy", label: "Canopy 🌳", age: "10-12" },
    { id: "shadow_star", label: "Shadow/Star", age: "12-15" },
  ];

  useEffect(() => {
    if (perfMode!== "EPIC" ||!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    const parts: any[] = [];
    for (let i = 0; i < 40; i++) parts.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*0.5, vy: selectedTrail==="ember"?-Math.random()*1.5:Math.random(), size: Math.random()*3+1, alpha: Math.random()*0.6+0.2 });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      parts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<0) p.y=h; if(p.y>h) p.y=0; if(p.x<0) p.x=w; if(p.x>w) p.x=0;
        ctx.globalAlpha=p.alpha;
        ctx.fillStyle = selectedTrail==="ember"?`hsl(${15+Math.random()*20},100%,60%)`:`hsl(${130+Math.random()*20},60%,50%)`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [perfMode, selectedTrail]);

  const bg = selectedTrail==="ember"?"from-[#1a0f0a] via-[#2a1810] to-[#0a1f0a]":selectedTrail==="jungle"?"from-[#0a1f0a] via-[#0f2a14] to-[#0a1f0a]":selectedTrail==="frost"?"from-[#0a1628] via-[#112233] to-[#0a1f0a]":selectedTrail==="shadow"?"from-[#0f0a1f] via-[#1a102a] to-[#0a1f0a]":selectedTrail==="star"?"from-[#0a0a1f] via-[#1a1a2e] to-[#0a1f0a]":"from-[#0a1f0a] to-[#0a1f0a]";

  return (
    <div className={`min-h-screen text-stone-100 bg-gradient-to-b ${bg} relative transition-colors duration-`}>
      {perfMode==="EPIC" && <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" />}
      <header className="sticky top-0 z-50 bg-[#0a1f0a] border-b border-white/10">
        <div className="max-w- mx-auto px-6 h- flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">🌲</div><div className="font-black text-">WILD PAGES</div></div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setPerfMode(perfMode==="EPIC"?"LITE":"EPIC")} className="text- px-3 py-1 rounded-full border border-white/20">{perfMode}</button>
            <button onClick={()=>setShowFuel(true)} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-semibold">Fuel the Forest 🔥 87%</button>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">🐺</div>
          </div>
        </div>
      </header>
      <div className="max-w- mx-auto px-6 py-6 grid grid-cols-12 gap-6 relative z-10">
        <aside className="col-span-12 lg:col-span-3">
          <div className="rounded- bg-black/30 border border-white/10 p-5">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🐺</div><div><div className="font-bold">Nuns Pack</div><div className="text-xs opacity-60">{packMembers.reduce((s,m)=>s+m.trees,0)} trees grown</div></div></div>
            {packMembers.map(m=><button key={m.id} onClick={()=>setActiveMember(m.id)} className={`w-full flex justify-between px-3 py-2 rounded-xl border mb-2 ${activeMember===m.id?"bg-white/15 border-white/20":"bg-white/5 border-white/5"}`}><span>{m.avatar} {m.name}</span><span className="text-xs opacity-70">{m.trees} 🌳</span></button>)}
          </div>
        </aside>
        <main className="col-span-12 lg:col-span-9">
          <h1 className="text- font-black">Welcome back, Nuns Pack! Who&apos;s reading?</h1>
          <div className="mt-3 flex gap-2 flex-wrap">{packMembers.map(m=><button key={m.id} onClick={()=>setActiveMember(m.id)} className={`px-4 py-2 rounded-full border text-sm font-semibold ${activeMember===m.id?"bg-white text-black":"bg-white/10 border-white/10"}`}>{m.avatar} {m.name}</button>)}</div>
          <div className="mt-6 mb-4 flex gap-2 overflow-x-auto pb-2">{TRAILS.map(t=>{const I=t.icon;return<button key={t.id} onClick={()=>setSelectedTrail(t.id as Trail)} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${selectedTrail===t.id?"bg-white text-black":"bg-black/30 border-white/10"}`}><I className="w-4 h-4"/>{t.label}</button>})}</div>
          <div className="mb-8 flex gap-2 overflow-x-auto">{LEVELS.map(l=><button key={l.id} onClick={()=>setSelectedLevel(l.id as any)} className={`shrink-0 px-3 py-1.5 rounded-full border text-xs ${selectedLevel===l.id?"bg-white/20 border-white/30":"bg-white/5 border-white/5"}`}>{l.label} {l.age?`· ${l.age}`:""}</button>)}</div>
          <div className="rounded- border border-dashed border-white/15 bg-black/20 p-16 text-center">
            <Trees className="w-6 h-6 mx-auto opacity-70 mb-3"/>
            <h3 className="font-bold">No books in this Trail yet</h3>
            <p className="text-sm opacity-60">Forest is growing... Replace this div with your books map</p>
          </div>
        </main>
      </div>
      {showFuel&&<div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={()=>setShowFuel(false)}><div className="w-full max-w- rounded- bg-[#141a14] border border-white/10 p-6" onClick={e=>e.stopPropagation()}><h3 className="text-xl font-black">Fuel the Forest 🔥 87%</h3><p className="text-sm opacity-70 mt-2">100% free forever. No ads.</p></div></div>}
    </div>
  );
}
