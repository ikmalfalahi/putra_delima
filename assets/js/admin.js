document.addEventListener("DOMContentLoaded", async () => {
  // === ELEMENT REFERENSI ===
  const tbody = document.getElementById("admin-table-body");
  const addBtn = document.getElementById("add-data");
  const popup = document.getElementById("popup-form");
  const saveBtn = document.getElementById("save-data");
  const cancelBtn = document.getElementById("cancel");
  const refreshBtn = document.getElementById("refresh-data");

  let editId = null;

  // === CEK AUTENTIKASI DAN ROLE ADMIN ===
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    alert("⚠️ Akses ditolak! Halaman ini hanya untuk admin.");
    return (window.location.href = "anggota.html");
  }

  // === FUNGSI LOAD DATA ===
  async function loadData() {
    tbody.innerHTML = `<tr><td colspan="6">⏳ Memuat data...</td></tr>`;
    const { data, error } = await supabase
      .from("iuran")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) {
      tbody.innerHTML = `<tr><td colspan="6">❌ Gagal memuat data.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    data.forEach((row, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${row.nama}</td>
        <td>${row.bulan}</td>
        <td>${row.bukti ? `<a href="${row.bukti}" target="_blank">📎</a>` : "-"}</td>
        <td>${row.status}</td>
        <td>
          <button class="edit-btn" data-id="${row.id}">✏️</button>
          <button class="del-btn" data-id="${row.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    updateDashboard(data);
  }

  // === DASHBOARD SUMMARY ===
  function updateDashboard(data) {
    const totalAnggota = new Set(data.map(d => d.nama)).size;
    const totalLunas = data.filter(d => d.status === "Lunas").length;
    const totalBelum = data.filter(d => d.status === "Belum Lunas").length;
    const totalIuran = totalLunas * 50000; // contoh nominal tetap

    document.getElementById("total-anggota").textContent = totalAnggota;
    document.getElementById("total-lunas").textContent = totalLunas;
    document.getElementById("total-belum").textContent = totalBelum;
    document.getElementById("total-dana").textContent = `Rp ${totalIuran.toLocaleString("id-ID")}`;
  }

  await loadData();

  // === TAMBAH DATA ===
  addBtn.addEventListener("click", () => {
    editId = null;
    popup.classList.remove("hidden");
    document.getElementById("nama").value = "";
    document.getElementById("bulan").value = "";
    document.getElementById("status").value = "Belum Lunas";
    document.getElementById("bukti").value = "";
  });

  cancelBtn.addEventListener("click", () => popup.classList.add("hidden"));

  // === SIMPAN DATA (TAMBAH / EDIT) ===
  saveBtn.addEventListener("click", async () => {
    const nama = document.getElementById("nama").value.trim();
    const bulan = document.getElementById("bulan").value;
    const buktiFile = document.getElementById("bukti").files[0];
    const status = document.getElementById("status").value;

    if (!nama || !bulan) {
      alert("⚠️ Lengkapi semua data!");
      return;
    }

    let buktiUrl = null;
    if (buktiFile) {
      if (!buktiFile.type.startsWith("image/")) {
        return alert("❌ Hanya file gambar yang diizinkan.");
      }
      if (buktiFile.size > 2 * 1024 * 1024) {
        return alert("❌ Ukuran file maksimal 2MB.");
      }

      const filePath = `${Date.now()}_${buktiFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("bukti_iuran")
        .upload(filePath, buktiFile);

      if (uploadError) {
        alert("❌ Gagal upload bukti!");
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("bukti_iuran")
        .getPublicUrl(filePath);
      buktiUrl = publicUrl.publicUrl;
    }

    const formData = { nama, bulan, bukti: buktiUrl, status };

    if (editId) {
      await supabase.from("iuran").update(formData).eq("id", editId);
    } else {
      await supabase.from("iuran").insert([formData]);
    }

    popup.classList.add("hidden");
    await loadData();
  });

  // === EDIT / HAPUS ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      editId = id;
      const { data: row } = await supabase
        .from("iuran")
        .select("*")
        .eq("id", id)
        .single();

      if (!row) return alert("Data tidak ditemukan.");
      popup.classList.remove("hidden");
      document.getElementById("nama").value = row.nama;
      document.getElementById("bulan").value = row.bulan;
      document.getElementById("status").value = row.status;
    }

    if (e.target.classList.contains("del-btn")) {
      if (confirm("🗑️ Hapus data ini?")) {
        await supabase.from("iuran").delete().eq("id", id);
        await loadData();
      }
    }
  });

  // === REFRESH ===
  if (refreshBtn) refreshBtn.addEventListener("click", loadData);
});
