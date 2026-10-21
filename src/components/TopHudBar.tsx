import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';
import { getStylePreset, StyleId } from './stylePresets';

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
  styleId?: StyleId;
  steps?: string[];
  activeStepIndex?: number;
}

export const TopHudBar: React.FC<TopHudBarProps> = ({
  leftLabel = 'REMOTION × ANTIGRAVITY',
  rightLabel = 'KARAYA STUDIO',
  showFrameCounter = false,
  accent = 'coral',
  mode,
  styleId,
  steps,
  activeStepIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = styleId ? getStylePreset(styleId) : undefined;
  const qFrame = preset?.steppedFrames
    ? Math.floor(frame / preset.steppedFrames) * preset.steppedFrames
    : frame;

  const enter = spring({
    frame: qFrame,
    fps,
    config: preset ? preset.springConfig : { damping: 16, stiffness: 140 },
  });

  const resolvedMode = mode ?? preset?.mode ?? 'dark';
  const isDark = resolvedMode === 'dark';
  const accentHex = preset ? preset.accentHex : ACCENT_COLORS[accent].hex;

  const pillBg = preset
    ? preset.cardBg
    : isDark
    ? 'rgba(28, 28, 26, 0.92)'
    : 'rgba(255, 255, 255, 0.95)';
  const pillBorder = preset
    ? preset.cardBorder
    : isDark
    ? 'rgba(255, 255, 255, 0.14)'
    : 'rgba(24, 24, 22, 0.16)';
  const textColor = preset ? preset.textPrimary : isDark ? '#F5F4F0' : '#181816';
  const radius = preset && preset.cardRadius <= 12 ? 10 : 999;
  const shadow = preset?.hardShadow
    ? `4px 4px 0px ${preset.textPrimary}`
    : isDark
    ? '0 8px 24px rgba(0,0,0,0.28)'
    : '0 6px 20px rgba(0,0,0,0.08)';

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
            borderRadius: radius,
            backgroundColor: pillBg,
            border: `${preset?.borderWidth || 1.5}px solid ${pillBorder}`,
            boxShadow: shadow,
          }}
        >
          <ClaudeSparkIcon size={22} color={accentHex} spin={!preset?.steppedFrames} />
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
            borderRadius: radius,
            backgroundColor: pillBg,
            border: `${preset?.borderWidth || 1.5}px solid ${
              preset?.hardShadow ? preset.textPrimary : `${accentHex}66`
            }`,
            boxShadow: shadow,
          }}
        >
          <ClaudeSparkIcon size={20} color={accentHex} spin={!preset?.steppedFrames} />
          <span
            style={{
              color: textColor,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '0.06em',
              fontFamily: showFrameCounter ? "'JetBrains Mono', monospace" : 'inherit',
            }}
          >
            {showFrameCounter ? `FRAME ${String(qFrame).padStart(4, '0')}` : rightLabel}
          </span>
        </div>
      </div>

      {/* Optional Step Progress Bar */}
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
                      ? accentHex
                      : isDone
                      ? `${accentHex}88`
                      : isDark
                      ? 'rgba(255,255,255,0.14)'
                      : 'rgba(0,0,0,0.14)',
                  }}
                />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: isActive
                      ? accentHex
                      : isDone
                      ? isDark
                        ? 'rgba(255,255,255,0.75)'
                        : 'rgba(0,0,0,0.75)'
                      : isDark
                      ? 'rgba(255,255,255,0.42)'
                      : 'rgba(0,0,0,0.45)',
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
