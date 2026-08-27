"use server"
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

const getFormValue = (formData: FormData | Record<string, any>, key: string) => {
  if (formData instanceof FormData) return String(formData.get(key) ?? '');
  return String(formData[key] ?? '');
};

export type LoginState = {
  ok?: boolean;
  error?: string;
};


export async function saveBook(formData: FormData): Promise<void>;
export async function saveBook(formData: Record<string, any>): Promise<{ ok: boolean; data?: any; error?: string }>;
export async function saveBook(formData: FormData | Record<string, any>): Promise<void | { ok: boolean; data?: any; error?: string }> {
  const payload = formData instanceof FormData
    ? {
        title: getFormValue(formData, 'title'),
        slug: getFormValue(formData, 'slug'),
        trail_name: getFormValue(formData, 'trail_name'),
        trail_slug: getFormValue(formData, 'trail_slug'),
        level: getFormValue(formData, 'level') || 'seed',
        source_text: getFormValue(formData, 'source_text'),
        cover_url: getFormValue(formData, 'cover_url'),
      }
    : formData;

  const db = supabaseAdmin();
  if (!db) {
    if (formData instanceof FormData) return;
    return { ok: false, error: 'No admin keys' };
  }

  let finalCoverUrl = payload.cover_url;

  // Only accept image data URLs and enforce size < 5MB
  if (finalCoverUrl?.startsWith('data:image/')) {
    const base64 = finalCoverUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    if (buffer.length >= MAX_BYTES) {
      throw new Error('Cover image exceeds 5MB');
    }
    try {
      const ext = finalCoverUrl.includes('png') ? 'png' : 'jpg';
      const fileName = `${payload.slug}-${Date.now()}.${ext}`;
      const { error: upError } = await db.storage.from('covers').upload(fileName, buffer, { contentType: `image/${ext}`, upsert: false });
      if (upError) throw upError;
      const { data } = db.storage.from('covers').getPublicUrl(fileName);
      finalCoverUrl = data.publicUrl;
    } catch (e: any) {
      console.log('Cover upload failed', e?.message || e);
      throw e;
    }
  } else if (finalCoverUrl?.startsWith('data:')) {
    // Explicitly reject non-image data URLs
    throw new Error('Invalid cover data URL');
  }

  // Ensure unique slug: if exists, append '-' + nanoid(4)
  let slug = payload.slug;
  const { data: existing, error: queryErr } = await db.from('books').select('id').eq('slug', slug).limit(1).maybeSingle();
  if (queryErr) {
    if (formData instanceof FormData) return;
    return { ok: false, error: queryErr.message };
  }
  if (existing) {
    slug = `${slug}-${nanoid(4)}`;
  }

  const bookPayload = {
    title: payload.title,
    slug,
    trail_name: payload.trail_name,
    trail_slug: payload.trail_slug,
    level: payload.level || 'seed',
    source_text: payload.source_text,
    cover_url: finalCoverUrl,
  };

  const { data, error } = await db.from('books').insert(bookPayload).select();
  if (error) {
    if (formData instanceof FormData) return;
    return { ok: false, error: error.message };
  }

  revalidatePath('/library');
  revalidatePath('/study');
  revalidatePath('/');

  if (formData instanceof FormData) return;
  return { ok: true, data };
}

export async function setBookStatus(formData: FormData): Promise<void>;
export async function setBookStatus(formData: { slug: string; status: string }): Promise<{ ok: boolean }>;
export async function setBookStatus(formData: FormData | { slug: string; status: string }): Promise<void | { ok: boolean }> {
  const slug = typeof formData === 'string' ? formData : getFormValue(formData, 'slug');
  const status = typeof formData === 'string' ? 'published' : getFormValue(formData, 'status');
  const db = supabaseAdmin();
  await db?.from('books').update({ status }).eq('slug', slug);
  revalidatePath('/library');
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true };
}

export async function deleteBook(formData: FormData): Promise<void>;
export async function deleteBook(formData: string): Promise<{ ok: boolean }>;
export async function deleteBook(formData: FormData | string): Promise<void | { ok: boolean }> {
  const slug = typeof formData === 'string' ? formData : getFormValue(formData, 'slug');
  const db = supabaseAdmin();
  await db?.from('books').delete().eq('slug', slug);
  revalidatePath('/library');
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true };
}

export async function saveTrail(formData: FormData): Promise<void>;
export async function saveTrail(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function saveTrail(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}

export async function saveLevel(formData: FormData): Promise<void>;
export async function saveLevel(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function saveLevel(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}

export async function addPresetTrail(formData: FormData): Promise<void>;
export async function addPresetTrail(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function addPresetTrail(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}

export async function addPresetLevel(formData: FormData): Promise<void>;
export async function addPresetLevel(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function addPresetLevel(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}

export async function setTaxonomyActive(formData: FormData): Promise<void>;
export async function setTaxonomyActive(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function setTaxonomyActive(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}

export async function deleteTaxonomy(formData: FormData): Promise<void>;
export async function deleteTaxonomy(formData: any): Promise<{ ok: boolean; formData: any }>;
export async function deleteTaxonomy(formData: FormData | any): Promise<void | { ok: boolean; formData: any }> {
  revalidatePath('/study');
  if (formData instanceof FormData) return;
  return { ok: true, formData };
}
