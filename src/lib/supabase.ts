import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Server-side service role key (NEVER exposed to frontend bundle)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));
};

/**
 * Public Supabase client for browser/storefront operations respecting RLS.
 */
let publicClient: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!publicClient) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return publicClient;
}

/**
 * Privileged Supabase client for trusted server-side operations (API routes, Webhooks).
 * Only runs in Node.js server environment.
 */
let adminClient: SupabaseClient | null = null;
export function getSupabaseAdminClient(): SupabaseClient | null {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

/**
 * Upload a media file to a Supabase Storage bucket.
 * Returns public URL upon successful upload.
 */
export async function uploadToSupabaseStorage(
  bucket: "product-images" | "category-images" | "banners" | "invoices",
  path: string,
  fileBuffer: Buffer | ArrayBuffer | Uint8Array,
  contentType: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabaseAdminClient() || getSupabaseClient();
  if (!supabase) {
    return {
      url: null,
      error: "Supabase credentials not configured in environment.",
    };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || "Failed to upload image" };
  }
}
