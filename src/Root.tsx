import React from 'react';
import { Composition } from 'remotion';
import showcaseData from '../public/karaya-showcase/data.json';
import { KarayaShowcaseVideo } from './karaya-showcase/KarayaShowcaseVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KarayaShowcase"
        component={KarayaShowcaseVideo}
        durationInFrames={showcaseData.durationInFrames || 1062}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
