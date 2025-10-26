document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    alert("Akses ditolak! Halaman ini hanya untuk admin.");
    window.location.href = "anggota.html";
    return;
  }

  // ... lanjut script admin.js seperti biasa
});

  const tbody = document.getElementById("admin-table-body");
  const addBtn = document.getElementById("add-data");
  const popup = document.getElementById("popup-form");
  const saveBtn = document.getElementById("save-data");
  const cancelBtn = document.getElementById("cancel");
  const logoutBtn = document.getElementById("logout-btn");

  let editId = null;

  // === Cek user admin ===
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile.role !== "admin") {
    alert("Akses ditolak!");
    window.location.href = "anggota.html";
    return;
  }

  // === Fungsi ambil data iuran ===
  async function loadData() {
    tbody.innerHTML = "";
    const mobileContainer = document.getElementById("admin-table-body");

mobileContainer.innerHTML = ""; // bersihkan sebelum isi ulang
data.forEach((row, i) => {
  // versi tabel (sudah ada)
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

  // versi card untuk mobile
  const card = document.createElement("div");
  card.className = "data-card";
  card.innerHTML = `
    <h3>${row.nama}</h3>
    <p><strong>Bulan:</strong> ${row.bulan}</p>
    <p><strong>Status:</strong> ${row.status}</p>
    <p><strong>Bukti:</strong> ${row.bukti ? `<a href="${row.bukti}" target="_blank">📎 Lihat</a>` : "-"}</p>
    <div class="actions">
      <button class="edit-btn" data-id="${row.id}">Edit</button>
      <button class="del-btn" data-id="${row.id}">Hapus</button>
    </div>
  `;
  mobileContainer.appendChild(card);
});

  }

  loadData();

  async function loadDashboard() {
  const { data, error } = await supabase.from("iuran").select("*");
  if (error) return console.error(error);

  const totalAnggota = new Set(data.map(d => d.user_id)).size;
  const totalLunas = data.filter(d => d.status === "Lunas").length;
  const totalBelum = data.filter(d => d.status === "Belum Lunas").length;
  const totalIuran = totalLunas * 50000; // misalnya Rp50.000 per bulan

  document.getElementById("total-anggota").textContent = totalAnggota;
  document.getElementById("total-lunas").textContent = totalLunas;
  document.getElementById("total-belum").textContent = totalBelum;
  document.getElementById("total-dana").textContent = `Rp ${totalIuran.toLocaleString()}`;
}

// panggil setelah loadData()
loadDashboard();

  // === Tambah data ===
  addBtn.addEventListener("click", () => {
    editId = null;
    popup.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  saveBtn.addEventListener("click", async () => {
    const nama = document.getElementById("nama").value.trim();
    const bulan = document.getElementById("bulan").value;
    const buktiFile = document.getElementById("bukti").files[0];
    const status = document.getElementById("status").value;

    if (!nama || !bulan) return alert("Lengkapi semua data!");

    let buktiUrl = null;
    if (buktiFile) {
      const filePath = `${Date.now()}_${buktiFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("bukti_iuran")
        .upload(filePath, buktiFile);

      if (uploadError) return alert("Gagal upload bukti!");
      const { data: publicUrl } = supabase.storage
        .from("bukti_iuran")
        .getPublicUrl(filePath);
      buktiUrl = publicUrl.publicUrl;
    }

    if (editId) {
      await supabase.from("iuran").update({ nama, bulan, bukti: buktiUrl, status }).eq("id", editId);
    } else {
      await supabase.from("iuran").insert([{ nama, bulan, bukti: buktiUrl, status }]);
    }

    popup.classList.add("hidden");
    loadData();
  });

  // === Edit dan Hapus ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("edit-btn")) {
      editId = id;
      popup.classList.remove("hidden");
    }
    if (e.target.classList.contains("del-btn")) {
      if (confirm("Hapus data ini?")) {
        await supabase.from("iuran").delete().eq("id", id);
        loadData();
      }
    }
  });

  // === Logout ===
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
});
