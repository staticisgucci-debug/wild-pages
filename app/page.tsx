import Link from "next/link";
import Motes from "@/components/Motes";
import ForestHorizon from "@/components/ForestHorizon";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1b14] text-[#f8ebd1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,173,85,0.22),transparent_35%),radial-gradient(circle_at_20%_20%,_rgba(110,156,96,0.22),transparent_28%),linear-gradient(180deg,_#0d1b14_0%,_#102416_32%,_#0d1b14_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),transparent_58%)]" />

      <Motes />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pb-28 pt-10 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#efc072]/30 bg-[#122a1e]/70 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.34em] text-[#f4d59d] shadow-[0_0_34px_rgba(220,123,52,0.18)]">
          <span className="h-2 w-2 rounded-full bg-[#ffbb65] shadow-[0_0_14px_rgba(255,187,101,0.95)]" />
          Wild Pages
        </div>

        <div className="w-full max-w-4xl animate-[floatLogo_6s_ease-in-out_infinite] drop-shadow-[0_24px_80px_rgba(255,193,110,0.22)]">
          <img
            src="/logo.png"
            alt="Wild Pages - enchanted book with forest"
            className="mx-auto h-auto w-full max-w- object-contain"
          />
        </div>

        <p className="mt-4 text-base font-light tracking-[0.18em] text-[#e8d6af]/80 uppercase md:text-lg">
          Stories that grow with you
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-full bg-[#f4e7c8] px-8 py-3 text-sm font-semibold text-[#102516] shadow-[0_18px_40px_rgba(245,214,161,0.25)] transition hover:-translate-y-0.5 hover:bg-[#fff1d5]"
          >
            Log in
          </Link>
          <Link
            href="/library"
            className="rounded-full border border-[#f3d7a1]/30 bg-[#f3d7a1]/5 px-8 py-3 text-sm font-medium text-[#f9ecd1] backdrop-blur-sm transition hover:border-[#f3d7a1]/60 hover:bg-[#f3d7a1]/10"
          >
            Browse books
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:hello@wildpages.app?subject=Fund%20a%20New%20Book"
            className="inline-flex items-center rounded-full border border-[#f9de9c]/25 bg-[#1f3026]/70 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.22em] text-[#fadb9b] transition hover:border-[#f9de9c]/50 hover:bg-[#233829]"
          >
            Fund a new book
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 w-full">
        <ForestHorizon />
      </div>

      <Link
        href="/study"
        className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-[#ebd7a0]/20 bg-[#122218]/80 px-3 py-2 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-[#f7e7c4] shadow-[0_18px_42px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#ebd7a0]/35 hover:bg-[#183022]"
      >
        Author
      </Link>

      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.7deg); }
        }
      `}</style>
    </main>
  );
}