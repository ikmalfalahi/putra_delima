document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("anggota-body");

  async function loadAnggota() {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) return console.error(error);

    tbody.innerHTML = data.map((a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nama}</td>
        <td>${a.jenis_kelamin}</td>
        <td>${a.umur}</td>
        <td>${a.agama}</td>
        <td>${a.status}</td>
        <td>Blok ${a.blok}, RT ${a.rt}/RW ${a.rw}</td>
        <td>
          ${a.status === "pending" ? `
            <button class="approve" data-id="${a.id}">✅ Approve</button>
            <button class="reject" data-id="${a.id}">❌ Reject</button>
          ` : "-"}
        </td>
      </tr>
    `).join("");
  }

  loadAnggota();

  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("approve")) {
      await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
      alert("Anggota disetujui!");
      loadAnggota();
    }
    if (e.target.classList.contains("reject")) {
      await supabase.from("profiles").update({ status: "rejected" }).eq("id", id);
      alert("Anggota ditolak!");
      loadAnggota();
    }
  });
});
