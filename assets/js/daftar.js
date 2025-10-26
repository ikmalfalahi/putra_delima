document.addEventListener("DOMContentLoaded", () => {
  const daftarBtn = document.getElementById("daftar-btn");
  const msg = document.getElementById("msg");

  daftarBtn.addEventListener("click", async () => {
    msg.textContent = "🔄 Mengirim data pendaftaran...";

    const nama = document.getElementById("nama").value.trim();
    const jenis_kelamin = document.getElementById("jenis_kelamin").value;
    const umur = document.getElementById("umur").value;
    const agama = document.getElementById("agama").value.trim();
    const status_hubungan = document.getEledocument.addEventListener("DOMContentLoaded", async () => {
  const daftarBtn = document.getElementById("daftar-btn");
  const msg = document.getElementById("msg");

  if (!daftarBtn) {
    console.error("❌ Tombol #daftar-btn tidak ditemukan!");
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

    if (!nama || !jenis_kelamin || !umur || !agama || !status_hubungan || !blok || !rt || !rw || !email || !password) {
      msg.textContent = "⚠️ Semua kolom wajib diisi.";
      return;
    }

    try {
      // 🔐 1️⃣ Daftarkan user di Supabase Auth
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
mentById("status_hubungan").value;
    const blok = document.getElementById("blok").value.trim();
    const rt = document.getElementById("rt").value.trim();
    const rw = document.getElementById("rw").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nama || !jenis_kelamin || !umur || !agama || !status_hubungan || !blok || !rt || !rw || !email || !password) {
      msg.textContent = "⚠️ Semua kolom wajib diisi.";
      return;
    }

    // 1️⃣ Buat akun di Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      msg.textContent = `❌ Gagal mendaftar: ${error.message}`;
      return;
    }

    // 2️⃣ Simpan profil ke tabel `profiles`
    const user = data.user;
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: user.id,
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

    if (insertError) {
      msg.textContent = "⚠️ Gagal menyimpan profil: " + insertError.message;
      return;
    }

    msg.textContent = "✅ Pendaftaran berhasil! Tunggu persetujuan admin sebelum login.";
  });
});
