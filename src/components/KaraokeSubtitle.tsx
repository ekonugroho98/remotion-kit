import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ACCENT_COLORS, AccentTheme } from './BackgroundCanvas';

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
}

export const KaraokeSubtitle: React.FC<KaraokeSubtitleProps> = ({
  phrases,
  accent = 'coral',
  mode = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const palette = ACCENT_COLORS[accent];
  const isDark = mode === 'dark';

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
    config: { damping: 16, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 150,
        left: 64,
        right: 64,
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
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: '10px 22px',
          maxWidth: 960,
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans KR', sans-serif",
        }}
      >
        {activePhrase.words.map((w, idx) => {
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

          const activeColor = isDark ? '#F5F4F0' : '#181816';
          const dimColor = isDark ? 'rgba(255,255,255,0.26)' : 'rgba(24,24,22,0.32)';

          return (
            <span
              key={`${w.word}-${idx}`}
              style={{
                display: 'inline-block',
                fontSize: 44,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: isSpeaking ? palette.hex : isPast ? activeColor : dimColor,
                transform: `translateY(${-wordPop * 6}px) scale(${1 + wordPop * 0.05})`,
                textShadow: isSpeaking ? `0 0 24px ${palette.hex}99` : 'none',
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
