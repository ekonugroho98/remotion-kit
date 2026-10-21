import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { BackgroundCanvas } from '../components/BackgroundCanvas';
import { KaraokeSubtitle, PhraseTimestamp } from '../components/KaraokeSubtitle';
import { SceneHeader } from '../components/SceneHeader';
import { getStylePreset, STYLE_LIST, StyleId } from '../components/stylePresets';
import { TopHudBar } from '../components/TopHudBar';
import { TemplateStage } from './TemplateStage';

export interface StyleTemplateVideoProps {
  styleId: StyleId;
  badgeText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  accentWord?: string;
  subtitle?: string;
  stickerText?: string;
  phrases?: PhraseTimestamp[];
}

const DEFAULT_DEMO_PHRASES: PhraseTimestamp[] = [
  {
    text: 'TEMPLATE SIAP PAKAI',
    start: 0.1,
    end: 2.8,
    words: [
      { word: 'TEMPLATE', start: 0.1, end: 0.8 },
      { word: 'SIAP', start: 0.8, end: 1.5 },
      { word: 'PAKAI', start: 1.5, end: 2.2 },
      { word: 'OTOMATIS', start: 2.2, end: 2.8 },
    ],
  },
  {
    text: 'RENDER MP4 60FPS',
    start: 2.85,
    end: 5.9,
    words: [
      { word: 'LANGSUNG', start: 2.85, end: 3.5 },
      { word: 'RENDER', start: 3.5, end: 4.2 },
      { word: 'MP4', start: 4.2, end: 4.9 },
      { word: 'TAJAM', start: 4.9, end: 5.9 },
    ],
  },
];

export const StyleTemplateVideo: React.FC<StyleTemplateVideoProps> = ({
  styleId,
  badgeText,
  headlineLine1,
  headlineLine2,
  accentWord,
  subtitle,
  stickerText,
  phrases = DEFAULT_DEMO_PHRASES,
}) => {
  const preset = getStylePreset(styleId);

  const titleLines =
    headlineLine1 || headlineLine2
      ? [
          ...(headlineLine1
            ? [{ text: headlineLine1, accentWord: preset.sampleTitle[0]?.accentWord }]
            : []),
          ...(headlineLine2
            ? [{ text: headlineLine2, accentWord: accentWord || preset.sampleTitle[1]?.accentWord }]
            : []),
        ]
      : preset.sampleTitle;

  const subText = subtitle ?? preset.sampleSubtitle;

  return (
    <AbsoluteFill>
      {/* Layer 1: Dynamic Style Canvas */}
      <BackgroundCanvas styleId={preset.id} />

      {/* Layer 2: Top HUD Bar */}
      <TopHudBar
        styleId={preset.id}
        leftLabel={`${preset.id} · ${preset.category.toUpperCase()}`}
        rightLabel={preset.name}
        showFrameCounter
      />

      {/* Layer 3: Main Stage (Y: 220px - 1480px) */}
      <AbsoluteFill
        style={{
          padding: '220px 64px 250px 64px',
          justifyContent: 'flex-start',
          gap: 38,
        }}
      >
        <SceneHeader
          styleId={preset.id}
          badgeText={badgeText || preset.sampleBadge}
          titleLines={titleLines}
          subtitleLines={subText ? [{ text: subText }] : []}
        />

        <TemplateStage preset={preset} stickerText={stickerText} />
      </AbsoluteFill>

      {/* Layer 4: Single-Line Karaoke Subtitle */}
      <KaraokeSubtitle styleId={preset.id} phrases={phrases} />
    </AbsoluteFill>
  );
};

/**
 * Master Reel cycling through all 25 Style Presets (L01 - L25), 60 frames (2s) each = 1500 frames
 */
export const All25StylesReel: React.FC = () => {
  const framesPerStyle = 60;
  return (
    <AbsoluteFill>
      {STYLE_LIST.map((preset, index) => (
        <Sequence
          key={preset.id}
          from={index * framesPerStyle}
          durationInFrames={framesPerStyle}
          name={`${preset.id} - ${preset.name}`}
        >
          <StyleTemplateVideo styleId={preset.id} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
