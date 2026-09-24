import { ACTIVITIES, SMUGGLING_ZONES, RESOURCES } from '@/constants/gameData';

// ---------------------------------------------------------------------------
// Boss ranks — the long-term "who am I in this city" progression.
// Reputation = total skill levels × 10 + respect earned from contracts, daily
// rewards and turf wars. Every system feeds the same visible number.
// ---------------------------------------------------------------------------

export interface BossRank {
  id: string;
  title: string;
  minReputation: number;
  icon: string;
  perk: string;
}

export const BOSS_RANKS: BossRank[] = [
  { id: 'street_rat', title: 'Street Rat', minReputation: 0, icon: '🐀', perk: 'Everyone starts somewhere.' },
  { id: 'hustler', title: 'Corner Hustler', minReputation: 120, icon: '🧢', perk: '+5% contract cash' },
  { id: 'runner', title: 'Runner', minReputation: 300, icon: '🏃', perk: '+10% contract cash' },
  { id: 'enforcer', title: 'Enforcer', minReputation: 600, icon: '🥊', perk: '+15% contract cash' },
  { id: 'capo', title: 'Capo', minReputation: 1100, icon: '🎩', perk: '+20% contract cash' },
  { id: 'underboss', title: 'Underboss', minReputation: 2000, icon: '🕶️', perk: '+25% contract cash' },
  { id: 'consigliere', title: 'Consigliere', minReputation: 3500, icon: '📜', perk: '+30% contract cash' },
  { id: 'boss', title: 'Boss', minReputation: 6000, icon: '💼', perk: '+40% contract cash' },
  { id: 'kingpin', title: 'Kingpin', minReputation: 10000, icon: '👑', perk: '+50% contract cash' },
  { id: 'godfather', title: 'Godfather', minReputation: 16000, icon: '🌹', perk: '+75% contract cash' },
];

const RANK_CASH_BONUS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75];

export function getReputation(totalLevel: number, respect: number): number {
  return Math.max(0, Math.floor(totalLevel * 10 + respect));
}

export function getRankInfo(reputation: number) {
  let index = 0;
  BOSS_RANKS.forEach((r, i) => {
    if (reputation >= r.minReputation) index = i;
  });
  const rank = BOSS_RANKS[index];
  const next = BOSS_RANKS[index + 1];
  const progress = next ? (reputation - rank.minReputation) / (next.minReputation - rank.minReputation) : 1;
  return { rank, next, index, progress: Math.max(0, Math.min(1, progress)), cashBonus: RANK_CASH_BONUS[index] ?? 0 };
}

// ---------------------------------------------------------------------------
// Daily reward — a 7-day streak that resets if you miss a day.
// ---------------------------------------------------------------------------

export interface DailyReward {
  day: number;
  gold: number;
  respect: number;
  items: { resourceId: string; quantity: number }[];
  label: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, gold: 300, respect: 5, items: [], label: '$300' },
  { day: 2, gold: 600, respect: 5, items: [{ resourceId: 'plant_matter', quantity: 40 }, { resourceId: 'paper', quantity: 40 }], label: '$600 + supplies' },
  { day: 3, gold: 1200, respect: 10, items: [], label: '$1.2K' },
  { day: 4, gold: 800, respect: 10, items: [{ resourceId: 'loot_bag', quantity: 2 }], label: '2 Loot Bags' },
  { day: 5, gold: 2500, respect: 15, items: [], label: '$2.5K' },
  { day: 6, gold: 3000, respect: 25, items: [{ resourceId: 'water', quantity: 60 }, { resourceId: 'grains', quantity: 40 }], label: '$3K + supplies' },
  { day: 7, gold: 7500, respect: 50, items: [{ resourceId: 'loot_bag', quantity: 3 }], label: 'JACKPOT $7.5K' },
];

export function dayKey(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const pa = new Date(`${a}T00:00:00`).getTime();
  const pb = new Date(`${b}T00:00:00`).getTime();
  return Math.round((pb - pa) / 86_400_000);
}

// Streak day (1-7) the player would claim today, given their last claim.
export function nextStreakDay(lastClaimDay: string | undefined, streak: number, today: string = dayKey()): { claimable: boolean; day: number } {
  if (!lastClaimDay) return { claimable: true, day: 1 };
  const gap = daysBetween(lastClaimDay, today);
  if (gap <= 0) return { claimable: false, day: ((Math.max(1, streak) - 1) % 7) + 1 };
  if (gap === 1) return { claimable: true, day: (streak % 7) + 1 };
  return { claimable: true, day: 1 };
}

// ---------------------------------------------------------------------------
// Contracts — three short, concrete jobs (3-8 minutes each) always on the board.
// ---------------------------------------------------------------------------

export type ContractKind = 'craft' | 'runs' | 'thefts' | 'sell' | 'dungeon';

export interface Contract {
  id: string;
  kind: ContractKind;
  title: string;
  description: string;
  icon: string;
  skillId?: string;
  resourceId?: string;
  target: number;
  progress: number;
  reward: { gold: number; respect: number; items: { resourceId: string; quantity: number }[] };
}

export type ContractEvent =
  | { type: 'produce'; skillId: string; resourceId: string; qty: number }
  | { type: 'run'; qty: number }
  | { type: 'theft'; qty: number }
  | { type: 'sell'; amount: number }
  | { type: 'dungeon'; qty: number };

export function applyContractEvent(c: Contract, e: ContractEvent): Contract {
  if (c.progress >= c.target) return c;
  let add = 0;
  if (c.kind === 'craft' && e.type === 'produce' && e.resourceId === c.resourceId) add = e.qty;
  else if (c.kind === 'runs' && e.type === 'run') add = e.qty;
  else if (c.kind === 'thefts' && e.type === 'theft') add = e.qty;
  else if (c.kind === 'sell' && e.type === 'sell') add = e.amount;
  else if (c.kind === 'dungeon' && e.type === 'dungeon') add = e.qty;
  if (add <= 0) return c;
  return { ...c, progress: Math.min(c.target, c.progress + add) };
}

export interface ContractContext {
  levels: Record<string, number>;
  actionTimeMs: (skillId: string, baseTime: number, activityId: string) => number;
  exclude: ContractKind[];
  rng?: () => number;
}

const CRAFT_SKILLS = ['drug_factory', 'distillery', 'investigation_lab'];
const TARGET_PLAY_MS = 4 * 60 * 1000;

function pick<T>(list: T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

function roundNice(n: number): number {
  if (n < 20) return Math.max(1, Math.round(n));
  if (n < 100) return Math.round(n / 5) * 5;
  if (n < 1000) return Math.round(n / 10) * 10;
  return Math.round(n / 100) * 100;
}

export function generateContract(ctx: ContractContext): Contract {
  const rng = ctx.rng ?? Math.random;
  const id = `c_${Date.now().toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`;
  const kinds: ContractKind[] = (['craft', 'craft', 'runs', 'thefts', 'sell', 'dungeon'] as ContractKind[])
    .filter(k => !ctx.exclude.includes(k) || k === 'craft');
  const kind = pick(kinds, rng);
  const lvl = (s: string) => ctx.levels[s] ?? 1;

  if (kind === 'craft') {
    const skillId = pick(CRAFT_SKILLS, rng);
    const unlocked = (ACTIVITIES[skillId] ?? []).filter(a => a.levelRequired <= lvl(skillId));
    // Favour the newest unlocks: they're what the player is working towards.
    const activity = unlocked[Math.max(0, unlocked.length - 1 - Math.floor(rng() * Math.min(2, unlocked.length)))];
    if (activity) {
      const t = ctx.actionTimeMs(skillId, activity.baseTime, activity.id);
      const target = roundNice(Math.min(250, Math.max(8, TARGET_PLAY_MS / t)));
      const value = RESOURCES[activity.resource.id]?.value ?? 5;
      return {
        id, kind, skillId, resourceId: activity.resource.id, target, progress: 0,
        icon: activity.resource.icon,
        title: `Supply order: ${activity.resource.name}`,
        description: `Produce ${target} ${activity.resource.name}`,
        reward: { gold: roundNice(target * value * 2.5 + 150), respect: 12, items: [] },
      };
    }
  }
  if (kind === 'runs') {
    const zones = SMUGGLING_ZONES.filter(z => z.levelRequired <= lvl('smuggling'));
    const zone = zones[zones.length - 1] ?? SMUGGLING_ZONES[0];
    const t = ctx.actionTimeMs('smuggling', zone.baseTime, `smuggling_${zone.id}`);
    const target = roundNice(Math.min(600, Math.max(20, TARGET_PLAY_MS / t)));
    return {
      id, kind, skillId: 'smuggling', target, progress: 0, icon: '🚢',
      title: 'Keep the docks busy',
      description: `Complete ${target} smuggling runs`,
      reward: { gold: roundNice(300 + lvl('smuggling') * 40), respect: 12, items: [] },
    };
  }
  if (kind === 'thefts') {
    const target = roundNice(Math.max(15, 30 - lvl('thieving') * 0.1));
    return {
      id, kind, skillId: 'thieving', target, progress: 0, icon: '🥷',
      title: 'Lighten some pockets',
      description: `Pull off ${target} successful thefts`,
      reward: { gold: roundNice(350 + lvl('thieving') * 45), respect: 14, items: [] },
    };
  }
  if (kind === 'sell') {
    const avg = Object.values(ctx.levels).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(ctx.levels).length);
    const target = roundNice(500 + avg * 150);
    return {
      id, kind, target, progress: 0, icon: '💵',
      title: 'Launder the goods',
      description: `Sell goods worth $${target.toLocaleString()} from your Stash`,
      reward: { gold: roundNice(target * 0.35), respect: 10, items: [] },
    };
  }
  // dungeon
  return {
    id, kind: 'dungeon', target: 1, progress: 0, icon: '⚔️',
    title: 'Settle a turf war',
    description: 'Clear any Turf War dungeon',
    reward: { gold: 400, respect: 20, items: [{ resourceId: 'loot_bag', quantity: 1 }] },
  };
}

export const CONTRACT_SLOTS = 3;

// Name + level of the next job the player unlocks in a skill: the carrot on the stick.
export function getNextUnlock(skillId: string, level: number): { name: string; level: number } | null {
  if (skillId === 'smuggling') {
    const z = SMUGGLING_ZONES.find(zone => zone.levelRequired > level);
    return z ? { name: z.name, level: z.levelRequired } : null;
  }
  const a = (ACTIVITIES[skillId] ?? []).find(act => act.levelRequired > level);
  return a ? { name: a.name, level: a.levelRequired } : null;
}

