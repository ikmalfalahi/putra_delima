document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("iuran-table");
  const buktiPopup = document.getElementById("bukti-popup");
  const buktiImg = document.getElementById("bukti-img");
  const closePopup = document.getElementById("close-popup");
  const logoutBtn = document.getElementById("logout-btn");

  // Ambil user login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  // Ambil data iuran dari Supabase
  const { data: iuranList, error } = await supabase
    .from("iuran")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  // Render tabel iuran
  iuranList.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nama}</td>
      <td class="bulan-cell" data-img="${item.bukti}">${item.bulan}</td>
      <td>${item.status}</td>
    `;
    tbody.appendChild(tr);
  });

  // Klik bulan → tampilkan bukti
  tbody.addEventListener("click", e => {
    if (e.target.classList.contains("bulan-cell")) {
      buktiImg.src = e.target.dataset.img;
      buktiPopup.classList.remove("hidden");
    }
  });

  closePopup.addEventListener("click", () => {
    buktiPopup.classList.add("hidden");
  });

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
});
