/* ============================================================
   IMPARO A LEGGERE — AREA GENITORI
   Gestione profili, lettere, combinazioni, impostazioni esercizi,
   livelli didattici, statistiche, PIN e backup.
   Ogni modifica è salvata automaticamente.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Parent = (function () {
  const el = IAL.UI.el;
  let unlocked = false;
  let tab = 'letters';

  // ---------- Accesso protetto ----------
  function show() {
    const pin = IAL.Store.parentPin();
    if (pin && !unlocked) { renderPin(pin, ''); return; }
    render();
  }

  function renderPin(expected, typed) {
    const display = el('div', { class: 'pin-display' }, [typed.replace(/./g, '•')]);
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✅'];
    const pad = el('div', { class: 'keypad' }, keys.map(function (k) {
      return el('button', {
        class: 'btn ' + (k === '✅' ? 'btn-green' : 'btn-primary'),
        onclick: function () {
          if (k === '⌫') { typed = typed.slice(0, -1); }
          else if (k === '✅') {
            if (typed === expected) { unlocked = true; render(); return; }
            typed = '';
            IAL.UI.toast('PIN errato 🙈');
          } else if (typed.length < 4) { typed += k; }
          display.textContent = typed.replace(/./g, '•');
        }
      }, [k]);
    }));

    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { IAL.Home.show(); } }, ['🏠 Menu'])
      ]),
      el('div', { class: 'exercise-card' }, [
        el('div', { class: 'big-emoji', style: 'font-size:64px' }, ['🔒']),
        el('h1', { class: 'app-title' }, ['AREA GENITORI']),
        el('p', { class: 'app-subtitle' }, ['Inserisci il PIN']),
        display,
        pad
      ])
    ]);
  }

  // ---------- Struttura a schede ----------
  const TABS = [
    { id: 'profiles',  label: '👶 Profili' },
    { id: 'letters',   label: '🔤 Lettere' },
    { id: 'combos',    label: '🔗 Combinazioni' },
    { id: 'exercises', label: '⚙️ Esercizi' },
    { id: 'stats',     label: '📊 Progressi' },
    { id: 'security',  label: '🔐 Sicurezza' }
  ];

  function render() {
    const p = IAL.Store.active();
    if (!p) { IAL.Home.show(); return; }

    const nav = el('div', { class: 'parent-nav' }, TABS.map(function (t) {
      return el('button', {
        class: 'tab' + (t.id === tab ? ' active' : ''),
        onclick: function () { tab = t.id; render(); }
      }, [t.label]);
    }));

    let panel;
    if (tab === 'profiles') panel = panelProfiles();
    else if (tab === 'letters') panel = panelLetters(p);
    else if (tab === 'combos') panel = panelCombos(p);
    else if (tab === 'exercises') panel = panelExercises(p);
    else if (tab === 'stats') panel = panelStats(p);
    else panel = panelSecurity();

    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { IAL.Home.show(); } }, ['🏠 Menu']),
        el('button', { class: 'chip', onclick: function () { IAL.Store.setActive(p.id); IAL.Home.switchProfileModal(); } }, [
          el('span', { class: 'avatar' }, [p.avatar]), p.name, ' ▾'
        ])
      ]),
      el('h1', { class: 'app-title' }, ['AREA GENITORI']),
      nav,
      panel
    ]);
  }

  // ---------- Scheda: PROFILO ----------
  function panelProfiles() {
    const rows = IAL.Store.all().map(function (pr) {
      const isOn = pr.id === IAL.Store.activeId();
      return el('div', { class: 'profile-card' }, [
        el('div', { class: 'pv' }, [pr.avatar]),
        el('div', { class: 'pi' }, [
          el('div', { class: 'pn' }, [pr.name + (isOn ? ' ✓' : '')]),
          el('div', { class: 'pd' }, ['⭐ ' + pr.stats.stars + ' stelline · livello ' + pr.settings.level])
        ]),
        el('div', { class: 'pa' }, [
          el('button', { class: 'btn btn-soft btn-sm', onclick: function () { editProfile(pr); } }, ['✏️']),
          isOn
            ? el('span', { class: 'chip' }, ['in uso'])
            : el('button', { class: 'btn btn-primary btn-sm', onclick: function () { IAL.Store.setActive(pr.id); render(); } }, ['Usa']),
          IAL.Store.all().length > 1
            ? el('button', { class: 'btn btn-danger btn-sm', onclick: function () {
                IAL.UI.confirmModal('Eliminare il profilo?', 'Verranno cancellati tutti i progressi di ' + pr.name + '.',
                  function () { IAL.Store.deleteProfile(pr.id); render(); }, 'Elimina');
              } }, ['🗑️'])
            : null
        ])
      ]);
    });

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Profili']),
      el('p', { class: 'hint' }, [
        'Ogni bambino ha lettere, esercizi e progressi completamente indipendenti. ',
        'La bambina non ha mai bisogno di password: entra dall’Area Genitori.'
      ])
    ].concat(rows, [
      el('button', { class: 'btn btn-green btn-block', onclick: addProfile }, ['➕ Nuovo profilo'])
    ]));
  }

  function addProfile() {
    const nameInput = el('input', { type: 'text', maxlength: '14', placeholder: 'Nome' });
    let avatar = IAL.CONFIG.AVATARS[0];
    const grid = el('div', { class: 'avatar-grid' }, IAL.CONFIG.AVATARS.map(function (a, i) {
      return el('button', {
        class: 'avatar-opt' + (i === 0 ? ' on' : ''),
        onclick: function (e) {
          avatar = a;
          grid.querySelectorAll('.avatar-opt').forEach(function (n) { n.classList.remove('on'); });
          e.currentTarget.classList.add('on');
        }
      }, [a]);
    }));
    IAL.UI.modal([
      el('h3', {}, ['Nuovo profilo']),
      el('div', { class: 'modal-body' }, [
        el('div', { class: 'field' }, [el('label', {}, ['Nome']), nameInput]),
        grid,
        el('div', { class: 'modal-actions' }, [
          el('button', { class: 'btn btn-primary', onclick: function () {
            const name = (nameInput.value || '').trim();
            if (!name) { IAL.UI.toast('Scrivi un nome! ✏️'); return; }
            IAL.Store.createProfile(name, avatar);
            IAL.UI.closeModal();
            render();
          } }, ['Crea']),
          el('button', { class: 'btn btn-soft', onclick: IAL.UI.closeModal }, ['Annulla'])
        ])
      ])
    ]);
  }

  function editProfile(pr) {
    const nameInput = el('input', { type: 'text', maxlength: '14', value: pr.name });
    const grid = el('div', { class: 'avatar-grid' }, IAL.CONFIG.AVATARS.map(function (a) {
      return el('button', {
        class: 'avatar-opt' + (pr.avatar === a ? ' on' : ''),
        onclick: function (e) {
          pr.avatar = a;
          IAL.Store.save();
          grid.querySelectorAll('.avatar-opt').forEach(function (n) { n.classList.remove('on'); });
          e.currentTarget.classList.add('on');
        }
      }, [a]);
    }));
    IAL.UI.modal([
      el('h3', {}, ['Modifica profilo']),
      el('div', { class: 'modal-body' }, [
        el('div', { class: 'field' }, [el('label', {}, ['Nome']), nameInput]),
        grid,
        el('div', { class: 'modal-actions' }, [
          el('button', { class: 'btn btn-primary', onclick: function () {
            const name = (nameInput.value || '').trim();
            if (name) pr.name = name;
            IAL.Store.save();
            IAL.UI.closeModal();
            render();
          } }, ['Salva']),
          el('button', { class: 'btn btn-soft', onclick: IAL.UI.closeModal }, ['Annulla'])
        ])
      ])
    ]);
  }

  // ---------- Scheda: LETTERE ----------
  function panelLetters(p) {
    const vowelTiles = IAL.CONFIG.VOWELS.map(function (v) { return letterTile(p, v, true); });
    const consTiles = IAL.CONFIG.CONSONANTS.map(function (c) { return letterTile(p, c, false); });

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Lettere già studiate']),
      el('p', { class: 'hint' }, [
        'Tocca una lettera per attivarla o disattivarla. ',
        'L’app userà SOLO le lettere attive. La modifica vale subito per tutti gli esercizi.'
      ]),
      el('div', { class: 'opt-row' }, [
        el('button', { class: 'btn btn-green btn-sm', onclick: function () {
          IAL.Store.updateActive(function (pr) { pr.letters.vowels = IAL.CONFIG.VOWELS.slice(); });
          render();
          IAL.UI.toast('Tutte le vocali attivate ✅');
        } }, ['✅ Tutte le vocali']),
        el('button', { class: 'btn btn-soft btn-sm', onclick: function () {
          IAL.Store.updateActive(function (pr) {
            pr.letters.vowels = [];
            pr.letters.consonants = [];
          });
          render();
        } }, ['🧹 Azzera tutto'])
      ]),
      el('h3', {}, ['Vocali']),
      el('div', { class: 'alpha-grid' }, vowelTiles),
      el('h3', {}, ['Consonanti']),
      el('div', { class: 'alpha-grid' }, consTiles),
      el('div', { class: 'legend' }, [
        el('span', { class: 'lv' }, ['Vocale attiva']),
        el('span', { class: 'lc' }, ['Consonante attiva']),
        el('span', { class: 'lm' }, ['H muta (non si legge da sola)']),
        el('span', { class: 'lx' }, ['Da studiare'])
      ]),
      el('div', { class: 'note' }, [
        '✅ Attivando una consonante si attivano da sole anche le sue sillabe con le vocali (PA, PE…). ',
        'Nella scheda «Combinazioni» puoi togliere quelle non ancora studiate o aggiungere strutture speciali.'
      ])
    ]);
  }

  function letterTile(p, letter, isVowel) {
    const enabled = isVowel
      ? p.letters.vowels.indexOf(letter) !== -1
      : p.letters.consonants.indexOf(letter) !== -1;
    const classes = ['letter-tile'];
    if (!enabled) {
      classes.push('off');
    } else if (letter === 'H') {
      classes.push('mute');
    } else {
      classes.push(isVowel ? 'vowel' : 'consonant');
    }

    return el('button', {
      class: classes.join(' '),
      'aria-label': 'Lettera ' + letter + (enabled ? ' attiva' : ' disattivata'),
      onclick: function () {
        let justOn = false;
        IAL.Store.updateActive(function (pr) {
          const list = isVowel ? pr.letters.vowels : pr.letters.consonants;
          const i = list.indexOf(letter);
          if (i === -1) {
            list.push(letter);
            justOn = true;
            // Attiva automaticamente le sillabe CV della consonante (PA, PE…):
            // se studi una consonante, le sue sillabe con le vocali ci sono già.
            // Nella scheda «Combinazioni» si possono togliere quelle non ancora viste.
            if (!isVowel && letter !== 'H') {
              pr.syllables[letter] = IAL.cvSyllables(letter).slice();
            }
          } else {
            list.splice(i, 1);
          }
        });
        if (justOn && !isVowel && letter !== 'H') {
          const syl = IAL.cvSyllables(letter);
          IAL.UI.toast(letter + ' attivata: anche le sue sillabe (' + syl[0] + ', ' + syl[1] + '…) ✅');
        }
        render();
      }
    }, [letter]);
  }

  // ---------- Scheda: COMBINAZIONI ----------
  function panelCombos(p) {
    const groups = [];
    const enabledCons = IAL.CONFIG.CONSONANTS.filter(function (c) {
      return c !== 'H' && p.letters.consonants.indexOf(c) !== -1;
    });

    enabledCons.forEach(function (c) {
      const syls = IAL.cvSyllables(c);
      const studied = p.syllables[c] || [];
      const chips = syls.map(function (s) {
        const on = studied.indexOf(s) !== -1;
        return el('button', {
          class: 'syl-chip' + (on ? '' : ' off'),
          'aria-label': 'Sillaba ' + s + (on ? ' studiata' : ' non studiata'),
          onclick: function () {
            IAL.Store.updateActive(function (pr) {
              pr.syllables[c] = pr.syllables[c] || [];
              const list = pr.syllables[c];
              const i = list.indexOf(s);
              if (i === -1) list.push(s); else list.splice(i, 1);
            });
            render();
          }
        }, [s]);
      });

      groups.push(el('div', { class: 'syl-group' }, [
        el('div', { class: 'head' }, [
          el('span', { class: 'name' }, [c]),
          el('div', { class: 'opt-row', style: 'margin:0' }, [
            el('button', { class: 'opt-chip', onclick: function () {
              IAL.Store.updateActive(function (pr) { pr.syllables[c] = syls.slice(); });
              render();
            } }, ['Tutte']),
            el('button', { class: 'opt-chip', onclick: function () {
              IAL.Store.updateActive(function (pr) { pr.syllables[c] = []; });
              render();
            } }, ['Nessuna'])
          ])
        ]),
        el('div', { class: 'syl-chips' }, chips)
      ]));
    });

    const flagChips = Object.keys(IAL.CONFIG.FLAGS).map(function (key) {
      const f = IAL.CONFIG.FLAGS[key];
      const on = !!p.flags[key];
      return el('button', {
        class: 'opt-chip' + (on ? ' on' : ''),
        onclick: function () {
          IAL.Store.updateActive(function (pr) { pr.flags[key] = !pr.flags[key]; });
          render();
        }
      }, [f.emoji + ' ' + f.label]);
    });

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Combinazioni e strutture studiate']),
      el('p', { class: 'hint' }, [
        'Attivando una consonante le sue sillabe (PA, PE…) si attivano automaticamente. ',
        'Qui puoi togliere quelle non ancora studiate o riattivarle. Nessuna combinazione non studiata comparirà mai negli esercizi.'
      ]),
      enabledCons.length
        ? el('div', { class: 'syl-groups' }, groups)
        : el('div', { class: 'note' }, ['Attiva prima qualche consonante nella scheda «Lettere».']),
      el('h3', {}, ['Strutture ortografiche speciali']),
      el('div', { class: 'opt-row' }, flagChips)
    ]);
  }

  // ---------- Scheda: ESERCIZI ----------
  function panelExercises(p) {
    const wordTypes = [
      { id: 'real', label: '📕 Solo parole reali' },
      { id: 'invented', label: '🎨 Solo parole inventate' },
      { id: 'mixed', label: '🔀 Reali + inventate' }
    ];
    const cats = [
      { id: 'letters', label: '🔤 Coppie di vocali' },
      { id: 'syllables', label: '🧩 Sillabe' },
      { id: 'words', label: '📖 Parole' }
    ];

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Impostazioni esercizi']),
      el('p', { class: 'hint' }, [
        'Le scelte valgono per TUTTE le sezioni dell’app (SOLO LETTURA, LEGGI E GUARDA, ',
        'DICO LA PAROLA, VEDI E SCEGLI) e si salvano automaticamente.'
      ]),

      el('h3', {}, ['Tipo di parole']),
      el('div', { class: 'opt-row' }, wordTypes.map(function (t) {
        return el('button', {
          class: 'opt-chip' + (p.settings.wordType === t.id ? ' on' : ''),
          onclick: function () {
            IAL.Store.updateActive(function (pr) { pr.settings.wordType = t.id; });
            render();
          }
        }, [t.label]);
      })),

      el('h3', {}, ['Lunghezza delle parole (lettere)']),
      el('div', { class: 'opt-row' }, [2, 3, 4, 5, 6].map(function (n) {
        const on = p.settings.lengths.indexOf(n) !== -1;
        return el('button', {
          class: 'opt-chip' + (on ? ' on' : ''),
          onclick: function () {
            IAL.Store.updateActive(function (pr) {
              const i = pr.settings.lengths.indexOf(n);
              if (i === -1) pr.settings.lengths.push(n); else pr.settings.lengths.splice(i, 1);
              if (!pr.settings.lengths.length) pr.settings.lengths = [2, 3, 4, 5, 6];
            });
            render();
          }
        }, [String(n)]);
      })),

      el('h3', {}, ['Categorie in SOLO LETTURA']),
      el('div', { class: 'opt-row' }, cats.map(function (t) {
        const on = !!p.settings.categories[t.id];
        return el('button', {
          class: 'opt-chip' + (on ? ' on' : ''),
          onclick: function () {
            IAL.Store.updateActive(function (pr) {
              pr.settings.categories[t.id] = !pr.settings.categories[t.id];
              const c = pr.settings.categories;
              if (!c.letters && !c.syllables && !c.words) c.words = true;
            });
            render();
          }
        }, [t.label]);
      })),

      el('h3', {}, ['Livello di progressione']),
      el('div', {}, IAL.CONFIG.LEVELS.map(function (L) {
        return el('div', {
          class: 'level-row' + (p.settings.level === L.n ? ' on' : ''),
          onclick: function () {
            IAL.Store.updateActive(function (pr) { pr.settings.level = L.n; });
            render();
            IAL.UI.toast('Livello ' + L.n + ': ' + L.title);
          }
        }, [
          el('div', { class: 'ln' }, ['LIVELLO ' + L.n]),
          el('div', { class: 'ld' }, [el('strong', {}, [L.title + '. ']), L.desc])
        ]);
      })),
      el('h3', {}, ['Voce dell’app']),
      el('div', { class: 'opt-row' }, [
        el('button', {
          class: 'btn btn-soft btn-sm',
          onclick: function () {
            const inf = IAL.UI.speechInfo();
            IAL.UI.say('Ciao! Sono la voce dell’app. Tetto. Tatu. Mamma.');
            if (!inf.ok) IAL.UI.toast('Questo dispositivo non ha la sintesi vocale');
            else if (!inf.count) IAL.UI.toast('Nessuna voce installata: aggiungila nelle impostazioni del telefono');
            else IAL.UI.toast('Voce: ' + (inf.voice || 'predefinita') + ' (' + inf.count + ' voci)');
          }
        }, ['🔊 Prova la voce'])
      ]),
      el('div', { class: 'note' }, [
        'Se non senti la voce: alza il volume dei contenuti multimediali, togli il silenzioso ',
        '(su iPhone è l’interruttore laterale) e verifica che nel telefono sia installata una voce ',
        'italiana (Accessibilità → Sintesi vocale). Ogni sezione ha anche il pulsante 🔊 SENTI.'
      ]),
      el('div', { class: 'note' }, [
        'Il livello limita automaticamente lunghezza e difficoltà degli esercizi in TUTTE le sezioni: ',
        'salendo di livello compaiono parole più lunghe e complesse. Le tue scelte di lettere, sillabe ',
        'e categorie valgono sempre, ma dentro i limiti del livello scelto. ',
        'Nessun avanzamento automatico: sei tu a cambiare livello.'
      ])
    ]);
  }

  function statBox(value, label) {
    return el('div', { class: 'stat-box' }, [
      el('div', { class: 'v' }, [String(value)]),
      el('div', { class: 'k' }, [label])
    ]);
  }

  // ---------- Scheda: PROGRESSI ----------
  function panelStats(p) {
    const s = p.stats;
    const today = IAL.Store.todayStats(p);

    const lettersRows = Object.keys(s.byLetter)
      .sort(function (a, b) { return s.byLetter[b].shown - s.byLetter[a].shown; })
      .map(function (L) {
        const d = s.byLetter[L];
        return el('tr', {}, [
          el('td', {}, [el('strong', {}, [L])]),
          el('td', {}, [String(d.shown)]),
          el('td', {}, [String(d.correct)])
        ]);
      });

    const days = Object.keys(s.byDate).sort().slice(-7).reverse().map(function (d) {
      return el('tr', {}, [
        el('td', {}, [d]),
        el('td', {}, [String(s.byDate[d].done)]),
        el('td', {}, [String(s.byDate[d].correct)])
      ]);
    });

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Progressi di ' + p.name]),
      el('div', { class: 'stats-grid' }, [
        statBox(s.stars, '⭐ Stelline'),
        statBox(s.correct, '✅ Corretti'),
        statBox(s.retried, '💪 Da ripetere'),
        statBox(today.correct, '✔️ Corretti oggi')
      ]),

      lettersRows.length
        ? el('div', {}, [
            el('h3', {}, ['Esercizi per lettera']),
            el('table', { class: 'stats-table' }, [
              el('thead', {}, [el('tr', {}, [
                el('th', {}, ['Lettera']), el('th', {}, ['Proposti']), el('th', {}, ['Corretti'])
              ])]),
              el('tbody', {}, lettersRows)
            ])
          ])
        : el('div', { class: 'note' }, ['Nessun esercizio ancora completato. Iniziate a giocare! 🚀']),

      days.length
        ? el('div', {}, [
            el('h3', {}, ['Ultimi giorni']),
            el('table', { class: 'stats-table' }, [
              el('thead', {}, [el('tr', {}, [
                el('th', {}, ['Giorno']), el('th', {}, ['Esercizi']), el('th', {}, ['Corretti'])
              ])]),
              el('tbody', {}, days)
            ])
          ])
        : null,

      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:12px', onclick: function () {
        IAL.UI.confirmModal('Azzerare i progressi?',
          'Stelline e statistiche di ' + p.name + ' verranno cancellate.',
          function () {
            IAL.Store.updateActive(function (pr) {
              pr.stats = {
                stars: 0, correct: 0, retried: 0, total: 0,
                byLetter: {}, byDate: {}
              };
            });
            render();
            IAL.UI.toast('Progressi azzerati');
          }, 'Azzera');
      } }, ['🧹 Azzera i progressi'])
    ]);
  }

  // ---------- Scheda: SICUREZZA (solo PIN) ----------
  function panelSecurity() {
    const pin = IAL.Store.parentPin();
    const pinInput = el('input', { type: 'password', inputmode: 'numeric', maxlength: '4', placeholder: '4 cifre' });

    return el('div', { class: 'panel' }, [
      el('h2', {}, ['Sicurezza']),
      el('h3', {}, ['PIN dell’Area Genitori']),
      el('p', { class: 'hint' }, [
        pin
          ? 'Un PIN è attivo: l’Area Genitori richiede il codice all’apertura.'
          : 'Nessun PIN attivo. Con il PIN, il bambino non può entrare nell’Area Genitori.'
      ]),
      el('div', { class: 'field' }, [pinInput]),
      el('div', { class: 'opt-row' }, [
        el('button', { class: 'btn btn-primary btn-sm', onclick: function () {
          const v = (pinInput.value || '').trim();
          if (!/^\d{4}$/.test(v)) { IAL.UI.toast('Il PIN deve avere 4 cifre 🔢'); return; }
          IAL.Store.setParentPin(v);
          IAL.UI.toast('PIN salvato 🔒');
          render();
        } }, ['Salva PIN']),
        pin ? el('button', { class: 'btn btn-soft btn-sm', onclick: function () {
          IAL.Store.setParentPin(null);
          IAL.UI.toast('PIN rimosso');
          render();
        } }, ['Rimuovi PIN']) : null
      ]),
      el('div', { class: 'note' }, [
        '🔒 Privacy: i dati dei bambini non lasciano il dispositivo. Non vengono raccolti ',
        'dati personali né usati strumenti pubblicitari o di tracciamento.'
      ])
    ]);
  }

  return { show: show };
})();
