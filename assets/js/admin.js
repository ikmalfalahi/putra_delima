document.addEventListener("DOMContentLoaded", async () => {
  // === Element References ===
  const tbody = document.getElementById("admin-table-body");
  const addBtn = document.getElementById("add-data");
  const popup = document.getElementById("popup-form");
  const saveBtn = document.getElementById("save-data");
  const cancelBtn = document.getElementById("cancel");
  const refreshBtn = document.getElementById("refresh-data");

  let editId = null;

  // === Pastikan user admin ===
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    alert("⚠️ Akses ditolak! Halaman ini hanya untuk admin.");
    window.location.href = "anggota.html";
    return;
  }

  // === Fungsi Ambil Data Iuran ===
  async function loadData() {
    const { data, error } = await supabase
      .from("iuran")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      tbody.innerHTML = `<tr><td colspan="6">❌ Gagal memuat data.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    const mobileContainer = document.getElementById("admin-table-body");
    mobileContainer.innerHTML = "";

    data.forEach((row, i) => {
      // === Versi tabel (desktop) ===
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

      // === Versi card (mobile) ===
      const card = document.createElement("div");
      card.className = "data-card";
      card.innerHTML = `
        <h3>${row.nama}</h3>
        <p><strong>Bulan:</strong> ${row.bulan}</p>
        <p><strong>Status:</strong> ${row.status}</p>
        <p><strong>Bukti:</strong> ${
          row.bukti ? `<a href="${row.bukti}" target="_blank">📎 Lihat</a>` : "-"
        }</p>
        <div class="actions">
          <button class="edit-btn" data-id="${row.id}">Edit</button>
          <button class="del-btn" data-id="${row.id}">Hapus</button>
        </div>
      `;
      mobileContainer.appendChild(card);
    });

    loadDashboard(data);
  }

  // === Fungsi Dashboard ===
  function loadDashboard(data) {
    const totalAnggota = new Set(data.map(d => d.nama)).size;
    const totalLunas = data.filter(d => d.status === "Lunas").length;
    const totalBelum = data.filter(d => d.status === "Belum Lunas").length;
    const totalIuran = totalLunas * 50000; // contoh nominal tetap

    document.getElementById("total-anggota").textContent = totalAnggota;
    document.getElementById("total-lunas").textContent = totalLunas;
    document.getElementById("total-belum").textContent = totalBelum;
    document.getElementById("total-dana").textContent = `Rp ${totalIuran.toLocaleString("id-ID")}`;
  }

  loadData();

  // === Tambah/Edit Data ===
  addBtn.addEventListener("click", () => {
    editId = null;
    popup.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => popup.classList.add("hidden"));

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
      const filePath = `${Date.now()}_${buktiFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
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
    loadData();
  });

  // === Edit / Hapus ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("edit-btn")) {
      editId = id;
      popup.classList.remove("hidden");
    }

    if (e.target.classList.contains("del-btn")) {
      if (confirm("🗑️ Hapus data ini?")) {
        await supabase.from("iuran").delete().eq("id", id);
        loadData();
      }
    }
  });

  // === Refresh ===
  refreshBtn.addEventListener("click", loadData);
});
