/// <reference types="vite/client" />

// Set at build time (GitHub Actions secrets). The Supabase key is the publishable "anon" key:
// it is meant to be in the browser, and the inquiries table is insert-only for it.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
