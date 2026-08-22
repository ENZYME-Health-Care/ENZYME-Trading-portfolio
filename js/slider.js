/**
 * slider.js
 * Brand logo carousel + testimonials auto-slider.
 * Data: data/brands.json, data/testimonials.json
 */

const SliderModule = (() => {
  let testimonialIndex = 0;
  let testimonialTimer = null;
  let testimonials = [];

  async function init() {
    await Promise.all([loadBrands(), loadTestimonials()]);
  }

  /** Partner brands — duplicated track for seamless loop */
  async function loadBrands() {
    const track = document.getElementById("brand-track");
    if (!track) return;

    try {
      const res = await fetch("data/brands.json");
      const brands = await res.json();
      const html = brands
        .map(
          (b) => `
        <div class="flex items-center justify-center shrink-0 px-4" title="${b.name}">
          <img src="${b.logo}" alt="${b.name} logo" class="brand-logo" loading="lazy" width="140" height="48"
               onerror="this.style.opacity='0.3'">
        </div>`
        )
        .join("");

      // Duplicate for infinite scroll
      track.innerHTML = html + html;
    } catch (err) {
      console.error("Failed to load brands:", err);
    }
  }

  /** Testimonials slider */
  async function loadTestimonials() {
    const container = document.getElementById("testimonials-slider");
    const dots = document.getElementById("testimonial-dots");
    if (!container) return;

    try {
      const res = await fetch("data/testimonials.json");
      testimonials = await res.json();

      container.innerHTML = testimonials
        .map(
          (t, i) => `
        <div class="testimonial-slide ${i === 0 ? "active" : ""}" data-index="${i}">
          <div class="max-w-3xl mx-auto text-center px-1 sm:px-4 min-w-0">
            <div class="flex justify-center mb-6">
              <img src="${t.photo}" alt="${t.name}"
                   class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                   width="80" height="80" loading="lazy"
                   onerror="this.src='assets/images/testimonial-1.svg'">
            </div>
            <div class="text-cyan-400 mb-4 text-lg">
              <i class="fa-solid fa-quote-left"></i>
            </div>
            <p class="text-base sm:text-lg md:text-xl leading-relaxed mb-6" style="color:var(--text)">${t.review}</p>
            <h4 class="font-semibold text-base sm:text-lg" style="font-family:Outfit,sans-serif">${t.name}</h4>
            <p class="text-sm mt-1" style="color:var(--text-muted)">${t.designation} — ${t.company}</p>
          </div>
        </div>`
        )
        .join("");

      if (dots) {
        dots.innerHTML = testimonials
          .map(
            (_, i) =>
              `<button type="button" class="w-2.5 h-2.5 rounded-full transition-all ${
                i === 0 ? "bg-[var(--primary)] w-6" : "bg-gray-300"
              }" data-dot="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
          )
          .join("");

        dots.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-dot]");
          if (!btn) return;
          goTo(Number(btn.dataset.dot));
          restartAutoplay();
        });
      }

      document.getElementById("testimonial-prev")?.addEventListener("click", () => {
        goTo(testimonialIndex - 1);
        restartAutoplay();
      });
      document.getElementById("testimonial-next")?.addEventListener("click", () => {
        goTo(testimonialIndex + 1);
        restartAutoplay();
      });

      startAutoplay();
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    }
  }

  function goTo(index) {
    if (!testimonials.length) return;
    testimonialIndex = (index + testimonials.length) % testimonials.length;

    document.querySelectorAll(".testimonial-slide").forEach((slide, i) => {
      slide.classList.toggle("active", i === testimonialIndex);
    });

    document.querySelectorAll("#testimonial-dots [data-dot]").forEach((dot, i) => {
      const active = i === testimonialIndex;
      dot.className = `w-2.5 h-2.5 rounded-full transition-all ${
        active ? "bg-[var(--primary)] w-6" : "bg-gray-300"
      }`;
    });
  }

  function startAutoplay() {
    stopAutoplay();
    testimonialTimer = setInterval(() => goTo(testimonialIndex + 1), 5500);
  }

  function stopAutoplay() {
    if (testimonialTimer) clearInterval(testimonialTimer);
  }

  function restartAutoplay() {
    startAutoplay();
  }

  return { init };
})();
