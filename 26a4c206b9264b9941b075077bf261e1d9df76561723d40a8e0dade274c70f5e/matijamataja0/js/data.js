/* ============================================================
   data.js — Lista Mateja Slaparja · Občinske volitve Kamnik 2026
   ============================================================ */

const ELECTION_DATE = new Date("2026-10-24T07:00:00+02:00");

const visionPillars = [
  {
    icon: "municipality",
    title: {
      sl: "Sodobna občina",
      en: "A modern municipality"
    },
    text: {
      sl: "Digitalizacija postopkov, odprti podatki in hitrejše odločanje. Uprava, ki deluje za ljudi, ne zoper njih.",
      en: "Digitalised procedures, open data, and faster decisions. An administration that works for people, not against them."
    }
  },
  {
    icon: "community",
    title: {
      sl: "Živo stare mesto",
      en: "A living old town"
    },
    text: {
      sl: "Ohranimo duh Starega trga in hkrati odpremo prostor za nove ideje, lokale in prireditve.",
      en: "Preserve the spirit of Stari trg while opening space for new ideas, venues, and events."
    }
  },
  {
    icon: "youth",
    title: {
      sl: "Mlade generacije",
      en: "Younger generations"
    },
    text: {
      sl: "Cenejši vrtci, podpora mladim podjetnikom in prosti prostori za ustvarjanje in srečevanje.",
      en: "Cheaper kindergartens, support for young entrepreneurs, and free spaces to create and meet."
    }
  },
  {
    icon: "nature",
    title: {
      sl: "Zeleni Kamnik",
      en: "Green Kamnik"
    },
    text: {
      sl: "Varstvo obzorja, čistega zraka in kamniške Bistrice. Narava je naš kapital, ne ovira.",
      en: "Protecting the skyline, clean air, and the Kamniška Bistrica. Nature is our asset, not an obstacle."
    }
  },
  {
    icon: "transparency",
    title: {
      sl: "Preglednost",
      en: "Transparency"
    },
    text: {
      sl: "Odprti seje, javni obračuni in račun, ki ga preveri vsak. Brez odločanja zadaj zaprtimi vrati.",
      en: "Open sessions, public accounts, and a record anyone can verify. No decisions behind closed doors."
    }
  }
];

const pillarIcons = {
  municipality: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M3 21h18v-2H3v2zM5 10v7h2v-7H5zm4 0v7h2v-7H9zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zM12 2L3 8v2h18V8l-9-6z"/></svg>',
  community: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  youth: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v1h10v-1c0-1.5.6-2.8 1.6-3.7A11 11 0 0 0 9 14zm9-2a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 18 12zm0 2c-.7 0-1.4.1-2 .3a5.5 5.5 0 0 1 2 4.7v1h4v-1c0-3-2-5-4-5z"/></svg>',
  nature: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M17 8a5 5 0 0 0-10 0c0 1.7.8 3.2 2.1 4.2L7 22h10l-2.1-9.8A5 5 0 0 0 17 8z" opacity="0.95"/><path fill="currentColor" d="M12 3a5 5 0 0 0-5 5c0 1.7.8 3.2 2.1 4.2L7 22h10l-2.1-9.8A5 5 0 0 0 12 3zm0 2a3 3 0 0 1 3 3c0 1.2-.7 2.2-1.7 2.7l-.7.4.2.8L14.5 20h-5l1.7-8.1.2-.8-.7-.4A3 3 0 0 1 9 8a3 3 0 0 1 3-3z"/></svg>',
  transparency: '<svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M12 5a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7zm0 2a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm-1 2v3.4l2.3 2.3 1.4-1.4L13 11.6V9h-2z"/></svg>'
};
