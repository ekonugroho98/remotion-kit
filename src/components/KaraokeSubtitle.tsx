import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';
import { getStylePreset, StyleId } from './stylePresets';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface PhraseTimestamp {
  text: string;
  start: number;
  end: number;
  words: WordTimestamp[];
}

export interface KaraokeSubtitleProps {
  phrases: PhraseTimestamp[];
  accent?: AccentTheme;
  mode?: 'dark' | 'light';
  styleId?: StyleId;
}

export const KaraokeSubtitle: React.FC<KaraokeSubtitleProps> = ({
  phrases,
  accent = 'coral',
  mode,
  styleId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = styleId ? getStylePreset(styleId) : undefined;
  const currentTime = frame / fps;

  const resolvedMode = mode ?? preset?.mode ?? 'dark';
  const isDark = resolvedMode === 'dark';
  const accentHex = preset ? preset.accentHex : ACCENT_COLORS[accent].hex;

  const activePhrase = phrases.find(
    (p) => currentTime >= p.start - 0.08 && currentTime <= p.end + 0.18
  );

  if (!activePhrase) {
    return null;
  }

  const phraseStartFrame = Math.round(activePhrase.start * fps);
  const enter = spring({
    frame: Math.max(0, frame - phraseStartFrame),
    fps,
    config: preset ? preset.springConfig : { damping: 16, stiffness: 180 },
  });

  const pillBg = preset
    ? preset.cardBg
    : isDark
    ? 'rgba(20, 20, 18, 0.9)'
    : 'rgba(255, 255, 255, 0.94)';
  const pillBorder = preset
    ? preset.cardBorder
    : isDark
    ? 'rgba(255, 255, 255, 0.14)'
    : 'rgba(24, 24, 22, 0.16)';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 165,
        left: 56,
        right: 56,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        transform: `translateY(${(1 - enter) * 18}px)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: '0 20px',
          padding: '16px 34px',
          borderRadius: preset && preset.cardRadius <= 12 ? 12 : 999,
          backgroundColor: pillBg,
          border: `${preset?.borderWidth || 1.5}px solid ${pillBorder}`,
          boxShadow: preset?.hardShadow
            ? `6px 6px 0px ${preset.textPrimary}`
            : isDark
            ? '0 14px 36px rgba(0,0,0,0.45)'
            : '0 12px 30px rgba(0,0,0,0.1)',
          maxWidth: 960,
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans KR', sans-serif",
        }}
      >
        {activePhrase.words.slice(0, 4).map((w, idx) => {
          const isSpeaking = currentTime >= w.start - 0.04 && currentTime <= w.end + 0.08;
          const isPast = currentTime > w.end + 0.08;

          const wordStartFrame = Math.round(w.start * fps);
          const wordPop = isSpeaking
            ? spring({
                frame: Math.max(0, frame - wordStartFrame),
                fps,
                config: { damping: 12, stiffness: 220 },
              })
            : 0;

          const activeColor = preset ? preset.textPrimary : isDark ? '#F5F4F0' : '#181816';
          const dimColor = preset
            ? preset.textMuted
            : isDark
            ? 'rgba(255,255,255,0.36)'
            : 'rgba(24,24,22,0.42)';

          return (
            <span
              key={`${w.word}-${idx}`}
              style={{
                display: 'inline-block',
                fontSize: 40,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: isSpeaking ? accentHex : isPast ? activeColor : dimColor,
                transform: `translateY(${-wordPop * 5}px) scale(${1 + wordPop * 0.05})`,
                textShadow:
                  isSpeaking && isDark ? `0 0 20px ${accentHex}88` : 'none',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
