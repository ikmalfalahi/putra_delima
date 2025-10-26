// assets/js/daftar.js
document.addEventListener("DOMContentLoaded", () => {
  const daftarBtn = document.getElementById("daftar-btn");
  const msg = document.getElementById("msg");
  const togglePass = document.getElementById("toggle-pass");
  const passwordInput = document.getElementById("password");

  if (!daftarBtn) return console.error("❌ Tombol #daftar-btn tidak ditemukan!");
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat.");

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
      // Signup user → trigger handle_new_user() otomatis insert ke profiles
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
            status: "pending"
          }
        }
      });

      if (error) {
        msg.textContent = `❌ Gagal mendaftar: ${error.message}`;
        return;
      }

      console.log("✅ Pendaftaran berhasil:", data);
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
