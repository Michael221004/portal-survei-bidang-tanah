import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isConfigured = Boolean(
  url && key && !url.includes("YOUR-PROJECT") && !key.includes("YOUR_KEY")
);

// Placeholder valid enough for module initialization. Pages check isConfigured
// before calling Supabase, so the public landing page can still render pre-setup.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key"
);
