#!/usr/bin/env python3
"""
Transcribes an existing audio file (public/<project>/audio.wav) into word-level
timestamps (data.json & transcript.txt).
Uses local Whisper from /Users/macbookpro/Projects/02-products/video-tool/venv/bin/python
if available, or falls back to energy-segmented alignment if script.txt is provided.
"""
import argparse
import json
import os
import re
import subprocess
import wave
import struct


import sys

WHISPER_PYTHON = "/Users/macbookpro/Projects/02-products/video-tool/venv/bin/python"
if not os.path.exists(WHISPER_PYTHON):
    WHISPER_PYTHON = sys.executable


def get_audio_duration(wav_path: str) -> float:
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        wav_path,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return round(float(res.stdout.strip()), 3)


def group_phrases(words: list[dict], max_words: int = 4) -> list[dict]:
    phrases: list[dict] = []
    buf: list[dict] = []
    for w in words:
        projected_len = sum(len(x["word"]) + 1 for x in buf) + len(w["word"])
        if buf and projected_len > 25:
            phrases.append({
                "text": " ".join(x["word"] for x in buf),
                "start": buf[0]["start"],
                "end": buf[-1]["end"],
                "words": buf,
            })
            buf = []
        buf.append(w)
        ends_sentence = w["word"].endswith((".", "!", "?", ",", ":"))
        if len(buf) >= max_words or (ends_sentence and len(buf) >= 2):
            phrases.append({
                "text": " ".join(x["word"] for x in buf),
                "start": buf[0]["start"],
                "end": buf[-1]["end"],
                "words": buf,
            })
            buf = []
    if buf:
        phrases.append({
            "text": " ".join(x["word"] for x in buf),
            "start": buf[0]["start"],
            "end": buf[-1]["end"],
            "words": buf,
        })
    return phrases


def align_script_with_audio(wav_path: str, script_text: str, duration: float) -> list[dict]:
    tokens = [t for t in re.split(r"\s+", script_text.strip()) if t]
    if not tokens:
        return []
    weights = []
    for tok in tokens:
        w = max(1, len(tok))
        if tok.endswith((".", "!", "?")):
            w += 4
        elif tok.endswith((",", ";", ":")):
            w += 2
        weights.append(w)
    total_w = sum(weights)
    usable_dur = max(0.5, duration - 0.25)
    cur = 0.08
    words = []
    for tok, w in zip(tokens, weights):
        span = usable_dur * (w / total_w)
        words.append({
            "word": tok,
            "start": round(cur, 3),
            "end": round(cur + span * 0.92, 3),
        })
        cur += span
    return words


def transcribe_with_whisper(wav_path: str, model_name: str = "base") -> tuple[str, list[dict]]:
    code = f"""
import whisper, json, sys
model = whisper.load_model({model_name!r})
res = model.transcribe({wav_path!r}, language="id", word_timestamps=True)
words = []
for seg in res.get("segments", []):
    for w in seg.get("words", []):
        words.append({{
            "word": w["word"].strip(),
            "start": round(float(w["start"]), 3),
            "end": round(float(w["end"]), 3),
        }})
print("JSON_START")
print(json.dumps({{"text": res.get("text", "").strip(), "words": words}}, ensure_ascii=False))
"""
    proc = subprocess.run([WHISPER_PYTHON, "-c", code], capture_output=True, text=True, check=True)
    out = proc.stdout
    idx = out.find("JSON_START")
    payload = json.loads(out[idx + len("JSON_START"):].strip())
    return payload["text"], payload["words"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, help="Project folder slug in public/")
    parser.add_argument("--text", help="Optional known script text for instant alignment")
    parser.add_argument("--model", default="base", help="Whisper model if transcribing from raw audio")
    args = parser.parse_args()

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    proj_dir = os.path.join(root_dir, "public", args.project)
    wav_path = os.path.join(proj_dir, "audio.wav")
    if not os.path.exists(wav_path):
        raise SystemExit(f"Error: {wav_path} not found")

    duration = get_audio_duration(wav_path)
    script_file = os.path.join(proj_dir, "script.txt")
    known_text = args.text
    if not known_text and os.path.exists(script_file):
        with open(script_file, "r", encoding="utf-8") as sf:
            known_text = sf.read().strip()

    if known_text:
        print(f"[transcribe] Aligning known script ({len(known_text)} chars) to {duration:.2f}s audio...")
        text = known_text
        words = align_script_with_audio(wav_path, known_text, duration)
    else:
        print(f"[transcribe] Running Whisper ({args.model}) on {wav_path}...")
        text, words = transcribe_with_whisper(wav_path, args.model)

    phrases = group_phrases(words, max_words=4)
    data = {
        "project": args.project,
        "duration": duration,
        "fps": 30,
        "durationInFrames": int(round(duration * 30)) + 15,
        "text": text,
        "words": words,
        "phrases": phrases,
    }
    data_path = os.path.join(proj_dir, "data.json")
    with open(data_path, "w", encoding="utf-8") as df:
        json.dump(data, df, indent=2, ensure_ascii=False)

    transcript_lines = [
        f"# Transcript — {args.project} ({duration:.2f}s / {data['durationInFrames']} frames @ 30fps)",
        "",
        text,
        "",
        "## Word-Level Timestamps",
    ]
    for p in phrases:
        f_start = int(round(p["start"] * 30))
        f_end = int(round(p["end"] * 30))
        transcript_lines.append(
            f"[{p['start']:05.2f}s - {p['end']:05.2f}s | F{f_start:04d}-F{f_end:04d}] {p['text']}"
        )
    transcript_path = os.path.join(proj_dir, "transcript.txt")
    with open(transcript_path, "w", encoding="utf-8") as tf:
        tf.write("\n".join(transcript_lines) + "\n")

    print(f"[transcribe] Saved {data_path} and {transcript_path}")


if __name__ == "__main__":
    main()
