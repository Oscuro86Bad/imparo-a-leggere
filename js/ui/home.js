/* ============================================================
   IMPARO A LEGGERE — SCHERMATA PRINCIPALE + onboarding profili
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Home = (function () {
  const el = IAL.UI.el;

  function show() {
    const p = IAL.Store.active();
    if (!p) { showOnboarding(); return; }
    renderHome(p);
  }

  function renderHome(p) {
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: switchProfileModal, 'aria-label': 'Cambia profilo' }, [
        el('span', { class: 'avatar' }, [p.avatar]), p.name, ' ▾'
      ])
    ]);

    const menu = el('div', { class: 'menu' }, [
      el('button', { class: 'btn btn-primary btn-block', onclick: function () { IAL.Reading.show(); } }, [
        el('span', { class: 'emoji' }, ['📖']),
        el('span', { class: 'txt' }, ['SOLO LETTURA', el('span', { class: 'small' }, ['Leggi sillabe e parole'])])
      ]),
      el('button', { class: 'btn btn-green btn-block', onclick: function () { IAL.Match.show(); } }, [
        el('span', { class: 'emoji' }, ['🖼️']),
        el('span', { class: 'txt' }, ['LEGGI E GUARDA', el('span', { class: 'small' }, ['Leggi la parola e guarda l’immagine'])])
      ]),
      el('button', { class: 'btn btn-orange btn-block', onclick: function () { IAL.Speech.show(); } }, [
        el('span', { class: 'emoji' }, ['🎤']),
        el('span', { class: 'txt' }, ['DICO LA PAROLA', el('span', { class: 'small' }, ['Pronuncia la parola: l’app ti ascolta'])])
      ]),
      el('button', { class: 'btn btn-teal btn-block', onclick: function () { IAL.Choice.show(); } }, [
        el('span', { class: 'emoji' }, ['🔍']),
        el('span', { class: 'txt' }, ['VEDI E SCEGLI', el('span', { class: 'small' }, ['Indovina l’inizio della parola'])])
      ]),
      el('button', { class: 'btn btn-pink btn-block', onclick: function () { IAL.Listen.show(); } }, [
        el('span', { class: 'emoji' }, ['🎧']),
        el('span', { class: 'txt' }, [
          el('span', { class: 'line-title' }, [
            el('span', {}, ['ASCOLTA E SELEZIONA']),
            el('span', { class: 'cloud-badge' }, ['(NEW-BETA)'])
          ]),
          el('span', { class: 'small' }, ['Ascolta la parola e scegli quella giusta'])
        ])
      ]),
      el('button', { class: 'btn btn-brown btn-block', onclick: function () { IAL.Complete.show(); } }, [
        el('span', { class: 'emoji' }, ['✍️']),
        el('span', { class: 'txt' }, [
          el('span', { class: 'line-title' }, [
            el('span', {}, ['COMPLETA LA PAROLA']),
            el('span', { class: 'cloud-badge' }, ['(NEW-BETA)'])
          ]),
          el('span', { class: 'small' }, ['Scrivi con il dito le lettere che mancano'])
        ])
      ]),
      el('button', { class: 'btn btn-purple btn-block', onclick: function () { IAL.Custom.show(); } }, [
        el('span', { class: 'emoji' }, ['📝']),
        el('span', { class: 'txt' }, ['PAROLE PERSONALIZZATE', el('span', { class: 'small' }, ['Le parole scelte da te, in ordine casuale'])])
      ]),
      el('button', { class: 'btn btn-slate btn-block', onclick: function () { IAL.Parent.show(); } }, [
        el('span', { class: 'emoji' }, ['🔒']),
        el('span', { class: 'txt' }, ['AREA GENITORI', el('span', { class: 'small' }, ['Lettere, combinazioni, progressi'])])
      ])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['IMPARO A LEGGERE']),
      el('p', { class: 'app-subtitle' }, ['Ciao ' + p.name + ', pronta a ripassare?']),
      el('div', { class: 'hero' }, ['🦉📚']),
      menu,
      el('p', { class: 'footer-note' }, ['Nessuna pubblicità · Funziona anche offline · I dati restano nel tuo dispositivo'])
    ]);
  }

  // ---------- Cambio profilo ----------
  function switchProfileModal() {
    const profiles = IAL.Store.all();
    const rows = profiles.map(function (pr) {
      const isOn = pr.id === IAL.Store.activeId();
      return el('div', { class: 'profile-card' }, [
        el('div', { class: 'pv' }, [pr.avatar]),
        el('div', { class: 'pi' }, [
          el('div', { class: 'pn' }, [pr.name]),
          el('div', { class: 'pd' }, ['⭐ ' + pr.stats.stars + ' · ' +
            (pr.letters.vowels.length + pr.letters.consonants.length) + ' lettere abilitate'])
        ]),
        isOn
          ? el('span', { class: 'chip' }, ['✓ In uso'])
          : el('button', { class: 'btn btn-primary btn-sm', onclick: function () { IAL.Store.setActive(pr.id); IAL.UI.closeModal(); show(); } }, ['Usa'])
      ]);
    });

    IAL.UI.modal([
      el('h3', {}, ['Chi vuole giocare?']),
      el('div', { class: 'modal-body' }, rows.concat([
        el('div', { class: 'modal-actions' }, [
          el('button', { class: 'btn btn-green', onclick: function () { IAL.UI.closeModal(); showOnboarding(true); } }, ['➕ Nuovo profilo'])
        ])
      ]))
    ]);
  }

  // ---------- Primo avvio / nuovo profilo ----------
  let wizardAvatar = '🐻';
  function showOnboarding(fromSwitcher) {
    wizardAvatar = IAL.CONFIG.AVATARS[0];
    const nameInput = el('input', { type: 'text', id: 'ob-name', maxlength: '14', placeholder: 'Es. Sofia', autocomplete: 'off' });
    const avatarGrid = el('div', { class: 'avatar-grid' }, IAL.CONFIG.AVATARS.map(function (a, i) {
      return el('button', {
        class: 'avatar-opt' + (i === 0 ? ' on' : ''),
        onclick: function (e) {
          wizardAvatar = a;
          avatarGrid.querySelectorAll('.avatar-opt').forEach(function (n) { n.classList.remove('on'); });
          e.currentTarget.classList.add('on');
        }
      }, [a]);
    }));

    const back = function () { fromSwitcher ? switchProfileModal() : show(); };

    IAL.UI.modal([
      el('div', { class: 'big-emoji' }, ['👋']),
      el('h3', {}, ['Crea il profilo']),
      el('div', { class: 'modal-body' }, [
        el('div', { class: 'field' }, [
          el('label', {}, ['Nome del bambino / della bambina']), nameInput
        ]),
        el('label', {}, ['Scegli il tuo amichetto!']), avatarGrid,
        el('div', { class: 'note' }, [
          'Dopo, nell’Area Genitori, attiverai le lettere già studiate a scuola: ',
          'le loro sillabe (PA, PE…) si attivano da sole.'
        ]),
        el('div', { class: 'modal-actions' }, [
          el('button', { class: 'btn btn-primary', onclick: function () {
            const name = (nameInput.value || '').trim();
            if (!name) { IAL.UI.toast('Scrivi un nome! ✏️'); return; }
            IAL.Store.createProfile(name, wizardAvatar);
            IAL.UI.closeModal();
            show();
          } }, ['Inizia! 🚀']),
          fromSwitcher ? el('button', { class: 'btn btn-soft', onclick: back }, ['Annulla']) : null
        ])
      ])
    ], { locked: !fromSwitcher });
  }

  return { show: show, showOnboarding: showOnboarding };
})();
