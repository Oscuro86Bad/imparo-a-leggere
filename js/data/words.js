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
  { w: 'PIRATA',   s: ['PI', 'RA', 'TA'],      img: 'img/pirata.svg', diff: 2 },
  { w: 'POMODORO', s: ['PO', 'MO', 'DO', 'RO'],img: '🍅',  diff: 2 },
  { w: 'PUPPA',    s: ['PU', 'PPA'],           img: null,  diff: 1 },
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
  { w: 'POMPA',    s: ['POM', 'PA'],           img: '⛽',  diff: 2 },
  { w: 'PISTA',    s: ['PI', 'STA'],           img: '🏁',  diff: 2 },
  { w: 'PADELLA',  s: ['PA', 'DEL', 'LA'],     img: '🍳',  diff: 1 },
  { w: 'PAVONE',   s: ['PA', 'VO', 'NE'],      img: '🦚',  diff: 1 },
  { w: 'PATATINE', s: ['PA', 'TA', 'TI', 'NE'],img: '🍟',  diff: 1 },
  { w: 'PELUCHE',  s: ['PE', 'LU', 'CHE'],     img: '🧸',  diff: 1 },
  { w: 'PISCINA',  s: ['PI', 'SCI', 'NA'],     img: '🏊',  diff: 2 },
  { w: 'POMATA',   s: ['PO', 'MA', 'TA'],      img: '🧴',  diff: 1 },
  { w: 'PEPE',     s: ['PE', 'PE'],            img: null,  diff: 1 },
  { w: 'POLO',     s: ['PO', 'LO'],            img: null,  diff: 1 },
  { w: 'PALO',     s: ['PA', 'LO'],            img: null,  diff: 1 },
  { w: 'PELO',     s: ['PE', 'LO'],            img: null,  diff: 1 },

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
  { w: 'MIMO',     s: ['MI', 'MO'],            img: 'img/mimo.svg', diff: 1 },
  { w: 'MELO',     s: ['ME', 'LO'],            img: '🌳🍎', diff: 1 },
  { w: 'MARE',     s: ['MA', 'RE'],            img: '🌊',  diff: 1 },
  { w: 'MANGO',    s: ['MAN', 'GO'],           img: '🥭',  diff: 2 },
  { w: 'MOLLA',    s: ['MOL', 'LA'],           img: '🪀',  diff: 2 },
  { w: 'MUSICA',   s: ['MU', 'SI', 'CA'],      img: '🎶',  diff: 1 },
  { w: 'MONDO',    s: ['MON', 'DO'],           img: '🌍',  diff: 2 },
  { w: 'MANZO',    s: ['MAN', 'ZO'],           img: '🥩',  diff: 2 },
  { w: 'MUCCA',    s: ['MUC', 'CA'],           img: '🐄',  diff: 1 },
  { w: 'MAIALE',   s: ['MA', 'IA', 'LE'],      img: '🐷',  diff: 1 },
  { w: 'MAGO',     s: ['MA', 'GO'],            img: '🧙',  diff: 1 },
  { w: 'MAGIA',    s: ['MA', 'GIA'],           img: 'img/magia.svg', diff: 2 },
  { w: 'MAESTRA',  s: ['MA', 'E', 'STRA'],     img: '👩‍🏫', diff: 2 },
  { w: 'MERENDA',  s: ['ME', 'REN', 'DA'],     img: 'img/merenda.svg', diff: 1 },
  { w: 'METEO',    s: ['ME', 'TE', 'O'],       img: '🌦️', diff: 1 },
  { w: 'MOSCA',    s: ['MO', 'SCA'],           img: '🪰',  diff: 2 },
  { w: 'MURO',     s: ['MU', 'RO'],            img: '🧱',  diff: 1 },
  { w: 'MUSEO',    s: ['MU', 'SE', 'O'],       img: '🏛️', diff: 2 },
  { w: 'MUTA',     s: ['MU', 'TA'],            img: '🤿',  diff: 2 },
  { w: 'MOLO',     s: ['MO', 'LO'],            img: '⚓',  diff: 1 },
  { w: 'MUTO',     s: ['MU', 'TO'],            img: '🤐',  diff: 2 },
  { w: 'MOTORE',   s: ['MO', 'TO', 'RE'],      img: '⚙️', diff: 2 },
  { w: 'METTO',    s: ['ME', 'TTO'],           img: null,  diff: 2 },

  // --- L ---
  { w: 'LANA',     s: ['LA', 'NA'],            img: '🧶',  diff: 1 },
  { w: 'LUNA',     s: ['LU', 'NA'],            img: '🌙',  diff: 1 },
  { w: 'LAGO',     s: ['LA', 'GO'],            img: 'img/lago.svg', diff: 1 },
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
  { w: 'LUMACA',   s: ['LU', 'MA', 'CA'],      img: '🐌',  diff: 1 },
  { w: 'LAVA',     s: ['LA', 'VA'],            img: '🌋',  diff: 1 },
  { w: 'LEGUME',   s: ['LE', 'GU', 'ME'],      img: '🫘',  diff: 2 },
  { w: 'LOMBRICO', s: ['LO', 'MBRI', 'CO'],    img: '🪱',  diff: 2 },
  { w: 'LUCERTOLA',s: ['LU', 'CE', 'RTO', 'LA'],img: '🦎', diff: 2 },
  { w: 'LOTO',     s: ['LO', 'TO'],            img: '🪷',  diff: 1 },
  { w: 'LUME',     s: ['LU', 'ME'],            img: '🪔',  diff: 1 },
  { w: 'LETTO',    s: ['LE', 'TTO'],           img: '🛏️', diff: 1 },
  { w: 'LATO',     s: ['LA', 'TO'],            img: null,  diff: 1 },
  { w: 'LIMA',     s: ['LI', 'MA'],            img: null,  diff: 2 },

  // --- T ---
  { w: 'TOPO',     s: ['TO', 'PO'],            img: '🐭',  diff: 1 },
  { w: 'TAVOLO',   s: ['TA', 'VO', 'LO'],      img: 'img/tavolo.svg', diff: 2 },
  { w: 'TELE',     s: ['TE', 'LE'],            img: '📺',  diff: 1 },
  { w: 'TAZZA',    s: ['TA', 'ZZA'],           img: '☕',  diff: 1 },
  { w: 'TRENO',    s: ['TRE', 'NO'],           img: '🚂',  diff: 2 },
  { w: 'TORTA',    s: ['TOR', 'TA'],           img: '🎂',  diff: 2 },
  { w: 'TARTARUGA',s: ['TAR', 'TA', 'RU', 'GA'],img: '🐢', diff: 2 },
  { w: 'TULIPANO', s: ['TU', 'LI', 'PA', 'NO'],img: '🌷',  diff: 2 },
  { w: 'TIGRE',    s: ['TIG', 'RE'],           img: '🐯',  diff: 2 },
  { w: 'TINTA',    s: ['TIN', 'TA'],           img: '🎨',  diff: 2 },
  { w: 'TELA',     s: ['TE', 'LA'],            img: '🧵',  diff: 1 },
  { w: 'TUTA',     s: ['TU', 'TA'],            img: 'img/tuta.svg', diff: 1 },
  { w: 'TATA',     s: ['TA', 'TA'],            img: '🧑‍🍼', diff: 1 },
  { w: 'TUTU',     s: ['TU', 'TU'],            img: 'img/tutu.svg', diff: 1 },
  { w: 'TETTO',    s: ['TE', 'TTO'],           img: 'img/tetto.svg', diff: 2 },
  { w: 'TATTO',    s: ['TA', 'TTO'],           img: '🖐️',  diff: 2 },
  { w: 'TUTTO',    s: ['TU', 'TTO'],           img: null,  diff: 2 },
  { w: 'TAPPO',    s: ['TA', 'PPO'],           img: '🍾',  diff: 1 },
  { w: 'TEMA',     s: ['TE', 'MA'],            img: null,  diff: 2 },
  { w: 'TOMO',     s: ['TO', 'MO'],            img: null,  diff: 2 },
  { w: 'TUTELA',   s: ['TU', 'TE', 'LA'],      img: null,  diff: 2 },
  { w: 'TUTORE',   s: ['TU', 'TO', 'RE'],      img: null,  diff: 2 },
  { w: 'TEATRO',   s: ['TE', 'A', 'TRO'],      img: '🎭',  diff: 2 },
  { w: 'TELEFONO', s: ['TE', 'LE', 'FO', 'NO'],img: '📞',  diff: 1 },
  { w: 'TANGO',    s: ['TAN', 'GO'],           img: '💃',  diff: 2 },
  { w: 'TRE',      s: ['TRE'],                 img: '3️⃣', diff: 1 },
  { w: 'OTTO',     s: ['OT', 'TO'],            img: '8️⃣', diff: 1 },
  { w: 'NOVE',     s: ['NO', 'VE'],            img: '9️⃣', diff: 1 },

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
  { w: 'SALAME',   s: ['SA', 'LA', 'ME'],      img: '🥓',  diff: 1 },
  { w: 'SATURNO',  s: ['SA', 'TUR', 'NO'],     img: '🪐',  diff: 2 },
  { w: 'SERA',     s: ['SE', 'RA'],            img: '🌇',  diff: 1 },
  { w: 'SEDILE',   s: ['SE', 'DI', 'LE'],      img: '💺',  diff: 1 },

  // --- N ---
  { w: 'NAVE',     s: ['NA', 'VE'],            img: '🚢',  diff: 1 },
  { w: 'NEVE',     s: ['NE', 'VE'],            img: '❄️',  diff: 1 },
  { w: 'NIDO',     s: ['NI', 'DO'],            img: '🪺',  diff: 1 },
  { w: 'NODO',     s: ['NO', 'DO'],            img: '🪢',  diff: 1 },
  { w: 'NUVOLA',   s: ['NU', 'VO', 'LA'],      img: '☁️',  diff: 2 },
  { w: 'NONNO',    s: ['NO', 'NNO'],           img: '👴',  diff: 1 },
  { w: 'NONNA',    s: ['NO', 'NNA'],           img: '👵',  diff: 1 },
  { w: 'NASO',     s: ['NA', 'SO'],            img: '👃',  diff: 1 },
  { w: 'NERO',     s: ['NE', 'RO'],            img: '⚫',  diff: 1 },

  // --- B ---
  { w: 'BANANA',   s: ['BA', 'NA', 'NA'],      img: '🍌',  diff: 2 },
  { w: 'BALENA',   s: ['BA', 'LE', 'NA'],      img: '🐋',  diff: 2 },
  { w: 'BARCA',    s: ['BAR', 'CA'],           img: '⛵',  diff: 2 },
  { w: 'BOCCA',    s: ['BO', 'CCA'],           img: '👄',  diff: 1 },
  { w: 'BOLLE',    s: ['BO', 'LLE'],           img: '🫧',  diff: 1 },
  { w: 'BIMBA',    s: ['BIM', 'BA'],           img: '🧒',  diff: 1 },
  { w: 'BURRO',    s: ['BUR', 'RO'],           img: '🧈',  diff: 2 },
  { w: 'BUSTA',    s: ['BUS', 'TA'],           img: '✉️',  diff: 2 },
  { w: 'BOTTE',    s: ['BOT', 'TE'],           img: '🛢️',  diff: 2 },
  { w: 'BICICLETTA', s: ['BI', 'CI', 'CLET', 'TA'], img: '🚲', diff: 1 },
  { w: 'BUE',      s: ['BU', 'E'],             img: '🐂',  diff: 2 },

  // --- D ---
  { w: 'DADO',     s: ['DA', 'DO'],            img: '🎲',  diff: 1 },
  { w: 'DITO',     s: ['DI', 'TO'],            img: '☝️',  diff: 1 },
  { w: 'DENTE',    s: ['DE', 'NTE'],           img: '🦷',  diff: 2 },
  { w: 'DOLCE',    s: ['DOL', 'CE'],           img: '🍰',  diff: 2 },
  { w: 'DUE',      s: ['DU', 'E'],             img: '2️⃣', diff: 1 },
  { w: 'DIVANO',   s: ['DI', 'VA', 'NO'],      img: '🛋️',  diff: 1 },
  { w: 'DRAGO',    s: ['DRA', 'GO'],           img: '🐉',  diff: 2 },
  { w: 'DISCO',    s: ['DIS', 'CO'],           img: '🪩',  diff: 2 },
  { w: 'DAINO',    s: ['DA', 'I', 'NO'],       img: '🦌',  diff: 2 },
  { w: 'DINOSAURO', s: ['DI', 'NO', 'SA', 'U', 'RO'], img: '🦕', diff: 1 },
  { w: 'DONO',     s: ['DO', 'NO'],            img: '🎁',  diff: 1 },

  // --- F ---
  { w: 'FOTO',     s: ['FO', 'TO'],            img: '📷',  diff: 1 },
  { w: 'FUMO',     s: ['FU', 'MO'],            img: '💨',  diff: 1 },
  { w: 'FATA',     s: ['FA', 'TA'],            img: '🧚',  diff: 1 },
  { w: 'FESTA',    s: ['FES', 'TA'],           img: '🎉',  diff: 2 },
  { w: 'FIORE',    s: ['FI', 'O', 'RE'],       img: '🌸',  diff: 1 },
  { w: 'FUNGO',    s: ['FUN', 'GO'],           img: '🍄',  diff: 2 },
  { w: 'FOGLIA',   s: ['FO', 'GLIA'],          img: '🍂',  diff: 2 },
  { w: 'FOCA',     s: ['FO', 'CA'],            img: '🦭',  diff: 1 },

  // --- R ---
  { w: 'RANA',     s: ['RA', 'NA'],            img: '🐸',  diff: 1 },
  { w: 'RISO',     s: ['RI', 'SO'],            img: '🍚',  diff: 1 },
  { w: 'ROSA',     s: ['RO', 'SA'],            img: '🌹',  diff: 1 },
  { w: 'RETE',     s: ['RE', 'TE'],            img: '🕸️', diff: 1 },
  { w: 'RUOTA',    s: ['RU', 'O', 'TA'],       img: '🛞',  diff: 2 },
  { w: 'REMO',     s: ['RE', 'MO'],            img: '🛶',  diff: 1 },
  { w: 'REGINA',   s: ['RE', 'GI', 'NA'],      img: '👑',  diff: 1 },
  { w: 'ROSSO',    s: ['ROS', 'SO'],           img: '🔴',  diff: 2 },
  { w: 'ROBOT',    s: ['RO', 'BOT'],           img: '🤖',  diff: 1 },
  { w: 'RAGAZZA',  s: ['RA', 'GAZ', 'ZA'],     img: '👧',  diff: 1 },
  { w: 'RAGNO',    s: ['RA', 'GNO'],           img: '🕷️', diff: 2 },

  // --- V ---
  { w: 'VELA',     s: ['VE', 'LA'],            img: '⛵',  diff: 1 },
  { w: 'VASO',     s: ['VA', 'SO'],            img: '🏺',  diff: 1 },
  { w: 'VITA',     s: ['VI', 'TA'],            img: null,  diff: 1 },
  { w: 'VESTITO',  s: ['VES', 'TI', 'TO'],     img: '👗',  diff: 2 },
  { w: 'VOLPE',    s: ['VOL', 'PE'],           img: '🦊',  diff: 2 },
  { w: 'VOLANO',   s: ['VO', 'LA', 'NO'],      img: '🏸',  diff: 1 },
  { w: 'VIOLA',    s: ['VI', 'O', 'LA'],       img: '💜',  diff: 1 },
  { w: 'VERDE',    s: ['VER', 'DE'],           img: '🟢',  diff: 1 },
  { w: 'BLU',      s: ['BLU'],                 img: '🔵',  diff: 1 },
  { w: 'VOLO',     s: ['VO', 'LO'],            img: '✈️',  diff: 1 },
  { w: 'VAGONE',   s: ['VA', 'GO', 'NE'],      img: '🚃',  diff: 2 },
  { w: 'VALIGIA',  s: ['VA', 'LI', 'GIA'],     img: '🧳',  diff: 1 },

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
  { w: 'CORNO',    s: ['COR', 'NO'],           img: '🎺',  diff: 2 },
  { w: 'CAVALLO',  s: ['CA', 'VAL', 'LO'],     img: '🐴',  diff: 1 },

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
  { w: 'GUANTI',   s: ['GUAN', 'TI'],          img: '🧤',  diff: 2 },
  { w: 'GIRASOLE', s: ['GI', 'RA', 'SO', 'LE'],img: '🌻',  diff: 1 },
  { w: 'GORILLA',  s: ['GO', 'RIL', 'LA'],     img: '🦍',  diff: 2 },

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
  { w: 'CONIGLIO', s: ['CO', 'NI', 'GLIO'],    img: '🐰',  diff: 2 },

  // --- parole concrete del libro di scuola (Metodo "Orso curioso 1") ---
  { w: 'ORSO',     s: ['OR', 'SO'],            img: '🐻',  diff: 1 },
  { w: 'PARCO',    s: ['PAR', 'CO'],           img: '🏞️', diff: 1 },
  { w: 'TERRA',    s: ['TER', 'RA'],           img: '🌍',  diff: 1 },
  { w: 'CESTA',    s: ['CE', 'STA'],           img: '🧺',  diff: 1 },
  { w: 'FUNE',     s: ['FU', 'NE'],            img: '🪢',  diff: 1 },
  { w: 'POLPO',    s: ['POL', 'PO'],           img: '🐙',  diff: 1 },
  { w: 'CASTELLO', s: ['CA', 'STEL', 'LO'],    img: '🏰',  diff: 1 },
  { w: 'AMICA',    s: ['A', 'MI', 'CA'],       img: '👧',  diff: 1 },
  { w: 'ACQUA',    s: ['AC', 'QUA'],           img: '💧',  diff: 2 },
  { w: 'FARFALLA', s: ['FAR', 'FAL', 'LA'],    img: '🦋',  diff: 2 },
  { w: 'FORMICA',  s: ['FOR', 'MI', 'CA'],     img: '🐜',  diff: 2 },
  { w: 'DELFINO',  s: ['DEL', 'FI', 'NO'],     img: '🐬',  diff: 2 },
  { w: 'BRUCO',    s: ['BRU', 'CO'],           img: '🐛',  diff: 2 },
  { w: 'RICCIO',   s: ['RIC', 'CIO'],          img: '🦔',  diff: 2 },
  { w: 'ISTRICE',  s: ['I', 'STRI', 'CE'],     img: '🦔',  diff: 2 },
  { w: 'USIGNOLO', s: ['U', 'SI', 'GNO', 'LO'],img: '🐦',  diff: 2 },
  { w: 'AQUILONE', s: ['A', 'QUI', 'LO', 'NE'],img: '🪁',  diff: 2 },
  { w: 'GIOSTRA',  s: ['GIO', 'STRA'],         img: '🎠',  diff: 2 },
  { w: 'SCATOLA',  s: ['SCA', 'TO', 'LA'],     img: '📦',  diff: 2 },
  { w: 'BARATTOLO',s: ['BA', 'RAT', 'TO', 'LO'],img: '🫙', diff: 2 },
  { w: 'QUERCIA',  s: ['QUER', 'CIA'],         img: '🌳',  diff: 2 },
  { w: 'PIUMA',    s: ['PIU', 'MA'],           img: '🪶',  diff: 2 },
  { w: 'FORBICI',  s: ['FOR', 'BI', 'CI'],     img: '✂️', diff: 2 },
  { w: 'FAMIGLIA', s: ['FA', 'MI', 'GLIA'],    img: '👨‍👩‍👧‍👦', diff: 2 },
  { w: 'VIAGGIO',  s: ['VIAG', 'GIO'],         img: '✈️', diff: 2 },
  { w: 'CANZONE',  s: ['CAN', 'ZO', 'NE'],     img: '🎵',  diff: 2 },
  { w: 'ZAINETTO', s: ['ZAI', 'NET', 'TO'],    img: '🎒',  diff: 2 },
  { w: 'COMPAGNO', s: ['COM', 'PA', 'GNO'],    img: '👦',  diff: 2 },
  { w: 'MEDUSA',   s: ['ME', 'DU', 'SA'],      img: '🪼',  diff: 2 },
  { w: 'INVERNO',  s: ['IN', 'VER', 'NO'],     img: '❄️', diff: 2 },
  { w: 'FUOCO',    s: ['FUO', 'CO'],           img: '🔥',  diff: 2 },
  { w: 'FOGLIO',   s: ['FO', 'GLIO'],          img: '📄',  diff: 2 },
  { w: 'CIELO',    s: ['CIE', 'LO'],           img: '🌤️', diff: 2 },
  { w: 'UOVA',     s: ['UO', 'VA'],            img: '🥚',  diff: 2 },
  { w: 'EDERA',    s: ['E', 'DE', 'RA'],       img: '🌿',  diff: 2 },
  { w: 'SCIROPPO', s: ['SCI', 'ROP', 'PO'],    img: '🧃',  diff: 2 },
  { w: 'XILOFONO', s: ['XI', 'LO', 'FO', 'NO'],img: '🎶',  diff: 2 },

  // --- ampliamento del vocabolario: parole concrete, una o più per
  //     ogni combinazione consonante+vocale, con immagine chiara ---

  // --- B ---
  { w: 'BENE',     s: ['BE', 'NE'],             img: '👍',  diff: 1 },
  { w: 'BEFANA',   s: ['BE', 'FA', 'NA'],       img: '🧙‍♀️', diff: 2 },
  { w: 'BEVANDA',  s: ['BE', 'VAN', 'DA'],      img: '🥤',  diff: 2 },
  { w: 'BISONTE',  s: ['BI', 'SON', 'TE'],      img: '🦬',  diff: 2 },
  { w: 'BIDONE',   s: ['BI', 'DO', 'NE'],       img: '🗑️', diff: 1 },
  { w: 'BIRILLO',  s: ['BI', 'RIL', 'LO'],      img: '🎳',  diff: 2 },
  { w: 'BOTTONE',  s: ['BOT', 'TO', 'NE'],      img: '🔘',  diff: 1 },
  { w: 'BUCO',     s: ['BU', 'CO'],             img: '🕳️', diff: 1 },
  { w: 'BUSSOLA',  s: ['BUS', 'SO', 'LA'],      img: '🧭',  diff: 2 },
  { w: 'BALCONE',  s: ['BAL', 'CO', 'NE'],      img: '🏠',  diff: 2 },

  // --- C ---
  { w: 'CULLA',    s: ['CUL', 'LA'],            img: '🛏️', diff: 2 },
  { w: 'CUPOLA',   s: ['CU', 'PO', 'LA'],       img: '🏛️', diff: 2 },
  { w: 'CUCULO',   s: ['CU', 'CU', 'LO'],       img: '🐦',  diff: 2 },
  { w: 'CESTINO',  s: ['CE', 'STI', 'NO'],      img: '🗑️', diff: 1 },
  { w: 'CIGNO',    s: ['CI', 'GNO'],            img: '🦢',  diff: 2 },
  { w: 'COLLINA',  s: ['COL', 'LI', 'NA'],      img: '⛰️', diff: 2 },
  { w: 'CACTUS',   s: ['CAC', 'TUS'],           img: '🌵',  diff: 2 },
  { w: 'CASCATA',  s: ['CA', 'SCA', 'TA'],      img: '💦',  diff: 2 },
  { w: 'COCCODRILLO', s: ['COC', 'COD', 'RIL', 'LO'], img: '🐊', diff: 2 },
  { w: 'CAMPANA',  s: ['CAM', 'PA', 'NA'],      img: '🔔',  diff: 1 },

  // --- D ---
  { w: 'DUNA',     s: ['DU', 'NA'],             img: '🏖️', diff: 2 },
  { w: 'DUCA',     s: ['DU', 'CA'],             img: '🤴',  diff: 2 },
  { w: 'DENTI',    s: ['DEN', 'TI'],            img: '🦷',  diff: 1 },

  // --- F ---
  { w: 'FENICOTTERO', s: ['FE', 'NI', 'COT', 'TE', 'RO'], img: '🦩', diff: 2 },
  { w: 'FENICE',   s: ['FE', 'NI', 'CE'],       img: '🐦‍🔥', diff: 2 },
  { w: 'FELICE',   s: ['FE', 'LI', 'CE'],       img: '😊',  diff: 1 },
  { w: 'FARO',     s: ['FA', 'RO'],             img: 'img/faro.svg', diff: 1 },
  { w: 'FILO',     s: ['FI', 'LO'],             img: '🧵',  diff: 1 },
  { w: 'FUMETTO',  s: ['FU', 'MET', 'TO'],      img: '📚',  diff: 2 },
  { w: 'FUNAMBOLO',s: ['FU', 'NAM', 'BO', 'LO'],img: '🤹',  diff: 2 },
  { w: 'FALCO',    s: ['FAL', 'CO'],            img: '🦅',  diff: 2 },
  { w: 'FISCHIO',  s: ['FIS', 'CHIO'],          img: 'img/fischio.svg', diff: 2 },

  // --- G ---
  { w: 'GELO',     s: ['GE', 'LO'],             img: '❄️', diff: 1 },
  { w: 'GEMELLI',  s: ['GE', 'MEL', 'LI'],      img: '👯',  diff: 2 },
  { w: 'GUSCIO',   s: ['GU', 'SCIO'],           img: '🐚',  diff: 2 },
  { w: 'GIRINO',   s: ['GI', 'RI', 'NO'],       img: '🐸',  diff: 1 },
  { w: 'GONNA',    s: ['GON', 'NA'],            img: '👗',  diff: 2 },
  { w: 'GALLINA',  s: ['GAL', 'LI', 'NA'],      img: '🐔',  diff: 1 },
  { w: 'GRANCHIO', s: ['GRAN', 'CHIO'],         img: '🦀',  diff: 2 },
  { w: 'GIRANDOLA',s: ['GI', 'RAN', 'DO', 'LA'],img: '🎡',  diff: 2 },

  // --- L ---
  { w: 'LONTRA',   s: ['LON', 'TRA'],           img: '🦦',  diff: 2 },
  { w: 'LUCCHETTO',s: ['LUC', 'CHET', 'TO'],    img: '🔒',  diff: 2 },
  { w: 'LATTA',    s: ['LAT', 'TA'],            img: '🥫',  diff: 1 },

  // --- M ---
  { w: 'MIRTILLO', s: ['MIR', 'TIL', 'LO'],     img: '🫐',  diff: 2 },
  { w: 'MERCATO',  s: ['MER', 'CA', 'TO'],      img: '🛒',  diff: 2 },
  { w: 'MANDORLA', s: ['MAN', 'DOR', 'LA'],     img: '🌰',  diff: 2 },
  { w: 'MORA',     s: ['MO', 'RA'],             img: '🫐',  diff: 2 },
  { w: 'MELAGRANA',s: ['ME', 'LA', 'GRA', 'NA'],img: '🍎',  diff: 2 },
  { w: 'MELOGRANO',s: ['ME', 'LO', 'GRA', 'NO'],img: '🍎',  diff: 2 },

  // --- N ---
  { w: 'NUVOLE',   s: ['NU', 'VO', 'LE'],       img: '☁️',  diff: 1 },
  { w: 'NUTRIA',   s: ['NU', 'TRIA'],           img: 'img/nutria.svg', diff: 2 },
  { w: 'NOCE',     s: ['NO', 'CE'],             img: '🌰',  diff: 2 },
  { w: 'NIPOTE',   s: ['NI', 'PO', 'TE'],       img: '🧒',  diff: 2 },

  // --- P ---
  { w: 'PUGNO',    s: ['PU', 'GNO'],            img: '✊',  diff: 1 },
  { w: 'PUGILE',   s: ['PU', 'GI', 'LE'],       img: '🥊',  diff: 2 },
  { w: 'PALLONE',  s: ['PAL', 'LO', 'NE'],      img: '⚽',  diff: 1 },
  { w: 'PENNELLO', s: ['PEN', 'NEL', 'LO'],     img: '🖌️', diff: 2 },
  { w: 'PIPISTRELLO', s: ['PI', 'PI', 'STREL', 'LO'], img: '🦇', diff: 2 },
  { w: 'POMELO',   s: ['PO', 'ME', 'LO'],       img: '🍊',  diff: 2 },
  { w: 'PATTINI',  s: ['PAT', 'TI', 'NI'],      img: '🛼',  diff: 2 },
  { w: 'PASTA',    s: ['PA', 'STA'],            img: '🍝',  diff: 1 },

  // --- Q ---
  { w: 'QUADRO',   s: ['QUA', 'DRO'],           img: '🖼️', diff: 2 },
  { w: 'QUADERNO', s: ['QUA', 'DER', 'NO'],     img: '📓',  diff: 2 },
  { w: 'QUAGLIA',  s: ['QUA', 'GLIA'],          img: '🐦',  diff: 2 },
  { w: 'QUADRETTO',s: ['QUA', 'DRET', 'TO'],    img: '🖼️', diff: 2 },
  { w: 'QUESTO',   s: ['QUE', 'STO'],           img: '👉',  diff: 1 },
  { w: 'QUI',      s: ['QUI'],                  img: '📍',  diff: 1 },
  { w: 'QUOTA',    s: ['QUO', 'TA'],            img: 'img/quota.svg', diff: 2 },

  // --- R ---
  { w: 'RIGA',     s: ['RI', 'GA'],             img: '📏',  diff: 1 },
  { w: 'RIVA',     s: ['RI', 'VA'],             img: '🏞️', diff: 2 },
  { w: 'RUBINETTO',s: ['RU', 'BI', 'NET', 'TO'],img: '🚰',  diff: 2 },
  { w: 'RUMORE',   s: ['RU', 'MO', 'RE'],       img: '🔊',  diff: 2 },
  { w: 'RONDINE',  s: ['RON', 'DI', 'NE'],      img: '🐦',  diff: 2 },
  { w: 'RAZZO',    s: ['RAZ', 'ZO'],            img: '🚀',  diff: 2 },
  { w: 'RACCHETTA',s: ['RAC', 'CHET', 'TA'],    img: '🎾',  diff: 2 },

  // --- S ---
  { w: 'SUGHERO',  s: ['SU', 'GHE', 'RO'],      img: '🍾',  diff: 2 },
  { w: 'SUSINA',   s: ['SU', 'SI', 'NA'],       img: 'img/susina.svg', diff: 2 },
  { w: 'SEMAFORO', s: ['SE', 'MA', 'FO', 'RO'], img: '🚦',  diff: 1 },
  { w: 'SEDANO',   s: ['SE', 'DA', 'NO'],       img: '🥬',  diff: 2 },
  { w: 'SQUALO',   s: ['SQUA', 'LO'],           img: '🦈',  diff: 2 },
  { w: 'SERPE',    s: ['SER', 'PE'],            img: '🐍',  diff: 2 },
  { w: 'SCIARPA',  s: ['SCIAR', 'PA'],          img: '🧣',  diff: 2 },

  // --- T ---
  { w: 'TINOZZA',  s: ['TI', 'NOZ', 'ZA'],      img: '🛁',  diff: 2 },
  { w: 'TIMO',     s: ['TI', 'MO'],             img: '🌿',  diff: 2 },
  { w: 'TRONCO',   s: ['TRON', 'CO'],           img: '🪵',  diff: 2 },
  { w: 'TIBURONE', s: ['TI', 'BU', 'RO', 'NE'], img: '🦈',  diff: 2 },
  { w: 'TUCANO',   s: ['TU', 'CA', 'NO'],       img: '🦜',  diff: 2 },
  { w: 'TARTINA',  s: ['TAR', 'TI', 'NA'],      img: '🥪',  diff: 2 },

  // --- V ---
  { w: 'VISO',     s: ['VI', 'SO'],             img: '🙂',  diff: 1 },
  { w: 'VIGNA',    s: ['VI', 'GNA'],            img: '🍇',  diff: 2 },
  { w: 'VAPORE',   s: ['VA', 'PO', 'RE'],       img: '💨',  diff: 2 },
  { w: 'VULCANO',  s: ['VUL', 'CA', 'NO'],      img: '🌋',  diff: 2 },
  { w: 'VOLANTE',  s: ['VO', 'LAN', 'TE'],      img: '🚗',  diff: 2 },

  // --- Z ---
  { w: 'ZEBRE',    s: ['ZE', 'BRE'],            img: '🦓',  diff: 1 },
  { w: 'ZIA',      s: ['ZI', 'A'],              img: '👩',  diff: 1 },
  { w: 'ZIO',      s: ['ZI', 'O'],              img: '👨',  diff: 1 },
  { w: 'ZUFOLO',   s: ['ZU', 'FO', 'LO'],       img: 'img/zufolo.svg', diff: 2 },
  { w: 'ZERO',     s: ['ZE', 'RO'],             img: '0️⃣', diff: 1 },
  { w: 'ZUCCHERO', s: ['ZUC', 'CHE', 'RO'],     img: '🍬',  diff: 1 },
  { w: 'ZIP',      s: ['ZIP'],                  img: 'img/zip.svg', diff: 2 },
  { w: 'ZIBIBBO',  s: ['ZI', 'BIB', 'BO'],      img: '🍇',  diff: 2 },
  { w: 'ZUMO',     s: ['ZU', 'MO'],             img: '🧃',  diff: 2 },

  // --- vocale iniziale ---
  { w: 'OSTRICA',  s: ['O', 'STRICA'],          img: '🦪',  diff: 2 }
];

// Indice rapido per parola (maiuscole)
IAL.WORDS_BY_KEY = {};
IAL.WORDS.forEach(function (entry) {
  IAL.WORDS_BY_KEY[entry.w.toUpperCase()] = entry;
});

// ------------------------------------------------------------
// Parole AGGIUNTIVE solo per COMPLETA LA PAROLA.
// Questa sezione è svincolata da lunghezze, livelli e sillabe
// dell'Area Genitori: il bambino deve solo scrivere le ultime due
// lettere, quindi si possono usare parole lunghe e ricche.
// L'unico requisito è che la parola contenga almeno una consonante
// attiva (il motore fa il filtro). Qui non serve la sillabazione:
// queste voci non entrano nelle altre sezioni.
// ------------------------------------------------------------
IAL.COMPLETE_EXTRA = [
  // --- B ---
  { w: 'BAMBOLA',    img: '🪆' },
  { w: 'BISCOTTO',   img: '🍪' },
  { w: 'BICCHIERE',  img: '🥛' },
  { w: 'BANDIERA',   img: '🚩' },
  { w: 'BOTTIGLIA',  img: '🍾' },
  { w: 'BILANCIA',   img: '⚖️' },
  { w: 'BOSCO',      img: '🌲' },
  { w: 'BARBA',      img: '🧔' },
  { w: 'BUFALO',     img: '🐃' },
  { w: 'BIBLIOTECA', img: '📚' },

  // --- C ---
  { w: 'CANGURO',    img: '🦘' },
  { w: 'CAMMELLO',   img: '🐫' },
  { w: 'CORONA',     img: '👑' },
  { w: 'CUCCHIAIO',  img: '🥄' },
  { w: 'CAMICIA',    img: '👕' },
  { w: 'CASTAGNA',   img: '🌰' },
  { w: 'CILIEGIA',   img: '🍒' },
  { w: 'CALAMARO',   img: '🦑' },
  { w: 'CANDELA',    img: '🕯️' },
  { w: 'CARAMELLA',  img: '🍬' },
  { w: 'CHITARRA',   img: '🎸' },
  { w: 'CINGHIALE',  img: '🐗' },
  { w: 'COCCO',      img: '🥥' },
  { w: 'CONCHIGLIA', img: '🐚' },
  { w: 'CORALLO',    img: '🪸' },
  { w: 'CORNETTO',   img: '🥐' },
  { w: 'CIOCCOLATO', img: '🍫' },
  { w: 'CUCCIOLO',   img: '🐶' },

  // --- D ---
  { w: 'DESERTO',    img: '🏜️' },
  { w: 'DIAMANTE',   img: '💎' },
  { w: 'DOCCIA',     img: '🚿' },
  { w: 'DROMEDARIO', img: '🐪' },
  { w: 'DONNA',      img: '👩' },
  { w: 'DENTISTA',   img: '🦷' },
  { w: 'DODICI',     img: '🔢' },

  // --- F ---
  { w: 'FAGIOLO',    img: '🫘' },
  { w: 'FANTASMA',   img: '👻' },
  { w: 'FARMACIA',   img: '💊' },
  { w: 'FINESTRA',   img: '🪟' },
  { w: 'FIOCCO',     img: '🎀' },
  { w: 'FONTANA',    img: '⛲' },
  { w: 'FORCHETTA',  img: '🍴' },
  { w: 'FORMAGGIO',  img: '🧀' },
  { w: 'FRAGOLA',    img: '🍓' },
  { w: 'FRATELLO',   img: '👦' },
  { w: 'FRIGORIFERO',img: '🧊' },
  { w: 'FRUTTA',     img: '🍎' },
  { w: 'FUNIVIA',    img: '🚠' },
  { w: 'FURGONE',    img: '🚐' },
  { w: 'FALENA',     img: '🦋' },

  // --- G ---
  { w: 'GABBIANO',   img: '🐦' },
  { w: 'GALASSIA',   img: '🌌' },
  { w: 'GEMELLO',    img: '👯' },
  { w: 'GIACCA',     img: '🧥' },
  { w: 'GIARDINO',   img: '🌳' },
  { w: 'GIORNALE',   img: '📰' },
  { w: 'GIOIELLO',   img: '💍' },
  { w: 'GNOMO',      img: '🧙' },
  { w: 'GONDOLA',    img: '🛶' },
  { w: 'GRATTACIELO',img: '🏙️' },
  { w: 'GROTTA',     img: '🕳️' },
  { w: 'GUANTO',     img: '🧤' },

  // --- L ---
  { w: 'LAMPADA',    img: '💡' },
  { w: 'LAMPONE',    img: '🫐' },
  { w: 'LAVAGNA',    img: '📋' },
  { w: 'LEGENDA',    img: '📜' },
  { w: 'LENTE',      img: '🔍' },
  { w: 'LEOPARDO',   img: '🐆' },
  { w: 'LETTERA',    img: '✉️' },
  { w: 'LIMONATA',   img: '🍋' },
  { w: 'LUCCIOLA',   img: '✨' },
  { w: 'LIBELLULA',  img: '🪰' },

  // --- M ---
  { w: 'MACCHINA',   img: '🚗' },
  { w: 'MAGLIETTA',  img: '👕' },
  { w: 'MANDARINO',  img: '🍊' },
  { w: 'MASCHERA',   img: '🎭' },
  { w: 'MATTINA',    img: '🌅' },
  { w: 'MEDAGLIA',   img: '🏅' },
  { w: 'MICROFONO',  img: '🎤' },
  { w: 'MINESTRA',   img: '🍲' },
  { w: 'MONOPATTINO',img: '🛴' },
  { w: 'MONTAGNA',   img: '⛰️' },
  { w: 'MARTELLO',   img: '🔨' },
  { w: 'MULINO',     img: '🌾' },

  // --- N ---
  { w: 'NARANCIO',   img: '🍊' },
  { w: 'NASTRO',     img: '🎀' },
  { w: 'NATALE',     img: '🎄' },
  { w: 'NEGOZIO',    img: '🏪' },
  { w: 'NINFEA',     img: '🪷' },
  { w: 'NOCCIOLA',   img: '🌰' },
  { w: 'NOTTE',      img: '🌙' },
  { w: 'NUMERO',     img: '🔢' },

  // --- P ---
  { w: 'PALLONCINO', img: '🎈' },
  { w: 'PANDA',      img: '🐼' },
  { w: 'PAPAVERO',   img: '🌺' },
  { w: 'PARACADUTE', img: '🪂' },
  { w: 'PECORA',     img: '🐑' },
  { w: 'PENTOLA',    img: '🍲' },
  { w: 'PEPERONE',   img: '🫑' },
  { w: 'PIANETA',    img: '🪐' },
  { w: 'PIANOFORTE', img: '🎹' },
  { w: 'PINGUINO',   img: '🐧' },
  { w: 'PIRAMIDE',   img: '🔺' },
  { w: 'PISELLO',    img: '🫛' },
  { w: 'PORTA',      img: '🚪' },
  { w: 'POMPIERE',   img: '🚒' },
  { w: 'PRINCIPESSA',img: '👸' },
  { w: 'PULCINO',    img: '🐤' },

  // --- Q ---
  { w: 'QUARZO',     img: '💎' },
  { w: 'QUATTRO',    img: '4️⃣' },
  { w: 'QUINDICI',   img: '🔢' },
  { w: 'QUIETE',     img: '😌' },

  // --- R ---
  { w: 'RAGAZZO',    img: '👦' },
  { w: 'RAMO',       img: '🌿' },
  { w: 'RAVIOLI',    img: '🥟' },
  { w: 'REGALO',     img: '🎁' },
  { w: 'RIMORCHIO',  img: '🚛' },
  { w: 'RINOCERONTE',img: '🦏' },
  { w: 'RISOTTO',    img: '🍚' },
  { w: 'ROSPO',      img: '🐸' },
  { w: 'ROTELLA',    img: '🛼' },

  // --- S ---
  { w: 'SABBIA',     img: '🏖️' },
  { w: 'SALAMANDRA', img: '🦎' },
  { w: 'SANDALO',    img: '👡' },
  { w: 'SATELLITE',  img: '🛰️' },
  { w: 'SCARPA',     img: '👟' },
  { w: 'SCOIATTOLO', img: '🐿️' },
  { w: 'SEDIA',      img: '🪑' },
  { w: 'SEGRETO',    img: '🤫' },
  { w: 'SONAGLIO',   img: '🔔' },
  { w: 'SORELLA',    img: '👧' },
  { w: 'SPAGHETTI',  img: '🍝' },
  { w: 'STELLA',     img: '⭐' },
  { w: 'STIVALE',    img: '👢' },
  { w: 'STRADA',     img: '🛣️' },
  { w: 'STUFA',      img: '🔥' },
  { w: 'SVEGLIA',    img: '⏰' },

  // --- T ---
  { w: 'TAMBURO',    img: '🥁' },
  { w: 'TAPPETO',    img: '🟫' },
  { w: 'TAZZINA',    img: '☕' },
  { w: 'TOSTAPANE',  img: '🍞' },
  { w: 'TASTIERA',   img: '⌨️' },
  { w: 'TELEVISORE', img: '📺' },
  { w: 'TEMPESTA',   img: '⛈️' },
  { w: 'TENDA',      img: '🪟' },
  { w: 'TETTOIA',    img: 'img/tettoia.svg' },
  { w: 'TIMONE',     img: '🛞' },
  { w: 'TONNO',      img: '🐟' },
  { w: 'TORNADO',    img: '🌪️' },
  { w: 'TORRE',      img: '🗼' },
  { w: 'TRATTORE',   img: '🚜' },
  { w: 'TROMBA',     img: '🎺' },
  { w: 'TROTA',      img: '🐟' },
  { w: 'TUBETTO',    img: '🧴' },
  { w: 'TRICICLO',   img: '🛺' },

  // --- V ---
  { w: 'VACCA',      img: '🐄' },
  { w: 'VASCA',      img: '🛁' },
  { w: 'VASSOIO',    img: '🍽️' },
  { w: 'VELIERO',    img: '⛵' },
  { w: 'VENTAGLIO',  img: '🪭' },
  { w: 'VENTO',      img: '🌬️' },
  { w: 'VERDURA',    img: '🥬' },
  { w: 'VETERINARIO',img: '🩺' },
  { w: 'VIGILE',     img: '👮' },
  { w: 'VILLAGGIO',  img: '🏘️' },
  { w: 'VIPERA',     img: '🐍' },

  // --- Z ---
  { w: 'ZAMPA',      img: '🐾' },
  { w: 'ZATTERA',    img: '🛶' },
  { w: 'ZENZERO',    img: '🫚' },
  { w: 'ZOCCOLO',    img: '👠' },
  { w: 'ZOLFO',      img: '🟡' },
  { w: 'ZOMBIE',     img: '🧟' }
];

// Parole inventate "curate": combinazioni buffe ma leggibili con le sillabe
// CV di L, M, P, T + vocali. Servono a dare varietà in SOLO LETTURA senza
// uscire dal percorso didattico (nessuna lettera o struttura non studiata:
// il motore le filtra una per una prima di proporle). Non hanno immagine
// e non entrano mai in LEGGI E GUARDA, DICO LA PAROLA o VEDI E SCEGLI.
IAL.INVENTED_WORDS = [
  { w: 'TATU', s: ['TA', 'TU'] },
  { w: 'TATO', s: ['TA', 'TO'] },
  { w: 'TETI', s: ['TE', 'TI'] },
  { w: 'TETO', s: ['TE', 'TO'] },
  { w: 'TOTO', s: ['TO', 'TO'] },
  { w: 'TITI', s: ['TI', 'TI'] },
  { w: 'TAMA', s: ['TA', 'MA'] },
  { w: 'TAMI', s: ['TA', 'MI'] },
  { w: 'TUME', s: ['TU', 'ME'] },
  { w: 'TAMU', s: ['TA', 'MU'] },
  { w: 'MIMI', s: ['MI', 'MI'] },
  { w: 'MOMO', s: ['MO', 'MO'] },
  { w: 'MAMU', s: ['MA', 'MU'] },
  { w: 'MATU', s: ['MA', 'TU'] },
  { w: 'MUTU', s: ['MU', 'TU'] },
  { w: 'MOLU', s: ['MO', 'LU'] },
  { w: 'PATA', s: ['PA', 'TA'] },
  { w: 'PATU', s: ['PA', 'TU'] },
  { w: 'PULU', s: ['PU', 'LU'] },
  { w: 'PAMU', s: ['PA', 'MU'] },
  { w: 'LALA', s: ['LA', 'LA'] },
  { w: 'LALO', s: ['LA', 'LO'] },
  { w: 'LELA', s: ['LE', 'LA'] },
  { w: 'LOLO', s: ['LO', 'LO'] },
  { w: 'LULU', s: ['LU', 'LU'] },
  { w: 'LUTU', s: ['LU', 'TU'] },
  { w: 'TULU', s: ['TU', 'LU'] }
];
