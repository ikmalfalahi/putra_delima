// === Inisialisasi Supabase Client ===
(function initSupabase() {
  // Tunggu sampai library siap
  if (typeof supabase === "undefined") {
    console.error("⚠️ Supabase library belum dimuat! Pastikan CDN @supabase/supabase-js@2 di atas file ini.");
    return;
  }

  const SUPABASE_URL = "https://pnxdnbsyvjilvkeoltxo.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueGRuYnN5dmppbHZrZW9sdHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Mzc5MDgsImV4cCI6MjA3NzAxMzkwOH0.em7RJ7jtg2FjTKKotO4C7sA0BFTjPbjF4Rpa4HQZ--M";

  // Buat client Supabase
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = client; // biar bisa dipakai global

  console.log("✅ Supabase client berhasil dibuat.");
})();
