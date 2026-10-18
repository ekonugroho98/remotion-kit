import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

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
  pattern?: 'dots' | 'grid';
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  mode = 'dark',
  accent = 'coral',
  pattern = 'dots',
}) => {
  const frame = useCurrentFrame();
  const breath = interpolate(Math.sin(frame / 28), [-1, 1], [0.92, 1.08]);
  const driftX = interpolate(Math.cos(frame / 45), [-1, 1], [-24, 24]);
  const driftY = interpolate(Math.sin(frame / 38), [-1, 1], [-28, 28]);

  const palette = ACCENT_COLORS[accent];
  const isDark = mode === 'dark';

  const bgBase = isDark ? '#0F0F0E' : '#F4F1EA';
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(24, 24, 22, 0.06)';
  const dotColor = isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(24, 24, 22, 0.12)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgBase,
        overflow: 'hidden',
      }}
    >
      {/* Pattern Layer */}
      {pattern === 'dots' ? (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${dotColor} 1.6px, transparent 1.6px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: '18px 18px',
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridStroke} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridStroke} 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />
      )}

      {/* Center Warm Radial Glow */}
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
            ? `radial-gradient(circle, ${palette.glow} 0%, rgba(224,122,95,0.05) 45%, transparent 72%)`
            : `radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(244,241,234,0) 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Vignette */}
      <AbsoluteFill
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, transparent 58%, rgba(0,0,0,0.58) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 62%, rgba(0,0,0,0.08) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
