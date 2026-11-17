/* ============================================================
   IMPARO A LEGGERE — archivio parole italiane reali (archivio già sopra),
   qui: gestione dati e profili (persistenza locale, funzionamento offline).
   ------------------------------------------------------------
   Ogni profilo bambino è completamente indipendente:
   lettere abilitate, sillabe studiate, strutture, impostazioni,
   progressi e stelline. I dati sono salvati in localStorage.
   La sincronizzazione online (Supabase) è opzionale e documentata
   nel README: finché non è configurata, i dati restano SOLO sul
   dispositivo — nessuna simulazione.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Store = (function () {
  const KEY = 'ial.data.v1';

  function defaultProfile(name, avatar) {
    return {
      id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
      name: name,
      avatar: avatar || '🐻',
      createdAt: new Date().toISOString(),
      letters: { vowels: ['A', 'E', 'I', 'O', 'U'], consonants: [] },
      syllables: {},                 // es. { P: ['PA','PE'] }
      flags: { doppie: false, gruppi: false, sc: false, gn: false, gli: false },
      settings: {
        wordType: 'mixed',           // 'real' | 'invented' | 'mixed'
        lengths: [2, 3, 4, 5, 6],    // lunghezze ammesse (in lettere)
        categories: { letters: true, syllables: true, words: true },
        level: 3,
        goal: 10
      },
      stats: {
        stars: 0,
        correct: 0,
        retried: 0,
        total: 0,
        stickers: [],
        byLetter: {},                // { P: { shown: n, correct: n } }
        byDate: {}                   // { '2026-11-17': { done: n, correct: n } }
      }
    };
  }

  let data = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : { profiles: [], activeId: null, parentPin: null };
    } catch (e) {
      data = { profiles: [], activeId: null, parentPin: null };
    }
    // Migrazione/valori predefiniti delle chiavi mancanti (aggiornamenti dell'app)
    data.profiles.forEach(function (p) {
      const def = defaultProfile(p.name || 'Bimbo', p.avatar);
      p.letters = Object.assign({}, def.letters, p.letters || {});
      p.letters.vowels = p.letters.vowels || def.letters.vowels;
      p.letters.consonants = p.letters.consonants || [];
      p.syllables = p.syllables || {};
      p.flags = Object.assign({}, def.flags, p.flags || {});
      p.settings = Object.assign({}, def.settings, p.settings || {});
      p.settings.categories = Object.assign({}, def.settings.categories, p.settings.categories || {});
      p.settings.lengths = p.settings.lengths || def.settings.lengths;
      p.stats = Object.assign({}, def.stats, p.stats || {});
      p.stats.byLetter = p.stats.byLetter || {};
      p.stats.byDate = p.stats.byDate || {};
      p.stats.stickers = p.stats.stickers || [];
    });
    return data;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      if (window.console) console.warn('Salvataggio non riuscito', e);
    }
  }

  function init() {
    load();
    return data;
  }

  function all() { return data.profiles; }
  function activeId() { return data.activeId; }

  function active() {
    return data.profiles.find(function (p) { return p.id === data.activeId; }) || null;
  }

  function setActive(id) {
    data.activeId = id;
    save();
  }

  function createProfile(name, avatar) {
    const p = defaultProfile(name, avatar);
    data.profiles.push(p);
    data.activeId = p.id;
    save();
    return p;
  }

  function deleteProfile(id) {
    data.profiles = data.profiles.filter(function (p) { return p.id !== id; });
    if (data.activeId === id) {
      data.activeId = data.profiles.length ? data.profiles[0].id : null;
    }
    save();
  }

  function updateActive(mutator) {
    const p = active();
    if (!p) return null;
    mutator(p);
    save();
    return p;
  }

  function setParentPin(pin) {
    data.parentPin = pin; // null = nessun PIN richiesto
    save();
  }
  function parentPin() { return data.parentPin; }

  // ---------- Statistiche ----------
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function todayStats(profile) {
    const k = todayKey();
    if (!profile.stats.byDate[k]) profile.stats.byDate[k] = { done: 0, correct: 0 };
    return profile.stats.byDate[k];
  }

  // Registra il risultato di un esercizio (usato da entrambe le modalità)
  function record(profile, exercise, correct) {
    const s = profile.stats;
    s.total += 1;
    const t = todayStats(profile);
    t.done += 1;

    const letters = IAL.lettersOf(exercise.text);
    letters.forEach(function (L) {
      if (!s.byLetter[L]) s.byLetter[L] = { shown: 0, correct: 0 };
      s.byLetter[L].shown += 1;
    });

    if (correct) {
      s.correct += 1;
      s.stars += 1;
      t.correct += 1;
      letters.forEach(function (L) { s.byLetter[L].correct += 1; });
    } else {
      s.retried += 1;
    }
    save();
  }

  function goalProgress(profile) {
    const t = todayStats(profile);
    return { done: t.correct, goal: profile.settings.goal || 10 };
  }

  // ---------- Backup ----------
  function exportJSON() {
    return JSON.stringify(data, null, 2);
  }
  function importJSON(json) {
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.profiles)) throw new Error('File non valido');
    data = parsed;
    load(); // applica le migrazioni e riempie le chiavi mancanti
    save();
  }

  return {
    init: init, save: save,
    all: all, active: active, activeId: activeId, setActive: setActive,
    createProfile: createProfile, deleteProfile: deleteProfile, updateActive: updateActive,
    setParentPin: setParentPin, parentPin: parentPin,
    record: record, todayStats: todayStats, goalProgress: goalProgress,
    exportJSON: exportJSON, importJSON: importJSON
  };
})();
