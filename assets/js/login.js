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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      msg.textContent = "❌ Email atau password salah!";
      return;
    }

    // Cek role user
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

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
