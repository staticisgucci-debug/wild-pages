import Link from "next/link";

export const metadata = {
  title: "The Study — Wild Pages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="study-shell study-shell--wide">
      <header className="study-bar">
        <Link href="/study" className="study-brand">
          The Study
        </Link>
        <nav className="study-nav">
          <Link href="/study">Books</Link>
          <Link href="/study/taxonomy">Trails &amp; Levels</Link>
          <Link href="/">View site</Link>
        </nav>
      </header>
      <main className="study-main">{children}</main>
    </div>
  );
}
