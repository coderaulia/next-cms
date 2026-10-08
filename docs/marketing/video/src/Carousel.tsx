import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Slide, SlideBody, slideImage } from './Slides';
import { asset, BlurBg, Brand, Glow, ThemeName, themeOf } from './theme';

export type Post = { slug: string; theme: ThemeName; slides: Slide[] };

const LEN: Record<string, number> = { hook: 80, cta: 110, chat: 130, annot: 125, vs: 115, guess: 110, collage: 100 };
export const slideLen = (s: Slide) => LEN[s.type] ?? 105;
export const postDuration = (p: Post) => p.slides.reduce((a, s) => a + slideLen(s), 0);

const SlideFrame: React.FC<{ post: Post; i: number; len: number }> = ({ post, i, len }) => {
  const frame = useCurrentFrame();
  const t = themeOf(post.theme);
  const s = post.slides[i];
  const bgImg = slideImage(s) || slideImage(post.slides.find((x) => slideImage(x)) || ({} as Slide));
  const out = interpolate(frame, [len - 8, len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const shift = interpolate(frame, [len - 8, len], [0, -60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: t.bg, fontFamily: 'Inter Tight, Helvetica, Arial, sans-serif', color: t.text }}>
      {post.theme === 'photo' && bgImg ? <BlurBg src={asset(bgImg)} /> : null}
      {post.theme !== 'photo' ? <Glow color={t.glow} opacity={post.theme === 'light' ? 0.55 : 0.3} flip={i % 2 === 1} /> : null}
      <AbsoluteFill style={{ padding: '170px 150px 440px 72px', display: 'flex', flexDirection: 'column' }}>
        <Brand dark={t.dark} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: out, transform: `translateX(${shift}px)` }}>
          <SlideBody s={s} t={t} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Carousel: React.FC<{ post: Post }> = ({ post }) => {
  let from = 0;
  return (
    <AbsoluteFill>
      {post.slides.map((s, i) => {
        const len = slideLen(s);
        const seq = (
          <Sequence key={i} from={from} durationInFrames={len}>
            <SlideFrame post={post} i={i} len={len} />
          </Sequence>
        );
        from += len;
        return seq;
      })}
    </AbsoluteFill>
  );
};
