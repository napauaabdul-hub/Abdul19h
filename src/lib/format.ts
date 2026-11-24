export function formatMT(value: number): string {
  if (!Number.isFinite(value)) return 'MT 0,00';
  return (
    'MT ' +
    value
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  );
}

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  return value
    .toFixed(decimals)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumber(input: string): number {
  let s = input.trim().replace(/\s/g, '');
  s = s.replace(/\.(?=\d{3}(\D|$))/g, '');
  s = s.replace(',', '.');
  const value = Number(s);
  return Number.isFinite(value) ? value : 0;
}

export function roundForUnit(value: number, unidade: string): number {
  if (unidade === 'un' || unidade === 'saco' || unidade === 'kg' || unidade === 'dia') return Math.ceil(value);
  return Math.round(value * 100) / 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
