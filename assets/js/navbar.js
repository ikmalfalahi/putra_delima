// assets/js/navbar.js
document.addEventListener("DOMContentLoaded", async () => {
  // --- Path fix untuk GitHub Pages ---
  const basePath = window.location.pathname.includes("/putra_delima/")
    ? "/putra_delima/"
    : "/";
  const navbarPath = `${basePath}navbar.html`;

  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    const res = await fetch(navbarPath);
    if (!res.ok) throw new Error(`Navbar gagal dimuat (${res.status})`);
    placeholder.innerHTML = await res.text();
  } catch (err) {
    console.error("❌ Navbar load error:", err);
    placeholder.innerHTML =
      `<div style="background:#eee;color:#333;padding:12px;text-align:center;">Navbar gagal dimuat</div>`;
    return;
  }

  // Tunggu navbar terpasang ke DOM
  await new Promise((r) => setTimeout(r, 80));

  // ===== Ambil Elemen =====
  const hamburger = document.getElementById("pd-hamburger");
  const navLinks = document.getElementById("pd-navlinks");
  const profileBtn = document.getElementById("pd-profile-btn");
  const dropdown = document.getElementById("pd-dropdown");
  const profileNameEl = document.getElementById("pd-profile-name");
  const profilePhotoEl = document.getElementById("pd-profile-photo");
  const logoutBtn = document.getElementById("pd-logout");
  const dashboardLink = document.getElementById("pd-link-dashboard");
  const profileLink = document.getElementById("pd-link-profil");

  // ===== Cek Supabase Client =====
  if (!window.supabase) {
    console.warn("⚠️ Supabase client belum dimuat!");
    return;
  }

  // ===== Cek User Login =====
  const { data: { user }, error } = await supabase.auth.getUser();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const publicPages = ["", "index.html", "login.html", "register.html"];

  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = `${basePath}login.html`;
    return;
  }

  // ===== Jika user login, tampilkan profil =====
  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nama, role, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const namaUser = profile?.nama || user.email || "User";
      const initial = namaUser.charAt(0).toUpperCase();

      profileNameEl.textContent = namaUser;

      // === Avatar ===
      if (profile?.avatar_url) {
        profilePhotoEl.src = profile.avatar_url;
      } else {
        profilePhotoEl.src = `${basePath}assets/img/default-avatar.png`;
        profilePhotoEl.alt = initial;
      }

      // === Atur link profil sesuai role ===
      if (profile?.role === "admin") {
        profileLink.href = `${basePath}profil_admin.html`;
        dashboardLink.classList.remove("hidden");
      } else {
        profileLink.href = `${basePath}profil_anggota.html`;
        dashboardLink.classList.add("hidden");
      }

    } catch (err) {
      console.warn("⚠️ Gagal ambil data profil:", err.message);
      profileNameEl.textContent = user.email || "User";
      profilePhotoEl.src = `${basePath}assets/img/default-avatar.png`;
    }
  }

  // ===== Dropdown Profil =====
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
      const expanded = !dropdown.classList.contains("hidden");
      profileBtn.setAttribute("aria-expanded", expanded);
      dropdown.setAttribute("aria-hidden", !expanded);
    });

    // Tutup dropdown saat klik di luar
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ===== Logout =====
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      alert("Anda telah logout.");
      window.location.href = `${basePath}login.html`;
    });
  }

  // ===== Hamburger (Responsif) =====
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      dropdown.classList.add("hidden"); // Tutup dropdown saat buka menu
    });
  }

  // ===== Highlight Link Aktif =====
  document.querySelectorAll(".pd-navlinks a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) link.classList.add("active");
  });
});
