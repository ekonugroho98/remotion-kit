import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import contentEngineData from '../../public/content-engine/data.json';
import { KaraokeSubtitle, PhraseTimestamp } from '../components/KaraokeSubtitle';
import {
  BeforeAfterFootageCard,
  CircularTimerRing,
  DashedConnectionGrid,
  FileTreeCard,
  MinimalEyebrowHeader,
  PipelineCheckStepper,
  ShotcraftCanvas,
} from '../library/ShotcraftComponents';

const PHRASES: PhraseTimestamp[] =
  (contentEngineData.phrases as PhraseTimestamp[]) || [];

/**
 * Flagship Shotcraft / @jipraks-style Content Engine Video (32.8s / 1000 frames @ 30fps)
 * Features:
 *  - Ultra-clean dark obsidian canvas (#0A0B0A) with soft lime/blue ambient glow & 60%+ negative space
 *  - Minimal top eyebrow headers (● CONTENT ENGINE, ● ARSITEKTUR, ● ISINYA, ● CARA PAKAI, ● BISA JUGA)
 *  - Word-synced progressive activation (dashed ghost outline -> solid lit card on exact spoken frame)
 *  - Solid Inverted Box Karaoke Subtitle (2-3 words max, no outer capsule, tilted white highlight box)
 *  - Full 9-SFX studio audio pack (tick, switch, chime, type, whoosh, success, music-loop)
 */
export const ContentEngineVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0B0A' }}>
      {/* Master Audio Track: Voice-Over + Ambient Synth Loop */}
      <Audio src={staticFile('content-engine/audio.wav')} volume={1.0} />
      <Audio src={staticFile('sfx/music-loop.wav')} volume={0.13} loop />

      {/* ──────────────────────────────────────────────────────────────────────
          SCENE 1 (F0000 - F0136): Circular Timer Hook -> "10 MENIT"
         ────────────────────────────────────────────────────────────────────── */}
      <Sequence from={0} durationInFrames={136} name="01-Hook-10Menit">
        <ShotcraftCanvas glowColor="#B6F000" secondaryGlow="#3B82F6" />
        {/* Timer ticks + morph chime */}
        {[12, 27, 42, 57, 72, 87].map((f) => (
          <Sequence key={f} from={f} durationInFrames={10}>
            <Audio src={staticFile('sfx/tick.wav')} volume={0.22} />
          </Sequence>
        ))}
        <Sequence from={104} durationInFrames={30}>
          <Audio src={staticFile('sfx/chime.wav')} volume={0.34} />
        </Sequence>

        <AbsoluteFill
          style={{
            padding: '170px 72px 340px 72px',
            justifyContent: 'flex-start',
            gap: 32,
          }}
        >
          <MinimalEyebrowHeader
            eyebrow="CONTENT ENGINE"
            dotColor="#B6F000"
            titleLine1="Bikin Video"
            titleLine2="Dari Nol → Terjadwal"
            accentText="Terjadwal"
            accentColor="#B6F000"
            align="center"
          />
          <CircularTimerRing
            morphFrame={104}
            accentColor="#B6F000"
            headlineAfterMorph="10 MENIT"
            subAfterMorph="Tanpa edit manual di timeline berjam-jam"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ──────────────────────────────────────────────────────────────────────
          SCENE 2 (F0136 - F0310): 1 Folder Project Tree (Progressive Row Reveal)
         ────────────────────────────────────────────────────────────────────── */}
      <Sequence from={136} durationInFrames={174} name="02-Folder-Project-Tree">
        <ShotcraftCanvas glowColor="#3B82F6" secondaryGlow="#B6F000" />
        <Sequence from={0} durationInFrames={25}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
        </Sequence>
        {[14, 34, 54, 78, 102, 124, 142].map((f) => (
          <Sequence key={f} from={f} durationInFrames={12}>
            <Audio src={staticFile('sfx/switch.wav')} volume={0.24} />
          </Sequence>
        ))}

        <AbsoluteFill
          style={{
            padding: '160px 68px 340px 68px',
            justifyContent: 'flex-start',
            gap: 34,
          }}
        >
          <MinimalEyebrowHeader
            eyebrow="ARSITEKTUR"
            dotColor="#3B82F6"
            titleLine1="Satu Folder Project"
            titleLine2="Lengkap & Siap Pakai"
            accentText="Lengkap"
            accentColor="#B6F000"
          />
          <FileTreeCard
            items={[
              { name: '.agents/skills', desc: 'Aturan anti-slop & desain', color: '#A855F7', isFolder: true, activateFrame: 12 },
              { name: 'src/library/', desc: 'Komponen animasi Shotcraft', color: '#B6F000', isFolder: true, activateFrame: 32 },
              { name: 'scripts/', desc: 'Auto-VO, timestamp & cut', color: '#34D399', isFolder: true, activateFrame: 52 },
              { name: 'panel/', desc: 'Prep Panel web interaktif', color: '#3B82F6', isFolder: true, activateFrame: 78 },
              { name: 'src/templates/', desc: '25+ Style Preset (L01–L25)', color: '#F59E0B', isFolder: true, activateFrame: 102 },
              { name: 'public/sfx/', desc: '9 SFX & musik ambient studio', color: '#22D3EE', isFolder: true, activateFrame: 124 },
              { name: 'audio-pack.json', desc: 'Manifest efek suara otomatis', color: '#FACC15', isFolder: false, activateFrame: 142 },
            ]}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ──────────────────────────────────────────────────────────────────────
          SCENE 3 (F0310 - F0520): 4 Bagian Saling Terhubung (Dashed -> Lit on Word)
         ────────────────────────────────────────────────────────────────────── */}
      <Sequence from={310} durationInFrames={210} name="03-Isinya-4-Bagian">
        <ShotcraftCanvas glowColor="#B6F000" secondaryGlow="#F59E0B" />
        <Sequence from={0} durationInFrames={25}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
        </Sequence>
        {/* Exact word-synced switch SFX for Brand (76), Otak AI (105), Komponen (126), Koneksi (163) */}
        {[76, 105, 126, 163].map((f) => (
          <Sequence key={f} from={f} durationInFrames={15}>
            <Audio src={staticFile('sfx/switch.wav')} volume={0.30} />
          </Sequence>
        ))}
        <Sequence from={178} durationInFrames={30}>
          <Audio src={staticFile('sfx/chime.wav')} volume={0.34} />
        </Sequence>

        <AbsoluteFill
          style={{
            padding: '160px 68px 340px 68px',
            justifyContent: 'flex-start',
            gap: 36,
          }}
        >
          <MinimalEyebrowHeader
            eyebrow="ISINYA"
            dotColor="#B6F000"
            titleLine1="4 Bagian yang"
            titleLine2="Saling Terhubung"
            accentText="Saling Terhubung"
            accentColor="#B6F000"
          />
          <DashedConnectionGrid
            nodes={[
              {
                id: 'brand',
                title: 'Brand Kamu',
                subtitle: 'Logo, warna, font & gaya bahasa',
                icon: '🎨',
                color: '#3B82F6',
                activateFrame: 76,
                subActivateFrame: 86,
              },
              {
                id: 'brain',
                title: 'Otak AI',
                subtitle: 'Aturan animasi, pacing & hook',
                icon: '🧠',
                color: '#F59E0B',
                activateFrame: 105,
                subActivateFrame: 115,
              },
              {
                id: 'library',
                title: 'Komponen',
                subtitle: '25+ template, transisi & 9 SFX',
                icon: '🧩',
                color: '#B6F000',
                activateFrame: 126,
                subActivateFrame: 138,
              },
              {
                id: 'connect',
                title: 'Koneksi',
                subtitle: 'Auto-VO, timestamp & render MP4',
                icon: '⚡',
                color: '#A855F7',
                activateFrame: 163,
                subActivateFrame: 172,
              },
            ]}
            summaryFrame={178}
            summaryText="✓ 4 bagian udah nyambung otomatis"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ──────────────────────────────────────────────────────────────────────
          SCENE 4 (F0520 - F0750): Cara Pakai (Prompt + 4 Checkmarks + Jadwal)
         ────────────────────────────────────────────────────────────────────── */}
      <Sequence from={520} durationInFrames={230} name="04-Cara-Pakai-Pipeline">
        <ShotcraftCanvas glowColor="#B6F000" secondaryGlow="#22D3EE" />
        <Sequence from={0} durationInFrames={25}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
        </Sequence>
        {/* Keystroke SFX during prompt typing */}
        {[48, 56, 64, 72, 80, 88].map((f) => (
          <Sequence key={f} from={f} durationInFrames={8}>
            <Audio src={staticFile('sfx/type.wav')} volume={0.22} />
          </Sequence>
        ))}
        {/* Checkmark chimes for Naskah (104), Suara (132), Render (148), Jadwal (168) */}
        {[104, 132, 148, 168].map((f) => (
          <Sequence key={f} from={f} durationInFrames={20}>
            <Audio src={staticFile('sfx/chime.wav')} volume={0.30} />
          </Sequence>
        ))}

        <AbsoluteFill
          style={{
            padding: '160px 68px 340px 68px',
            justifyContent: 'flex-start',
            gap: 34,
          }}
        >
          <MinimalEyebrowHeader
            eyebrow="CARA PAKAI"
            dotColor="#B6F000"
            titleLine1="Cukup Ketik"
            titleLine2="Mau Bikin Video Apa"
            accentText="Video Apa"
            accentColor="#B6F000"
          />
          <PipelineCheckStepper
            promptText='"Bikin video soal AI Content Engine..."'
            stepFrames={[104, 132, 148, 168]}
            socialStartFrame={176}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ──────────────────────────────────────────────────────────────────────
          SCENE 5 (F0750 - F1000): Edit Footage Mentah Otomatis (Before / After)
         ────────────────────────────────────────────────────────────────────── */}
      <Sequence from={750} durationInFrames={250} name="05-Edit-Footage-Mentah">
        <ShotcraftCanvas glowColor="#B6F000" secondaryGlow="#3B82F6" />
        <Sequence from={0} durationInFrames={25}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
        </Sequence>
        <Sequence from={82} durationInFrames={20}>
          <Audio src={staticFile('sfx/switch.wav')} volume={0.32} />
        </Sequence>
        <Sequence from={115} durationInFrames={40}>
          <Audio src={staticFile('sfx/success.wav')} volume={0.34} />
        </Sequence>

        <AbsoluteFill
          style={{
            padding: '160px 68px 340px 68px',
            justifyContent: 'flex-start',
            gap: 36,
          }}
        >
          <MinimalEyebrowHeader
            eyebrow="BISA JUGA"
            dotColor="#B6F000"
            titleLine1="Edit Footage Mentah"
            titleLine2="Potong Jeda Otomatis"
            accentText="Otomatis"
            accentColor="#B6F000"
          />
          <BeforeAfterFootageCard editActivateFrame={82} />
        </AbsoluteFill>
      </Sequence>

      {/* Layer 4: @jipraks-style Solid Inverted Box Karaoke Subtitle (2-3 words max) */}
      <KaraokeSubtitle
        phrases={PHRASES}
        variant="inverted-box"
        mode="dark"
        highlightBg="#FFFFFF"
        highlightText="#0A0B0A"
        bottomOffset={200}
      />
    </AbsoluteFill>
  );
};
