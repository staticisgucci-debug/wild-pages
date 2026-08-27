import { supabaseReady, supabaseAdmin } from "@/lib/supabase";
import type { Book, Chapter } from './types';

function buildChaptersFromRaw(title: string, raw: string): Chapter[] {
  const text = raw || "";
  const paras = text.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0).map((p: string) => p.trim());
  return [{ title: title || "Chapter 1", paragraphs: paras.length ? paras : [text || "Empty"] } as any];
}

export async function getTrails({ activeOnly = false } = {}) {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db.from("trails").select("*").order("sort_order");
  return data || [];
}

export async function getLevels({ activeOnly = false } = {}) {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db.from("levels").select("*").order("sort_order");
  return data || [];
}

export async function getAllBooksForStudy() {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data: books, error } = await db.from("books").select("*").order("updated_at", { ascending: false });
  if (error) {
    console.error("getAllBooksForStudy", error);
    return [];
  }
  const [trails, levels] = await Promise.all([getTrails(), getLevels()]);
  return (books || []).map((b: any) => {
    const trailSlug = b.trail || b.taxa?.trail;
    const levelSlug = b.level || b.taxa?.level;
    const trailObj = trails.find((t: any) => t.slug === trailSlug);
    const levelObj = levels.find((l: any) => l.slug === levelSlug);
    const text = b.source_text || b.content || "";
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    let chapters = b.chapters;
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      chapters = buildChaptersFromRaw(b.title, text);
    }
    return {
      ...b,
      trailName: trailObj?.name || trailSlug || "—",
      levelName: levelObj?.name || levelSlug || "—",
      wordCount,
      minutes: Math.max(1, Math.ceil(wordCount / 200)),
      chapters,
      coverUrl: b.cover_url || b.coverUrl || null,
      coverColor: b.cover_color || b.coverColor || "#d9682a",
      status: b.status || "draft",
    };
  });
}

export async function getBookBySlug(slug: string) {
  const books = await getAllBooksForStudy();
  return books.find((b: any) => b.slug === slug) || null;
}

export async function getPublishedBooks() {
  const all = await getAllBooksForStudy();
  return all.filter((b: any) => b.status === "published");
}