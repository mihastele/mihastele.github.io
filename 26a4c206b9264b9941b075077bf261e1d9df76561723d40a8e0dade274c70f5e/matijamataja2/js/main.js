/* Lista Mateja Slaparja — Kamnik 2026
 * Static, dependency-free, accessible.
 * Bilingual data-driven i18n + candidates + carousels + a11y panel.
 */
(function () {
  'use strict';

  // ---------- i18n dictionary ----------
  const I18N = {
    sl: {
      skip: 'Preskoči na vsebino',
      'nav-about': 'O listi',
      'nav-candidates': 'Kandidati',
      'nav-program': 'Program',
      'nav-projects': 'Projekti',
      'nav-contact': 'Kontakt',
      'hero-eyebrow': 'Lokalne volitve 2026',
      'hero-title-1': 'Kamnik, ki',
      'hero-title-2': 'diha z nami.',
      'hero-lead': 'Lista Mateja Slaparja povezuje ljudi, ki Kamnik vidijo kot mesto skupnosti, sonaravnega razvoja in odprtosti. Predlagani člani občinskega sveta so ljudje iz sosesk, društev in podjetij.',
      'hero-cta-1': 'Spoznaj kandidate',
      'hero-cta-2': 'Preberi program',
      'hero-stat-1': 'predlogov',
      'hero-stat-2': 'imeni',
      'hero-stat-3': 'Kamnik',
      'hero-badge': 'Glas ljudi · 2026',
      'about-eyebrow': 'O listi',
      'about-title': 'Povezani z mestom in njegovimi ljudmi',
      'about-lead': 'Verjamemo, da se dobro mesto gradi odspodaj — iz sosesk, zelenih površin, čistega zraka in odprtih odločitev. Lista Mateja Slaparja združuje neodvisne kandidate, stroko in prostovoljce.',
      'value-1-title': 'Soseska',
      'value-1-text': 'Močne soseske, varne ulice, žive stičišča za vse generacije.',
      'value-2-title': 'Narava',
      'value-2-text': 'Ohranitev Tuhinjske doline, Kamniške Bistrice in zelenih vhodov v mesto.',
      'value-3-title': 'Odprtost',
      'value-3-text': 'Jjavne seje, pregledne odločitve in e-sodelovanje za vsakogar.',
      'value-4-title': 'Ravnovesje',
      'value-4-text': 'Stanovanjske potrebe mladih družin in dostopna raba prostora.',
      'cand-eyebrow': 'Kandidati',
      'cand-title': 'Predlagani člani občinskega sveta',
      'cand-lead': 'Kandidate bomo spoznali skozi zgodbe o njihovem delu in navezavi na Kamnik.',
      'program-eyebrow': 'Program',
      'program-title': 'Šest področij, en mesto',
      'program-lead': 'Kratko, jasno in izvedljivo — predlogi, ki jih bomo potisnili v svet v prvih sto dneh.',
      'program-1-title': 'Zeleni staro mestni jedri',
      'program-1-text': 'Zmanjšanje prometa v jedru, širje pešpoti, senca in pitne fontanice.',
      'program-2-title': 'Cenejše stanovanje za mlade',
      'program-2-text': 'Zakupi zemljišč in jamčila za dostopne najemnine najetim krije.',
      'program-3-title': 'Čist zrak in transport',
      'program-3-text': 'Šolski avtobusi, vozni redi usklajen z vlakom, polnilnice za e-kolesa.',
      'program-4-title': 'Odprt občinski svet',
      'program-4-text': 'Spletno objavljeni predlogi, glasovanja in zapisniki vseh odborov.',
      'program-5-title': 'Kultura in večernja mesta',
      'program-5-text': 'Podpora prostovoljnim društvom, odprta prizovišča in poletni oder.',
      'program-6-title': 'Sonaravna kmetija',
      'program-6-text': 'Kmalovrstni nabava za šole in domove, znatna pomoč lokalnim pridelovalcem.',
      'proj-eyebrow': 'Projekti',
      'proj-title': 'Kamnik, ki ga gradimo skupaj',
      'proj-lead': 'Iniciative, ki jih bomo ovrednotili v sodelovanju z dravljanji.',
      'proj-prev': '◄ Nazaj',
      'proj-next': 'Naprej ►',
      'quote-text': '”Kamnik ni le naslov, ampak skupnost, kjer se vsakogar spomnimo po imenu. Zato gremo v svet — da bo mestni glas slišan kot glas ljudi.”',
      'contact-eyebrow': 'Kontakt',
      'contact-title': 'Pridruži se nam',
      'contact-lead': 'Pojdi v ekipo kot prostovoljec, predlagaj idejo ali nas pokliči na info točka.',
      'contact-addr': 'Glavni trg 1, 1241 Kamnik',
      'form-name': 'Ime in priimek',
      'form-email': 'E-pošta',
      'form-msg': 'Sporočilo',
      'form-consent': 'Strinjam se z obdelavo podatkov za namen odgovora.',
      'form-submit': 'Pošlji',
      'form-ok': 'Hvala! Vaše sporočilo je bilo poslano. Odgovorili vam bomo v kratkem.',
      'form-err': 'Prosimo popravite označena polja.',
      'footer-note': 'Izdelano z odprtim srcem v Kamniku.',
      'a11yTitle': 'Dostopnost',
      'font': 'Velikost pisave',
      'contrast': 'Visok kontrast',
      'motion': 'Animacije',
      'on': 'Vključeno',
      'off': 'Izklopljeno',
      'cand-role-leader': 'Nosilec liste',
      'cand-role-council': 'Kandidat za svet',
      'cand-role-deputy': 'Namestnik',
      'cand-tag-priority': 'Predlagan',
      // Candidates
      'cand-1-name': 'Matej Slapar',
      'cand-1-bio': 'Arhitekt in dolgoletni predsednik soseske. Verjame v mesto, ki hodi peš — ne le vozí.',
      'cand-2-name': 'Matija Podjed',
      'cand-2-bio': 'Inženir in mentor mladim podjetnikom. Predlagan za člana občinskega sveta.',
      'cand-3-name': 'Ana Zima',
      'cand-3-bio': 'Učiteljica in prostovoljka v planinskem društvu. Za glas vsake soseske.',
      'cand-4-name': 'Tomaž Bergant',
      'cand-4-bio': 'Kmetijski svetovalec in čuvaj Tuhinjske doline. Odprtost pridelovalcev in tržnic.',
      'cand-5-name': 'Eva Dolenc',
      'cand-5-bio': 'Mlada oblikovalka in začetnica iniciativa ZiherLok. Za večerne vhode in osveščen zen.',
      'cand-6-name': 'Primož Leban',
      'cand-6-bio': 'Voznik javnega prevoza in predstavnik sindikata. Za vozni red, ki služi ljudem.',
      // Proj
      'proj-1-title': 'Pešpot skozi staro mesto',
      'proj-1-text': 'Omejen promet v jedru, širje trotoarji in senčna drevesa skozi Glavni trg.',
      'proj-2-title': 'Kamniška Bistrica — zeleni koridor',
      'proj-2-text': 'Varovanje obrežja, kolesarska povezava in učne poti za šole ob reki.',
      'proj-3-title': 'Krožni vrh — mestni oder',
      'proj-3-text': 'Poletna odprta prizovišča, podpora društvom in prosto vstop za starejše.',
      'proj-4-title': 'Digitalni opazovalni svet',
      'proj-4-text': 'Predlogi in zapisniki sveta javno na spletu; udeležba na domoljnost.',
    },
    en: {
      skip: 'Skip to content',
      'nav-about': 'About',
      'nav-candidates': 'Candidates',
      'nav-program': 'Programme',
      'nav-projects': 'Projects',
      'nav-contact': 'Contact',
      'hero-eyebrow': 'Local Elections 2026',
      'hero-title-1': 'A Kamnik that',
      'hero-title-2': 'breathes with us.',
      'hero-lead': 'The Matej Slapar List unites people who see Kamnik as a city of community, sustainable development and openness. Its proposed municipal council members come from neighbourhoods, societies and local businesses.',
      'hero-cta-1': 'Meet the candidates',
      'hero-cta-2': 'Read the programme',
      'hero-stat-1': 'proposals',
      'hero-stat-2': 'names',
      'hero-stat-3': 'Kamnik',
      'hero-badge': "People's voice · 2026",
      'about-eyebrow': 'About the list',
      'about-title': 'Rooted in the city and its people',
      'about-lead': 'We believe a great city is built from the ground up — from neighbourhoods, green spaces, clean air and open decisions. The Matej Slapar List brings together independent candidates, professionals and volunteers.',
      'value-1-title': 'Neighbourhood',
      'value-1-text': 'Strong neighbourhoods, safe streets, lively meeting points for every generation.',
      'value-2-title': 'Nature',
      'value-2-text': 'Protecting the Tuhinj valley, the Kamniška Bistrica and the green gateways to the city.',
      'value-3-title': 'Openness',
      'value-3-text': 'Public meetings, transparent decisions and e-participation for everyone.',
      'value-4-title': 'Balance',
      'value-4-text': 'Housing for young families and responsible, affordable use of space.',
      'cand-eyebrow': 'Candidates',
      'cand-title': 'Proposed municipal council members',
      'cand-lead': 'Meet the candidates through stories of their work and strong ties to Kamnik.',
      'program-eyebrow': 'Programme',
      'program-title': 'Six areas, one city',
      'program-lead': 'Short, clear and doable — proposals we will push into the council within the first hundred days.',
      'program-1-title': 'Green historic cores',
      'program-1-text': 'Less traffic in the centre, wider footpaths, shade and drinking fountains.',
      'program-2-title': 'Affordable housing for youth',
      'program-2-text': 'Land leases and guarantees to bring rent within reach for working families.',
      'program-3-title': 'Clean air & transport',
      'program-3-text': 'School buses, schedules matched to the train, charging spots for e-bikes.',
      'program-4-title': 'Open municipal council',
      'program-4-text': 'Public proposals, votes and minutes of every committee published online.',
      'program-5-title': 'Culture & evening city',
      'program-5-text': 'Support for volunteer societies, open venues and a summer stage.',
      'program-6-title': 'Sustainable farming',
      'program-6-text': 'Short-supply procurement for schools and homes, real support to local producers.',
      'proj-eyebrow': 'Projects',
      'proj-title': 'A Kamnik we build together',
      'proj-lead': 'Initiatives we will assess together with the citizens.',
      'proj-prev': '◄ Back',
      'proj-next': 'Next ►',
      'quote-text': '“Kamnik is not just an address — it is a community where we remember each other by name. That is why we run for the council — so the council speaks with the voice of the people.”',
      'contact-eyebrow': 'Contact',
      'contact-title': 'Join us',
      'contact-lead': 'Join the team as a volunteer, propose an idea, or call our info line.',
      'contact-addr': 'Glavni trg 1, 1241 Kamnik, Slovenia',
      'form-name': 'Full name',
      'form-email': 'Email',
      'form-msg': 'Message',
      'form-consent': 'I agree to the processing of my data for the purpose of a reply.',
      'form-submit': 'Send',
      'form-ok': 'Thank you! Your message has been sent. We will reply shortly.',
      'form-err': 'Please fix the highlighted fields.',
      'footer-note': 'Built with an open heart in Kamnik.',
      'a11yTitle': 'Accessibility',
      'font': 'Font size',
      'contrast': 'High contrast',
      'motion': 'Animations',
      'on': 'On',
      'off': 'Off',
      'cand-role-leader': 'List leader',
      'cand-role-council': 'Council candidate',
      'cand-role-deputy': 'Deputy',
      'cand-tag-priority': 'Proposed',
      'cand-1-name': 'Matej Slapar',
      'cand-1-bio': 'Architect and long-standing neighbourhood chair. Believes in a city that walks — not only drives.',
      'cand-2-name': 'Matija Podjed',
      'cand-2-bio': 'Engineer and mentor to young entrepreneurs. Proposed as a municipal council member.',
      'cand-3-name': 'Ana Zima',
      'cand-3-bio': 'Teacher and volunteer at the mountaineering society. A voice for every neighbourhood.',
      'cand-4-name': 'Tomaž Bergant',
      'cand-4-bio': 'Agricultural adviser and keeper of the Tuhinj valley. Openness for producers and markets.',
      'cand-5-name': 'Eva Dolenc',
      'cand-5-bio': 'Young designer and founder of the ZiherLok initiative. For well-lit entrances and mindful rest.',
      'cand-6-name': 'Primož Leban',
      'cand-6-bio': 'Public-transport driver and union delegate. For a schedule that serves people.',
      'proj-1-title': 'A footpath through the old town',
      'proj-1-text': 'Restricted traffic in the centre, wider pavements and shade trees through Glavni trg.',
      'proj-2-title': 'Kamniška Bistrica — a green corridor',
      'proj-2-text': 'Riverbank protection, a cycling link and learning trails for schools along the river.',
      'proj-3-title': 'Circular summit — city stage',
      'proj-3-text': 'Summer open-air venues, support for societies and free entry for seniors.',
      'proj-4-title': 'A digital open council',
      'proj-4-text': 'Online proposals and minutes of the council; participation made simple for everyone.',
    }
  };

  const CANDIDATES = [
    { id: 1, role: 'leader', photo: 'deep', tag: 'priority', initials: 'MS' },
    { id: 2, role: 'council', photo: 'accent', tag: 'priority', initials: 'MP' },
    { id: 3, role: 'council', photo: '', tag: '', initials: 'AZ' },
    { id: 4, role: 'council', photo: 'deep', tag: '', initials: 'TB' },
    { id: 5, role: 'council', photo: 'accent', tag: '', initials: 'ED' },
    { id: 6, role: 'council', photo: '', tag: '', initials: 'PL' }
  ];

  const PROJECTS = 4;

  // ---------- Language ----------
  let lang = localStorage.getItem('lms-lang') || 'sl';
  const body = document.body;

  function applyLang() {
    body.dataset.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = I18N[lang][key];
      if (val) el.textContent = val;
    });
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
    });
    // Re-render dynamic parts (their text uses i18n keys)
    renderCandidates();
    renderProjects();
    localStorage.setItem('lms-lang', lang);
  }

  function t(key) { return I18N[lang][key] || key; }

  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => { lang = btn.dataset.langBtn; applyLang(); });
  });

  // ---------- Candidates carousel ----------
  const track = document.getElementById('candTrack');
  const viewport = document.getElementById('candViewport');
  const dots = document.getElementById('candDots');
  let cardsPerView = 3;
  let current = 0;

  function renderCandidates() {
    if (!track) return;
    track.innerHTML = '';
    CANDIDATES.forEach(c => {
      const li = document.createElement('li');
      li.className = 'cand-card';
      li.setAttribute('role', 'group');
      li.setAttribute('aria-roledescription', 'slide');
      const photoClass = c.photo ? `cand-card__photo cand-card__photo--${c.photo}` : 'cand-card__photo';
      const tagHTML = c.tag ? `<span class="cand-card__tag">${t('cand-tag-priority')}</span>` : '';
      li.innerHTML = `
        <div class="${photoClass}" aria-hidden="true">
          ${tagHTML}
          <span>${c.initials}</span>
        </div>
        <div class="cand-card__body">
          <p class="cand-card__role">${t('cand-role-' + c.role)}</p>
          <h3>${t('cand-' + c.id + '-name')}</h3>
          <p class="cand-card__bio">${t('cand-' + c.id + '-bio')}</p>
        </div>`;
      track.appendChild(li);
    });
    computePerView();
    renderDots();
    goTo(0, true);
  }

  function computePerView() {
    const w = window.innerWidth;
    if (w <= 560) cardsPerView = 1;
    else if (w <= 880) cardsPerView = 2;
    else cardsPerView = 3;
  }

  function pageCount() { return Math.max(1, CANDIDATES.length - cardsPerView + 1); }

  function renderDots() {
    if (!dots) return;
    dots.innerHTML = '';
    for (let i = 0; i < pageCount(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (lang === 'sl' ? 'Stran ' : 'Page ') + (i + 1));
      b.setAttribute('aria-selected', i === current ? 'true' : 'false');
      b.addEventListener('click', () => goTo(i));
      dots.appendChild(b);
    }
  }

  function goTo(i, silent) {
    const max = pageCount() - 1;
    current = Math.min(Math.max(i, 0), Math.max(max, 0));
    const card = track.firstElementChild;
    if (!card) return;
    const cardW = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap || 22);
    const step = (cardW + gap);
    track.style.transform = `translateX(${-step * current}px)`;
    renderDots();
    if (!silent) viewport.setAttribute('aria-live', 'polite');
  }

  const prevBtn = document.querySelector('[data-prev]');
  const nextBtn = document.querySelector('[data-next]');
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
  });

  // touch swipe
  let startX = null, scrollable = false;
  viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  window.addEventListener('resize', () => { computePerView(); goTo(current, true); });

  // ---------- Projects horizontal gallery ----------
  const strip = document.getElementById('galleryStrip');
  const count = document.getElementById('galleryCount');
  let pIdx = 0;
  function renderProjects() {
    if (!strip) return;
    strip.innerHTML = '';
    for (let i = 1; i <= PROJECTS; i++) {
      const s = document.createElement('div');
      s.className = `gallery__slide gallery__slide--${i}`;
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.innerHTML = `<div>
        <h3>${t('proj-' + i + '-title')}</h3>
        <p>${t('proj-' + i + '-text')}</p>
      </div>`;
      strip.appendChild(s);
    }
    goToProject(pIdx, true);
  }
  function goToProject(i, silent) {
    if (!strip) return;
    pIdx = Math.min(Math.max(i, 0), PROJECTS - 1);
    strip.style.transform = `translateX(${-100 * pIdx}%)`;
    if (count) count.textContent = `${pIdx + 1} / ${PROJECTS}`;
    if (count && !silent) count.setAttribute('aria-live', 'polite');
  }
  document.querySelectorAll('[data-gal-prev]').forEach(b => b.addEventListener('click', () => goToProject(pIdx - 1)));
  document.querySelectorAll('[data-gal-next]').forEach(b => b.addEventListener('click', () => goToProject(pIdx + 1)));

  // keyboard for gallery strip container
  const gallery = document.getElementById('gallery');
  if (gallery) {
    gallery.tabIndex = 0;
    gallery.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goToProject(pIdx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToProject(pIdx - 1); }
    });
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- Mobile menu ----------
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('mobileMenu');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobile.hidden = open;
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobile.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // ---------- a11y panel ----------
  const aToggle = document.getElementById('a11yToggle');
  const aPanel = document.getElementById('a11yPanel');
  if (aToggle && aPanel) {
    aToggle.addEventListener('click', () => {
      const open = aToggle.getAttribute('aria-expanded') === 'true';
      aToggle.setAttribute('aria-expanded', String(!open));
      aPanel.hidden = open;
    });
  }

  const contrastBtn = document.getElementById('contrastBtn');
  const motionBtn = document.getElementById('motionBtn');
  const FONT_MIN = .85, FONT_MAX = 1.25;

  // Persistence
  function setFont(s) {
    s = Math.min(FONT_MAX, Math.max(FONT_MIN, s));
    body.dataset.fontscale = String(Math.round(s * 100) / 100);
    document.documentElement.style.setProperty('--scale', String(s));
    localStorage.setItem('lms-font', String(s));
  }
  function setContrast(on) {
    body.dataset.contrast = on ? 'on' : 'off';
    contrastBtn.setAttribute('aria-pressed', String(on));
    contrastBtn.textContent = on ? t('on') : t('off');
    localStorage.setItem('lms-contrast', String(on));
  }
  function setMotion(on) {
    body.dataset.motion = on ? 'on' : 'off';
    motionBtn.setAttribute('aria-pressed', String(on));
    motionBtn.textContent = on ? t('on') : t('off');
    localStorage.setItem('lms-motion', String(on));
  }

  document.querySelectorAll('[data-scale]').forEach(b => {
    b.addEventListener('click', () => {
      const delta = parseFloat(b.dataset.scale);
      const cur = parseFloat(body.dataset.fontscale || '1');
      setFont(delta === 0 ? 1 : cur + delta);
    });
  });
  contrastBtn.addEventListener('click', () => setContrast(body.dataset.contrast !== 'on'));
  motionBtn.addEventListener('click', () => setMotion(body.dataset.motion !== 'on'));

  // load saved a11y prefs (note: also respect prefers-reduced-motion)
  const savedFont = parseFloat(localStorage.getItem('lms-font'));
  if (!isNaN(savedFont)) setFont(savedFont);
  const savedContrast = localStorage.getItem('lms-contrast') === 'on';
  setContrast(savedContrast);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const savedMotion = localStorage.getItem('lms-motion');
  setMotion(savedMotion === null ? !prefersReduced : savedMotion === 'on');

  // ---------- Contact form ----------
  const form = document.getElementById('contactForm');
  const fb = document.getElementById('formFeedback');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (fb) { fb.hidden = false; fb.textContent = t('form-err'); fb.style.background = 'rgba(216,116,28,.15)'; fb.style.color = 'var(--warn)'; }
        return;
      }
      if (fb) { fb.hidden = false; fb.textContent = t('form-ok'); fb.style.background = ''; fb.style.color = ''; }
      form.reset();
    });
  }

  // ---------- Init ----------
  applyLang();
})();