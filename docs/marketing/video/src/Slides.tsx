import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { asset, BrowserFrame, C, Rich, Theme, useEnter, usePop } from './theme';

export type Slide = Record<string, any> & { type: string };

const mono: React.CSSProperties = { fontFamily: 'JetBrains Mono', letterSpacing: '.1em', textTransform: 'uppercase' };

const Kicker: React.FC<{ t: Theme; text?: string; d?: number }> = ({ t, text, d = 0 }) =>
  text ? <div style={{ ...mono, fontSize: 24, color: t.kicker, ...useEnter(d, 20) }}>{text}</div> : null;

const Title: React.FC<{ t: Theme; html: string; size?: number; d?: number; mt?: number }> = ({ t, html, size = 100, d = 4, mt = 22 }) => (
  <h1 style={{ fontSize: size, lineHeight: 1, letterSpacing: '-.035em', fontWeight: 700, marginTop: mt, color: t.text, ...useEnter(d) }}>
    <Rich html={html} em={t.em} />
  </h1>
);

const Body: React.FC<{ t: Theme; text?: string; d?: number; size?: number }> = ({ t, text, d = 10, size = 38 }) =>
  text ? <p style={{ fontSize: size, lineHeight: 1.4, marginTop: 30, color: t.muted, ...useEnter(d) }}><Rich html={text} em={t.em} /></p> : null;

const Fix: React.FC<{ t: Theme; label?: string; text?: string; d?: number }> = ({ t, label, text, d = 18 }) => {
  if (!text) return null;
  return (
    <div style={{ marginTop: 44, padding: '26px 30px', borderRadius: 24, background: '#eaf0ff', color: C.navy, fontSize: 32, lineHeight: 1.3, fontWeight: 600, ...usePop(d) }}>
      <span style={{ ...mono, display: 'block', fontSize: 18, color: C.accent, marginBottom: 8, fontWeight: 400 }}>{label || 'SOLUSI'}</span>
      {text}
    </div>
  );
};

const Hook: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <Title t={t} html={s.title} size={104} />
    <Body t={t} text={s.sub} d={14} />
  </>
);

const Point: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <div style={{ fontSize: 150, lineHeight: 1, fontWeight: 700, letterSpacing: '-.04em', color: t.em, ...usePop(0) }}>{s.n}</div>
    <h2 style={{ fontSize: 80, lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 700, marginTop: 24, color: t.text, ...useEnter(6) }}>
      <Rich html={s.title} em={t.em} />
    </h2>
    <Body t={t} text={s.body} d={12} />
    <Fix t={t} label={s.fixLabel} text={s.fix} d={22} />
  </>
);

const Check: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <h2 style={{ fontSize: 80, lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 700, color: t.text, ...useEnter(0) }}>
      <Rich html={s.title} em={t.em} />
    </h2>
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {s.items.map((x: string, i: number) => (
        <div
          key={i}
          style={{
            display: 'grid', gridTemplateColumns: '64px 1fr', gap: 20, alignItems: 'center', fontSize: 36, lineHeight: 1.3, fontWeight: 500,
            padding: '26px 28px', borderRadius: 24, background: t.card, border: `1px solid ${t.cardBorder}`, color: t.text, ...useEnter(10 + i * 8, 30),
          }}
        >
          <b style={{ width: 64, height: 64, borderRadius: 18, background: C.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 30 }}>{i + 1}</b>
          <span>{x}</span>
        </div>
      ))}
    </div>
  </>
);

const Cta: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.03 * Math.sin(frame / 6);
  return (
    <>
      <Title t={t} html={s.title} size={96} d={0} mt={0} />
      <Body t={t} text={s.sub} d={8} />
      <div style={{ marginTop: 48, alignSelf: 'flex-start', ...usePop(16) }}>
        <div style={{ padding: '28px 44px', borderRadius: 999, background: t.text === '#ffffff' && t.em === '#ffffff' ? '#fff' : C.accent, color: t.em === '#ffffff' ? C.accent : '#fff', fontSize: 38, fontWeight: 700, boxShadow: '0 18px 40px rgba(47,109,255,.4)', transform: `scale(${pulse})` }}>
          {s.handle}
        </div>
      </div>
    </>
  );
};

const VsSide: React.FC<{ label: string; text: string; right?: boolean; t: Theme; d: number }> = ({ label, text, right, t, d }) => (
  <div
    style={{
      padding: '34px', borderRadius: 28, fontSize: 50, lineHeight: 1.15, fontWeight: 700, letterSpacing: '-.02em',
      background: right ? (t.em === '#ffffff' ? '#fff' : C.accent) : t.card,
      color: right ? (t.em === '#ffffff' ? C.accent : '#fff') : t.text,
      border: right ? 'none' : `1px solid ${t.cardBorder}`,
      ...(right ? usePop(d) : useEnter(d)),
    }}
  >
    <small style={{ ...mono, display: 'block', fontSize: 20, fontWeight: 400, marginBottom: 14, opacity: 0.75 }}>{label}</small>
    {text}
  </div>
);

const Vs: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <div style={{ fontSize: 110, lineHeight: 1, fontWeight: 700, color: t.em, ...usePop(0) }}>{s.n}</div>
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <VsSide label={s.lt} text={s.l} t={t} d={6} />
      <div style={{ fontSize: 56, textAlign: 'center', opacity: 0.6, color: t.text, ...useEnter(20, 20) }}>↓</div>
      <VsSide label={s.rt} text={s.r} right t={t} d={28} />
    </div>
  </>
);

const KenBurnsImg: React.FC<{ src: string; style?: React.CSSProperties; pos?: string }> = ({ src, style, pos = 'top' }) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [0, 120], [1, 1.06], { extrapolateRight: 'clamp' });
  return (
    <div style={{ overflow: 'hidden', lineHeight: 0 }}>
      <Img src={src} style={{ display: 'block', width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: pos, transform: `scale(${sc})`, transformOrigin: pos, ...style }} />
    </div>
  );
};

const ImgSlide: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <h2 style={{ fontSize: 80, lineHeight: 1.02, letterSpacing: '-.03em', fontWeight: 700, marginTop: 24, color: t.text, ...useEnter(4) }}>
      <Rich html={s.title} em={t.em} />
    </h2>
    <div style={{ marginTop: 40, ...useEnter(10, 80) }}>
      <BrowserFrame label={s.label || (s.html ? 'tokokami.blogspot.com' : 'Template Vanaila')}>
        {s.html ? <div dangerouslySetInnerHTML={{ __html: s.html }} /> : <KenBurnsImg src={asset(s.img)} pos={s.label ? 'left top' : 'top'} />}
      </BrowserFrame>
    </div>
    {s.ask ? (
      <div style={{ marginTop: 34, alignSelf: 'flex-start', padding: '22px 32px', borderRadius: 999, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)', fontSize: 34, fontWeight: 600, color: t.text, ...usePop(24) }}>
        {s.ask}
      </div>
    ) : null}
  </>
);

const Collage: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const place = [
    { left: 0, top: 0, rot: -5 },
    { right: 0, top: 140, rot: 4 },
    { left: 40, top: 290, rot: -2 },
  ];
  return (
    <>
      <Kicker t={t} text={s.kicker} />
      <Title t={t} html={s.title} size={92} />
      <div style={{ marginTop: 36, position: 'relative', height: 700 }}>
        {s.imgs.map((x: string, i: number) => {
          const p = spring({ frame: frame - 10 - i * 7, fps, config: { damping: 14 } });
          const pl = place[i];
          return (
            <div key={i} style={{ position: 'absolute', width: 560, ...pl, zIndex: i + 1, opacity: p, transform: `translateY(${(1 - p) * 200}px) rotate(${pl.rot * p}deg)` }}>
              <BrowserFrame>
                <Img src={asset(x)} style={{ display: 'block', width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: 'top' }} />
              </BrowserFrame>
            </div>
          );
        })}
      </div>
      <Body t={t} text={s.sub} d={30} />
    </>
  );
};

const Split: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <Title t={t} html={s.title} size={64} />
    <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {[[s.imgA, s.labelA, s.htmlA], [s.imgB, s.labelB, s.htmlB]].map(([im, lb, h], i) => (
        <div key={i} style={useEnter(10 + i * 10, 80)}>
          <BrowserFrame label={h ? 'tokokami.blogspot.com' : 'Template Vanaila'}>
            {h ? (
              <div dangerouslySetInnerHTML={{ __html: (h as string).replace("class='retro'", "class='retro' style='aspect-ratio:16/6.4;font-size:.8em'") }} />
            ) : (
              <Img src={asset(im as string)} style={{ display: 'block', width: '100%', aspectRatio: '16/6.4', objectFit: 'cover', objectPosition: 'top' }} />
            )}
          </BrowserFrame>
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700, color: t.text }}>{lb}</div>
        </div>
      ))}
    </div>
  </>
);

const Guess: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const zoom = Number(s.zoom) * interpolate(frame, [0, 90], [1, 1.08], { extrapolateRight: 'clamp' });
  return (
    <>
      <Kicker t={t} text={s.kicker} />
      <h2 style={{ fontSize: 80, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.03em', marginTop: 24, color: t.text, ...useEnter(4) }}>{s.title}</h2>
      <div style={{ marginTop: 40, height: 600, borderRadius: 28, overflow: 'hidden', border: '2px solid rgba(255,255,255,.25)', position: 'relative', ...useEnter(8, 60) }}>
        <Img src={asset(s.img)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.pos, transform: `scale(${zoom})`, transformOrigin: s.pos }} />
        <div style={{ position: 'absolute', right: 20, top: 20, width: 84, height: 84, borderRadius: '50%', background: C.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 52, fontWeight: 700, transform: `scale(${1 + 0.08 * Math.sin(frame / 5)})` }}>?</div>
      </div>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {s.options.map((o: string, i: number) => (
          <div key={i} style={{ padding: '22px 28px', borderRadius: 20, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.22)', fontSize: 34, fontWeight: 600, color: t.text, ...useEnter(20 + i * 6, 30) }}>{o}</div>
        ))}
      </div>
    </>
  );
};

const Chat: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <h2 style={{ fontSize: 80, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.03em', marginTop: 24, color: t.text, ...useEnter(4) }}>{s.title}</h2>
    <div style={{ marginTop: 36, borderRadius: 40, background: '#e9eef6', padding: '26px 24px 30px', boxShadow: '0 40px 90px rgba(0,0,0,.45)', ...useEnter(8, 60) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '1px solid #d6dfed', color: C.ink, fontSize: 28, fontWeight: 700 }}>
        <b style={{ width: 60, height: 60, borderRadius: '50%', background: C.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 26 }}>{s.initial}</b>
        <div>
          {s.sender}
          <small style={{ display: 'block', fontSize: 20, fontWeight: 400, color: C.muted }}>typing…</small>
        </div>
      </div>
      {s.msgs.map(([m, tm]: [string, string], i: number) => (
        <div key={i} style={{ marginTop: 18, maxWidth: '86%', padding: '20px 24px', borderRadius: '24px 24px 24px 6px', background: '#fff', color: C.ink, fontSize: 30, lineHeight: 1.35, boxShadow: '0 4px 10px rgba(17,37,73,.08)', ...usePop(22 + i * 22) }}>
          {m}
          <time style={{ display: 'block', textAlign: 'right', fontSize: 18, color: '#8a97ad', marginTop: 6 }}>{tm}</time>
        </div>
      ))}
    </div>
  </>
);

const Annot: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Kicker t={t} text={s.kicker} />
      <h2 style={{ fontSize: 80, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.03em', marginTop: 24, color: t.text, ...useEnter(4) }}>
        <Rich html={s.title} em={t.em} />
      </h2>
      <div style={{ marginTop: 40, ...useEnter(8, 60) }}>
        <BrowserFrame label={s.label}>
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <Img src={asset(s.img)} style={{ width: '100%', display: 'block' }} />
            {s.boxes.map(([x, y, w, h]: number[], i: number) => {
              const p = spring({ frame: frame - 20 - i * 14, fps, config: { damping: 12 } });
              return (
                <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: `5px solid ${C.yellow}`, borderRadius: 14, boxShadow: `0 0 30px rgba(255,213,74,${0.55 * p})`, opacity: p, transform: `scale(${1.15 - 0.15 * p})` }}>
                  <b style={{ position: 'absolute', left: -22, top: -22, width: 52, height: 52, borderRadius: '50%', background: C.yellow, color: C.ink, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{i + 1}</b>
                </div>
              );
            })}
          </div>
        </BrowserFrame>
      </div>
      <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {s.notes.map((n: string, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 18, alignItems: 'start', fontSize: 32, lineHeight: 1.3, fontWeight: 500, color: t.text, ...useEnter(30 + i * 14, 30) }}>
            <b style={{ width: 52, height: 52, borderRadius: '50%', background: C.yellow, color: C.ink, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800 }}>{i + 1}</b>
            <span>{n}</span>
          </div>
        ))}
      </div>
    </>
  );
};

const Shot: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <h2 style={{ fontSize: 80, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.03em', marginTop: 24, color: t.text, ...useEnter(4) }}>
      <Rich html={s.title} em={t.em} />
    </h2>
    <div style={{ marginTop: 40, height: 520, borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 70px rgba(8,15,30,.35)', ...useEnter(10, 60) }}>
      <KenBurnsImg src={asset(s.img)} pos="left top" style={{ aspectRatio: 'auto', height: 520 }} />
    </div>
    <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {s.items.map((x: string, i: number) => (
        <div key={i} style={{ fontSize: 34, fontWeight: 600, color: t.text, ...useEnter(20 + i * 6, 20) }}>
          <span style={{ color: t.em }}>✓ </span>
          {x}
        </div>
      ))}
    </div>
  </>
);

export const SlideBody: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => {
  switch (s.type) {
    case 'hook': return <Hook s={s} t={t} />;
    case 'point': return <Point s={s} t={t} />;
    case 'check': return <Check s={s} t={t} />;
    case 'cta': return <Cta s={s} t={t} />;
    case 'vs': return <Vs s={s} t={t} />;
    case 'img': return <ImgSlide s={s} t={t} />;
    case 'collage': return <Collage s={s} t={t} />;
    case 'split': return <Split s={s} t={t} />;
    case 'guess': return <Guess s={s} t={t} />;
    case 'chat': return <Chat s={s} t={t} />;
    case 'annot': return <Annot s={s} t={t} />;
    case 'shot': return <Shot s={s} t={t} />;
    default: return null;
  }
};

/** First image referenced by a slide (used for the blurred photo background). */
export const slideImage = (s: Slide) => s.img || s.imgA || s.imgB || (s.imgs && s.imgs[0]) || '';
