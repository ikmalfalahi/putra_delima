// assets/js/profil.js
document.addEventListener("DOMContentLoaded", async () => {
  // === Pastikan Supabase Sudah Ada ===
  if (!window.supabase) {
    console.error("❌ Supabase client belum dimuat.");
    alert("Gagal memuat Supabase. Muat ulang halaman.");
    return;
  }

  // === Cek Status Login ===
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.warn("🔒 User belum login, alihkan ke login.html");
    window.location.href = "login.html";
    return;
  }

  // === Ambil Elemen DOM ===
  const profileCard = document.querySelector(".profile-card");
  const editCard = document.querySelector(".edit-card");
  if (!profileCard || !editCard) {
    console.error("❌ Struktur HTML profil tidak lengkap.");
    return;
  }

  const fieldIds = ["nama","email","jenis_kelamin","umur","agama","status_hubungan","alamat","role","status"];
  const fields = Object.fromEntries(fieldIds.map(id => [id, document.getElementById(id)]));

  const inputIds = ["nama","jenis_kelamin","umur","agama","status_hubungan","blok","rt","rw"];
  const inputFields = Object.fromEntries(inputIds.map(id => [id, document.getElementById(`input-${id}`)]));

  const logoutBtn = document.getElementById("logout-btn");
  const editBtn = document.getElementById("edit-profile");
  const cancelBtn = document.getElementById("cancel-edit");
  const formEdit = document.getElementById("form-edit-profile");

  // === Ambil Data Profil dari Supabase ===
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("❌ Gagal ambil profil:", profileError);
    alert("Gagal memuat profil. Silakan coba lagi.");
    return;
  }

  // === Fungsi Helper ===
  const setText = (el, val) => el && (el.textContent = val ?? "-");
  const setValue = (el, val) => el && (el.value = val ?? "");

  const updateProfileView = (data) => {
    setText(fields.nama, data.nama);
    setText(fields.email, user.email);
    setText(fields.jenis_kelamin, data.jenis_kelamin);
    setText(fields.umur, data.umur);
    setText(fields.agama, data.agama);
    setText(fields.status_hubungan, data.status_hubungan);
    setText(fields.alamat, `Blok ${data.blok || "-"}, RT ${data.rt || "-"}, RW ${data.rw || "-"}`);
    setText(fields.role, data.role);
    setText(fields.status, data.status);
  };

  // === Render Profil ===
  updateProfileView(profile);

  // === Logout ===
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

  // === Masuk Mode Edit ===
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      profileCard.classList.add("hidden");
      editCard.classList.remove("hidden");
      Object.entries(inputFields).forEach(([key, el]) => setValue(el, profile[key]));
    });
  }

  // === Batal Edit ===
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      editCard.classList.add("hidden");
      profileCard.classList.remove("hidden");
    });
  }

  // === Simpan Perubahan ===
  if (formEdit) {
    formEdit.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updates = {
        nama: inputFields.nama.value.trim(),
        jenis_kelamin: inputFields.jenis_kelamin.value.trim(),
        umur: Number(inputFields.umur.value) || null,
        agama: inputFields.agama.value.trim(),
        status_hubungan: inputFields.status_hubungan.value.trim(),
        blok: inputFields.blok.value.trim(),
        rt: inputFields.rt.value.trim(),
        rw: inputFields.rw.value.trim(),
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ Update gagal:", updateError.message);
        alert("❌ Gagal memperbarui profil!");
        return;
      }

      Object.assign(profile, updates);
      updateProfileView(profile);

      editCard.classList.add("hidden");
      profileCard.classList.remove("hidden");
      alert("✅ Profil berhasil diperbarui!");
    });
  }
});
