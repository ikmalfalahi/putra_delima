document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("iuran-table");
  const buktiPopup = document.getElementById("bukti-popup");
  const buktiImg = document.getElementById("bukti-img");
  const closePopup = document.getElementById("close-popup");
  const logoutBtn = document.getElementById("logout-btn");

  // === CEK LOGIN ===
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) return (window.location.href = "login.html");

  // === CEK ROLE (jika admin, arahkan ke admin page) ===
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nama")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return (window.location.href = "admin.html");
  }

  // === RENDER LOADING STATE ===
  tbody.innerHTML = `<tr><td colspan="4">⏳ Memuat data iuran...</td></tr>`;

  // === AMBIL DATA IURAN ===
  const { data: iuranList, error } = await supabase
    .from("iuran")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="4">❌ Gagal memuat data.</td></tr>`;
    console.error(error);
    return;
  }

  if (!iuranList || iuranList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">📭 Belum ada data iuran.</td></tr>`;
    return;
  }

  // === RENDER TABEL ===
  tbody.innerHTML = "";
  iuranList.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.nama || "-"}</td>
      <td class="bukti-cell" data-img="${item.bukti || ""}" style="cursor:pointer; color:#0ea5e9;">
        ${item.bulan}
      </td>
      <td>${item.status}</td>
    `;
    tbody.appendChild(tr);
  });

  // === TAMPILKAN GAMBAR BUKTI ===
  tbody.addEventListener("click", (e) => {
    if (e.target.classList.contains("bukti-cell")) {
      const imgSrc = e.target.dataset.img;
      if (!imgSrc) {
        alert("⚠️ Bukti pembayaran belum diunggah.");
        return;
      }
      buktiImg.src = imgSrc;
      buktiPopup.classList.remove("hidden");
    }
  });

  // === TUTUP POPUP ===
  if (closePopup) {
    closePopup.addEventListener("click", () => {
      buktiPopup.classList.add("hidden");
      buktiImg.src = "";
    });
  }

  // === LOGOUT ===
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }
});
