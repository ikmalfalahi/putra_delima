document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) return console.error("❌ Supabase client belum dimuat.");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return (window.location.href = "login.html");

  const profileCard = document.querySelector(".profile-card");
  const editCard = document.querySelector(".edit-card");

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

  // Ambil data profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return console.error("❌ Gagal ambil profil:", error);

  // Tampilkan data
  fields.nama.textContent = data.nama || "-";
  fields.email.textContent = user.email;
  fields.jenis_kelamin.textContent = data.jenis_kelamin || "-";
  fields.umur.textContent = data.umur || "-";
  fields.agama.textContent = data.agama || "-";
  fields.status_hubungan.textContent = data.status_hubungan || "-";
  fields.alamat.textContent = `Blok ${data.blok || "-"}, RT ${data.rt || "-"}, RW ${data.rw || "-"}`;
  fields.role.textContent = data.role || "-";
  fields.status.textContent = data.status || "-";

  // Logout
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

  // Tombol edit
  document.getElementById("edit-profile").addEventListener("click", () => {
    profileCard.style.display = "none";
    editCard.style.display = "block";

    // Isi form edit dengan data saat ini
    inputFields.nama.value = data.nama || "";
    inputFields.jenis_kelamin.value = data.jenis_kelamin || "";
    inputFields.umur.value = data.umur || "";
    inputFields.agama.value = data.agama || "";
    inputFields.status_hubungan.value = data.status_hubungan || "";
    inputFields.blok.value = data.blok || "";
    inputFields.rt.value = data.rt || "";
    inputFields.rw.value = data.rw || "";
  });

  // Tombol batal
  document.getElementById("cancel-edit").addEventListener("click", () => {
    editCard.style.display = "none";
    profileCard.style.display = "block";
  });

  // Submit form edit
  document.getElementById("form-edit-profile").addEventListener("submit", async (e) => {
    e.preventDefault();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        nama: inputFields.nama.value,
        jenis_kelamin: inputFields.jenis_kelamin.value,
        umur: inputFields.umur.value,
        agama: inputFields.agama.value,
        status_hubungan: inputFields.status_hubungan.value,
        blok: inputFields.blok.value,
        rt: inputFields.rt.value,
        rw: inputFields.rw.value
      })
      .eq("id", user.id);

    if (updateError) return alert("❌ Gagal update profil: " + updateError.message);

    alert("✅ Profil berhasil diperbarui!");

    // Refresh tampilan profil
    fields.nama.textContent = inputFields.nama.value || "-";
    fields.jenis_kelamin.textContent = inputFields.jenis_kelamin.value || "-";
    fields.umur.textContent = inputFields.umur.value || "-";
    fields.agama.textContent = inputFields.agama.value || "-";
    fields.status_hubungan.textContent = inputFields.status_hubungan.value || "-";
    fields.alamat.textContent = `Blok ${inputFields.blok.value || "-"}, RT ${inputFields.rt.value || "-"}, RW ${inputFields.rw.value || "-"}`;

    editCard.style.display = "none";
    profileCard.style.display = "block";
  });
});
