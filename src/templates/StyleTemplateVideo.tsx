import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import templateDemoData from '../../public/template-demo/data.json';
import { BackgroundCanvas } from '../components/BackgroundCanvas';
import { KaraokeSubtitle, PhraseTimestamp } from '../components/KaraokeSubtitle';
import { SceneHeader } from '../components/SceneHeader';
import { getStylePreset, STYLE_LIST, StyleId } from '../components/stylePresets';
import { TopHudBar } from '../components/TopHudBar';
import { DiagonalStripeTransition } from '../components/Transitions';
import { TemplateStage } from './TemplateStage';

export interface StyleTemplateVideoProps {
  styleId: StyleId;
  badgeText?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  accentWord?: string;
  subtitle?: string;
  stickerText?: string;
  audioFile?: string;
  withAudio?: boolean;
  phrases?: PhraseTimestamp[];
}

const DEFAULT_DEMO_PHRASES: PhraseTimestamp[] =
  (templateDemoData.phrases as PhraseTimestamp[]) || [];

export const StyleTemplateVideo: React.FC<StyleTemplateVideoProps> = ({
  styleId,
  badgeText,
  headlineLine1,
  headlineLine2,
  accentWord,
  subtitle,
  stickerText,
  audioFile = 'template-demo/audio.wav',
  withAudio = true,
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
      {/* Audio Track: Voice-Over + Backsound + Entrance SFX */}
      {withAudio && (
        <>
          <Audio src={staticFile(audioFile)} volume={1.0} />
          <Audio src={staticFile('sfx/music-loop.wav')} volume={0.14} />
          <Sequence from={0} durationInFrames={35}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.26} />
          </Sequence>
          <Sequence from={12} durationInFrames={30}>
            <Audio src={staticFile('sfx/pop.wav')} volume={0.28} />
          </Sequence>
        </>
      )}

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
      <Audio src={staticFile('sfx/music-loop.wav')} volume={0.22} loop />
      {STYLE_LIST.map((preset, index) => (
        <Sequence
          key={preset.id}
          from={index * framesPerStyle}
          durationInFrames={framesPerStyle}
          name={`${preset.id} - ${preset.name}`}
        >
          <StyleTemplateVideo styleId={preset.id} withAudio={false} />
          {index > 0 && <DiagonalStripeTransition startFrame={0} durationInFrames={16} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
