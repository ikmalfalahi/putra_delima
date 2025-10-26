document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat.");

  const tbody = document.getElementById("anggota-body");

  const popup = document.getElementById("confirm-popup");
  const confirmText = document.getElementById("confirm-text");
  const btnYes = document.getElementById("confirm-yes");
  const btnNo = document.getElementById("confirm-no");

  let currentAction = null; // { id, status }

  // ===== Fungsi load anggota pending =====
  async function loadAnggota() {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">🔄 Memuat data...</td></tr>`;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="9">❌ Gagal memuat data.</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9">Tidak ada anggota baru.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nama || "-"}</td>
        <td>${a.jenis_kelamin || "-"}</td>
        <td>${a.umur || "-"}</td>
        <td>${a.agama || "-"}</td>
        <td>${a.status_hubungan || "-"}</td>
        <td>Blok ${a.blok || "-"}, RT ${a.rt || "-"}, RW ${a.rw || "-"}</td>
        <td>${a.status}</td>
        <td>
          <button class="approve" data-id="${a.id}">✅ Approve</button>
          <button class="reject" data-id="${a.id}">❌ Reject</button>
        </td>
      </tr>
    `).join("");
  }

  // ===== Initial load =====
  await loadAnggota();

  // ===== Handle tombol Approve / Reject =====
  tbody.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    let status;
    if (e.target.classList.contains("approve")) status = "approved";
    if (e.target.classList.contains("reject")) status = "rejected";
    if (!status) return;

    // Set current action
    currentAction = { id, status };
    confirmText.textContent = `Apakah Anda yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} anggota ini?`;
    popup.classList.remove("hidden");
  });

  // ===== Popup tombol YA =====
  btnYes.addEventListener("click", async () => {
    if (!currentAction) return;
    const { id, status } = currentAction;

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", id);

    if (error) alert("❌ Gagal update status: " + error.message);
    else alert(status === "approved" ? "✅ Anggota disetujui!" : "❌ Anggota ditolak!");

    popup.classList.add("hidden");
    currentAction = null;
    await loadAnggota();
  });

  // ===== Popup tombol BATAL =====
  btnNo.addEventListener("click", () => {
    popup.classList.add("hidden");
    currentAction = null;
  });
});
