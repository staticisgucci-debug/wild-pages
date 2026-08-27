import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const COVERS_BUCKET = "book-covers";

// Support BOTH old and new Supabase key names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseSecretKey = 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseReady = !!(supabaseUrl && supabasePublishableKey);

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient| null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!supabaseReady || !supabaseUrl || !supabasePublishableKey) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(supabaseUrl, supabasePublishableKey);
  return browserClient;
}

export function supabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl) return null;
  if (supabaseSecretKey) {
    if (adminClient) return adminClient;
    adminClient = createClient(supabaseUrl, supabaseSecretKey);
    return adminClient;
  }
  return supabaseBrowser();
}