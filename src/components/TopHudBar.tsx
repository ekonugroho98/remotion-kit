import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';

export const ClaudeSparkIcon: React.FC<{
  size?: number;
  color?: string;
  spin?: boolean;
}> = ({ size = 24, color = '#E07A5F', spin = true }) => {
  const frame = useCurrentFrame();
  const rot = spin ? frame * 1.6 : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        transform: `rotate(${rot}deg)`,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const len = i % 2 === 0 ? 9.5 : 7.2;
        return (
          <line
            key={i}
            x1="12"
            y1="12"
            x2="12"
            y2={12 - len}
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
            transform={`rotate(${angle} 12 12)`}
          />
        );
      })}
    </svg>
  );
};

export interface TopHudBarProps {
  leftLabel?: string;
  rightLabel?: string;
  showFrameCounter?: boolean;
  accent?: AccentTheme;
  mode?: 'dark' | 'light';
  steps?: string[];
  activeStepIndex?: number;
}

export const TopHudBar: React.FC<TopHudBarProps> = ({
  leftLabel = 'REMOTION × ANTIGRAVITY',
  rightLabel = 'KARAYA STUDIO',
  showFrameCounter = false,
  accent = 'coral',
  mode = 'dark',
  steps,
  activeStepIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const palette = ACCENT_COLORS[accent];
  const isDark = mode === 'dark';

  const pillBg = isDark ? 'rgba(28, 28, 26, 0.88)' : 'rgba(255, 255, 255, 0.92)';
  const pillBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(24, 24, 22, 0.12)';
  const textColor = isDark ? '#F5F4F0' : '#181816';

  return (
    <div
      style={{
        position: 'absolute',
        top: 64,
        left: 56,
        right: 56,
        zIndex: 40,
        transform: `translateY(${(1 - enter) * -30}px)`,
        opacity: enter,
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            borderRadius: 999,
            backgroundColor: pillBg,
            border: `1.5px solid ${pillBorder}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          }}
        >
          <ClaudeSparkIcon size={22} color={palette.hex} />
          <span
            style={{
              color: textColor,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {leftLabel}
          </span>
        </div>

        {/* Right Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            borderRadius: 999,
            backgroundColor: pillBg,
            border: `1.5px solid ${palette.hex}55`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          }}
        >
          <ClaudeSparkIcon size={20} color={palette.hex} />
          <span
            style={{
              color: textColor,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontFamily: showFrameCounter ? "'JetBrains Mono', monospace" : 'inherit',
            }}
          >
            {showFrameCounter ? `FRAME ${String(frame).padStart(4, '0')}` : rightLabel}
          </span>
        </div>
      </div>

      {/* Optional 5-Step Progress Bar (Gaya @galihry.id Behind The Scenes) */}
      {steps && steps.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
            gap: 12,
            marginTop: 24,
          }}
        >
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isDone = idx < activeStepIndex;
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    height: 6,
                    borderRadius: 99,
                    backgroundColor: isActive
                      ? palette.hex
                      : isDone
                      ? `${palette.hex}88`
                      : isDark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.12)',
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: isActive
                      ? palette.hex
                      : isDone
                      ? isDark
                        ? 'rgba(255,255,255,0.75)'
                        : 'rgba(0,0,0,0.7)'
                      : isDark
                      ? 'rgba(255,255,255,0.35)'
                      : 'rgba(0,0,0,0.35)',
                    textTransform: 'uppercase',
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
