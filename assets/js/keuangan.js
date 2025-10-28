document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tabel-keuangan");
  const popup = document.getElementById("popup-keuangan");
  const tambahBtn = document.getElementById("tambah-keuangan");
  const simpanBtn = document.getElementById("simpan-keuangan");
  const batalBtn = document.getElementById("batal-keuangan");

  let editId = null;

  // === CEK LOGIN ===
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) return (window.location.href = "login.html");

  // === CEK ROLE (Hanya admin yang boleh akses) ===
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nama")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    alert("⚠️ Akses ditolak! Halaman ini hanya untuk admin.");
    return (window.location.href = "index.html");
  }

  // === FUNGSI RESET FORM ===
  function resetForm() {
    document.getElementById("tanggal").value = "";
    document.getElementById("jenis").value = "";
    document.getElementById("keterangan").value = "";
    document.getElementById("jumlah").value = "";
    editId = null;
  }

  // === LOAD DATA KEUANGAN ===
  async function loadKeuangan() {
    tbody.innerHTML = `<tr><td colspan="6">⏳ Memuat data...</td></tr>`;
    const { data, error } = await supabase
      .from("keuangan")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      tbody.innerHTML = `<tr><td colspan="6">❌ Gagal memuat data.</td></tr>`;
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">📭 Belum ada data keuangan.</td></tr>`;
      hitungRingkasan([]);
      return;
    }

    tbody.innerHTML = data
      .map(
        (d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(d.tanggal).toLocaleDateString("id-ID")}</td>
        <td>${d.jenis}</td>
        <td>${d.keterangan}</td>
        <td>Rp ${Number(d.jumlah).toLocaleString("id-ID")}</td>
        <td>
          <button class="edit" data-id="${d.id}">✏️</button>
          <button class="hapus" data-id="${d.id}">🗑️</button>
        </td>
      </tr>`
      )
      .join("");

    hitungRingkasan(data);
  }

  // === HITUNG TOTAL ===
  function hitungRingkasan(data) {
    let pemasukan = 0,
      pengeluaran = 0;
    data.forEach((d) =>
      d.jenis === "pemasukan"
        ? (pemasukan += d.jumlah)
        : (pengeluaran += d.jumlah)
    );

    document.getElementById("total-pemasukan").textContent =
      "Rp " + pemasukan.toLocaleString("id-ID");
    document.getElementById("total-pengeluaran").textContent =
      "Rp " + pengeluaran.toLocaleString("id-ID");
    document.getElementById("saldo-akhir").textContent =
      "Rp " + (pemasukan - pengeluaran).toLocaleString("id-ID");
  }

  // === TOMBOL TAMBAH / BATAL ===
  tambahBtn.addEventListener("click", () => {
    resetForm();
    popup.classList.remove("hidden");
  });

  batalBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
    resetForm();
  });

  // === SIMPAN DATA ===
  simpanBtn.addEventListener("click", async () => {
    const tanggal = document.getElementById("tanggal").value;
    const jenis = document.getElementById("jenis").value;
    const keterangan = document.getElementById("keterangan").value.trim();
    const jumlah = Number(document.getElementById("jumlah").value);

    if (!tanggal || !jenis || !keterangan || isNaN(jumlah) || jumlah <= 0)
      return alert("⚠️ Lengkapi semua data dengan benar!");

    const formData = { tanggal, jenis, keterangan, jumlah };

    let result;
    if (editId) {
      result = await supabase.from("keuangan").update(formData).eq("id", editId);
    } else {
      result = await supabase.from("keuangan").insert([formData]);
    }

    if (result.error) {
      alert("❌ Gagal menyimpan data!");
      console.error(result.error);
    } else {
      alert("✅ Data berhasil disimpan!");
      popup.classList.add("hidden");
      resetForm();
      loadKeuangan();
    }
  });

  // === EDIT / HAPUS ===
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("edit")) {
      const { data, error } = await supabase
        .from("keuangan")
        .select("*")
        .eq("id", id)
        .single();

      if (error) return alert("❌ Gagal memuat data untuk diedit.");

      document.getElementById("tanggal").value = data.tanggal;
      document.getElementById("jenis").value = data.jenis;
      document.getElementById("keterangan").value = data.keterangan;
      document.getElementById("jumlah").value = data.jumlah;
      editId = id;
      popup.classList.remove("hidden");
    }

    if (e.target.classList.contains("hapus")) {
      if (confirm("🗑️ Hapus data ini?")) {
        const { error } = await supabase.from("keuangan").delete().eq("id", id);
        if (error) alert("❌ Gagal menghapus data.");
        else loadKeuangan();
      }
    }
  });

  // === INISIALISASI ===
  loadKeuangan();
});
