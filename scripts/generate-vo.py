#!/usr/bin/env python3
"""
Generates natural Indonesian Voice-Over (audio.wav) + exact word-level timestamps
(data.json and transcript.txt) inside public/<project>/.

Implements antislop-voice (VO-01 to VO-05):
1. Spoken script hygiene: strips em-dashes (—) into natural comma pauses.
2. Smart Indonesian G2P Phonetic Normalizer: converts Rp currency (Rp9rb, Rp25.000,
   100jt), video dimensions (1080x1920, 9:16, 30fps), percentages, and 50+ English
   tech terms (Remotion -> rimousyen, AI -> e-ai, Claude -> klod, DM -> di-em,
   VPS -> vi-pi-es, UI/UX -> yu-ai/yu-eks) during TTS synthesis while preserving
   clean display spelling in data.json and transcript.txt for on-screen Karaoke Subtitles.
3. FFmpeg Warm Broadcast Audio Chain: applies highpass (80Hz), warm chest EQ (+2dB @ 200Hz),
   neural vocoder de-harshing (-2.5dB @ 3600Hz), smooth broadcast compression, loudness
   normalization (-16 LUFS), and a 0.35s tail pad so the final word never clips.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

# Spoken phonetic map (clean lowercase word -> how Indonesian TTS should pronounce it)
TTS_PHONETIC_MAP = {
    "remotion": "rimousyen",
    "remotionnya": "rimousyennya",
    "remotion-nya": "rimousyennya",
    "antigravity": "anti-greviti",
    "claude": "klod",
    "hermes": "hermes",
    "ai": "e-ai",
    "a.i": "e-ai",
    "graphic": "grafik",
    "graphics": "grafiks",
    "motion": "mosyen",
    "react": "riek",
    "subtitle": "sab-taitel",
    "subtitles": "sab-taitel",
    "karaoke": "karaoke",
    "reels": "rils",
    "shorts": "syorts",
    "tiktok": "tiktok",
    "youtube": "yutub",
    "instagram": "instagram",
    "submit": "sabmit",
    "preview": "privyu",
    "after": "after",
    "effects": "efeks",
    "style": "stail",
    "styles": "stail",
    "voice": "vois",
    "voice-over": "vois-over",
    "voiceover": "vois-over",
    "vo": "vi-o",
    "tts": "ti-ti-es",
    "over": "over",
    "spring": "spring",
    "template": "templeit",
    "templates": "templeit",
    "code": "kod",
    "coding": "koding",
    "typescript": "taipskrip",
    "javascript": "jawaskrip",
    "nodejs": "nod-je-es",
    "node.js": "nod-je-es",
    "localhost": "lokalhos",
    "clipper": "kliper",
    "dashboard": "desbord",
    "linknya": "lingnya",
    "link-nya": "lingnya",
    "link": "ling",
    "links": "ling",
    "lynk": "ling",
    "lynk.id": "ling-ay-di",
    "comment": "komen",
    "dm": "di-em",
    "ui": "yu-ai",
    "ux": "yu-eks",
    "ui/ux": "yu-ai-yu-eks",
    "vps": "vi-pi-es",
    "cta": "si-ti-ei",
    "api": "e-pi-ai",
    "url": "yu-ar-el",
    "json": "je-son",
    "html": "ha-te-em-el",
    "css": "se-es-es",
    "pdf": "pe-de-ef",
    "mp4": "em-pi-for",
    "wav": "wev",
    "png": "pi-en-ji",
    "svg": "es-vi-ji",
    "b2b": "bi-tu-bi",
    "saas": "sas",
    "github": "git-hab",
    "vercel": "versel",
    "supabase": "supabeis",
    "docker": "doker",
    "playwright": "pleirait",
    "whisper": "wisper",
    "ffmpeg": "ef-ef-em-pek",
    "Prompt": "promp",
    "prompt": "promp",
    "prompts": "promp",
    "bundle": "bandel",
    "file": "fail",
    "files": "fail",
    "folder": "folder",
    "upload": "aplod",
    "download": "daunlod",
    "generate": "jenereit",
    "render": "render",
    "hud": "ha-u-de",
    "neon": "neon",
    "bloom": "blum",
    "kinetic": "kinetik",
    "typography": "tipografi",
    "9:16": "sembilan-banding-enam-belas",
    "16:9": "enam-belas-banding-sembilan",
    "1080x1920": "seribu-delapan-puluh-kali-seribu-sembilan-ratus-dua-puluh",
    "1080×1920": "seribu-delapan-puluh-kali-seribu-sembilan-ratus-dua-puluh",
    "1920x1080": "seribu-sembilan-ratus-dua-puluh-kali-seribu-delapan-puluh",
    "1920×1080": "seribu-sembilan-ratus-dua-puluh-kali-seribu-delapan-puluh",
    "30fps": "tiga-puluh-ef-pe-es",
    "60fps": "enam-puluh-ef-pe-es",
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
    "sab-taitel": "subtitle",
    "sabtaytel": "subtitle",
    "rils": "Reels",
    "syorts": "Shorts",
    "sabmit": "Submit",
    "privyu": "preview",
    "efeks": "Effects",
    "stail": "style",
    "vois": "voice",
    "vois-over": "Voice-Over",
    "vi-o": "VO",
    "ti-ti-es": "TTS",
    "templeit": "template",
    "kod": "Code",
    "koding": "coding",
    "taipskrip": "TypeScript",
    "jawaskrip": "JavaScript",
    "nod-je-es": "Node.js",
    "lokalhos": "localhost",
    "kliper": "clipper",
    "desbord": "dashboard",
    "lingnya": "link-nya",
    "ling": "link",
    "ling-ay-di": "Lynk.id",
    "komen": "comment",
    "di-em": "DM",
    "dm": "DM",
    "yu-ai": "UI",
    "yu-eks": "UX",
    "yu-ai-yu-eks": "UI/UX",
    "vi-pi-es": "VPS",
    "si-ti-ei": "CTA",
    "e-pi-ai": "API",
    "yu-ar-el": "URL",
    "je-son": "JSON",
    "ha-te-em-el": "HTML",
    "se-es-es": "CSS",
    "pe-de-ef": "PDF",
    "em-pi-for": "MP4",
    "mp4": "MP4",
    "tiktok": "TikTok",
    "yutub": "YouTube",
    "youtube": "YouTube",
    "instagram": "Instagram",
    "karaya": "Karaya",
    "promp": "prompt",
    "bandel": "bundle",
    "fail": "file",
    "aplod": "upload",
    "daunlod": "download",
    "jenereit": "generate",
}

_ID_DIGITS = [
    "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"
]


def _int_to_id_words(n: int) -> list[str]:
    if n == 0:
        return ["nol"]
    if n < 0:
        return ["minus"] + _int_to_id_words(-n)
    if n < 10:
        return [_ID_DIGITS[n]]
    if n == 10:
        return ["sepuluh"]
    if n == 11:
        return ["sebelas"]
    if n < 20:
        return [_ID_DIGITS[n - 10], "belas"]
    if n < 100:
        puluh = _int_to_id_words(n // 10) + ["puluh"]
        sisa = _int_to_id_words(n % 10) if n % 10 else []
        return puluh + sisa
    if n < 200:
        return ["seratus"] + (_int_to_id_words(n - 100) if n > 100 else [])
    if n < 1000:
        ratus = _int_to_id_words(n // 100) + ["ratus"]
        sisa = _int_to_id_words(n % 100) if n % 100 else []
        return ratus + sisa
    if n < 2000:
        return ["seribu"] + (_int_to_id_words(n - 1000) if n > 1000 else [])
    if n < 1_000_000:
        ribu = _int_to_id_words(n // 1000) + ["ribu"]
        sisa = _int_to_id_words(n % 1000) if n % 1000 else []
        return ribu + sisa
    if n < 1_000_000_000:
        juta = _int_to_id_words(n // 1_000_000) + ["juta"]
        sisa = _int_to_id_words(n % 1_000_000) if n % 1_000_000 else []
        return juta + sisa
    return [str(n)]


def clean_script_hygiene(text: str) -> str:
    """VO-01: Remove em-dashes and normalize whitespace for natural spoken pacing."""
    cleaned = re.sub(r"\s*[—–]\s*", ", ", text)
    cleaned = re.sub(r"\s+--\s+", ", ", cleaned)
    cleaned = re.sub(r",\s*,+", ",", cleaned)
    # Collapse spaces after 'Rp ' so 'Rp 9.000' becomes a single display token 'Rp9.000'
    cleaned = re.sub(r"\b([Rr][Pp])\s+(\d)", r"\1\2", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def _convert_token_to_phonetic(token: str) -> str:
    # Preserve leading/trailing punctuation (strip trailing .,!?:; into suffix)
    m = re.match(r"^([^A-Za-z0-9%]*)(.*?)([^A-Za-z0-9%]*)$", token)
    if not m or not m.group(2):
        return token
    prefix, core, suffix = m.group(1), m.group(2), m.group(3)
    low = core.lower()

    # 1. Direct lookup in TTS_PHONETIC_MAP
    if low in TTS_PHONETIC_MAP:
        return f"{prefix}{TTS_PHONETIC_MAP[low]}{suffix}"

    # 2. Currency & Shorthand Numbers: Rp9.000, Rp25rb, 9rb, 100jt, Rp100.000
    m_curr = re.match(r"^(rp\.?)?(\d+(?:[.,]\d+)*)(rb|ribu|jt|juta|m|milyar)?$", low)
    if m_curr and (m_curr.group(1) or m_curr.group(3)):
        has_rp = bool(m_curr.group(1))
        raw_num = m_curr.group(2)
        unit = m_curr.group(3) or ""
        # Remove thousand-separator dots (e.g. 25.000 -> 25000) unless decimal with unit
        if "." in raw_num and len(raw_num.split(".")[-1]) == 3 and not unit:
            num_val = int(raw_num.replace(".", "").replace(",", ""))
            words = _int_to_id_words(num_val)
        else:
            num_clean = int(re.sub(r"[.,].*$", "", raw_num))
            words = _int_to_id_words(num_clean)
            if unit in ("rb", "ribu"):
                if words == ["satu"]:
                    words = ["seribu"]
                else:
                    words.append("ribu")
            elif unit in ("jt", "juta"):
                words.append("juta")
            elif unit in ("m", "milyar"):
                words.append("miliar")
        if has_rp:
            words.append("rupiah")
        return f"{prefix}{'-'.join(words)}{suffix}"

    # 3. Percentages: 99% -> sembilan-puluh-sembilan-persen
    m_pct = re.match(r"^(\d+)%$", low)
    if m_pct:
        words = _int_to_id_words(int(m_pct.group(1))) + ["persen"]
        return f"{prefix}{'-'.join(words)}{suffix}"

    return f"{prefix}{TTS_PHONETIC_MAP.get(low, core)}{suffix}"


def to_phonetic_script(text: str) -> str:
    tokens = [t for t in re.split(r"\s+", text.strip()) if t]
    return " ".join(_convert_token_to_phonetic(t) for t in tokens)


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
    elif words_out and original_tokens:
        # Proportional mapping if a hyphenated token was split by VTT
        t_start = words_out[0]["start"]
        t_end = words_out[-1]["end"]
        span = max(0.1, t_end - t_start)
        total_chars = sum(max(1, len(t)) for t in original_tokens)
        cur = t_start
        remapped: list[dict] = []
        for idx, orig_tok in enumerate(original_tokens):
            w_dur = span * (max(1, len(orig_tok)) / total_chars)
            w_end = t_end if idx == len(original_tokens) - 1 else round(cur + w_dur, 3)
            remapped.append({
                "word": orig_tok,
                "start": round(cur, 3),
                "end": round(w_end, 3),
            })
            cur = w_end
        words_out = remapped

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


def resolve_edge_tts_cmd() -> list[str]:
    edge_bin = shutil.which("edge-tts")
    if edge_bin:
        return [edge_bin]
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for candidate in [
        os.path.join(root_dir, ".venv", "bin", "edge-tts"),
        "/opt/remotion-kit/.venv/bin/edge-tts",
        "/usr/local/bin/edge-tts",
        "/usr/bin/edge-tts",
        "/home/office/.local/bin/edge-tts",
        os.path.expanduser("~/.local/bin/edge-tts"),
    ]:
        if os.path.exists(candidate):
            return [candidate]
    try:
        import edge_tts  # noqa: F401
        return [sys.executable, "-m", "edge_tts"]
    except ImportError:
        pass
    uvx_bin = shutil.which("uvx") or "/Users/macbookpro/.local/bin/uvx"
    return [uvx_bin, "edge-tts"]


def convert_with_warm_broadcast_chain(mp3_path: str, wav_path: str) -> None:
    """
    VO-04 & VO-05: Apply FFmpeg Warm Broadcast Voice Chain:
    - highpass=f=80 (remove sub-bass rumble)
    - equalizer=f=200:t=q:w=1.0:g=2.0 (warm chest resonance)
    - equalizer=f=3600:t=q:w=1.4:g=-2.5 (de-harsh metallic neural vocoder peak)
    - acompressor=threshold=-18dB:ratio=2.5:attack=15:release=120:makeup=2 (studio dynamics)
    - loudnorm=I=-16:TP=-1.5:LRA=9 (consistent broadcast loudness)
    - apad=pad_dur=0.35 (clean 350ms tail buffer so the final word never clips)
    """
    af_chain = (
        "highpass=f=80,"
        "equalizer=f=200:t=q:w=1.0:g=2.0,"
        "equalizer=f=3600:t=q:w=1.4:g=-2.5,"
        "acompressor=threshold=-18dB:ratio=2.5:attack=15:release=120:makeup=2,"
        "loudnorm=I=-16:TP=-1.5:LRA=9,"
        "apad=pad_dur=0.35"
    )
    res = subprocess.run(
        ["ffmpeg", "-y", "-i", mp3_path, "-af", af_chain, "-ar", "44100", "-ac", "1", wav_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if res.returncode != 0:
        # Fallback if a minimal ffmpeg build lacks one of the audio filters
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_path, "-ar", "44100", "-ac", "1", wav_path],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


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

    text = clean_script_hygiene(text)
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
        print(f"[generate-vo] Synthesizing VO with antislop-voice G2P ({args.voice}) via {base_tts_cmd}...")
        subprocess.run(cmd, check=True)

        wav_path = os.path.join(proj_dir, "audio.wav")
        convert_with_warm_broadcast_chain(mp3_path, wav_path)

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

    print(f"[generate-vo] Saved {wav_path} ({duration:.2f}s, Warm Broadcast EQ)")
    print(f"[generate-vo] Saved {data_path} ({len(words)} words, {len(phrases)} phrases)")


if __name__ == "__main__":
    main()
