// Script Daftar
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ daftar.js dimuat dan DOM siap");

  const daftarBtn = document.getElementById("daftar-btn");
  const msg = document.getElementById("msg");
  const togglePass = document.getElementById("toggle-pass");
  const passwordInput = document.getElementById("password");

  if (!daftarBtn) return console.error("❌ Tombol #daftar-btn tidak ditemukan!");
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat. Pastikan supabase.js sudah di-load terlebih dahulu.");

  // Toggle password
  if (togglePass && passwordInput) {
    togglePass.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePass.textContent = "Sembunyikan";
      } else {
        passwordInput.type = "password";
        togglePass.textContent = "Tampilkan";
      }
    });
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
    const password = passwordInput.value.trim();

    if (!nama || !jenis_kelamin || !umur || !agama || !status_hubungan || !blok || !rt || !rw || !email || !password) {
      msg.textContent = "⚠️ Semua kolom wajib diisi.";
      return;
    }

    try {
      // 1️⃣ Signup user di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "anggota",
            status: "pending"
          }
        }
      });

      if (authError) {
        msg.textContent = `❌ Gagal mendaftar: ${authError.message}`;
        return;
      }

      const userId = authData.user.id;

      // 2️⃣ Masukkan data ke tabel "anggota"
      const { data: anggotaData, error: anggotaError } = await supabase
        .from("anggota")
        .insert([
          {
            id: userId,
            nama,
            jenis_kelamin,
            umur,
            agama,
            status_hubungan,
            blok,
            rt,
            rw,
            role: "anggota",
            status: "pending"
          }
        ]);

      if (anggotaError) {
        msg.textContent = `❌ Gagal menyimpan data anggota: ${anggotaError.message}`;
        return;
      }

      console.log("✅ Pendaftaran berhasil:", anggotaData);
      msg.textContent = "✅ Pendaftaran berhasil! Mengalihkan ke halaman verifikasi...";

      setTimeout(() => {
        window.location.href = "verifikasi_anggota.html";
      }, 1500);

    } catch (err) {
      console.error(err);
      msg.textContent = "❌ Terjadi kesalahan tidak terduga.";
    }
  });
});
