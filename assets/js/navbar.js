// assets/js/navbar.js
document.addEventListener("DOMContentLoaded", async () => {
  // ---------- Smart path detection ----------
  const pathDepth = window.location.pathname.split("/").filter(Boolean).length;
  const navbarPath = pathDepth > 0 ? `${'../'.repeat(pathDepth)}navbar.html` : 'navbar.html';

  // Placeholder harus ada di halaman
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  try {
    const res = await fetch(navbarPath);
    if (!res.ok) throw new Error(`Failed to load navbar (${res.status})`);
    placeholder.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
    placeholder.innerHTML = `<div style="background:#eee;color:#333;padding:12px;text-align:center;">Gagal memuat navbar</div>`;
    return;
  }

  // small wait to ensure DOM nodes inside navbar are available
  await new Promise(r => setTimeout(r, 80));

  // ---------- resolve element references ----------
  const hamburger = document.getElementById("pd-hamburger");
  const navLinks = document.getElementById("pd-navlinks");
  const profileBtn = document.getElementById("pd-profile-btn");
  const dropdown = document.getElementById("pd-dropdown");
  const profileNameEl = document.getElementById("pd-profile-name");
  const profilePhotoEl = document.getElementById("pd-profile-photo");
  const logoutBtn = document.getElementById("pd-logout");
  const dashboardLink = document.getElementById("pd-link-dashboard");

  // ---------- Supabase auth check ----------
  if (!window.supabase) {
    console.warn("Supabase client not found. Navbar will show default user.");
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  // If page is public (index/login), we should not always redirect.
  const publicPages = ["", "index.html", "login.html", "register.html"];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (!user && !publicPages.includes(currentPage)) {
    // if not logged in and not public page, redirect to login (use relative path)
    const loginPath = pathDepth > 0 ? `${'../'.repeat(pathDepth)}login.html` : 'login.html';
    window.location.href = loginPath;
    return;
  }

  // ---------- populate profile data ----------
  if (user) {
    // try to fetch profile row (nama + role)
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("nama, role")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        profileNameEl.textContent = profile.nama || user.email || "User";
        profilePhotoEl.textContent = (profile.nama ? profile.nama[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U"));
        // show dashboard link if admin
        if (profile.role === "admin" && dashboardLink) dashboardLink.classList.remove("hidden");
      } else {
        // fallback to email if profile missing
        profileNameEl.textContent = user.email || "User";
        profilePhotoEl.textContent = (user.email ? user.email[0].toUpperCase() : "U");
      }
    } catch (err) {
      console.warn("Error loading profile:", err.message);
      profileNameEl.textContent = user.email || "User";
      profilePhotoEl.textContent = (user.email ? user.email[0].toUpperCase() : "U");
    }
  }

  // ---------- dropdown toggle ----------
  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains("hidden");
      dropdown.setAttribute("aria-hidden", String(!isHidden));
      profileBtn.setAttribute("aria-expanded", String(isHidden));
      dropdown.classList.toggle("hidden");
    });
    // click outside closes dropdown
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- logout ----------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      const loginPath = pathDepth > 0 ? `${'../'.repeat(pathDepth)}login.html` : 'login.html';
      window.location.href = loginPath;
    });
  }

  // ---------- hamburger responsive ----------
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("show"));
  }

  // ---------- highlight current link ----------
  document.querySelectorAll(".pd-navlinks a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === currentPage) a.classList.add("active");
  });
});
