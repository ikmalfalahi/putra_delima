// assets/js/navbar.js
document.addEventListener("DOMContentLoaded", async () => {
  // === Cek Auth ===
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // === Navbar Responsive ===
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const logoutBtn = document.getElementById("logout-btn");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // === Logout ===
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

  // === Highlight Halaman Aktif ===
  const current = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
});
