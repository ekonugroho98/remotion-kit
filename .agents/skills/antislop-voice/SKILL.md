---
name: antislop-voice
description: "Voice AI, TTS, and spoken audio skill for antislop. Use when writing Voice-Over scripts, synthesizing TTS audio (Edge-TTS, Gemini TTS, ElevenLabs), normalizing Indonesian/English phonetics, or post-processing voice audio with FFmpeg. Load with the core."
allowed-tools: Read Write Edit Glob Grep Bash
---
# antislop-voice

> Anti Slop: Rules for AI Coding Agents. Voice-Over Script, TTS Prosody & Broadcast Audio skill

> Part of the antislop system. Read together with `antislop` (the core) and `antislop-copywriting`. This skill stops AI agents from producing robotic, unnatural "AI voice slop" across three layers: **Spoken Script Copywriting**, **Indonesian/English Smart Phonetic Normalization (G2P)**, and **FFmpeg Warm Broadcast Post-Processing**.

---

## How to Use This Skill

- Load whenever generating or editing a Voice-Over script (`script.txt`), running TTS synthesis (`generate-vo.py`), aligning word timestamps (`data.json`), or mixing voice + background music/SFX.
- Remember: **A great video with robotic AI voice slop still feels cheap.** Spoken copy follows different physics than written copy.

---

## Part 1: AI Voice Slop Patterns (Tells & Fixes)

### VO-01 — Written Book Prose Read Aloud (Script Slop)

- **The pattern:** Writing Voice-Over scripts like formal essays or AI blog posts: *"Di era digital saat ini, mengelola keuangan keluarga merupakan hal yang sangat krusial — bukan hanya untuk menabung, tetapi juga masa depan."*
- **Why it sounds like AI:** Real Indonesian creators never speak in translated English clauses (`"Di era..."`, `"Namun demikian"`, `"Bukan hanya X, tapi juga Y"`) or long 22-word sentences that leave no room to breathe.
- **Before (Slop):**
  > `"Apakah Anda sering mengalami kesulitan dalam membuat konten video berkualitas tinggi? Kini hadir solusi revolusioner berbasis AI yang akan mengubah cara kerja Anda secara menyeluruh."`
- **After (Craft — Spoken Breath Groups):**
  > `"Masih ngedit video satu-satu sampai begadang? Sekarang cukup tulis ide kamu di panel ini, lalu biarkan AI yang nyusun kodenya otomatis."`
- **Rules:**
  1. **8–12 Words per Breath Group:** Keep clauses short so the TTS engine places natural micro-pauses between ideas.
  2. **Spoken Register:** Use natural Indonesian spoken connectors (*"Nah,"*, *"Sekarang,"*, *"Coba lihat,"*, *"Simpel banget,"*) instead of book transitions (*"Selain itu,"*, *"Oleh karena itu,"*).
  3. **Zero Em-Dashes (`—`) or Parentheses in Script:** TTS engines either ignore them or pause awkwardly. Use commas (`,`) for a `0.15s` micro-pause and periods (`.`) for a `0.30s` full breath.

### VO-02 — Mispronounced Currency, Numbers & Acronyms (G2P Slop)

- **The pattern:** Passing raw strings like `Rp25.000`, `Rp 9rb`, `1080x1920`, `AI`, `DM`, `UI/UX`, `VPS`, or `Claude` directly to an Indonesian TTS engine while displaying the raw text on screen.
- **Why it sounds like AI:** Indonesian TTS reads `Rp25.000` as *"er-pe dua puluh lima titik nol nol nol"*, reads `AI` as the diphthong *"ay"* (like *pantai*), reads `DM` as *"dem"*, and spells `Claude` as *"kla-u-de"*. Instant giveaway that nobody checked the audio.
- **Before (Slop):**
  > Sending `"Cuma Rp9rb kamu dapat template AI Remotion 1080x1920 via DM!"` raw to TTS.
- **After (Craft — Dual-Track Display vs Spoken Phonetic Script):**
  > Keep the clean text (`"Cuma Rp9rb kamu dapat template AI Remotion 1080x1920 via DM!"`) for on-screen subtitles (`data.json`), while passing the **Indonesian Phonetic Script** to TTS:
  > `"Cuma sembilan ribu rupiah, kamu dapat templeit e-ai rimousyen seribu delapan puluh kali seribu sembilan ratus dua puluh via di-em!"`

| Written Token (On-Screen Subtitle) | Spoken Phonetic Token (Passed to Indonesian TTS) |
| :--- | :--- |
| `Rp9.000` / `Rp 9rb` / `9rb` | `sembilan ribu rupiah` / `sembilan ribu` |
| `Rp25.000` / `Rp25rb` | `dua puluh lima ribu rupiah` |
| `Rp100jt` / `100 juta` | `seratus juta rupiah` |
| `1080x1920` / `1080×1920` | `seribu delapan puluh kali seribu sembilan ratus dua puluh` |
| `9:16` / `16:9` | `sembilan banding enam belas` / `enam belas banding sembilan` |
| `AI` | `e-ai` |
| `Remotion` / `Remotion-nya` | `rimousyen` / `rimousyennya` |
| `Claude` | `klod` |
| `Antigravity` | `anti-greviti` |
| `DM` | `di-em` |
| `UI` / `UX` | `yu-ai` / `yu-eks` |
| `VPS` | `vi-pi-es` |
| `CTA` | `si-ti-ei` |
| `API` | `e-pi-ai` |
| `Reels` / `Shorts` | `rils` / `syorts` |
| `React` / `TypeScript` | `riek` / `taipskrip` |

### VO-03 — Flat Monotone Delivery & Robotic Speed

- **The pattern:** Running default TTS at `rate=+0%` and `pitch=+0Hz` with long unpunctuated paragraphs.
- **Why it sounds like AI:** Default neural TTS profiles are tuned for neutral newsreading, which sounds sluggish and sleepy on short-form vertical video.
- **Before (Slop):**
  > Default `id-ID-ArdiNeural` at `0%` rate with 30-word sentences.
- **After (Craft):**
  > For short-form Reels/TikTok/Shorts, tune pacing to **`rate="+8%"` to `"+10%"`** and **`pitch="-2Hz"`** (gives slight chest authority without sounding chipmunk-fast), combined with crisp punctuation every 6–10 words.

### VO-04 — Metallic 3.5 kHz Vocoder Harshness (Raw TTS Audio Slop)

- **The pattern:** Dropping the raw `.mp3` output from Edge-TTS / ElevenLabs directly into the video without EQ or dynamics processing.
- **Why it sounds like AI:** Neural vocoders produce a characteristic metallic resonance around `3.2–4.2 kHz` and lack low-mid chest warmth (`180–240 Hz`), making the voice sound thin, dry, and "synthesized".
- **Before (Slop):**
  > `ffmpeg -i tts.mp3 audio.wav` (raw conversion with no filtering).
- **After (Craft — FFmpeg Warm Broadcast Audio Chain):**
  > Process every generated TTS file through a 5-stage broadcast filter chain in `generate-vo.py`:
  > 1. `highpass=f=80` — Remove sub-bass rumble.
  > 2. `equalizer=f=200:t=q:w=1.0:g=2.0` — Add warm chest body (`+2.0 dB` at `200 Hz`).
  > 3. `equalizer=f=3600:t=q:w=1.4:g=-2.5` — Tame harsh metallic neural vocoder peak (`-2.5 dB` at `3.6 kHz`).
  > 4. `acompressor=threshold=-18dB:ratio=2.5:attack=15:release=120:makeup=2` — Glue dynamics like a studio podcast mic.
  > 5. `loudnorm=I=-15:TP=-1.5:LRA=9` — Normalize to `-15 LUFS` mobile broadcast standard.

### VO-05 — Dead Air Start or Clipped Final Word

- **The pattern:** TTS audio starts with `0.5s` of awkward silence, or the video composition cuts off the final consonant of the last word.
- **Why it sounds like AI:** Uncalibrated trim/pad boundaries in automated pipelines.
- **Before (Slop):**
  > Untrimmed leading silence or `durationInFrames = Math.floor(duration * 30)` cutting off the tail.
- **After (Craft):**
  > Strip leading dead air via `silenceremove`, insert an exact `160ms` natural pre-roll (`adelay=160|160`), pad `350ms` at the tail (`apad=pad_dur=0.35`), and set `durationInFrames = Math.round(duration * 30) + 15`.

### VO-06 — Naked Dry Voice in a Vacuum (No Acoustic Bed)

- **The pattern:** Playing TTS voice completely solo over pure digital silence, or drowning the voice under loud `volume={0.5}` background music.
- **Why it sounds like AI:** Complete digital silence between words exposes neural TTS gating artifacts; overly loud music makes the voice muddy.
- **Before (Slop):**
  > Either `0.0` background audio (dead vacuum) or `0.5` BGM fighting the voice.
- **After (Craft):**
  > Always lay a subtle ambient music loop (`public/sfx/music-loop.wav` at **`volume={0.12}` to `0.15`**) underneath the voice to mask digital silence between phrases, paired with subtle transition SFX (`whoosh.wav` at `0.25`, `pop.wav` at `0.20`).

---

## Voice Skill Delivery Gate Checklist

Run these checks whenever generating or auditing a Voice-Over (`audio.wav`, `data.json`, `transcript.txt`):

- [ ] **VO-01 PASS (Spoken Breath Script):** Every sentence is 8–12 words on average, uses conversational Indonesian register, and contains zero em-dashes (`—`).
- [ ] **VO-02 PASS (Smart G2P Phonetic Mapping):** All currency (`Rp...`, `...rb`, `...jt`), dimensions (`1080x1920`), percentages, and English tech acronyms (`AI`, `Remotion`, `Claude`, `DM`, `VPS`, `UI/UX`) are converted to Indonesian phonetics for TTS while preserving clean spelling in `data.json` and `transcript.txt`.
- [ ] **VO-03 PASS (Natural Prosody Tuning):** Speech rate and punctuation produce an energetic, natural cadence without rushing or droning.
- [ ] **VO-04 PASS (Warm Broadcast EQ & Loudness):** Output `audio.wav` is processed through the FFmpeg Warm Broadcast Chain (`+2dB @ 200Hz`, `-2.5dB @ 3.6kHz`, compressor, `-15 LUFS`).
- [ ] **VO-05 PASS (Clean Entry & Tail Hold):** Audio begins cleanly around `0.16s` and has at least `0.35s` + `15 frames` of tail buffer so the final word never clips.
- [ ] **VO-06 PASS (Balanced Acoustic Mix):** Background music sits at `0.12–0.15` volume and SFX accents sit at `0.18–0.28`, never overpowering the spoken voice.
