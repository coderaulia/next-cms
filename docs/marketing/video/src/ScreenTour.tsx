import React from 'react';
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Brand, C, Glow, Rich, themeOf, useEnter, usePop } from './theme';

/**
 * A screen-recording video: hook card → real screen recording inside a phone frame with
 * timed caption callouts → CTA. Recordings come from scripts/record-screens.mjs.
 */
export type Tour = {
  id: string;
  video: string; // file in public/recordings
  kicker: string;
  title: string; // may contain <i>…</i>
  captions: { at: number; text: string }[]; // seconds into the recording part
  cta: string;
  sub: string;
  recordingSeconds: number;
};

export const INTRO = 75;
export const OUTRO = 100;
export const tourDuration = (t: Tour) => INTRO + t.recordingSeconds * 30 + OUTRO;

const Phone: React.FC<{ video: string; seconds: number }> = ({ video, seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: 'absolute', left: 150, top: 300, width: 600, height: 1200, borderRadius: 64, padding: 18,
        background: '#0b1220', boxShadow: '0 50px 120px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.12)',
        transform: `translateY(${(1 - p) * 300}px) rotate(${(1 - p) * -6}deg)`, opacity: p,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden', background: '#fff' }}>
        <OffthreadVideo src={staticFile('recordings/' + video)} startFrom={90} endAt={90 + seconds * 30} muted style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    </div>
  );
};

const Callout: React.FC<{ text: string; idx: number }> = ({ text, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 13 } });
  const out = interpolate(frame, [80, 95], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const top = [380, 760, 1100][idx % 3];
  return (
    <div
      style={{
        position: 'absolute', right: 150, top, maxWidth: 520, padding: '22px 28px', borderRadius: 22,
        background: '#ffffff', color: C.ink, fontSize: 32, lineHeight: 1.25, fontWeight: 700,
        boxShadow: '0 24px 60px rgba(0,0,0,.35)', borderLeft: `8px solid ${C.yellow}`,
        opacity: p * out, transform: `translateX(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      {text}
    </div>
  );
};

export const ScreenTour: React.FC<{ tour: Tour }> = ({ tour }) => {
  const frame = useCurrentFrame();
  const t = themeOf('dark');
  const recFrames = tour.recordingSeconds * 30;
  const introOut = interpolate(frame, [INTRO - 10, INTRO], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(170deg,#0e1a30 0%,#0b1426 60%,#132a57 100%)', fontFamily: 'Inter Tight, sans-serif', color: '#fff' }}>
      <Glow color={C.accent} opacity={0.32} />
      <AbsoluteFill style={{ padding: '170px 150px 440px 72px' }}>
        <Brand dark count="Screen tour" muted={t.muted} />
      </AbsoluteFill>

      <Sequence durationInFrames={INTRO}>
        <AbsoluteFill style={{ padding: '170px 150px 440px 72px', justifyContent: 'center', opacity: introOut }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 24, letterSpacing: '.1em', textTransform: 'uppercase', color: C.accentSoft, ...useEnter(0, 20) }}>{tour.kicker}</div>
          <h1 style={{ fontSize: 104, lineHeight: 1, letterSpacing: '-.035em', fontWeight: 700, marginTop: 22, ...useEnter(4) }}>
            <Rich html={tour.title} em={C.accentSoft} />
          </h1>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={INTRO} durationInFrames={recFrames}>
        <Phone video={tour.video} seconds={tour.recordingSeconds} />
        {tour.captions.map((c, i) => (
          <Sequence key={i} from={Math.round(c.at * 30)} durationInFrames={95}>
            <Callout text={c.text} idx={i} />
          </Sequence>
        ))}
      </Sequence>

      <Sequence from={INTRO + recFrames} durationInFrames={OUTRO}>
        <AbsoluteFill style={{ padding: '170px 150px 440px 72px', justifyContent: 'center' }}>
          <h2 style={{ fontSize: 96, lineHeight: 1, letterSpacing: '-.035em', fontWeight: 700, ...useEnter(0) }}>
            <Rich html={tour.cta} em={C.accentSoft} />
          </h2>
          <p style={{ fontSize: 38, lineHeight: 1.4, marginTop: 30, color: t.muted, ...useEnter(8) }}>{tour.sub}</p>
          <div style={{ marginTop: 48, alignSelf: 'flex-start', padding: '28px 44px', borderRadius: 999, background: C.accent, fontSize: 38, fontWeight: 700, ...usePop(16) }}>vanaila.com · link di profil</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
