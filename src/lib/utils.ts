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