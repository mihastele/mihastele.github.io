/* =========================================================
   Data for Lista Mateja Slaparja — bilingual (sl / en)
   Two people: Matej Slapar (mayor) + Matija Podjed (council).
   Edit freely. Program points are shared list priorities.
   ========================================================= */

window.PEOPLE = [
  {
    id: "matej-slapar",
    name: "Matej Slapar",
    role: "mayor",
    color: "#1e3a8a",
    bio: {
      sl: "Lokalni prebivalec in vodja Liste Mateja Slaparja. Živi in dela v Kamniku; pozna vsak kotiček občine. Za odprto, zeleno in skupnostno vodenje.",
      en: "Local resident and lead of Lista Mateja Slaparja. He lives and works in Kamnik and knows every corner of the municipality. For open, green and community-driven leadership."
    },
    program: [
      { sl: "Odprte seje občinskega sveta in sprotna objava sklepov.", en: "Open council sessions and real-time publication of decisions." },
      { sl: "Mesečni urad za državljane — neposredno poslušanje.", en: "A monthly citizen office — direct listening." },
      { sl: "Proračun, ki gre v ljudi, ne v birokracijo.", en: "A budget that goes to people, not bureaucracy." }
    ],
    contact: ["lista@matej-slapar.si"]
  },
  {
    id: "matija-podjed",
    name: "Matija Podjed",
    role: "council",
    color: "#b45309",
    bio: {
      sl: "Kandidat za člana občinskega sveta. Verjame v sosedsko skupnost, transparentne odločitve in dostop do občine za vsakogar.",
      en: "Candidate for member of the municipal council. He believes in a neighbourly community, transparent decisions and access to the municipality for everyone."
    },
    program: [
      { sl: "Vaš glas v svetu — vsak predlog dobi odgovor.", en: "Your voice in the council — every proposal gets a reply." },
      { sl: "Sosedski sveti za vsako naselje in vas.", en: "Neighbourhood councils for every settlement and village." },
      { sl: "Spletni portal za prijavo mestnih problemov.", en: "An online portal for reporting municipal issues." }
    ],
    contact: ["matija.podjed@matej-slapar.si"]
  }
];

window.PROGRAM = [
  {
    icon: "leaf",
    title: { sl: "Zelen Kamnik", en: "A green Kamnik" },
    body:  { sl: "Več dreves, čista Kamniška Bistrica in varovana narava pod Kamniškimi Alpami.", en: "More trees, a clean Kamniška Bistrica and protected nature beneath the Kamnik Alps." }
  },
  {
    icon: "shop",
    title: { sl: "Lokalno gospodarstvo", en: "Local economy" },
    body:  { sl: "Podpora malim podjetjem, tržnicam in lokalnim obrtnikom.", en: "Support for small businesses, markets and local craftspeople." }
  },
  {
    icon: "family",
    title: { sl: "Mladi in družine", en: "Youth and families" },
    body:  { sl: "Vrtci, igrišča in programi, ki zadržijo mlade v domačem kraju.", en: "Kindergartens, playgrounds and programmes that keep young people at home." }
  },
  {
    icon: "eye",
    title: { sl: "Transparentnost", en: "Transparency" },
    body:  { sl: "Odprti podatki, sprotna objava sklepov in sodelovalni proračun.", en: "Open data, real-time decisions and a participatory budget." }
  },
  {
    icon: "chat",
    title: { sl: "Skupnost", en: "Community" },
    body:  { sl: "Kulturni dogodki, sosedski srečanja in prostovoljstvo kot temelj občine.", en: "Cultural events, neighbourhood gatherings and volunteering as the backbone of the municipality." }
  },
  {
    icon: "walk",
    title: { sl: "Mobilnost", en: "Mobility" },
    body:  { sl: "Hodljiv center, varne kolesarske poti in zanesljiv lokalni prevoz.", en: "A walkable centre, safe cycle paths and reliable local transport." }
  }
];
