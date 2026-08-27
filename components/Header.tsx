"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const db = supabaseBrowser();
    if (!db) { setLoading(false); return; }
    db.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };
  if (loading) return <div className="h- border-b" style={{ backgroundColor: 'rgba(14,31,20,0.9)', borderColor: 'rgba(212,197,160,0.15)' }} />;
  return (
    <div className="sticky top-0 z-20 backdrop-blur border-b px-4 md:px-6 py-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(14,31,20,0.9)', borderColor: 'rgba(212,197,160,0.15)' }}>
      <div className="flex gap-4 text-sm items-center" style={{ color: '#b8a88a' }}>
        <Link href="/" className="font-bold" style={{ color: '#e8dcc0' }}>Wild Pages</Link>
        {user ? (
          <span className="hidden md:inline text-xs" style={{ color: '#e8dcc0' }}>Welcome back, {user.user_metadata?.display_name || user.email?.split("@")[0]} 🌲</span>
        ) : (
          <span className="hidden md:inline text-xs opacity-60">Browse mode - not logged in</span>
        )}
        {user?.email === "staticisgucci@gmail.com" && <Link href="/study" className="hidden md:inline text-xs underline">The Study</Link>}
      </div>
      <div className="flex gap-2 items-center">
        {user ? (
          <button onClick={logout} className="rounded-full px-4 py-1.5 text-xs border" style={{ borderColor: 'rgba(212,197,160,0.2)', color: '#b8a88a' }}>Log out</button>
        ) : (
          <Link href="/login" className="rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>Log in / Sign up</Link>
        )}
        <Link href="/study" className="rounded-full px-4 py-1.5 text-xs font-bold" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14' }}>+ Write</Link>
      </div>
    </div>
  );
}
