/* ============================================================
   IMPARO A LEGGERE — MOTORE DI GENERAZIONE DEGLI ESERCIZI
   ------------------------------------------------------------
   Nessun esercizio viene mostrato senza prima aver verificato:
   1. che TUTTE le lettere della parola siano abilitate;
   2. che TUTTE le combinazioni ortografiche siano state studiate
      (sillabe CV studiate per ogni consonante + strutture:
       doppie, gruppi consonantici, SC, GN, GLI);
   3. che la parola sia adatta alla lunghezza selezionata;
   4. che sia classificata correttamente come reale o inventata.

   Inoltre: evita ripetizioni recenti e privilegia leggermente
   le lettere che il bambino deve ancora consolidare.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Engine = (function () {

  // ---------- Helper ----------
  function enabledLetters(p) {
    return {
      set: p.letters.vowels.concat(p.letters.consonants),
      has: function (ch) { return this.set.indexOf(ch) !== -1; }
    };
  }

  // Insieme delle sillabe CV studiate per l'intero profilo
  function studiedSyllables(p) {
    const set = [];
    Object.keys(p.syllables || {}).forEach(function (c) {
      (p.syllables[c] || []).forEach(function (s) {
        if (set.indexOf(s) === -1) set.push(s);
      });
    });
    return set;
  }

  function hasFlag(p, kind) {
    return !!(p.flags && p.flags[kind]);
  }

  // Una sillaba è proponibile?
  function canShowSyllable(p, syl, letters) {
    const kind = IAL.syllableKind(syl);
    if (kind === 'v') return letters.has(syl);
    if (kind === 'cv') return studiedSyllables(p).indexOf(syl) !== -1;
    if (kind === 'doppia') return hasFlag(p, 'doppie') && letters.has(syl[0]);
    if (kind === 'gruppo') return hasFlag(p, 'gruppi') && IAL.lettersOf(syl).every(letters.has);
    if (kind === 'sc') return hasFlag(p, 'sc');
    if (kind === 'gn') return hasFlag(p, 'gn');
    if (kind === 'gli') return hasFlag(p, 'gli');
    return false;
  }

  // Una parola dell'archivio è proponibile per questo profilo?
  function canShowWord(p, entry, letters) {
    letters = letters || enabledLetters(p);
    // 1. tutte le lettere abilitate
    for (const ch of IAL.lettersOf(entry.w)) {
      if (!letters.has(ch)) return false;
    }
    // 2. tutte le combinazioni studiate
    for (const syl of entry.s) {
      if (!canShowSyllable(p, syl, letters)) return false;
    }
    return true;
  }

  // Parole reali disponibili, filtrate per lunghezza
  function realWords(p, lengths) {
    const letters = enabledLetters(p);
    return IAL.WORDS.filter(function (entry) {
      if (lengths && lengths.length && lengths.indexOf(entry.w.length) === -1) return false;
      return canShowWord(p, entry, letters);
    });
  }

  // ---------- Parole inventate ----------
  // Costruite SOLO con sillabe effettivamente studiate: sono quindi
  // foneticamente corrette e mai fuori dal percorso didattico.
  function makeInvented(p, targetLen, exclude) {
    const syls = studiedSyllables(p).filter(function (s) { return s.length <= 3; });
    if (!syls.length) return null;
    for (let attempt = 0; attempt < 40; attempt++) {
      let text = '';
      let len = 0;
      while (len < targetLen) {
        const s = syls[Math.floor(Math.random() * syls.length)];
        if (len + s.length > targetLen) break;
        text += s;
        len += s.length;
      }
      if (len !== targetLen) continue;
      text = text.toUpperCase();
      // Se la sequenza coincide con una parola reale, si classifica come REALE
      if (IAL.WORDS_BY_KEY[text]) return realExercise(IAL.WORDS_BY_KEY[text]);
      if (exclude && exclude.indexOf(text) !== -1) continue;
      return {
        kind: 'word', text: text, invented: true,
        img: null, img2: null, typeLabel: 'Parola inventata'
      };
    }
    return null;
  }

  function realExercise(entry) {
    return {
      kind: 'word', text: entry.w, invented: false,
      img: entry.img, typeLabel: 'Parola reale'
    };
  }

  // ---------- Selezione casuale con anti-ripetizione ----------
  function pick(list, recent) {
    if (!list.length) return null;
    const fresh = list.filter(function (x) { return recent.indexOf(xKey(x)) === -1; });
    return weightedPick(fresh.length ? fresh : list);
  }

  function xKey(x) { return (typeof x === 'string') ? x : (x.text || x.w || x); }

  function weightedPick(list) {
    // Peso maggiore per le lettere/parole non ancora consolidate
    const p = IAL.Store.active();
    function weight(item) {
      const text = (typeof item === 'string') ? item : (item.text || item.w);
      if (!p) return 1;
      const s = p.stats;
      let shown = 0, correct = 0;
      IAL.lettersOf(text).forEach(function (L) {
        const d = s.byLetter[L];
        if (d) { shown += d.shown; correct += d.correct; }
      });
      if (shown === 0) return 1.3;                       // mai esercitata → leggera priorità
      const ratio = correct / shown;
      return 0.7 + ratio * 0.9;                          // poco consolidata → peso maggiore
    }
    let total = 0;
    const weights = list.map(function (x) { const w = weight(x); total += w; return w; });
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  // ---------- Esercizi SOLO LETTURA ----------
  const recent = [];

  function remember(ex) {
    recent.push(xKey(ex));
    if (recent.length > 15) recent.shift();
  }

  function nextReading(p, opts) {
    // opts: { categories: {letters, syllables, words}, wordType, lengths }
    const cats = opts.categories;
    const choices = [];
    if (cats.letters) choices.push('letters');
    if (cats.syllables) choices.push('syllables');
    if (cats.words) choices.push('words');
    if (!choices.length) return null;

    const letters = enabledLetters(p);

    for (let i = 0; i < 12; i++) {
      const cat = choices[Math.floor(Math.random() * choices.length)];
      let ex = null;

      if (cat === 'letters') {
        // Mai lettere singole: si propongono sempre coppie di vocali (minimo 2 lettere)
        const vow = p.letters.vowels;
        if (vow.length < 2) continue;
        const i1 = Math.floor(Math.random() * vow.length);
        const i2 = (i1 + 1 + Math.floor(Math.random() * (vow.length - 1))) % vow.length;
        const pair = vow[i1] + vow[i2];
        if (recent.indexOf(pair) !== -1) continue;
        ex = {
          kind: 'letter', text: pair, invented: false, img: null,
          typeLabel: 'Coppia di vocali'
        };
      } else if (cat === 'syllables') {
        const syls = studiedSyllables(p);
        if (!syls.length) continue;
        const syl = pick(syls, recent);
        ex = { kind: 'syllable', text: syl, invented: false, img: null, typeLabel: 'Sillaba' };
      } else {
        const useReal = opts.wordType === 'real' || (opts.wordType === 'mixed' && Math.random() < 0.6);
        if (useReal) {
          const entry = pick(realWords(p, opts.lengths), recent);
          if (entry) ex = realExercise(entry);
        }
        if (!ex && opts.wordType !== 'real') {
          const len = opts.lengths && opts.lengths.length
            ? opts.lengths[Math.floor(Math.random() * opts.lengths.length)] : 3;
          ex = makeInvented(p, len, recent);
        }
      }
      if (ex) { remember(ex); return ex; }
    }
    return null; // nessun esercizio possibile con le impostazioni attuali
  }

  // ---------- Esercizi LEGGI E ASSOCIA ----------
  // SOLO parole reali e complete con immagine associata: il bambino legge
  // la parola, il genitore conferma e compare l'immagine corrispondente.
  function nextMatch(p, opts) {
    const letters = enabledLetters(p);
    const pool = [];
    realWords(p, opts.lengths).forEach(function (entry) {
      if (!entry.img) return;
      pool.push({
        kind: 'match', text: entry.w, invented: false, img: entry.img,
        assocWord: entry.w, typeLabel: 'Parola'
      });
    });
    if (!pool.length) return null;
    const chosen = pick(pool, recent);
    remember(chosen);
    return chosen;
  }

  // Descrizione leggibile di ciò che il profilo rende disponibile
  function availability(p) {
    return {
      letters: p.letters.vowels.length + p.letters.consonants.length,
      syllables: studiedSyllables(p).length,
      realWords: realWords(p, null).length,
      invented: studiedSyllables(p).length >= 2
    };
  }

  return {
    enabledLetters: enabledLetters,
    studiedSyllables: studiedSyllables,
    canShowWord: canShowWord,
    canShowSyllable: canShowSyllable,
    realWords: realWords,
    nextReading: nextReading,
    nextMatch: nextMatch,
    makeInvented: makeInvented,
    availability: availability
  };
})();
