'use client';

import { useMemo } from 'react';

const COMMON_LANGUAGES = [
  'en-US',
  'en-GB',
  'id-ID',
  'ms-MY',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'ko-KR',
  'th-TH',
  'vi-VN',
  'hi-IN',
  'ar-SA',
  'de-DE',
  'fr-FR',
  'es-ES',
  'es-MX',
  'pt-BR',
  'it-IT',
  'nl-NL',
  'ru-RU',
  'tr-TR',
  'pl-PL'
];

const DATE_FORMATS = ['MMMM d, yyyy', 'MMM d, yyyy', 'd MMMM yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];
const TIME_FORMATS = ['HH:mm', 'h:mm a', 'HH:mm:ss'];
const CUSTOM = '__custom__';

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'America/Los_Angeles'];
  }
}

function languageLabel(code: string): string {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
    return name && name !== code ? `${name} (${code})` : code;
  } catch {
    return code;
  }
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

/** Minimal date-fns-style token formatter for previews (yyyy MM/MMM/MMMM dd/d HH/H hh/h mm ss a). */
export function formatPreview(pattern: string, date: Date, locale: string): string {
  const safeLocale = (() => {
    try {
      new Intl.DateTimeFormat(locale);
      return locale;
    } catch {
      return 'en-US';
    }
  })();
  const monthLong = new Intl.DateTimeFormat(safeLocale, { month: 'long' }).format(date);
  const monthShort = new Intl.DateTimeFormat(safeLocale, { month: 'short' }).format(date);
  const hours = date.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;

  return pattern.replace(/yyyy|MMMM|MMM|MM|dd|HH|hh|mm|ss|H|h|d|a/g, (token) => {
    switch (token) {
      case 'yyyy': return String(date.getFullYear());
      case 'MMMM': return monthLong;
      case 'MMM': return monthShort;
      case 'MM': return pad(date.getMonth() + 1, 2);
      case 'dd': return pad(date.getDate(), 2);
      case 'd': return String(date.getDate());
      case 'HH': return pad(hours, 2);
      case 'H': return String(hours);
      case 'hh': return pad(h12, 2);
      case 'h': return String(h12);
      case 'mm': return pad(date.getMinutes(), 2);
      case 'ss': return pad(date.getSeconds(), 2);
      case 'a': return hours < 12 ? 'AM' : 'PM';
      default: return token;
    }
  });
}

type FormatFieldProps = {
  label: string;
  value: string;
  presets: string[];
  sampleDate: Date;
  locale: string;
  onChange: (value: string) => void;
};

function FormatField({ label, value, presets, sampleDate, locale, onChange }: FormatFieldProps) {
  const isPreset = presets.includes(value);
  return (
    <label>
      {label}
      <select
        value={isPreset ? value : CUSTOM}
        onChange={(event) => {
          if (event.target.value !== CUSTOM) onChange(event.target.value);
        }}
      >
        {presets.map((preset) => (
          <option key={preset} value={preset}>
            {formatPreview(preset, sampleDate, locale)} — {preset}
          </option>
        ))}
        <option value={CUSTOM}>Custom…</option>
      </select>
      {!isPreset ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={presets[0]}
          aria-label={`${label} custom pattern`}
        />
      ) : null}
      <span className="admin-subtle">Preview: {formatPreview(value, sampleDate, locale)}</span>
    </label>
  );
}

type GeneralLocaleFieldsProps = {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  onPatch: (patch: Partial<{ timezone: string; language: string; dateFormat: string; timeFormat: string }>) => void;
};

export function GeneralLocaleFields({ timezone, language, dateFormat, timeFormat, onPatch }: GeneralLocaleFieldsProps) {
  const timezones = useMemo(() => {
    const list = getTimezones();
    return timezone && !list.includes(timezone) ? [timezone, ...list] : list;
  }, [timezone]);

  const languages = useMemo(
    () => (language && !COMMON_LANGUAGES.includes(language) ? [language, ...COMMON_LANGUAGES] : COMMON_LANGUAGES),
    [language]
  );

  const sampleDate = useMemo(() => new Date(), []);

  return (
    <>
      <label>
        Time zone
        <select value={timezone} onChange={(event) => onPatch({ timezone: event.target.value })}>
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </label>
      <label>
        Language
        <select value={language} onChange={(event) => onPatch({ language: event.target.value })}>
          {languages.map((code) => (
            <option key={code} value={code}>
              {languageLabel(code)}
            </option>
          ))}
        </select>
      </label>
      <FormatField
        label="Date format"
        value={dateFormat}
        presets={DATE_FORMATS}
        sampleDate={sampleDate}
        locale={language}
        onChange={(value) => onPatch({ dateFormat: value })}
      />
      <FormatField
        label="Time format"
        value={timeFormat}
        presets={TIME_FORMATS}
        sampleDate={sampleDate}
        locale={language}
        onChange={(value) => onPatch({ timeFormat: value })}
      />
    </>
  );
}
