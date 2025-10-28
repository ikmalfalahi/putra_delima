document.addEventListener("DOMContentLoaded", async () => {
  // Pastikan Supabase tersedia
  if (!window.supabase) {
    console.error("❌ Supabase client belum dimuat.");
    return;
  }

  // === Cek User Login ===
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("❌ Gagal ambil user:", authError);
    return;
  }
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // === Ambil Elemen DOM ===
  const profileCard = document.querySelector(".profile-card");
  const editCard = document.querySelector(".edit-card");

  if (!profileCard || !editCard) {
    console.error("❌ Elemen profil atau edit-card tidak ditemukan di HTML.");
    return;
  }

  const fields = {
    nama: document.getElementById("nama"),
    email: document.getElementById("email"),
    jenis_kelamin: document.getElementById("jenis_kelamin"),
    umur: document.getElementById("umur"),
    agama: document.getElementById("agama"),
    status_hubungan: document.getElementById("status_hubungan"),
    alamat: document.getElementById("alamat"),
    role: document.getElementById("role"),
    status: document.getElementById("status"),
  };

  const inputFields = {
    nama: document.getElementById("input-nama"),
    jenis_kelamin: document.getElementById("input-jenis_kelamin"),
    umur: document.getElementById("input-umur"),
    agama: document.getElementById("input-agama"),
    status_hubungan: document.getElementById("input-status_hubungan"),
    blok: document.getElementById("input-blok"),
    rt: document.getElementById("input-rt"),
    rw: document.getElementById("input-rw"),
  };

  // === Ambil Data Profil ===
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("❌ Gagal ambil profil:", error);
    alert("Gagal memuat profil. Silakan coba lagi.");
    return;
  }

  // === Tampilkan Data ke Profil ===
  const setText = (el, val) => { if (el) el.textContent = val || "-"; };

  setText(fields.nama, profile.nama);
  setText(fields.email, user.email);
  setText(fields.jenis_kelamin, profile.jenis_kelamin);
  setText(fields.umur, profile.umur);
  setText(fields.agama, profile.agama);
  setText(fields.status_hubungan, profile.status_hubungan);
  setText(fields.alamat, `Blok ${profile.blok || "-"}, RT ${profile.rt || "-"}, RW ${profile.rw || "-"}`);
  setText(fields.role, profile.role);
  setText(fields.status, profile.status);

  // === Logout Button ===
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }

  // === Tombol Edit Profil ===
  const editBtn = document.getElementById("edit-profile");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      profileCard.style.display = "none";
      editCard.style.display = "block";

      // Isi form dengan data saat ini
      inputFields.nama.value = profile.nama || "";
      inputFields.jenis_kelamin.value = profile.jenis_kelamin || "";
      inputFields.umur.value = profile.umur || "";
      inputFields.agama.value = profile.agama || "";
      inputFields.status_hubungan.value = profile.status_hubungan || "";
      inputFields.blok.value = profile.blok || "";
      inputFields.rt.value = profile.rt || "";
      inputFields.rw.value = profile.rw || "";
    });
  }

  // === Tombol Batal Edit ===
  const cancelBtn = document.getElementById("cancel-edit");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      editCard.style.display = "none";
      profileCard.style.display = "block";
    });
  }

  // === Submit Edit Profil ===
  const formEdit = document.getElementById("form-edit-profile");
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
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) {
        console.error(updateError);
        alert("❌ Gagal memperbarui profil: " + updateError.message);
        return;
      }

      alert("✅ Profil berhasil diperbarui!");
      Object.assign(profile, updates);

      // Perbarui tampilan data profil
      setText(fields.nama, profile.nama);
      setText(fields.jenis_kelamin, profile.jenis_kelamin);
      setText(fields.umur, profile.umur);
      setText(fields.agama, profile.agama);
      setText(fields.status_hubungan, profile.status_hubungan);
      setText(fields.alamat, `Blok ${profile.blok || "-"}, RT ${profile.rt || "-"}, RW ${profile.rw || "-"}`);

      editCard.style.display = "none";
      profileCard.style.display = "block";
    });
  }
});
