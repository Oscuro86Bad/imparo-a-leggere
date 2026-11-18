/* ============================================================
   IMPARO A LEGGERE — componenti UI di base
   Helper DOM, modali, toast, stelle animate, premi.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.UI = (function () {

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      } else if (attrs[k] !== null && attrs[k] !== undefined) {
        node.setAttribute(k, attrs[k]);
      }
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || typeof c === 'boolean') return;
      if (typeof c === 'string' || typeof c === 'number') {
        node.appendChild(document.createTextNode(String(c)));
      } else {
        node.appendChild(c);
      }
    });
    return node;
  }

  // ---------- Schermata ----------
  function renderScreen(nodes, opts) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    window.scrollTo(0, 0);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { app.appendChild(n); });
  }

  // ---------- Overlay / modale ----------
  function closeModal() {
    const o = document.getElementById('overlay');
    o.className = 'overlay hidden';
    o.innerHTML = '';
  }

  function modal(contentNodes, opts) {
    opts = opts || {};
    const o = document.getElementById('overlay');
    const box = el('div', { class: 'modal' }, contentNodes);
    o.innerHTML = '';
    o.appendChild(box);
    o.className = 'overlay';
    o.onclick = function (e) { if (e.target === o && !opts.locked) closeModal(); };
  }

  function alertModal(title, message, emoji, btnLabel) {
    const btn = el('button', { class: 'btn btn-primary', onclick: closeModal }, btnLabel || 'OK');
    modal([
      el('div', { class: 'big-emoji' }, [emoji || '💡']),
      el('h3', {}, [title]),
      el('div', { class: 'modal-body' }, [message]),
      el('div', { class: 'modal-actions' }, [btn])
    ]);
  }

  function confirmModal(title, message, onYes, yesLabel) {
    modal([
      el('div', { class: 'big-emoji' }, ['🤔']),
      el('h3', {}, [title]),
      el('div', { class: 'modal-body' }, [message]),
      el('div', { class: 'modal-actions' }, [
        el('button', { class: 'btn btn-danger', onclick: function () { closeModal(); onYes(); } }, [yesLabel || 'Sì']),
        el('button', { class: 'btn btn-soft', onclick: closeModal }, ['Annulla'])
      ])
    ]);
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = el('div', { class: 'toast' }, [msg]);
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 2600);
  }

  // ---------- Feedback positivo ----------
  function starBurst(emoji) {
    const s = el('div', { class: 'star-burst' }, [emoji || '⭐']);
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 950);
  }

  const rand = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  const praise = function () { return rand(IAL.CONFIG.PRAISE); };
  const retryMsg = function () { return rand(IAL.CONFIG.RETRY); };

  return {
    el: el, renderScreen: renderScreen,
    modal: modal, alertModal: alertModal, confirmModal: confirmModal, closeModal: closeModal,
    toast: toast, starBurst: starBurst, praise: praise, retryMsg: retryMsg,
    rand: rand
  };
})();
