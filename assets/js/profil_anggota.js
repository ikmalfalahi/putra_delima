// assets/js/profil_anggota.js
document.addEventListener("DOMContentLoaded", async () => {
  // === Pastikan Supabase siap ===
  if (!window.supabase) {
    console.error("❌ Supabase belum dimuat!");
    alert("Terjadi kesalahan. Muat ulang halaman.");
    return;
  }

  // === Ambil user login ===
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    window.location.href = "login.html";
    return;
  }

  // === Ambil data profil ===
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", user.id)
    .single();

  const namaDisplay = document.getElementById("nama-anggota");
  if (namaDisplay) {
    namaDisplay.textContent = `Halo, ${profile?.nama || user.email || "Anggota"}`;
  }

  // === Ambil data iuran ===
  const { data: iuranList, error: iuranError } = await supabase
    .from("iuran")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (iuranError) {
    console.error("❌ Gagal ambil iuran:", iuranError.message);
    alert("Gagal memuat data iuran.");
    return;
  }

  // === Render tabel iuran ===
  const tbody = document.getElementById("iuran-body");
  tbody.innerHTML = "";

  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  for (const bulan of bulanList) {
    const dataBulan = iuranList.find(i => i.bulan === bulan);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${bulan}</td>
      <td>${dataBulan ? dataBulan.status : "Belum Lunas"}</td>
      <td>${dataBulan?.bukti 
          ? `<a href="${dataBulan.bukti}" target="_blank">📎 Lihat</a>` 
          : "-"
        }</td>
      <td>
        <input type="file" accept="image/*" class="file-input" data-bulan="${bulan}" hidden>
        <button class="upload-btn" data-bulan="${bulan}">Upload</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // === Event upload handler (tanpa inline onclick) ===
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".upload-btn");
    if (btn) {
      const bulan = btn.dataset.bulan;
      const fileInput = tbody.querySelector(`.file-input[data-bulan="${bulan}"]`);
      if (fileInput) fileInput.click();
    }
  });

  // === Event file upload ===
  tbody.addEventListener("change", async (e) => {
    const input = e.target.closest(".file-input");
    if (!input) return;
    const file = input.files[0];
    if (!file) return;

    const bulan = input.dataset.bulan;
    await uploadBukti(file, bulan);
  });

  // === Logout handler ===
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }
});

// === Fungsi upload bukti iuran ===
async function uploadBukti(file, bulan) {
  if (!file) return;

  const { data: { user } } = await supabase.auth.getUser();
  const filePath = `${user.id}/${bulan}-${Date.now()}.jpg`;

  // Upload ke Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("bukti_iuran")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error(uploadError);
    return alert("❌ Gagal upload bukti.");
  }

  // Ambil URL publik
  const { data: urlData } = supabase.storage
    .from("bukti_iuran")
    .getPublicUrl(filePath);

  // Simpan ke tabel iuran
  const { error: upsertError } = await supabase
    .from("iuran")
    .upsert({
      user_id: user.id,
      nama: user.email,
      bulan,
      bukti: urlData.publicUrl,
      status: "Lunas",
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error(upsertError);
    return alert("❌ Gagal menyimpan data iuran.");
  }

  alert(`✅ Bukti ${bulan} berhasil diupload!`);
  // Perbarui status tanpa reload
  const row = document.querySelector(`button[data-bulan="${bulan}"]`).closest("tr");
  if (row) {
    row.children[1].textContent = "Lunas";
    row.children[2].innerHTML = `<a href="${urlData.publicUrl}" target="_blank">📎 Lihat</a>`;
  }
}
