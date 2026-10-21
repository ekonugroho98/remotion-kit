import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';
import { getStylePreset, StyleId } from './stylePresets';
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
  styleId?: StyleId;
  typewriter?: boolean;
  align?: 'left' | 'center';
}

export const SceneHeader: React.FC<SceneHeaderProps> = ({
  badgeText,
  stepNumber,
  titleLines,
  subtitleLines = [],
  accent = 'coral',
  mode,
  styleId,
  typewriter = false,
  align = 'left',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = styleId ? getStylePreset(styleId) : undefined;
  const qFrame = preset?.steppedFrames
    ? Math.floor(frame / preset.steppedFrames) * preset.steppedFrames
    : frame;

  const resolvedMode = mode ?? preset?.mode ?? 'dark';
  const isDark = resolvedMode === 'dark';
  const accentHex = preset ? preset.accentHex : ACCENT_COLORS[accent].hex;
  const textColor = preset ? preset.textPrimary : isDark ? '#F5F4F0' : '#181816';
  const mutedTextColor = preset
    ? preset.textMuted
    : isDark
    ? 'rgba(245, 244, 240, 0.62)'
    : 'rgba(24, 24, 22, 0.65)';

  const badgeSpring = spring({
    frame: qFrame,
    fps,
    config: preset ? preset.springConfig : { damping: 14, stiffness: 160 },
  });

  const badgeBg = preset
    ? preset.cardBg
    : isDark
    ? 'rgba(24, 24, 22, 0.9)'
    : 'rgba(255, 255, 255, 0.94)';
  const badgeRadius = preset && preset.cardRadius <= 12 ? 8 : 999;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        gap: 20,
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
          borderRadius: badgeRadius,
          backgroundColor: badgeBg,
          border: `${preset?.borderWidth || 1.5}px solid ${
            preset?.hardShadow ? preset.textPrimary : `${accentHex}77`
          }`,
          boxShadow: preset?.hardShadow ? `4px 4px 0px ${preset.textPrimary}` : 'none',
          transform: `scale(${badgeSpring}) translateY(${(1 - badgeSpring) * 18}px)`,
          opacity: badgeSpring,
        }}
      >
        {stepNumber !== undefined ? (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: badgeRadius === 8 ? 6 : '50%',
              backgroundColor: accentHex,
              color: isDark ? '#0F0F0E' : '#FFFFFF',
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
          <ClaudeSparkIcon size={20} color={accentHex} spin={!preset?.steppedFrames} />
        )}
        <span
          style={{
            color: accentHex,
            fontSize: 21,
            fontWeight: 800,
            letterSpacing: '0.11em',
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
            frame: Math.max(0, qFrame - (idx * 5 + 4)),
            fps,
            config: preset ? preset.springConfig : { damping: 15, stiffness: 150 },
          });

          const fullText = line.text;
          const visibleChars = typewriter
            ? Math.floor(
                interpolate(qFrame - idx * 10, [0, 18], [0, fullText.length], {
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
                fontSize: 76,
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
                      color: accentHex,
                      textShadow: isDark
                        ? `0 0 22px ${accentHex}AA, 0 0 48px ${accentHex}55`
                        : 'none',
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

      {/* Optional Subtitle Lines */}
      {subtitleLines.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: align === 'center' ? 'center' : 'flex-start',
            gap: 6,
            marginTop: 4,
          }}
        >
          {subtitleLines.map((sub, sIdx) => {
            const subSpring = spring({
              frame: Math.max(0, qFrame - (12 + sIdx * 6)),
              fps,
              config: preset ? preset.springConfig : { damping: 15, stiffness: 150 },
            });
            const words = sub.text.split(/\s+/);
            const boldSet = new Set((sub.boldWords || []).map((w) => w.toUpperCase()));
            return (
              <div
                key={sIdx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0 10px',
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1.32,
                  color: mutedTextColor,
                  transform: `translateY(${(1 - subSpring) * 18}px)`,
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
                        color: isBold ? textColor : mutedTextColor,
                        fontWeight: isBold ? 800 : 600,
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
