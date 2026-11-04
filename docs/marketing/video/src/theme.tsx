import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import deco from '../../data/deco.json';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = { ink: '#111', y: '#ffe14d', p: '#ff5d8f', b: '#3d5afe', m: '#5de0b0', o: '#ff8a3d' };

/**
 * Two style families, matching the PNG carousels (scripts/build-tiktok.mjs):
 *  - "neo": Neo-Brutal (light + blue themes): thick black borders, hard shadows, yellow / pink / blue blocks
 *  - "neon": Neon Night (dark + photo themes): glass cards, gradient accents, deep indigo background
 */
export type ThemeName = 'light' | 'dark' | 'blue' | 'photo';

export const themeOf = (name: ThemeName) => {
  const blue = name === 'blue';
  const neo = name === 'light' || blue;
  const iNeo = `font-style:normal;color:#111;background:${blue ? C.y : C.p};border:5px solid #111;padding:0 .1em;box-decoration-break:clone;-webkit-box-decoration-break:clone;box-shadow:6px 6px 0 #111`;
  const iNeon = 'font-style:normal;background:linear-gradient(90deg,#ffe14d,#ff5d8f);-webkit-background-clip:text;background-clip:text;color:transparent';
  return {
    name,
    neo,
    blue,
    dark: name !== 'light',
    bg: name === 'light' ? '#fffdf5' : blue ? '#3d5afe' : name === 'photo' ? '#0b1426' : '#0d1030',
    dots: name === 'light' ? 'rgba(17,17,17,.14)' : blue ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.09)',
    text: name === 'light' ? '#111' : blue ? '#fff' : '#f2f4ff',
    muted: name === 'light' ? '#2b2b2b' : blue ? '#eef1ff' : '#aeb6d8',
    ol: neo ? '#111' : '#f2f4ff',
    sh: neo ? '#111' : 'rgba(0,0,0,.55)',
    hf: neo ? "'Space Grotesk'" : "'Sora'",
    mf: neo ? "'Space Mono'" : "'JetBrains Mono'",
    iStyle: neo ? iNeo : iNeon,
    iCard: neo ? iNeo.replace(blue ? C.y : C.p, C.p) : iNeon,
    iBody: `font-style:normal;font-weight:700;color:${neo && !blue ? C.b : C.y}`,
  };
};
export type Theme = ReturnType<typeof themeOf>;

/** Map the image paths used by the PNG templates to files served from video/public. */
export const asset = (src?: string) => {
  if (!src) return '';
  if (src.startsWith('../../../public/')) return staticFile('site/' + src.slice('../../../public/'.length));
  if (src.startsWith('../assets/')) return staticFile('assets/' + src.slice('../assets/'.length));
  return src;
};

/** Spring-based entrance: returns {opacity, transform} for an element appearing `delay` frames in. */
export const useEnter = (delay = 0, distance = 40) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` } as React.CSSProperties;
};

export const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.6 } });
  return { opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p})` } as React.CSSProperties;
};

/** Renders a string that may contain <i>…</i> accents from the slide data (highlight in titles, bold in body text). */
export const Rich: React.FC<{ html: string; t: Theme; body?: boolean; card?: boolean }> = ({ html, t, body, card }) => (
  <span dangerouslySetInnerHTML={{ __html: html.replace(/<i>/g, `<i style="${body ? t.iBody : card ? t.iCard : t.iStyle}">`) }} />
);

// HARD RULE: the top of every video shows the Vanaila logo only.
// No progress bars, slide counters or labels — do not add props for them.
export const Brand: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Img
      src={staticFile('assets/brand/mark.png')}
      style={{ width: 56, height: 56, borderRadius: 13, border: t.neo ? `4px solid ${t.blue ? '#fff' : '#111'}` : '2px solid rgba(255,255,255,.25)' }}
    />
    <Img src={staticFile(t.dark ? 'assets/brand/wordmark-white.png' : 'assets/brand/wordmark.png')} style={{ height: 31 }} />
  </div>
);

/** Slide background: dotted paper / blue / deep-indigo glow, or a blurred photo. */
export const Bg: React.FC<{ t: Theme; flip?: boolean; photo?: string }> = ({ t, flip, photo }) => {
  const frame = useCurrentFrame();
  const x = interpolate(Math.sin(frame / 60), [-1, 1], [-40, 40]);
  const y = interpolate(Math.cos(frame / 75), [-1, 1], [-30, 30]);
  const dot = t.neo ? 36 : 48;
  return (
    <AbsoluteFill style={{ background: t.bg, overflow: 'hidden' }}>
      {t.name === 'photo' && photo ? <BlurBg src={photo} /> : null}
      {t.name === 'dark' ? (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${90 + x / 20}% ${4 + y / 20}%,rgba(61,90,254,.55),transparent 42%),radial-gradient(circle at ${4 - x / 20}% ${96 - y / 20}%,rgba(255,93,143,.3),transparent 40%)` }} />
        </>
      ) : null}
      {t.name !== 'photo' ? (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${t.dots} ${t.neo ? 2 : 1.5}px,transparent ${t.neo ? 2 : 1.5}px)`, backgroundSize: `${dot}px ${dot}px` }} />
      ) : null}
      {flip ? null : null}
    </AbsoluteFill>
  );
};

export const BlurBg: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 300], [1.12, 1.2], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={src}
        style={{
          position: 'absolute',
          inset: -60,
          width: W + 120,
          height: H + 120,
          objectFit: 'cover',
          filter: 'blur(40px) brightness(.22) saturate(1.2)',
          transform: `scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};

export type DecoItem = { k: 'ill' | 'shp'; n: string; x: number; y: number; s: number; r: number; c?: string };

/** Illustrations and shapes placed by scripts/build-tiktok.mjs (data/deco-layout.json); they float and pop in. */
export const Deco: React.FC<{ items?: DecoItem[] }> = ({ items = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ill = deco.illustrations as Record<string, string>;
  const shp = deco.shapes as Record<string, string>;
  return (
    <>
      {items.map((d, i) => {
        const p = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 11, mass: 0.6 } });
        const bob = Math.sin((frame + i * 17) / 16) * 8;
        const spin = d.k === 'shp' ? frame * (i % 2 ? 0.6 : -0.6) : Math.sin((frame + i * 9) / 22) * 4;
        const svg = d.k === 'ill' ? `<svg viewBox="0 0 200 200">${ill[d.n]}</svg>` : `<svg viewBox="0 0 100 100" class="f${d.c}">${shp[d.n]}</svg>`;
        return (
          <div
            key={i}
            className={d.k === 'ill' ? 'dc il' : 'dc sh'}
            style={{ position: 'absolute', left: d.x, top: d.y, width: d.s, height: d.s, opacity: Math.min(1, p * 1.4), transform: `translateY(${bob}px) rotate(${d.r + spin}deg) scale(${0.4 + 0.6 * p})` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        );
      })}
    </>
  );
};

/** Card used for hook / point / CTA text: yellow or white block with hard shadow (neo) or glass with corner brackets (neon). */
export const Card: React.FC<{ t: Theme; v?: 'y' | 'w'; rot?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, v = 'w', rot = 0, children, style }) => (
  <div
    style={
      t.neo
        ? { position: 'relative', border: '6px solid #111', boxShadow: '14px 14px 0 #111', borderRadius: 6, padding: '48px 46px', color: '#111', background: v === 'y' ? C.y : '#fff', transform: `rotate(${rot}deg)`, ...style }
        : { position: 'relative', border: '1px solid rgba(255,255,255,.16)', borderRadius: 28, padding: '48px 46px', color: t.text, background: 'rgba(255,255,255,.06)', ...style }
    }
  >
    {!t.neo ? (
      <>
        <div style={{ position: 'absolute', left: -3, top: -3, width: 56, height: 56, border: `4px solid ${C.y}`, borderRight: 0, borderBottom: 0, borderRadius: '28px 0 0 0' }} />
        <div style={{ position: 'absolute', right: -3, bottom: -3, width: 56, height: 56, border: `4px solid ${C.p}`, borderLeft: 0, borderTop: 0, borderRadius: '0 0 28px 0' }} />
      </>
    ) : null}
    {children}
  </div>
);

/** Browser-window frame around a screenshot or a video. */
export const BrowserFrame: React.FC<{ t: Theme; label?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, label, children, style }) => (
  <div
    style={{
      overflow: 'hidden',
      background: '#fff',
      ...(t.neo ? { border: '6px solid #111', boxShadow: '12px 12px 0 #111', borderRadius: 6 } : { border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 40px 90px rgba(0,0,0,.55)', borderRadius: 18 }),
      ...style,
    }}
  >
    <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', background: t.neo ? C.y : '#eef2f9', borderBottom: t.neo ? '5px solid #111' : 0 }}>
      {[0, 1, 2].map((i) => (
        <i key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: t.neo ? '#fff' : '#c9d3e4', border: t.neo ? '3px solid #111' : 0, display: 'block' }} />
      ))}
      {label ? <span style={{ marginLeft: 10, fontFamily: t.mf, fontWeight: 700, fontSize: 15, color: t.neo ? '#111' : '#637391' }}>{label}</span> : null}
    </div>
    {children}
  </div>
);
