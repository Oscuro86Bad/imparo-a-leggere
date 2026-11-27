#!/usr/bin/env python3
"""Genera gli audio delle parole con una voce neurale italiana.

Uso:
    python tools/generate_audio.py            # genera tutte le parole mancanti
    python tools/generate_audio.py --limit 8  # prova rapida su poche parole
    python tools/generate_audio.py --voice it-IT-IsabellaNeural
    python tools/generate_audio.py --redo PAPA,META

Richiede il pacchetto edge-tts (pip install edge-tts).
I file vengono salvati in audio/w/<parola>.mp3 e l'elenco in
js/data/audio.js, usato dall'app per pronunciare le parole senza la
sintesi vocale del dispositivo (che su iOS è spesso scadente).

Alcune parole vanno lette con l'accento anche se nell'app sono scritte
tutte maiuscole: la tabella SPOKEN sotto tiene la forma corretta.  I file
rigenerati ricevono un ?v=<hash> nel manifesto, così il browser scarica
la nuova versione senza invalidare tutta la cache audio.
"""
import argparse
import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
WORDS_FILE = ROOT / "tools" / "audio-words.txt"
OUT_DIR = ROOT / "audio" / "w"
MANIFEST = ROOT / "js" / "data" / "audio.js"
VERSIONS = ROOT / "audio" / "versions.json"

DEFAULT_VOICE = "it-IT-ElsaNeural"
DEFAULT_RATE = "-30%"

# Parole che edge-tts pronuncia male se scritte senza accento.
# La chiave resta la parola mostrata nell'app (tutta maiuscola); il valore
# è il testo che viene realmente sintetizzato.
SPOKEN = {
    "BAMBU": "bambù",
    "BEBE": "bebè",
    "CAFFE": "caffè",
    "COMPITI": "cómpiti",
    "CONTABILITA": "contabilità",
    "DODICI": "dódici",
    "FELICITA": "felicità",
    "FESTIVAL": "festivàl",
    "GRAVITA": "gravità",
    "LOCALITA": "località",
    "MAMMUT": "màmmut",
    "META": "metà",
    "NIPOTI": "nipóti",
    "PRINCIPI": "prìncipi",
    "SERENITA": "serenità",
    "TUTU": "tutù",
    "ZOCCOLO": "zòccolo",
}

# Parole che compaiono solo nelle frasi: la sintesi del dispositivo le
# legge con l'accento sbagliato (PAPA -> "pàpa", E -> "e" invece di "è").
SENTENCE_SPOKEN = {
    "PAPA": "papà",
    "E": "è",
}


def slug(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


def audio_path(word: str) -> Path:
    return OUT_DIR / (slug(word) + ".mp3")


def is_ready(word: str) -> bool:
    path = audio_path(word)
    return path.exists() and path.stat().st_size > 2000


def load_versions() -> dict:
    try:
        data = json.loads(VERSIONS.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def remember_version(word: str) -> None:
    """Segna la versione del file appena rigenerato (per il cache busting)."""
    path = audio_path(word)
    digest = hashlib.sha1(path.read_bytes()).hexdigest()[:10]
    data = load_versions()
    data[word] = digest
    VERSIONS.parent.mkdir(parents=True, exist_ok=True)
    VERSIONS.write_text(
        json.dumps(data, indent=1, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


async def make_one(word: str, voice: str, rate: str, sem: asyncio.Semaphore, errors: list,
                   force: bool = False):
    if not force and is_ready(word):
        return True
    path = audio_path(word)
    existed = is_ready(word)
    text = SPOKEN.get(word, word)
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, voice, rate=rate).save(str(path))
                if is_ready(word):
                    if existed:
                        remember_version(word)
                    return True
            except Exception as exc:  # rete instabile o servizio occupato
                if attempt == 2:
                    errors.append(f"{word}: {exc}")
            await asyncio.sleep(1.0 + attempt)
    return False


def write_manifest():
    """Elenca tutte le parole che hanno un audio valido.

    Non dipende da --limit: una prova su poche parole non deve mai
    rimpicciolire il manifesto usato dall'app.
    """
    words = [w.strip() for w in WORDS_FILE.read_text(encoding="utf-8").splitlines() if w.strip()]
    available = [w for w in words if is_ready(w)]
    versions = load_versions()
    rows = []
    for w in sorted(available):
        url = f"audio/w/{slug(w)}.mp3"
        version = versions.get(w)
        if version:
            url += f"?v={version}"
        rows.append(f'  "{w}": "{url}"')

    spoken = dict(SPOKEN)
    spoken.update(SENTENCE_SPOKEN)
    pron = [f'  "{w}": "{spoken[w]}"' for w in sorted(spoken)]

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        "/* Audio preregistrato delle parole (voce neurale italiana).\n"
        " * Generato da tools/generate_audio.py: non modificare a mano. */\n"
        "window.IAL = window.IAL || {};\n"
        "IAL.AUDIO_MAP = {\n" + ",\n".join(rows) + "\n};\n"
        "\n"
        "/* Come pronunciare le parole che hanno bisogno dell'accento.\n"
        " * Usata dalla sintesi vocale per le frasi e per le parole senza audio. */\n"
        "IAL.PRONOUNCE_MAP = {\n" + ",\n".join(pron) + "\n};\n",
        encoding="utf-8",
    )
    return available


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--rate", default=DEFAULT_RATE)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--concurrency", type=int, default=5)
    parser.add_argument("--redo", default="",
                        help="parole da rigenerare, separate da virgola (es. META,CAFFE)")
    args = parser.parse_args()

    words = [w.strip() for w in WORDS_FILE.read_text(encoding="utf-8").splitlines() if w.strip()]
    redo = [w.strip().upper() for w in args.redo.split(",") if w.strip()]
    if redo:
        unknown = [w for w in redo if w not in words]
        if unknown:
            print("Parole sconosciute: " + ", ".join(unknown), file=sys.stderr)
            return 2
        words = redo
    elif args.limit:
        words = words[: args.limit]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    sem = asyncio.Semaphore(max(1, args.concurrency))
    errors = []
    done = 0
    todo = len(words) if redo else len([w for w in words if not is_ready(w)])
    print(f"Parole: {len(words)} · da generare: {todo} · voce: {args.voice}", flush=True)

    async def worker(w):
        nonlocal done
        ok = await make_one(w, args.voice, args.rate, sem, errors, force=bool(redo))
        if ok:
            done += 1
            if done % 25 == 0 or done == todo:
                print(f"  {done}/{todo}", flush=True)
        return ok

    await asyncio.gather(*(worker(w) for w in words))

    available = write_manifest()
    total_bytes = sum(audio_path(w).stat().st_size for w in available)
    print(
        f"Manifesto: {len(available)} parole · {total_bytes / 1024 / 1024:.1f} MB",
        flush=True,
    )
    if errors:
        print("Errori:", file=sys.stderr)
        for e in errors[:20]:
            print("  " + e, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
