/**
 * app.js — Main application bootstrap for ENZYME Trading website
 * Handles: loader, navbar, dark mode, animations, counters, categories,
 * team, FAQ, forms, floating UI, and section orchestration.
 *
 * Customize company info in COMPANY_CONFIG below.
 */

const COMPANY_CONFIG = {
  name: "ENZYME Trading",
  tagline: "Latest Healthcare Technology",
  email: "Enzymetrading05@gmail.com",
  phone: "+880 1889 147550", // Replace with your real number
  whatsapp: "8801889147550", // Country code + number, no + or spaces
  website: "https://enzymetrading.com", // Replace when live
  address: "Flat# B05, House#75, Road#13, Sector#10, Uttara Model Town, Dhaka-1230, Bangladesh",
};

/* Shared utilities exposed for other modules */
window.AppUtils = {
  observeReveals(nodes) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((el) => observer.observe(el));
  },
};

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initNavbar();
  initDarkMode();
  initScrollProgress();
  initBackToTop();
  initRippleButtons();
  initRevealAnimations();
  initCounters();
  initCategories();
  initTeam();
  initFAQ();
  initContactForm();
  initNewsletter();
  initSmoothScroll();
  initMobileMenu();
  updateDynamicContact();

  // Modular features
  if (typeof ProductsModule !== "undefined") ProductsModule.init();
  if (typeof GalleryModule !== "undefined") GalleryModule.init();
  if (typeof SliderModule !== "undefined") SliderModule.init();

  // Modal close handlers
  document.getElementById("product-modal-close")?.addEventListener("click", () => {
    ProductsModule.closeModal();
  });
  document.getElementById("product-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "product-modal") ProductsModule.closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ProductsModule?.closeModal();
  });
});

/* ----- Loading screen ----- */
function initLoader() {
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    setTimeout(() => loader?.classList.add("hidden"), 400);
  });
  // Fallback if load already fired
  setTimeout(() => loader?.classList.add("hidden"), 2500);
}

/* ----- Sticky navbar ----- */
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add("nav-solid");
      nav.classList.remove("nav-transparent");
    } else {
      nav.classList.add("nav-transparent");
      nav.classList.remove("nav-solid");
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Active section highlight
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link[href^='#']");

  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    },
    { passive: true }
  );
}

/* ----- Dark mode ----- */
function initDarkMode() {
  const toggle = document.getElementById("dark-toggle");
  const stored = localStorage.getItem("enzyme-theme");

  if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }

  updateDarkIcon();

  toggle?.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem(
      "enzyme-theme",
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
    updateDarkIcon();
  });
}

function updateDarkIcon() {
  const icon = document.querySelector("#dark-toggle i");
  if (!icon) return;
  const isDark = document.documentElement.classList.contains("dark");
  icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

/* ----- Scroll progress ----- */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    () => {
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      bar.style.width = `${scrolled}%`;
    },
    { passive: true }
  );
}

/* ----- Back to top ----- */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 500);
    },
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ----- Button ripple ----- */
function initRippleButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

/* ----- Reveal animations ----- */
function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  window.AppUtils.observeReveals(reveals);
}

/* ----- Animated counters ----- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = Number(el.dataset.count) || 0;
  const suffix = el.dataset.suffix || "";
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }

  requestAnimationFrame(tick);
}

/* ----- Product categories from JSON ----- */
async function initCategories() {
  const grid = document.getElementById("categories-grid");
  if (!grid) return;

  try {
    const res = await fetch("data/categories.json");
    const categories = await res.json();

    grid.innerHTML = categories
      .map(
        (c, i) => `
      <article class="card reveal fade-up delay-${(i % 4) + 1}">
        <div class="card-img-wrap">
          <img src="${c.image}" alt="${c.name}" loading="lazy" width="400" height="250"
               onerror="this.src='assets/images/category-lab.svg'">
        </div>
        <div class="p-5">
          <h3 class="text-lg font-semibold mb-2" style="font-family:Outfit,sans-serif">${c.name}</h3>
          <p class="text-sm leading-relaxed mb-4" style="color:var(--text-muted)">${c.description}</p>
          <a href="#products" class="text-sm font-semibold inline-flex items-center gap-2" style="color:var(--primary)">
            View Products <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>
      </article>`
      )
      .join("");

    window.AppUtils.observeReveals(grid.querySelectorAll(".reveal"));
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
}

/* ----- Management team from JSON ----- */
async function initTeam() {
  const grid = document.getElementById("team-grid");
  if (!grid) return;

  try {
    const res = await fetch("data/team.json");
    const team = await res.json();

    grid.innerHTML = team
      .map(
        (m, i) => `
      <article class="card text-center reveal fade-up delay-${(i % 4) + 1}">
        <div class="pt-6 px-6">
          <img src="${m.photo}" alt="${m.name}"
               class="w-28 h-28 mx-auto rounded-full object-cover border-4 shadow-md"
               style="border-color:var(--bg-muted)"
               width="112" height="112" loading="lazy"
               onerror="this.src='assets/images/team-ceo.svg'">
        </div>
        <div class="p-5">
          <h3 class="font-semibold text-lg" style="font-family:Outfit,sans-serif">${m.name}</h3>
          <p class="text-sm mt-1 mb-1" style="color:var(--primary)">${m.designation}</p>
          <p class="text-xs mb-4" style="color:var(--text-muted)">${m.role}</p>
          <div class="flex justify-center gap-3">
            <a href="${m.linkedin || "#"}" class="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
               style="background:var(--bg-muted);color:var(--primary)" aria-label="LinkedIn">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="mailto:${m.email || COMPANY_CONFIG.email}" class="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
               style="background:var(--bg-muted);color:var(--primary)" aria-label="Email">
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
        </div>
      </article>`
      )
      .join("");

    window.AppUtils.observeReveals(grid.querySelectorAll(".reveal"));
  } catch (err) {
    console.error("Failed to load team:", err);
  }
}

/* ----- FAQ accordion from JSON ----- */
async function initFAQ() {
  const list = document.getElementById("faq-list");
  if (!list) return;

  try {
    const res = await fetch("data/faq.json");
    const faqs = await res.json();

    list.innerHTML = faqs
      .map(
        (f, i) => `
      <div class="faq-item ${i === 0 ? "open" : ""} reveal fade-up">
        <button type="button" class="faq-question" aria-expanded="${i === 0}">
          <span>${f.question}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="faq-answer">${f.answer}</div>
      </div>`
      )
      .join("");

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-question");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      list.querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("open");
        el.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    window.AppUtils.observeReveals(list.querySelectorAll(".reveal"));
  } catch (err) {
    console.error("Failed to load FAQ:", err);
  }
}

/* ----- Contact form (client-side only — wire to backend later) ----- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email || !data.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    // Placeholder: open mailto — replace with API endpoint when ready
    const subject = encodeURIComponent(`Enquiry from ${data.name} — ${data.subject || "Website"}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "N/A"}\n\n${data.message}`
    );
    window.location.href = `mailto:${COMPANY_CONFIG.email}?subject=${subject}&body=${body}`;
    showToast("Opening your email client… Thank you for contacting us!", "success");
    form.reset();
  });
}

function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = new FormData(form).get("email");
    if (!email) return;
    showToast("Thank you for subscribing to our newsletter!", "success");
    form.reset();
  });
}

function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText =
      "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:3000;padding:0.85rem 1.5rem;border-radius:9999px;color:#fff;font-size:0.9rem;font-weight:500;box-shadow:0 8px 30px rgba(0,0,0,0.2);transition:opacity 0.3s;max-width:90vw;text-align:center";
    document.body.appendChild(toast);
  }
  toast.style.background = type === "error" ? "#DC2626" : "#059669";
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3200);
}

/* ----- Smooth scroll for anchor links ----- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("mobile-menu")?.classList.remove("open");
      document.getElementById("mobile-overlay")?.classList.add("hidden");
      document.body.style.overflow = "";
    });
  });
}

/* ----- Mobile menu ----- */
function initMobileMenu() {
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const closeBtn = document.getElementById("mobile-close");

  const open = () => {
    menu?.classList.add("open");
    overlay?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    menu?.classList.remove("open");
    overlay?.classList.add("hidden");
    document.body.style.overflow = "";
  };

  toggle?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1280) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ----- Sync contact links from config ----- */
function updateDynamicContact() {
  document.querySelectorAll("[data-company-email]").forEach((el) => {
    if (el.tagName === "A") el.href = `mailto:${COMPANY_CONFIG.email}`;
    if (!el.dataset.keepText) el.textContent = COMPANY_CONFIG.email;
  });
  document.querySelectorAll("[data-company-phone]").forEach((el) => {
    if (el.tagName === "A") el.href = `tel:${COMPANY_CONFIG.phone.replace(/\s/g, "")}`;
  });
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    if (el.tagName === "A") {
      el.href = `https://wa.me/${COMPANY_CONFIG.whatsapp}`;
    }
  });
}
