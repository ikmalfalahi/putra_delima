document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tabel-keuangan");
  const popup = document.getElementById("popup-keuangan");
  const tambahBtn = document.getElementById("tambah-keuangan");
  const simpanBtn = document.getElementById("simpan-keuangan");
  const batalBtn = document.getElementById("batal-keuangan");

  let editId = null;

  // === Load Data Keuangan ===
  async function loadKeuangan() {
    const { data, error } = await supabase.from("keuangan").select("*").order("tanggal", { ascending: false });
    if (error) return (tbody.innerHTML = `<tr><td colspan="6">❌ Gagal memuat data.</td></tr>`);

    tbody.innerHTML = data.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(d.tanggal).toLocaleDateString("id-ID")}</td>
        <td>${d.jenis}</td>
        <td>${d.keterangan}</td>
        <td>${d.jumlah.toLocaleString("id-ID")}</td>
        <td>
          <button class="edit" data-id="${d.id}">✏️</button>
          <button class="hapus" data-id="${d.id}">🗑️</button>
        </td>
      </tr>
    `).join("");

    hitungRingkasan(data);
  }

  loadKeuangan();

  // === Hitung Total ===
  function hitungRingkasan(data) {
    let pemasukan = 0, pengeluaran = 0;
    data.forEach(d => d.jenis === "pemasukan" ? pemasukan += d.jumlah : pengeluaran += d.jumlah);
    document.getElementById("total-pemasukan").textContent = "Rp " + pemasukan.toLocaleString("id-ID");
    document.getElementById("total-pengeluaran").textContent = "Rp " + pengeluaran.toLocaleString("id-ID");
    document.getElementById("saldo-akhir").textContent = "Rp " + (pemasukan - pengeluaran).toLocaleString("id-ID");
  }

  // === Tambah/Edit ===
  tambahBtn.addEventListener("click", () => popup.classList.remove("hidden"));
  batalBtn.addEventListener("click", () => popup.classList.add("hidden"));

  simpanBtn.addEventListener("click", async () => {
    const tanggal = document.getElementById("tanggal").value;
    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value;
    const jumlah = Number(document.getElementById("jumlah").value);

    if (!tanggal || !jenis || !keterangan || !jumlah) return alert("Lengkapi semua data!");

    const formData = { tanggal, jenis, keterangan, jumlah };

    if (editId) {
      await supabase.from("keuangan").update(formData).eq("id", editId);
    } else {
      await supabase.from("keuangan").insert([formData]);
    }

    popup.classList.add("hidden");
    loadKeuangan();
  });

  // === Edit / Hapus ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("edit")) {
      const { data } = await supabase.from("keuangan").select("*").eq("id", id).single();
      document.getElementById("tanggal").value = data.tanggal;
      document.getElementById("jenis").value = data.jenis;
      document.getElementById("keterangan").value = data.keterangan;
      document.getElementById("jumlah").value = data.jumlah;
      editId = id;
      popup.classList.remove("hidden");
    }

    if (e.target.classList.contains("hapus")) {
      if (confirm("Hapus data ini?")) {
        await supabase.from("keuangan").delete().eq("id", id);
        loadKeuangan();
      }
    }
  });
});
