/* ============================================================
   IMPARO A LEGGERE — lettura parole da FOTO (OCR)
   Serve alla sezione PAROLE MIE: il genitore fotografa una
   pagina (quaderno, libro, biglietto) e l'app ricava le parole
   da aggiungere, una per una.

   PRIVACY: il riconoscimento avviene DENTRO il telefono
   (WebAssembly + Tesseract.js). Nessuna foto viene caricata o
   inviata a un server: dal dispositivo escono solo i file del
   motore OCR, scaricati dal CDN una volta sola e poi in cache.

   API:
     IAL.OCR.recognize(file, onProgress) → Promise<{text, words}>
     IAL.OCR.wordsFromText(testo)        → ['PAROLA', …]
     IAL.OCR.dispose()
   ============================================================ */
window.IAL = window.IAL || {};

IAL.OCR = (function () {
  const V = '7.0.0';
  const CDN = 'https://cdn.jsdelivr.net/npm';
  const LIB_URL = CDN + '/tesseract.js@' + V + '/dist/tesseract.min.js';
  const WORKER_PATH = CDN + '/tesseract.js@' + V + '/dist/worker.min.js';
  const CORE_PATH = CDN + '/tesseract.js-core@7.0.0';
  const LANG_PATH = CDN + '/@tesseract.js-data/ita@1.0.0/4.0.0';

  const MAX_SIDE = 2000;   // riduce le foto enormi (più veloce)
  const MIN_SIDE = 1400;   // ingrandisce le foto piccole (più preciso)
  const MAX_WORD = 12;     // stessa lunghezza massima del campo manuale

  let libPromise = null;
  let workerPromise = null;
  let progress = null;
  let lastPct = 0;

  // ---------- utilità ----------
  function report(label, pct) {
    if (typeof progress !== 'function') return;
    // la percentuale non torna mai indietro (Tesseract segnala più fasi)
    lastPct = Math.max(lastPct, Math.max(0, Math.min(1, pct)));
    try { progress(label, lastPct); } catch (e) { /* ignora */ }
  }

  function normalize(raw) {
    return String(raw || '').toUpperCase()
      .replace(/[ÀÁÂÃÄÅ]/g, 'A').replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I').replace(/[ÒÓÔÖØ]/g, 'O')
      .replace(/[ÙÚÛÜ]/g, 'U').replace(/[^A-Z]/g, '');
  }

  // ---------- caricamento del motore (una volta sola) ----------
  function loadLib() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (libPromise) return libPromise;

    libPromise = new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = LIB_URL;
      s.async = true;
      s.onload = function () {
        if (window.Tesseract) resolve(window.Tesseract);
        else { libPromise = null; reject(new Error('Lettore di testo non disponibile.')); }
      };
      s.onerror = function () {
        libPromise = null;
        reject(new Error('La prima volta serve internet per scaricare il lettore di testo. Poi funziona anche senza.'));
      };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function logger(m) {
    const s = String((m && m.status) || '');
    const p = (m && typeof m.progress === 'number') ? m.progress : 0;
    if (s === 'recognizing text') report('Leggo la foto…', 0.4 + p * 0.6);
    else if (/loading language traineddata/i.test(s)) report('Scarico il dizionario italiano (solo la prima volta)…', 0.05 + p * 0.25);
    else if (/loading|initializ|core/i.test(s)) report('Preparo il lettore…', 0.05 + p * 0.2);
  }

  function getWorker() {
    if (workerPromise) return workerPromise;
    workerPromise = loadLib().then(function (T) {
      return T.createWorker('ita', 1, {
        workerPath: WORKER_PATH,
        corePath: CORE_PATH,
        langPath: LANG_PATH,
        cacheMethod: 'write',          // il dizionario resta in cache sul dispositivo
        logger: logger
      });
    }).then(function (worker) {
      return worker.setParameters({
        tessedit_pageseg_mode: '3',    // pagina intera: più parole insieme
        preserve_interword_spaces: '1'
      }).then(function () { return worker; });
    }).catch(function (e) {
      workerPromise = null;
      throw e;
    });
    return workerPromise;
  }

  // ---------- preparazione immagine ----------
  function toCanvas(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('Non riesco a leggere questa foto.');

    const longSide = Math.max(w, h);
    let scale = 1;
    if (longSide > MAX_SIDE) scale = MAX_SIDE / longSide;
    else if (longSide < MIN_SIDE) scale = Math.min(3, MIN_SIDE / longSide);

    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return enhance(c);
  }

  // Scala di grigi + allungamento del contrasto: le foto con ombre o
  // luce gialla diventano molto più leggibili per il motore OCR.
  function enhance(canvas) {
    const g = canvas.getContext('2d');
    let frame;
    try { frame = g.getImageData(0, 0, canvas.width, canvas.height); }
    catch (e) { return canvas; }  // immagine protetta: si prova lo stesso
    const d = frame.data;
    const hist = new Uint32Array(256);

    for (let i = 0; i < d.length; i += 4) {
      const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      d[i] = d[i + 1] = d[i + 2] = l;
      hist[l]++;
    }

    const total = d.length / 4;
    const lowCut = total * 0.02;
    const highCut = total * 0.02;
    let acc = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= lowCut) { lo = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= highCut) { hi = v; break; } }

    if (hi - lo >= 40) {
      const k = 255 / (hi - lo);
      for (let i = 0; i < d.length; i += 4) {
        let v = (d[i] - lo) * k;
        v = v < 0 ? 0 : (v > 255 ? 255 : v);
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      g.putImageData(frame, 0, 0);
    }
    return canvas;
  }

  function prepare(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try { resolve(toCanvas(img)); } catch (e) { reject(e); }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Non riesco ad aprire questa foto.'));
      };
      img.src = url;
    });
  }

  // ---------- dal testo alle parole ----------
  function wordsFromText(text) {
    let t = String(text || '');
    // ricompone le parole spezzate a fine riga: "PAR-" + "LA" → PARLA
    t = t.replace(/([A-Za-zÀ-ÿ])-\s*\r?\n\s*([A-Za-zÀ-ÿ])/g, '$1$2');

    const out = [];
    t.split(/[^A-Za-zÀ-ÿ]+/).forEach(function (token) {
      const w = normalize(token);
      if (w.length < 2 || w.length > MAX_WORD) return;
      if (!/[AEIOU]/.test(w)) return;                    // una parola italiana ha sempre una vocale
      if (w.replace(/(.)\1+/g, '$1').length < 2) return;  // scarta "AAAA", "MMMM"
      if (out.indexOf(w) === -1) out.push(w);
    });
    return out;
  }

  // ---------- riconoscimento ----------
  function recognize(file, onProgress) {
    progress = onProgress;
    lastPct = 0;
    report('Preparo la foto…', 0.03);

    return prepare(file).then(function (canvas) {
      report('Preparo il lettore…', 0.1);
      return getWorker().then(function (worker) {
        report('Leggo la foto…', 0.4);
        return worker.recognize(canvas);
      });
    }).then(function (res) {
      const text = String((res && res.data && res.data.text) || '');
      report('Fatto!', 1);
      progress = null;
      return { text: text, words: wordsFromText(text) };
    }).catch(function (e) {
      progress = null;
      const msg = String((e && e.message) || e || '');
      if (!navigator.onLine) {
        throw new Error('Per usare la foto la prima volta serve internet (per scaricare il lettore di testo). Poi funziona anche offline.');
      }
      throw new Error(msg || 'Non sono riuscito a leggere la foto.');
    });
  }

  function dispose() {
    const w = workerPromise;
    workerPromise = null;
    progress = null;
    if (w) w.then(function (worker) { try { worker.terminate(); } catch (e) {} });
  }

  return {
    recognize: recognize,
    wordsFromText: wordsFromText,
    dispose: dispose
  };
})();
