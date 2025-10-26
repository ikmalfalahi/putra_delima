document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ daftar.js dimuat dan DOM siap");

  const daftarBtn = document.getElementById("daftar-btn");
  console.log("🔍 daftarBtn:", daftarBtn); // <-- log tambahan

  const msg = document.getElementById("msg");

  if (!daftarBtn) {
    console.error("❌ Tombol #daftar-btn tidak ditemukan di halaman!");
    return;
  }

  daftarBtn.addEventListener("click", async () => {
    msg.textContent = "🔄 Mengirim data pendaftaran...";

    const nama = document.getElementById("nama").value.trim();
    const jenis_kelamin = document.getElementById("jenis_kelamin").value;
    const umur = document.getElementById("umur").value;
    const agama = document.getElementById("agama").value.trim();
    const status_hubungan = document.getElementById("status_hubungan").value;
    const blok = document.getElementById("blok").value.trim();
    const rt = document.getElementById("rt").value.trim();
    const rw = document.getElementById("rw").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (
      !nama || !jenis_kelamin || !umur || !agama ||
      !status_hubungan || !blok || !rt || !rw ||
      !email || !password
    ) {
      msg.textContent = "⚠️ Semua kolom wajib diisi.";
      return;
    }

    try {
      // 1️⃣ Daftarkan user di Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama,
            jenis_kelamin,
            umur,
            agama,
            status_hubungan,
            blok,
            rt,
            rw,
            role: "anggota",
            status: "pending",
          },
        },
      });

      if (error) {
        msg.textContent = `❌ Gagal mendaftar: ${error.message}`;
        return;
      }

      msg.textContent = "✅ Pendaftaran berhasil! Tunggu persetujuan admin sebelum login.";
    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Terjadi kesalahan tidak terduga.";
    }
  });
});
