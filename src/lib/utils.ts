export type ClassValue = string | number | null | undefined | false | ClassArray | { [key: string]: unknown };

export type ClassArray = Array<ClassValue>;

export function cn(...inputs: ClassValue[]): string {
  const flatten = (items: ClassValue[]): string[] =>
    items.flatMap((item) => {
      if (!item) return [];
      if (Array.isArray(item)) return flatten(item);
      if (typeof item === 'string' || typeof item === 'number') return [String(item)];
      if (typeof item === 'object') {
        return Object.entries(item)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    });

  return flatten(inputs).join(' ');
}

export const nowIso = () => new Date().toISOString();

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

export const asBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};