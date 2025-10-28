document.addEventListener("DOMContentLoaded", () => {
  // === Accordion ===
  const accBtns = document.querySelectorAll(".accordion-btn");
  accBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const content = btn.nextElementSibling;

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.style.opacity = 0;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.opacity = 1;
      }
    });
  });

  // === Filter Galeri ===
  const filterBtns = document.querySelectorAll(".filter-btns button");
  const items = document.querySelectorAll(".gallery-item");

  if (filterBtns.length > 0 && items.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        // aktifkan tombol yang dipilih
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        items.forEach(item => {
          const match = filter === "all" || item.dataset.category === filter;
          item.style.transition = "opacity 0.3s ease";
          item.style.opacity = match ? "1" : "0";
          setTimeout(() => {
            item.style.display = match ? "block" : "none";
          }, match ? 0 : 300);
        });
      });
    });
  }
});
