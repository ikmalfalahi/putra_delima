document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  const tbody = document.getElementById("keuangan-body");
  const popup = document.getElementById("popup-form");
  const addBtn = document.getElementById("add-transaksi");
  const refreshBtn = document.getElementById("refresh-keuangan");
  const saveBtn = document.getElementById("save-data");
  const cancelBtn = document.getElementById("cancel");
  const logoutBtn = document.getElementById("logout-btn");

  let editId = null;

  // === Load Data ===
  async function loadData() {
    const { data, error } = await supabase.from("keuangan").select("*").order("id", { ascending: true });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="6">Gagal memuat data.</td></tr>`;
      return;
    }

    let totalPemasukan = 0, totalPengeluaran = 0;
    tbody.innerHTML = "";
    data.forEach((row, i) => {
      if (row.jenis === "pemasukan") totalPemasukan += row.jumlah;
      else totalPengeluaran += row.jumlah;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${row.tanggal}</td>
        <td>${row.jenis}</td>
        <td>${row.keterangan}</td>
        <td>Rp ${row.jumlah.toLocaleString()}</td>
        <td>
          <button class="edit-btn" data-id="${row.id}">✏️</button>
          <button class="del-btn" data-id="${row.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("total-pemasukan").textContent = `Rp ${totalPemasukan.toLocaleString()}`;
    document.getElementById("total-pengeluaran").textContent = `Rp ${totalPengeluaran.toLocaleString()}`;
    document.getElementById("saldo-akhir").textContent = `Rp ${(totalPemasukan - totalPengeluaran).toLocaleString()}`;
  }

  loadData();

  // === Add/Edit Transaksi ===
  addBtn.addEventListener("click", () => {
    editId = null;
    popup.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => popup.classList.add("hidden"));

  saveBtn.addEventListener("click", async () => {
    const tanggal = document.getElementById("tanggal").value;
    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();
    const jumlah = Number(document.getElementById("jumlah").value);

    if (!tanggal || !jenis || !keterangan || !jumlah) return alert("Lengkapi semua data!");

    const data = { tanggal, jenis, keterangan, jumlah };

    if (editId) {
      await supabase.from("keuangan").update(data).eq("id", editId);
    } else {
      await supabase.from("keuangan").insert([data]);
    }

    popup.classList.add("hidden");
    loadData();
  });

  // === Edit & Hapus ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("edit-btn")) {
      const { data } = await supabase.from("keuangan").select("*").eq("id", id).single();
      document.getElementById("tanggal").value = data.tanggal;
      document.getElementById("jenis").value = data.jenis;
      document.getElementById("keterangan").value = data.keterangan;
      document.getElementById("jumlah").value = data.jumlah;
      editId = id;
      popup.classList.remove("hidden");
    }

    if (e.target.classList.contains("del-btn")) {
      if (confirm("Hapus data ini?")) {
        await supabase.from("keuangan").delete().eq("id", id);
        loadData();
      }
    }
  });

  // === Refresh ===
  refreshBtn.addEventListener("click", loadData);

  // === Logout ===
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
});
