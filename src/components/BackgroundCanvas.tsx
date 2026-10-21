import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CanvasPattern, getStylePreset, StyleId } from './stylePresets';

export type AccentTheme = 'coral' | 'green' | 'purple' | 'blue' | 'gold';

export const ACCENT_COLORS: Record<AccentTheme, { hex: string; glow: string; soft: string }> = {
  coral: {
    hex: '#E07A5F',
    glow: 'rgba(224, 122, 95, 0.22)',
    soft: 'rgba(224, 122, 95, 0.14)',
  },
  green: {
    hex: '#56C288',
    glow: 'rgba(86, 194, 136, 0.22)',
    soft: 'rgba(86, 194, 136, 0.14)',
  },
  purple: {
    hex: '#B07CFB',
    glow: 'rgba(176, 124, 251, 0.22)',
    soft: 'rgba(176, 124, 251, 0.14)',
  },
  blue: {
    hex: '#4DA3FF',
    glow: 'rgba(77, 163, 255, 0.22)',
    soft: 'rgba(77, 163, 255, 0.14)',
  },
  gold: {
    hex: '#F2C94C',
    glow: 'rgba(242, 201, 76, 0.22)',
    soft: 'rgba(242, 201, 76, 0.14)',
  },
};

export interface BackgroundCanvasProps {
  mode?: 'dark' | 'light';
  accent?: AccentTheme;
  pattern?: CanvasPattern;
  styleId?: StyleId;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  mode,
  accent = 'coral',
  pattern,
  styleId,
}) => {
  const frame = useCurrentFrame();
  const preset = styleId ? getStylePreset(styleId) : undefined;
  const qFrame = preset?.steppedFrames
    ? Math.floor(frame / preset.steppedFrames) * preset.steppedFrames
    : frame;

  const breath = interpolate(Math.sin(qFrame / 28), [-1, 1], [0.92, 1.08]);
  const driftX = interpolate(Math.cos(qFrame / 45), [-1, 1], [-24, 24]);
  const driftY = interpolate(Math.sin(qFrame / 38), [-1, 1], [-28, 28]);

  const resolvedMode = mode ?? preset?.mode ?? 'dark';
  const isDark = resolvedMode === 'dark';
  const resolvedPattern: CanvasPattern = pattern ?? preset?.pattern ?? 'dots';

  const palette = preset
    ? { hex: preset.accentHex, glow: preset.accentGlow, soft: preset.accentSoft }
    : ACCENT_COLORS[accent];

  const bgBase = preset ? preset.bgBase : isDark ? '#0F0F0E' : '#F4F1EA';
  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.055)' : 'rgba(24, 24, 22, 0.075)';
  const dotColor = isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(24, 24, 22, 0.13)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgBase,
        overflow: 'hidden',
      }}
    >
      {/* Pattern Layer */}
      {resolvedPattern === 'dots' && (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${dotColor} 1.7px, transparent 1.7px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: '18px 18px',
          }}
        />
      )}

      {resolvedPattern === 'grid' && (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(to right, ${strokeColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${strokeColor} 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
      )}

      {resolvedPattern === 'diagonal' && (
        <AbsoluteFill
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, ${strokeColor} 0px, ${strokeColor} 1.5px, transparent 1.5px, transparent 28px)`,
          }}
        />
      )}

      {resolvedPattern === 'cross' && (
        <AbsoluteFill
          style={{
            backgroundImage: `
              radial-gradient(${dotColor} 2px, transparent 2px),
              linear-gradient(to right, ${strokeColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${strokeColor} 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px, 96px 96px, 96px 96px',
          }}
        />
      )}

      {resolvedPattern === 'editorial-lines' && (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(to right, ${strokeColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${strokeColor} 1.5px, transparent 1.5px)
            `,
            backgroundSize: '270px 100%, 100% 160px',
          }}
        />
      )}

      {resolvedPattern === 'rings' && (
        <AbsoluteFill
          style={{
            backgroundImage: `repeating-radial-gradient(circle at 50% 48%, ${strokeColor} 0px, ${strokeColor} 1.5px, transparent 1.5px, transparent 92px)`,
          }}
        />
      )}

      {/* Center Radial Spotlight */}
      <div
        style={{
          position: 'absolute',
          width: 980,
          height: 980,
          left: '50%',
          top: '46%',
          transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(${breath})`,
          borderRadius: '50%',
          background: isDark
            ? `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(255,255,255,0.78) 0%, ${palette.soft} 38%, transparent 72%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Vignette */}
      <AbsoluteFill
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, transparent 58%, rgba(0,0,0,0.56) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 64%, rgba(0,0,0,0.07) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
