import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  bg: '#f6f8fc',
  ink: '#0c1730',
  muted: '#637391',
  line: '#d6dfed',
  navy: '#1a2d4c',
  navyDeep: '#0e1a30',
  accent: '#2f6dff',
  accentSoft: '#a3c0ff',
  yellow: '#ffd54a',
};

export type ThemeName = 'light' | 'dark' | 'blue' | 'photo';

export const themeOf = (t: ThemeName) => {
  const dark = t !== 'light';
  return {
    dark,
    bg:
      t === 'light'
        ? C.bg
        : t === 'blue'
          ? 'linear-gradient(165deg,#2f6dff 0%,#1a47c4 55%,#14306f 100%)'
          : t === 'photo'
            ? '#0b1426'
            : C.navyDeep,
    text: dark ? '#ffffff' : C.ink,
    muted: dark ? (t === 'blue' ? '#dbe5ff' : '#b8c6e0') : C.muted,
    kicker: t === 'light' ? C.accent : t === 'blue' ? '#dbe5ff' : C.accentSoft,
    em: t === 'light' ? C.accent : t === 'blue' ? '#ffffff' : C.accentSoft,
    card: dark ? 'rgba(255,255,255,.08)' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,.16)' : C.line,
    glow: t === 'light' ? C.accentSoft : C.accent,
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

/** Renders a string that may contain <i>…</i> accents from the slide data. */
export const Rich: React.FC<{ html: string; em: string }> = ({ html, em }) => (
  <span
    dangerouslySetInnerHTML={{ __html: html.replace(/<i>/g, `<i style="color:${em}">`) }}
  />
);

// HARD RULE: the top of every video shows the Vanaila logo only.
// No progress bars, slide counters or labels — do not add props for them.
export const Brand: React.FC<{ dark: boolean }> = ({ dark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Img
      src={staticFile('assets/brand/mark.png')}
      style={{ width: 56, height: 56, borderRadius: 13, boxShadow: dark ? '0 0 0 2px rgba(255,255,255,.25)' : 'none' }}
    />
    <Img src={staticFile(dark ? 'assets/brand/wordmark-white.png' : 'assets/brand/wordmark.png')} style={{ height: 31 }} />
  </div>
);

/** Slowly drifting glow blob in the background. */
export const Glow: React.FC<{ color: string; opacity: number; flip?: boolean }> = ({ color, opacity, flip }) => {
  const frame = useCurrentFrame();
  const x = interpolate(Math.sin(frame / 60), [-1, 1], [-40, 40]);
  const y = interpolate(Math.cos(frame / 75), [-1, 1], [-30, 30]);
  return (
    <div
      style={{
        position: 'absolute',
        width: 760,
        height: 760,
        borderRadius: '50%',
        background: color,
        filter: 'blur(110px)',
        opacity,
        ...(flip ? { left: -300 + x, bottom: -240 + y } : { right: -300 + x, top: -280 + y }),
      }}
    />
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

/** Browser-window frame around a screenshot or a video. */
export const BrowserFrame: React.FC<{ label?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  label,
  children,
  style,
}) => (
  <div
    style={{
      borderRadius: 22,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 40px 90px rgba(0,0,0,.5)',
      border: '1px solid rgba(255,255,255,.25)',
      ...style,
    }}
  >
    <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: '#eef2f9' }}>
      {[0, 1, 2].map((i) => (
        <i key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: '#c9d3e4', display: 'block' }} />
      ))}
      {label ? (
        <span style={{ marginLeft: 10, fontFamily: 'JetBrains Mono', fontSize: 15, color: '#637391' }}>{label}</span>
      ) : null}
    </div>
    {children}
  </div>
);
