/* ============================================================
   IMPARO A LEGGERE — associazioni sillaba/parola → immagine
   Usate nella modalità LEGGI E ASSOCIA.
   L'associazione viene usata SOLO se la parola associata è
   proponibile con le lettere/combinazioni abilitate
   (verifica fatta dal motore di generazione).
   ============================================================ */
window.IAL = window.IAL || {};

IAL.SYLLABLE_ASSOC = {
  PA: 'PAPERA',  PE: 'PERA',     PI: 'PIZZA',   PO: 'POMODORO', PU: 'PUMA',
  MA: 'MANO',    ME: 'MELA',     MI: 'MIELE',   MO: 'MOTO',     MU: 'MULO',
  LA: 'LUNA',    LE: 'LEONE',    LI: 'LIMONE',  LU: 'LUPO',
  NA: 'NAVE',    NE: 'NEVE',     NI: 'NIDO',    NO: 'NODO',     NU: 'NUVOLA',
  SA: 'SALE',    SE: 'SEME',     SI: 'SIRENA',  SO: 'SOLE',     SU: 'SUGO',
  TA: 'TAVOLO',  TE: 'TELE',     TI: 'TIGRE',   TO: 'TOPO',     TU: 'TULIPANO',
  VA: 'VASO',    VE: 'VELA',     VO: 'VOLPE',
  ZA: 'ZANZARA', ZE: 'ZEBRA',    ZU: 'ZUCCA',
  BA: 'BANANA',  BO: 'BOCCA',
  CA: 'CANE',    CE: 'CENA',     CI: 'CIPOLLA', CO: 'COMETA',   CU: 'CUBO',
  DA: 'DADO',    DE: 'DENTE',    DI: 'DITO',    DO: 'DOLCE',    DU: 'DUE',
  FA: 'FATA',    FE: 'FESTA',    FI: 'FIORE',   FO: 'FOTO',     FU: 'FUMO',
  GA: 'GALLO',   GI: 'GIRAFFA',  GU: 'GUFO',
  RA: 'RANA',    RE: 'RETE',     RI: 'RISO',    RO: 'ROSA',     RU: 'RUOTA'
};

// Mascotte per le parole INVENTATE (nessun significato, solo divertimento!)
IAL.INVENTED_MASCOTS = ['🤪', '🦖', '🐙', '🦜', '🐲', '👽', '🧚', '🦄', '🐸', '🐵'];
