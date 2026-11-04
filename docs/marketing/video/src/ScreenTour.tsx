import React from 'react';
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Bg, Brand, C, Card, Deco, DecoItem, Rich, themeOf, useEnter, usePop } from './theme';

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
        background: '#0b1220', boxShadow: `0 50px 120px rgba(0,0,0,.55), 0 0 0 5px ${C.y}, 14px 14px 0 5px #000`,
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
        position: 'absolute', right: 150, top, maxWidth: 520, padding: '22px 28px',
        background: C.y, color: C.ink, fontSize: 32, lineHeight: 1.25, fontWeight: 700, fontFamily: "'Space Grotesk'",
        border: '5px solid #111', boxShadow: '8px 8px 0 #111',
        opacity: p * out, transform: `translateX(${(1 - p) * 120}px) rotate(${idx % 2 ? 2 : -2}deg) scale(${0.9 + 0.1 * p})`,
      }}
    >
      {text}
    </div>
  );
};

const TOUR_ILL: Record<string, string> = { 'tour-site-home': 'laptop', 'tour-site-hris': 'people', 'tour-site-flowraze': 'chart', 'tour-site-psikotest': 'search', 'tour-site-templates': 'laptop' };
const introDeco = (id: string): DecoItem[] => [
  { k: 'ill', n: TOUR_ILL[id] || 'bulb', x: 640, y: 250, s: 290, r: 6 },
  { k: 'shp', n: 'star4', x: 90, y: 300, s: 90, r: -10, c: 'p' },
  { k: 'shp', n: 'burst', x: 800, y: 1290, s: 110, r: 12, c: 'y' },
  { k: 'shp', n: 'squiggle', x: 120, y: 1330, s: 100, r: -8, c: 'w' },
];
const outroDeco: DecoItem[] = [
  { k: 'ill', n: 'cursor', x: 650, y: 250, s: 280, r: 4 },
  { k: 'shp', n: 'plus', x: 90, y: 310, s: 80, r: 10, c: 'm' },
  { k: 'shp', n: 'burst', x: 780, y: 1300, s: 110, r: -10, c: 'p' },
];

export const ScreenTour: React.FC<{ tour: Tour }> = ({ tour }) => {
  const frame = useCurrentFrame();
  const t = themeOf('blue');
  const recFrames = tour.recordingSeconds * 30;
  const introOut = interpolate(frame, [INTRO - 10, INTRO], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pad = '170px 150px 440px 72px';
  return (
    <AbsoluteFill style={{ fontFamily: `${t.hf}, sans-serif`, color: t.text, ['--ol' as string]: t.ol, ['--sh' as string]: t.sh }}>
      <Bg t={t} />
      <AbsoluteFill style={{ padding: pad }}>
        <Brand t={t} />
      </AbsoluteFill>

      <Sequence durationInFrames={INTRO}>
        <AbsoluteFill style={{ padding: pad, justifyContent: 'center', opacity: introOut }}>
          <div style={useEnter(0, 60)}>
            <Card t={t} v="y" rot={-1.5}>
              <div style={{ position: 'absolute', top: -34, right: -14, ...usePop(10) }}>
                <div style={{ transform: 'rotate(6deg)', background: C.p, color: '#111', border: '5px solid #111', boxShadow: '6px 6px 0 #111', padding: '8px 20px', fontFamily: t.mf, fontWeight: 700, fontSize: 26, textTransform: 'uppercase' }}>{tour.kicker}</div>
              </div>
              <h1 style={{ fontSize: 104, lineHeight: 1.1, letterSpacing: '-.035em', fontWeight: 700, overflowWrap: 'anywhere' }}>
                <Rich html={tour.title} t={t} card />
              </h1>
            </Card>
          </div>
        </AbsoluteFill>
        <Deco items={introDeco(tour.id)} />
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
        <AbsoluteFill style={{ padding: pad, justifyContent: 'center' }}>
          <div style={useEnter(0, 60)}>
            <Card t={t} v="y" rot={-1.5}>
              <h2 style={{ fontSize: 92, lineHeight: 1.1, letterSpacing: '-.035em', fontWeight: 700, overflowWrap: 'anywhere' }}>
                <Rich html={tour.cta} t={t} card />
              </h2>
              <p style={{ fontSize: 38, lineHeight: 1.4, marginTop: 28, fontWeight: 500, color: '#2b2b2b' }}>{tour.sub}</p>
            </Card>
          </div>
          <div style={{ marginTop: 56, alignSelf: 'flex-start', ...usePop(16) }}>
            <div style={{ background: '#fff', color: '#111', border: '6px solid #111', boxShadow: '10px 10px 0 #111', padding: '24px 42px', fontSize: 38, fontWeight: 700 }}>vanaila.com · link di profil</div>
          </div>
        </AbsoluteFill>
        <Deco items={outroDeco} />
      </Sequence>
    </AbsoluteFill>
  );
};
