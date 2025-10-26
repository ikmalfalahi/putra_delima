document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat.");

  // Ambil user login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  // Ambil data profile user
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return console.error("❌ Gagal ambil data profil:", error);

  // Tampilkan data
  document.getElementById("nama").textContent = data.nama || "-";
  document.getElementById("email").textContent = user.email;
  document.getElementById("jenis_kelamin").textContent = data.jenis_kelamin || "-";
  document.getElementById("umur").textContent = data.umur || "-";
  document.getElementById("agama").textContent = data.agama || "-";
  document.getElementById("status_hubungan").textContent = data.status_hubungan || "-";
  document.getElementById("alamat").textContent = `Blok ${data.blok || "-"}, RT ${data.rt || "-"}, RW ${data.rw || "-"}`;
  document.getElementById("role").textContent = data.role || "-";
  document.getElementById("status").textContent = data.status || "-";

  // Logout
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

  // Tombol edit profil (bisa diarahkan ke halaman edit atau popup)
  document.getElementById("edit-profile").addEventListener("click", () => {
    window.location.href = "edit_profil.html"; // bisa buat halaman edit terpisah
  });
});
