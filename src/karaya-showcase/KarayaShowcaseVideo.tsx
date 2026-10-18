import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import showcaseData from '../../public/karaya-showcase/data.json';
import { ACCENT_COLORS, AccentTheme, BackgroundCanvas } from '../components/BackgroundCanvas';
import {
  AnimatedCursor,
  FloatingSticker,
  PromptInputCard,
  WindowCard,
} from '../components/FauxUiCards';
import { KaraokeSubtitle, PhraseTimestamp } from '../components/KaraokeSubtitle';
import { SceneHeader } from '../components/SceneHeader';
import { ClaudeSparkIcon, TopHudBar } from '../components/TopHudBar';
import { DiagonalStripeTransition } from '../components/Transitions';

const STEPS = ['1. KONSEP', '2. PREP PANEL', '3. ANTIGRAVITY', '4. RENDER MP4'];

/**
 * Scene 1 (0 - 246f): Hook — Tanpa After Effects, Cukup Remotion & Antigravity
 */
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1 = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 150 } });
  const card2 = spring({ frame: Math.max(0, frame - 26), fps, config: { damping: 14, stiffness: 150 } });
  const strikeWidth = interpolate(frame, [32, 52], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '230px 64px 260px 64px', justifyContent: 'flex-start', gap: 56 }}>
      <SceneHeader
        badgeText="REMOTION × ANTIGRAVITY"
        accent="coral"
        typewriter
        titleLines={[
          { text: 'MOTION GRAPHIC' },
          { text: 'TANPA NGODING', accentWord: 'TANPA' },
          { text: 'DI ANTIGRAVITY', accentWord: 'ANTIGRAVITY', highlightBox: true },
        ]}
      />

      {/* Comparison Cards + Code Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Old Way Card */}
          <div
            style={{
              padding: '28px 24px',
              borderRadius: 22,
              backgroundColor: 'rgba(235, 87, 87, 0.08)',
              border: '2px solid rgba(235, 87, 87, 0.35)',
              transform: `scale(${card1})`,
              opacity: card1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#EB5757', letterSpacing: '0.08em' }}>
              CARA LAMA
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: '#F5F4F0',
                marginTop: 10,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              AFTER EFFECTS
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  height: 5,
                  width: `${strikeWidth}%`,
                  backgroundColor: '#EB5757',
                  borderRadius: 4,
                  transform: 'rotate(-4deg)',
                }}
              />
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', marginTop: 8, fontWeight: 600 }}>
              ✕ Berat & Manual Keyframe
            </div>
          </div>

          {/* New Way Card */}
          <div
            style={{
              padding: '28px 24px',
              borderRadius: 22,
              backgroundColor: 'rgba(224, 122, 95, 0.14)',
              border: '2px solid #E07A5F',
              boxShadow: '0 0 36px rgba(224, 122, 95, 0.24)',
              transform: `scale(${card2})`,
              opacity: card2,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#E07A5F', letterSpacing: '0.08em' }}>
              CARA BARU
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', marginTop: 10 }}>
              REMOTION × AGY
            </div>
            <div style={{ fontSize: 20, color: '#56C288', marginTop: 8, fontWeight: 700 }}>
              ✓ Agent Nulis & Cek Video
            </div>
          </div>
        </div>

        {/* Live React Frame Visualizer */}
        <WindowCard title="Video.tsx • Antigravity Workspace" accent="coral" tilt3D delay={36}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 23,
              lineHeight: 1.6,
              color: '#E5E5E0',
            }}
          >
            <div>
              <span style={{ color: '#E07A5F' }}>const</span> frame ={' '}
              <span style={{ color: '#56C288' }}>useCurrentFrame</span>();{' '}
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>// Frame: {frame}</span>
            </div>
            <div>
              <span style={{ color: '#E07A5F' }}>const</span> scale ={' '}
              <span style={{ color: '#4DA3FF' }}>spring</span>(&#123; frame, fps: 30 &#125;);
            </div>
            <div>
              <span style={{ color: '#E07A5F' }}>return</span> &lt;
              <span style={{ color: '#F2C94C' }}>MotionScene</span> scale=&#123;scale&#125; /&gt;;
            </div>
          </div>
        </WindowCard>

        <FloatingSticker
          text="LAPTOP KENTANG BISA!"
          accent="gold"
          rotateDeg={-4}
          delay={55}
          style={{ position: 'absolute', right: 16, top: -22 }}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 2 (246 - 507f): Langkah 1 — Buka Prep Panel Lokal (Pilih 25+ Style, Drop VO & Aset, Submit)
 */
const PrepPanelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const styles = [
    { id: 'L01', name: 'AGY DARK UI', tag: 'TUTORIAL • UI', active: true, color: '#E07A5F' },
    { id: 'L02', name: 'KINETIC TYPO', tag: 'HOOK • CEPAT', active: false, color: '#F2C94C' },
    { id: 'L03', name: 'ISOMETRIC 3D', tag: 'DATA • TECH', active: false, color: '#4DA3FF' },
  ];

  const isSubmitted = frame >= 200;
  const btnScale =
    frame >= 195 && frame <= 208
      ? interpolate(frame, [195, 200, 208], [1, 0.92, 1.03])
      : 1;

  return (
    <AbsoluteFill style={{ padding: '230px 64px 260px 64px', justifyContent: 'flex-start', gap: 56 }}>
      <SceneHeader
        stepNumber={1}
        badgeText="LANGKAH PERTAMA"
        accent="green"
        titleLines={[
          { text: 'BUKA PREP PANEL' },
          { text: 'PILIH 25+ STYLE', accentWord: '25+ STYLE', highlightBox: true },
        ]}
      />

      <div style={{ position: 'relative' }}>
        <WindowCard title="localhost:3030 • Prep Panel" accent="green" tilt3D delay={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* 25+ Style Cards Row */}
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                1. PILIH TEMPLATE GAYA VISUAL (25+ SIAP PAKAI)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {styles.map((st, idx) => {
                  const pop = spring({
                    frame: Math.max(0, frame - (20 + idx * 8)),
                    fps,
                    config: { damping: 14, stiffness: 160 },
                  });
                  return (
                    <div
                      key={st.id}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 16,
                        backgroundColor: st.active ? 'rgba(86, 194, 136, 0.14)' : '#22221F',
                        border: st.active ? '2px solid #56C288' : '1.5px solid rgba(255,255,255,0.08)',
                        transform: `scale(${pop})`,
                        opacity: pop,
                      }}
                    >
                      <div
                        style={{
                          height: 68,
                          borderRadius: 10,
                          backgroundColor: '#141412',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12,
                          border: `1px solid ${st.color}44`,
                        }}
                      >
                        <span style={{ fontSize: 18, fontWeight: 900, color: st.color }}>{st.id}</span>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>{st.name}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                        {st.tag}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audio + Assets Dropzone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  backgroundColor: '#22221F',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    VOICE-OVER
                  </div>
                  <div style={{ fontSize: 21, color: '#F5F4F0', fontWeight: 800, marginTop: 4 }}>
                    🎵 audio.wav
                  </div>
                </div>
                <span style={{ color: '#56C288', fontSize: 20, fontWeight: 900 }}>✓ SIAP</span>
              </div>

              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  backgroundColor: '#22221F',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    ASET VISUAL
                  </div>
                  <div style={{ fontSize: 21, color: '#F5F4F0', fontWeight: 800, marginTop: 4 }}>
                    🖼️ 4 File PNG
                  </div>
                </div>
                <span style={{ color: '#56C288', fontSize: 20, fontWeight: 900 }}>✓ SIAP</span>
              </div>
            </div>

            {/* Submit Button */}
            <div
              style={{
                padding: '20px 28px',
                borderRadius: 16,
                backgroundColor: isSubmitted ? '#56C288' : '#2E8B57',
                color: '#0F0F0E',
                fontSize: 26,
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: '0.06em',
                transform: `scale(${btnScale})`,
                boxShadow: isSubmitted ? '0 0 36px rgba(86, 194, 136, 0.5)' : 'none',
              }}
            >
              {isSubmitted ? '✓ PROMPT.TXT SIAP DISALIN!' : 'SUBMIT & GENERATE PROMPT →'}
            </div>
          </div>
        </WindowCard>

        <AnimatedCursor
          fromX={760}
          fromY={140}
          toX={480}
          toY={470}
          moveStartFrame={155}
          clickFrame={198}
          accent="green"
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 3 (507 - 790f): Langkah 2 — Kirim Prompt ke Antigravity -> Komponen React + Spring + Karaoke
 */
const ClaudeCodeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeCardSpring = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  return (
    <AbsoluteFill style={{ padding: '230px 64px 260px 64px', justifyContent: 'flex-start', gap: 56 }}>
      <SceneHeader
        stepNumber={2}
        badgeText="LANGKAH KEDUA"
        accent="purple"
        titleLines={[
          { text: 'PASTE PROMPT KE' },
          { text: 'ANTIGRAVITY', accentWord: 'ANTIGRAVITY', highlightBox: true },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
        <PromptInputCard
          accent="purple"
          promptText="Bikin video baru dari folder public/karaya-showcase/ (audio.wav, data.json, concept.md sudah siap). Pakai animasi spring & subtitle karaoke otomatis."
          chips={[
            { label: '1080×1920', accent: 'purple' },
            { label: '30 FPS', accent: 'green' },
            { label: 'SPRING PHYSICS', accent: 'coral' },
            { label: 'MULTIMODAL CHECK', accent: 'gold' },
          ]}
        />

        {/* Sequence Timeline Preview */}
        <div
          style={{
            padding: 26,
            borderRadius: 22,
            backgroundColor: '#181816',
            border: '2px solid rgba(176, 124, 251, 0.4)',
            transform: `scale(${codeCardSpring}) translateY(${(1 - codeCardSpring) * 24}px)`,
            opacity: codeCardSpring,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 18,
              fontWeight: 800,
              color: '#B07CFB',
              marginBottom: 14,
            }}
          >
            <span>✓ ANTIGRAVITY MENYUSUN SEQUENCE & CEK VIDEO</span>
            <span>TYPECHECK: 0 ERROR</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1.2fr 1fr', gap: 10 }}>
            {[
              { name: '<HookScene />', frames: '0–246f', color: '#E07A5F' },
              { name: '<PrepPanel />', frames: '246–507f', color: '#56C288' },
              { name: '<Antigravity />', frames: '507–790f', color: '#B07CFB' },
              { name: '<RenderMP4 />', frames: '790–1062f', color: '#F2C94C' },
            ].map((seq) => (
              <div
                key={seq.name}
                style={{
                  padding: '14px 12px',
                  borderRadius: 12,
                  backgroundColor: `${seq.color}22`,
                  border: `1.5px solid ${seq.color}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  {seq.name}
                </div>
                <div style={{ fontSize: 15, color: seq.color, fontWeight: 700, marginTop: 4 }}>
                  {seq.frames}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 4 (790 - 1072f): Langkah Terakhir — Klik Render (Gaya Galihry DedfVnXx_a4)
 */
const RenderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const btnSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 160 },
  });
  const isClicked = frame >= 36;
  const clickScale =
    frame >= 32 && frame <= 44
      ? interpolate(frame, [32, 36, 44], [1, 0.92, 1.03])
      : 1;

  const renderProgress = Math.floor(
    interpolate(frame, [38, 125], [0, 100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const currentRenderedFrame = Math.floor((renderProgress / 100) * 300);
  const isDone = renderProgress >= 100;

  const barCardSpring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const videoCardSpring = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: { damping: 13, stiffness: 165 },
  });

  return (
    <AbsoluteFill style={{ padding: '230px 64px 260px 64px', justifyContent: 'flex-start', gap: 64 }}>
      <SceneHeader
        badgeText="TERAKHIR"
        accent="green"
        titleLines={[
          { text: 'KLIK' },
          { text: 'RENDER', accentWord: 'RENDER' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
          position: 'relative',
          marginTop: 12,
        }}
      >
        {/* Big Green RENDER Button (Galihry style) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            padding: '28px 76px',
            borderRadius: 24,
            backgroundColor: '#8CC084',
            color: '#111110',
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: '0.06em',
            boxShadow: isClicked
              ? '0 0 48px rgba(140, 192, 132, 0.55)'
              : '0 20px 44px rgba(0,0,0,0.45)',
            transform: `scale(${btnSpring * clickScale})`,
            opacity: btnSpring,
          }}
        >
          <span style={{ fontSize: 34 }}>▶</span>
          <span>RENDER</span>
        </div>

        {/* Progress Bar Card */}
        <div
          style={{
            width: '100%',
            padding: '28px 36px',
            borderRadius: 24,
            backgroundColor: 'rgba(28, 29, 26, 0.92)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 56px rgba(0,0,0,0.5)',
            transform: `scale(${0.92 + 0.08 * barCardSpring}) translateY(${(1 - barCardSpring) * 20}px)`,
            opacity: barCardSpring,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#C8C5B8',
            }}
          >
            <span>{isDone ? 'RENDER SELESAI' : 'MERENDER VIDEO...'}</span>
            <span>FRAME {currentRenderedFrame}/300</span>
          </div>

          <div
            style={{
              height: 18,
              borderRadius: 99,
              backgroundColor: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${renderProgress}%`,
                background: 'linear-gradient(90deg, #8CC084 0%, #E5DEC9 100%)',
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        {/* VIDEO.MP4 Output Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            padding: '24px 38px',
            borderRadius: 24,
            backgroundColor: 'rgba(26, 28, 24, 0.95)',
            border: '2px solid rgba(140, 192, 132, 0.55)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 36px rgba(140, 192, 132, 0.18)',
            transform: `scale(${videoCardSpring}) translateY(${(1 - videoCardSpring) * 24}px)`,
            opacity: videoCardSpring,
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 18,
              backgroundColor: '#8CC084',
              color: '#111110',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            ▶
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.02em' }}>
              VIDEO.MP4
            </div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.08em',
                marginTop: 4,
              }}
            >
              1080 × 1920 · SIAP UPLOAD
            </div>
          </div>
        </div>

        {/* Social Upload Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6 }}>
          {['↑ REELS', '↑ TIKTOK', '↑ SHORTS'].map((label, idx) => {
            const pillPop = spring({
              frame: Math.max(0, frame - (165 + idx * 8)),
              fps,
              config: { damping: 13, stiffness: 180 },
            });
            return (
              <div
                key={label}
                style={{
                  padding: '14px 28px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(224, 122, 95, 0.12)',
                  border: '1.5px solid rgba(224, 122, 95, 0.65)',
                  color: '#F5F4F0',
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  transform: `scale(${pillPop})`,
                  opacity: pillPop,
                }}
              >
                <span style={{ color: '#E07A5F', marginRight: 6 }}>↑</span>
                {label.replace('↑ ', '')}
              </div>
            );
          })}
        </div>

        <AnimatedCursor
          fromX={760}
          fromY={260}
          toX={520}
          toY={72}
          moveStartFrame={10}
          clickFrame={36}
          accent="green"
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * Scene 5 (1072 - 1251f): CTA Lead Magnet (Gaya Galihry DebIG1qxr0Q)
 * "Buat yang mau link Remotion-nya, langsung comment MAU di bawah, nanti aku kirim link-nya via DM!"
 */
const CommentCtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clickFrame = 72;
  const isSent = frame >= clickFrame;

  const typedWord = 'MAU';
  const typedLen = Math.min(
    typedWord.length,
    Math.max(0, Math.floor(interpolate(frame, [14, 42], [0, typedWord.length + 0.99])))
  );
  const currentTyped = typedWord.slice(0, typedLen);

  const boxEnter = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  const btnBounce = isSent
    ? spring({
        frame: Math.max(0, frame - clickFrame),
        fps,
        config: { damping: 11, stiffness: 200 },
      })
    : spring({
        frame: Math.max(0, frame - 20),
        fps,
        config: { damping: 14, stiffness: 160 },
      });

  const dmNoticeSpring = spring({
    frame: Math.max(0, frame - (clickFrame + 6)),
    fps,
    config: { damping: 13, stiffness: 170 },
  });

  const burstProgress =
    frame >= clickFrame
      ? interpolate(frame - clickFrame, [0, 24], [0, 1], { extrapolateRight: 'clamp' })
      : 0;

  const bellWiggle =
    frame >= clickFrame + 8
      ? Math.sin((frame - clickFrame) * 0.45) *
        interpolate(frame - clickFrame, [8, 45], [14, 0], { extrapolateRight: 'clamp' })
      : 0;

  return (
    <AbsoluteFill style={{ padding: '230px 64px 260px 64px', justifyContent: 'flex-start', gap: 68 }}>
      <SceneHeader
        badgeText="LINK TEMPLATE GRATIS"
        accent="coral"
        titleLines={[
          { text: 'MAU LINK' },
          { text: 'REMOTION-NYA?', accentWord: 'REMOTION-NYA?' },
        ]}
        subtitleLines={[
          {
            text: 'LANGSUNG COMMENT "MAU" DI BAWAH',
            boldWords: ['COMMENT', '"MAU"'],
          },
          {
            text: 'NANTI AKU KIRIM LINK-NYA VIA DM!',
            boldWords: ['KIRIM', 'LINK-NYA', 'VIA', 'DM!'],
          },
        ]}
      />

      {/* Center Stage (Galihry Minimalist Pill + Burst + DM Line) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
          position: 'relative',
          marginTop: 10,
        }}
      >
        {/* Comment Input Preview Card */}
        <div
          style={{
            width: '100%',
            padding: '24px 32px',
            borderRadius: 24,
            backgroundColor: 'rgba(26, 26, 24, 0.92)',
            border: isSent
              ? '2px solid rgba(242, 239, 233, 0.35)'
              : '2px solid rgba(224, 122, 95, 0.65)',
            boxShadow: '0 24px 56px rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: `scale(${0.92 + 0.08 * boxEnter})`,
            opacity: boxEnter,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                backgroundColor: 'rgba(224, 122, 95, 0.18)',
                border: '2px solid #E07A5F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              💬
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.48)',
                  letterSpacing: '0.06em',
                }}
              >
                KOLOM KOMENTAR REELS
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: '#F5F4F0',
                  letterSpacing: '0.08em',
                  marginTop: 2,
                  minHeight: 52,
                }}
              >
                {currentTyped}
                {!isSent && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 4,
                      height: 38,
                      backgroundColor: '#E07A5F',
                      marginLeft: 6,
                      verticalAlign: 'middle',
                      opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0.2,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              backgroundColor: isSent ? 'rgba(140, 192, 132, 0.2)' : 'rgba(224, 122, 95, 0.2)',
              border: `1.5px solid ${isSent ? '#8CC084' : '#E07A5F'}`,
              color: isSent ? '#8CC084' : '#E07A5F',
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '0.06em',
            }}
          >
            {isSent ? '✓ KOMENTAR TERKIRIM' : 'KETIK: MAU'}
          </div>
        </div>

        {/* Giant Pill Button with Radial Particle Burst (Galihry DebIG1qxr0Q style) */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          {/* 12 Radial Burst Particles on Click */}
          {burstProgress > 0 &&
            burstProgress < 1 &&
            Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = interpolate(burstProgress, [0, 1], [40, 270]);
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius * 0.65;
              const pOpacity = interpolate(burstProgress, [0, 0.7, 1], [1, 0.8, 0]);
              const pColor = i % 2 === 0 ? '#E07A5F' : '#F2EFE9';
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: pColor,
                    transform: `translate(${px - 7}px, ${py - 7}px) scale(${1 - burstProgress * 0.5})`,
                    opacity: pOpacity,
                    boxShadow: `0 0 16px ${pColor}`,
                  }}
                />
              );
            })}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              padding: '32px 68px',
              borderRadius: 999,
              backgroundColor: isSent ? '#F2EFE9' : '#E07A5F',
              color: '#141413',
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: '0.06em',
              boxShadow: isSent
                ? '0 24px 60px rgba(0,0,0,0.6), 0 0 48px rgba(242, 239, 233, 0.35)'
                : '0 20px 50px rgba(224, 122, 95, 0.4)',
              transform: `scale(${isSent ? 0.9 + 0.1 * btnBounce : btnBounce})`,
            }}
          >
            <span>{isSent ? '✓' : '💬'}</span>
            <span>{isSent ? 'LINK DIKIRIM VIA DM' : 'COMMENT "MAU"'}</span>
          </div>
        </div>

        {/* Bottom Notification Row (Galihry Bell / DM style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.06em',
            color: '#E5DEC9',
            transform: `translateY(${(1 - dmNoticeSpring) * 18}px)`,
            opacity: isSent ? dmNoticeSpring : 0.45,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: 34,
              transform: `rotate(${bellWiggle}deg)`,
            }}
          >
            📩
          </span>
          <span>
            {isSent
              ? 'CEK DM INSTAGRAM KAMU SEKARANG!'
              : 'OTOMATIS MASUK KE DM KAMU'}
          </span>
        </div>

        <AnimatedCursor
          fromX={780}
          fromY={380}
          toX={540}
          toY={248}
          moveStartFrame={38}
          clickFrame={clickFrame}
          accent="coral"
        />
      </div>
    </AbsoluteFill>
  );
};

export const KarayaShowcaseVideo: React.FC = () => {
  const frame = useCurrentFrame();

  let currentAccent: AccentTheme = 'coral';
  let activeStepIndex = 0;
  if (frame >= 1072) {
    currentAccent = 'coral';
    activeStepIndex = 3;
  } else if (frame >= 790) {
    currentAccent = 'green';
    activeStepIndex = 3;
  } else if (frame >= 507) {
    currentAccent = 'purple';
    activeStepIndex = 2;
  } else if (frame >= 246) {
    currentAccent = 'green';
    activeStepIndex = 1;
  }

  return (
    <AbsoluteFill
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      <style>
        {`
          * {
            font-family: 'Plus Jakarta Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
            box-sizing: border-box;
          }
          code, pre, .mono {
            font-family: 'JetBrains Mono', 'SF Mono', Menlo, monospace !important;
          }
        `}
      </style>
      {/* 1. Dynamic Background Canvas */}
      <BackgroundCanvas mode="dark" accent={currentAccent} pattern="dots" />

      {/* 2. Top HUD Bar + 4-Step Progress Bar */}
      <TopHudBar
        leftLabel="REMOTION × ANTIGRAVITY"
        rightLabel="KARAYA STUDIO"
        showFrameCounter
        accent={currentAccent}
        steps={STEPS}
        activeStepIndex={activeStepIndex}
      />

      {/* 3. Scene Sequences */}
      <Sequence from={0} durationInFrames={246}>
        <HookScene />
      </Sequence>
      <Sequence from={246} durationInFrames={261}>
        <PrepPanelScene />
      </Sequence>
      <Sequence from={507} durationInFrames={283}>
        <ClaudeCodeScene />
      </Sequence>
      <Sequence from={790} durationInFrames={282}>
        <RenderScene />
      </Sequence>
      <Sequence from={1072} durationInFrames={179}>
        <CommentCtaScene />
      </Sequence>

      {/* 4. Diagonal Stripe Scene Transitions */}
      <DiagonalStripeTransition startFrame={237} durationInFrames={18} />
      <DiagonalStripeTransition startFrame={498} durationInFrames={18} />
      <DiagonalStripeTransition startFrame={781} durationInFrames={18} />
      <DiagonalStripeTransition startFrame={1063} durationInFrames={18} />

      {/* 5. Word-Level Synchronized Karaoke Subtitle */}
      <KaraokeSubtitle
        phrases={showcaseData.phrases as PhraseTimestamp[]}
        accent={currentAccent}
        mode="dark"
      />

      {/* 6. Audio Track: Voice-Over + Auto-Ducked Backsound + Procedural SFX */}
      <Audio src={staticFile('karaya-showcase/audio.wav')} volume={1} />
      <Audio src={staticFile('sfx/music-loop.wav')} loop volume={0.14} />

      {/* Transition Whooshes */}
      <Sequence from={237} durationInFrames={20}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={498} durationInFrames={20}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={781} durationInFrames={20}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={1063} durationInFrames={20}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
      </Sequence>

      {/* UI Pops & Clicks */}
      <Sequence from={14} durationInFrames={15}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={28} durationInFrames={15}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={444} durationInFrames={15}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={826} durationInFrames={15}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={915} durationInFrames={30}>
        <Audio src={staticFile('sfx/success.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={1144} durationInFrames={15}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={1150} durationInFrames={30}>
        <Audio src={staticFile('sfx/success.wav')} volume={0.65} />
      </Sequence>
    </AbsoluteFill>
  );
};
