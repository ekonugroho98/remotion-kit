import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';
import { ClaudeSparkIcon } from './TopHudBar';

export interface SceneHeaderProps {
  badgeText: string;
  stepNumber?: number;
  titleLines: Array<{
    text: string;
    accentWord?: string;
    highlightBox?: boolean;
    outlineWord?: string;
  }>;
  subtitleLines?: Array<{
    text: string;
    boldWords?: string[];
  }>;
  accent?: AccentTheme;
  mode?: 'dark' | 'light';
  typewriter?: boolean;
  align?: 'left' | 'center';
}

export const SceneHeader: React.FC<SceneHeaderProps> = ({
  badgeText,
  stepNumber,
  titleLines,
  subtitleLines = [],
  accent = 'coral',
  mode = 'dark',
  typewriter = false,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = ACCENT_COLORS[accent];
  const isDark = mode === 'dark';

  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  const textColor = isDark ? '#F5F4F0' : '#181816';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        gap: 22,
        width: '100%',
        fontFamily: "'Plus Jakarta Sans', 'Noto Sans KR', 'Inter', sans-serif",
      }}
    >
      {/* Step / Category Pill Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 22px',
          borderRadius: 999,
          backgroundColor: 'rgba(24, 24, 22, 0.85)',
          border: `1.5px solid ${palette.hex}66`,
          transform: `scale(${badgeSpring}) translateY(${(1 - badgeSpring) * 18}px)`,
          opacity: badgeSpring,
        }}
      >
        {stepNumber !== undefined ? (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: palette.hex,
              color: '#0F0F0E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
          </div>
        ) : (
          <ClaudeSparkIcon size={20} color={palette.hex} />
        )}
        <span
          style={{
            color: palette.hex,
            fontSize: 21,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Headline Lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : 'flex-start',
          gap: 4,
          width: '100%',
        }}
      >
        {titleLines.map((line, idx) => {
          const lineSpring = spring({
            frame: Math.max(0, frame - (idx * 5 + 4)),
            fps,
            config: { damping: 15, stiffness: 150 },
          });

          const fullText = line.text;
          const visibleChars = typewriter
            ? Math.floor(
                interpolate(frame - idx * 10, [0, 18], [0, fullText.length], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              )
            : fullText.length;

          const displayed = fullText.slice(0, visibleChars);
          const escapedAccent = line.accentWord
            ? line.accentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : '';
          const parts = escapedAccent
            ? displayed.split(new RegExp(`(${escapedAccent})`, 'i'))
            : [displayed];

          return (
            <div
              key={idx}
              style={{
                fontSize: 78,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: textColor,
                textTransform: 'uppercase',
                transform: `translateY(${(1 - lineSpring) * 28}px)`,
                opacity: lineSpring,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: align === 'center' ? 'center' : 'flex-start',
                gap: '0 18px',
              }}
            >
              {parts.map((part, pIdx) => {
                const trimmedPart = part.trim();
                if (!trimmedPart) return null;
                const isAccent =
                  line.accentWord &&
                  trimmedPart.toLowerCase() === line.accentWord.trim().toLowerCase();
                if (!isAccent) {
                  return <span key={pIdx}>{trimmedPart}</span>;
                }
                return (
                  <span
                    key={pIdx}
                    style={{
                      color: palette.hex,
                      textShadow: `0 0 24px ${palette.hex}CC, 0 0 56px ${palette.hex}77`,
                    }}
                  >
                    {trimmedPart}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Optional Kinetic Subtitle Lines (Galihry CTA / Explainer style) */}
      {subtitleLines.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: align === 'center' ? 'center' : 'flex-start',
            gap: 6,
            marginTop: 6,
          }}
        >
          {subtitleLines.map((sub, sIdx) => {
            const subSpring = spring({
              frame: Math.max(0, frame - (14 + sIdx * 6)),
              fps,
              config: { damping: 15, stiffness: 150 },
            });
            const words = sub.text.split(/\s+/);
            const boldSet = new Set((sub.boldWords || []).map((w) => w.toUpperCase()));
            return (
              <div
                key={sIdx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0 12px',
                  fontSize: 38,
                  fontWeight: 800,
                  lineHeight: 1.22,
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                  transform: `translateY(${(1 - subSpring) * 20}px)`,
                  opacity: subSpring,
                }}
              >
                {words.map((w, wIdx) => {
                  const cleanW = w.replace(/[.,!?]/g, '').toUpperCase();
                  const isBold = boldSet.has(cleanW) || boldSet.has(w.toUpperCase());
                  return (
                    <span
                      key={wIdx}
                      style={{
                        color: isBold ? '#F5F4F0' : 'rgba(245, 244, 240, 0.52)',
                      }}
                    >
                      {w}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
