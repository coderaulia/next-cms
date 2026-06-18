'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { useCursorMode } from './CustomCursor';

// Minimal EN / ID segmented control. Switches locale on the *current* path
// (locale-agnostic pathname from next-intl), so /about <-> /id/about.
export function LanguageToggle() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { setMode } = useCursorMode();

  const switchTo = (next: string) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      className="v-lang-toggle"
      role="group"
      aria-label={t('languageLabel')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(10,14,26,0.18)',
        borderRadius: 999,
        padding: 2,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 11,
        letterSpacing: '0.06em'
      }}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={active}
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
            style={{
              border: 'none',
              cursor: active ? 'default' : 'pointer',
              padding: '4px 9px',
              borderRadius: 999,
              background: active ? '#0A0E1A' : 'transparent',
              color: active ? '#F4F4F0' : 'rgba(10,14,26,0.6)',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            {code === 'en' ? t('toggleEn') : t('toggleId')}
          </button>
        );
      })}
    </div>
  );
}
