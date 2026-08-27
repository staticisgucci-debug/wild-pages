import Link from "next/link";
import BookEditor from "@/components/study/BookEditor";
import { supabaseAdmin } from "@/lib/supabase";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "new";
  let book: any = null;

  if (!isNew) {
    const db = supabaseAdmin();
    if (db) {
      const { data } = await db.from("books").select("*").eq("slug", slug).maybeSingle();
      book = data;
    }
  }

  if (!isNew && !book) {
    return <div className="p-8">Not found: {slug} <Link href="/study" className="underline">Back</Link></div>;
  }

  return (
    <div className="study-shell study-shell--wide">
      <div className="study-main study-main--editor">
        <div className="study-page-topbar">
          <Link href="/study" className="study-button study-button--quiet study-button--small">← Back to study</Link>
          <h1 className="study-h1 study-h1--editor">{isNew ? "Add a new book" : book.title}</h1>
        </div>

        <BookEditor book={book} isNew={isNew} />
      </div>
    </div>
  );
}