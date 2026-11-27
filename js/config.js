/* ============================================================
   IMPARO A LEGGERE — configurazione generale
   Alfabeto italiano, sillabe, strutture ortografiche, livelli,
   messaggi motivazionali.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.CONFIG = {
  VOWELS: ['A', 'E', 'I', 'O', 'U'],

  // Consonanti dell'alfabeto italiano (H: muta, non genera sillabe)
  CONSONANTS: ['B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'Z'],

  AVATARS: ['🐻', '🐰', '🦊', '🐱', '🐼', '🦁', '🐨', '🐯', '🐧', '🦄', '🐸', '🐵'],

  // Strutture ortografiche che NON sono semplici combinazioni consonante+vocale.
  // Ogni parola dell'archivio può richiedere una di queste per essere proposta.
  FLAGS: {
    doppie:   { label: 'Doppie (MAMMA, PALLA, LATTE…)', emoji: '👯' },
    gruppi:   { label: 'Gruppi consonantici (TRENO, LIBRO, BARCA…)', emoji: '🚂' },
    vc:       { label: 'Vocale+consonante (ERBA, ORTO, ALBERO…)', emoji: '🌀' },
    sc:       { label: 'S + C/E,I (PESCE, PESCA…)', emoji: '🐟' },
    gn:       { label: 'GN (GNOMO, BAGNO…)', emoji: '🧙' },
    gli:      { label: 'GLI (CONIGLIO, FIGLIO…)', emoji: '🐰' }
  },

  // Livelli di progressione didattica. Ogni livello limita AUTOMATICAMENTE
  // lunghezza e difficoltà degli esercizi in TUTTE le sezioni dell'app
  // (SOLO LETTURA, LEGGI E GUARDA, DICO LA PAROLA, VEDI E SCEGLI).
  // Il livello restringe: non attiva mai nulla che il genitore ha spento.
  // cap.cats = categorie ammesse; maxLen = lunghezza massima parole; maxDiff = difficoltà massima.
  LEVELS: [
    { n: 1, title: 'Vocali',            desc: 'Solo coppie di vocali (AE, IO…): l’inizio del percorso.', cap: { cats: ['letters'], maxLen: 2, maxDiff: 1 } },
    { n: 2, title: 'Prime consonanti',  desc: 'Coppie di vocali e sillabe (PA, ME…), ancora senza parole.', cap: { cats: ['letters', 'syllables'], maxLen: 2, maxDiff: 1 } },
    { n: 3, title: 'Sillabe semplici',  desc: 'Sillabe e prime parole brevi e semplici (fino a 4 lettere).', cap: { cats: ['letters', 'syllables', 'words'], maxLen: 4, maxDiff: 1 } },
    { n: 4, title: 'Parole brevi',      desc: 'Parole fino a 4 lettere, anche più complesse.', cap: { cats: ['letters', 'syllables', 'words'], maxLen: 4, maxDiff: 2 } },
    { n: 5, title: 'Parole più lunghe', desc: 'Parole fino a 5 lettere, doppie e gruppi (se attivati).', cap: { cats: ['letters', 'syllables', 'words'], maxLen: 5, maxDiff: 2 } },
    { n: 6, title: 'Tutto',             desc: 'Tutti gli esercizi attivati, parole fino a 6 lettere e frasi complete.', cap: { cats: ['letters', 'syllables', 'words'], maxLen: 6, maxDiff: 2 } }
  ],

  PRAISE: [
    'Bravissima! 🌟', 'Fantastico! 🎉', 'Che bello che leggi! 📖',
    'Perfetto! ⭐', 'Sei una campionessa! 🏆', 'Che lettura impeccabile! 👏',
    'Mitica! 🚀', 'Continua così! 💪', 'Wow! Che benedetta lettura! 😍'
  ],

  RETRY: [
    'Riprova con calma, puoi farcela! 💛',
    'Ci siamo quasi! Riprova 😊',
    'Non mollare, riprova! 🌈',
    'Un piccolo tentativo ancora! 🍀',
    'Dai che ci siamo! Riprova 🐣'
  ]
};

// Sillabe consonante+vocale di una consonante (Q usa QU)
IAL.cvSyllables = function (consonant) {
  const V = IAL.CONFIG.VOWELS;
  if (consonant === 'Q') return V.map(v => 'QU' + v);
  return V.map(v => consonant + v);
};

// Sillabe fatte di una sola vocale (es. la "E" di DUE)
IAL.isSingleVowel = function (syl) {
  return syl.length === 1 && IAL.CONFIG.VOWELS.indexOf(syl) !== -1;
};

// Classificazione di una sillaba per il controllo didattico.
// Restituisce: 'cv' (semplice), 'v' (vocale sola), 'doppia', 'gruppo', 'sc', 'gn', 'gli'
IAL.syllableKind = function (syl) {
  const S = syl.toUpperCase();
  if (IAL.isSingleVowel(S)) return 'v';
  if (S.indexOf('SC') === 0) return 'sc';
  if (S.indexOf('GN') === 0) return 'gn';
  if (S.indexOf('GL') === 0) return 'gli';
  // doppia: due consonanti uguali all'inizio (LLA, MMA, TTO…)
  if (S.length >= 3 && S[0] === S[1] && !IAL.isVowel(S[0])) return 'doppia';
  // gruppo consonantico: 2 consonanti diverse all'inizio (BRO, TRE, BAR->no: BAR è B,A,R... )
  if (S.length >= 3 && !IAL.isVowel(S[0]) && !IAL.isVowel(S[1])) return 'gruppo';
  if (S.length === 2 && !IAL.isVowel(S[0]) && IAL.isVowel(S[1])) return 'cv';
  if (S.length === 2 && IAL.isVowel(S[0]) && !IAL.isVowel(S[1])) return 'vc'; // ER, OR, AL…
  if (S.length === 3 && !IAL.isVowel(S[0]) && IAL.isVowel(S[1]) && !IAL.isVowel(S[2])) return 'gruppo'; // BAR, NID? no: NID = N,I,D → gruppo
  return 'cv';
};

IAL.isVowel = function (ch) {
  return IAL.CONFIG.VOWELS.indexOf(ch) !== -1;
};

// Tutte le lettere usate da una parola/sillaba
IAL.lettersOf = function (text) {
  const out = [];
  for (const ch of text.toUpperCase()) {
    if (/[A-Z]/.test(ch) && out.indexOf(ch) === -1) out.push(ch);
  }
  return out;
};
