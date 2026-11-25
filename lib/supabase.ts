
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isConfigured = Boolean(
  url && key && !url.includes("YOUR-PROJECT")
);

// Supaya halaman tetap bisa dibuka sebelum Supabase dikonfigurasi.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
);
