/**
 * products.js
 * Product listing: search, category filter, pagination, and details modal.
 * Data source: data/products.json
 * Edit PRODUCTS_PER_PAGE below to change pagination size.
 */

const ProductsModule = (() => {
  const PRODUCTS_PER_PAGE = 6;

  let allProducts = [];
  let filtered = [];
  let currentPage = 1;
  let currentCategory = "all";
  let searchQuery = "";

  const grid = () => document.getElementById("products-grid");
  const pagination = () => document.getElementById("products-pagination");
  const searchInput = () => document.getElementById("product-search");
  const filterWrap = () => document.getElementById("product-filters");
  const countEl = () => document.getElementById("products-count");

  /** Load products from JSON */
  async function init() {
    try {
      const res = await fetch("data/products.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data = await res.json();
      // Support array or { products: [...] }
      allProducts = Array.isArray(data) ? data : data.products || [];
      if (!allProducts.length) throw new Error("Product list is empty");
      filtered = [...allProducts];
      renderFilters();
      bindEvents();
      render();
    } catch (err) {
      console.error("Failed to load products:", err);
      if (grid()) {
        grid().innerHTML =
          '<p class="text-center text-gray-500 col-span-full py-12">Unable to load products. Please check data/products.json</p>';
      }
    }
  }

  /** Build category filter buttons from unique categories */
  function renderFilters() {
    const wrap = filterWrap();
    if (!wrap) return;

    const categories = [...new Set(allProducts.map((p) => p.category))];
    wrap.innerHTML = `
      <button type="button" class="filter-btn active" data-category="all">All</button>
      ${categories
        .map(
          (c) =>
            `<button type="button" class="filter-btn" data-category="${escapeAttr(c)}">${escapeHtml(c)}</button>`
        )
        .join("")}
    `;
  }

  function bindEvents() {
    filterWrap()?.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterWrap().querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      currentPage = 1;
      applyFilters();
    });

    searchInput()?.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      currentPage = 1;
      applyFilters();
    });

    pagination()?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      currentPage = Number(btn.dataset.page);
      render();
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    grid()?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-product-id]");
      if (!btn) return;
      const id = Number(btn.dataset.productId);
      const product = allProducts.find((p) => p.id === id);
      if (product) openModal(product);
    });
  }

  function applyFilters() {
    filtered = allProducts.filter((p) => {
      const matchCat = currentCategory === "all" || p.category === currentCategory;
      const q = searchQuery;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
    render();
  }

  function render() {
    const el = grid();
    if (!el) return;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageItems = filtered.slice(start, start + PRODUCTS_PER_PAGE);

    if (countEl()) {
      countEl().textContent =
        filtered.length === 0
          ? "No products found"
          : `Showing ${start + 1}–${start + pageItems.length} of ${filtered.length} products`;
    }

    if (pageItems.length === 0) {
      el.innerHTML =
        '<p class="text-center text-gray-500 col-span-full py-16">No products match your search. Try another keyword or category.</p>';
    } else {
      el.innerHTML = pageItems.map(cardHTML).join("");
      // Dynamically injected cards must be visible immediately (reveal starts at opacity:0)
      el.querySelectorAll(".reveal").forEach((node) => node.classList.add("visible"));
    }

    renderPagination(totalPages);
  }

  function cardHTML(p) {
    return `
      <article class="card product-card">
        <div class="card-img-wrap">
          <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" width="400" height="250"
               onerror="this.src='assets/images/product-1.svg'">
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="badge">${escapeHtml(p.category)}</span>
            <span class="text-xs text-gray-400">${escapeHtml(p.brand)}</span>
          </div>
          <h3 class="text-lg font-semibold mb-2" style="font-family:Outfit,sans-serif">${escapeHtml(p.name)}</h3>
          <p class="text-sm mb-4" style="color:var(--text-muted);line-height:1.6">${escapeHtml(p.description)}</p>
          <button type="button" class="btn btn-outline w-full text-sm py-2.5" data-product-id="${p.id}">
            View Details <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </article>
    `;
  }

  function renderPagination(totalPages) {
    const el = pagination();
    if (!el) return;
    if (totalPages <= 1) {
      el.innerHTML = "";
      return;
    }

    let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous">
      <i class="fa-solid fa-chevron-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next">
      <i class="fa-solid fa-chevron-right"></i>
    </button>`;

    el.innerHTML = html;
  }

  /** Product details modal */
  function openModal(p) {
    const overlay = document.getElementById("product-modal");
    const body = document.getElementById("product-modal-body");
    if (!overlay || !body) return;

    body.innerHTML = `
      <div class="grid md:grid-cols-2 gap-0">
        <div class="bg-gray-100 dark:bg-gray-800">
          <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" class="w-full h-full object-cover min-h-[260px]"
               onerror="this.src='assets/images/product-1.svg'">
        </div>
        <div class="p-6 md:p-8">
          <span class="badge mb-3">${escapeHtml(p.category)}</span>
          <h3 class="text-2xl font-semibold mb-2" style="font-family:Outfit,sans-serif">${escapeHtml(p.name)}</h3>
          <p class="text-sm mb-1" style="color:var(--text-muted)">Brand: <strong>${escapeHtml(p.brand)}</strong></p>
          <p class="my-4 leading-relaxed" style="color:var(--text-muted)">${escapeHtml(p.description)}</p>
          <div class="p-4 rounded-xl mb-5" style="background:var(--bg-soft)">
            <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color:var(--primary)">Specifications</p>
            <p class="text-sm" style="color:var(--text-muted)">${escapeHtml(p.specification || "Specifications available on request.")}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="${escapeAttr(p.catalog || "assets/catalog/brochure.pdf")}" class="btn btn-primary text-sm" download>
              <i class="fa-solid fa-download"></i> Download Specs
            </a>
            <a href="#contact" class="btn btn-outline text-sm" onclick="document.getElementById('product-modal').classList.remove('open')">
              Request Quote
            </a>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    document.getElementById("product-modal")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  return { init, closeModal, openModal };
})();
