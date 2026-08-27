"use client";
import { useEffect, useState } from "react";

export default function PageMote({ onCatch }: { onCatch: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setPos({ x: 20 + Math.random()*60, y: 30 + Math.random()*40 });
    const move = setInterval(() => {
      setPos({ x: 20 + Math.random()*60, y: 30 + Math.random()*40 });
    }, 800);
    return () => clearInterval(move);
  }, []);

  return (
    <button
      onClick={onCatch}
      className="fixed z-[60] w-8 h-8 rounded-full animate-pulse"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        background: 'radial-gradient(circle, #fff8a0, #d9682a)',
        boxShadow: '0 0 20px 8px rgba(255,248,160,0.6)',
        transition: 'left 0.8s ease, top 0.8s ease'
      }}
      aria-label="Catch firefly"
    />
  );
}