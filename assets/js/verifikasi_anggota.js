document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("anggota-body");

  async function loadAnggota() {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">🔄 Memuat data...</td></tr>`;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
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
          ${a.status === "pending" ? `
            <button class="approve" data-id="${a.id}">Approve</button>
            <button class="reject" data-id="${a.id}">Reject</button>
          ` : "-"}
        </td>
      </tr>
    `).join("");
  }

  loadAnggota();

  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("approve")) {
      await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
      alert("✅ Anggota disetujui!");
      loadAnggota();
    }
    if (e.target.classList.contains("reject")) {
      await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
      alert("❌ Anggota ditolak!");
      loadAnggota();
    }
  });
});
