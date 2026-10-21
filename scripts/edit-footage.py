#!/usr/bin/env python3
"""
Auto-Cut Silence & Extract Word Timestamps from Raw Talking-Head Footage.
Usage:
  python3 scripts/edit-footage.py --project my-reel [--input path/to/raw.mp4] [--noise-db -32] [--min-silence 0.35]

Outputs inside public/<project>/:
  - footage-clean.mp4   (jump-cut video with dead air removed)
  - audio.wav           (extracted 44.1kHz mono audio from cleaned video)
  - cuts-report.json    (original vs cleaned duration, kept segments, removed silence count)
  - data.json           (word-level & phrase-level timestamps for Remotion KaraokeSubtitle)
"""
import argparse
import json
import os
import re
import subprocess
import tempfile


def get_duration(filepath: str) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            filepath,
        ],
        text=True,
    ).strip()
    return float(out or 0.0)


def detect_silences(filepath: str, noise_db: float = -32.0, min_silence: float = 0.35) -> list[tuple[float, float]]:
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-i",
        filepath,
        "-af",
        f"silencedetect=noise={noise_db}dB:d={min_silence}",
        "-f",
        "null",
        "-",
    ]
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    log = proc.stderr
    starts = [float(x) for x in re.findall(r"silence_start:\s*([0-9.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*([0-9.]+)", log)]
    silences: list[tuple[float, float]] = []
    for i, s in enumerate(starts):
        e = ends[i] if i < len(ends) else s + min_silence
        if e > s:
            silences.append((s, e))
    return silences


def compute_keep_segments(
    total_dur: float, silences: list[tuple[float, float]], pad: float = 0.06
) -> list[tuple[float, float]]:
    if not silences:
        return [(0.0, total_dur)]
    kept: list[tuple[float, float]] = []
    cursor = 0.0
    for s_start, s_end in silences:
        seg_end = max(cursor, s_start + pad)
        if seg_end - cursor >= 0.18:
            kept.append((round(cursor, 3), round(seg_end, 3)))
        cursor = max(cursor, s_end - pad)
    if total_dur - cursor >= 0.18:
        kept.append((round(cursor, 3), round(total_dur, 3)))
    return kept if kept else [(0.0, total_dur)]


def cut_and_concat_video(input_path: str, output_mp4: str, segments: list[tuple[float, float]]) -> None:
    if len(segments) == 1 and segments[0][0] == 0.0:
        subprocess.run(["cp", input_path, output_mp4], check=True)
        return

    with tempfile.TemporaryDirectory(prefix="footage_cut_") as tmpdir:
        list_file = os.path.join(tmpdir, "concat.txt")
        part_files: list[str] = []
        for idx, (start, end) in enumerate(segments):
            part = os.path.join(tmpdir, f"part_{idx:03d}.mp4")
            dur = max(0.1, end - start)
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-ss",
                    f"{start:.3f}",
                    "-i",
                    input_path,
                    "-t",
                    f"{dur:.3f}",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "ultrafast",
                    "-crf",
                    "20",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "192k",
                    part,
                ],
                check=True,
            )
            part_files.append(part)

        with open(list_file, "w", encoding="utf-8") as f:
            for p in part_files:
                f.write(f"file '{p}'\n")

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                list_file,
                "-c",
                "copy",
                output_mp4,
            ],
            check=True,
        )


def extract_wav(input_mp4: str, output_wav: str) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            input_mp4,
            "-vn",
            "-ac",
            "1",
            "-ar",
            "44100",
            output_wav,
        ],
        check=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, help="Project slug inside public/")
    parser.add_argument("--input", default="", help="Optional path to raw video file")
    parser.add_argument("--text", default="", help="Optional transcript text")
    parser.add_argument("--noise-db", type=float, default=-32.0)
    parser.add_argument("--min-silence", type=float, default=0.35)
    args = parser.parse_args()

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    proj_dir = os.path.join(root_dir, "public", args.project)
    os.makedirs(proj_dir, exist_ok=True)

    raw_path = args.input or os.path.join(proj_dir, "raw-footage.mp4")
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw footage not found: {raw_path}")

    orig_dur = get_duration(raw_path)
    silences = detect_silences(raw_path, noise_db=args.noise_db, min_silence=args.min_silence)
    kept = compute_keep_segments(orig_dur, silences)

    clean_mp4 = os.path.join(proj_dir, "footage-clean.mp4")
    cut_and_concat_video(raw_path, clean_mp4, kept)

    wav_path = os.path.join(proj_dir, "audio.wav")
    extract_wav(clean_mp4, wav_path)
    clean_dur = get_duration(clean_mp4)

    # Run transcribe-audio.py to generate word-level data.json + transcript.txt
    tr_cmd = ["python3", os.path.join(root_dir, "scripts", "transcribe-audio.py"), "--project", args.project]
    if args.text.strip():
        tr_cmd.extend(["--text", args.text.strip()])
    subprocess.run(tr_cmd, cwd=root_dir, check=True)

    report = {
        "project": args.project,
        "originalDuration": round(orig_dur, 2),
        "cleanedDuration": round(clean_dur, 2),
        "savedSeconds": round(max(0.0, orig_dur - clean_dur), 2),
        "silenceCount": len(silences),
        "keptSegments": [{"start": s, "end": e} for s, e in kept],
        "cleanVideoUrl": f"/public/{args.project}/footage-clean.mp4",
        "audioUrl": f"/public/{args.project}/audio.wav",
    }
    report_path = os.path.join(proj_dir, "cuts-report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(
        f"[edit-footage] Done! {orig_dur:.2f}s -> {clean_dur:.2f}s "
        f"({len(silences)} silence gaps cut, saved {report['savedSeconds']}s)"
    )


if __name__ == "__main__":
    main()
