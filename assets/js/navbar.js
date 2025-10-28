// assets/js/navbar.js
document.addEventListener("DOMContentLoaded", async () => {
  // Tunggu navbar.html selesai dimuat
  await new Promise(resolve => setTimeout(resolve, 300));

  // === Supabase Auth Check ===
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // === Navbar Logic ===
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const logoutBtn = document.getElementById("logout-btn");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

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
