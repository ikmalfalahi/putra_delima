document.addEventListener("DOMContentLoaded", async () => {
  // ===== Pastikan Supabase sudah siap =====
  if (!window.supabase) {
    console.error("❌ Supabase client belum dimuat.");
    return;
  }

  // ===== Elemen DOM =====
  const tbody = document.getElementById("anggota-body");
  const popup = document.getElementById("confirm-popup");
  const confirmText = document.getElementById("confirm-text");
  const btnYes = document.getElementById("confirm-yes");
  const btnNo = document.getElementById("confirm-no");

  let currentAction = null; // { id, status }

  // ===== Fungsi Load Anggota Pending =====
  async function loadAnggota() {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">🔄 Memuat data...</td></tr>`;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Tidak ada anggota baru.</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(
          (a, i) => `
        <tr data-id="${a.id}">
          <td>${i + 1}</td>
          <td>${a.nama || "-"}</td>
          <td>${a.jenis_kelamin || "-"}</td>
          <td>${a.umur || "-"}</td>
          <td>${a.agama || "-"}</td>
          <td>${a.status_hubungan || "-"}</td>
          <td>Blok ${a.blok || "-"}, RT ${a.rt || "-"}, RW ${a.rw || "-"}</td>
          <td class="status-cell">${a.status}</td>
          <td>
            <button class="approve" data-id="${a.id}">✅ Approve</button>
            <button class="reject" data-id="${a.id}">❌ Reject</button>
          </td>
        </tr>`
        )
        .join("");
    } catch (err) {
      console.error("❌ Gagal memuat data:", err);
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Terjadi kesalahan saat memuat data.</td></tr>`;
    }
  }

  // ===== Panggil Saat Awal =====
  await loadAnggota();

  // ===== Klik tombol Approve / Reject =====
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    const isApprove = btn.classList.contains("approve");
    const status = isApprove ? "approved" : "rejected";

    currentAction = { id, status };
    confirmText.textContent = `Apakah Anda yakin ingin ${isApprove ? "menyetujui" : "menolak"} anggota ini?`;
    popup.classList.remove("hidden");
  });

  // ===== Konfirmasi "Ya" =====
  btnYes.addEventListener("click", async () => {
    if (!currentAction) return;

    const { id, status } = currentAction;

    try {
      const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
      if (error) throw error;

      // Update langsung tanpa reload
      const row = tbody.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.querySelector(".status-cell").textContent = status;
        row.style.opacity = "0.6";
        setTimeout(() => (row.style.display = "none"), 600);
      }

      alert(status === "approved" ? "✅ Anggota disetujui!" : "❌ Anggota ditolak!");
    } catch (err) {
      console.error("❌ Gagal update status:", err);
      alert("Gagal memperbarui status. Silakan coba lagi.");
    } finally {
      popup.classList.add("hidden");
      currentAction = null;
    }
  });

  // ===== Konfirmasi "Batal" =====
  btnNo.addEventListener("click", () => {
    popup.classList.add("hidden");
    currentAction = null;
  });
});
