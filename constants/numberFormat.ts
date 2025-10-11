export function formatCash(value: number): string {
  try {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    const UNITS: { v: number; s: string }[] = [
      { v: 1e18, s: 'Q' },
      { v: 1e15, s: 'q' },
      { v: 1e12, s: 'T' },
      { v: 1e9, s: 'B' },
      { v: 1e6, s: 'M' },
      { v: 1e3, s: 'K' },
    ];

    for (const u of UNITS) {
      if (abs >= u.v) {
        const num = abs / u.v;
        const formatted = num >= 100 ? Math.round(num).toString() : num >= 10 ? num.toFixed(1) : num.toFixed(2);
        const trimmed = formatted.replace(/\.0+$/, '').replace(/(\.[1-9]*)0+$/, '$1');
        return `${sign}${trimmed}${u.s}`;
      }
    }

    return `${sign}${abs.toLocaleString()}`;
  } catch {
    return String(value);
  }
}
