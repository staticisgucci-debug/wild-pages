import { notFound } from "next/navigation";
import Reader from "@/components/Reader";
import { getBookBySlug } from "@/lib/content";
import { isStudyUnlocked } from "@/lib/studySession";

/**
 * Previewing a draft, in the real Reader, before anybody else can see it.
 *
 * This deliberately sits OUTSIDE the /study folder. Inside it, the admin bar
 * would fight the full-screen Reader for the top of the page. So it lives out
 * here and does its own lock check instead of relying on the folder it's in.
 *
 * If you are not signed in to The Study, this pretends the page doesn't exist --
 * which tells a stranger nothing about whether the book is real.
 */

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Preview — Wild Pages",
  // Keeps unfinished books out of Google.
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isStudyUnlocked())) notFound();

  const { slug } = await params;
  const found = await getBookBySlug(slug);
  if (!found) notFound();

  return <Reader book={found} />;
}
