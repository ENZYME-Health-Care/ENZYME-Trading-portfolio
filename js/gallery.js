/**
 * gallery.js
 * Gallery grid with category filtering and lightbox viewer.
 * Data source: data/gallery.json
 */

const GalleryModule = (() => {
  let items = [];
  let currentFilter = "all";

  const grid = () => document.getElementById("gallery-grid");
  const filters = () => document.getElementById("gallery-filters");

  async function init() {
    try {
      const res = await fetch("data/gallery.json");
      items = await res.json();
      renderFilters();
      bindEvents();
      render();
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  }

  function renderFilters() {
    const wrap = filters();
    if (!wrap) return;
    const cats = [...new Set(items.map((i) => i.category))];
    wrap.innerHTML = `
      <button type="button" class="filter-btn active" data-gallery="all">All</button>
      ${cats
        .map(
          (c) =>
            `<button type="button" class="filter-btn" data-gallery="${c}">${c}</button>`
        )
        .join("")}
    `;
  }

  function bindEvents() {
    filters()?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-gallery]");
      if (!btn) return;
      filters().querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.gallery;
      render();
    });

    grid()?.addEventListener("click", (e) => {
      const item = e.target.closest("[data-lightbox]");
      if (!item) return;
      openLightbox(item.dataset.lightbox, item.dataset.title || "");
    });

    document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
    document.getElementById("lightbox")?.addEventListener("click", (e) => {
      if (e.target.id === "lightbox") closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  function render() {
    const el = grid();
    if (!el) return;

    const list =
      currentFilter === "all"
        ? items
        : items.filter((i) => i.category === currentFilter);

    el.innerHTML = list
      .map(
        (item) => `
      <button type="button"
        class="card group relative overflow-hidden reveal zoom cursor-pointer text-left border-0 p-0"
        data-lightbox="${item.image}"
        data-title="${item.title}"
        aria-label="View ${item.title}">
        <div class="card-img-wrap aspect-[4/3]">
          <img src="${item.image}" alt="${item.title}" loading="lazy" width="400" height="300"
               onerror="this.src='assets/images/gallery-product-1.svg'">
          <div class="gallery-caption absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
            <span class="text-white text-sm font-semibold line-clamp-2">${item.title}</span>
            <span class="text-cyan-200 text-xs">${item.category}</span>
          </div>
        </div>
      </button>
    `
      )
      .join("");

    // Re-observe new reveal elements
    if (window.AppUtils?.observeReveals) {
      window.AppUtils.observeReveals(el.querySelectorAll(".reveal"));
    }
  }

  function openLightbox(src, title) {
    const box = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const caption = document.getElementById("lightbox-caption");
    if (!box || !img) return;
    img.src = src;
    img.alt = title;
    if (caption) caption.textContent = title;
    box.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    document.getElementById("lightbox")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  return { init, closeLightbox };
})();
