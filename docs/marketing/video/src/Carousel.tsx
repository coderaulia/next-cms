import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import layout from '../../data/deco-layout.json';
import { Slide, SlideBody, slideImage } from './Slides';
import { asset, Bg, Brand, Deco, DecoItem, ThemeName, themeOf } from './theme';

export type Post = { id?: string; slug: string; theme: ThemeName; slides: Slide[] };

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
  // illustrations + shapes were placed around the text by scripts/build-tiktok.mjs
  const items = ((layout as Record<string, DecoItem[][]>)[post.id || ''] || [])[i] || [];
  return (
    <AbsoluteFill style={{ fontFamily: `${t.hf}, Helvetica, Arial, sans-serif`, color: t.text, ['--ol' as string]: t.ol, ['--sh' as string]: t.sh }}>
      <Bg t={t} photo={asset(bgImg)} />
      <AbsoluteFill style={{ padding: '170px 150px 440px 72px', display: 'flex', flexDirection: 'column' }}>
        <Brand t={t} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: out, transform: `translateX(${shift}px)` }}>
          <SlideBody s={s} t={t} />
        </div>
        {i < post.slides.length - 1 ? <div style={{ height: 48 }} /> : null}
      </AbsoluteFill>
      <Deco items={items} />
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
