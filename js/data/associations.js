/* ============================================================
   IMPARO A LEGGERE — associazioni sillaba/parola → immagine
   Usate nella modalità LEGGI E GUARDA.
   L'associazione viene usata SOLO se la parola associata è
   proponibile con le lettere/combinazioni abilitate
   (verifica fatta dal motore di generazione).
   ============================================================ */
window.IAL = window.IAL || {};

IAL.SYLLABLE_ASSOC = {
  PA: 'PAPERA',  PE: 'PERA',     PI: 'PIZZA',   PO: 'POMODORO', PU: 'PUMA',
  MA: 'MANO',    ME: 'MELA',     MI: 'MIELE',   MO: 'MOTO',     MU: 'MULO',
  LA: 'LATTE',   LE: 'LEONE',    LI: 'LIMONE',  LO: 'LOTO',     LU: 'LUNA',
  NA: 'NAVE',    NE: 'NEVE',     NI: 'NIDO',    NO: 'NODO',     NU: 'NUVOLA',
  SA: 'SALE',    SE: 'SEME',     SI: 'SIRENA',  SO: 'SOLE',     SU: 'SUGO',
  TA: 'TAVOLO',  TE: 'TELE',     TI: 'TIGRE',   TO: 'TOPO',     TU: 'TULIPANO',
  VA: 'VASO',    VE: 'VELA',     VI: 'VIOLA',   VO: 'VOLPE',    VU: 'VULCANO',
  ZA: 'ZAINO',   ZE: 'ZEBRA',    ZI: 'ZIA',     ZO: 'ZOO',      ZU: 'ZUCCA',
  BA: 'BANANA',  BE: 'BENE',     BI: 'BICICLETTA', BO: 'BOCCA', BU: 'BUE',
  CA: 'CANE',    CE: 'CENA',     CI: 'CIPOLLA', CO: 'COMETA',   CU: 'CUBO',
  DA: 'DADO',    DE: 'DENTE',    DI: 'DITO',    DO: 'DOLCE',    DU: 'DUE',
  FA: 'FATA',    FE: 'FELICE',   FI: 'FIORE',   FO: 'FOTO',     FU: 'FUMO',
  GA: 'GALLO',   GE: 'GELATO',   GI: 'GIRAFFA', GO: 'GORILLA',  GU: 'GUFO',
  QUA: 'QUADRO', QUE: 'QUESTO',  QUI: 'QUI',    QUO: 'QUOTA',
  RA: 'RANA',    RE: 'RETE',     RI: 'RISO',    RO: 'ROSA',     RU: 'RUOTA'
};

// Mascotte per le parole INVENTATE (nessun significato, solo divertimento!)
IAL.INVENTED_MASCOTS = ['🤪', '🦖', '🐙', '🦜', '🐲', '👽', '🧚', '🦄', '🐸', '🐵'];
