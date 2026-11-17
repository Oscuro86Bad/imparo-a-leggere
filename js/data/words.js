/* ============================================================
   IMPARO A LEGGERE — archivio parole italiane reali
   Ogni voce: w = parola, s = sillabazione, img = emoji associata
   (o null), diff = 1 (facile) … 2 (medio).
   Il motore (engine/generator.js) verifica lettere abilitate e
   combinazioni studiate PRIMA di proporre qualsiasi parola.

   Note didattiche:
   - parole di massimo 6 lettere (filtro lunghezze del profilo);
   - sillabazione italiana corretta (PA-NE, MEL-LE…);
   - evitate sillabe con dittongo non attivabile (es. UO, BAI);
   - molte parole di base con sole sillabe CV + immagine,
     per dare subito molti esercizi in LEGGI E GUARDA.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.WORDS = [
  // --- P ---
  { w: 'PALLA',    s: ['PA', 'LLA'],           img: '⚽',  diff: 1 },
  { w: 'PANE',     s: ['PA', 'NE'],            img: '🍞',  diff: 1 },
  { w: 'PALA',     s: ['PA', 'LA'],            img: null,  diff: 1 },
  { w: 'PAPERA',   s: ['PA', 'PE', 'RA'],      img: '🦆',  diff: 1 },
  { w: 'PERA',     s: ['PE', 'RA'],            img: '🍐',  diff: 1 },
  { w: 'PESCA',    s: ['PE', 'SCA'],           img: '🍑',  diff: 2 },
  { w: 'PESCE',    s: ['PE', 'SCE'],           img: '🐟',  diff: 2 },
  { w: 'PINO',     s: ['PI', 'NO'],            img: '🌲',  diff: 1 },
  { w: 'PIZZA',    s: ['PI', 'ZZA'],           img: '🍕',  diff: 1 },
  { w: 'PIRATA',   s: ['PI', 'RA', 'TA'],      img: '🏴‍☠️', diff: 2 },
  { w: 'POMODORO', s: ['PO', 'MO', 'DO', 'RO'],img: '🍅',  diff: 2 },
  { w: 'PUPPA',    s: ['PU', 'PPA'],           img: '🍼',  diff: 1 },
  { w: 'PUMA',     s: ['PU', 'MA'],            img: '🐆',  diff: 1 },
  { w: 'PILA',     s: ['PI', 'LA'],            img: '🔋',  diff: 1 },
  { w: 'PUPA',     s: ['PU', 'PA'],            img: '👶',  diff: 1 },
  { w: 'PAPPA',    s: ['PAP', 'PA'],           img: '🥣',  diff: 1 },
  { w: 'PELLE',    s: ['PEL', 'LE'],           img: '🧥',  diff: 2 },
  { w: 'PENNA',    s: ['PEN', 'NA'],           img: '🖊️',  diff: 2 },
  { w: 'POLLO',    s: ['POL', 'LO'],           img: '🍗',  diff: 2 },
  { w: 'PIATTO',   s: ['PIAT', 'TO'],          img: '🥘',  diff: 2 },
  { w: 'PANINO',   s: ['PA', 'NI', 'NO'],      img: '🥪',  diff: 1 },
  { w: 'PATATA',   s: ['PA', 'TA', 'TA'],      img: '🥔',  diff: 1 },
  { w: 'PILOTA',   s: ['PI', 'LO', 'TA'],      img: '🧑‍✈️', diff: 1 },

  // --- M ---
  { w: 'MANO',     s: ['MA', 'NO'],            img: '✋',  diff: 1 },
  { w: 'MELA',     s: ['ME', 'LA'],            img: '🍎',  diff: 1 },
  { w: 'MIELE',    s: ['MI', 'E', 'LE'],       img: '🍯',  diff: 1 },
  { w: 'MOTO',     s: ['MO', 'TO'],            img: '🏍️', diff: 1 },
  { w: 'MULO',     s: ['MU', 'LO'],            img: '🫏',  diff: 1 },
  { w: 'MAMMA',    s: ['MA', 'MMA'],           img: '👩',  diff: 1 },
  { w: 'MAPPA',    s: ['MA', 'PPA'],           img: '🗺️', diff: 1 },
  { w: 'MELONE',   s: ['ME', 'LO', 'NE'],      img: '🍈',  diff: 2 },
  { w: 'MATITA',   s: ['MA', 'TI', 'TA'],      img: '✏️', diff: 2 },
  { w: 'MONETA',   s: ['MO', 'NE', 'TA'],      img: '🪙',  diff: 2 },
  { w: 'MIMO',     s: ['MI', 'MO'],            img: '🎭',  diff: 1 },
  { w: 'MELO',     s: ['ME', 'LO'],            img: '🍏',  diff: 1 },
  { w: 'MARE',     s: ['MA', 'RE'],            img: '🌊',  diff: 1 },
  { w: 'MANGO',    s: ['MAN', 'GO'],           img: '🥭',  diff: 2 },
  { w: 'MOLLA',    s: ['MOL', 'LA'],           img: '🪀',  diff: 2 },
  { w: 'MUSICA',   s: ['MU', 'SI', 'CA'],      img: '🎶',  diff: 1 },

  // --- L ---
  { w: 'LANA',     s: ['LA', 'NA'],            img: '🧶',  diff: 1 },
  { w: 'LUNA',     s: ['LU', 'NA'],            img: '🌙',  diff: 1 },
  { w: 'LAGO',     s: ['LA', 'GO'],            img: '🏞️', diff: 1 },
  { w: 'LIMONE',   s: ['LI', 'MO', 'NE'],      img: '🍋',  diff: 2 },
  { w: 'LEONE',    s: ['LE', 'O', 'NE'],       img: '🦁',  diff: 2 },
  { w: 'LIBRO',    s: ['LI', 'BRO'],           img: '📖',  diff: 2 },
  { w: 'LUPO',     s: ['LU', 'PO'],            img: '🐺',  diff: 1 },
  { w: 'LATTE',    s: ['LA', 'TTE'],           img: '🥛',  diff: 1 },
  { w: 'LAMA',     s: ['LA', 'MA'],            img: '🦙',  diff: 1 },
  { w: 'LUCE',     s: ['LU', 'CE'],            img: '💡',  diff: 1 },
  { w: 'LEPRE',    s: ['LE', 'PRE'],           img: '🐇',  diff: 2 },
  { w: 'LENZA',    s: ['LEN', 'ZA'],           img: '🎣',  diff: 2 },
  { w: 'LEGNO',    s: ['LE', 'GNO'],           img: '🪵',  diff: 2 },

  // --- T ---
  { w: 'TOPO',     s: ['TO', 'PO'],            img: '🐭',  diff: 1 },
  { w: 'TAVOLO',   s: ['TA', 'VO', 'LO'],      img: '🪑',  diff: 2 },
  { w: 'TELE',     s: ['TE', 'LE'],            img: '📺',  diff: 1 },
  { w: 'TAZZA',    s: ['TA', 'ZZA'],           img: '☕',  diff: 1 },
  { w: 'TRENO',    s: ['TRE', 'NO'],           img: '🚂',  diff: 2 },
  { w: 'TORTA',    s: ['TOR', 'TA'],           img: '🎂',  diff: 2 },
  { w: 'TARTARUGA',s: ['TAR', 'TA', 'RU', 'GA'],img: '🐢', diff: 2 },
  { w: 'TULIPANO', s: ['TU', 'LI', 'PA', 'NO'],img: '🌷',  diff: 2 },
  { w: 'TIGRE',    s: ['TIG', 'RE'],           img: '🐯',  diff: 2 },
  { w: 'TINTA',    s: ['TIN', 'TA'],           img: '🎨',  diff: 2 },

  // --- S ---
  { w: 'SOLE',     s: ['SO', 'LE'],            img: '☀️',  diff: 1 },
  { w: 'SALE',     s: ['SA', 'LE'],            img: '🧂',  diff: 1 },
  { w: 'SODA',     s: ['SO', 'DA'],            img: '🥤',  diff: 1 },
  { w: 'SEME',     s: ['SE', 'ME'],            img: '🌱',  diff: 1 },
  { w: 'SASSO',    s: ['SA', 'SSO'],           img: '🪨',  diff: 1 },
  { w: 'SIRENA',   s: ['SI', 'RE', 'NA'],      img: '🧜‍♀️', diff: 2 },
  { w: 'SUGO',     s: ['SU', 'GO'],            img: '🍝',  diff: 1 },
  { w: 'SETA',     s: ['SE', 'TA'],            img: '🧣',  diff: 1 },
  { w: 'SAPONE',   s: ['SA', 'PO', 'NE'],      img: '🧼',  diff: 1 },
  { w: 'SETTE',    s: ['SET', 'TE'],           img: '7️⃣', diff: 1 },

  // --- N ---
  { w: 'NAVE',     s: ['NA', 'VE'],            img: '🚢',  diff: 1 },
  { w: 'NEVE',     s: ['NE', 'VE'],            img: '❄️',  diff: 1 },
  { w: 'NIDO',     s: ['NI', 'DO'],            img: '🪺',  diff: 1 },
  { w: 'NODO',     s: ['NO', 'DO'],            img: '🪢',  diff: 1 },
  { w: 'NUVOLA',   s: ['NU', 'VO', 'LA'],      img: '☁️',  diff: 2 },
  { w: 'NONNO',    s: ['NO', 'NNO'],           img: '👴',  diff: 1 },
  { w: 'NONNA',    s: ['NO', 'NNA'],           img: '👵',  diff: 1 },
  { w: 'NASO',     s: ['NA', 'SO'],            img: '👃',  diff: 1 },

  // --- B ---
  { w: 'BANANA',   s: ['BA', 'NA', 'NA'],      img: '🍌',  diff: 2 },
  { w: 'BALENA',   s: ['BA', 'LE', 'NA'],      img: '🐋',  diff: 2 },
  { w: 'BARCA',    s: ['BAR', 'CA'],           img: '⛵',  diff: 2 },
  { w: 'BOCCA',    s: ['BO', 'CCA'],           img: '👄',  diff: 1 },
  { w: 'BOLLE',    s: ['BO', 'LLE'],           img: '🫧',  diff: 1 },
  { w: 'BIMBA',    s: ['BIM', 'BA'],           img: '🧒',  diff: 1 },
  { w: 'BURRO',    s: ['BUR', 'RO'],           img: '🧈',  diff: 2 },
  { w: 'BUSTA',    s: ['BUS', 'TA'],           img: '✉️',  diff: 2 },

  // --- D ---
  { w: 'DADO',     s: ['DA', 'DO'],            img: '🎲',  diff: 1 },
  { w: 'DITO',     s: ['DI', 'TO'],            img: '☝️',  diff: 1 },
  { w: 'DENTE',    s: ['DE', 'NTE'],           img: '🦷',  diff: 2 },
  { w: 'DOLCE',    s: ['DOL', 'CE'],           img: '🍰',  diff: 2 },
  { w: 'DUE',      s: ['DU', 'E'],             img: '2️⃣', diff: 1 },
  { w: 'DIVANO',   s: ['DI', 'VA', 'NO'],      img: '🛋️',  diff: 1 },
  { w: 'DRAGO',    s: ['DRA', 'GO'],           img: '🐉',  diff: 2 },
  { w: 'DISCO',    s: ['DIS', 'CO'],           img: '🪩',  diff: 2 },

  // --- F ---
  { w: 'FOTO',     s: ['FO', 'TO'],            img: '📷',  diff: 1 },
  { w: 'FUMO',     s: ['FU', 'MO'],            img: '💨',  diff: 1 },
  { w: 'FATA',     s: ['FA', 'TA'],            img: '🧚',  diff: 1 },
  { w: 'FESTA',    s: ['FES', 'TA'],           img: '🎉',  diff: 2 },
  { w: 'FIORE',    s: ['FI', 'O', 'RE'],       img: '🌸',  diff: 1 },
  { w: 'FUNGO',    s: ['FUN', 'GO'],           img: '🍄',  diff: 2 },
  { w: 'FOGLIA',   s: ['FO', 'GLIA'],          img: '🍂',  diff: 2 },

  // --- R ---
  { w: 'RANA',     s: ['RA', 'NA'],            img: '🐸',  diff: 1 },
  { w: 'RISO',     s: ['RI', 'SO'],            img: '🍚',  diff: 1 },
  { w: 'ROSA',     s: ['RO', 'SA'],            img: '🌹',  diff: 1 },
  { w: 'RETE',     s: ['RE', 'TE'],            img: '🕸️', diff: 1 },
  { w: 'RUOTA',    s: ['RU', 'O', 'TA'],       img: '🛞',  diff: 2 },
  { w: 'REMO',     s: ['RE', 'MO'],            img: '🛶',  diff: 1 },
  { w: 'REGINA',   s: ['RE', 'GI', 'NA'],      img: '👑',  diff: 1 },

  // --- V ---
  { w: 'VELA',     s: ['VE', 'LA'],            img: '⛵',  diff: 1 },
  { w: 'VASO',     s: ['VA', 'SO'],            img: '🏺',  diff: 1 },
  { w: 'VITA',     s: ['VI', 'TA'],            img: null,  diff: 1 },
  { w: 'VESTITO',  s: ['VES', 'TI', 'TO'],     img: '👗',  diff: 2 },
  { w: 'VOLPE',    s: ['VOL', 'PE'],           img: '🦊',  diff: 2 },
  { w: 'VOLANO',   s: ['VO', 'LA', 'NO'],      img: '🏸',  diff: 1 },
  { w: 'VIOLA',    s: ['VI', 'O', 'LA'],       img: '💜',  diff: 1 },

  // --- Z ---
  { w: 'ZAINO',    s: ['ZA', 'I', 'NO'],       img: '🎒',  diff: 2 },
  { w: 'ZUCCA',    s: ['ZU', 'CCA'],           img: '🎃',  diff: 1 },
  { w: 'ZEBRA',    s: ['ZE', 'BRA'],           img: '🦓',  diff: 2 },
  { w: 'ZANZARA',  s: ['ZAN', 'ZA', 'RA'],     img: '🦟',  diff: 2 },
  { w: 'ZOO',      s: ['ZO', 'O'],             img: '🐘',  diff: 1 },
  { w: 'ZUPPA',    s: ['ZUP', 'PA'],           img: '🍜',  diff: 2 },

  // --- C ---
  { w: 'CANE',     s: ['CA', 'NE'],            img: '🐶',  diff: 1 },
  { w: 'CASA',     s: ['CA', 'SA'],            img: '🏠',  diff: 1 },
  { w: 'CENA',     s: ['CE', 'NA'],            img: '🍽️', diff: 1 },
  { w: 'CUBO',     s: ['CU', 'BO'],            img: '🧊',  diff: 1 },
  { w: 'CUCINA',   s: ['CU', 'CI', 'NA'],      img: '🍳',  diff: 2 },
  { w: 'CINEMA',   s: ['CI', 'NE', 'MA'],      img: '🎬',  diff: 2 },
  { w: 'COMETA',   s: ['CO', 'ME', 'TA'],      img: '☄️',  diff: 2 },
  { w: 'CIPOLLA',  s: ['CI', 'POL', 'LA'],     img: '🧅',  diff: 2 },
  { w: 'CONO',     s: ['CO', 'NO'],            img: '🍦',  diff: 1 },
  { w: 'CAROTA',   s: ['CA', 'RO', 'TA'],      img: '🥕',  diff: 1 },
  { w: 'CAPRA',    s: ['CA', 'PRA'],           img: '🐐',  diff: 2 },
  { w: 'CIRCO',    s: ['CIR', 'CO'],           img: '🎪',  diff: 2 },
  { w: 'CALZA',    s: ['CAL', 'ZA'],           img: '🧦',  diff: 2 },
  { w: 'CINQUE',   s: ['CIN', 'QUE'],          img: '5️⃣', diff: 2 },

  // --- G ---
  { w: 'GATTO',    s: ['GA', 'TTO'],           img: '🐱',  diff: 1 },
  { w: 'GALLO',    s: ['GA', 'LLO'],           img: '🐓',  diff: 1 },
  { w: 'GOMMA',    s: ['GO', 'MMA'],           img: null,  diff: 1 },
  { w: 'GUFO',     s: ['GU', 'FO'],            img: '🦉',  diff: 1 },
  { w: 'GIRAFFA',  s: ['GI', 'RA', 'FFA'],     img: '🦒',  diff: 2 },
  { w: 'GAMBA',    s: ['GA', 'MBA'],           img: '🦵',  diff: 2 },
  { w: 'GELATO',   s: ['GE', 'LA', 'TO'],      img: '🍨',  diff: 1 },
  { w: 'GESSO',    s: ['GES', 'SO'],           img: '🖍️',  diff: 2 },
  { w: 'GRILLO',   s: ['GRIL', 'LO'],          img: '🦗',  diff: 2 },

  // --- parole che iniziano con vocale (bastano le vocali attive
  //     + la seconda sillaba studiata) ---
  { w: 'APE',      s: ['A', 'PE'],             img: '🐝',  diff: 1 },
  { w: 'UVA',      s: ['U', 'VA'],             img: '🍇',  diff: 1 },
  { w: 'OCA',      s: ['O', 'CA'],             img: '🦢',  diff: 1 },
  { w: 'ALI',      s: ['A', 'LI'],             img: '🪽',  diff: 1 },
  { w: 'UNO',      s: ['U', 'NO'],             img: '1️⃣', diff: 1 },
  { w: 'ERBA',     s: ['ER', 'BA'],            img: '🌿',  diff: 2 },
  { w: 'ORTO',     s: ['OR', 'TO'],            img: '🥬',  diff: 2 },
  { w: 'ALBERO',   s: ['AL', 'BE', 'RO'],      img: '🌳',  diff: 2 },
  { w: 'ELICA',    s: ['E', 'LI', 'CA'],       img: '🚁',  diff: 1 },

  // --- strutture speciali (richiedono flag dedicate nel pannello genitore) ---
  { w: 'BAGNO',    s: ['BA', 'GNO'],           img: '🛁',  diff: 2 },
  { w: 'CONIGLIO', s: ['CO', 'NI', 'GLIO'],    img: '🐰',  diff: 2 }
];

// Indice rapido per parola (maiuscole)
IAL.WORDS_BY_KEY = {};
IAL.WORDS.forEach(function (entry) {
  IAL.WORDS_BY_KEY[entry.w.toUpperCase()] = entry;
});
