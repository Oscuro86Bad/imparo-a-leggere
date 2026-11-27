# -*- coding: utf-8 -*-
"""Genera js/data/sentences.js a partire dall'archivio parole dell'app.

Ogni frase è italiana, breve all'inizio e più lunga/collegata man mano che
crescono le consonanti conosciute. Per ogni frase vengono memorizzate:

  t = testo (maiuscolo, con punteggiatura)
  c = consonanti distinte necessarie (H muta esclusa, Q inclusa)
  d = difficoltà 1..4 (1 = 2-3 parole e al massimo 2 consonanti)
  w = numero di parole
  e = emoji della vignetta (una per parola "piena" della frase)

Il gating della sezione LEGGI LA FRASE usa solo `c`: le vocali si danno per
apprese. La lunghezza/difficoltà massima è invece calcolata dal motore in base
al numero di consonanti attive del profilo (vedi IAL.Engine.sentenceCap).

Uso: python tools/generate_sentences.py
"""
import itertools
import json
import os
import random
import re
import sys
from collections import Counter, defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS_JS = os.path.join(ROOT, 'js', 'data', 'words.js')
OUT_JS = os.path.join(ROOT, 'js', 'data', 'sentences.js')

CONS = set('BCDFGLMNPRSTVZQ')       # H è muta: non conta per il gating
ALLOWED = set('AEIOUBCDFGHLMNPQRSTVZX')  # X solo nelle parole elencate sotto
BLOCKED = {'CACCA', 'HORROR', 'HOT', 'TOKYO', 'DODA', 'DODI', 'DODO',
           'BOMBA', 'BOMBE', 'DVD', 'DNA', 'DRACULA', 'BAGEL', 'ZIBIBBO',
           'BUBBLE', 'DANCE', 'SUV', 'ZUMO', 'RAMEN'}

# La X non è una consonante attivabile dall'Area Genitori: per le poche parole
# straniere che la contengono dichiariamo esplicitamente la consonante che il
# bambino deve conoscere, così la frase non appare mai con lettere non attive.
FORCED = {
    'FAX': 'F', 'REX': 'R', 'BOXER': 'BR', 'RELAX': 'RL',
    'XILOFONO': 'FLN', 'SCOTTEX': 'SCTR'
}


def cons(text):
    return set(ch for ch in text.upper() if ch in CONS)


def word_cons(w):
    """Consonanti necessarie per una parola (X inclusa tramite FORCED)."""
    return cons(w) | set(FORCED.get(w, ''))


def clean_emoji(img):
    """Restituisce una emoji semplice (non composta con ZWJ) oppure None."""
    if not img or img == 'null' or img.startswith('img/') or '\u200d' in img:
        return None
    if any(ch.isalpha() for ch in img):
        return None
    # keycap (1️⃣, 2️⃣, 8️⃣): sostituite con un simbolo numerico stabile
    if '\u20e3' in img:
        return '🔢'
    first = img[0]
    if len(img) > 1 and ord(img[1]) == 0xFE0F:
        first += img[1]
    if not (ord(first[0]) >= 0x2300 or first[0].isalpha()):
        return None
    return first


def load_words():
    js = open(WORDS_JS, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r"\{\s*w:\s*'([A-ZÀ-Ù]+)'[^}]*?img:\s*('(?:[^']*)'|null)[^}]*?diff:\s*(\d)", js):
        w, img, diff = m.group(1), m.group(2).strip("'"), int(m.group(3))
        if w in out or w in BLOCKED or img == 'null':
            continue
        # Anche le parole "medie" (diff 2) sono ammesse, purché corte: servono
        # per copr consonanti (es. FAX per la F) e dare varietà con poche
        # consonanti attive. Niente parole lunghe o complesse.
        if diff > 2 or len(w) > 6 or not all(ch in ALLOWED for ch in w):
            continue
        if 'X' in w and w not in FORCED:
            continue
        e = clean_emoji(img)
        if e:
            out[w] = e
    return out


# ---------------------------------------------------------------------------
# Template: {W}, {W2}, {W3} sono segnaposto per parole dell'archivio.
# Le consonanti del testo fisso vengono calcolate automaticamente.
# ---------------------------------------------------------------------------
TEMPLATES = [
    # --- brevissime (vocali + al massimo una consonante) ---
    '{W} E {W2}.', 'HO {W}.', 'OH, {W}!', 'IO HO {W}.',
    '{W}, {W2}!', '{W} O {W2}.', 'SÌ, {W}!', 'NO, {W}.', 'HAI {W}?',
    'Ecco {W}!', "C'è {W}.", 'Ciao, {W}!', 'Cerca {W}.',
    "Che cos'è {W}?", 'Chi ha {W}?', 'Dai {W} a {W2}.',
    'Dove è {W}?', 'Mi piace {W}.', 'Non ho {W}.', 'Nuota {W}.',
    'Per {W}.', 'Passa {W}.', 'Ride {W}.', 'Salta {W}.', 'Sotto {W}.',
    'Tieni {W}.', 'Tocca {W}.', 'Trova {W}.', 'Vedi {W}.', 'Guarda {W}.',
    'Gioca con {W}.', 'Lascia {W}.', 'Leggi {W}.',
    'Metti {W} qui.', 'Scusa, {W}.', 'Spingi {W}.', 'Va bene, {W}.',
    'Grazie, {W}!', 'Nascondi {W}.', 'Riguarda {W}.', 'Voglio {W}.',
    'Dona {W} a {W2}.', 'Dorme {W}.', 'Porta {W} a {W2}.',
    'Mostra {W} a {W2}.', 'Non mi piace {W}.', 'Basta {W}.',
    'Qui {W}.',
    # --- due parole (arrivano con due o tre consonanti) ---
    'Guarda {W} e {W2}.', 'Ecco {W} e {W2}.', 'Vedi {W} e {W2}.',
    'Cerca {W} e {W2}.', 'Prendi {W} e {W2}.', 'Trova {W} e {W2}.',
    "C'è {W} e {W2}.", 'Porta {W} e {W2}.', 'Metti {W} e {W2} qui.',
    'Mi piace {W} e {W2}.', 'Guarda {W} con {W2}.',
    'Mi piace {W} con {W2}.', 'Dove sono {W} e {W2}?',
    'Sì, voglio {W} e {W2}.', 'Non voglio {W} né {W2}.',
    'Canta con {W} e {W2}.', 'Non ho {W} né {W2}.',
    'Dai {W} a {W2} e a {W3}.', 'Ecco {W}, {W2} e {W3}!',
    'Vedi {W}, {W2} e {W3}.', 'Voglio {W}, {W2} e {W3}.',
    'Porta {W}, {W2} e {W3} a mamma.', 'Tieni {W}, {W2} e {W3}.',
    # --- lunghe (ultimo livello: tante parole, tante consonanti) ---
    'Guarda {W}, {W2} e {W3} con {W4} e {W5}.',
    'Dai {W} e {W2} a {W3} e a {W4}.',
    'Porta {W}, {W2}, {W3} e {W4} a mamma.',
    'Mi piace {W}, {W2} e {W3}, non {W4}.',
    'Vedi {W}, {W2}, {W3} e {W4}.',
    'Ecco {W}, {W2}, {W3}, {W4} e {W5}.',
    'Vedi {W}, {W2}, {W3}, {W4} e {W5}.',
    'Voglio {W}, {W2}, {W3}, {W4} e {W5}.',
    'Ho {W}, {W2}, {W3}, {W4} e {W5}.',
    '{W}, {W2}, {W3}, {W4} e {W5}.',
]

SLOTS = [len(re.findall(r'\{W\d?\}', t)) for t in TEMPLATES]
LIT_CONS = [cons(re.sub(r'\{W\d?\}', '', t)) for t in TEMPLATES]


def difficulty(text, nwords, ncons):
    if nwords <= 3 and ncons <= 2:
        return 1
    if nwords <= 4 and ncons <= 3:
        return 2
    if nwords <= 6 and ncons <= 5:
        return 3
    return 4


def make_candidate(ti, words, emoji):
    pattern = TEMPLATES[ti]
    text = pattern
    used = []
    for i in range(1, SLOTS[ti] + 1):
        key = '{W}' if i == 1 else '{W' + str(i) + '}'
        w = words[i - 1]
        text = text.replace(key, w, 1)
        used.append(w)
    base = re.sub(r'\{W\d?\}', '', pattern)
    nwords = len(re.sub(r'[,!?.]', ' ', base).split()) + len(used)
    cset = cons(text)
    for w in used:
        cset |= word_cons(w)
    d = difficulty(text, nwords, len(cset))
    emos = [emoji[w] for w in used]
    return {
        't': text, 'c': ''.join(sorted(cset)), 'd': d, 'w': nwords, 'e': emos,
        'ti': ti
    }


def generate(pool):
    """Genera candidati per sottoinsiemi di consonanti sempre più ampi."""
    out = {}
    letters = 'BCDFGLMNPRSTVZQ'
    subsets = []
    for size, limit, per_subset in [(1, None, 10), (2, None, 5), (3, None, 3),
                                    (4, 260, 2), (5, 130, 2), (6, 80, 2)]:
        all_subs = list(itertools.combinations(letters, size))
        if limit:
            step = max(1, len(all_subs) // limit)
            all_subs = all_subs[::step][:limit]
        subsets.append((all_subs, per_subset))

    rng = random.Random(20261127)
    for group_idx, (subs, per_subset) in enumerate(subsets):
        for si, sub in enumerate(subs):
            S = set(sub)
            usable = sorted([w for w in pool if word_cons(w) <= S],
                            key=lambda w: (len(word_cons(w)), len(w), w))
            if not usable:
                continue
            made = 0
            # ruota i template: ogni sottoinsieme vede modelli diversi
            order = list(range(len(TEMPLATES)))
            rng.shuffle(order)
            for ti in order:
                if made >= per_subset:
                    break
                n = SLOTS[ti]
                if LIT_CONS[ti] <= S and len(usable) >= n:
                    start = (si * 3 + ti) % len(usable)
                    chosen = [usable[(start + k) % len(usable)] for k in range(n)]
                    if len(set(chosen)) != n:
                        continue
                    cand = make_candidate(ti, chosen, pool)
                    if cand['t'] in out:
                        continue
                    out[cand['t']] = cand
                    made += 1

    # Passata dedicata al primo livello: ogni consonante (e ogni coppia di
    # consonanti) deve avere diverse frasi brevi, così anche chi conosce
    # pochissime lettere trova varietà invece di una sola frase.
    d1_templates = [i for i in range(len(TEMPLATES)) if SLOTS[i] <= 2]
    d1_targets = [(c,) for c in letters] + list(itertools.combinations(letters, 2))
    for sub in d1_targets:
        S = set(sub)
        target = ''.join(sorted(S))
        usable = sorted([w for w in pool if word_cons(w) <= S],
                        key=lambda w: (len(word_cons(w)), len(w), w))
        if not usable:
            continue
        made = 0
        per_target = {}
        for exact_only in (True, False):
            if made >= 6:
                break
            order = d1_templates[:]
            rng.shuffle(order)
            for ti in order:
                if made >= 6:
                    break
                if not LIT_CONS[ti] <= S:
                    continue
                n = SLOTS[ti]
                if len(usable) < n:
                    continue
                tries = len(usable) if n == 1 else min(18, len(usable))
                for k in range(tries):
                    start = (k + ti * 2) % len(usable)
                    chosen = [usable[(start + j * 3) % len(usable)] for j in range(n)]
                    if len(set(chosen)) != n:
                        continue
                    cand = make_candidate(ti, chosen, pool)
                    if cand['d'] != 1:
                        continue
                    cset = set(cand['c'])
                    if exact_only and cset != S:
                        continue
                    if not exact_only and not (cset <= S and cset):
                        continue
                    # La frase può già esistere (generata dalla passata
                    # generale): in quel caso la "promuoviamo" a priority.
                    item = out.get(cand['t'])
                    if item is None:
                        item = cand
                        out[cand['t']] = item
                    if not item.get('pri'):
                        item['pri'] = True
                        item['target'] = target
                        per_target[cand['t']] = 1
                        made += 1
                    if made >= 6:
                        break

    # Passata dedicata alle frasi lunghe: servono esempi ricchi anche quando
    # il bambino conosce poche consonanti (la lunghezza resta filtrata dal
    # motore in base al numero di consonanti attive).
    long_idx = [i for i, t in enumerate(TEMPLATES) if SLOTS[i] >= 3]
    long_subs = []
    for size in (2, 3, 4, 5):
        all_subs = list(itertools.combinations(letters, size))
        step = max(1, len(all_subs) // (140 if size >= 4 else 90))
        long_subs.extend(all_subs[::step][:(140 if size >= 4 else 90)])
    for si, sub in enumerate(long_subs):
        S = set(sub)
        usable = sorted([w for w in pool if word_cons(w) <= S],
                        key=lambda w: (len(word_cons(w)), len(w), w))
        if len(usable) < 3:
            continue
        made = 0
        for ti in long_idx:
            if made >= 4:
                break
            if not LIT_CONS[ti] <= S:
                continue
            n = SLOTS[ti]
            if len(usable) < n:
                continue
            for k in range(3):
                start = (si * 5 + ti * 2 + k) % len(usable)
                chosen = [usable[(start + j * 3) % len(usable)] for j in range(n)]
                if len(set(chosen)) != n:
                    continue
                cand = make_candidate(ti, chosen, pool)
                if cand['t'] in out:
                    continue
                out[cand['t']] = cand
                made += 1
                break
    return list(out.values())


def select(candidates):
    """Seleziona un insieme bilanciato: breve all'inizio, ricco dopo."""
    bydiff = defaultdict(list)
    for c in candidates:
        bydiff[c['d']].append(c)
    for d in bydiff:
        rng = random.Random(100 + d)
        # Round-robin tra i modelli: evita che una frase lunga monopolizzi
        # tutto il livello (es. tutte le d4 che iniziano con "Dai").
        groups = defaultdict(list)
        for c in bydiff[d]:
            groups[c['ti']].append(c)
        keys = list(groups)
        rng.shuffle(keys)
        for k in keys:
            rng.shuffle(groups[k])
        picked = []
        while len(picked) < len(bydiff[d]):
            progressed = False
            for k in keys:
                if groups[k] and len(picked) < len(bydiff[d]):
                    picked.append(groups[k].pop(0))
                    progressed = True
            if not progressed:
                break
        bydiff[d] = picked

    # Il livello 1 è il più importante: chi conosce poche consonanti può
    # vedere SOLO frasi brevi. Prendiamo per prime le frasi "priority",
    # generate apposta per ogni consonante e coppia di consonanti.
    targets = {1: 720, 2: 400, 3: 150, 4: 100}
    chosen = []
    pri_by_target = defaultdict(list)
    for c in bydiff[1]:
        if c.get('pri'):
            pri_by_target[c['target']].append(c)
    d1picked = []
    seen = set()
    for target in sorted(pri_by_target):
        for c in pri_by_target[target][:6]:
            if c['t'] in seen:
                continue
            d1picked.append(c)
            seen.add(c['t'])
    for c in bydiff[1]:
        if len(d1picked) >= targets[1]:
            break
        if c['t'] in seen:
            continue
        d1picked.append(c)
        seen.add(c['t'])
    chosen.extend(d1picked)
    for d in (2, 3, 4):
        chosen.extend(bydiff[d][:targets[d]])

    # Bilancia le consonanti: ogni consonante deve comparire spesso.
    counts = Counter()
    for c in chosen:
        for ch in c['c']:
            counts[ch] += 1
    already = set(c['t'] for c in chosen)
    for ch in 'BCDFGLMNPRSTVZQ':
        if counts[ch] >= 45:
            continue
        for c in candidates:
            if ch in c['c'] and c['t'] not in already:
                chosen.append(c)
                already.add(c['t'])
                counts[ch] += 1
                if counts[ch] >= 45:
                    break

    # Ordine: difficoltà crescente, poi lunghezza, poi testo (affidabile)
    chosen.sort(key=lambda c: (c['d'], c['w'], c['c'], c['t']))
    return chosen, counts


def js_string(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def main():
    pool = load_words()
    candidates = generate(pool)
    chosen, counts = select(candidates)

    lines = [
        '/* ============================================================',
        '   IMPARO A LEGGERE — archivio frasi italiane reali',
        '   Ogni voce: t = testo, c = consonanti richieste (H muta esclusa),',
        '   d = difficoltà 1..4, w = numero di parole, e = emoji della vignetta.',
        '   Le vocali si danno per apprese: il gating riguarda solo le consonanti.',
        '   La lunghezza/difficoltà massima cresce con le consonanti attive',
        '   (IAL.Engine.sentenceCap). File generato da tools/generate_sentences.py.',
        '   ============================================================ */',
        'window.IAL = window.IAL || {};',
        '',
        'IAL.SENTENCES = ['
    ]
    for i, c in enumerate(chosen):
        comma = ',' if i < len(chosen) - 1 else ''
        lines.append('  { t: %s, c: %s, d: %d, w: %d, e: %s }%s' % (
            js_string(c['t']), js_string(c['c']), c['d'], c['w'],
            json.dumps(c['e'], ensure_ascii=False), comma))
    lines.append('];')
    lines.append('')
    open(OUT_JS, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))

    print('Parole utilizzabili:', len(pool))
    print('Candidati generati:', len(candidates))
    print('Frasi selezionate:', len(chosen))
    print('Per difficoltà:', dict(sorted(Counter(c['d'] for c in chosen).items())))
    print('Per numero di consonanti:', dict(sorted(Counter(len(c['c']) for c in chosen).items())))
    print('Per consonante:', ' '.join('%s:%d' % (ch, counts[ch]) for ch in 'BCDFGLMNPRSTVZQ'))
    letter_counts = Counter()
    pair_counts = Counter()
    for c in chosen:
        if c['d'] != 1:
            continue
        cs = tuple(sorted(c['c']))
        if len(cs) == 1:
            letter_counts[cs[0]] += 1
        elif len(cs) == 2:
            pair_counts[''.join(cs)] += 1
    all_pairs = [''.join(p) for p in itertools.combinations('BCDFGLMNPRSTVZQ', 2)]
    print('d1 per consonante singola:', ' '.join('%s:%d' % (ch, letter_counts[ch]) for ch in 'BCDFGLMNPRSTVZQ'))
    print('d1 coppie con meno di 6 frasi:', sum(1 for p in all_pairs if pair_counts[p] < 6))
    for d in (1, 2, 3, 4):
        samples = [c['t'] for c in chosen if c['d'] == d][:8]
        print('d%d: %s' % (d, ' | '.join(samples)))


if __name__ == '__main__':
    main()
