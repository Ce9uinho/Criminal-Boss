import { ACTIVITIES, RESOURCES, SMUGGLING_ZONES } from '@/constants/gameData';

// ---------------------------------------------------------------------------
// Achievements: individual, permanent milestones (Melvor/Steam style).
// Each one watches a single stat; once reached it's unlocked forever, pays a
// small reward and counts towards the completion percentage.
// ---------------------------------------------------------------------------

export type AchievementCategory =
  | 'empire'
  | 'smuggling'
  | 'thieving'
  | 'drug_factory'
  | 'distillery'
  | 'investigation_lab'
  | 'turf_war'
  | 'collection';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AchievementStats {
  levels: Record<string, number>;
  totalLevel: number;
  produced: Record<string, number>;
  smugglingRuns: number;
  rareCollected: number;
  timesCaught: number;
  timesArrested: number;
  peakHeat: number;
  dungeonsCleared: number;
  deaths: number;
  lootBagsOpened: number;
  peakGold: number;
  cashEarned: number;
  soldValue: number;
  bestStreak: number;
  discovered: number;
  contractsCompleted: number;
  rankIndex: number;
  toolsOwned: Record<string, number>;
  // activities per skill at or above a mastery level: masteryAt[skill][25|50|75|100]
  masteryAt: Record<string, Record<number, number>>;
  bankSlots: number;
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  target: number;
  value: (s: AchievementStats) => number;
  hidden?: boolean; // shown as "???" until unlocked
}

export const TIER_POINTS: Record<AchievementTier, number> = { bronze: 5, silver: 10, gold: 25, diamond: 50 };
export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#C98A4B',
  silver: '#C9CED6',
  gold: '#E0B252',
  diamond: '#7FD8F2',
};

// Reward paid on unlock: respect feeds the boss rank, cash keeps the loop going.
export function achievementReward(a: Achievement): { respect: number; gold: number } {
  const pts = TIER_POINTS[a.tier];
  return { respect: pts, gold: pts * 100 };
}

const TIERS: AchievementTier[] = ['bronze', 'silver', 'gold', 'diamond'];

function chain(
  category: AchievementCategory,
  idBase: string,
  icon: string,
  steps: { target: number; title: string; description: string; tier?: AchievementTier }[],
  value: (s: AchievementStats) => number,
): Achievement[] {
  return steps.map((step, i) => ({
    id: `${idBase}_${step.target}`,
    category,
    icon,
    title: step.title,
    description: step.description,
    tier: step.tier ?? TIERS[Math.min(i, TIERS.length - 1)],
    target: step.target,
    value,
  }));
}

const fmt = (n: number) => n.toLocaleString('en-US');

const skillLevelChain = (skillId: AchievementCategory, name: string, icon: string, titles: [string, string, string, string]) =>
  chain(skillId, `${skillId}_level`, icon, [
    { target: 10, title: titles[0], description: `Reach level 10 ${name}` },
    { target: 30, title: titles[1], description: `Reach level 30 ${name}` },
    { target: 60, title: titles[2], description: `Reach level 60 ${name}` },
    { target: 100, title: titles[3], description: `Reach level 100 ${name} and recruit its agent` },
  ], s => s.levels[skillId] ?? 1);

const activityCount = (skillId: string) =>
  skillId === 'smuggling' ? SMUGGLING_ZONES.length : (ACTIVITIES[skillId] ?? []).length;

const masteryChain = (skillId: AchievementCategory, name: string, noun: string) => [
  {
    id: `${skillId}_mastery_50`, category: skillId, icon: '🎓', tier: 'silver' as const, target: 1,
    title: 'Getting the Hang of It', description: `Reach mastery 50 on any ${name} ${noun}`,
    value: (s: AchievementStats) => s.masteryAt[skillId]?.[50] ?? 0,
  },
  {
    id: `${skillId}_mastery_100`, category: skillId, icon: '🏅', tier: 'gold' as const, target: 1,
    title: 'Master Craftsman', description: `Reach mastery 100 on any ${name} ${noun}`,
    value: (s: AchievementStats) => s.masteryAt[skillId]?.[100] ?? 0,
  },
  {
    id: `${skillId}_mastery_all`, category: skillId, icon: '💎', tier: 'diamond' as const, target: activityCount(skillId),
    title: 'Nothing Left to Learn', description: `Reach mastery 100 on every ${name} ${noun} (${activityCount(skillId)})`,
    value: (s: AchievementStats) => s.masteryAt[skillId]?.[100] ?? 0,
  },
];

const toolChain = (skillId: AchievementCategory, name: string, first: string, all: string) => [
  {
    id: `${skillId}_tools_1`, category: skillId, icon: '🔧', tier: 'bronze' as const, target: 1,
    title: first, description: `Buy your first ${name} upgrade`,
    value: (s: AchievementStats) => s.toolsOwned[skillId] ?? 0,
  },
  {
    id: `${skillId}_tools_5`, category: skillId, icon: '🛠️', tier: 'gold' as const, target: 5,
    title: all, description: `Own every ${name} upgrade`,
    value: (s: AchievementStats) => s.toolsOwned[skillId] ?? 0,
  },
];

const productionChain = (skillId: AchievementCategory, verb: string, noun: string, titles: [string, string, string, string]) =>
  chain(skillId, `${skillId}_made`, '📦', [
    { target: 100, title: titles[0], description: `${verb} ${fmt(100)} ${noun}` },
    { target: 1_000, title: titles[1], description: `${verb} ${fmt(1_000)} ${noun}` },
    { target: 10_000, title: titles[2], description: `${verb} ${fmt(10_000)} ${noun}` },
    { target: 100_000, title: titles[3], description: `${verb} ${fmt(100_000)} ${noun}` },
  ], s => s.produced[skillId] ?? 0);

export const TOTAL_ITEMS = Object.keys(RESOURCES).length;

export const ACHIEVEMENTS: Achievement[] = [
  // ---- Empire -------------------------------------------------------------
  ...chain('empire', 'total_level', '📈', [
    { target: 25, title: 'Made Man', description: 'Reach total level 25' },
    { target: 100, title: 'Connected', description: 'Reach total level 100' },
    { target: 250, title: 'Pillar of the Family', description: 'Reach total level 250' },
    { target: 500, title: 'Living Legend', description: 'Reach total level 500 (every skill maxed)' },
  ], s => s.totalLevel),
  ...chain('empire', 'cash_earned', '💵', [
    { target: 10_000, title: 'First Score', description: `Earn $${fmt(10_000)} in total` },
    { target: 250_000, title: 'Money Talks', description: `Earn $${fmt(250_000)} in total` },
    { target: 5_000_000, title: 'Laundromat', description: `Earn $${fmt(5_000_000)} in total` },
    { target: 100_000_000, title: 'Too Big to Jail', description: `Earn $${fmt(100_000_000)} in total` },
  ], s => s.cashEarned),
  ...chain('empire', 'peak_gold', '🏦', [
    { target: 100_000, title: 'Rainy Day Fund', description: `Hold $${fmt(100_000)} at once`, tier: 'silver' },
    { target: 10_000_000, title: 'Swimming in It', description: `Hold $${fmt(10_000_000)} at once`, tier: 'diamond' },
  ], s => s.peakGold),
  ...chain('empire', 'sold', '🤝', [
    { target: 5_000, title: 'Fence', description: `Sell $${fmt(5_000)} worth of goods`, tier: 'bronze' },
    { target: 1_000_000, title: 'Wholesaler', description: `Sell $${fmt(1_000_000)} worth of goods`, tier: 'gold' },
  ], s => s.soldValue),
  ...chain('empire', 'contracts', '📋', [
    { target: 1, title: 'Open for Business', description: 'Complete your first contract' },
    { target: 25, title: 'Reliable', description: 'Complete 25 contracts' },
    { target: 100, title: 'Go-To Guy', description: 'Complete 100 contracts' },
    { target: 500, title: 'The Firm', description: 'Complete 500 contracts' },
  ], s => s.contractsCompleted),
  ...chain('empire', 'streak', '🔥', [
    { target: 3, title: 'Regular', description: 'Reach a 3-day daily streak', tier: 'bronze' },
    { target: 7, title: 'Jackpot Week', description: 'Reach a 7-day daily streak', tier: 'silver' },
    { target: 30, title: 'Clockwork', description: 'Keep the daily streak alive for 30 days', tier: 'gold' },
  ], s => s.bestStreak),
  ...chain('empire', 'rank', '🎩', [
    { target: 4, title: 'Capo', description: 'Earn the rank of Capo', tier: 'silver' },
    { target: 7, title: 'The Boss', description: 'Earn the rank of Boss', tier: 'gold' },
    { target: 9, title: 'The Godfather', description: 'Earn the rank of Godfather', tier: 'diamond' },
  ], s => s.rankIndex),
  ...chain('empire', 'bank_slots', '🗄️', [
    { target: 40, title: 'More Room', description: 'Expand the stash to 40 slots', tier: 'bronze' },
    { target: 100, title: 'Warehouse District', description: 'Expand the stash to 100 slots', tier: 'gold' },
  ], s => s.bankSlots),

  // ---- Smuggling ----------------------------------------------------------
  ...skillLevelChain('smuggling', 'Smuggling', '🚢', ['Deckhand', 'Runner', 'Captain', 'Ghost Fleet']),
  ...chain('smuggling', 'smuggling_runs', '📦', [
    { target: 500, title: 'Busy Docks', description: `Complete ${fmt(500)} smuggling runs` },
    { target: 5_000, title: 'Shipping Magnate', description: `Complete ${fmt(5_000)} smuggling runs` },
    { target: 50_000, title: 'Supply Chain', description: `Complete ${fmt(50_000)} smuggling runs` },
    { target: 250_000, title: 'Open Borders', description: `Complete ${fmt(250_000)} smuggling runs` },
  ], s => s.smugglingRuns),
  ...chain('smuggling', 'smuggling_rare', '💠', [
    { target: 1, title: 'Hidden Compartment', description: 'Smuggle in your first rare item', tier: 'silver' },
    { target: 100, title: 'Treasure Hunter', description: 'Smuggle in 100 rare items', tier: 'gold' },
  ], s => s.rareCollected),
  ...masteryChain('smuggling', 'Smuggling', 'route'),
  ...toolChain('smuggling', 'Smuggling', 'Greased Palms', 'Owns the Harbor'),

  // ---- Thieving -----------------------------------------------------------
  ...skillLevelChain('thieving', 'Thieving', '🥷', ['Pickpocket', 'Cat Burglar', 'Safecracker', 'Phantom']),
  ...chain('thieving', 'thefts', '👛', [
    { target: 100, title: 'Light Fingers', description: 'Pull off 100 successful thefts' },
    { target: 1_000, title: 'Crime Wave', description: `Pull off ${fmt(1_000)} successful thefts` },
    { target: 10_000, title: 'Untouchable', description: `Pull off ${fmt(10_000)} successful thefts` },
    { target: 100_000, title: 'Robin of the Hood', description: `Pull off ${fmt(100_000)} successful thefts` },
  ], s => s.produced.thieving ?? 0),
  {
    id: 'thieving_caught_1', category: 'thieving', icon: '📸', tier: 'bronze', target: 1, hidden: true,
    title: 'First Mugshot', description: 'Get caught for the first time', value: s => s.timesCaught + s.timesArrested,
  },
  {
    id: 'thieving_arrested_25', category: 'thieving', icon: '🚔', tier: 'silver', target: 25, hidden: true,
    title: 'Frequent Flyer', description: 'Get arrested 25 times', value: s => s.timesArrested,
  },
  {
    id: 'thieving_heat_100', category: 'thieving', icon: '🌶️', tier: 'silver', target: 100, hidden: true,
    title: 'Most Wanted', description: 'Push police heat all the way to 100%', value: s => s.peakHeat,
  },
  ...masteryChain('thieving', 'Thieving', 'target'),
  ...toolChain('thieving', 'Thieving', 'Tools of the Trade', 'Master Key'),

  // ---- Drug Factory -------------------------------------------------------
  ...skillLevelChain('drug_factory', 'Drug Factory', '🧪', ['Kitchen Chemist', 'Cook', 'Heisenberg', 'Pharma Baron']),
  ...productionChain('drug_factory', 'Produce', 'drug products', ['Small Batch', 'Street Supply', 'Cartel Quota', 'Global Pipeline']),
  ...masteryChain('drug_factory', 'Drug Factory', 'recipe'),
  ...toolChain('drug_factory', 'Drug Factory', 'Basement Lab', 'Industrial Complex'),

  // ---- Distillery ---------------------------------------------------------
  ...skillLevelChain('distillery', 'Distillery', '🥃', ['Home Brewer', 'Moonshiner', 'Master Distiller', 'Prohibition King']),
  ...productionChain('distillery', 'Bottle', 'drinks', ['First Round', 'Speakeasy Stock', 'Bootlegger', 'Rivers of Rum']),
  ...masteryChain('distillery', 'Distillery', 'recipe'),
  ...toolChain('distillery', 'Distillery', 'Oak & Copper', 'Grand Distillery'),

  // ---- Investigation Lab --------------------------------------------------
  ...skillLevelChain('investigation_lab', 'Investigation Lab', '🔬', ['Lab Assistant', 'Analyst', 'Chief Chemist', 'Professor']),
  ...productionChain('investigation_lab', 'Refine', 'premium materials', ['Quality Control', 'Pure Grade', 'Lab Standard', 'Perfection']),
  ...masteryChain('investigation_lab', 'Investigation Lab', 'process'),
  ...toolChain('investigation_lab', 'Investigation Lab', 'First Bench', 'State of the Art'),

  // ---- Turf War -----------------------------------------------------------
  ...chain('turf_war', 'dungeons', '⚔️', [
    { target: 1, title: 'Street Fighter', description: 'Clear a Turf War dungeon' },
    { target: 25, title: 'Enforcer', description: 'Clear 25 Turf War dungeons' },
    { target: 250, title: 'Warlord', description: 'Clear 250 Turf War dungeons' },
    { target: 2_500, title: 'Nobody Left to Fight', description: `Clear ${fmt(2_500)} Turf War dungeons` },
  ], s => s.dungeonsCleared),
  ...chain('turf_war', 'loot_bags', '💰', [
    { target: 10, title: 'Grab Bag', description: 'Open 10 loot bags', tier: 'bronze' },
    { target: 250, title: 'Loot Goblin', description: 'Open 250 loot bags', tier: 'gold' },
  ], s => s.lootBagsOpened),
  {
    id: 'turf_war_death_1', category: 'turf_war', icon: '🐟', tier: 'bronze', target: 1, hidden: true,
    title: 'Sleeps with the Fishes', description: 'Get taken out in a Turf War', value: s => s.deaths,
  },

  // ---- Collection ---------------------------------------------------------
  ...chain('collection', 'discovered', '📚', [
    { target: 30, title: 'Curious', description: 'Discover 30 different items' },
    { target: 60, title: 'Collector', description: 'Discover 60 different items' },
    { target: 100, title: 'Curator', description: 'Discover 100 different items' },
    { target: TOTAL_ITEMS, title: 'Seen It All', description: `Discover every item in the game (${TOTAL_ITEMS})` },
  ], s => s.discovered),
];

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; name: string; icon: string }[] = [
  { id: 'empire', name: 'Empire', icon: '🏛️' },
  { id: 'smuggling', name: 'Smuggling', icon: '🚢' },
  { id: 'thieving', name: 'Thieving', icon: '🥷' },
  { id: 'drug_factory', name: 'Drug Factory', icon: '🧪' },
  { id: 'distillery', name: 'Distillery', icon: '🥃' },
  { id: 'investigation_lab', name: 'Lab', icon: '🔬' },
  { id: 'turf_war', name: 'Turf War', icon: '⚔️' },
  { id: 'collection', name: 'Collection', icon: '📚' },
];

export const TOTAL_ACHIEVEMENT_POINTS = ACHIEVEMENTS.reduce((sum, a) => sum + TIER_POINTS[a.tier], 0);
