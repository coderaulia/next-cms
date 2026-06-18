import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'id'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English stays unprefixed (existing URLs unchanged); Indonesian served at /id/...
  localePrefix: 'as-needed'
});
