function isBlank(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

export function toDatetimeLocalValue(value: string | null | undefined) {
  if (isBlank(value)) {
    return '';
  }

  const date = new Date(value ?? '');
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 16);
}

export function fromDatetimeLocalValue(value: string) {
  if (isBlank(value)) {
    return null;
  }

  const date = new Date(`${value}Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
