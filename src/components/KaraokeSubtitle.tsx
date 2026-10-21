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
  variant?: 'pill' | 'inverted-box';
  highlightBg?: string;
  highlightText?: string;
  bottomOffset?: number;
}

function chunkIntoShortPhrases(phrases: PhraseTimestamp[], maxWords = 3): PhraseTimestamp[] {
  const result: PhraseTimestamp[] = [];
  for (const p of phrases) {
    const words = p.words || [];
    if (words.length <= maxWords) {
      result.push(p);
      continue;
    }
    for (let i = 0; i < words.length; i += maxWords) {
      const slice = words.slice(i, i + maxWords);
      if (slice.length === 0) continue;
      result.push({
        text: slice.map((w) => w.word).join(' '),
        start: slice[0].start,
        end: slice[slice.length - 1].end,
        words: slice,
      });
    }
  }
  return result;
}

export const KaraokeSubtitle: React.FC<KaraokeSubtitleProps> = ({
  phrases,
  accent = 'coral',
  mode,
  styleId,
  variant = 'pill',
  highlightBg,
  highlightText,
  bottomOffset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = styleId ? getStylePreset(styleId) : undefined;
  const currentTime = frame / fps;

  const resolvedMode = mode ?? preset?.mode ?? 'dark';
  const isDark = resolvedMode === 'dark';
  const accentHex = preset ? preset.accentHex : ACCENT_COLORS[accent].hex;

  const effectivePhrases =
    variant === 'inverted-box' ? chunkIntoShortPhrases(phrases, 3) : phrases;

  const activePhrase = effectivePhrases.find(
    (p) => currentTime >= p.start - 0.06 && currentTime <= p.end + 0.14
  );

  if (!activePhrase) {
    return null;
  }

  const phraseStartFrame = Math.round(activePhrase.start * fps);
  const enter = spring({
    frame: Math.max(0, frame - phraseStartFrame),
    fps,
    config: preset ? preset.springConfig : { damping: 16, stiffness: 190 },
  });

  if (variant === 'inverted-box') {
    const boxBg = highlightBg || (isDark ? '#FFFFFF' : '#141413');
    const boxFg = highlightText || (isDark ? '#0A0B0A' : '#FFFFFF');
    const baseTextColor = isDark ? '#FFFFFF' : '#141413';

    return (
      <div
        style={{
          position: 'absolute',
          bottom: bottomOffset ?? 360,
          left: 48,
          right: 48,
          zIndex: 60,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          transform: `translateY(${(1 - enter) * 14}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px 16px',
            maxWidth: 960,
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}
        >
          {(() => {
            const wordsToShow = activePhrase.words.slice(0, 3);
            let activeIdx = wordsToShow.findIndex(
              (w) => currentTime >= w.start && currentTime < w.end
            );
            if (activeIdx === -1) {
              activeIdx = wordsToShow.findIndex(
                (w) => currentTime >= w.start - 0.05 && currentTime <= w.end + 0.08
              );
            }
            return wordsToShow.map((w, idx) => {
              const isSpeaking = idx === activeIdx;
              const wordStartFrame = Math.round(w.start * fps);
              const wordPop = isSpeaking
                ? spring({
                    frame: Math.max(0, frame - wordStartFrame),
                    fps,
                    config: { damping: 12, stiffness: 240 },
                  })
                : 0;

              return (
                <span
                  key={`${w.word}-${idx}`}
                  style={{
                    display: 'inline-block',
                    fontSize: 50,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    padding: isSpeaking ? '6px 18px' : '6px 4px',
                    borderRadius: 12,
                    backgroundColor: isSpeaking ? boxBg : 'transparent',
                    color: isSpeaking ? boxFg : baseTextColor,
                    boxShadow: isSpeaking
                      ? '0 10px 28px rgba(0, 0, 0, 0.42)'
                      : 'none',
                    textShadow:
                      !isSpeaking && isDark
                        ? '0 4px 18px rgba(0, 0, 0, 0.75)'
                        : 'none',
                    transform: isSpeaking
                      ? `translateY(${-wordPop * 4}px) scale(${1 + wordPop * 0.05}) rotate(-1.5deg)`
                      : 'none',
                  }}
                >
                  {w.word}
                </span>
              );
            });
          })()}
        </div>
      </div>
    );
  }

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
