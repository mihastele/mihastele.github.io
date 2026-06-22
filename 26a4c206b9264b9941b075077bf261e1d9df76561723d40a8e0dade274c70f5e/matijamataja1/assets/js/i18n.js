/* =========================================================
   i18n.js — Slovenian / English language module
   Persists choice in localStorage. Updates <html lang>.
   Exposes: window.i18n = { getLang, setLang, t, applyTo }
   ========================================================= */

(function () {
  "use strict";

  var STORAGE_KEY = "kamnik-lang";
  var DEFAULT_LANG = "sl";

  var STRINGS = {
    sl: {
      skipToContent: "Preskoči na vsebino",
      brandSub: "Lokalne volitve · Kamnik 2026",

      navList: "Lista",
      navCandidates: "Kandidati",
      navProgram: "Program",
      navSupport: "Podpri",

      a11ySettings: "Dostopnost",
      fontSize: "Velikost pisave",
      contrast: "Kontrast",
      contrastNormal: "Normalno",
      contrastHigh: "Visok",
      fontType: "Tip pisave",
      fontDefault: "Privzeto",
      fontDyslexic: "Za disleksijo",
      motion: "Animacije",
      motionOn: "Vključene",
      motionOff: "Izključene",

      /* carousel slides */
      s1Eyebrow: "Lokalne volitve · Kamnik 2026",
      s1Title: "Za boljši Kamnik",
      s1Lead: "Lista Mateja Slaparja — skupaj gradimo mesto, v katerem je dobro živeti.",
      s1Cta1: "Spoznaj listo",
      s1Cta2: "Podpri nas",
      s2Eyebrow: "Kandidat za župana",
      s2Title: "Matej Slapar",
      s2Lead: "Lokalni prebivalec, ki pozna vsak kotiček Kamnika. Za odprto, zeleno in skupnostno občino.",
      s2Cta: "Spoznaj kandidata",
      s3Eyebrow: "Kandidat za občinski svet",
      s3Title: "Matija Podjed",
      s3Lead: "Vaš glas v občinskem svetu — za transparentne odločitve in sosedsko skupnost.",
      s3Cta: "Spoznaj Matijo",
      s4Eyebrow: "Tvoja odločitev",
      s4Title: "Podpri Listo Mateja Slaparja",
      s4Lead: "Glasuj za Mateja Slaparja in Matijo Podjeda. Vsak glas šteje za naš Kamnik.",
      s4Cta: "Spoznaj program",

      /* lista section */
      listaEyebrow: "Lista",
      listaTitle: "Lista Mateja Slaparja",
      listaP1: "Neodvisna lista lokalnih ljudi, ki ljubijo Kamnik. Povezujemo sosede, družine in podjetnike okoli skupne vizije: zelene, odprte in žive občine.",
      listaP2: "Ne obljubimo čudežev — obljubimo prisotnost, poslušanje in delo. Od prve do zadnje seje sveta.",
      listaCta: "Preberi naš program",
      statsTitle: "V številkah",
      statPeople: "Ljudi na listi",
      statFocus: "Področij programa",
      statYears: "Let v Kamniku",

      /* candidates section */
      kandEyebrow: "Kandidati",
      kandTitle: "Spoznaj naše kandidate",
      kandSub: "Dve imeni, ena vizija za Kamnik.",
      roleMayorLabel: "Kandidat za župana",
      roleCouncilLabel: "Kandidat za občinski svet",
      personProgram: "Prioritete",
      personContact: "Kontakt",
      emailLabel: "E-pošta",

      /* program section */
      progEyebrow: "Program",
      progTitle: "Naš program za Kamnik",
      progSub: "Šest področij, na katera se bomo zares zavezali.",

      /* cta section */
      ctaEyebrow: "Pridruži se",
      ctaTitle: "Podpri Listo Mateja Slaparja",
      ctaLead: "Vsak glas šteje. Glasuj za Mateja Slaparja za župana in Matijo Podjeda za občinski svet.",
      ctaBtn1: "Spoznaj program",
      ctaBtn2: "Spoznaj kandidate",

      /* footer */
      footerNote: "Neodvisna lista za lokalne volitve v Občini Kamnik.",
      footerRights: "Vse pravice pridržane.",

      /* toasts */
      toastLang: "Jezik preklopljen na slovenščino.",
      toastLangEn: "Language switched to English.",
      toastContrastHigh: "Visok kontrast omogočen.",
      toastContrastNormal: "Navadni kontrast omogočen.",
      toastFontLarger: "Pisava povečana.",
      toastFontSmaller: "Pisava zmanjšana.",
      toastFontReset: "Velikost pisave ponastavljena.",
      toastFontDyslexic: "Pisava za disleksijo omogočena.",
      toastFontDefault: "Privzeta pisava omogočena.",
      toastMotionOff: "Animacije izključene.",
      toastMotionOn: "Animacije vključene.",

      /* carousel live region */
      carouselSlideOf: "Diapozitiv {n} od {total}"
    },

    en: {
      skipToContent: "Skip to content",
      brandSub: "Local elections · Kamnik 2026",

      navList: "The List",
      navCandidates: "Candidates",
      navProgram: "Programme",
      navSupport: "Support",

      a11ySettings: "Accessibility",
      fontSize: "Font size",
      contrast: "Contrast",
      contrastNormal: "Normal",
      contrastHigh: "High",
      fontType: "Font type",
      fontDefault: "Default",
      fontDyslexic: "Dyslexia-friendly",
      motion: "Animations",
      motionOn: "On",
      motionOff: "Off",

      s1Eyebrow: "Local elections · Kamnik 2026",
      s1Title: "For a better Kamnik",
      s1Lead: "Lista Mateja Slaparja — together we're building a town that's good to live in.",
      s1Cta1: "Meet the list",
      s1Cta2: "Support us",
      s2Eyebrow: "Candidate for mayor",
      s2Title: "Matej Slapar",
      s2Lead: "A local resident who knows every corner of Kamnik. For an open, green and community-driven municipality.",
      s2Cta: "Meet the candidate",
      s3Eyebrow: "Candidate for municipal council",
      s3Title: "Matija Podjed",
      s3Lead: "Your voice in the municipal council — for transparent decisions and a neighbourly community.",
      s3Cta: "Meet Matija",
      s4Eyebrow: "Your decision",
      s4Title: "Support Lista Mateja Slaparja",
      s4Lead: "Vote for Matej Slapar and Matija Podjed. Every vote counts for our Kamnik.",
      s4Cta: "Read the programme",

      listaEyebrow: "The list",
      listaTitle: "Lista Mateja Slaparja",
      listaP1: "An independent list of local people who love Kamnik. We bring together neighbours, families and entrepreneurs around a shared vision: a green, open and lively municipality.",
      listaP2: "We don't promise miracles — we promise presence, listening and work. From the first to the last council session.",
      listaCta: "Read our programme",
      statsTitle: "In numbers",
      statPeople: "People on the list",
      statFocus: "Programme areas",
      statYears: "Years in Kamnik",

      kandEyebrow: "Candidates",
      kandTitle: "Meet our candidates",
      kandSub: "Two names, one vision for Kamnik.",
      roleMayorLabel: "Candidate for mayor",
      roleCouncilLabel: "Candidate for municipal council",
      personProgram: "Priorities",
      personContact: "Contact",
      emailLabel: "Email",

      progEyebrow: "Programme",
      progTitle: "Our programme for Kamnik",
      progSub: "Six areas we will genuinely commit to.",

      ctaEyebrow: "Join us",
      ctaTitle: "Support Lista Mateja Slaparja",
      ctaLead: "Every vote counts. Vote for Matej Slapar for mayor and Matija Podjed for municipal council.",
      ctaBtn1: "Read the programme",
      ctaBtn2: "Meet the candidates",

      footerNote: "An independent list for the local elections in the Municipality of Kamnik.",
      footerRights: "All rights reserved.",

      toastLang: "Jezik preklopljen na slovenščino.",
      toastLangEn: "Language switched to English.",
      toastContrastHigh: "High contrast enabled.",
      toastContrastNormal: "Normal contrast enabled.",
      toastFontLarger: "Font size increased.",
      toastFontSmaller: "Font size decreased.",
      toastFontReset: "Font size reset.",
      toastFontDyslexic: "Dyslexia-friendly font enabled.",
      toastFontDefault: "Default font enabled.",
      toastMotionOff: "Animations off.",
      toastMotionOn: "Animations on.",

      carouselSlideOf: "Slide {n} of {total}"
    }
  };

  function detectInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "sl" || saved === "en") return saved;
    } catch (e) {}
    var nav = (navigator.language || "sl").toLowerCase();
    return nav.indexOf("sl") === 0 ? "sl" : "en";
  }

  var current = detectInitialLang();

  function t(key) {
    var dict = STRINGS[current] || STRINGS[DEFAULT_LANG];
    return dict[key] != null ? dict[key] : (STRINGS[DEFAULT_LANG][key] != null ? STRINGS[DEFAULT_LANG][key] : key);
  }

  function applyTo(root) {
    root = root || document;
    var nodes = root.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
  }

  function setLang(lang) {
    if (lang !== "sl" && lang !== "en") return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
    applyTo(document);
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function getLang() { return current; }

  window.i18n = { getLang: getLang, setLang: setLang, t: t, applyTo: applyTo, strings: STRINGS };

  document.documentElement.setAttribute("lang", current);
  document.documentElement.setAttribute("data-lang", current);
  document.addEventListener("DOMContentLoaded", function () { applyTo(document); });
})();
