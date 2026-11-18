/* ============================================================
   IMPARO A LEGGERE — lettura parole da FOTO (OCR)
   Serve alla sezione PAROLE MIE: il genitore fotografa una
   pagina (quaderno, libro, biglietto) e l'app ricava le parole
   da aggiungere, una per una.

   PRIVACY: il riconoscimento avviene DENTRO il telefono
   (WebAssembly + Tesseract.js). Nessuna foto viene caricata o
   inviata a un server: dal dispositivo escono solo i file del
   motore OCR, scaricati dal CDN una volta sola e poi in cache.

   COME MIGLIORA LA LETTURA:
   1. La foto viene ridimensionata (max 2400 px) e ripulita:
      l'illuminazione irregolare (ombre, luce gialla) viene
      corretta dividendo per lo sfondo sfocato, poi si allunga
      il contrasto. Di ogni foto si prepara anche una versione
      in bianco e nero (soglia di Otsu).
   2. Il testo viene letto PIÙ VOLTE con impostazioni diverse
      (blocco unico / parole sparse, foto normale / bianco e
      nero): si ferma appena trova abbastanza parole buone.
   3. Ogni parola ha un punteggio di sicurezza del motore: le
      parole poco credibili vengono scartate e i risultati dei
      vari passaggi vengono uniti (vince la sicurezza migliore).
   4. Gli errori tipici della lettura automatica vengono
      corretti (0→O, 1→I, 5→S, 8→B) e si scartano numeri,
      simboli, lettere singole e rumore.

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

  const MAX_SIDE = 2400;   // riduce le foto enormi (più veloce)
  const MIN_SIDE = 1600;   // ingrandisce le foto piccole (più preciso)
  const MAX_WORD = 12;     // stessa lunghezza massima del campo manuale
  const MIN_CONF = 30;     // sicurezza minima per tenere una parola (0-100)
  const MAX_WORDS = 120;   // limite di sicurezza per una foto

  // Lettere ammesse in uscita (italiano, maiuscole/minuscole). NON si usa
  // il filtro "tessedit_char_whitelist" del motore: su Tesseract 5 unisce
  // le parole tra loro e azzera la confidenza. Si filtra dopo, parola per
  // parola, con cleanWord().
  const LETTERS = /[A-Za-zÀ-ÿ]/;

  // Passaggi di lettura: si ferma appena i risultati bastano.
  const PASSES = [
    { key: 'base', psm: '6' },   // pagina intera, blocco unico
    { key: 'bw',   psm: '6' },   // bianco e nero, blocco unico
    { key: 'base', psm: '11' },  // parole sparse (titoli, poche parole)
    { key: 'bw',   psm: '11' },  // parole sparse in bianco e nero
    { key: 'base', psm: '3' }    // pagina con disegni e titoli (layout libero)
  ];

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

  // Corregge le confusioni tipiche della lettura automatica:
  // 0→O, 1→I, 5→S, 8→B (solo dentro parole che hanno già lettere).
  function fixDigits(t) {
    return String(t)
      .replace(/0/g, 'O').replace(/1/g, 'I')
      .replace(/5/g, 'S').replace(/8/g, 'B');
  }

  // Pulisce un singolo frammento letto dal motore: '' = da scartare.
  function cleanWord(raw) {
    const s = String(raw || '');
    if (!LETTERS.test(s)) return '';              // solo numeri/simboli
    const w = normalize(fixDigits(s));
    if (w.length < 2 || w.length > MAX_WORD) return '';
    if (!/[AEIOU]/.test(w)) return '';            // una parola italiana ha sempre una vocale
    if (w.replace(/(.)\1+/g, '$1').length < 2) return '';  // scarta "AAAA", "MMMM"
    return w;
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
    if (s === 'recognizing text') report('Leggo la foto…', 0.35 + p * 0.5);
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
        preserve_interword_spaces: '1'
      }).then(function () { return worker; });
    }).catch(function (e) {
      workerPromise = null;
      throw e;
    });
    return workerPromise;
  }

  // ---------- preparazione immagine ----------
  function canvasOf(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    return c;
  }

  function toCanvas(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('Non riesco a leggere questa foto.');

    const longSide = Math.max(w, h);
    let scale = 1;
    if (longSide > MAX_SIDE) scale = MAX_SIDE / longSide;
    else if (longSide < MIN_SIDE) scale = Math.min(3, MIN_SIDE / longSide);

    const c = canvasOf(Math.round(w * scale), Math.round(h * scale));
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  // Corregge l'illuminazione: divide ogni punto per lo sfondo locale
  // (versione molto sfocata). Ombre e luce gialla spariscono, il foglio
  // torna bianco e le lettere nere: è il passaggio che fa la differenza
  // sulle foto fatte col telefono.
  function flatten(canvas) {
    const w = canvas.width, h = canvas.height;
    const sw = Math.max(8, Math.round(w / 12));
    const sh = Math.max(8, Math.round(h / 12));

    const small = canvasOf(sw, sh);
    const sg = small.getContext('2d');
    sg.imageSmoothingEnabled = true;
    sg.imageSmoothingQuality = 'high';
    sg.drawImage(canvas, 0, 0, sw, sh);

    const bg = canvasOf(w, h);
    const bgc = bg.getContext('2d');
    bgc.imageSmoothingEnabled = true;
    bgc.imageSmoothingQuality = 'high';
    bgc.drawImage(small, 0, 0, w, h);

    const g = canvas.getContext('2d');
    let src, bgd;
    try {
      src = g.getImageData(0, 0, w, h);
      bgd = bgc.getImageData(0, 0, w, h);
    } catch (e) { return canvas; }  // immagine protetta: si prova lo stesso

    const d = src.data, b = bgd.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      const bgv = Math.max(24, b[i] * 0.299 + b[i + 1] * 0.587 + b[i + 2] * 0.114);
      let o = (v * 255) / bgv;
      if (o > 255) o = 255;
      d[i] = d[i + 1] = d[i + 2] = o;
    }
    g.putImageData(src, 0, 0);
    return canvas;
  }

  // Scala di grigi + allungamento del contrasto (percentili 2%–98%).
  function stretch(canvas) {
    const g = canvas.getContext('2d');
    let frame;
    try { frame = g.getImageData(0, 0, canvas.width, canvas.height); }
    catch (e) { return canvas; }
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

  // Bianco e nero con la soglia di Otsu: utile per stampe sbiadite
  // o foto con luce forte.
  function binarize(src) {
    const c = canvasOf(src.width, src.height);
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    let frame;
    try { frame = g.getImageData(0, 0, c.width, c.height); }
    catch (e) { return c; }
    const d = frame.data;
    const hist = new Uint32Array(256);
    const total = d.length / 4;
    for (let i = 0; i < d.length; i += 4) hist[d[i]]++;

    let sum = 0;
    for (let v = 0; v < 256; v++) sum += v * hist[v];
    let sumB = 0, wB = 0, maxVar = -1, thr = 128;
    for (let v = 0; v < 256; v++) {
      wB += hist[v];
      if (!wB) continue;
      const wF = total - wB;
      if (!wF) break;
      sumB += v * hist[v];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > maxVar) { maxVar = between; thr = v; }
    }
    for (let i = 0; i < d.length; i += 4) {
      const v = d[i] > thr ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    g.putImageData(frame, 0, 0);
    return c;
  }

  function prepare(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try {
          const base = stretch(flatten(toCanvas(img)));
          resolve({ base: base, bw: binarize(base) });
        } catch (e) { reject(e); }
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
    t.split(/[^A-Za-zÀ-ÿ0-9]+/).forEach(function (token) {
      const w = cleanWord(token);
      if (w && out.indexOf(w) === -1) out.push(w);
    });
    return out;
  }

  // ---------- raccolta dei risultati ----------
  // Estrae l'elenco delle parole riconosciute con la loro sicurezza.
  // Tesseract.js v6/v7 non restituisce più data.words: le parole sono
  // dentro data.blocks → paragraphs → lines → words (solo se si chiede
  // l'output "blocks" a recognize).
  function wordList(data) {
    const list = [];
    if (data && Array.isArray(data.words) && data.words.length) {
      return data.words;                       // versioni più vecchie
    }
    const blocks = (data && data.blocks) || [];
    for (let b = 0; b < blocks.length; b++) {
      const paras = blocks[b] && blocks[b].paragraphs || [];
      for (let p = 0; p < paras.length; p++) {
        const lines = paras[p] && paras[p].lines || [];
        for (let l = 0; l < lines.length; l++) {
          const words = lines[l] && lines[l].words || [];
          for (let w = 0; w < words.length; w++) if (words[w]) list.push(words[w]);
        }
      }
    }
    return list;
  }

  // Aggiunge le parole lette nel passaggio corrente, tenendo per ognuna
  // la sicurezza migliore. Usa i dati per-parola del motore (con la
  // confidenza) e, se non ci sono, ripiega sul testo semplice.
  function collect(acc, data) {
    if (!data) return;
    let added = 0;
    const list = wordList(data);
    if (list.length) {
      for (let i = 0; i < list.length; i++) {
        const item = list[i] || {};
        const w = cleanWord(item.text);
        if (!w) continue;
        const conf = Math.round(Number(item.confidence) || 0);
        if (conf < MIN_CONF) continue;
        const prev = acc.get(w) || 0;
        if (conf > prev) acc.set(w, conf);
        added++;
      }
    } else {
      wordsFromText(data.text).forEach(function (w) {
        const prev = acc.get(w) || 0;
        if (60 > prev) acc.set(w, 60);
        added++;
      });
    }
    return added;
  }

  // Abbastanza parole buone? Allora non serve leggere ancora.
  function enough(acc) {
    let n = 0, sum = 0;
    acc.forEach(function (c) { n++; sum += c; });
    if (!n) return false;
    const avg = sum / n;
    return (n >= 2 && avg >= 80) || (n >= 4 && avg >= 60) || n >= 8;
  }

  // Legge la foto con i vari passaggi, fermandosi quando basta.
  function readWithPasses(worker, imgs) {
    const acc = new Map();
    let idx = 0;
    let lastError = null;

    function nextPass() {
      if (idx >= PASSES.length) return Promise.resolve();
      const pass = PASSES[idx];
      idx += 1;
      report('Leggo la foto… (passo ' + idx + ' di ' + PASSES.length + ')',
        0.3 + (idx / PASSES.length) * 0.6);

      return worker.setParameters({ tessedit_pageseg_mode: pass.psm })
        .then(function () {
          // serve l'output "blocks" per avere le parole con la confidenza
          return worker.recognize(imgs[pass.key], {}, { text: true, blocks: true });
        })
        .then(function (res) {
          collect(acc, res && res.data);
          if (enough(acc)) return;
          return nextPass();
        })
        .catch(function (e) {
          lastError = e;
          return nextPass();   // un passaggio fallito non blocca gli altri
        });
    }

    return nextPass().then(function () {
      if (!acc.size && lastError) throw lastError;
      return acc;
    });
  }

  function finalize(acc) {
    const out = [];
    acc.forEach(function (conf, w) { out.push([w, conf]); });
    out.sort(function (a, b) { return b[1] - a[1]; });
    return out.slice(0, MAX_WORDS).map(function (e) { return e[0]; });
  }

  // ---------- riconoscimento ----------
  function recognize(file, onProgress) {
    progress = onProgress;
    lastPct = 0;
    report('Preparo la foto…', 0.03);

    return prepare(file).then(function (imgs) {
      report('Preparo il lettore…', 0.1);
      return getWorker().then(function (worker) {
        return readWithPasses(worker, imgs);
      }).then(function (acc) {
        report('Fatto!', 1);
        progress = null;
        return { text: '', words: finalize(acc) };
      });
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
