// === Inisialisasi Supabase Client ===
(function initSupabase() {
  // Tunggu sampai library siap
  if (typeof supabase === "undefined") {
    console.error("⚠️ Supabase library belum dimuat! Pastikan CDN @supabase/supabase-js@2 di atas file ini.");
    return;
  }

  const SUPABASE_URL = "https://ubddfvcjbzuicsewohas.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGRmdmNqYnp1aWNzZXdvaGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjA3NzgsImV4cCI6MjA3NzAzNjc3OH0.zwOBGrk2iekzlMlL2_fOqRqFUaeOCaQR1Km_fAEP7jQ";

  // Buat client Supabase
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = client; // biar bisa dipakai global

  console.log("✅ Supabase client berhasil dibuat.");
})();


