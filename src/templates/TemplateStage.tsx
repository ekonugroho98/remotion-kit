import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedCursor } from '../components/FauxUiCards';
import { StylePreset } from '../components/stylePresets';

export interface TemplateStageProps {
  preset: StylePreset;
  items?: Array<{ label: string; value: string; sub: string }>;
  stickerText?: string;
}

const StageFooterStrip: React.FC<{
  preset: StylePreset;
  frame: number;
  fps: number;
  sticker: string;
}> = ({ preset, frame, fps, sticker }) => {
  const enter = spring({
    frame: Math.max(0, frame - 26),
    fps,
    config: preset.springConfig,
  });
  const isDark = preset.mode === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 26px',
        borderRadius: preset.cardRadius <= 12 ? 10 : 18,
        backgroundColor: preset.cardBg,
        border: `${preset.borderWidth}px solid ${
          preset.hardShadow ? preset.textPrimary : preset.cardBorder
        }`,
        boxShadow: preset.hardShadow
          ? `6px 6px 0px ${preset.textPrimary}`
          : isDark
          ? '0 14px 32px rgba(0,0,0,0.42)'
          : '0 10px 26px rgba(0,0,0,0.07)',
        transform: `translateY(${(1 - enter) * 20}px)`,
        opacity: enter,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            backgroundColor: preset.accentHex,
            color: isDark ? '#0F0F0E' : '#FFFFFF',
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: '0.08em',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {preset.id} · {preset.category.toUpperCase()}
        </div>
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: preset.textPrimary,
          }}
        >
          {preset.tags}
        </span>
      </div>

      {/* Mini Live Audio Bars + Sticker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: ' center', gap: 5, height: 24 }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const h = interpolate(Math.sin(frame / 4 + i * 0.9), [-1, 1], [8, 24]);
            return (
              <div
                key={i}
                style={{
                  width: 4,
                  height: h,
                  borderRadius: 99,
                  backgroundColor: preset.accentHex,
                  alignSelf: 'center',
                }}
              />
            );
          })}
        </div>
        <span
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: preset.accentHex,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {sticker}
        </span>
      </div>
    </div>
  );
};

export const TemplateStage: React.FC<TemplateStageProps> = ({
  preset,
  items,
  stickerText,
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = preset.steppedFrames
    ? Math.floor(rawFrame / preset.steppedFrames) * preset.steppedFrames
    : rawFrame;

  const stageItems = items && items.length > 0 ? items : preset.sampleItems;
  const sticker = stickerText ?? preset.sampleSticker;
  const isDark = preset.mode === 'dark';

  const cardShadow = preset.hardShadow
    ? `8px 8px 0px ${preset.textPrimary}`
    : isDark
    ? `0 26px 58px rgba(0,0,0,0.58), 0 0 0 1px ${preset.accentHex}22`
    : '0 22px 48px rgba(0,0,0,0.1)';

  // 1. ARCHETYPE: FAUX-UI (L01, L14)
  if (preset.archetype === 'faux-ui') {
    const winPop = spring({
      frame: Math.max(0, frame - 8),
      fps,
      config: preset.springConfig,
    });
    const rotX = preset.tilt3D ? interpolate(winPop, [0, 1], [14, 3]) : 0;
    const rotY = preset.tilt3D ? interpolate(Math.sin(frame / 36), [-1, 1], [-2.5, 2.5]) : 0;

    return (
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            borderRadius: preset.cardRadius,
            backgroundColor: preset.cardBg,
            border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
            boxShadow: cardShadow,
            overflow: 'hidden',
            transform: `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${0.92 + 0.08 * winPop})`,
            opacity: winPop,
          }}
        >
          {/* Window Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 26px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.035)',
              borderBottom: `1.5px solid ${preset.cardBorder}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#EB5757' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#F2C94C' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27AE60' }} />
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: preset.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {preset.id} · {preset.slug}.tsx
              </span>
            </div>
            <div
              style={{
                padding: '5px 14px',
                borderRadius: 99,
                backgroundColor: preset.accentSoft,
                color: preset.accentHex,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              READY
            </div>
          </div>

          {/* Items Inside Window */}
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stageItems.map((it, idx) => {
              const rowPop = spring({
                frame: Math.max(0, frame - (14 + idx * 6)),
                fps,
                config: preset.springConfig,
              });
              const isHighlighted = idx === stageItems.length - 1;
              return (
                <div
                  key={it.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '22px 26px',
                    borderRadius: 16,
                    backgroundColor: isHighlighted
                      ? preset.accentSoft
                      : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.025)',
                    border: `1.5px solid ${isHighlighted ? preset.accentHex : preset.cardBorder}`,
                    transform: `translateX(${(1 - rowPop) * 28}px)`,
                    opacity: rowPop,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: '0.09em',
                        color: isHighlighted ? preset.accentHex : preset.textMuted,
                        textTransform: 'uppercase',
                      }}
                    >
                      {it.label}
                    </div>
                    <div
                      style={{
                        fontSize: 31,
                        fontWeight: 900,
                        color: preset.textPrimary,
                        marginTop: 4,
                      }}
                    >
                      {it.value}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: preset.textMuted,
                      textAlign: 'right',
                    }}
                  >
                    {it.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
        <AnimatedCursor fromX={780} fromY={460} toX={680} toY={320} moveStartFrame={12} clickFrame={32} />
      </div>
    );
  }

  // 2. ARCHETYPE: KINETIC-TYPE (L02, L19, L24)
  if (preset.archetype === 'kinetic-type') {
    return (
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {stageItems.map((it, idx) => {
          const cardPop = spring({
            frame: Math.max(0, frame - (10 + idx * 7)),
            fps,
            config: preset.springConfig,
          });
          const isMiddle = idx === 1;
          return (
            <div
              key={it.label}
              style={{
                padding: '28px 32px',
                borderRadius: preset.cardRadius,
                backgroundColor: isMiddle ? preset.accentHex : preset.cardBg,
                border: `${preset.borderWidth}px solid ${
                  preset.hardShadow ? preset.textPrimary : isMiddle ? preset.accentHex : preset.cardBorder
                }`,
                boxShadow: cardShadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transform: `translateX(${(1 - cardPop) * (idx % 2 === 0 ? -45 : 45)}px) skewX(${
                  isMiddle ? '-3deg' : '0deg'
                })`,
                opacity: cardPop,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: isMiddle
                      ? isDark
                        ? '#0F0F0E'
                        : '#FFFFFF'
                      : preset.accentHex,
                    textTransform: 'uppercase',
                  }}
                >
                  {it.label}
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: isMiddle
                      ? isDark
                        ? '#0F0F0E'
                        : '#FFFFFF'
                      : preset.textPrimary,
                    marginTop: 2,
                    textTransform: 'uppercase',
                  }}
                >
                  {it.value}
                </div>
              </div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  color: isMiddle
                    ? isDark
                      ? 'rgba(15,15,14,0.82)'
                      : 'rgba(255,255,255,0.92)'
                    : preset.textMuted,
                  maxWidth: 340,
                  textAlign: 'right',
                }}
              >
                {it.sub}
              </div>
            </div>
          );
        })}

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 3. ARCHETYPE: ISOMETRIC-3D (L03, L06, L21, L23)
  if (preset.archetype === 'isometric-3d') {
    const floatY = interpolate(Math.sin(frame / 24), [-1, 1], [-6, 6]);
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            transform: `perspective(1200px) rotateX(8deg) rotateY(-7deg) translateY(${floatY}px)`,
          }}
        >
          {stageItems.map((it, idx) => {
            const layerPop = spring({
              frame: Math.max(0, frame - (8 + idx * 7)),
              fps,
              config: preset.springConfig,
            });
            const offsetX = idx * 14;
            return (
              <div
                key={it.label}
                style={{
                  marginLeft: offsetX,
                  marginRight: 28 - offsetX,
                  padding: '26px 28px',
                  borderRadius: preset.cardRadius,
                  backgroundColor: preset.cardBg,
                  border: `${preset.borderWidth}px solid ${
                    idx === 0 ? preset.accentHex : preset.cardBorder
                  }`,
                  boxShadow: isDark
                    ? `14px 18px 38px rgba(0,0,0,0.55), -2px -2px 0px ${preset.accentHex}44`
                    : `12px 16px 32px rgba(30, 27, 75, 0.12), 0 4px 0 ${preset.accentHex}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transform: `translateY(${(1 - layerPop) * 32}px) scale(${0.92 + 0.08 * layerPop})`,
                  opacity: layerPop,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      backgroundColor: idx === 0 ? preset.accentHex : preset.accentSoft,
                      color: idx === 0 ? (isDark ? '#0F0F0E' : '#FFFFFF') : preset.accentHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 900,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        color: preset.accentHex,
                      }}
                    >
                      {it.label}
                    </div>
                    <div
                      style={{
                        fontSize: 31,
                        fontWeight: 900,
                        color: preset.textPrimary,
                        marginTop: 2,
                      }}
                    >
                      {it.value}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    backgroundColor: preset.accentSoft,
                    color: preset.textPrimary,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {it.sub}
                </div>
              </div>
            );
          })}
        </div>

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 4. ARCHETYPE: EDITORIAL-GRID (L07, L16, L25)
  if (preset.archetype === 'editorial-grid') {
    const gridPop = spring({
      frame: Math.max(0, frame - 8),
      fps,
      config: preset.springConfig,
    });
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            width: '100%',
            borderRadius: preset.cardRadius,
            backgroundColor: preset.cardBg,
            border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
            boxShadow: cardShadow,
            overflow: 'hidden',
            transform: `scale(${0.94 + 0.06 * gridPop})`,
            opacity: gridPop,
          }}
        >
          {/* Top Editorial Metadata Strip */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 28px',
              borderBottom: `${preset.borderWidth}px solid ${preset.cardBorder}`,
              backgroundColor: preset.accentHex,
              color: '#FFFFFF',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            <span>INDEX // {preset.id}</span>
            <span>{preset.category.toUpperCase()} EDITION</span>
            <span>{sticker}</span>
          </div>

          {/* Modular Grid Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stageItems.map((it, idx) => {
              const rowPop = spring({
                frame: Math.max(0, frame - (14 + idx * 6)),
                fps,
                config: preset.springConfig,
              });
              return (
                <div
                  key={it.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 1.1fr',
                    alignItems: 'center',
                    padding: '28px 28px',
                    borderBottom:
                      idx < stageItems.length - 1
                        ? `${preset.borderWidth}px solid ${preset.cardBorder}`
                        : 'none',
                    opacity: rowPop,
                    transform: `translateY(${(1 - rowPop) * 18}px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 900,
                      color: preset.accentHex,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        color: preset.textMuted,
                      }}
                    >
                      {it.label}
                    </div>
                    <div
                      style={{
                        fontSize: 31,
                        fontWeight: 900,
                        color: preset.textPrimary,
                        marginTop: 2,
                      }}
                    >
                      {it.value}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: preset.textMuted,
                      textAlign: 'right',
                      lineHeight: 1.35,
                    }}
                  >
                    {it.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 5. ARCHETYPE: HANDCRAFTED-BOARD (L04, L11, L22)
  if (preset.archetype === 'handcrafted-board') {
    const tilts = [-1.4, 1.2, -0.8];
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {stageItems.map((it, idx) => {
          const notePop = spring({
            frame: Math.max(0, frame - (8 + idx * 7)),
            fps,
            config: preset.springConfig,
          });
          return (
            <div
              key={it.label}
              style={{
                position: 'relative',
                padding: '26px 30px',
                borderRadius: preset.cardRadius,
                backgroundColor: preset.cardBg,
                border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
                boxShadow: cardShadow,
                transform: `scale(${0.92 + 0.08 * notePop}) rotate(${tilts[idx % tilts.length]}deg)`,
                opacity: notePop,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Masking Tape Pin at Top Center */}
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  left: '44%',
                  width: 96,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: preset.accentSoft,
                  border: `1.5px solid ${preset.accentHex}`,
                }}
              />
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 6,
                    backgroundColor: preset.accentSoft,
                    color: preset.accentHex,
                    fontSize: 16,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                  }}
                >
                  {it.label}
                </span>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: preset.textPrimary,
                    marginTop: 8,
                  }}
                >
                  {it.value}
                </div>
              </div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 700,
                  color: preset.textMuted,
                  maxWidth: 360,
                  textAlign: 'right',
                }}
              >
                {it.sub}
              </div>
            </div>
          );
        })}

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 6. ARCHETYPE: POP-BRUTALIST (L05, L09)
  if (preset.archetype === 'pop-brutalist') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div
          style={{
            padding: '28px 32px',
            borderRadius: preset.cardRadius,
            backgroundColor: preset.cardBg,
            border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
            boxShadow: `10px 10px 0px ${preset.textPrimary}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {stageItems.map((it, idx) => {
            const pop = spring({
              frame: Math.max(0, frame - (10 + idx * 6)),
              fps,
              config: preset.springConfig,
            });
            const isHero = idx === 1;
            return (
              <div
                key={it.label}
                style={{
                  padding: '22px 26px',
                  borderRadius: 12,
                  backgroundColor: isHero ? preset.accentHex : preset.bgBase,
                  color: isHero ? '#FFFFFF' : preset.textPrimary,
                  border: `3px solid ${preset.textPrimary}`,
                  boxShadow: `5px 5px 0px ${preset.textPrimary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transform: `scale(${0.9 + 0.1 * pop})`,
                  opacity: pop,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      opacity: 0.9,
                    }}
                  >
                    {it.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, marginTop: 2 }}>{it.value}</div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    maxWidth: 320,
                    textAlign: 'right',
                  }}
                >
                  {it.sub}
                </div>
              </div>
            );
          })}
        </div>

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 7. ARCHETYPE: CYBER-DIGITAL (L08, L13, L17, L18)
  if (preset.archetype === 'cyber-digital') {
    const bars = Array.from({ length: 18 });
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Audio / Telemetry Spectrum Card */}
        <div
          style={{
            padding: '24px 28px',
            borderRadius: preset.cardRadius,
            backgroundColor: preset.cardBg,
            border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
            boxShadow: cardShadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 17,
              fontWeight: 800,
              color: preset.accentHex,
            }}
          >
            <span>TELEMETRY // {preset.id}</span>
            <span>{sticker}</span>
          </div>
          <div
            style={{
              height: 68,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              padding: '8px 4px',
            }}
          >
            {bars.map((_, i) => {
              const h = interpolate(
                Math.sin(frame / 5 + i * 0.65),
                [-1, 1],
                [18, 62]
              );
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: h,
                    borderRadius: 6,
                    backgroundColor:
                      i % 3 === 0 ? preset.accentHex : preset.accentSecondaryHex,
                    opacity: 0.85,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* 3 Digital Telemetry Nodes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {stageItems.map((it, idx) => {
            const nodePop = spring({
              frame: Math.max(0, frame - (12 + idx * 6)),
              fps,
              config: preset.springConfig,
            });
            return (
              <div
                key={it.label}
                style={{
                  padding: '22px 26px',
                  borderRadius: preset.cardRadius,
                  backgroundColor: preset.cardBg,
                  border: `${preset.borderWidth}px solid ${
                    idx === 0 ? preset.accentHex : preset.cardBorder
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transform: `translateX(${(1 - nodePop) * 30}px)`,
                  opacity: nodePop,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 16,
                      fontWeight: 800,
                      color: preset.accentHex,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {it.label}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: preset.textPrimary,
                      marginTop: 2,
                    }}
                  >
                    {it.value}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: preset.textMuted,
                    textAlign: 'right',
                  }}
                >
                  {it.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 8. ARCHETYPE: CHAT-STORY (L12 2D Character / Conversational Dialog)
  if (preset.archetype === 'chat-story') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {stageItems.map((it, idx) => {
          const bubblePop = spring({
            frame: Math.max(0, frame - (8 + idx * 8)),
            fps,
            config: preset.springConfig,
          });
          const isReply = idx === 1;
          return (
            <div
              key={it.label}
              style={{
                display: 'flex',
                flexDirection: isReply ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 18,
                transform: `translateY(${(1 - bubblePop) * 24}px) scale(${0.92 + 0.08 * bubblePop})`,
                opacity: bubblePop,
              }}
            >
              {/* Geometric Persona Avatar */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  backgroundColor: isReply ? preset.accentHex : preset.accentSecondaryHex,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 900,
                  flexShrink: 0,
                  boxShadow: '0 10px 24px rgba(6, 78, 59, 0.16)',
                }}
              >
                {isReply ? 'AI' : `0${idx + 1}`}
              </div>

              {/* Speech Bubble Card */}
              <div
                style={{
                  flex: 1,
                  padding: '22px 28px',
                  borderRadius: preset.cardRadius,
                  backgroundColor: isReply ? preset.accentHex : preset.cardBg,
                  color: isReply ? '#FFFFFF' : preset.textPrimary,
                  border: `${preset.borderWidth}px solid ${
                    isReply ? preset.accentHex : preset.cardBorder
                  }`,
                  boxShadow: cardShadow,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: isReply ? 'rgba(255,255,255,0.88)' : preset.accentHex,
                  }}
                >
                  {it.label}
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>{it.value}</div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    color: isReply ? 'rgba(255,255,255,0.92)' : preset.textMuted,
                    marginTop: 4,
                  }}
                >
                  {it.sub}
                </div>
              </div>
            </div>
          );
        })}

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 9. ARCHETYPE: APP-MOCKUP (L20 UI/UX App Promo)
  if (preset.archetype === 'app-mockup') {
    const appPop = spring({
      frame: Math.max(0, frame - 8),
      fps,
      config: preset.springConfig,
    });
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Mobile App Showcase Frame */}
        <div
          style={{
            borderRadius: 28,
            backgroundColor: preset.cardBg,
            border: `2px solid ${preset.cardBorder}`,
            boxShadow: cardShadow,
            overflow: 'hidden',
            transform: `scale(${0.94 + 0.06 * appPop})`,
            opacity: appPop,
          }}
        >
          {/* App Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 28px',
              backgroundColor: preset.accentHex,
              color: '#FFFFFF',
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.85 }}>
                LIVE PRODUCT UI
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, marginTop: 2 }}>
                Remotion Studio × Prep Panel
              </div>
            </div>
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              v4.0 ACTIVE
            </div>
          </div>

          {/* 3 KPI Feature Tiles */}
          <div
            style={{
              padding: 26,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {stageItems.map((it, idx) => {
              const tilePop = spring({
                frame: Math.max(0, frame - (14 + idx * 6)),
                fps,
                config: preset.springConfig,
              });
              return (
                <div
                  key={it.label}
                  style={{
                    padding: '22px 20px',
                    borderRadius: 20,
                    backgroundColor: idx === 0 ? preset.accentSoft : '#F8FAFC',
                    border: `1.5px solid ${idx === 0 ? preset.accentHex : preset.cardBorder}`,
                    transform: `translateY(${(1 - tilePop) * 20}px)`,
                    opacity: tilePop,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: preset.accentHex,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {it.label}
                  </div>
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 900,
                      color: preset.textPrimary,
                      marginTop: 8,
                    }}
                  >
                    {it.value}
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: preset.textMuted,
                      marginTop: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {it.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
      </div>
    );
  }

  // 10. ARCHETYPE: DATA-PRODUCT (L10, L15)
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div
        style={{
          width: '100%',
          padding: '28px 32px',
          borderRadius: preset.cardRadius,
          backgroundColor: preset.cardBg,
          border: `${preset.borderWidth}px solid ${preset.cardBorder}`,
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 14,
            borderBottom: `1.5px solid ${preset.cardBorder}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: preset.textMuted,
              textTransform: 'uppercase',
            }}
          >
            {preset.name} · BENCHMARK
          </span>
          <span
            style={{
              padding: '6px 16px',
              borderRadius: 99,
              backgroundColor: preset.accentSoft,
              color: preset.accentHex,
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            {sticker}
          </span>
        </div>

        {stageItems.map((it, idx) => {
          const barPop = spring({
            frame: Math.max(0, frame - (10 + idx * 7)),
            fps,
            config: preset.springConfig,
          });
          const numericMatch = it.value.match(/(\d+)/);
          const targetPct = numericMatch
            ? Math.min(100, Math.max(28, Number(numericMatch[1])))
            : 45 + idx * 25;

          return (
            <div key={it.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: preset.accentHex,
                      letterSpacing: '0.06em',
                      marginRight: 12,
                    }}
                  >
                    {it.label}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: preset.textMuted }}>
                    {it.sub}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color: preset.textPrimary,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {it.value}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: 18,
                  borderRadius: 99,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${targetPct * barPop}%`,
                    height: '100%',
                    borderRadius: 99,
                    backgroundColor:
                      idx === stageItems.length - 1
                        ? preset.accentHex
                        : preset.accentSecondaryHex,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <StageFooterStrip preset={preset} frame={frame} fps={fps} sticker={sticker} />
    </div>
  );
};
