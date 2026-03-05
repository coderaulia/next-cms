import type { LandingPage, PageSection } from '@/features/cms/types';

const defaultTheme = {
  background: '#f9fafb',
  text: '#111827',
  accent: '#0f766e'
} as const;

export function sectionWithFallback(
  page: LandingPage,
  index: number,
  fallback: Omit<PageSection, 'theme'> & { theme?: PageSection['theme'] }
): PageSection {
  const source = page.sections[index];
  const theme = {
    ...defaultTheme,
    ...(fallback.theme ?? {}),
    ...(source?.theme ?? {})
  };

  return {
    id: source?.id ?? fallback.id,
    heading: source?.heading ?? fallback.heading,
    body: source?.body ?? fallback.body,
    ctaLabel: source?.ctaLabel ?? fallback.ctaLabel,
    ctaHref: source?.ctaHref ?? fallback.ctaHref,
    mediaImage: source?.mediaImage ?? fallback.mediaImage,
    mediaAlt: source?.mediaAlt ?? fallback.mediaAlt,
    layout: source?.layout ?? fallback.layout,
    theme
  };
}

export function splitAccent(value: string, fallbackAccent: string) {
  const [primaryRaw, accentRaw] = value.split('|');
  const primary = primaryRaw?.trim() || value.trim();
  const accent = accentRaw?.trim() || fallbackAccent;
  return { primary, accent };
}

export function paragraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
}

export function formatDateLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
