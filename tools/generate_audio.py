#!/usr/bin/env python3
"""Genera gli audio delle parole con una voce neurale italiana.

Uso:
    python tools/generate_audio.py            # genera tutte le parole mancanti
    python tools/generate_audio.py --limit 8  # prova rapida su poche parole
    python tools/generate_audio.py --voice it-IT-IsabellaNeural

Richiede il pacchetto edge-tts (pip install edge-tts).
I file vengono salvati in audio/w/<parola>.mp3 e l'elenco in
js/data/audio.js, usato dall'app per pronunciare le parole senza la
sintesi vocale del dispositivo (che su iOS Ã¨ spesso scadente).
"""
import argparse
import asyncio
import re
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
WORDS_FILE = ROOT / "tools" / "audio-words.txt"
OUT_DIR = ROOT / "audio" / "w"
MANIFEST = ROOT / "js" / "data" / "audio.js"

DEFAULT_VOICE = "it-IT-ElsaNeural"
DEFAULT_RATE = "-30%"


def slug(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")


async def make_one(text: str, voice: str, rate: str, sem: asyncio.Semaphore, errors: list):
    path = OUT_DIR / (slug(text) + ".mp3")
    if path.exists() and path.stat().st_size > 2000:
        return True
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, voice, rate=rate).save(str(path))
                if path.exists() and path.stat().st_size > 2000:
                    return True
            except Exception as exc:  # rete instabile o servizio occupato
                if attempt == 2:
                    errors.append(f"{text}: {exc}")
            await asyncio.sleep(1.0 + attempt)
    return False


def write_manifest(words):
    rows = []
    for w in sorted(words):
        rows.append(f'  "{w}": "audio/w/{slug(w)}.mp3"')
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        "/* Audio preregistrato delle parole (voce neurale italiana).\n"
        " * Generato da tools/generate_audio.py: non modificare a mano. */\n"
        "window.IAL = window.IAL || {};\n"
        "IAL.AUDIO_MAP = {\n" + ",\n".join(rows) + "\n};\n",
        encoding="utf-8",
    )


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--rate", default=DEFAULT_RATE)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--concurrency", type=int, default=5)
    args = parser.parse_args()

    words = [w.strip() for w in WORDS_FILE.read_text(encoding="utf-8").splitlines() if w.strip()]
    if args.limit:
        words = words[: args.limit]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    sem = asyncio.Semaphore(max(1, args.concurrency))
    errors = []
    done = 0
    todo = len([w for w in words if not (OUT_DIR / (slug(w) + ".mp3")).exists()])
    print(f"Parole: {len(words)} Â· da generare: {todo} Â· voce: {args.voice}", flush=True)

    async def worker(w):
        nonlocal done
        ok = await make_one(w, args.voice, args.rate, sem, errors)
        if ok:
            done += 1
            if done % 25 == 0 or done == todo:
                print(f"  {done}/{todo}", flush=True)
        return ok

    results = await asyncio.gather(*(worker(w) for w in words))

    available = [w for w, ok in zip(words, results) if ok]
    write_manifest(available)
    total_bytes = sum((OUT_DIR / (slug(w) + ".mp3")).stat().st_size for w in available)
    print(f"Generate {len(available)}/{len(words)} Â· {total_bytes / 1024 / 1024:.1f} MB", flush=True)
    if errors:
        print("Errori:", file=sys.stderr)
        for e in errors[:20]:
            print("  " + e, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

