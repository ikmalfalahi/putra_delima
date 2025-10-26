document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat.");

  const tbody = document.getElementById("anggota-body");

  // Load anggota pending
  async function loadAnggota() {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">🔄 Memuat data...</td></tr>`;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending") // hanya anggota baru
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="9" class="loading">❌ Gagal memuat data.</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="loading">Tidak ada anggota baru.</td></tr>`;
      return;
    }

    // Render data anggota
    tbody.innerHTML = data.map((a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nama}</td>
        <td>${a.jenis_kelamin || "-"}</td>
        <td>${a.umur || "-"}</td>
        <td>${a.agama || "-"}</td>
        <td>${a.status_hubungan || "-"}</td>
        <td>Blok ${a.blok || "-"}, RT ${a.rt || "-"}, RW ${a.rw || "-"}</td>
        <td>${a.status}</td>
        <td>
          <button class="approve" data-id="${a.id}">Approve</button>
          <button class="reject" data-id="${a.id}">Reject</button>
        </td>
      </tr>
    `).join("");
  }

  // Initial load
  loadAnggota();

  // Handle click approve/reject
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("approve")) {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) return alert("❌ Gagal approve: " + error.message);
      alert("✅ Anggota disetujui!");
      loadAnggota();
    }

    if (e.target.classList.contains("reject")) {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) return alert("❌ Gagal reject: " + error.message);
      alert("❌ Anggota ditolak!");
      loadAnggota();
    }
  });
});
