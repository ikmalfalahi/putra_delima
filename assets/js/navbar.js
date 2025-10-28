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
  
  // Tunggu DOM navbar siap
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
    const loginPath = pathDepth > 0 ? `${'../'.repeat(pathDepth)}login.html` : "login.html";
    window.location.href = loginPath;
    return;
  }

  // ===== Tampilkan Profil User =====
  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nama, role")
        .eq("id", user.id)
        .single();

      const userNama = profile?.nama || user.email || "User";
      const initial = userNama.charAt(0).toUpperCase();

      profileNameEl.textContent = userNama;
      profilePhotoEl.textContent = initial;

      if (profile?.role === "admin" && dashboardLink)
        dashboardLink.classList.remove("hidden");
    } catch (err) {
      console.warn("⚠️ Gagal ambil profil:", err.message);
      const fallback = user.email || "User";
      profileNameEl.textContent = fallback;
      profilePhotoEl.textContent = fallback.charAt(0).toUpperCase();
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

    // Tutup dropdown di luar klik
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
      const loginPath = pathDepth > 0 ? `${'../'.repeat(pathDepth)}login.html` : "login.html";
      window.location.href = loginPath;
    });
  }

  // ===== Hamburger (Responsif) =====
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      dropdown.classList.add("hidden"); // tutup dropdown saat toggle menu
    });
  }

  // ===== Highlight Link Aktif =====
  document.querySelectorAll(".pd-navlinks a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) link.classList.add("active");
  });
});
