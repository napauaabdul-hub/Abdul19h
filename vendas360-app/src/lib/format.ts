export function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function fmtMT(v: number): string {
  const n = round2(v);
  const neg = n < 0;
  const abs = Math.abs(n);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  return `${neg ? "-" : ""}${groupThousands(intPart)},${decPart} MT`;
}

export function fmtQ(v: number, unit = "un"): string {
  const s = new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 2 }).format(v);
  return `${s} ${unit}`;
}

export function nowStr(): string {
  return toStored(new Date());
}

export function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toStored(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function fmtDT(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s);
  if (!m) return s;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

export function fmtDateInput(s: string): string {
  return s.slice(0, 10);
}
