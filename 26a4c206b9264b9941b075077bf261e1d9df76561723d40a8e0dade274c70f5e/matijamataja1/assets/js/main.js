/* =========================================================
   main.js — carousel, people + program rendering, a11y controls
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Accessibility settings (persisted) ---------- */
  var A11Y = {
    fontSize: parseFloat(document.documentElement.getAttribute("data-font-size") || "1"),
    contrast: document.documentElement.getAttribute("data-contrast") || "normal",
    fontType: document.documentElement.getAttribute("data-font") || "default",
    motion:   document.documentElement.getAttribute("data-motion") || "on"
  };

  var FONT_STEPS = [0.85, 1, 1.15, 1.3, 1.45];
  var LS = { fontSize:"kamnik-font-size", contrast:"kamnik-contrast", fontType:"kamnik-font", motion:"kamnik-motion" };

  function loadA11y() {
    try {
      var fs = localStorage.getItem(LS.fontSize);
      if (fs) A11Y.fontSize = parseFloat(fs);
      if (localStorage.getItem(LS.contrast)) A11Y.contrast = localStorage.getItem(LS.contrast);
      if (localStorage.getItem(LS.fontType)) A11Y.fontType = localStorage.getItem(LS.fontType);
      if (localStorage.getItem(LS.motion))   A11Y.motion   = localStorage.getItem(LS.motion);
    } catch (e) {}
    applyA11y();
  }

  function applyA11y() {
    var html = document.documentElement;
    html.setAttribute("data-font-size", String(A11Y.fontSize));
    html.setAttribute("data-contrast", A11Y.contrast);
    html.setAttribute("data-font", A11Y.fontType);
    html.setAttribute("data-motion", A11Y.motion);
    setPressed("contrast-btn", A11Y.contrast, "data-contrast");
    setPressed("font-type-btn", A11Y.fontType, "data-font-type");
    setPressed("motion-btn", A11Y.motion, "data-motion");
  }

  function setPressed(className, value, attr) {
    var btns = document.querySelectorAll("." + className);
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", String(btns[i].getAttribute(attr) === value));
    }
  }

  function saveA11y() {
    try {
      localStorage.setItem(LS.fontSize, String(A11Y.fontSize));
      localStorage.setItem(LS.contrast, A11Y.contrast);
      localStorage.setItem(LS.fontType, A11Y.fontType);
      localStorage.setItem(LS.motion, A11Y.motion);
    } catch (e) {}
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.hidden = true; }, 220);
    }, 2200);
  }

  /* ---------- Accessibility panel ---------- */
  function initA11yPanel() {
    var toggle = document.getElementById("a11yToggle");
    var panel = document.getElementById("a11yPanel");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      if (!open) { var f = panel.querySelector("button"); if (f) f.focus(); }
    });

    document.addEventListener("click", function (e) {
      if (panel.hidden) return;
      if (!panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        toggle.setAttribute("aria-expanded", "false"); panel.hidden = true;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        toggle.setAttribute("aria-expanded", "false"); panel.hidden = true; toggle.focus();
      }
    });

    function bind(selector, handler) {
      var b = panel.querySelectorAll(selector);
      for (var i = 0; i < b.length; i++) b[i].addEventListener("click", handler);
    }

    bind(".font-btn", function () {
      var action = this.getAttribute("data-font-action");
      var idx = FONT_STEPS.indexOf(A11Y.fontSize); if (idx === -1) idx = 1;
      if (action === "increase" && idx < FONT_STEPS.length - 1) idx++;
      else if (action === "decrease" && idx > 0) idx--;
      else if (action === "reset") idx = 1;
      A11Y.fontSize = FONT_STEPS[idx]; applyA11y(); saveA11y();
      toast(window.i18n.t(action === "increase" ? "toastFontLarger" : action === "decrease" ? "toastFontSmaller" : "toastFontReset"));
    });

    bind(".contrast-btn", function () {
      A11Y.contrast = this.getAttribute("data-contrast"); applyA11y(); saveA11y();
      toast(window.i18n.t(A11Y.contrast === "high" ? "toastContrastHigh" : "toastContrastNormal"));
    });

    bind(".font-type-btn", function () {
      A11Y.fontType = this.getAttribute("data-font-type"); applyA11y(); saveA11y();
      toast(window.i18n.t(A11Y.fontType === "dyslexic" ? "toastFontDyslexic" : "toastFontDefault"));
    });

    bind(".motion-btn", function () {
      A11Y.motion = this.getAttribute("data-motion"); applyA11y(); saveA11y();
      toast(window.i18n.t(A11Y.motion === "off" ? "toastMotionOff" : "toastMotionOn"));
      if (A11Y.motion === "off" && carousel) carousel.stopAuto();
      else if (carousel) carousel.startAuto();
    });
  }

  /* ---------- Language switch ---------- */
  function initLangSwitch() {
    var btns = document.querySelectorAll(".lang-btn");
    function update() {
      var lang = window.i18n.getLang();
      for (var i = 0; i < btns.length; i++)
        btns[i].setAttribute("aria-pressed", String(btns[i].getAttribute("data-lang") === lang));
    }
    update();
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var lang = this.getAttribute("data-lang");
        window.i18n.setLang(lang); update();
        renderPeople(); renderProgram();
        toast(window.i18n.t(lang === "en" ? "toastLangEn" : "toastLang"));
      });
    }
    document.addEventListener("langchange", function () { update(); renderPeople(); renderProgram(); });
  }

  /* ---------- Helpers ---------- */
  function initials(name) { return name.split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase(); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; }); }

  var ICONS = {
    leaf:  '<path fill="currentColor" d="M17 8C8 10 5 16 4 21l2 1c1-5 3-9 9-11-3 4-5 8-5 12h2c0-5 3-10 7-13l-2-2z"/>',
    shop:  '<path fill="currentColor" d="M4 4h16l-1 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0L4 4zm2 8v8h12v-8h-2v6h-3v-6H9v6H6v-6z"/>',
    family:'<path fill="currentColor" d="M12 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM6 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm12 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 14c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v6H3v-6zm8-2c0-1.1.9-2 2-2h-2zm0 0c1.1 0 2 .9 2 2v6h-2v-6zm4 0c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v6h-6v-6z"/>',
    eye:   '<path fill="currentColor" d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>',
    chat:  '<path fill="currentColor" d="M4 4h16v12H7l-3 3V4zm3 4v2h10V8H7zm0 4v2h6v-2H7z"/>',
    walk:  '<path fill="currentColor" d="M13 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-3 6 3 2v6h-2v-4l-2-1-2 6-2-1 3-7 2-1zm5 0v6h2v-5l-2-1z"/>'
  };

  /* ---------- Render people ---------- */
  function renderPeople() {
    var grid = document.getElementById("peopleGrid");
    if (!grid || !window.PEOPLE) return;
    var lang = window.i18n.getLang();
    grid.innerHTML = "";

    for (var i = 0; i < window.PEOPLE.length; i++) {
      var p = window.PEOPLE[i];
      var role = window.i18n.t(p.role === "mayor" ? "roleMayorLabel" : "roleCouncilLabel");
      var shapeClass = p.role === "mayor" ? "tag--role-mayor" : "tag--role-council";

      var prog = "";
      for (var j = 0; j < p.program.length; j++) {
        prog += "<li>" + escapeHtml(p.program[j][lang]) + "</li>";
      }

      var contacts = "";
      for (var k = 0; k < p.contact.length; k++) {
        var v = p.contact[k];
        if (v.indexOf("@") !== -1) {
          contacts += '<li><span>' + escapeHtml(window.i18n.t("emailLabel")) + ': </span><a href="mailto:' + escapeHtml(v) + '">' + escapeHtml(v) + '</a></li>';
        }
      }

      var card = document.createElement("article");
      card.className = "person-card";
      card.style.setProperty("--accent", p.color);
      card.innerHTML =
        '<div class="person-head">' +
          '<div class="avatar avatar-lg" style="background:' + p.color + '" aria-hidden="true">' + escapeHtml(initials(p.name)) + '</div>' +
          '<div>' +
            '<h3 class="person-name">' + escapeHtml(p.name) + '</h3>' +
            '<span class="tag tag--accent tag--role ' + shapeClass + '">' +
              '<span class="tag-shape" aria-hidden="true"></span>' + escapeHtml(role) +
            '</span>' +
          '</div>' +
        '</div>' +
        '<p class="person-bio">' + escapeHtml(p.bio[lang]) + '</p>' +
        '<div class="person-section">' +
          '<h4>' + escapeHtml(window.i18n.t("personProgram")) + '</h4>' +
          '<ul class="person-prog">' + prog + '</ul>' +
        '</div>' +
        (contacts ? '<div class="person-section"><h4>' + escapeHtml(window.i18n.t("personContact")) + '</h4><ul class="person-contact">' + contacts + '</ul></div>' : '');

      grid.appendChild(card);
    }
  }

  /* ---------- Render program ---------- */
  function renderProgram() {
    var grid = document.getElementById("programGrid");
    if (!grid || !window.PROGRAM) return;
    var lang = window.i18n.getLang();
    grid.innerHTML = "";

    for (var i = 0; i < window.PROGRAM.length; i++) {
      var it = window.PROGRAM[i];
      var li = document.createElement("li");
      li.className = "prog-card";
      var svg = ICONS[it.icon] || ICONS.leaf;
      li.innerHTML =
        '<span class="prog-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28">' + svg + '</svg></span>' +
        '<h3 class="prog-title">' + escapeHtml(it.title[lang]) + '</h3>' +
        '<p class="prog-body">' + escapeHtml(it.body[lang]) + '</p>';
      grid.appendChild(li);
    }
  }

  /* ---------- Carousel ---------- */
  var carousel;
  function initCarousel() {
    var root = document.getElementById("carousel");
    var track = document.getElementById("carouselTrack");
    var dotsBox = document.getElementById("carouselDots");
    var live = document.getElementById("carouselLive");
    if (!root || !track) return;

    var slides = track.querySelectorAll(".slide");
    var total = slides.length;
    var current = 0;
    var timer = null;
    var DELAY = 6000;

    /* build dots */
    for (var i = 0; i < total; i++) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "carousel-dot";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Diapozitiv " + (i + 1));
      d.setAttribute("aria-selected", i === 0 ? "true" : "false");
      (function (idx) { d.addEventListener("click", function () { goTo(idx); restartAuto(); }); })(i);
      dotsBox.appendChild(d);
    }
    var dots = dotsBox.querySelectorAll(".carousel-dot");

    function reducedMotion() {
      return document.documentElement.getAttribute("data-motion") === "off" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function goTo(i) {
      current = (i + total) % total;
      var pct = -current * 100;
      track.style.transform = "translateX(" + pct + "%)";
      for (var s = 0; s < total; s++) {
        slides[s].setAttribute("aria-hidden", s === current ? "false" : "true");
      }
      for (var d = 0; d < dots.length; d++) {
        dots[d].setAttribute("aria-selected", d === current ? "true" : "false");
        dots[d].setAttribute("aria-current", d === current ? "true" : "false");
      }
      if (live) live.textContent = window.i18n.t("carouselSlideOf").replace("{n}", current + 1).replace("{total}", total);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      if (reducedMotion()) return;
      stopAuto();
      timer = setInterval(next, DELAY);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restartAuto() { stopAuto(); startAuto(); }

    document.getElementById("carouselNext").addEventListener("click", function () { next(); restartAuto(); });
    document.getElementById("carouselPrev").addEventListener("click", function () { prev(); restartAuto(); });

    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("focusout", startAuto);

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); restartAuto(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); restartAuto(); }
    });

    /* pause when tab hidden */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    goTo(0);
    startAuto();

    carousel = { startAuto: startAuto, stopAuto: stopAuto };
  }

  /* ---------- Smooth scroll for anchor nav ---------- */
  function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = this.getAttribute("href").slice(1);
        if (!id) return;
        var el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
      });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    loadA11y();
    initA11yPanel();
    initLangSwitch();
    renderPeople();
    renderProgram();
    initCarousel();
    initSmoothNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
