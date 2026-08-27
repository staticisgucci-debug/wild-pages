import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import MagicalReader from '@/components/MagicalReader'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ReadPage({ params }: Props) {
  // Next.js 15 requires awaiting params
  const { slug } = await params;

  const db = supabaseAdmin();
  
  if (!db) {
    console.error("No Supabase admin keys");
    return notFound();
  }

  const { data: book, error } = await db
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !book) {
    console.error("Book not found:", slug, error);
    return notFound();
  }

  return (
    <main className="min-h-screen bg-[#0d1b14]">
      <MagicalReader book={book} />
    </main>
  );
}