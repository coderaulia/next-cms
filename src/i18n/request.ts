import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

import { routing } from './routing';

// Marker prefix used in messages/id.json for strings awaiting translation.
// Any value still carrying this marker falls back to the English string so
// the live site never shows placeholder text — even before translation is done.
const PLACEHOLDER = '[[ID]]';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPlainObject(value: Json): value is { [key: string]: Json } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges a locale's messages over the English base, but ignores any
 * locale string still marked with the PLACEHOLDER prefix (untranslated) —
 * those inherit the English value. Structure is driven by the English base.
 */
function mergeWithFallback(base: Json, override: Json | undefined): Json {
  if (override === undefined) return base;

  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((item, index) =>
      index < override.length ? mergeWithFallback(item, override[index]) : item
    );
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result: { [key: string]: Json } = { ...base };
    for (const key of Object.keys(base)) {
      if (key in override) {
        result[key] = mergeWithFallback(base[key], override[key]);
      }
    }
    return result;
  }

  if (typeof override === 'string') {
    return override.trimStart().startsWith(PLACEHOLDER) ? base : override;
  }

  return override;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const en = (await import('../../messages/en.json')).default as Json;
  const messages =
    locale === routing.defaultLocale
      ? en
      : (mergeWithFallback(en, (await import(`../../messages/${locale}.json`)).default as Json) as Record<
          string,
          Json
        >);

  return {
    locale,
    messages: messages as Record<string, Json>
  };
});
