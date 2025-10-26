document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("login-btn");
  const msg = document.getElementById("login-msg");
  const togglePass = document.getElementById("toggle-pass");

  // === Toggle password visibility ===
  togglePass.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
  });

  // === Login Supabase ===
  loginBtn.addEventListener("click", async () => {
    msg.textContent = "🔄 Sedang masuk...";
    
    // 1️⃣ Login ke Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      msg.textContent = "❌ Email atau password salah!";
      return;
    }

    // 2️⃣ Ambil data profile dari tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      msg.textContent = "⚠️ Data profil tidak ditemukan!";
      await supabase.auth.signOut();
      return;
    }

    // 3️⃣ Cek status verifikasi
    if (profile.status !== "approved") {
      msg.textContent = "⏳ Akun kamu masih menunggu persetujuan admin.";
      await supabase.auth.signOut();
      return;
    }

    // 4️⃣ Jika sudah disetujui → arahkan sesuai role
    msg.textContent = "✅ Login berhasil!";
    setTimeout(() => {
      if (profile.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "anggota.html";
      }
    }, 1000);
  });
});
