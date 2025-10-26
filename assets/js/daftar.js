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
    const umurStr = document.getElementById("umur").value.trim();
    const agama = document.getElementById("agama").value.trim();
    const status_hubungan = document.getElementById("status_hubungan").value;
    const blok = document.getElementById("blok").value.trim();
    const rt = document.getElementById("rt").value.trim();
    const rw = document.getElementById("rw").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    // Validasi semua field wajib
    if (!nama || !jenis_kelamin || !umurStr || !agama || !status_hubungan || !blok || !rt || !rw || !email || !password) {
      msg.textContent = "⚠️ Semua kolom wajib diisi.";
      return;
    }

    // Validasi email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      msg.textContent = "⚠️ Email tidak valid.";
      return;
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      msg.textContent = "⚠️ Kata sandi minimal 6 karakter.";
      return;
    }

    // Validasi umur angka
    const umur = parseInt(umurStr);
    if (isNaN(umur) || umur <= 0) {
      msg.textContent = "⚠️ Umur harus angka positif.";
      return;
    }

    try {
      // 1️⃣ Signup user (trigger handle_new_user otomatis buat row kosong)
      const { data: userData, error: signupError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signupError) {
        msg.textContent = `❌ Gagal mendaftar: ${signupError.message}`;
        return;
      }

      const userId = userData.user.id;

      // 2️⃣ Update profil dengan data lengkap
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nama,
          jenis_kelamin,
          umur,
          agama,
          status_hubungan,
          blok,
          rt,
          rw
        })
        .eq("id", userId);

      if (profileError) {
        msg.textContent = `❌ Gagal menyimpan profil: ${profileError.message}`;
        return;
      }

      console.log("✅ Pendaftaran & profil berhasil:", userId);
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
