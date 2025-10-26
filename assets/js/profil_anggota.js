document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Ambil data profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", user.id)
    .single();

  document.getElementById("nama-anggota").textContent = `Halo, ${profile.nama || user.email}`;

  // Ambil data iuran
  const { data: iuran } = await supabase
    .from("iuran")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const tbody = document.getElementById("iuran-body");
  tbody.innerHTML = "";

  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  bulanList.forEach((bulan) => {
    const dataBulan = iuran.find(i => i.bulan === bulan);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${bulan}</td>
      <td>${dataBulan ? dataBulan.status : "Belum Lunas"}</td>
      <td>${dataBulan?.bukti ? `<a href="${dataBulan.bukti}" target="_blank">📎 Lihat</a>` : "-"}</td>
      <td>
        <input type="file" accept="image/*" id="upload-${bulan}" hidden>
        <button class="upload-btn" onclick="document.getElementById('upload-${bulan}').click()">Upload</button>
      </td>
    `;
    tbody.appendChild(tr);

    document.getElementById(`upload-${bulan}`).addEventListener("change", (e) => uploadBukti(e, bulan));
  });
});

async function uploadBukti(e, bulan) {
  const file = e.target.files[0];
  if (!file) return;

  const { data: { user } } = await supabase.auth.getUser();
  const filePath = `${user.id}/${bulan}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("bukti_iuran")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return alert("Gagal upload bukti");

  const { data: urlData } = supabase.storage
    .from("bukti_iuran")
    .getPublicUrl(filePath);

  await supabase.from("iuran").upsert({
    user_id: user.id,
    nama: user.email,
    bulan,
    bukti: urlData.publicUrl,
    status: "Lunas"
  });

  alert("Bukti iuran berhasil diupload!");
  location.reload();
}

document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});
