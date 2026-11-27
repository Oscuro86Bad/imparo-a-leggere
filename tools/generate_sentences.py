# -*- coding: utf-8 -*-
"""Genera js/data/sentences.js con frasi italiane compiute e curate.

Ogni frase è una frase completa (soggetto + verbo, oppure una domanda
completa): niente elenchi di parole separati da virgole e niente vignette.

Campi memorizzati:

  t = testo (maiuscolo, senza accenti né apostrofi)
  c = consonanti presenti nel testo, H compresa come consonante
  d = difficoltà 1..4
  w = numero di parole

Il motore dell'app (IAL.Engine.canShowSentence) controlla TUTTE le lettere
del testo — vocali comprese — rispetto a quelle attivate nell'Area Genitori.
Una frase non compare mai se contiene una lettera non attivata.

Uso: python tools/generate_sentences.py
"""
import os
import random
import re
import sys
from collections import Counter, defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JS = os.path.join(ROOT, 'js', 'data', 'sentences.js')

CONS = set('BCDFGHLMNPQRSTVZ')       # H è una consonante, NON una vocale
VOWELS = set('AEIOU')
LETTERS = 'BCDFGHLMNPQRSTVZ'
PRIORITY = ['Q', 'H', 'F', 'V', 'Z', 'G', 'B', 'C', 'D', 'L', 'M', 'N', 'P', 'R', 'S', 'T']

# ---------------------------------------------------------------------------
# Lessico
# ---------------------------------------------------------------------------

# (parola, persona, genere). I dopci pronunci m/f servono a concordare
# aggettivi come BUONO/BUONA; il testo duplicato viene eliminato dopo.
PRONOUNS = [
    ('IO', '1s', 'm'), ('IO', '1s', 'f'),
    ('TU', '2s', 'm'), ('TU', '2s', 'f'),
    ('LUI', '3s', 'm'), ('LEI', '3s', 'f'),
    ('NOI', '1p', 'm'), ('NOI', '1p', 'f'),
    ('VOI', '2p', 'm'), ('VOI', '2p', 'f'),
    ('LORO', '3p', 'm'), ('LORO', '3p', 'f')
]
PRONOUNS_UNIQUE = [
    ('IO', '1s'), ('TU', '2s'), ('LUI', '3s'), ('LEI', '3s'),
    ('NOI', '1p'), ('VOI', '2p'), ('LORO', '3p')
]

PEOPLE = [
    ('MAMMA', 'f'), ('PAPA', 'm'), ('NONNA', 'f'), ('NONNO', 'm'),
    ('BAMBINA', 'f'), ('BAMBINO', 'm'), ('BEBE', 'm'),
    ('ZIA', 'f'), ('ZIO', 'm'), ('AMICA', 'f'), ('AMICO', 'm')
]
ANIMALS = [
    ('GATTO', 'm'), ('GATTA', 'f'), ('CANE', 'm'), ('GUFO', 'm'),
    ('ORSO', 'm'), ('LEONE', 'm'), ('TOPO', 'm'), ('UCCELLO', 'm')
]
# Le frasi con articolo non possono usare L'/GLI: escludiamo le parole
# che iniziano per vocale dai modelli con articolo esplicito.
NO_ARTICLE = {'AMICA', 'AMICO', 'ORSO', 'UCCELLO', 'UCCELLI'}

# Soggetti nominali: solo persone/animali al singolare, per evitare
# frasi del tipo «I DADI E ALTO» o «IL CIBO AMA LA MELA».
NOUN_SUBJECTS = [
    (w, '3s', g) for w, g in PEOPLE + ANIMALS if w not in NO_ARTICLE
]

# Verbi transitivi con tutte le persone.
VERBS = {
    'AMO':     {'1s': 'AMO',     '2s': 'AMI',     '3s': 'AMA',     '1p': 'AMIAMO',  '2p': 'AMATE',  '3p': 'AMANO'},
    'VEDO':    {'1s': 'VEDO',    '2s': 'VEDI',    '3s': 'VEDE',    '1p': 'VEDIAMO', '2p': 'VEDETE', '3p': 'VEDONO'},
    'GUARDO':  {'1s': 'GUARDO',  '2s': 'GUARDI',  '3s': 'GUARDA',  '1p': 'GUARDIAMO','2p': 'GUARDATE','3p': 'GUARDANO'},
    'SALUTO':  {'1s': 'SALUTO',  '2s': 'SALUTI',  '3s': 'SALUTA',  '1p': 'SALUTIAMO','2p': 'SALUTATE','3p': 'SALUTANO'},
    'ASCOLTO': {'1s': 'ASCOLTO', '2s': 'ASCOLTI', '3s': 'ASCOLTA', '1p': 'ASCOLTIAMO','2p': 'ASCOLTATE','3p': 'ASCOLTANO'},
    'PRENDO':  {'1s': 'PRENDO',  '2s': 'PRENDI',  '3s': 'PRENDE',  '1p': 'PRENDIAMO','2p': 'PRENDETE','3p': 'PRENDONO'},
    'TOCCO':   {'1s': 'TOCCO',   '2s': 'TOCCI',   '3s': 'TOCCA',   '1p': 'TOCCIAMO', '2p': 'TOCCATE', '3p': 'TOCCANO'},
}
TRANSITIVE = list(VERBS)

# Verbi intransitivi: frasi brevi e complete fin dal primo livello.
INTRANS = {
    'RIDERE':  {'1s': 'RIDO',   '2s': 'RIDI',   '3s': 'RIDE',   '1p': 'RIDIAMO',  '2p': 'RIDETE',  '3p': 'RIDONO'},
    'CORRERE': {'1s': 'CORRO',  '2s': 'CORRI',  '3s': 'CORRE',  '1p': 'CORRIAMO', '2p': 'CORRETE', '3p': 'CORRONO'},
    'GIOCARE': {'1s': 'GIOCO',  '2s': 'GIOCHI', '3s': 'GIOCA',  '1p': 'GIOCHIAMO','2p': 'GIOCATE', '3p': 'GIOCANO'},
    'ANDARE':  {'1s': 'VADO',   '2s': 'VAI',    '3s': 'VA',     '1p': 'ANDIAMO',  '2p': 'ANDATE',  '3p': 'VANNO'},
    'LEGGERE': {'1s': 'LEGGO',  '2s': 'LEGGI',  '3s': 'LEGGE',  '1p': 'LEGGIAMO', '2p': 'LEGGETE', '3p': 'LEGGONO'},
    'NUOTARE': {'1s': 'NUOTO',  '2s': 'NUOTI',  '3s': 'NUOTA',  '1p': 'NUOTIAMO', '2p': 'NUOTATE', '3p': 'NUOTANO'},
    'VIVERE':  {'1s': 'VIVO',   '2s': 'VIVI',   '3s': 'VIVE',   '1p': 'VIVIAMO',  '2p': 'VIVETE',  '3p': 'VIVONO'},
    'BALLARE': {'1s': 'BALLO',  '2s': 'BALLI',  '3s': 'BALLA',  '1p': 'BALLIAMO', '2p': 'BALLATE', '3p': 'BALLANO'},
    'SUONARE': {'1s': 'SUONO',  '2s': 'SUONI',  '3s': 'SUONA',  '1p': 'SUONIAMO', '2p': 'SUONATE', '3p': 'SUONANO'},
    'GIRARE':  {'1s': 'GIRO',   '2s': 'GIRI',   '3s': 'GIRA',   '1p': 'GIRIAMO',  '2p': 'GIRATE',  '3p': 'GIRANO'},
    'VOLARE':  {'1s': 'VOLO',   '2s': 'VOLI',   '3s': 'VOLA',   '1p': 'VOLIAMO',  '2p': 'VOLATE',  '3p': 'VOLANO'},
}

BE = {'1s': 'SONO', '2s': 'SEI', '3s': 'E', '1p': 'SIAMO', '2p': 'SIETE', '3p': 'SONO'}
HAVE = {'1s': 'HO', '2s': 'HAI', '3s': 'HA', '1p': 'ABBIAMO', '2p': 'AVETE', '3p': 'HANNO'}

# Complementi: (parola, articolo, genere). Articoli sempre pieni: nessuna
# elisione (L', GLI…) da gestire nelle frasi lette ai bambini.
OBJECTS = [
    ('MAMMA', 'LA', 'f'), ('PAPA', 'IL', 'm'), ('NONNA', 'LA', 'f'),
    ('NONNO', 'IL', 'm'), ('BAMBINA', 'LA', 'f'), ('BAMBINO', 'IL', 'm'),
    ('BEBE', 'IL', 'm'), ('ZIA', 'LA', 'f'), ('ZIO', 'LO', 'm'),
    ('AMICA', 'LA', 'f'), ('AMICO', 'IL', 'm'),
    ('GATTO', 'IL', 'm'), ('GATTA', 'LA', 'f'), ('CANE', 'IL', 'm'),
    ('GUFO', 'IL', 'm'), ('ORSO', 'IL', 'm'), ('LEONE', 'IL', 'm'),
    ('TOPO', 'IL', 'm'), ('UCCELLO', 'IL', 'm'),
    ('MELA', 'LA', 'f'), ('PERA', 'LA', 'f'), ('BANANA', 'LA', 'f'),
    ('CIBO', 'IL', 'm'), ('DADO', 'IL', 'm'), ('BICI', 'LA', 'f'),
    ('PALLONE', 'IL', 'm'), ('SOLE', 'IL', 'm'), ('LUNA', 'LA', 'f'),
    ('STELLA', 'LA', 'f'), ('MARE', 'IL', 'm'), ('FIORE', 'IL', 'm'),
    ('CASA', 'LA', 'f'), ('SCUOLA', 'LA', 'f'), ('LIBRO', 'IL', 'm'),
    ('PENNA', 'LA', 'f'), ('MATITA', 'LA', 'f'), ('ZAINO', 'LO', 'm'),
    ('TAVOLO', 'IL', 'm'), ('SEDIA', 'LA', 'f'), ('PORTA', 'LA', 'f'),
    ('STRADA', 'LA', 'f'), ('GIARDINO', 'IL', 'm'), ('NUVOLA', 'LA', 'f'),
    ('MUSICA', 'LA', 'f'), ('SUONO', 'IL', 'm'), ('QUADRO', 'IL', 'm'),
    ('MAMME', 'LE', 'f'), ('DADI', 'I', 'm'), ('GATTI', 'I', 'm'),
    ('CANI', 'I', 'm'), ('GUFI', 'I', 'm'), ('FIORI', 'I', 'm'),
    ('UCCELLI', 'I', 'm'), ('MELE', 'LE', 'f'), ('STELLE', 'LE', 'f'),
    ('CASE', 'LE', 'f'), ('SCUOLE', 'LE', 'f'), ('LIBRI', 'I', 'm'),
    ('TAVOLI', 'I', 'm'), ('BICI', 'LE', 'f'), ('ZIE', 'LE', 'f')
]

ARTICLES_OK = [(w, art, g) for w, art, g in OBJECTS if w not in NO_ARTICLE]

BARE_OBJECTS = [
    'MAMMA', 'PAPA', 'NONNA', 'NONNO', 'BEBE', 'ZIA', 'ZIO',
    'GATTO', 'GATTA', 'CANE', 'GUFO', 'MELA', 'PERA', 'CIBO',
    'DADO', 'BICI', 'SOLE', 'LUNA', 'CASA', 'MARE', 'FIORE',
    'PENNA', 'QUADRO', 'MUSICA'
]

# (maschile sing., femminile sing., maschile plur., femminile plur.)
ADJECTIVES = [
    ('BUONO', 'BUONA', 'BUONI', 'BUONE'),
    ('BELLO', 'BELLA', 'BELLI', 'BELLE'),
    ('PICCOLO', 'PICCOLA', 'PICCOLI', 'PICCOLE'),
    ('GRANDE', 'GRANDE', 'GRANDI', 'GRANDI'),
    ('NUOVO', 'NUOVA', 'NUOVI', 'NUOVE'),
    ('VECCHIO', 'VECCHIA', 'VECCHI', 'VECCHIE'),
    ('ROSSO', 'ROSSA', 'ROSSI', 'ROSSE'),
    ('CALDO', 'CALDA', 'CALDI', 'CALDE'),
    ('FREDDO', 'FREDDA', 'FREDDI', 'FREDDE'),
    ('ALTO', 'ALTA', 'ALTI', 'ALTE'),
    ('BASSO', 'BASSA', 'BASSI', 'BASSE'),
    ('LUNGO', 'LUNGA', 'LUNGHI', 'LUNGHE'),
    ('CORTO', 'CORTA', 'CORTI', 'CORTE'),
    ('FELICE', 'FELICE', 'FELICI', 'FELICI'),
    ('CONTENTO', 'CONTENTA', 'CONTENTI', 'CONTENTE')
]

PEOPLE_WORDS = set(w for w, _ in PEOPLE)
ANIMAL_WORDS = set(w for w, _ in ANIMALS)
PLURAL_LIVING = {'MAMME', 'ZIE', 'CANI', 'GATTI', 'GUFI', 'UCCELLI'}
THING_WORDS = (
    set(w for w, _, _ in OBJECTS) - PEOPLE_WORDS - ANIMAL_WORDS - PLURAL_LIVING
)
READERS = PEOPLE_WORDS - {'BEBE'}

# Frasi esplicite che riproducono il modello chiesto dall'utente.
MUST_HAVE = [
    'IO AMO MAMMA.', 'IO AMO PAPA.',
    'MAMMA AMA PAPA.', 'PAPA AMA MAMMA.',
    'IO AMO LA MAMMA.', 'IO AMO IL PAPA.',
    'IO AMO LA NONNA.', 'IO AMO IL NONNO.',
    'TU AMI LA MAMMA.', 'LUI AMA LA MAMMA.'
]

# Accoppiamenti semanticamente plausibili: evita frasi del tipo
# «IL CANE AMA LA BICI» mantenendo comunque molte combinazioni.
SALUTO_OBJ = PEOPLE_WORDS | ANIMAL_WORDS
ASCOLTO_OBJ = PEOPLE_WORDS | ANIMAL_WORDS | {'MUSICA', 'MARE', 'SUONO'}
AMO_OBJ = PEOPLE_WORDS | ANIMAL_WORDS | {
    'MELA', 'PERA', 'CIBO', 'SOLE', 'MARE', 'FIORE', 'CASA', 'SCUOLA',
    'LIBRO', 'BICI', 'PALLONE', 'LUNA', 'STELLA', 'MUSICA', 'QUADRO'
}
TAKE_OBJ = {
    'MELA', 'PERA', 'BANANA', 'CIBO', 'DADO', 'DADI', 'BICI', 'PALLONE',
    'PENNA', 'MATITA', 'ZAINO', 'QUADRO', 'LIBRO', 'LIBRI', 'FIORE', 'FIORI',
    'MELE'
}
SOUND_OBJ = {'MUSICA', 'SUONO'}
VISIBLE_OBJ = (set(w for w, _, _ in OBJECTS) | set(BARE_OBJECTS)) - SOUND_OBJ
ALLOWED_OBJ = {
    'AMO': AMO_OBJ,
    'VEDO': VISIBLE_OBJ,
    'GUARDO': VISIBLE_OBJ,
    'SALUTO': SALUTO_OBJ,
    'ASCOLTO': ASCOLTO_OBJ,
    'PRENDO': TAKE_OBJ,
    'TOCCO': TAKE_OBJ | PEOPLE_WORDS
}

# Gli animali non "amano la bici" né "prendono lo zaino": per loro
# usiamo solo complementi concreti o altri esseri viventi.
AMO_ANIMAL_OBJ = PEOPLE_WORDS | ANIMAL_WORDS | {'MELA', 'PERA', 'CIBO'}
TAKE_ANIMAL_OBJ = {'MELA', 'PERA', 'CIBO', 'DADO', 'PALLONE'}
ASCOLTO_ANIMAL_OBJ = PEOPLE_WORDS | ANIMAL_WORDS | {'MUSICA', 'SUONO'}
ANIMAL_ALLOWED_OBJ = {
    'AMO': AMO_ANIMAL_OBJ,
    'VEDO': VISIBLE_OBJ,
    'GUARDO': VISIBLE_OBJ,
    'SALUTO': SALUTO_OBJ,
    'ASCOLTO': ASCOLTO_ANIMAL_OBJ,
    'PRENDO': TAKE_ANIMAL_OBJ,
    'TOCCO': TAKE_ANIMAL_OBJ | PEOPLE_WORDS
}


def allowed_for(verb, subject):
    """Complementi ammessi per quel verbo e quel soggetto."""
    if subject in ANIMAL_WORDS:
        return ANIMAL_ALLOWED_OBJ[verb]
    return ALLOWED_OBJ[verb]


# ---------------------------------------------------------------------------
# Costruzione delle frasi
# ---------------------------------------------------------------------------

def cons(text):
    return set(ch for ch in text.upper() if ch in CONS)


def difficulty(nwords, ncons):
    # Il livello 1 include il modello "IO AMO LA MAMMA." (4 parole, 2 consonanti)
    # e frasi altrettanto brevi con al massimo 3 consonanti già studiate.
    if nwords <= 4 and ncons <= 3:
        return 1
    if nwords <= 5 and ncons <= 4:
        return 2
    if nwords <= 6 and ncons <= 6:
        return 3
    return 4


def make(text, kind):
    text = re.sub(r'\s+', ' ', text.strip())
    if ',' in text or ';' in text:
        return None
    if not re.fullmatch(r'[A-Z ?.]+', text):
        return None
    nwords = len(re.sub(r'[.?]', '', text).split())
    if nwords < 2:
        return None
    cset = cons(text)
    if not set(ch for ch in text if ch.isalpha()) <= (CONS | VOWELS):
        return None
    return {
        't': text,
        'c': ''.join(sorted(cset)),
        'd': difficulty(nwords, len(cset)),
        'w': nwords,
        'k': kind
    }


def generate():
    out = {}

    def add(text, kind):
        cand = make(text, kind)
        if cand and cand['t'] not in out:
            out[cand['t']] = cand

    subjects_all = PRONOUNS + NOUN_SUBJECTS
    have_obj = [(w, art) for w, art, _ in ARTICLES_OK if w in THING_WORDS]

    def adj_for(forms, person, gender):
        index = 2 if person in ('1p', '2p', '3p') else 0
        return forms[index + (1 if gender == 'f' else 0)]

    # 1. Soggetto + verbo transitivo + oggetto senza articolo.
    for subj, person, _ in subjects_all:
        for v in TRANSITIVE:
            form = VERBS[v][person]
            allowed = allowed_for(v, subj)
            for obj in BARE_OBJECTS:
                if obj == subj:
                    continue
                if obj in allowed:
                    add(subj + ' ' + form + ' ' + obj + '.', 'bare')

    # 2. Soggetto + verbo transitivo + articolo + oggetto.
    for subj, person, _ in subjects_all:
        for v in TRANSITIVE:
            form = VERBS[v][person]
            allowed = allowed_for(v, subj)
            for obj, art, _ in ARTICLES_OK:
                if obj == subj:
                    continue
                if obj in allowed:
                    add(subj + ' ' + form + ' ' + art + ' ' + obj + '.', 'svo')

    # 3. Articolo + nome + verbo + articolo + oggetto.
    # Solo persone/animali singolari come soggetto: niente «I CANI AMA…».
    noun_articles = {w: art for w, art, _ in ARTICLES_OK}
    for subj, _, _ in NOUN_SUBJECTS:
        art_s = noun_articles[subj]
        for v in TRANSITIVE:
            form = VERBS[v]['3s']
            allowed = allowed_for(v, subj)
            for obj, art_o, _ in ARTICLES_OK:
                if subj == obj:
                    continue
                if obj not in allowed:
                    continue
                add(art_s + ' ' + subj + ' ' + form + ' ' + art_o + ' ' + obj + '.', 'nvo')

    # 4. Verbi intransitivi: frasi complete e brevissime.
    for subj, person in PRONOUNS_UNIQUE:
        for forms in INTRANS.values():
            add(subj + ' ' + forms[person] + '.', 'intrans')
    for subj, _, _ in NOUN_SUBJECTS:
        for name, forms in INTRANS.items():
            if name == 'VOLARE' and subj != 'UCCELLO':
                continue
            if name == 'LEGGERE' and subj not in READERS:
                continue
            add(subj + ' ' + forms['3s'] + '.', 'intrans')

    # 5. Verbo essere + aggettivo concordato (singolare/plurale).
    for subj, person, gender in subjects_all:
        for forms in ADJECTIVES:
            add(subj + ' ' + BE[person] + ' ' + adj_for(forms, person, gender) + '.', 'copula')
    for noun, _, gender in NOUN_SUBJECTS:
        for forms in ADJECTIVES:
            add(noun_articles[noun] + ' ' + noun + ' E ' + forms[1 if gender == 'f' else 0] + '.', 'nounadj')

    # 6. "Qui/qua" con il verbo essere (copre Q anche nei primi livelli).
    for subj, person, _ in subjects_all:
        for place in ('QUI', 'QUA'):
            add(subj + ' ' + BE[person] + ' ' + place + '.', 'place')

    # 7. Verbo avere: copre H come consonante, non come vocale.
    # Solo oggetti concreti (niente «HO LA MAMMA» o «HA IL NONNO»).
    for subj, person in PRONOUNS_UNIQUE:
        for obj, art in have_obj:
            add(subj + ' ' + HAVE[person] + ' ' + art + ' ' + obj + '.', 'have')
        add(subj + ' ' + HAVE[person] + ' QUATTRO DADI.', 'have')
    for subj, _, _ in NOUN_SUBJECTS:
        for obj, art in have_obj:
            add(subj + ' ' + HAVE['3s'] + ' ' + art + ' ' + obj + '.', 'have')
        add(subj + ' ' + HAVE['3s'] + ' QUATTRO DADI.', 'have')

    # 8. Domande complete.
    for v in TRANSITIVE:
        add('COSA ' + VERBS[v]['2s'] + '?', 'question')
        add('COSA ' + VERBS[v]['3s'] + '?', 'question')
    for obj, art, _ in ARTICLES_OK:
        add('DOVE E ' + art + ' ' + obj + '?', 'question')
        if obj in PEOPLE_WORDS | ANIMAL_WORDS:
            add('CHI E ' + art + ' ' + obj + '?', 'question')
    for place in ('QUI', 'QUA'):
        add('CHI E ' + place + '?', 'question')
    for subj, person, gender in subjects_all:
        for forms in ADJECTIVES:
            add(subj + ' ' + BE[person] + ' ' + adj_for(forms, person, gender) + '?', 'question')
    add('CHI E?', 'question')

    return list(out.values())


# ---------------------------------------------------------------------------
# Selezione con copertura garantita di tutte le consonanti
# ---------------------------------------------------------------------------

def select(candidates):
    targets = {1: 300, 2: 500, 3: 350, 4: 250}
    rng = random.Random(20261128)
    bydiff = defaultdict(list)
    for c in candidates:
        bydiff[c['d']].append(c)
    for d in bydiff:
        rng.shuffle(bydiff[d])

    chosen_by_d = {d: [] for d in (1, 2, 3, 4)}
    seen = set()
    counts = Counter()
    min_per_letter = 60

    # Modelli esplicitamente richiesti: "IO AMO LA MAMMA." e simili.
    by_text = {c['t']: c for c in candidates}
    for text in MUST_HAVE:
        cand = by_text.get(text)
        if not cand or text in seen or len(chosen_by_d[cand['d']]) >= targets[cand['d']]:
            continue
        chosen_by_d[cand['d']].append(cand)
        seen.add(text)
        for ch in cand['c']:
            counts[ch] += 1

    # Prisma le consonanti rare: ogni lettera compare in almeno 60 frasi.
    for ch in PRIORITY:
        for d in (1, 2, 3, 4):
            for c in bydiff[d]:
                if counts[ch] >= min_per_letter:
                    break
                if c['t'] in seen or len(chosen_by_d[d]) >= targets[d]:
                    continue
                if ch not in c['c']:
                    continue
                chosen_by_d[d].append(c)
                seen.add(c['t'])
                for ch2 in c['c']:
                    counts[ch2] += 1

    # Riempie le quote rimanenti con frasi non ancora scelte.
    for d in (1, 2, 3, 4):
        for c in bydiff[d]:
            if len(chosen_by_d[d]) >= targets[d]:
                break
            if c['t'] in seen:
                continue
            chosen_by_d[d].append(c)
            seen.add(c['t'])
            for ch in c['c']:
                counts[ch] += 1

    chosen = [c for d in (1, 2, 3, 4) for c in chosen_by_d[d]]
    chosen.sort(key=lambda c: (c['d'], c['w'], c['t']))
    return chosen, counts


def js_string(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def main():
    candidates = generate()
    chosen, counts = select(candidates)

    lines = [
        '/* ============================================================',
        '   IMPARO A LEGGERE — archivio di frasi italiane compiute',
        '   Ogni voce: t = testo, c = consonanti richieste (H inclusa),',
        '   d = difficoltà 1..4, w = numero di parole.',
        '   Ogni frase ha soggetto e verbo (o è una domanda completa):',
        '   nessun elenco di parole separate da virgole e nessuna immagine.',
        '   L\'app controlla TUTTE le lettere del testo rispetto a quelle',
        '   attivate nell\'Area Genitori (vocali comprese; H è consonante).',
        '   File generato da tools/generate_sentences.py.',
        '   ============================================================ */',
        'window.IAL = window.IAL || {};',
        '',
        'IAL.SENTENCES = ['
    ]
    for i, c in enumerate(chosen):
        comma = ',' if i < len(chosen) - 1 else ''
        lines.append('  { t: %s, c: %s, d: %d, w: %d }%s' % (
            js_string(c['t']), js_string(c['c']), c['d'], c['w'], comma))
    lines.append('];')
    lines.append('')
    open(OUT_JS, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))

    print('Candidati generati:', len(candidates))
    print('Frasi selezionate:', len(chosen))
    print('Per difficoltà:', dict(sorted(Counter(c['d'] for c in chosen).items())))
    print('Per numero di parole:', dict(sorted(Counter(c['w'] for c in chosen).items())))
    print('Per consonante:', ' '.join('%s:%d' % (ch, counts[ch]) for ch in LETTERS))
    for d in (1, 2, 3, 4):
        samples = [c['t'] for c in chosen if c['d'] == d][:8]
        print('d%d: %s' % (d, ' | '.join(samples)))


if __name__ == '__main__':
    main()
