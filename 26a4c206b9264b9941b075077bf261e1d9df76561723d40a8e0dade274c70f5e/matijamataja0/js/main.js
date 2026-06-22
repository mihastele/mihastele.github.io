/* ============================================================
   main.js — language toggle, carousel, countdown, pillars
   ============================================================ */

(function () {
  "use strict";

  let lang = localStorage.getItem("lms-lang") || "sl";

  /* ---------- i18n helpers ---------- */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.sl || obj.en || "";
  }

  function applyStaticTranslations() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-sl], [data-en]").forEach((el) => {
      const val = el.getAttribute("data-" + lang);
      if (val != null) el.textContent = val;
    });
    const toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.querySelector(".lang-active").textContent = lang.toUpperCase();
      toggle.querySelector(".lang-other").textContent = lang === "sl" ? "EN" : "SL";
    }
  }

  /* ---------- Vision pillars ---------- */
  function renderPillars() {
    const wrap = document.getElementById("pillars");
    if (!wrap) return;
    wrap.innerHTML = "";
    visionPillars.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "pillar";
      const icon = pillarIcons[p.icon] || "";
      card.innerHTML = `
        <span class="pillar__icon" aria-hidden="true">${icon}</span>
        <h3>${t(p.title)}</h3>
        <p>${t(p.text)}</p>
      `;
      card.style.opacity = "0";
      card.style.transform = "translateY(14px)";
      card.style.transition = `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`;
      wrap.appendChild(card);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        });
      });
    });
  }

  /* ---------- Carousel ---------- */
  const carousel = {
    track: null,
    slides: [],
    dots: [],
    dotsWrap: null,
    index: 0,
    timer: null,
    delay: 6500
  };

  function initCarousel() {
    carousel.track = document.getElementById("carouselTrack");
    carousel.dotsWrap = document.getElementById("carouselDots");
    if (!carousel.track) return;
    carousel.slides = Array.from(carousel.track.querySelectorAll(".slide"));
    if (carousel.slides.length === 0) return;

    buildDots();
    update();

    document.getElementById("nextBtn").addEventListener("click", () => go(carousel.index + 1, true));
    document.getElementById("prevBtn").addEventListener("click", () => go(carousel.index - 1, true));

    carousel.track.addEventListener("mouseenter", pauseAuto);
    carousel.track.addEventListener("mouseleave", startAuto);

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(carousel.index - 1, true);
      if (e.key === "ArrowRight") go(carousel.index + 1, true);
    });

    let touchX = 0;
    carousel.track.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; pauseAuto(); }, { passive: true });
    carousel.track.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (dx > 50) go(carousel.index - 1, true);
      else if (dx < -50) go(carousel.index + 1, true);
      startAuto();
    }, { passive: true });

    startAuto();
  }

  function buildDots() {
    carousel.dotsWrap.innerHTML = "";
    carousel.dots = carousel.slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel__dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `${i + 1}`);
      dot.addEventListener("click", () => go(i, true));
      carousel.dotsWrap.appendChild(dot);
      return dot;
    });
  }

  function go(next, manual) {
    const n = carousel.slides.length;
    carousel.index = (next % n + n) % n;
    update();
    if (manual) startAuto();
  }

  function update() {
    carousel.track.style.transform = `translateX(-${carousel.index * 100}%)`;
    carousel.slides.forEach((s, i) => s.classList.toggle("is-active", i === carousel.index));
    carousel.dots.forEach((d, i) => d.classList.toggle("is-active", i === carousel.index));
  }

  function startAuto() {
    pauseAuto();
    carousel.timer = setInterval(() => go(carousel.index + 1), carousel.delay);
  }
  function pauseAuto() {
    if (carousel.timer) { clearInterval(carousel.timer); carousel.timer = null; }
  }

  /* ---------- Countdown ---------- */
  function tickCountdown() {
    const els = {
      d: document.getElementById("cdDays"),
      h: document.getElementById("cdHours"),
      m: document.getElementById("cdMins"),
      s: document.getElementById("cdSecs")
    };
    let diff = ELECTION_DATE - new Date();
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.d) els.d.textContent = String(d).padStart(2, "0");
    if (els.h) els.h.textContent = String(h).padStart(2, "0");
    if (els.m) els.m.textContent = String(m).padStart(2, "0");
    if (els.s) els.s.textContent = String(s).padStart(2, "0");
  }

  /* ---------- Language toggle ---------- */
  function setLang(next) {
    lang = next;
    localStorage.setItem("lms-lang", lang);
    applyStaticTranslations();
    renderPillars();
  }

  function init() {
    applyStaticTranslations();
    renderPillars();
    initCarousel();
    tickCountdown();
    setInterval(tickCountdown, 1000);

    const toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.addEventListener("click", () => setLang(lang === "sl" ? "en" : "sl"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
