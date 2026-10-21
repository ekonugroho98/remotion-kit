import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface ShotcraftCanvasProps {
  glowColor?: string;
  secondaryGlow?: string;
  showSubtleGrid?: boolean;
}

/**
 * 1. Ultra-Clean Dark Obsidian Canvas (#0A0B0A) with soft breathing ambient radial light
 *    Inspired by @jipraks Content Engine aesthetic (60%+ clean negative space).
 */
export const ShotcraftCanvas: React.FC<ShotcraftCanvasProps> = ({
  glowColor = '#B6F000',
  secondaryGlow = '#3B82F6',
  showSubtleGrid = true,
}) => {
  const frame = useCurrentFrame();
  const driftX = interpolate(Math.sin(frame / 42), [-1, 1], [-24, 24]);
  const driftY = interpolate(Math.cos(frame / 54), [-1, 1], [-18, 18]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0A0B0A',
        overflow: 'hidden',
      }}
    >
      {/* Top-center primary ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 860,
          height: 860,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor}1F 0%, ${glowColor}08 42%, transparent 70%)`,
          top: 260 + driftY,
          left: 110 + driftX,
          pointerEvents: 'none',
        }}
      />
      {/* Lower-right secondary ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryGlow}18 0%, transparent 68%)`,
          bottom: 220 - driftY,
          right: -120 - driftX,
          pointerEvents: 'none',
        }}
      />
      {showSubtleGrid && (
        <AbsoluteFill
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.055) 1.2px, transparent 1.2px)',
            backgroundSize: '36px 36px',
            opacity: 0.55,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export interface MinimalEyebrowHeaderProps {
  eyebrow: string;
  dotColor?: string;
  titleLine1: string;
  titleLine2?: string;
  accentText?: string;
  accentColor?: string;
  align?: 'left' | 'center';
}

/**
 * 2. Minimal Top Eyebrow + Headline (● CONTENT ENGINE / ● ISINYA / ● CARA PAKAI / ● BISA JUGA)
 */
export const MinimalEyebrowHeader: React.FC<MinimalEyebrowHeaderProps> = ({
  eyebrow,
  dotColor = '#B6F000',
  titleLine1,
  titleLine2,
  accentText,
  accentColor = '#B6F000',
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });

  const renderLineWithAccent = (line: string) => {
    if (!accentText || !line.toLowerCase().includes(accentText.toLowerCase())) {
      return line;
    }
    const idx = line.toLowerCase().indexOf(accentText.toLowerCase());
    const before = line.slice(0, idx);
    const match = line.slice(idx, idx + accentText.length);
    const after = line.slice(idx + accentText.length);
    return (
      <>
        {before}
        <span style={{ color: accentColor }}>{match}</span>
        {after}
      </>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        gap: 14,
        transform: `translateY(${(1 - enter) * 20}px)`,
        opacity: enter,
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.58)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: `0 0 14px ${dotColor}`,
          }}
        />
        <span>{eyebrow}</span>
      </div>

      <div
        style={{
          fontSize: 58,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
        }}
      >
        <div>{renderLineWithAccent(titleLine1)}</div>
        {titleLine2 && <div style={{ marginTop: 4 }}>{renderLineWithAccent(titleLine2)}</div>}
      </div>
    </div>
  );
};

export interface CircularTimerRingProps {
  morphFrame?: number;
  accentColor?: string;
  headlineAfterMorph?: string;
  subAfterMorph?: string;
}

/**
 * 3. Circular SVG Countdown Ring (00:49 -> 09:59 -> morphs into "10 MENIT" at morphFrame)
 */
export const CircularTimerRing: React.FC<CircularTimerRingProps> = ({
  morphFrame = 48,
  accentColor = '#B6F000',
  headlineAfterMorph = '10 MENIT',
  subAfterMorph = 'Bikin video dari nol sampai terjadwal',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 170 },
  });

  const isMorphed = frame >= morphFrame;
  const morphSpring = spring({
    frame: Math.max(0, frame - morphFrame),
    fps,
    config: { damping: 13, stiffness: 210 },
  });

  const progress = interpolate(frame, [0, morphFrame], [0.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const totalSeconds = Math.floor(
    interpolate(frame, [0, morphFrame], [49, 600], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');

  const size = 470;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        transform: `scale(${0.92 + enter * 0.08})`,
        opacity: enter,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {!isMorphed ? (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 88,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {mins}:{secs}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.52)',
              }}
            >
              DARI IDE → POSTING
            </div>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transform: `scale(${0.84 + morphSpring * 0.16})`,
            }}
          >
            <div
              style={{
                padding: '6px 20px',
                borderRadius: 999,
                backgroundColor: `${accentColor}22`,
                border: `1.5px solid ${accentColor}`,
                color: accentColor,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.1em',
              }}
            >
              ⚡ SELESAI OTOMATIS
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              {headlineAfterMorph}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 34,
          fontSize: 32,
          fontWeight: 700,
          color: isMorphed ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          maxWidth: 760,
        }}
      >
        {subAfterMorph}
      </div>
    </div>
  );
};

export interface FileTreeItem {
  name: string;
  desc: string;
  color: string;
  isFolder?: boolean;
  activateFrame: number;
}

const DEFAULT_TREE_ITEMS: FileTreeItem[] = [
  { name: '.agents/skills', desc: 'Aturan anti-slop & desain', color: '#A855F7', isFolder: true, activateFrame: 8 },
  { name: 'panel/', desc: 'Prep Panel web interaktif', color: '#3B82F6', isFolder: true, activateFrame: 16 },
  { name: 'src/library/', desc: 'Komponen animasi Shotcraft', color: '#B6F000', isFolder: true, activateFrame: 24 },
  { name: 'src/templates/', desc: '25+ Style Preset (L01–L25)', color: '#F59E0B', isFolder: true, activateFrame: 32 },
  { name: 'public/sfx/', desc: '9 SFX & musik ambient studio', color: '#22D3EE', isFolder: true, activateFrame: 40 },
  { name: 'scripts/', desc: 'Auto-VO, timestamp & cut silence', color: '#34D399', isFolder: true, activateFrame: 48 },
  { name: 'CLAUDE.md', desc: 'Otak instruksi AI Agent', color: '#F472B6', isFolder: false, activateFrame: 56 },
  { name: 'audio-pack.json', desc: 'Manifest efek suara otomatis', color: '#FACC15', isFolder: false, activateFrame: 64 },
];

/**
 * 4. Animated Project Folder Tree Card (Ghost rows -> Lit rows on spoken frame)
 */
export const FileTreeCard: React.FC<{ items?: FileTreeItem[] }> = ({
  items = DEFAULT_TREE_ITEMS,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardEnter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180 },
  });

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 28,
        backgroundColor: '#111312',
        border: '1.5px solid rgba(255,255,255,0.12)',
        padding: '28px 32px',
        boxShadow: '0 28px 64px rgba(0,0,0,0.55)',
        transform: `translateY(${(1 - cardEnter) * 26}px)`,
        opacity: cardEnter,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Top Folder Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 20,
          marginBottom: 18,
          borderBottom: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: 'rgba(182, 240, 0, 0.14)',
              border: '1.5px solid #B6F000',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            📁
          </span>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>
              remotion-kit/
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              1 Folder Project Lengkap · Siap Pakai
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(182, 240, 0, 0.14)',
            color: '#B6F000',
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          v2.0 READY
        </div>
      </div>

      {/* Tree Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, idx) => {
          const isLit = frame >= item.activateFrame;
          const litSpring = isLit
            ? spring({
                frame: Math.max(0, frame - item.activateFrame),
                fps,
                config: { damping: 14, stiffness: 220 },
              })
            : 0;

          return (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderRadius: 16,
                backgroundColor: isLit
                  ? 'rgba(255, 255, 255, 0.055)'
                  : 'rgba(255, 255, 255, 0.015)',
                border: isLit
                  ? `1.5px solid ${item.color}88`
                  : '1.5px dashed rgba(255, 255, 255, 0.16)',
                opacity: isLit ? 0.35 + litSpring * 0.65 : 0.28,
                transform: `translateX(${isLit ? (1 - litSpring) * 14 : 0}px) scale(${
                  isLit ? 0.98 + litSpring * 0.02 : 0.98
                })`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: item.isFolder ? 4 : '50%',
                    backgroundColor: isLit ? item.color : 'rgba(255,255,255,0.25)',
                    boxShadow: isLit ? `0 0 12px ${item.color}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 23,
                    fontWeight: 700,
                    color: isLit ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {item.name}
                </span>
              </div>

              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: isLit ? item.color : 'rgba(255,255,255,0.32)',
                }}
              >
                {item.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface ConnectionNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  activateFrame: number;
  subActivateFrame: number;
}

const DEFAULT_CONNECTION_NODES: ConnectionNode[] = [
  {
    id: 'brand',
    title: 'Brand Kamu',
    subtitle: 'Logo, warna, font & gaya bahasa',
    icon: '🎨',
    color: '#3B82F6',
    activateFrame: 12,
    subActivateFrame: 26,
  },
  {
    id: 'brain',
    title: 'Otak AI',
    subtitle: 'Aturan animasi, pacing & hook',
    icon: '🧠',
    color: '#F59E0B',
    activateFrame: 42,
    subActivateFrame: 56,
  },
  {
    id: 'library',
    title: 'Komponen',
    subtitle: '25+ template, transisi & 9 SFX',
    icon: '🧩',
    color: '#B6F000',
    activateFrame: 72,
    subActivateFrame: 86,
  },
  {
    id: 'connect',
    title: 'Koneksi',
    subtitle: 'Auto-VO, timestamp & render MP4',
    icon: '⚡',
    color: '#A855F7',
    activateFrame: 102,
    subActivateFrame: 114,
  },
];

/**
 * 5. Word-Synced Progressive Activation Grid (Ghost Dashed Outline -> Lit Up Card + Summary Pill)
 *    Directly inspired by @jipraks 00:08 - 00:16 scene.
 */
export const DashedConnectionGrid: React.FC<{
  nodes?: ConnectionNode[];
  summaryFrame?: number;
  summaryText?: string;
}> = ({
  nodes = DEFAULT_CONNECTION_NODES,
  summaryFrame = 124,
  summaryText = '✓ 4 bagian udah nyambung otomatis',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showSummary = frame >= summaryFrame;
  const summarySpring = showSummary
    ? spring({
        frame: Math.max(0, frame - summaryFrame),
        fps,
        config: { damping: 12, stiffness: 220 },
      })
    : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          width: '100%',
          position: 'relative',
        }}
      >
        {nodes.map((node) => {
          const isLit = frame >= node.activateFrame;
          const showSub = frame >= node.subActivateFrame;

          const cardPop = isLit
            ? spring({
                frame: Math.max(0, frame - node.activateFrame),
                fps,
                config: { damping: 13, stiffness: 210 },
              })
            : 0;

          const subPop = showSub
            ? spring({
                frame: Math.max(0, frame - node.subActivateFrame),
                fps,
                config: { damping: 15, stiffness: 190 },
              })
            : 0;

          return (
            <div
              key={node.id}
              style={{
                minHeight: 280,
                padding: '30px 28px',
                borderRadius: 26,
                backgroundColor: isLit
                  ? 'rgba(20, 23, 22, 0.95)'
                  : 'rgba(255, 255, 255, 0.015)',
                border: isLit
                  ? `2.5px solid ${node.color}`
                  : '2px dashed rgba(255, 255, 255, 0.20)',
                boxShadow: isLit
                  ? `0 20px 48px rgba(0,0,0,0.55), 0 0 28px ${node.color}28`
                  : 'none',
                opacity: isLit ? 0.3 + cardPop * 0.7 : 0.25,
                transform: `scale(${isLit ? 0.94 + cardPop * 0.06 : 0.95})`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    backgroundColor: isLit
                      ? `${node.color}22`
                      : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${
                      isLit ? node.color : 'rgba(255,255,255,0.14)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                  }}
                >
                  {node.icon}
                </div>

                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    backgroundColor: isLit
                      ? `${node.color}24`
                      : 'rgba(255,255,255,0.05)',
                    color: isLit ? node.color : 'rgba(255,255,255,0.3)',
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {isLit ? 'AKTIF ✓' : 'MENUNGGU'}
                </div>
              </div>

              <div style={{ marginTop: 22 }}>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: isLit ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {node.title}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 22,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: showSub
                      ? 'rgba(255,255,255,0.78)'
                      : 'rgba(255,255,255,0.18)',
                    opacity: showSub ? subPop : 0.35,
                    transform: `translateY(${showSub ? (1 - subPop) * 8 : 6}px)`,
                  }}
                >
                  {node.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Connected Summary Pill */}
      <div
        style={{
          padding: '14px 30px',
          borderRadius: 999,
          backgroundColor: showSummary
            ? 'rgba(182, 240, 0, 0.16)'
            : 'rgba(255, 255, 255, 0.03)',
          border: showSummary
            ? '2px solid #B6F000'
            : '1.5px dashed rgba(255, 255, 255, 0.15)',
          color: showSummary ? '#B6F000' : 'rgba(255,255,255,0.28)',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          transform: `scale(${showSummary ? 0.9 + summarySpring * 0.1 : 0.94})`,
          opacity: showSummary ? summarySpring : 0.3,
        }}
      >
        {summaryText}
      </div>
    </div>
  );
};

export interface PipelineCheckStepperProps {
  promptText?: string;
  stepFrames?: [number, number, number, number];
  socialStartFrame?: number;
}

/**
 * 6. Prompt Typing + 4-Box Pipeline Checkmark Stepper (Naskah -> Suara -> Render -> Jadwal)
 *    + Stacked Social Schedule Bars (TikTok / Instagram / YouTube terjadwal ✓).
 */
export const PipelineCheckStepper: React.FC<PipelineCheckStepperProps> = ({
  promptText = '"Bikin video soal AI Content Engine..."',
  stepFrames = [18, 42, 68, 92],
  socialStartFrame = 108,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedLen = Math.floor(
    interpolate(frame, [0, 24], [0, promptText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const steps = [
    { label: 'Naskah', sub: 'Auto-hook', checkFrame: stepFrames[0] },
    { label: 'Suara', sub: 'Word sync', checkFrame: stepFrames[1] },
    { label: 'Render', sub: '1080×1920', checkFrame: stepFrames[2] },
    { label: 'Jadwal', sub: 'Auto-post', checkFrame: stepFrames[3] },
  ];

  const socials = [
    { name: 'TikTok', color: '#22D3EE', delay: 0 },
    { name: 'Instagram Reels', color: '#F472B6', delay: 10 },
    { name: 'YouTube Shorts', color: '#FACC15', delay: 20 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Prompt Input Bubble */}
      <div
        style={{
          padding: '22px 28px',
          borderRadius: 22,
          backgroundColor: '#131615',
          border: '1.5px solid rgba(255,255,255,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 27,
            fontWeight: 700,
            color: '#FFFFFF',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {promptText.slice(0, typedLen)}
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: 28,
              backgroundColor: '#B6F000',
              marginLeft: 6,
              verticalAlign: 'middle',
            }}
          />
        </div>
        <span
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            backgroundColor: '#B6F000',
            color: '#0A0B0A',
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          JALANKAN ↵
        </span>
      </div>

      {/* 4-Step Horizontal Checkmark Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {steps.map((st, idx) => {
          const isChecked = frame >= st.checkFrame;
          const pop = isChecked
            ? spring({
                frame: Math.max(0, frame - st.checkFrame),
                fps,
                config: { damping: 12, stiffness: 230 },
              })
            : 0;

          return (
            <div
              key={st.label}
              style={{
                padding: '24px 16px',
                borderRadius: 22,
                backgroundColor: isChecked
                  ? 'rgba(182, 240, 0, 0.08)'
                  : 'rgba(255, 255, 255, 0.015)',
                border: isChecked
                  ? '2px solid #B6F000'
                  : '2px dashed rgba(255, 255, 255, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                opacity: isChecked ? 0.4 + pop * 0.6 : 0.3,
                transform: `scale(${isChecked ? 0.94 + pop * 0.06 : 0.94})`,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  backgroundColor: isChecked ? '#B6F000' : 'transparent',
                  border: isChecked
                    ? '2px solid #B6F000'
                    : '2px dashed rgba(255,255,255,0.3)',
                  color: isChecked ? '#0A0B0A' : 'rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                {isChecked ? '✓' : idx + 1}
              </div>
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 800,
                  color: isChecked ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                }}
              >
                {st.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: isChecked ? '#B6F000' : 'rgba(255,255,255,0.28)',
                }}
              >
                {st.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stacked Social Platform Schedule Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {socials.map((soc) => {
          const trig = socialStartFrame + soc.delay;
          const active = frame >= trig;
          const sp = active
            ? spring({
                frame: Math.max(0, frame - trig),
                fps,
                config: { damping: 14, stiffness: 200 },
              })
            : 0;

          return (
            <div
              key={soc.name}
              style={{
                padding: '16px 24px',
                borderRadius: 18,
                backgroundColor: active
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.015)',
                border: active
                  ? `1.5px solid ${soc.color}88`
                  : '1.5px dashed rgba(255, 255, 255, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: active ? 0.35 + sp * 0.65 : 0.22,
                transform: `translateX(${active ? (1 - sp) * 18 : 0}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: active ? soc.color : 'rgba(255,255,255,0.2)',
                  }}
                />
                <span
                  style={{
                    fontSize: 23,
                    fontWeight: 800,
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {soc.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: active ? '#B6F000' : 'rgba(255,255,255,0.25)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {active ? 'terjadwal ✓' : 'menunggu...'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 7. Raw Footage Before/After Auto-Cut Card (MENTAH + Red Silence Cut Timeline -> DIEDIT AI)
 *    Directly inspired by @jipraks 00:24 - 00:28 scene.
 */
export const BeforeAfterFootageCard: React.FC<{ editActivateFrame?: number }> = ({
  editActivateFrame = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isEdited = frame >= editActivateFrame;
  const editSpring = isEdited
    ? spring({
        frame: Math.max(0, frame - editActivateFrame),
        fps,
        config: { damping: 13, stiffness: 200 },
      })
    : 0;

  const waveformBars = [
    0.45, 0.78, 0.62, 0.12, 0.08, 0.85, 0.92, 0.54, 0.1, 0.09, 0.74, 0.88, 0.67, 0.11, 0.82, 0.9,
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}
      >
        {/* Left: Raw Footage (MENTAH) */}
        <div
          style={{
            padding: '26px 24px',
            borderRadius: 26,
            backgroundColor: '#121312',
            border: '2px solid rgba(255,255,255,0.16)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 390,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              MENTAH · 03:40
            </span>
            <span style={{ fontSize: 16, color: '#EF4444', fontWeight: 800 }}>
              Banyak Jeda Diam
            </span>
          </div>

          {/* Simulated Raw Talking Head + Silence Gaps */}
          <div
            style={{
              height: 185,
              borderRadius: 18,
              backgroundColor: '#1B1C1B',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              filter: 'grayscale(100%)',
            }}
          >
            <div style={{ fontSize: 54 }}>🎙️</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              raw-talking-head.mp4
            </div>
          </div>

          {/* Red Silence-Cut Timeline */}
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.48)',
                marginBottom: 8,
              }}
            >
              DETEKSI JEDA DIAM (AUTO-CUT):
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 6,
                height: 48,
                padding: '8px 10px',
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.45)',
              }}
            >
              {waveformBars.map((h, i) => {
                const isSilence = h < 0.2;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(22, h * 100)}%`,
                      borderRadius: 4,
                      backgroundColor: isSilence ? '#EF4444' : 'rgba(255,255,255,0.38)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Edited Footage (DIEDIT AI) */}
        <div
          style={{
            padding: '26px 24px',
            borderRadius: 26,
            backgroundColor: isEdited ? '#141912' : 'rgba(255,255,255,0.015)',
            border: isEdited
              ? '2.5px solid #B6F000'
              : '2px dashed rgba(255,255,255,0.20)',
            boxShadow: isEdited ? '0 22px 54px rgba(182, 240, 0, 0.16)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 390,
            opacity: isEdited ? 0.35 + editSpring * 0.65 : 0.28,
            transform: `scale(${isEdited ? 0.94 + editSpring * 0.06 : 0.95})`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: '#B6F000',
                color: '#0A0B0A',
                fontSize: 16,
                fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              DIEDIT AI · 00:48
            </span>
            <span style={{ fontSize: 16, color: '#B6F000', fontWeight: 800 }}>
              100% OTOMATIS ✓
            </span>
          </div>

          {/* Vibrant Edited Preview with B-roll & Inverted Box Subtitle */}
          <div
            style={{
              height: 185,
              borderRadius: 18,
              background:
                'linear-gradient(135deg, rgba(182,240,0,0.18) 0%, rgba(59,130,246,0.22) 100%)',
              border: '1.5px solid rgba(182,240,0,0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: 'rgba(10,11,10,0.75)',
                color: '#B6F000',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              + B-ROLL ANIMASI & SFX
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Udah</span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  backgroundColor: '#FFFFFF',
                  color: '#0A0B0A',
                  padding: '3px 12px',
                  borderRadius: 8,
                  transform: 'rotate(-2deg)',
                }}
              >
                rapi!
              </span>
            </div>
          </div>

          {/* Clean Compacted Green Timeline */}
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#B6F000',
                marginBottom: 8,
              }}
            >
              JEDA TERPOTONG · SUBTITLE KARAOKE AKTIF:
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 6,
                height: 48,
                padding: '8px 10px',
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.45)',
              }}
            >
              {waveformBars
                .filter((h) => h >= 0.2)
                .map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(45, h * 100)}%`,
                      borderRadius: 4,
                      backgroundColor: '#B6F000',
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
