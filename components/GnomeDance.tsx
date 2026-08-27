"use client";
import { useEffect, useState } from "react";

export default function GnomeDance({ jarCount = 0, campfire = false }: { jarCount?: number, campfire?: boolean }) {
  const [dancing, setDancing] = useState(false);
  const [flies, setFlies] = useState<{ left: number; top: number; delay: number }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDancing(true), 300);
    // Generate random positions ONLY on client after hydration
    const f = Array.from({ length: Math.min(jarCount, 8) }).map((_, i) => ({
      left: 20 + i * 10 + Math.random() * 5,
      top: (i % 3) * 20 + Math.random() * 10,
      delay: i * 0.4,
    }));
    setFlies(f);
    return () => clearTimeout(t);
  }, [jarCount]);

  return (
    <div className="relative w-full min-h- md:min-h- flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
      <div className="relative flex items-end justify-center gap-2 md:gap-4 mt-4">
        <div className="text- md:text- leading-none select-none">🌲</div>
        <div className="text- md:text- leading-none select-none mb-2">🍄</div>
        <div className="relative mx-1 md:mx-2">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-black/20 blur-" />
          <div className={`text- md:text- leading-none select-none ${dancing? "animate-[gnomeDance_0.6s_ease-in-out_infinite]" : ""}`}>🧙</div>
        </div>
        <div className="text- md:text- leading-none select-none mb-2">🍄</div>
        <div className="text- md:text- leading-none select-none">🌲</div>
      </div>

      <div className="mt-10 text-center">
        <h2 className="font-serif text- md:text- font-bold" style={{ color: campfire? "#e8d4b0" : "#2b2216" }}>The Gnome Approves!</h2>
        <p className="font-serif text- mt-3" style={{ color: campfire? "rgba(232,212,176,0.7)" : "rgba(43,34,22,0.6)" }}>You caught {jarCount} firefl{jarCount === 1? "y" : "ies"}</p>
        <p className="text- mt-2 tracking-wide" style={{ color: campfire? "rgba(232,212,176,0.4)" : "rgba(43,34,22,0.35)" }}>He dances where the mushrooms grow</p>
      </div>

      <div className="absolute top-[18%] inset-x-0 h-20 pointer-events-none">
        {flies.map((fly, i) => (
          <span key={i} className="absolute text- animate-[floaty_3s_ease-in-out_infinite]" style={{ left: `${fly.left}%`, top: `${fly.top}%`, animationDelay: `${fly.delay}s` }}>✦</span>
        ))}
      </div>

      <style>{`@keyframes gnomeDance{0%,100%{transform:translateY(0) rotate(-8deg)}25%{transform:translateY(-14px) rotate(8deg) scale(1.08)}50%{transform:translateY(0) rotate(-6deg)}75%{transform:translateY(-8px) rotate(7deg)}}@keyframes floaty{0%,100%{transform:translateY(0);opacity:0.6}50%{transform:translateY(-12px);opacity:1}}`}</style>
    </div>
  );
}