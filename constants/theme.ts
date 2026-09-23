// Central visual language for Criminal Boss: a warm "noir" palette —
// near-black backgrounds, brass/gold for money and prestige, crimson for danger,
// emerald for XP and profit. Every screen should pull colours from here.

export const theme = {
  colors: {
    bg: '#0B0A0D',
    bgElevated: '#121016',
    surface: '#18151D',
    surfaceAlt: '#211D27',
    surfaceHighlight: '#2A2531',
    border: '#2C2733',
    borderStrong: '#3E3648',

    text: '#F4EFE6',
    textMuted: '#A8A097',
    textDim: '#6F685F',

    gold: '#E0B252',
    goldDeep: '#A87B24',
    goldSoft: 'rgba(224, 178, 82, 0.14)',
    goldBorder: 'rgba(224, 178, 82, 0.45)',

    crimson: '#E5484D',
    crimsonSoft: 'rgba(229, 72, 77, 0.14)',
    crimsonBorder: 'rgba(229, 72, 77, 0.45)',

    emerald: '#3DD68C',
    emeraldSoft: 'rgba(61, 214, 140, 0.14)',
    emeraldBorder: 'rgba(61, 214, 140, 0.45)',

    xp: '#3DD68C',
    info: '#6CB4F5',
    heat: '#FF7A3D',
    premium: '#C084FC',

    overlay: 'rgba(5, 4, 7, 0.82)',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    pill: 999,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
} as const;

// Accent colour per skill — used for headers, progress bars and active states so
// each skill reads as its own "district" of the empire.
export const SKILL_COLORS: Record<string, string> = {
  drug_factory: '#A78BFA',
  distillery: '#F5A524',
  smuggling: '#38BDF8',
  investigation_lab: '#2DD4BF',
  thieving: '#F43F5E',
  bank: '#E0B252',
};

export function skillColor(skillId?: string | null): string {
  return (skillId && SKILL_COLORS[skillId]) || theme.colors.gold;
}

// Appends an alpha channel to a #RRGGBB colour.
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
