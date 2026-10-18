import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

/**
 * 5-Stripe Diagonal Wipe Transition (Exact replica of @galihry.id's signature scene transition)
 * Duration: ~18 frames
 */
export const DiagonalStripeTransition: React.FC<{
  startFrame: number;
  durationInFrames?: number;
}> = ({ startFrame, durationInFrames = 18 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0 || local > durationInFrames) {
    return null;
  }

  const stripes = [
    '#D96B4E',
    '#EDE5D5',
    '#E07A5F',
    '#F5EFE2',
    '#C85A3D',
  ];

  return (
    <AbsoluteFill
      style={{
        zIndex: 90,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '-35%',
          top: '-25%',
          width: '170%',
          height: '150%',
          transform: 'rotate(-16deg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {stripes.map((color, idx) => {
          const offset = idx * 1.4;
          const progress = interpolate(
            local,
            [offset, durationInFrames / 2, durationInFrames - offset],
            [-110, 0, 110],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: color,
                transform: `translateX(${progress}%)`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
