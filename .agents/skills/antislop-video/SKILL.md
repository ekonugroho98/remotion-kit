---
name: antislop-video
description: "Video and motion graphics skill for antislop (Remotion, Reels, Shorts, TikTok). Use when building, scripting, or auditing code-driven motion graphics: hierarchy, pacing, glow dose caps, subtitles, and still-frame gates. Load with the core."
allowed-tools: Read Write Edit Glob Grep Bash
---
# antislop-video

> Anti Slop: Rules for AI Coding Agents. Motion Graphics & Remotion Video skill

> Part of the antislop system. Read together with `antislop` (the core). This skill stops AI coding agents from producing recognizable "AI video slop" in code-driven motion graphics (Remotion 4.x, vertical 9:16 Reels/TikTok/Shorts, and 16:9 explainers). Load it whenever generating, editing, or reviewing video compositions, `<Sequence>` timelines, kinetic typography, or subtitle overlays.

---

## How to Use This Skill

- Load together with `antislop` (core) and `antislop-ui` whenever the task builds or edits a Remotion video or motion graphic.
- Every visual and motion choice must pass the **purpose test**: *What does this animation, glow, or card serve at this exact frame?*
- Hold every video to the **4-Layer Vertical Safe-Zone Architecture** (`1080×1920`) and run the **Still-Frame Visual Gate** (`verify-stills.mjs`) before declaring any video done.

---

## Part 1: AI Video Slop Patterns (Tells & Fixes)

### V-01 — Stacked Motion Chaos (Everything Moves at Once)

- **The pattern:** Headline, subtitle, background orbs, cards, badges, and stickers all run `Fade Up + Bounce + Floating + Scale` simultaneously on every frame.
- **Why it reads as AI:** The viewer's eye has nowhere to land. Real motion designers choreograph **one focal action at a time** (*hero speaks, supporting elements hold still*).
- **Before (Slop):**
  > Every `<WindowCard>`, badge, and headline uses `Math.sin(frame / 10)` floating plus simultaneous spring entrances at `frame = 0`.
- **After (Craft):**
  > Staggered choreography: Headline springs in at `F00–F08` (`stiffness: 180, damping: 14`), main visual card enters at `F06–F16`, and once settled, supporting cards stay calm while only the active keyword or cursor moves.
- **Core Rule:** R-19 (Animations must have a clear UX purpose), Block 3 (One focal point per screen).

### V-02 — Uncapped Neon Glow & Blue-Purple Gradient Soup

- **The pattern:** Full-canvas blue-to-purple gradient background, glowing borders on every card, glowing pills, and neon drop-shadows on all text simultaneously.
- **Why it reads as AI:** Default LLM aesthetic when asked for "modern tech video". When everything glows, nothing stands out and text contrast collapses on mobile screens.
- **Before (Slop):**
  > Background `linear-gradient(135deg, #6366f1, #a855f7)` + `boxShadow: '0 0 40px #a855f7'` on all 4 cards + glowing subtitle box.
- **After (Craft):**
  > **Strict Glow Dose Cap:** Deep matte obsidian canvas (`#0F0F0E`) or warm editorial paper (`#F4F1EA`), crisp `1px` structural card borders (`#2D2C2A`), and **soft multi-layer neon bloom restricted to 1–2 keyword accents in the main headline** (`textShadow` layered bloom without a boxy container).
- **Core Rule:** R-01 (Color & Gradients), R-13 (Glow dose cap: max 1–2 focal elements).

### V-03 — Skeleton Bars, Fake Terminals & Fabricated Metrics

- **The pattern:** Rendering grey placeholder bars (`<div style={{height: 12, background: '#333'}} />`) as "UI previews", fake terminal windows typing `npm install magic-ai`, invented stats (`10K+ Users`, `99.9% Accuracy`), or decorative emojis (`🚀`, `🔥`, `✅`, `💡`) in headers.
- **Why it reads as AI:** Viewers on Reels/TikTok spot fake skeleton UI and emoji bullets in 0.3 seconds and swipe away.
- **Before (Slop):**
  > A card with 3 grey skeleton rectangles and `🚀 10x Faster Workflow!`.
- **After (Craft):**
  > Render the **real uploaded asset** from `public/<slug>/assets/` via `<Img src={staticFile(...)} />`, real concrete UI components (`PromptInputCard` with actual slanted parameter chips `skewX(-8deg)`), and real numbers from the brief. Replace emojis with custom geometric SVG markers or clean numbered pills (`01`, `02`).
- **Core Rule:** R-04, R-05, R-17, R-23, R-36, R-38.

### V-04 — Evenly Divided Dead-Time Pacing

- **The pattern:** Dividing a 20-second video into 4 equal 5-second `<Sequence>` blocks (`150 frames` each) regardless of when the Voice-Over actually speaks each topic.
- **Why it reads as AI:** Visual cuts happen mid-sentence or sit frozen during voice transitions.
- **Before (Slop):**
  > `<Sequence from={0} durationInFrames={150}>`, `<Sequence from={150} durationInFrames={150}>` hardcoded without reading `transcript.txt`.
- **After (Craft):**
  > **Audio-Driven Cut:** Read `public/<slug>/transcript.txt` and `data.json` first. Map every `<Sequence from={...} durationInFrames={...}>` to the exact frame (`F0000`) where the spoken sentence begins and ends. Trigger `<DiagonalStripeTransition />` + `whoosh.wav` (`volume={0.28}`) on major topic shifts.
- **Core Rule:** C-1 (Intentionality), C-3 (Content-Driven Composition).

### V-05 — Multi-Line Subtitle Overflow & Platform UI Collision

- **The pattern:** Subtitles wrapping into 2–3 lines, stretching edge-to-edge, or sitting at `bottom: 60px` where Instagram Reels / TikTok / YouTube Shorts overlay the creator handle, caption, and Like/Comment buttons.
- **Why it reads as AI:** Untested vertical layout that ignores mobile platform chrome.
- **Before (Slop):**
  > 10-word subtitle block at `bottom: 50px` wrapping into 3 lines and colliding with the main card.
- **After (Craft):**
  > **Single-Line 4-Word Karaoke Subtitle (`<KaraokeSubtitle />`):** Group words into phrases of **maximum 4 words (`<= 25 characters`)** rendered in a single horizontal pill inside the vertical safe zone (`Y: 1620px–1820px` / `bottom: 185px`). Only the currently spoken word gets the active jump (`translateY(-5px)`) and accent glow.
- **Core Rule:** R-03 (Mobile Responsiveness), R-25 (Contrast).

### V-06 — Raw HTML `<img>` Flicker & CSS Transition Bugs

- **The pattern:** Using standard HTML `<img src="..." />` or CSS `transition: all 0.3s ease` / `@keyframes` inside Remotion components.
- **Why it reads as AI:** Standard `<img>` tags fail to block frame rendering in headless Chromium, causing missing or flickering images in MP4 output; CSS transitions run asynchronously from `useCurrentFrame()`, causing jittery renders.
- **Before (Slop):**
  > `<img src="/karaya/logo.png" className="transition-all duration-300" />`
- **After (Craft):**
  > Always use `<Img src={staticFile(`${slug}/assets/${file}`)} />` from `'remotion'`, and drive 100% of animations deterministically from `useCurrentFrame()` via `spring()` and clamped `interpolate(..., { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`.
- **Core Rule:** C-2, C-4, R-35.

### V-07 — Crowded Canvas & Illegible Micro-Text

- **The pattern:** Cramming 6–8 cards, multi-sentence paragraphs, or `12px–14px` text onto a `1080×1920` phone canvas.
- **Why it reads as AI:** Treating a vertical video frame like a desktop web dashboard.
- **Before (Slop):**
  > 6 feature cards in a 2×3 grid with `14px` body paragraphs.
- **After (Craft):**
  > Maximum **3–4 visual cards/elements per scene**, minimum **35% negative space**, minimum `20px–22px` for small badges/labels, `32px–44px` for card titles, and `80px–92px` extra-bold uppercase for scene headlines.
- **Core Rule:** R-03, R-06, R-25.

### V-08 — Weak or Generic Closing Scene

- **The pattern:** Video ends abruptly on the last content card or shows a generic `"Thank You for Watching! Subscribe!"` screen.
- **Why it reads as AI:** Wastes the highest-converting retention moment of short-form video.
- **Before (Slop):**
  > Static text: `"Terima kasih sudah menonton! Jangan lupa like & subscribe."`
- **After (Craft):**
  > Dedicated **Closing CTA Scene** synchronized with the spoken CTA (e.g., interactive comment simulation card `"💬 MAU"` + `"📩 Link dikirim otomatis ke DM kamu!"` or specific product URL/action), ending with a clean `0.4s–0.5s` visual hold so the final frame does not cut off mid-word.
- **Core Rule:** R-15 (Specific CTA).

---

## Part 2: 4-Layer Vertical Safe-Zone Architecture (`1080 × 1920`)

Every vertical video composition must enforce strict vertical zoning so layers never collide:

1. **Layer 1 — Dynamic Canvas (`<BackgroundCanvas />`):**
   - Intentional palette (`dark` `#0F0F0E` or `light` `#F4F1EA`) with subtle dot/grid matrix and centered spotlight that shifts accent color (`coral`, `green`, `purple`, `blue`, `gold`) per chapter.
2. **Layer 2 — Top HUD Bar (`Y: 60px – 180px`, `<TopHudBar />`):**
   - Left brand/series pill, right frame counter (`FRAME 0000`), and step progress bar.
3. **Layer 3 — Main Stage (`Y: 220px – 1480px`):**
   - **Header Zone (`Y: 220px – 520px`, `<SceneHeader />`):** Step badge (`01 LANGKAH PERTAMA`) + 2–3 line Extra-Bold Headline (`82px–92px`) with soft multi-layer neon bloom on the key phrase + optional concise subtitle (`26px–30px`).
   - **Visual Stage (`Y: 540px – 1460px`):** Hero `<WindowCard />`, `<PromptInputCard />`, uploaded `<Img />` showcase, or kinetic typography cards. Never exceed `Y: 1480px`.
4. **Layer 4 — Single-Line Karaoke Subtitle (`Y: 1620px – 1820px`, `<KaraokeSubtitle />`):**
   - Strictly 1 line (max 4 words / 25 chars) with active word bounce and accent highlight, keeping `Y: 1480px – 1620px` as a clean breathing buffer.

---

## Video Skill Delivery Gate Checklist

Run these checks alongside the core `antislop` Delivery Gate before declaring any video composition finished:

- [ ] **V-01 PASS (Single Focal Motion):** Staggered entrances (`spring()`); no simultaneous floating/bouncing chaos across all elements.
- [ ] **V-02 PASS (Glow Dose Cap):** Soft neon bloom is restricted to 1–2 headline keywords; cards use clean `1px` borders without rainbow glow soup.
- [ ] **V-03 PASS (Real Assets & No Emojis):** All uploaded images in `public/<slug>/assets/` are rendered via `<Img src={staticFile(...)} />`; zero grey skeleton bars, zero fake terminal fillers, zero decorative emojis (`🚀🔥✅`) in headers.
- [ ] **V-04 PASS (Audio-Driven Cut):** Every `<Sequence>` `from` and `durationInFrames` matches the exact spoken sentence boundaries in `public/<slug>/transcript.txt`.
- [ ] **V-05 PASS (1-Line Safe-Zone Subtitle):** `<KaraokeSubtitle />` stays within 1 line (max 4 words) at `bottom: 185px` (`Y: 1620–1820`) with zero collision against Layer 3 cards.
- [ ] **V-06 PASS (Deterministic Remotion Code):** `npx tsc --noEmit` passes with `0 errors`; zero HTML `<img>` tags or CSS `transition` properties.
- [ ] **V-07 PASS (Visual Still Inspection):** Ran `node scripts/verify-stills.mjs <CompId>` and visually inspected the rendered PNG frames in `out/stills/<CompId>/` to confirm zero text overlap, crisp contrast, and balanced spacing.
- [ ] **V-08 PASS (Specific Closing CTA):** Final scene renders an intentional, action-driven CTA synchronized with the closing Voice-Over.
