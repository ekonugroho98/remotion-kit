import React from 'react';
import { Composition, Folder } from 'remotion';
import showcaseData from '../public/karaya-showcase/data.json';
import { STYLE_LIST } from './components/stylePresets';
import { KarayaShowcaseVideo } from './karaya-showcase/KarayaShowcaseVideo';
import {
  All25StylesReel,
  StyleTemplateVideo,
  StyleTemplateVideoProps,
} from './templates/StyleTemplateVideo';

const TypedStyleTemplateVideo = StyleTemplateVideo as unknown as React.FC<
  Record<string, unknown>
>;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Full Multi-Scene Showcase Video with Voice-Over & Karaoke */}
      <Composition
        id="KarayaShowcase"
        component={KarayaShowcaseVideo}
        durationInFrames={showcaseData.durationInFrames || 1062}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 2. Master Reel of All 25 Style Presets (L01 - L25) */}
      <Composition
        id="All25StylesReel"
        component={All25StylesReel}
        durationInFrames={STYLE_LIST.length * 60}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3. Folder of All 25 Individual Style Templates (L01 - L25) */}
      <Folder name="Templates-L01-L25">
        {STYLE_LIST.map((preset) => {
          const defaultProps: StyleTemplateVideoProps = {
            styleId: preset.id,
            badgeText: preset.sampleBadge,
            headlineLine1: preset.sampleTitle[0]?.text || preset.name,
            headlineLine2: preset.sampleTitle[1]?.text || '',
            accentWord: preset.sampleTitle[1]?.accentWord || '',
            subtitle: preset.sampleSubtitle,
            stickerText: preset.sampleSticker,
          };
          return (
            <Composition
              key={preset.id}
              id={`${preset.id}-${preset.slug}`}
              component={TypedStyleTemplateVideo}
              durationInFrames={180}
              fps={30}
              width={1080}
              height={1920}
              defaultProps={defaultProps as unknown as Record<string, unknown>}
            />
          );
        })}
      </Folder>
    </>
  );
};
