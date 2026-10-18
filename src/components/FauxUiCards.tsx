import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';
import { ClaudeSparkIcon } from './TopHudBar';

/**
 * Reusable Window Card with macOS traffic lights & optional 3D perspective tilt
 */
export const WindowCard: React.FC<{
  title?: string;
  accent?: AccentTheme;
  mode?: 'dark' | 'light';
  tilt3D?: boolean;
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  title = 'TERMINAL',
  accent = 'coral',
  mode = 'dark',
  tilt3D = false,
  delay = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const palette = ACCENT_COLORS[accent];
  const isDark = mode === 'dark';

  const rotateX = tilt3D ? interpolate(pop, [0, 1], [18, 4]) : 0;
  const rotateY = tilt3D ? interpolate(Math.sin(localFrame / 35), [-1, 1], [-3, 3]) : 0;

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 24,
        backgroundColor: isDark ? '#181816' : '#FFFFFF',
        border: `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(24,24,22,0.1)'}`,
        boxShadow: isDark
          ? `0 28px 64px rgba(0,0,0,0.65), 0 0 0 1px ${palette.hex}22`
          : '0 24px 56px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${
          0.9 + 0.1 * pop
        }) translateY(${(1 - pop) * 36}px)`,
        opacity: pop,
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        ...style,
      }}
    >
      {/* Window Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 26px',
          backgroundColor: isDark ? '#20201D' : '#F4F2EC',
          borderBottom: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#EB5757' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#F2C94C' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27AE60' }} />
          <span
            style={{
              marginLeft: 12,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 99,
            backgroundColor: palette.soft,
            color: palette.hex,
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          LIVE
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: 32 }}>{children}</div>
    </div>
  );
};

/**
 * Claude Prompt Box with realistic typing & animated parameter chips
 */
export const PromptInputCard: React.FC<{
  promptText: string;
  chips?: Array<{ label: string; accent?: AccentTheme }>;
  accent?: AccentTheme;
  startFrame?: number;
}> = ({ promptText, chips = [], accent = 'coral', startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);
  const palette = ACCENT_COLORS[accent];

  const enter = spring({ frame: localFrame, fps, config: { damping: 15, stiffness: 150 } });
  const typedCount = Math.floor(
    interpolate(localFrame, [6, 52], [0, promptText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const cursorBlink = Math.floor(localFrame / 8) % 2 === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        width: '100%',
        transform: `scale(${0.92 + 0.08 * enter}) translateY(${(1 - enter) * 28}px)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          borderRadius: 24,
          backgroundColor: '#181816',
          border: `2px solid ${palette.hex}88`,
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 36px ${palette.glow}`,
          padding: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ClaudeSparkIcon size={24} color={palette.hex} />
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#F5F4F0',
                letterSpacing: '0.06em',
              }}
            >
              ANTIGRAVITY AGENT
            </span>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.1em',
            }}
          >
            PROMPT.TXT
          </span>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.42,
            color: '#F5F4F0',
            minHeight: 160,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {promptText.slice(0, typedCount)}
          {cursorBlink && (
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 32,
                backgroundColor: palette.hex,
                marginLeft: 6,
                verticalAlign: 'middle',
              }}
            />
          )}
        </div>
      </div>

      {/* Parameter Chips (Galihry Slanted Solid Blocks) */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {chips.map((chip, idx) => {
            const chipPop = spring({
              frame: Math.max(0, localFrame - (14 + idx * 5)),
              fps,
              config: { damping: 13, stiffness: 180 },
            });
            const isBlueChip = idx === chips.length - 1;
            const bgHex = isBlueChip ? '#7CA6D8' : '#E2DBC8';
            return (
              <div
                key={chip.label}
                style={{
                  padding: '8px 18px',
                  borderRadius: 4,
                  backgroundColor: bgHex,
                  color: '#141413',
                  fontSize: 25,
                  fontWeight: 900,
                  fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: '0.02em',
                  transform: `scale(${chipPop}) skewX(-8deg)`,
                  opacity: chipPop,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                }}
              >
                {chip.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Tilted Floating Sticker Badge (e.g. "WAJIB!", "TANPA NGODING!", "OTOMATIS!")
 */
export const FloatingSticker: React.FC<{
  text: string;
  accent?: AccentTheme;
  rotateDeg?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, accent = 'gold', rotateDeg = -5, delay = 15, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 11, stiffness: 190 },
  });
  const palette = ACCENT_COLORS[accent];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '10px 24px',
        borderRadius: 12,
        backgroundColor: palette.hex,
        color: '#0F0F0E',
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 12px 28px rgba(0,0,0,0.38)',
        transform: `scale(${pop}) rotate(${rotateDeg}deg)`,
        opacity: pop,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/**
 * Animated SVG Mouse Cursor with Click Ripple
 */
export const AnimatedCursor: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  moveStartFrame?: number;
  clickFrame?: number;
  accent?: AccentTheme;
}> = ({
  fromX,
  fromY,
  toX,
  toY,
  moveStartFrame = 10,
  clickFrame = 32,
  accent = 'coral',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moveProgress = spring({
    frame: Math.max(0, frame - moveStartFrame),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const x = interpolate(moveProgress, [0, 1], [fromX, toX]);
  const y = interpolate(moveProgress, [0, 1], [fromY, toY]);

  const isClicking = frame >= clickFrame && frame <= clickFrame + 12;
  const clickScale = isClicking
    ? interpolate(frame - clickFrame, [0, 4, 12], [1, 0.82, 1], {
        extrapolateRight: 'clamp',
      })
    : 1;

  const rippleProgress =
    frame >= clickFrame
      ? interpolate(frame - clickFrame, [0, 18], [0, 1], {
          extrapolateRight: 'clamp',
        })
      : 0;

  const palette = ACCENT_COLORS[accent];

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      {/* Click Ripple Ring */}
      {rippleProgress > 0 && rippleProgress < 1 && (
        <div
          style={{
            position: 'absolute',
            left: -28,
            top: -28,
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: `3px solid ${palette.hex}`,
            transform: `scale(${0.4 + rippleProgress * 1.6})`,
            opacity: 1 - rippleProgress,
          }}
        />
      )}

      {/* Cursor Arrow SVG */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${clickScale})`,
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))',
        }}
      >
        <path
          d="M4 3L11.5 20L14.2 13.5L20.5 11L4 3Z"
          fill="#FFFFFF"
          stroke="#121210"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
