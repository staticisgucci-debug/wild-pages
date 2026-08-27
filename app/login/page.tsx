"use client";
import { useState } from "react";
import Link from "next/link";
import Motes from "@/components/Motes";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Add email and password");
      return;
    }
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) throw new Error("no api");
      window.location.href = "/library";
    } catch {
      window.location.href = "/library";
    }
    setLoading(false);
  };

  const loginText = mode === "login" ? "Log in" : "Create account";
  const loadingText = "Please wait...";

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#0e1f14' }}>
      <div className="absolute inset-0" style={{ backgroundColor: '#162e1e' }} />
      <div className="absolute inset-0 pointer-events-none opacity-50"><Motes /></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border p-6 md:p-8" style={{ backgroundColor: 'rgba(26,46,30,0.85)', borderColor: 'rgba(212,197,160,0.15)' }}>
        <Link href="/" className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <span className="font-serif text-lg" style={{ color: '#e8dcc0' }}>Wild Pages</span>
        </Link>

        <h1 className="font-serif text-2xl text-center" style={{ color: '#e8dcc0' }}>{mode === "login" ? "Welcome back" : "Join the pack"}</h1>
        <p className="text-center text-sm mt-2 mb-6" style={{ color: 'rgba(184,168,138,0.6)' }}>{mode === "login" ? "Log in to continue reading" : "Create your forest account"}</p>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-full mb-6" style={{ backgroundColor: '#0e1f14' }}>
          <button onClick={() => setMode("login")} className="rounded-full py-2.5 text-sm font-semibold" style={mode === "login" ? { backgroundColor: '#e8dcc0', color: '#0e1f14' } : { backgroundColor: 'transparent', color: 'rgba(184,168,138,0.6)' }}>Log in</button>
          <button onClick={() => setMode("signup")} className="rounded-full py-2.5 text-sm font-semibold" style={mode === "signup" ? { backgroundColor: '#e8dcc0', color: '#0e1f14' } : { backgroundColor: 'transparent', color: 'rgba(184,168,138,0.6)' }}>Sign up</button>
        </div>

        <div className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,197,160,0.6)' }}>Pack name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="The Nuns" className="mt-2 w-full rounded-xl border px-4 py-3.5 text-base" style={{ backgroundColor: '#0e1f14', borderColor: 'rgba(212,197,160,0.15)', color: '#e8dcc0' }} />
            </div>
          )}
          <div>
            <label className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,197,160,0.6)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@forest.com" className="mt-2 w-full rounded-xl border px-4 py-3.5 text-base" style={{ backgroundColor: '#0e1f14', borderColor: 'rgba(212,197,160,0.15)', color: '#e8dcc0' }} />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,197,160,0.6)' }}>Password</label>
            <div className="relative mt-2">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="w-full rounded-xl border px-4 py-3.5 pr-12 text-base" style={{ backgroundColor: '#0e1f14', borderColor: 'rgba(212,197,160,0.15)', color: '#e8dcc0' }} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,197,160,0.15)', color: '#d4c5a0' }}>{showPass ? "Hide" : "Show"}</button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full rounded-full py-4 text-sm font-bold mt-2" style={{ backgroundColor: '#e8dcc0', color: '#0e1f14', minHeight: '52px' }}>{loading ? loadingText : loginText}</button>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(212,197,160,0.15)' }} />
            <span className="text-xs" style={{ color: 'rgba(184,168,138,0.4)' }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(212,197,160,0.15)' }} />
          </div>

          <Link href="/library" className="w-full rounded-full border py-3.5 text-sm font-medium text-center block" style={{ borderColor: 'rgba(212,197,160,0.2)', color: '#e8dcc0', backgroundColor: 'rgba(14,31,20,0.5)', minHeight: '48px' }}>Browse as guest</Link>
        </div>
      </div>
    </main>
  );
}
