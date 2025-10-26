// === Accordion ===
const accBtns = document.querySelectorAll(".accordion-btn");
accBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const content = btn.nextElementSibling;
    content.style.display = content.style.display === "block" ? "none" : "block";
  });
});

// === Filter Galeri ===
const filterBtns = document.querySelectorAll(".filter-btns button");
const items = document.querySelectorAll(".gallery-item");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    items.forEach(item => {
      if (filter === "all" || item.dataset.category === filter) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});
