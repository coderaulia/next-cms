import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { asset, BrowserFrame, C, Card, Rich, Theme, useEnter, usePop } from './theme';

export type Slide = Record<string, any> & { type: string };

const mono = (t: Theme): React.CSSProperties => ({ fontFamily: t.mf, letterSpacing: '.06em', textTransform: 'uppercase' });

/** Small label above a title: black tag (neo) or "// label" in mint (neon). */
const Kicker: React.FC<{ t: Theme; text?: string; d?: number }> = ({ t, text, d = 0 }) =>
  text ? (
    <div style={{ ...mono(t), alignSelf: 'flex-start', fontWeight: 700, fontSize: 24, marginBottom: 18, ...(t.neo ? { background: '#111', color: C.y, padding: '6px 16px' } : { color: C.m }), ...useEnter(d, 20) }}>
      {t.neo ? '' : '// '}
      {text}
    </div>
  ) : null;

/** Shrink a title when one word is too long to fit the card (avoids mid-word breaks). */
export const fit = (html: string, size: number) => {
  const longest = Math.max(...String(html).replace(/<[^>]+>/g, '').split(/\s+/).map((w) => w.length), 1);
  return Math.min(size, Math.floor(760 / (longest * 0.56)));
};
const titleStyle = (t: Theme, size: number): React.CSSProperties => ({ fontSize: size, lineHeight: 1.1, letterSpacing: '-.035em', fontWeight: 700, overflowWrap: 'anywhere', color: 'inherit', fontFamily: t.hf });

const Title: React.FC<{ t: Theme; html: string; size?: number; d?: number; lh?: number }> = ({ t, html, size = 100, d = 4, lh }) => (
  <h1 style={{ ...titleStyle(t, size), ...(lh ? { lineHeight: lh } : {}), ...useEnter(d) }}>
    <Rich html={html} t={t} />
  </h1>
);

const PtTitle: React.FC<{ t: Theme; html: string; d?: number }> = ({ t, html, d = 4 }) => (
  <h2 style={{ ...titleStyle(t, 80), lineHeight: 1.05, color: t.text, ...useEnter(d) }}>
    <Rich html={html} t={t} />
  </h2>
);

const Body: React.FC<{ t: Theme; text?: string; d?: number; size?: number; mt?: number; color?: string }> = ({ t, text, d = 10, size = 38, mt = 26, color }) =>
  text ? (
    <p style={{ fontSize: size, lineHeight: 1.4, marginTop: mt, fontWeight: 500, color: color || t.muted, ...useEnter(d) }}>
      <Rich html={text} t={t} body />
    </p>
  ) : null;

const Fix: React.FC<{ t: Theme; label?: string; text?: string; d?: number }> = ({ t, label, text, d = 18 }) => {
  if (!text) return null;
  return (
    <div
      style={{
        marginTop: 36, padding: '22px 26px', fontSize: 34, lineHeight: 1.3, fontWeight: 700, ...usePop(d),
        ...(t.neo
          ? { border: '4px solid #111', background: '#fff3a6', boxShadow: '6px 6px 0 #111', color: '#111' }
          : { border: '1px solid rgba(255,225,77,.5)', background: 'rgba(255,225,77,.1)', borderRadius: 18, color: t.text }),
      }}
    >
      <span
        style={{
          ...mono(t), display: 'block', width: 'fit-content', fontWeight: 700, fontSize: 20, marginBottom: t.neo ? 12 : 8,
          ...(t.neo ? { background: C.p, border: '3px solid #111', padding: '3px 12px', color: '#111' } : { color: C.y }),
        }}
      >
        {label || 'SOLUSI'}
      </span>
      {text}
    </div>
  );
};

const isEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(String(s).replace(/<[^>]+>/g, ''));
const NumBadge: React.FC<{ t: Theme; n: string; size?: number; d?: number }> = ({ t, n, size = 150, d = 0 }) => {
  const txt = String(n).replace(/<[^>]+>/g, '');
  const len = [...txt].length;
  const emo = isEmoji(txt);
  const fs = size === 150 ? (len > 4 ? 46 : len > 2 && !emo ? 60 : 76) : 60;
  if (t.neo)
    return (
      <div style={{ width: 'fit-content', minWidth: size, height: size, padding: '0 30px', borderRadius: size / 2, background: C.b, color: '#fff', border: '6px solid #111', boxShadow: '8px 8px 0 #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1, ...(size === 150 ? { margin: '-104px 0 26px -26px' } : { marginBottom: 0 }), ...usePop(d) }}>
        {n}
      </div>
    );
  return (
    <div style={{ fontSize: size === 150 ? 140 : 90, lineHeight: 1, fontWeight: 700, marginBottom: 14, fontFamily: t.hf, ...(emo ? { color: t.text } : { background: 'linear-gradient(90deg,#ffe14d,#ff5d8f)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }), ...usePop(d) }}>
      {n}
    </div>
  );
};

const Hook: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <div style={useEnter(0, 60)}>
      <Card t={t} v="y" rot={-1.5}>
        {s.kicker ? (
          t.neo ? (
            <div style={{ position: 'absolute', top: -34, right: -14, ...usePop(10) }}>
              <div style={{ transform: 'rotate(6deg)', background: C.p, color: '#111', border: '5px solid #111', boxShadow: '6px 6px 0 #111', padding: '8px 20px', ...mono(t), fontWeight: 700, fontSize: 26 }}>{s.kicker}</div>
            </div>
          ) : (
            <div style={{ ...mono(t), color: C.m, fontSize: 24, marginBottom: 22 }}>// {s.kicker}</div>
          )
        ) : null}
        <h1 style={titleStyle(t, fit(s.title, 104))}>
          <Rich html={s.title} t={t} card />
        </h1>
      </Card>
    </div>
    <Body t={t} text={s.sub} d={14} mt={44} />
  </>
);

const Point: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <div style={useEnter(0, 50)}>
    <Card t={t} v="w" rot={t.neo ? 1 : 0}>
      <NumBadge t={t} n={s.n} d={4} />
      <h2 style={{ ...titleStyle(t, fit(s.title, 80)), lineHeight: 1.05 }}>
        <Rich html={s.title} t={t} />
      </h2>
      <Body t={t} text={s.body} d={12} color={t.neo ? '#2b2b2b' : undefined} />
      <Fix t={t} label={s.fixLabel} text={s.fix} d={22} />
    </Card>
  </div>
);

const Check: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <PtTitle t={t} html={s.title} d={0} />
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {s.items.map((x: string, i: number) => (
        <div
          key={i}
          style={{
            display: 'grid', gridTemplateColumns: '64px 1fr', gap: 22, alignItems: 'center', fontSize: 36, lineHeight: 1.3, fontWeight: t.neo ? 700 : 600, padding: '24px 26px', ...useEnter(10 + i * 8, 30),
            ...(t.neo ? { background: '#fff', color: '#111', border: '5px solid #111', boxShadow: '8px 8px 0 #111' } : { background: 'rgba(255,255,255,.07)', color: t.text, border: '1px solid rgba(255,255,255,.16)', borderRadius: 22 }),
          }}
        >
          <b style={{ width: 64, height: 64, display: 'grid', placeItems: 'center', fontSize: 30, borderRadius: '50%', ...(t.neo ? { background: C.b, color: '#fff', border: '4px solid #111' } : { background: 'linear-gradient(135deg,#ffe14d,#ff5d8f)', color: '#111' }) }}>{i + 1}</b>
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
      <div style={useEnter(0, 60)}>
        <Card t={t} v="y" rot={-1.5}>
          <h2 style={titleStyle(t, fit(s.title, 92))}>
            <Rich html={s.title} t={t} card />
          </h2>
          <Body t={t} text={s.sub} d={8} mt={28} color={t.neo ? '#2b2b2b' : undefined} />
        </Card>
      </div>
      <div style={{ marginTop: 56, alignSelf: 'flex-start', ...usePop(16) }}>
        <div
          style={{
            fontSize: 38, fontWeight: 700, transform: `scale(${pulse})`, transformOrigin: 'left center',
            ...(t.neo ? { background: '#fff', color: '#111', border: '6px solid #111', boxShadow: '10px 10px 0 #111', padding: '24px 42px' } : { background: 'linear-gradient(90deg,#3d5afe,#ff5d8f)', color: '#fff', borderRadius: 999, padding: '28px 44px', boxShadow: '0 0 50px rgba(255,93,143,.4)' }),
          }}
        >
          {s.handle}
        </div>
      </div>
    </>
  );
};

const VsSide: React.FC<{ label: string; text: string; right?: boolean; t: Theme; d: number }> = ({ label, text, right, t, d }) => (
  <div
    style={{
      padding: '30px 34px', fontSize: 50, lineHeight: 1.15, fontWeight: 700, letterSpacing: '-.02em',
      ...(t.neo
        ? { background: right ? C.y : '#fff', color: '#111', border: '6px solid #111', boxShadow: '10px 10px 0 #111' }
        : right
          ? { background: 'linear-gradient(135deg,#ffe14d,#ff5d8f)', color: '#111', borderRadius: 24 }
          : { background: 'rgba(255,255,255,.06)', color: t.text, border: '1px solid rgba(255,255,255,.16)', borderRadius: 24 }),
      ...(right ? usePop(d) : useEnter(d)),
    }}
  >
    <small style={{ ...mono(t), display: 'block', fontSize: 20, fontWeight: 700, marginBottom: 12, opacity: 0.7 }}>{label}</small>
    {text}
  </div>
);

const Vs: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <NumBadge t={t} n={s.n} size={110} d={0} />
    <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <VsSide label={s.lt} text={s.l} t={t} d={6} />
      <div style={{ fontSize: 60, lineHeight: 1, fontWeight: 700, textAlign: 'center', color: t.text, ...useEnter(20, 20) }}>↓</div>
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

const Ask: React.FC<{ t: Theme; text: string }> = ({ t, text }) => (
  <div
    style={{
      marginTop: 30, alignSelf: 'flex-start', padding: '18px 30px', fontSize: 34, fontWeight: 700, ...usePop(24),
      ...(t.neo ? { background: C.y, border: '5px solid #111', boxShadow: '6px 6px 0 #111', color: '#111' } : { background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, color: t.text }),
    }}
  >
    {text}
  </div>
);

const ImgSlide: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <PtTitle t={t} html={s.title} />
    <div style={{ marginTop: 36, ...useEnter(10, 80) }}>
      <BrowserFrame t={t} label={s.label || (s.html ? 'tokokami.blogspot.com' : 'Template Vanaila')}>
        {s.html ? <div dangerouslySetInnerHTML={{ __html: s.html }} /> : <KenBurnsImg src={asset(s.img)} pos={s.label ? 'left top' : 'top'} />}
      </BrowserFrame>
    </div>
    {s.ask ? <Ask t={t} text={s.ask} /> : null}
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
      <Title t={t} html={s.title} size={88} lh={1.02} />
      <div style={{ marginTop: 20, position: 'relative', height: 700 }}>
        {s.imgs.map((x: string, i: number) => {
          const p = spring({ frame: frame - 10 - i * 7, fps, config: { damping: 14 } });
          const pl = place[i];
          return (
            <div key={i} style={{ position: 'absolute', width: 560, ...pl, zIndex: i + 1, opacity: p, transform: `translateY(${(1 - p) * 200}px) rotate(${pl.rot * p}deg)` }}>
              <BrowserFrame t={t}>
                <Img src={asset(x)} style={{ display: 'block', width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: 'top' }} />
              </BrowserFrame>
            </div>
          );
        })}
      </div>
      <Body t={t} text={s.sub} d={30} mt={8} size={38} />
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
          <BrowserFrame t={t} label={h ? 'tokokami.blogspot.com' : 'Template Vanaila'}>
            {h ? (
              <div dangerouslySetInnerHTML={{ __html: (h as string).replace("class='retro'", "class='retro' style='aspect-ratio:16/6.4;font-size:.8em'") }} />
            ) : (
              <Img src={asset(im as string)} style={{ display: 'block', width: '100%', aspectRatio: '16/6.4', objectFit: 'cover', objectPosition: 'top' }} />
            )}
          </BrowserFrame>
          <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700, color: t.text }}>{lb}</div>
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
      <PtTitle t={t} html={s.title} />
      <div
        style={{
          marginTop: 36, height: 560, overflow: 'hidden', position: 'relative', ...useEnter(8, 60),
          ...(t.neo ? { border: '6px solid #111', boxShadow: '12px 12px 0 #111', borderRadius: 6 } : { border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 40px 90px rgba(0,0,0,.55)', borderRadius: 28 }),
        }}
      >
        <Img src={asset(s.img)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.pos, transform: `scale(${zoom})`, transformOrigin: s.pos }} />
        <div style={{ position: 'absolute', right: 20, top: 20, width: 84, height: 84, borderRadius: '50%', background: C.p, border: '5px solid #111', color: '#111', display: 'grid', placeItems: 'center', fontSize: 52, fontWeight: 700, transform: `scale(${1 + 0.08 * Math.sin(frame / 5)})` }}>?</div>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {s.options.map((o: string, i: number) => (
          <div
            key={i}
            style={{
              padding: '20px 26px', fontSize: 34, fontWeight: 700, ...useEnter(20 + i * 6, 30),
              ...(t.neo ? { background: '#fff', color: '#111', border: '4px solid #111', boxShadow: '6px 6px 0 #111' } : { background: 'rgba(255,255,255,.1)', color: t.text, border: '1px solid rgba(255,255,255,.22)', borderRadius: 20, fontWeight: 600 }),
            }}
          >
            {o}
          </div>
        ))}
      </div>
    </>
  );
};

const Chat: React.FC<{ s: Slide; t: Theme }> = ({ s, t }) => (
  <>
    <Kicker t={t} text={s.kicker} />
    <PtTitle t={t} html={s.title} />
    <div
      style={{
        marginTop: 32, padding: '24px 22px 28px', color: '#111', background: t.neo ? '#fff' : '#e9eef6', borderRadius: 34, ...useEnter(8, 60),
        ...(t.neo ? { border: '6px solid #111', boxShadow: '12px 12px 0 #111' } : { border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 40px 90px rgba(0,0,0,.45)' }),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '4px solid #111', fontSize: 28, fontWeight: 700 }}>
        <b style={{ width: 60, height: 60, borderRadius: '50%', background: C.b, color: '#fff', border: '4px solid #111', display: 'grid', placeItems: 'center', fontSize: 26 }}>{s.initial}</b>
        <div>
          {s.sender}
          <small style={{ display: 'block', fontSize: 20, fontWeight: 500, color: '#555' }}>typing…</small>
        </div>
      </div>
      {s.msgs.map(([m, tm]: [string, string], i: number) => (
        <div key={i} style={{ marginTop: 18, maxWidth: '86%', padding: '20px 24px', borderRadius: '24px 24px 24px 6px', background: '#eef1ff', border: '3px solid #111', color: '#111', fontSize: 30, lineHeight: 1.35, fontWeight: 500, ...usePop(22 + i * 22) }}>
          {m}
          <time style={{ display: 'block', textAlign: 'right', fontSize: 18, color: '#666', marginTop: 6 }}>{tm}</time>
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
      <PtTitle t={t} html={s.title} />
      <div style={{ marginTop: 36, ...useEnter(8, 60) }}>
        <BrowserFrame t={t} label={s.label}>
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <Img src={asset(s.img)} style={{ width: '100%', display: 'block' }} />
            {s.boxes.map(([x, y, w, h]: number[], i: number) => {
              const p = spring({ frame: frame - 20 - i * 14, fps, config: { damping: 12 } });
              return (
                <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: `6px solid ${C.p}`, borderRadius: 10, boxShadow: '0 0 0 3px #111', opacity: p, transform: `scale(${1.15 - 0.15 * p})` }}>
                  <b style={{ position: 'absolute', left: -24, top: -24, width: 52, height: 52, borderRadius: '50%', background: C.y, border: '4px solid #111', color: '#111', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{i + 1}</b>
                </div>
              );
            })}
          </div>
        </BrowserFrame>
      </div>
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {s.notes.map((n: string, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 18, alignItems: 'start', fontSize: 32, lineHeight: 1.3, fontWeight: 700, color: t.text, ...useEnter(30 + i * 14, 30) }}>
            <b style={{ width: 52, height: 52, borderRadius: '50%', background: C.y, border: '4px solid #111', color: '#111', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 800 }}>{i + 1}</b>
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
    <PtTitle t={t} html={s.title} />
    <div
      style={{
        marginTop: 36, height: 520, overflow: 'hidden', background: '#fff', ...useEnter(10, 60),
        ...(t.neo ? { border: '6px solid #111', boxShadow: '12px 12px 0 #111', borderRadius: 6 } : { border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 30px 70px rgba(0,0,0,.5)', borderRadius: 18 }),
      }}
    >
      <KenBurnsImg src={asset(s.img)} pos="left top" style={{ aspectRatio: 'auto', height: 520 }} />
    </div>
    <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {s.items.map((x: string, i: number) => (
        <div key={i} style={{ fontSize: 34, fontWeight: 700, color: t.text, ...useEnter(20 + i * 6, 20) }}>
          <span style={{ color: t.neo ? C.p : C.m, WebkitTextStroke: t.neo ? '1px #111' : 0 }}>✓ </span>
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
