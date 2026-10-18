#!/usr/bin/env python3
"""
Generates studio-clean procedural UI sound effects and ambient background loop
into public/sfx/ using pure Python standard library (wave, math, struct, random).
"""
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
    base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "sfx")
    files = {
        "pop.wav": gen_pop(),
        "click.wav": gen_click(),
        "type.wav": gen_type(),
        "whoosh.wav": gen_whoosh(),
        "success.wav": gen_success(),
        "music-loop.wav": gen_music_loop(),
    }
    for name, samples in files.items():
        path = os.path.join(base_dir, name)
        save_wav(path, samples)
        print(f"Generated {path} ({len(samples)/SAMPLE_RATE:.2f}s)")


if __name__ == "__main__":
    main()
