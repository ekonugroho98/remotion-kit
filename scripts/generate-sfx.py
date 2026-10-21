#!/usr/bin/env python3
"""
Generates studio-clean procedural UI sound effects and ambient background loop
into public/sfx/ using pure Python standard library (wave, math, struct, random).
"""
import json
import math
import os
import random
import struct
import wave

SAMPLE_RATE = 44100


def save_wav(filepath: str, samples: list[float]) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with wave.open(filepath, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for s in samples:
            clamped = max(-0.98, min(0.98, s))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wf.writeframes(frames)


def gen_pop() -> list[float]:
    # Warm bubble pop (pitch sweep 180Hz -> 540Hz over 85ms)
    dur = 0.085
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 160.0 + 420.0 * (t ** 1.4)
        env = math.sin(math.pi * t) * ((1.0 - t) ** 0.6)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        out.append(math.sin(phase) * env * 0.55)
    return out


def gen_switch() -> list[float]:
    # Card activation snap (dashed ghost -> solid card light-up)
    dur = 0.068
    n = int(SAMPLE_RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / n
        freq = 240.0 + 520.0 * (t ** 1.15)
        env = math.sin(math.pi * t) * ((1.0 - t) ** 0.45)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        harmonic = math.sin(phase * 1.5) * 0.25
        out.append((math.sin(phase) + harmonic) * env * 0.5)
    return out


def gen_tick() -> list[float]:
    # Crisp digital timer / counter tick (22ms)
    dur = 0.022
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 360.0)
        sig = (
            math.sin(2.0 * math.pi * 2400.0 * t) * 0.55
            + math.sin(2.0 * math.pi * 880.0 * t) * 0.35
        ) * env
        out.append(sig)
    return out


def gen_chime() -> list[float]:
    # Crisp checkmark verification ding (E6 -> B6 bell harmonic, 420ms)
    dur = 0.42
    n = int(SAMPLE_RATE * dur)
    notes = [(1318.51, 0.0, 0.48), (1975.53, 0.045, 0.62)]
    out = [0.0] * n
    for freq, start, amp in notes:
        start_idx = int(start * SAMPLE_RATE)
        for i in range(start_idx, n):
            t = (i - start_idx) / SAMPLE_RATE
            env = math.exp(-t * 9.5) * min(1.0, t / 0.004)
            sig = (
                math.sin(2.0 * math.pi * freq * t) * 0.75
                + math.sin(2.0 * math.pi * (freq * 2.0) * t) * 0.20
            )
            out[i] += sig * env * amp * 0.45
    return out


def gen_click() -> list[float]:
    # Crisp mouse click (two micro transients)
    dur = 0.045
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env1 = math.exp(-t * 280.0)
        env2 = math.exp(-max(0.0, t - 0.012) * 350.0) if t > 0.012 else 0.0
        sig = (
            math.sin(2.0 * math.pi * 1900.0 * t) * env1 * 0.6
            + math.sin(2.0 * math.pi * 1250.0 * t) * env2 * 0.35
        )
        out.append(sig)
    return out


def gen_type() -> list[float]:
    # Soft mechanical key thock
    dur = 0.032
    n = int(SAMPLE_RATE * dur)
    random.seed(42)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 240.0)
        tone = math.sin(2.0 * math.pi * 620.0 * t) * 0.45
        noise = (random.random() * 2.0 - 1.0) * 0.25 * math.exp(-t * 420.0)
        out.append((tone + noise) * env)
    return out


def gen_whoosh() -> list[float]:
    # Smooth band-swept transition whoosh (260ms)
    dur = 0.26
    n = int(SAMPLE_RATE * dur)
    random.seed(101)
    out = []
    lp1 = 0.0
    lp2 = 0.0
    phase = 0.0
    for i in range(n):
        t = i / n
        env = math.sin(math.pi * t) ** 1.6
        cutoff = 0.03 + 0.18 * math.sin(math.pi * t)
        white = random.random() * 2.0 - 1.0
        lp1 += cutoff * (white - lp1)
        lp2 += cutoff * (lp1 - lp2)
        sub_freq = 90.0 + 180.0 * math.sin(math.pi * t)
        phase += 2.0 * math.pi * sub_freq / SAMPLE_RATE
        sub = math.sin(phase) * 0.25
        out.append((lp2 * 1.4 + sub) * env * 0.5)
    return out


def gen_success() -> list[float]:
    # Pleasant 3-note warm chord chime (C5 - E5 - G5 - B5)
    dur = 0.65
    n = int(SAMPLE_RATE * dur)
    notes = [(523.25, 0.0), (659.25, 0.055), (783.99, 0.11), (987.77, 0.165)]
    out = [0.0] * n
    for freq, start in notes:
        start_idx = int(start * SAMPLE_RATE)
        for i in range(start_idx, n):
            t = (i - start_idx) / SAMPLE_RATE
            env = math.exp(-t * 6.5) * min(1.0, t / 0.008)
            val = (
                math.sin(2.0 * math.pi * freq * t) * 0.65
                + math.sin(2.0 * math.pi * (freq * 2.0) * t) * 0.18
            )
            out[i] += val * env * 0.22
    return out


def gen_music_loop() -> list[float]:
    # 16-second warm minimal ambient synth pad + soft pulse (100 BPM)
    dur = 16.0
    n = int(SAMPLE_RATE * dur)
    out = [0.0] * n
    # Warm Fmaj7 -> Em7 -> Dm7 -> Cmaj7 progression (4s each)
    chords = [
        [174.61, 220.00, 261.63, 329.63],  # Fmaj7
        [164.81, 196.00, 246.94, 293.66],  # Em7
        [146.83, 174.61, 220.00, 261.63],  # Dm7
        [130.81, 164.81, 196.00, 246.94],  # Cmaj7
    ]
    beat_dur = 0.6  # 100 BPM
    for i in range(n):
        t = i / SAMPLE_RATE
        chord_idx = min(3, int(t // 4.0))
        local_t = t % 4.0
        # Smooth crossfade envelope per chord bar
        bar_env = min(1.0, local_t / 0.35, (4.0 - local_t) / 0.35)
        pad = 0.0
        for f in chords[chord_idx]:
            pad += math.sin(2.0 * math.pi * f * t) * 0.12
            pad += math.sin(2.0 * math.pi * (f * 0.5) * t) * 0.06
        # Soft muted bass pluck on every beat
        beat_t = t % beat_dur
        pluck_env = math.exp(-beat_t * 14.0) * min(1.0, beat_t / 0.006)
        root_f = chords[chord_idx][0] * 0.5
        pluck = math.sin(2.0 * math.pi * root_f * t) * pluck_env * 0.22
        out[i] = (pad * bar_env + pluck) * 0.55
    return out


def main() -> None:
    root_dir = os.path.dirname(os.path.dirname(__file__))
    base_dir = os.path.join(root_dir, "public", "sfx")
    files = {
        "pop.wav": (gen_pop(), 0.28, "Bubble pop saat badge atau kartu muncul"),
        "switch.wav": (gen_switch(), 0.30, "Snap saat kartu dashed menyala mengikuti kata VO"),
        "tick.wav": (gen_tick(), 0.22, "Detak halus untuk timer melingkar atau counter angka"),
        "chime.wav": (gen_chime(), 0.32, "Dentingan verifikasi saat centang hijau (✓) menyala"),
        "click.wav": (gen_click(), 0.35, "Klik kursor mouse pada tombol UI"),
        "type.wav": (gen_type(), 0.20, "Ketikan tombol mekanik saat mengetik prompt"),
        "whoosh.wav": (gen_whoosh(), 0.26, "Transisi sapuan halus antar scene / bab"),
        "success.wav": (gen_success(), 0.32, "Kord berhasil di akhir pipeline atau CTA"),
        "music-loop.wav": (gen_music_loop(), 0.14, "Musik latar ambient synth 100 BPM (auto-ducking)"),
    }
    manifest = {
        "name": "Karaya × Shotcraft Audio Pack",
        "version": "2.0.0",
        "sampleRate": SAMPLE_RATE,
        "sfx": {},
    }
    for name, (samples, rec_vol, usage) in files.items():
        path = os.path.join(base_dir, name)
        save_wav(path, samples)
        dur = round(len(samples) / SAMPLE_RATE, 3)
        key = name.replace(".wav", "")
        manifest["sfx"][key] = {
            "file": f"sfx/{name}",
            "duration": dur,
            "recommendedVolume": rec_vol,
            "usage": usage,
        }
        print(f"Generated {path} ({dur:.3f}s)")

    pack_path = os.path.join(root_dir, "audio-pack.json")
    with open(pack_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Saved {pack_path}")


if __name__ == "__main__":
    main()
