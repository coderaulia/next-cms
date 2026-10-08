import './fonts.css';
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import tiktok from '../../data/tiktok.json';
import { Carousel, Post, postDuration } from './Carousel';
import { ScreenTour, tourDuration } from './ScreenTour';
import { FPS, H, W } from './theme';
import { tours } from './tours';

/** Holds rendering until the brand web fonts are loaded. */
const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return <>{children}</>;
};

/** Ken-Burns slideshow of already-rendered PNG slides (used for the meme post). */
const PngSlideshow: React.FC<{ files: string[]; each: number }> = ({ files, each }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    {files.map((f, i) => (
      <Sequence key={f} from={i * each} durationInFrames={i === files.length - 1 ? each + 30 : each}>
        <KenBurns src={staticFile('output/' + f)} last={i === files.length - 1} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
const KenBurns: React.FC<{ src: string; last: boolean }> = ({ src, last }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 90], last ? [1.04, 1] : [1, 1.05], { extrapolateRight: 'clamp' });
  const o = interpolate(f, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
  return <Img src={src} style={{ width: W, height: H, transform: `scale(${s})`, opacity: o }} />;
};

const posts = (tiktok as Post[]).map((p, i) => ({ ...p, id: `tt-${String(i + 1).padStart(2, '0')}-${p.slug}` }));
const meme = [1, 2, 3, 4, 5].map((n) => `meme-01-in-this-picture-s${n}.png`);

export const RemotionRoot: React.FC = () => (
  <>
    {posts.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={() => (
          <FontGate>
            <Carousel post={p} />
          </FontGate>
        )}
        durationInFrames={postDuration(p)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
    {tours.map((t) => (
      <Composition
        key={t.id}
        id={t.id}
        component={() => (
          <FontGate>
            <ScreenTour tour={t} />
          </FontGate>
        )}
        durationInFrames={tourDuration(t)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
    <Composition id="meme-01-in-this-picture" component={() => <PngSlideshow files={meme} each={60} />} durationInFrames={60 * 5 + 30} fps={FPS} width={W} height={H} />
  </>
);
