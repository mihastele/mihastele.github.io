/* 
   Lista Mateja Slaparja - Web Portal Logic
   Bilingual translation dictionary, carousel controls, accessibility settings.
*/

// ==========================================================================
// 1. Translations Dictionary (Slovenian / English)
// ==========================================================================
const translations = {
  sl: {
    // Navigation
    nav_home: "Domov",
    nav_vision: "Program",
    nav_candidates: "Kandidati",
    nav_contact: "Kontakt",
    
    // Accessibility Panel
    acc_title: "Prilagajanje Dostopnosti",
    acc_theme: "Tema in Kontrast",
    acc_theme_standard: "Standardna",
    acc_theme_dark: "Temni Način",
    acc_theme_contrast: "Visok Kontrast",
    acc_size: "Velikost Besedila",
    acc_size_normal: "Normalno",
    acc_size_large: "Večje",
    acc_size_xl: "Zelo Veliko",
    acc_colorblind: "Barvna Slepota",
    acc_cb_none: "Brez Filtra",
    acc_cb_protan: "Protanopija",
    acc_cb_deuteran: "Deuteranopija",
    acc_cb_tritan: "Tritanopija",
    
    // Hero Section
    hero_tagline: "Volitve v Občinski Svet Kamnik",
    hero_title: "Za razvoj in prihodnost <span>Kamnika</span>",
    hero_description: "Zavezani k trajnostnemu razvoju, napredni infrastrukturi in varnemu okolju za mlade, družine in starejše. Skupaj gradimo občino prihodnosti pod vodstvom Mateja Slaparja.",
    hero_cta_primary: "Preberite naš program",
    hero_cta_secondary: "Spoznajte kandidate",
    
    // Vision Section Header
    vision_subtitle: "Naša vizija za Kamnik",
    vision_title: "Ključni stebri razvoja",
    
    // Carousel Slide 1: Zeleni Kamnik
    slide1_title: "Trajnostni & Zeleni Kamnik",
    slide1_text: "Ohranjanje naravne dediščine Kamnika ter spodbujanje čiste energije in učinkovitega ravnanja z odpadki.",
    slide1_bullet1: "Varovanje pitne vode in naravnih virov",
    slide1_bullet2: "Širitev kolesarskih stez in pešpoti",
    slide1_bullet3: "Energetska sanacija javnih stavb",
    
    // Carousel Slide 2: Infrastruktura
    slide2_title: "Sodobna Infrastruktura",
    slide2_text: "Gradnja varnih cest, obnova komunalnih omrežij ter urejanje parkirišč in javnih prostorov za večjo kakovost bivanja.",
    slide2_bullet1: "Sanacija lokalnih cest in pločnikov",
    slide2_bullet2: "Posodobitev vodovodnega omrežja",
    slide2_bullet3: "Ureditev parkirišč v mestnem jedru",
    
    // Carousel Slide 3: Družine & Mladi
    slide3_title: "Mladi, Družine in Starejši",
    slide3_text: "Kamnik mora ostati varna in prijazna občina za vse generacije z ustreznimi socialnimi programi in javno infrastrukturo.",
    slide3_bullet1: "Povečanje kapacitet v vrtcih in šolah",
    slide3_bullet2: "Izgradnja novih otroških in športnih igrišč",
    slide3_bullet3: "Podpora programom za pomoč starejšim na domu",
    
    // Carousel Slide 4: Gospodarstvo
    slide4_title: "Gospodarstvo in Turizem",
    slide4_text: "Ustvarjanje spodbudnega okolja za lokalna podjetja ter krepitev turistične znamke Kamnika kot zelene destinacije.",
    slide4_bullet1: "Spodbude za mlade podjetnike in obrtnike",
    slide4_bullet2: "Razvoj trajnostnega turizma na Veliki planini",
    slide4_bullet3: "Povezovanje lokalnih kmetij z izobraževalnimi zavodi",
    
    // Candidates Section Header
    candidates_subtitle: "Ljudje, ki jim zaupamo",
    candidates_title: "Naša kandidata za vaš glas",
    
    // Candidate 1: Matej Slapar
    cand1_role: "Kandidat za Župana in Nosilec Liste",
    cand1_quote: "\"Kamnik nosim v srcu. Verjamem v razvoj, varnost in povezovanje vseh prebivalcev naše čudovite občine.\"",
    cand1_bio: "Matej Slapar je izkušen voditelj z jasno vizijo za občino Kamnik. Z znanjem, predanostjo in nenehnim delom na terenu je dokazal, da zna povezati skupnost in realizirati ključne projekte za boljšo prihodnost vseh generacij.",
    
    // Candidate 2: Matija Podjed
    cand2_role: "Kandidat za Občinski Svet",
    cand2_quote: "\"Za strokoven glas in svežo energijo, ki bo pospešila razvojne projekte ter prisluhnila vsakemu občanu.\"",
    cand2_bio: "Matija Podjed je kandidat za občinski svet (člani občinskega sveta), ki s svojo energijo, strokovnostjo in aktivnim delovanjem v lokalnem okolju prinaša svež pogled na reševanje vsakodnevnih izzivov naših občanov.",
    
    // Contact Section
    contact_subtitle: "Stopite v stik z nami",
    contact_title: "Vaše mnenje šteje",
    contact_desc: "Imate predlog, vprašanje ali nam želite le nameniti besedo spodbude? Izpolnite spodnji obrazec ali pa nas obiščite.",
    contact_label_name: "Vaše ime",
    contact_label_email: "E-poštni naslov",
    contact_label_message: "Vaše sporočilo",
    contact_submit: "Pošlji sporočilo",
    contact_success: "Sporočilo je bilo uspešno poslano! Hvala za vaš glas in zaupanje.",
    
    // Footer
    footer_desc: "Lista Mateja Slaparja se zavzema za transparentno, učinkovito in trajnostno upravljanje občine Kamnik. Skupaj gradimo boljšo prihodnost.",
    footer_quick_links: "Hitre povezave",
    footer_disclaimer: "Naročnik oglasnega sporočila je Lista Mateja Slaparja, z namenom predstavitve kandidatov in programa za lokalne volitve v občini Kamnik."
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_vision: "Agenda",
    nav_candidates: "Candidates",
    nav_contact: "Contact",
    
    // Accessibility Panel
    acc_title: "Accessibility Options",
    acc_theme: "Theme & Contrast",
    acc_theme_standard: "Standard",
    acc_theme_dark: "Dark Mode",
    acc_theme_contrast: "High Contrast",
    acc_size: "Text Size",
    acc_size_normal: "Normal",
    acc_size_large: "Large",
    acc_size_xl: "Extra Large",
    acc_colorblind: "Color Vision",
    acc_cb_none: "No Filter",
    acc_cb_protan: "Protanopia",
    acc_cb_deuteran: "Deuteranopia",
    acc_cb_tritan: "Tritanopia",
    
    // Hero Section
    hero_tagline: "Kamnik Municipal Council Elections",
    hero_title: "For the Development and Future of <span>Kamnik</span>",
    hero_description: "Committed to sustainable development, advanced infrastructure, and a secure environment for youth, families, and seniors. Together we build the municipality of the future under the leadership of Matej Slapar.",
    hero_cta_primary: "Read our Agenda",
    hero_cta_secondary: "Meet the Candidates",
    
    // Vision Section Header
    vision_subtitle: "Our Vision for Kamnik",
    vision_title: "Key Pillars of Development",
    
    // Carousel Slide 1: Zeleni Kamnik
    slide1_title: "Sustainable & Green Kamnik",
    slide1_text: "Preserving Kamnik's natural heritage while promoting clean energy and efficient waste management.",
    slide1_bullet1: "Protecting drinking water and natural resources",
    slide1_bullet2: "Expanding bicycle lanes and pedestrian paths",
    slide1_bullet3: "Energy-saving renovations for public buildings",
    
    // Carousel Slide 2: Infrastruktura
    slide2_title: "Modern Infrastructure",
    slide2_text: "Building safe roads, renovating municipal networks, and arranging parking and public spaces to improve quality of life.",
    slide2_bullet1: "Renovating local roads and sidewalks",
    slide2_bullet2: "Upgrading the municipal water network",
    slide2_bullet3: "Improving parking solutions in the town center",
    
    // Carousel Slide 3: Družine & Mladi
    slide3_title: "Youth, Families, and Seniors",
    slide3_text: "Kamnik must remain a safe and friendly municipality for all generations, supported by appropriate social programs and public facilities.",
    slide3_bullet1: "Increasing kindergarten and school capacities",
    slide3_bullet2: "Building new children's playgrounds and sports courts",
    slide3_bullet3: "Supporting home-care programs for the elderly",
    
    // Carousel Slide 4: Gospodarstvo
    slide4_title: "Economy and Tourism",
    slide4_text: "Creating an encouraging environment for local businesses and strengthening Kamnik's tourist brand as a green destination.",
    slide4_bullet1: "Incentives for young entrepreneurs and local artisans",
    slide4_bullet2: "Sustainable tourism development on Velika Planina",
    slide4_bullet3: "Connecting local farms with educational institutions",
    
    // Candidates Section Header
    candidates_subtitle: "People We Trust",
    candidates_title: "Our Candidates for Your Vote",
    
    // Candidate 1: Matej Slapar
    cand1_role: "Mayoral Candidate & List Leader",
    cand1_quote: "\"I carry Kamnik in my heart. I believe in development, security, and connecting all the residents of our beautiful municipality.\"",
    cand1_bio: "Matej Slapar is an experienced leader with a clear vision for Kamnik. Through his knowledge, dedication, and persistent local work, he has proved his ability to unite the community and realize key projects for a better future across all generations.",
    
    // Candidate 2: Matija Podjed
    cand2_role: "Candidate for Municipal Council",
    cand2_quote: "\"For a professional voice and fresh energy that will accelerate development projects and listen to every citizen.\"",
    cand2_bio: "Matija Podjed is a candidate for the municipal council who brings a fresh perspective to solving everyday local challenges through his energy, professional background, and active community involvement.",
    
    // Contact Section
    contact_subtitle: "Get in Touch With Us",
    contact_title: "Your Opinion Matters",
    contact_desc: "Do you have a suggestion, question, or just want to share some encouraging words? Fill out the form below or drop by.",
    contact_label_name: "Your Name",
    contact_label_email: "Email Address",
    contact_label_message: "Your Message",
    contact_submit: "Send Message",
    contact_success: "Message successfully sent! Thank you for your support and trust.",
    
    // Footer
    footer_desc: "Lista Mateja Slaparja is committed to transparent, efficient, and sustainable governance of the municipality of Kamnik. Together, we build a better future.",
    footer_quick_links: "Quick Links",
    footer_disclaimer: "The advertiser of this campaign message is Lista Mateja Slaparja, for the purpose of presenting candidates and the agenda for local elections in Kamnik."
  }
};

// Default language state
let currentLang = 'sl';

// ==========================================================================
// 2. Language Switcher Logic
// ==========================================================================
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  
  // Update translation text on elements marked with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      element.innerHTML = translations[currentLang][key];
    }
  });
  
  // Update form inputs and placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[currentLang][key]) {
      element.setAttribute('placeholder', translations[currentLang][key]);
    }
  });

  // Update language buttons active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  
  // Update document language attribute
  document.documentElement.setAttribute('lang', lang);
  
  // Save preference
  localStorage.setItem('preferred-lang', lang);
}

// ==========================================================================
// 3. Carousel Slider Logic
// ==========================================================================
let currentSlide = 0;
let slideInterval;
const slideDuration = 6000; // 6 seconds auto-play

function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  
  if (!wrapper || slides.length === 0) return;
  
  // Generate dot buttons
  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  // Setup next/prev event listeners
  document.querySelector('.carousel-next').addEventListener('click', () => {
    nextSlide();
    resetSlideTimer();
  });
  
  document.querySelector('.carousel-prev').addEventListener('click', () => {
    prevSlide();
    resetSlideTimer();
  });
  
  startSlideTimer();
}

function updateCarouselPosition() {
  const wrapper = document.querySelector('.carousel-wrapper');
  const dots = document.querySelectorAll('.carousel-dot');
  
  wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = index;
  updateCarouselPosition();
  resetSlideTimer();
}

function nextSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarouselPosition();
}

function prevSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateCarouselPosition();
}

function startSlideTimer() {
  slideInterval = setInterval(nextSlide, slideDuration);
}

function resetSlideTimer() {
  clearInterval(slideInterval);
  startSlideTimer();
}

// ==========================================================================
// 4. Accessibility Settings Logic
// ==========================================================================
const accessibilityState = {
  theme: 'standard', // standard, dark, contrast
  fontScale: 'normal', // normal, large, xlarge
  colorblindFilter: 'none' // none, protanopia, deuteranopia, tritanopia
};

function initAccessibility() {
  const panel = document.getElementById('accessibility-panel');
  const toggleBtn = document.getElementById('acc-toggle-btn');
  const closeBtn = document.getElementById('acc-close-btn');
  
  // Toggle panel visibility
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    const isOpen = panel.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });
  
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  });
  
  // Close panel when pressing Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      toggleBtn.focus();
    }
  });

  // Set up settings click handlers
  document.querySelectorAll('[data-acc-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.getAttribute('data-acc-theme'));
    });
  });

  document.querySelectorAll('[data-acc-scale]').forEach(btn => {
    btn.addEventListener('click', () => {
      setFontScale(btn.getAttribute('data-acc-scale'));
    });
  });

  document.querySelectorAll('[data-acc-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      setColorblindFilter(btn.getAttribute('data-acc-filter'));
    });
  });

  // Load preferences
  const savedTheme = localStorage.getItem('acc-theme');
  const savedScale = localStorage.getItem('acc-scale');
  const savedFilter = localStorage.getItem('acc-filter');

  if (savedTheme) setTheme(savedTheme);
  if (savedScale) setFontScale(savedScale);
  if (savedFilter) setColorblindFilter(savedFilter);
}

function setTheme(theme) {
  accessibilityState.theme = theme;
  
  // Remove existing theme classes
  document.body.classList.remove('theme-dark', 'theme-high-contrast');
  
  // Apply selected theme class
  if (theme === 'dark') {
    document.body.classList.add('theme-dark');
  } else if (theme === 'contrast') {
    document.body.classList.add('theme-high-contrast');
  }
  
  // Update active state in UI buttons
  document.querySelectorAll('[data-acc-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-acc-theme') === theme);
  });
  
  localStorage.setItem('acc-theme', theme);
}

function setFontScale(scale) {
  accessibilityState.fontScale = scale;
  
  // Apply style scale variable to :root element
  let scaleVal = '1';
  if (scale === 'large') scaleVal = '1.25';
  if (scale === 'xlarge') scaleVal = '1.5';
  
  document.documentElement.style.setProperty('--font-scale', scaleVal);
  
  // Update active state in UI buttons
  document.querySelectorAll('[data-acc-scale]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-acc-scale') === scale);
  });
  
  localStorage.setItem('acc-scale', scale);
}

function setColorblindFilter(filter) {
  accessibilityState.colorblindFilter = filter;
  
  // Remove existing filter classes
  document.body.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia');
  
  // Apply selected filter class
  if (filter !== 'none') {
    document.body.classList.add(`filter-${filter}`);
  }
  
  // Update active state in UI buttons
  document.querySelectorAll('[data-acc-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-acc-filter') === filter);
  });
  
  localStorage.setItem('acc-filter', filter);
}

// ==========================================================================
// 5. Contact Form Submission Handler (Local Simulation)
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('campaign-contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate successful API call
    alert(translations[currentLang].contact_success);
    form.reset();
  });
}

// ==========================================================================
// 6. Initialization on DOM Load
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize language
  const savedLang = localStorage.getItem('preferred-lang') || 'sl';
  setLanguage(savedLang);
  
  // Set up click handlers on header flags/buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
    });
  });

  // 2. Initialize Carousel
  initCarousel();

  // 3. Initialize Accessibility Settings
  initAccessibility();

  // 4. Initialize Contact Form Submission
  initContactForm();

  // Mobile navigation toggle (simple logic)
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileToggleBtn && mainNav) {
    mobileToggleBtn.addEventListener('click', () => {
      const isVisible = mainNav.style.display === 'block';
      mainNav.style.display = isVisible ? 'none' : 'block';
      mobileToggleBtn.innerHTML = isVisible ? '☰' : '✕';
    });
  }
});
