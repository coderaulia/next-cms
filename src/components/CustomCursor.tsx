'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type CursorMode = 'default' | 'link' | 'view';

const CursorCtx = createContext<{ setMode: (m: CursorMode) => void }>({ setMode: () => {} });

export function useCursorMode() {
  return useContext(CursorCtx);
}

export function CustomCursorProvider({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [mode, setMode] = useState<CursorMode>('default');

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const size = mode === 'view' ? 88 : mode === 'link' ? 36 : 14;

  return (
    <CursorCtx.Provider value={{ setMode }}>
      {children}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: size,
          height: size,
          borderRadius: '999px',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.25s cubic-bezier(.2,.8,.2,1), height 0.25s cubic-bezier(.2,.8,.2,1)',
          zIndex: 9999,
          mixBlendMode: mode === 'default' ? 'difference' : 'normal',
          background: mode !== 'default' ? '#0033FF' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        {mode === 'view' ? 'VIEW →' : null}
      </div>
    </CursorCtx.Provider>
  );
}
