#!/usr/bin/env python3
"""
Generates natural Indonesian Voice-Over (audio.wav) + exact word-level timestamps
(data.json and transcript.txt) inside public/<project>/.

Automatically applies Indonesian phonetic pronunciation for English tech terms
during TTS synthesis (e.g. Remotion -> rimousyen, AI -> ey-ay, Claude -> klod,
React -> riek, subtitle -> sabtaytel) while keeping clean English spelling in
data.json and transcript.txt for on-screen Karaoke Subtitles!
"""
import argparse
import json
import os
import re
import subprocess
import tempfile

# Spoken phonetic map (clean word -> how Indonesian TTS should pronounce it)
TTS_PHONETIC_MAP = {
    "remotion": "rimousyen",
    "antigravity": "anti-greviti",
    "claude": "klod",
    "ai": "e-ai",
    "graphic": "grafik",
    "graphics": "grafiks",
    "react": "riek",
    "subtitle": "sab-taitel",
    "reels": "rils",
    "shorts": "syorts",
    "submit": "sabmit",
    "preview": "privyu",
    "after": "after",
    "effects": "efeks",
    "style": "stail",
    "voice": "vois",
    "over": "over",
    "spring": "spring",
    "template": "templeit",
    "code": "kod",
    "typescript": "taipskrip",
    "nodejs": "nod-je-es",
    "node.js": "nod-je-es",
    "localhost": "lokalhos",
    "clipper": "kliper",
    "dashboard": "desbord",
    "remotionnya": "rimousyennya",
    "remotion-nya": "rimousyennya",
    "linknya": "lingnya",
    "link-nya": "lingnya",
    "link": "ling",
    "comment": "komen",
    "dm": "di-em",
}

# Reverse map so any phonetic token in VTT is restored to clean display word
PHONETIC_TO_DISPLAY = {
    "rimousyen": "Remotion",
    "remotion": "Remotion",
    "rimousyennya": "Remotion-nya",
    "remotionnya": "Remotion-nya",
    "anti-greviti": "Antigravity",
    "antigravity": "Antigravity",
    "klod": "Claude",
    "claude": "Claude",
    "e-ai": "AI",
    "ey-ay": "AI",
    "eyay": "AI",
    "ai": "AI",
    "riek": "React",
    "react": "React",
    "sabtaytel": "subtitle",
    "rils": "Reels",
    "syorts": "Shorts",
    "sabmit": "Submit",
    "privyu": "preview",
    "efeks": "Effects",
    "stail": "style",
    "vois": "voice",
    "templeit": "template",
    "kod": "Code",
    "taipskrip": "TypeScript",
    "nod-je-es": "Node.js",
    "lokalhos": "localhost",
    "kliper": "clipper",
    "desbord": "dashboard",
    "lingnya": "link-nya",
    "ling": "link",
    "komen": "comment",
    "di-em": "DM",
    "dm": "DM",
    "mp4": "MP4",
    "tiktok": "TikTok",
    "youtube": "YouTube",
    "instagram": "Instagram",
    "karaya": "Karaya",
}


def to_phonetic_script(text: str) -> str:
    def repl(match: re.Match) -> str:
        word = match.group(0)
        low = word.lower()
        return TTS_PHONETIC_MAP.get(low, word)

    return re.sub(r"[A-Za-z0-9.-]+", repl, text)


def parse_vtt_time(ts: str) -> float:
    ts = ts.strip().replace(",", ".")
    parts = ts.split(":")
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    return float(parts[0])


def parse_vtt_to_words(vtt_text: str, original_tokens: list[str]) -> list[dict]:
    blocks = re.split(r"\n\s*\n", vtt_text.strip())
    words_out: list[dict] = []
    for block in blocks:
        lines = [ln.strip() for ln in block.strip().splitlines() if ln.strip()]
        if not lines or lines[0].startswith("WEBVTT"):
            continue
        time_line = None
        text_lines = []
        for ln in lines:
            if "-->" in ln:
                time_line = ln
            elif time_line is not None:
                text_lines.append(ln)
        if not time_line or not text_lines:
            continue
        m = re.match(r"([0-9:.,]+)\s*-->\s*([0-9:.,]+)", time_line)
        if not m:
            continue
        start_s = parse_vtt_time(m.group(1))
        end_s = parse_vtt_time(m.group(2))
        cue_text = " ".join(text_lines).strip()
        tokens = [t for t in re.split(r"\s+", cue_text) if t]
        if not tokens:
            continue
        total_chars = sum(max(1, len(t)) for t in tokens)
        cur = start_s
        span = max(0.05, end_s - start_s)
        for idx, tok in enumerate(tokens):
            w_dur = span * (max(1, len(tok)) / total_chars)
            w_end = end_s if idx == len(tokens) - 1 else round(cur + w_dur, 3)
            clean_key = re.sub(r"[^a-zA-Z0-9-]", "", tok).lower()
            if clean_key in PHONETIC_TO_DISPLAY:
                suffix = re.sub(r"^[a-zA-Z0-9.-]+", "", tok)
                tok = PHONETIC_TO_DISPLAY[clean_key] + suffix
            words_out.append({
                "word": tok,
                "start": round(cur, 3),
                "end": round(w_end, 3),
            })
            cur = w_end

    # If token count matches original script tokens, restore exact original casing/punctuation
    if len(words_out) == len(original_tokens):
        for w_obj, orig_tok in zip(words_out, original_tokens):
            w_obj["word"] = orig_tok

    return words_out


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


import shutil
import sys


def resolve_edge_tts_cmd() -> list[str]:
    edge_bin = shutil.which("edge-tts")
    if edge_bin:
        return [edge_bin]
    for candidate in ["/usr/local/bin/edge-tts", "/usr/bin/edge-tts", os.path.expanduser("~/.local/bin/edge-tts")]:
        if os.path.exists(candidate):
            return [candidate]
    try:
        import edge_tts  # noqa: F401
        return [sys.executable, "-m", "edge_tts"]
    except ImportError:
        pass
    uvx_bin = shutil.which("uvx") or "/Users/macbookpro/.local/bin/uvx"
    return [uvx_bin, "edge-tts"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, help="Project folder slug in public/")
    parser.add_argument("--text", help="Script text to synthesize")
    parser.add_argument("--script-file", help="Path to text file containing script")
    parser.add_argument("--voice", default="id-ID-ArdiNeural", help="Edge-TTS voice ID")
    parser.add_argument("--rate", default="+8%", help="Speech rate adjustment (e.g. +8%)")
    parser.add_argument("--pitch", default="-2Hz", help="Voice pitch adjustment")
    args = parser.parse_args()

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    proj_dir = os.path.join(root_dir, "public", args.project)
    os.makedirs(proj_dir, exist_ok=True)
    os.makedirs(os.path.join(proj_dir, "assets"), exist_ok=True)

    text = args.text
    if not text and args.script_file:
        with open(args.script_file, "r", encoding="utf-8") as f:
            text = f.read().strip()
    if not text:
        default_script = os.path.join(proj_dir, "script.txt")
        if os.path.exists(default_script):
            with open(default_script, "r", encoding="utf-8") as f:
                text = f.read().strip()
    if not text:
        raise SystemExit("Error: Provide --text or --script-file or public/<project>/script.txt")

    spoken_text = to_phonetic_script(text)
    original_tokens = [t for t in re.split(r"\s+", text.strip()) if t]

    base_tts_cmd = resolve_edge_tts_cmd()

    with tempfile.TemporaryDirectory() as tmpdir:
        mp3_path = os.path.join(tmpdir, "tts.mp3")
        vtt_path = os.path.join(tmpdir, "tts.vtt")
        cmd = base_tts_cmd + [
            "--voice", args.voice,
            f"--rate={args.rate}",
            f"--pitch={args.pitch}",
            "--text", spoken_text,
            "--write-media", mp3_path,
            "--write-subtitles", vtt_path,
        ]
        print(f"[generate-vo] Synthesizing VO with phonetic mapping ({args.voice}) via {base_tts_cmd}...")
        subprocess.run(cmd, check=True)

        wav_path = os.path.join(proj_dir, "audio.wav")
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_path, "-ar", "44100", "-ac", "1", wav_path],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        with open(vtt_path, "r", encoding="utf-8") as vf:
            vtt_content = vf.read()

    words = parse_vtt_to_words(vtt_content, original_tokens)
    phrases = group_phrases(words, max_words=4)
    duration = get_audio_duration(wav_path)

    data = {
        "project": args.project,
        "voice": args.voice,
        "duration": duration,
        "fps": 30,
        "durationInFrames": int(round(duration * 30)) + 15,
        "text": text,
        "spokenText": spoken_text,
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

    print(f"[generate-vo] Saved {wav_path} ({duration:.2f}s)")
    print(f"[generate-vo] Saved {data_path} ({len(words)} words, {len(phrases)} phrases)")


if __name__ == "__main__":
    main()
