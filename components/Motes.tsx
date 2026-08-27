"use client";
import { useEffect, useState, useRef } from "react";

type Mote = { id: number; x: number; y: number; size: number; glow: string; dur: string; drift: string; o: number; };

export default function Motes() {
  const [motes, setMotes] = useState<Mote[]>([]);
  const wrapRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    setMotes(Array.from({ length: 42 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: i % 3 === 0? Math.random()*3+2 : i % 3 === 1? Math.random()*2+1 : Math.random()*1.2+0.8,
      glow: i % 7 === 0? "rgba(255,235,150,0.95)" : "rgba(255,165,70,0.9)",
      dur: `${12 + Math.random()*18}s`,
      drift: `${(Math.random()-0.5)*140}px`,
      o: i % 3 === 0? 0.9 : 0.55,
    })));

    const move = (e: MouseEvent | TouchEvent) => {
      const t = (e as TouchEvent).touches?.[0];
      mouse.current = { x: t?.clientX?? (e as MouseEvent).clientX, y: t?.clientY?? (e as MouseEvent).clientY };
    };
    window.addEventListener("mousemove", move, {passive:true});
    window.addEventListener("touchmove", move, {passive:true});

    let raf: number;
    const tick = () => {
      wrapRefs.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = cx - mouse.current.x;
        const dy = cy - mouse.current.y;
        const d = Math.hypot(dx,dy);
        if (d < 200) {
          const f = (1 - d/200) * 60;
          el.style.transform = `translate3d(${(dx/d)*f}px, ${(dy/d)*f}px, 0)`;
        } else {
          el.style.transform = `translate3d(0px, 0px, 0)`;
        }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("touchmove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map(m => (
        <div
          key={m.id}
          ref={el => { if(el) wrapRefs.current.set(m.id, el); }}
          className="mote-wrap absolute"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <button
            onPointerDown={e => { e.currentTarget.classList.add("is-popped"); setTimeout(()=>e.currentTarget.classList.remove("is-popped"),600); try{navigator.vibrate?.(20)}catch{} }}
            className="mote"
            style={{
              width: m.size, height: m.size,
              ["--dur" as any]: m.dur, ["--drift" as any]: m.drift, ["--glow" as any]: m.glow, ["--o" as any]: m.o
            } as any}
          />
        </div>
      ))}
    </div>
  );
}