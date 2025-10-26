window.addEventListener("load", () => {
  if (typeof supabase === "undefined") {
    console.error("⚠️ Supabase library belum dimuat!");
    return;
  }

  const SUPABASE_URL = "https://pnxdnbsyvjilvkeoltxo.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueGRuYnN5dmppbHZrZW9sdHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Mzc5MDgsImV4cCI6MjA3NzAxMzkwOH0.em7RJ7jtg2FjTKKotO4C7sA0BFTjPbjF4Rpa4HQZ--M";

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = client;
  console.log("✅ Supabase client siap digunakan");
});
