import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { GameState, Skill, Activity, BankItem, Mastery, SmugglingZone, BankTab, EquipmentSlot } from '@/types/game';
import { getLevelFromXp, RESOURCES, hasRequiredInputs, SKILL_DESCRIPTIONS, getSmugglingXp, getXpForLevel, STORE_ITEMS, EQUIPMENT_CATALOG, ACTIVITIES, SMUGGLING_ZONES } from '@/constants/gameData';
import { Contract, ContractEvent, CONTRACT_SLOTS, DAILY_REWARDS, DailyReward, applyContractEvent, dayKey, generateContract, getRankInfo, getReputation, nextStreakDay } from '@/constants/progression';
import { ACHIEVEMENTS, AchievementStats, achievementReward } from '@/constants/achievements';
import { LOOT_BAG_TABLE, LOOT_BAG_GOLD, COMBAT_DUNGEONS, getDungeonGoldReward, getPlayerCombatStats, getPlayerAttackIntervalMs } from '@/constants/combat';
import { THIEVING_TOOLS } from '@/constants/thievingTools';
import { DRUG_TOOLS } from '@/constants/drugTools';
import { DISTILLERY_TOOLS } from '@/constants/distilleryTools';
import { SMUGGLING_TOOLS } from '@/constants/smugglingTools';
import { INVESTIGATION_LAB_TOOLS } from '@/constants/investigationLabTools';

interface GameStore extends GameState {
  premiumCurrency: number;
  combatAutoResume: boolean;
  combatSnapshot?: { dungeonId: string; enemyIndex: number; enemyHp: number; at: number };
  combatIsActive: boolean;
  combatDungeonId?: string;
  combatEnemyIndex: number;
  combatEnemyHp: number;
  combatPlayerHp: number;
  combatSessionGold: number;
  combatSessionItems: Record<string, number>;
  combatBgTimer?: ReturnType<typeof setInterval>;
  combatDeath?: { enemyName: string; at: number };
  setCombatDeath: (enemyName: string) => void;
  clearCombatDeath: () => void;
  // Combat UI state
  combatLastTab: 'equipment' | 'combat' | 'dungeons';
  combatSelectedDungeon?: string;
  setCombatLastTab: (tab: 'equipment' | 'combat' | 'dungeons') => void;
  setCombatSelectedDungeon: (id: string) => void;
  setCombatAutoResume: (flag: boolean) => void;
  setCombatSnapshot: (snap: { dungeonId: string; enemyIndex: number; enemyHp: number; at: number }) => void;
  getCombatSnapshot: () => { dungeonId: string; enemyIndex: number; enemyHp: number; at: number } | undefined;
  clearCombatResume: () => void;
  startBackgroundCombat: (params: { dungeonId: string; enemyIndex: number; enemyHp: number; playerHp: number }) => void;
  stopBackgroundCombat: () => void;
  addPremium: (amount: number) => void;
  spendPremium: (amount: number) => boolean;
  isLoading: boolean;
  activeTimers: Record<string, ReturnType<typeof setInterval>>;
  currentSmugglingZone?: SmugglingZone;
  currentThievingActivity?: Activity;
  gold: number;
  heat: number;
  arrestedUntil: number;
  heatDecayTimer?: ReturnType<typeof setInterval>;
  thievingAutoResume: boolean;
  bankItems: (BankItem | null)[];
  bankTabs: Record<string, BankTab>;
  activeBankTab: 'all' | string;
  playerName: string;
  playerIcon: string;
  // Bank capacity
  maxBankSlots: number;
  increaseBankSlots: (amount: number) => void;
  addBankSlotWithGold: (price: number) => void;
  grantBankSlot: () => void;
  // Speed testing system
  gameSpeedMultiplier: number;
  setGameSpeedMultiplier: (multiplier: number) => void;
  // Thieving tools
  thievingToolsOwned: Record<string, boolean>;
  equippedThievingToolId?: string;
  getEquippedThievingTool: () => { id: string; tier: number } | undefined;
  acquireThievingTool: (toolId: string) => void;
  equipThievingTool: (toolId: string) => void;
  getThievingToolBonuses: () => { failureReductionMultiplier: number; cooldownReductionMultiplier: number; lootBonusMultiplier: number; heatReductionMultiplier: number; extraLootChance?: number; cooldownTimeReduction?: number };

  // Smuggling tools
  smugglingToolsOwned: Record<string, boolean>;
  equippedSmugglingToolId?: string;
  getEquippedSmugglingTool: () => { id: string; tier: number } | undefined;
  acquireSmugglingTool: (toolId: string) => void;
  equipSmugglingTool: (toolId: string) => void;
  getSmugglingToolBonuses: () => { timeReductionMultiplier: number; junkReductionMultiplier: number; itemsPerActionBonus: number; rareWeightMultiplier: number };

  // Drug factory tools
  drugToolsOwned: Record<string, boolean>;
  equippedDrugToolId?: string;
  getEquippedDrugTool: () => { id: string; tier: number } | undefined;
  acquireDrugTool: (toolId: string) => void;
  equipDrugTool: (toolId: string) => void;
  getDrugToolBonuses: () => { failureReductionMultiplier: number; timeReductionMultiplier: number; outputMultiplier: number; inputReductionMultiplier: number; inputSaveChance: number };

  // Distillery tools
  distilleryToolsOwned: Record<string, boolean>;
  equippedDistilleryToolId?: string;
  getEquippedDistilleryTool: () => { id: string; tier: number } | undefined;
  acquireDistilleryTool: (toolId: string) => void;
  equipDistilleryTool: (toolId: string) => void;
  getDistilleryToolBonuses: () => { failureReductionMultiplier: number; timeReductionMultiplier: number; outputMultiplier: number; inputReductionMultiplier: number; inputSaveChance: number };

  // Investigation Lab tools
  investigationLabToolsOwned: Record<string, boolean>;
  equippedInvestigationLabToolId?: string;
  getEquippedInvestigationLabTool: () => { id: string; tier: number } | undefined;
  acquireInvestigationLabTool: (toolId: string) => void;
  equipInvestigationLabTool: (toolId: string) => void;
  getInvestigationLabToolBonuses: () => { failureReductionMultiplier: number; timeReductionMultiplier: number; outputMultiplier: number; inputReductionMultiplier: number; inputSaveChance: number };

  // Equipment
  equipped: Partial<Record<EquipmentSlot, string>>;
  equipFromBank: (resourceId: string) => void;
  unequip: (slot: EquipmentSlot) => void;
  openLootBag: () => { items: { resourceId: string; quantity: number }[]; gold: number } | null;
  openAllLootBags: () => { items: { resourceId: string; quantity: number }[]; gold: number } | null;

  // Rewarded ads tracking
  adsWatched: number;
  adsGoal: number;
  lastAdWatchedAt?: number;
  watchAd: () => { awarded: string[]; premiumDelta: number; watched: number; goal: number } | null;
  resetAdsProgress: () => void;

  // XP toasts
  xpToasts: { id: string; amount: number; skillId: string }[];
  pushXpToast: (amount: number, skillId: string) => void;
  removeXpToast: (id: string) => void;

  // Derived state helpers
  getPlayerLevelAvg: () => number;
  
  // Actions
  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
  startActivity: (skillId: string, activity: Activity) => void;
  restartThievingAfterCooldown: (activity: Activity) => void;
  startSmugglingZone: (zone: SmugglingZone) => void;
  stopActivity: (skillId: string) => void;
  addExperience: (skillId: string, xp: number) => void;
  addResource: (resourceId: string, quantity: number) => void;
  addMasteryExperience: (activityId: string, xp: number) => void;
  getMasteryLevel: (activityId: string) => number;
  getMasteryPercentage: (activityId: string) => number;
  getMasteryTimeReduction: (activityId: string) => number;
  getActualTime: (skillId: string, baseTime: number, activityId: string) => number;
  getThievingMasteryBonus: (activityId: string) => { failureReduction: number; cooldownReduction: number; lootBonus: number; heatReduction: number; };
  processOfflineProgress: (resume?: { skillId: string; activityId: string }) => void;
  sortBank: () => void;
  sellItem: (resourceId: string, quantity: number) => void;
  addGold: (amount: number) => void;
  buyItem: (resourceId: string, quantity: number, price: number) => void;
  consumeInputs: (inputs: { resourceId: string; quantity: number }[]) => boolean;
  addHeat: (amount: number) => void;
  startHeatDecay: () => void;
  stopHeatDecay: () => void;

  // Debug/testing
  maxAllSkills: () => void;

  // Profile actions
  setPlayerName: (name: string) => void;
  setPlayerIcon: (icon: string) => void;
  
  // Bank management
  setActiveBankTab: (id: 'all' | string) => void;
  swapInAll: (fromIndex: number, toIndex: number) => void;
  moveToEmptyInAll: (fromIndex: number, toIndex: number) => void;
  swapInTab: (tabId: string, fromPos: number, toPos: number) => void;
  moveToEmptyInTab: (tabId: string, fromPos: number, toPos: number) => void;
  groupItems: () => void;
  resetBankTo30Slots: () => void;
  createBankTab: (name: string) => string;
  deleteBankTab: (tabId: string) => void;
  renameBankTab: (tabId: string, name: string) => void;
  setTabIcon: (tabId: string, icon: string) => void;
  setTabDisplayMode: (tabId: string, displayMode: 'both' | 'icon' | 'text') => void;
  addItemToTab: (tabId: string, itemIndex: number) => void;
  removeItemFromTab: (tabId: string, itemIndex: number) => void;
  assignToTab: (itemIndex: number, tabId: string) => void;
  swapBankTabs: (aId: string, bId: string) => void;

  // UI signals
  lastGroupedAt?: number;

  // Player-facing notifications (level ups, full bank, purchases...)
  notices: GameNotice[];
  pushNotice: (notice: Omit<GameNotice, 'id'>) => void;
  dismissNotice: (id: string) => void;

  // Summary of what happened while the player was away
  offlineSummary?: OfflineSummary;
  clearOfflineSummary: () => void;
  getAdjustedActionTime: (skillId: string, baseTime: number, activityId: string) => number;

  // Meta progression: respect, contracts board and daily streak
  respect: number;
  contracts: Contract[];
  contractsCompleted: number;
  dailyStreak: number;
  lastDailyClaim?: string;
  trackContract: (event: ContractEvent) => void;
  refillContracts: () => void;
  claimContract: (id: string) => void;
  rerollContract: (id: string) => void;
  getContractRerollCost: () => number;
  claimDailyReward: () => DailyReward | null;
  getReputation: () => number;

  // Lifetime counters that feed achievements
  lifetimeStats: LifetimeStats;
  recordProduced: (skillId: string, amount: number) => void;
  bumpStat: (key: CounterStat, amount?: number) => void;

  // Achievements: id -> unlock timestamp (permanent)
  achievementsUnlocked: Record<string, number>;
  getAchievementStats: () => AchievementStats;
  checkAchievements: () => void;

  // Save management
  exportSave: () => string;
  importSave: (raw: string) => Promise<boolean>;
  resetGame: () => Promise<void>;
}

export interface LifetimeStats {
  produced: Record<string, number>; // crafted items per skill, successful thefts for thieving
  rareCollected: number; // rare smuggling finds
  smugglingRuns: number;
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
  discovered: Record<string, number>; // resourceId -> first time it entered the stash (Collection Log)
}

export type CounterStat = 'rareCollected' | 'smugglingRuns' | 'timesCaught' | 'timesArrested' | 'dungeonsCleared' | 'deaths' | 'lootBagsOpened' | 'soldValue';

export function emptyLifetimeStats(): LifetimeStats {
  return {
    produced: {}, rareCollected: 0, smugglingRuns: 0, timesCaught: 0, timesArrested: 0, peakHeat: 0,
    dungeonsCleared: 0, deaths: 0, lootBagsOpened: 0, peakGold: 0, cashEarned: 0, soldValue: 0, bestStreak: 0, discovered: {},
  };
}

// Suspended while a save is being loaded/imported so restored cash and items
// don't count as "earned" or "discovered" again.
let statTrackingSuspended = false;

export interface GameNotice {
  id: string;
  kind: 'levelup' | 'agent' | 'warning' | 'success' | 'info';
  title: string;
  message?: string;
  icon?: string;
  skillId?: string;
}

export interface OfflineSummary {
  elapsedMs: number;
  cappedMs: number;
  skillId: string;
  activityName: string;
  actions: number;
  xp: number;
  levelBefore: number;
  levelAfter: number;
  gold: number;
  items: { resourceId: string; quantity: number }[];
  consumed: { resourceId: string; quantity: number }[];
}

// Offline progress is capped so returning players get a meaningful reward without
// making active play pointless.
export const MAX_OFFLINE_MS = 12 * 60 * 60 * 1000;
const MIN_OFFLINE_MS = 60 * 1000;

// The slot array is the single source of truth for the inventory. The keyed `bank`
// map is always derived from it so crafting checks, the shop and the bank grid can
// never disagree about how many of an item the player owns.
export function bankFromItems(items: (BankItem | null)[]): Record<string, BankItem> {
  const out: Record<string, BankItem> = {};
  for (const it of items) {
    if (!it || it.quantity <= 0) continue;
    const prev = out[it.resourceId]?.quantity ?? 0;
    out[it.resourceId] = { resourceId: it.resourceId, quantity: prev + it.quantity };
  }
  return out;
}

// Removes `quantity` of a resource across every slot holding it. Returns false when
// the player doesn't own enough (and leaves `items` untouched in that case).
function removeFromItems(items: (BankItem | null)[], resourceId: string, quantity: number): boolean {
  const total = items.reduce((sum, it) => sum + (it?.resourceId === resourceId ? it.quantity : 0), 0);
  if (total < quantity) return false;
  let remaining = quantity;
  for (let i = items.length - 1; i >= 0 && remaining > 0; i--) {
    const it = items[i];
    if (!it || it.resourceId !== resourceId) continue;
    const take = Math.min(it.quantity, remaining);
    remaining -= take;
    items[i] = it.quantity - take > 0 ? { resourceId, quantity: it.quantity - take } : null;
  }
  return true;
}

// Adds a resource to the first slot holding it, else the first empty slot.
// Returns false when the bank is full.
function addToItems(items: (BankItem | null)[], resourceId: string, quantity: number): boolean {
  const existing = items.findIndex(it => it?.resourceId === resourceId);
  if (existing !== -1) {
    items[existing] = { resourceId, quantity: (items[existing]?.quantity ?? 0) + quantity };
    return true;
  }
  const empty = items.findIndex(it => !it || it.quantity <= 0);
  if (empty === -1) return false;
  items[empty] = { resourceId, quantity };
  return true;
}

function padItems(items: (BankItem | null)[], cap: number): (BankItem | null)[] {
  const out = [...items];
  while (out.length < cap) out.push(null);
  // Never drop owned items when trimming: only trailing empties can go.
  while (out.length > cap && out[out.length - 1] == null) out.pop();
  return out;
}

let lastBankFullNotice = 0;

const isCashId = (id: string) => id === 'loose_change' || id === 'cash';

type ToolRequirement = { resourceId: string; quantity: number };

// Shared purchase flow for every skill's tool shop.
function payRequirements(
  state: { gold: number; bankItems: (BankItem | null)[] },
  requirements: ToolRequirement[],
): { gold: number; bankItems: (BankItem | null)[] } | null {
  const items = [...state.bankItems];
  let gold = state.gold;
  for (const req of requirements) {
    if (isCashId(req.resourceId)) {
      if (gold < req.quantity) return null;
      gold -= req.quantity;
    } else if (!removeFromItems(items, req.resourceId, req.quantity)) {
      return null;
    }
  }
  return { gold, bankItems: items };
}

export function resolveActivity(skillId: string, activityId: string): Activity | undefined {
  return ACTIVITIES[skillId]?.find(a => a.id === activityId);
}

const SMUGGLING_ZONE_IDS = SMUGGLING_ZONES.map(z => `smuggling_${z.id}`);

export function resolveZone(activityId: string): SmugglingZone | undefined {
  return SMUGGLING_ZONES.find(z => `smuggling_${z.id}` === activityId);
}

const INITIAL_SKILLS: Record<string, Skill> = {
  drug_factory: {
    id: 'drug_factory',
    name: 'Drug Factory',
    description: SKILL_DESCRIPTIONS.drug_factory,
    level: 1,
    experience: 0,
    isActive: false,
    agentUnlocked: false,
  },
  distillery: {
    id: 'distillery',
    name: 'Distillery',
    description: SKILL_DESCRIPTIONS.distillery,
    level: 1,
    experience: 0,
    isActive: false,
    agentUnlocked: false,
  },
  smuggling: {
    id: 'smuggling',
    name: 'Smuggling',
    description: SKILL_DESCRIPTIONS.smuggling,
    level: 1,
    experience: 0,
    isActive: false,
    agentUnlocked: false,
  },
  investigation_lab: {
    id: 'investigation_lab',
    name: 'Investigation Lab',
    description: SKILL_DESCRIPTIONS.investigation_lab,
    level: 1,
    experience: 0,
    isActive: false,
    agentUnlocked: false,
  },
  thieving: {
    id: 'thieving',
    name: 'Thieving',
    description: SKILL_DESCRIPTIONS.thieving,
    level: 1,
    experience: 0,
    isActive: false,
    agentUnlocked: false,
  },
};

// Initial bank items for demonstration - convert to array format
const INITIAL_BANK_ITEMS: (BankItem | null)[] = [
  // Starting drug factory input materials
  { resourceId: 'chemical', quantity: 20 },
  { resourceId: 'solvent', quantity: 15 },
  { resourceId: 'plant_matter', quantity: 25 },
  { resourceId: 'paper', quantity: 30 },
  { resourceId: 'catalyst', quantity: 10 },
  { resourceId: 'substrate', quantity: 12 },
  { resourceId: 'binder', quantity: 15 },
  
  // Starting distillery input materials
  { resourceId: 'water', quantity: 25 },
  { resourceId: 'alcohol_base', quantity: 15 },
  { resourceId: 'grapes', quantity: 20 },
  { resourceId: 'sugar', quantity: 20 },
  { resourceId: 'grains', quantity: 18 },
  { resourceId: 'herbs', quantity: 12 },
  
  // Some existing items from smuggling
  { resourceId: 'contraband_cigarettes', quantity: 42 },
  { resourceId: 'fake_documents', quantity: 15 },
  { resourceId: 'stolen_electronics', quantity: 7 },
  { resourceId: 'pile_of_junk', quantity: 5 },
];

// New bosses start with their street kit already on, so the first Turf War fight
// is winnable without a trip through the bank.
const STARTER_EQUIPMENT: Partial<Record<EquipmentSlot, string>> = {
  weapon: 'iron_dagger',
  offhand: 'wooden_shield',
  helmet: 'leather_cap',
  chest: 'leather_vest',
  legs: 'leather_pants',
  boots: 'leather_boots',
  ring: 'simple_ring',
  amulet: 'street_amulet',
};

export const useGameStore = create<GameStore>((rawSet, get) => {
  // Every state write goes through here so `bank` stays in sync with `bankItems`.
  // It also keeps the lifetime counters that are easiest to track centrally:
  // cash earned, peak cash and the Collection Log of discovered items.
  const set = ((partial: any, replace?: boolean) =>
    rawSet((state: GameStore) => {
      let next = typeof partial === 'function' ? partial(state) : partial;
      if (!next) return next;
      if (Array.isArray(next.bankItems)) {
        next = { ...next, bank: bankFromItems(next.bankItems) };
      }
      if (!statTrackingSuspended && state.lifetimeStats) {
        const stats: LifetimeStats = next.lifetimeStats ?? state.lifetimeStats;
        let patch: Partial<LifetimeStats> | null = null;
        if (typeof next.gold === 'number' && next.gold > state.gold) {
          patch = {
            cashEarned: (stats.cashEarned ?? 0) + (next.gold - state.gold),
            peakGold: Math.max(stats.peakGold ?? 0, next.gold),
          };
        }
        if (Array.isArray(next.bankItems)) {
          let discovered: Record<string, number> | null = null;
          for (const it of next.bankItems as (BankItem | null)[]) {
            if (it && !(stats.discovered ?? {})[it.resourceId] && !discovered?.[it.resourceId]) {
              discovered = discovered ?? { ...(stats.discovered ?? {}) };
              discovered[it.resourceId] = Date.now();
            }
          }
          if (discovered) patch = { ...(patch ?? {}), discovered };
        }
        if (patch) next = { ...next, lifetimeStats: { ...stats, ...patch } };
      }
      return next;
    }, replace as any)) as typeof rawSet;

  const acquireTool = (
    tools: { id: string; name: string; icon: string; requirements: ToolRequirement[] }[],
    toolId: string,
    ownedKey: 'thievingToolsOwned' | 'smugglingToolsOwned' | 'drugToolsOwned' | 'distilleryToolsOwned' | 'investigationLabToolsOwned',
    equippedKey: 'equippedThievingToolId' | 'equippedSmugglingToolId' | 'equippedDrugToolId' | 'equippedDistilleryToolId' | 'equippedInvestigationLabToolId',
  ) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    const state = get();
    if (state[ownedKey]?.[toolId]) return;
    const paid = payRequirements(state, tool.requirements);
    if (!paid) {
      get().pushNotice({ kind: 'warning', title: 'Not enough resources', message: 'You are missing materials or cash for this upgrade.' });
      return;
    }
    set((s: GameStore) => ({
      gold: paid.gold,
      bankItems: paid.bankItems,
      [ownedKey]: { ...s[ownedKey], [toolId]: true },
      // Tools are bought in tier order, so a new one is always an upgrade: equip it.
      [equippedKey]: toolId,
    }) as Partial<GameStore>);
    get().pushNotice({ kind: 'success', title: 'Upgrade acquired', message: tool.name, icon: tool.icon });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  };

  // Stops every production skill and any pending thieving auto-restart.
  const haltAllSkills = () => {
    const { skills, stopActivity } = get();
    Object.keys(skills).forEach(id => {
      if (skills[id].isActive) stopActivity(id);
    });
    rawSet({ thievingAutoResume: false, currentThievingActivity: undefined });
  };

  return {
  skills: INITIAL_SKILLS,
  bank: bankFromItems(INITIAL_BANK_ITEMS),
  notices: [],
  offlineSummary: undefined,
  lifetimeStats: {
    ...emptyLifetimeStats(),
    peakGold: 5000,
    discovered: Object.fromEntries([
      ...INITIAL_BANK_ITEMS.filter((it): it is BankItem => !!it).map(it => it.resourceId),
      ...Object.values(STARTER_EQUIPMENT),
    ].map(id => [id, 0])),
  },
  respect: 0,
  achievementsUnlocked: {},
  contracts: [],
  contractsCompleted: 0,
  dailyStreak: 0,
  lastDailyClaim: undefined,
  bankItems: INITIAL_BANK_ITEMS,
  equipped: STARTER_EQUIPMENT,
  combatIsActive: false,
  combatDungeonId: 'back_alley',
  combatEnemyIndex: 0,
  combatEnemyHp: 30,
  combatPlayerHp: 100,
  combatSessionGold: 0,
  combatSessionItems: {},
  combatBgTimer: undefined,
  bankTabs: {},
  activeBankTab: 'all',
  bankTabsOrder: [],
  mastery: {},
  lastSaved: Date.now(),
  isLoading: true,
  activeTimers: {},
  combatAutoResume: false,
  combatSnapshot: undefined,
  combatLastTab: 'combat',
  combatSelectedDungeon: 'back_alley',
  combatDeath: undefined,
  currentSmugglingZone: undefined,
  gold: 5000,
  premiumCurrency: 0,
  heat: 0,
  arrestedUntil: 0,
  thievingCooldowns: {},
  heatDecayTimer: undefined,
  playerName: 'Drug Lord',
  playerIcon: 'Skull',
  thievingAutoResume: false,
  currentThievingActivity: undefined,
  xpToasts: [],
  thievingToolsOwned: {},
  equippedThievingToolId: undefined,
  // Smuggling
  smugglingToolsOwned: {},
  equippedSmugglingToolId: undefined,
  // Crafting tools
  drugToolsOwned: {},
  equippedDrugToolId: undefined,
  distilleryToolsOwned: {},
  equippedDistilleryToolId: undefined,
  investigationLabToolsOwned: {},
  equippedInvestigationLabToolId: undefined,
  // Bank capacity
  maxBankSlots: 30,
  gameSpeedMultiplier: 1,
  // Rewarded ads
  adsWatched: 0,
  adsGoal: 10,
  lastAdWatchedAt: undefined,
  setCombatAutoResume: (flag: boolean) => set({ combatAutoResume: flag }),
  setCombatSnapshot: (snap) => set({ combatSnapshot: snap }),
  getCombatSnapshot: () => get().combatSnapshot,
  clearCombatResume: () => set({ combatAutoResume: false, combatSnapshot: undefined }),

  setCombatDeath: (enemyName: string) => {
    set({ combatDeath: { enemyName, at: Date.now() } });
    get().bumpStat('deaths');
  },
  clearCombatDeath: () => set({ combatDeath: undefined }),

  setCombatLastTab: (tab) => set({ combatLastTab: tab }),
  setCombatSelectedDungeon: (id: string) => set({ combatSelectedDungeon: id }),

  pushXpToast: (amount: number, skillId: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set(state => ({ xpToasts: [...state.xpToasts, { id, amount, skillId }] }));
    setTimeout(() => {
      const { removeXpToast } = get();
      removeXpToast(id);
    }, 1400);
  },

  getPlayerLevelAvg: () => {
    const skills = get().skills;
    const list = Object.values(skills);
    const count = list.length;
    if (count === 0) return 1;
    const sum = list.reduce((acc, s) => acc + (typeof s.level === 'number' ? s.level : 1), 0);
    const avg = Math.floor(sum / count);
    return Math.max(1, avg);
  },
  removeXpToast: (id: string) => {
    set(state => ({ xpToasts: state.xpToasts.filter(t => t.id !== id) }));
  },

  loadGame: async () => {
    statTrackingSuspended = true;
    try {
      const savedGame = await AsyncStorage.getItem(SAVE_KEY);
      if (savedGame) {
        const gameData: GameState & { playerName?: string; playerIcon?: string; maxBankSlots?: number } = JSON.parse(savedGame);
        // Migrate old bank format to new format if needed
        let bankItems = gameData.bankItems || [];
        if (!gameData.bankItems && gameData.bank) {
          // Migrate from old format
          bankItems = [];
          Object.values(gameData.bank).forEach((item: BankItem) => {
            if (item.quantity > 0) {
              bankItems.push(item);
            }
          });
        }
        
        const validItems = bankItems.filter(item => item !== null && item && item.quantity > 0);
        const desiredSlots = Math.max(30, (gameData.maxBankSlots ?? 30));
        const finalBankItems: (BankItem | null)[] = [];
        // Never discard owned items, even if the save somehow holds more stacks than slots.
        for (let i = 0; i < Math.max(desiredSlots, validItems.length); i++) {
          if (i < validItems.length) {
            finalBankItems.push(validItems[i]);
          } else {
            finalBankItems.push(null);
          }
        }
        
        console.log(`Bank loaded with ${validItems.length} items, ${desiredSlots - validItems.length} empty slots, total: ${finalBankItems.length}`);
        
        // Merge saved skills with initial skills to ensure descriptions are added
        const mergedSkills = { ...INITIAL_SKILLS } as Record<string, Skill>;
        let resume: { skillId: string; activityId: string } | undefined;
        Object.keys(gameData.skills).forEach(skillId => {
          if (mergedSkills[skillId]) {
            const saved = gameData.skills[skillId] as Skill;
            mergedSkills[skillId] = {
              ...mergedSkills[skillId],
              ...saved,
              description: SKILL_DESCRIPTIONS[skillId] || mergedSkills[skillId].description,
            };
            // Recompute level from XP with new XP table
            const exp = mergedSkills[skillId].experience ?? 0;
            mergedSkills[skillId].level = getLevelFromXp(exp);
            // Timers don't survive a reload: remember what was running and restart it
            // properly (with its real definition) once the state is loaded.
            if (saved.isActive && saved.currentActivity?.id && !resume) {
              resume = { skillId, activityId: saved.currentActivity.id };
            }
            mergedSkills[skillId].isActive = false;
            mergedSkills[skillId].currentActivity = undefined;
          }
        });
        

        
        set({
          skills: mergedSkills,
          bank: gameData.bank || {},
          bankItems: finalBankItems,
          bankTabs: gameData.bankTabs || {},
          bankTabsOrder: gameData.bankTabsOrder || Object.keys(gameData.bankTabs || {}),
          activeBankTab: gameData.activeBankTab || 'all',
          mastery: gameData.mastery || {},
          lastSaved: gameData.lastSaved || Date.now(),
          gold: typeof (gameData as any).gold === 'number' ? (gameData as any).gold : 1000,
          premiumCurrency: (gameData as any).premiumCurrency ?? 0,
          heat: gameData.heat || 0,
          arrestedUntil: gameData.arrestedUntil || 0,
          thievingCooldowns: (gameData as any).thievingCooldowns ?? {},
          playerName: (gameData as any).playerName ?? 'Drug Lord',
          playerIcon: (gameData as any).playerIcon ?? 'Skull',
          isLoading: false,
          thievingAutoResume: (gameData as any).thievingAutoResume ?? false,
          thievingToolsOwned: (gameData as any).thievingToolsOwned ?? {},
          equippedThievingToolId: (gameData as any).equippedThievingToolId,
          smugglingToolsOwned: (gameData as any).smugglingToolsOwned ?? {},
          equippedSmugglingToolId: (gameData as any).equippedSmugglingToolId,
          drugToolsOwned: (gameData as any).drugToolsOwned ?? {},
          equippedDrugToolId: (gameData as any).equippedDrugToolId,
          distilleryToolsOwned: (gameData as any).distilleryToolsOwned ?? {},
          equippedDistilleryToolId: (gameData as any).equippedDistilleryToolId,
          investigationLabToolsOwned: (gameData as any).investigationLabToolsOwned ?? {},
          equippedInvestigationLabToolId: (gameData as any).equippedInvestigationLabToolId,
          maxBankSlots: desiredSlots,
          equipped: (gameData as any).equipped ?? {},
          adsWatched: (gameData as any).adsWatched ?? 0,
          adsGoal: (gameData as any).adsGoal ?? 10,
          lastAdWatchedAt: (gameData as any).lastAdWatchedAt,
          combatLastTab: ((gameData as any).combatLastTab as 'equipment'|'combat'|'dungeons') ?? 'combat',
          combatSelectedDungeon: (gameData as any).combatSelectedDungeon ?? 'back_alley',
          lifetimeStats: (() => {
            const saved = (gameData as any).lifetimeStats ?? {};
            const merged: LifetimeStats = { ...emptyLifetimeStats(), ...saved, produced: saved.produced ?? {}, discovered: { ...(saved.discovered ?? {}) } };
            // Older saves: seed the Collection Log with what's already owned.
            finalBankItems.forEach(it => { if (it && merged.discovered[it.resourceId] === undefined) merged.discovered[it.resourceId] = 0; });
            Object.values((gameData as any).equipped ?? {}).forEach((id: any) => { if (id && merged.discovered[id] === undefined) merged.discovered[id] = 0; });
            merged.peakGold = Math.max(merged.peakGold, typeof (gameData as any).gold === 'number' ? (gameData as any).gold : 0);
            merged.bestStreak = Math.max(merged.bestStreak, (gameData as any).dailyStreak ?? 0);
            return merged;
          })(),
          respect: (gameData as any).respect ?? 0,
          achievementsUnlocked: (gameData as any).achievementsUnlocked ?? {},
          contracts: Array.isArray((gameData as any).contracts) ? (gameData as any).contracts : [],
          contractsCompleted: (gameData as any).contractsCompleted ?? 0,
          dailyStreak: (gameData as any).dailyStreak ?? 0,
          lastDailyClaim: (gameData as any).lastDailyClaim,
        });
        
        // Restored state is in: from here on, gains are real and should count.
        statTrackingSuspended = false;
        // Process offline progress, then pick the activity back up
        get().processOfflineProgress(resume);
        if (resume) {
          const zone = resume.skillId === 'smuggling' ? resolveZone(resume.activityId) : undefined;
          const activity = zone ? undefined : resolveActivity(resume.skillId, resume.activityId);
          if (zone) get().startSmugglingZone(zone);
          else if (activity) get().startActivity(resume.skillId, activity);
        }
        if (get().heat > 0) get().startHeatDecay();
      } else {
        const desiredSlots = get().maxBankSlots;
        const finalBankItems: (BankItem | null)[] = [];
        for (let i = 0; i < desiredSlots; i++) {
          if (i < INITIAL_BANK_ITEMS.length && INITIAL_BANK_ITEMS[i]) {
            finalBankItems.push(INITIAL_BANK_ITEMS[i]);
          } else {
            finalBankItems.push(null);
          }
        }
        
        console.log(`Initialized bank with ${finalBankItems.filter(i => i !== null).length} items, total: ${finalBankItems.length}`);
        
        set({ 
          bankItems: finalBankItems,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      const desiredSlots = get().maxBankSlots;
      const finalBankItems: (BankItem | null)[] = [];
      for (let i = 0; i < desiredSlots; i++) {
        if (i < INITIAL_BANK_ITEMS.length && INITIAL_BANK_ITEMS[i]) {
          finalBankItems.push(INITIAL_BANK_ITEMS[i]);
        } else {
          finalBankItems.push(null);
        }
      }
      
      set({ 
        bankItems: finalBankItems,
        isLoading: false 
      });
    }
    statTrackingSuspended = false;
    // Every boss needs something to do: make sure the contract board is full.
    get().refillContracts();
  },

  saveGame: async () => {
    try {
      const { skills, bank, bankItems, bankTabs, bankTabsOrder, activeBankTab, mastery, gold, premiumCurrency, heat, arrestedUntil, thievingCooldowns, playerName, playerIcon, thievingAutoResume, thievingToolsOwned, equippedThievingToolId, smugglingToolsOwned, equippedSmugglingToolId, drugToolsOwned, equippedDrugToolId, distilleryToolsOwned, equippedDistilleryToolId, investigationLabToolsOwned, equippedInvestigationLabToolId, maxBankSlots, equipped, combatLastTab, combatSelectedDungeon } = get();
      const gameData: GameState & { bankItems: (BankItem | null)[]; bankTabs: Record<string, BankTab>; bankTabsOrder: string[]; activeBankTab: 'all' | string; playerName: string; playerIcon: string; thievingCooldowns: Record<string, number>; thievingAutoResume: boolean; thievingToolsOwned: Record<string, boolean>; equippedThievingToolId?: string; smugglingToolsOwned: Record<string, boolean>; equippedSmugglingToolId?: string; drugToolsOwned: Record<string, boolean>; equippedDrugToolId?: string; distilleryToolsOwned: Record<string, boolean>; equippedDistilleryToolId?: string; investigationLabToolsOwned: Record<string, boolean>; equippedInvestigationLabToolId?: string; maxBankSlots: number; premiumCurrency: number; adsWatched: number; adsGoal: number; lastAdWatchedAt?: number; equipped: Partial<Record<EquipmentSlot, string>>; combatLastTab: 'equipment'|'combat'|'dungeons'; combatSelectedDungeon?: string } = {
        skills,
        bank,
        bankItems,
        bankTabs,
        bankTabsOrder: bankTabsOrder ?? [],
        activeBankTab,
        mastery,
        lastSaved: Date.now(),
        gold,
        heat,
        arrestedUntil,
        thievingCooldowns: thievingCooldowns ?? {},
        playerName,
        playerIcon,
        thievingAutoResume,
        thievingToolsOwned,
        equippedThievingToolId,
        smugglingToolsOwned,
        equippedSmugglingToolId,
        drugToolsOwned,
        equippedDrugToolId,
        distilleryToolsOwned,
        equippedDistilleryToolId,
        investigationLabToolsOwned,
        equippedInvestigationLabToolId,
        maxBankSlots,
        premiumCurrency,
        adsWatched: (get() as any).adsWatched ?? 0,
        adsGoal: (get() as any).adsGoal ?? 10,
        lastAdWatchedAt: (get() as any).lastAdWatchedAt,
        equipped,
        combatLastTab,
        combatSelectedDungeon,
        lifetimeStats: get().lifetimeStats,
        respect: get().respect,
        achievementsUnlocked: get().achievementsUnlocked,
        contracts: get().contracts,
        contractsCompleted: get().contractsCompleted,
        dailyStreak: get().dailyStreak,
        lastDailyClaim: get().lastDailyClaim,
      } as typeof gameData & { lifetimeStats: LifetimeStats };
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
      setTimeout(() => {
        try {
          set({ lastSaved: Date.now() });
        } catch (e) {
          console.log('Deferred lastSaved update failed', e);
        }
      }, 0);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },

  getAdjustedActionTime: (skillId: string, baseTime: number, activityId: string) => {
    const base = get().getActualTime(skillId, baseTime, activityId);
    const mult = (() => {
      if (skillId === 'drug_factory') return get().getDrugToolBonuses().timeReductionMultiplier;
      if (skillId === 'distillery') return get().getDistilleryToolBonuses().timeReductionMultiplier;
      if (skillId === 'investigation_lab') return get().getInvestigationLabToolBonuses().timeReductionMultiplier;
      if (skillId === 'smuggling') return get().getSmugglingToolBonuses().timeReductionMultiplier;
      return 1;
    })();
    return Math.max(100, Math.floor(base * (mult ?? 1)));
  },

  startActivity: (skillId: string, activity: Activity) => {
    const { skills, thievingCooldowns } = get();
    try {
      get().stopBackgroundCombat();
      set({ combatAutoResume: false, combatSnapshot: undefined, combatIsActive: false });
    } catch (e) {
      console.log('stop combat on startActivity failed', e);
    }

    const skill = skills[skillId];
    if (!skill || skill.level < activity.levelRequired) {
      console.log('Cannot start activity: level requirement not met');
      return;
    }

    // Per-activity cooldown check for thieving
    if (skillId === 'thieving') {
      const until = thievingCooldowns?.[activity.id];
      if (until && until > Date.now()) {
        haltAllSkills();
        // Queue the target: it starts by itself as soon as the cooldown ends.
        set({ currentThievingActivity: activity, thievingAutoResume: true });
        setTimeout(() => {
          const state = get();
          if (state.thievingAutoResume &&
              state.currentThievingActivity?.id === activity.id &&
              !state.skills.thieving.isActive) {
            get().restartThievingAfterCooldown(activity);
          }
        }, until - Date.now());
        return;
      }
    }

    const isCrafting = skillId === 'drug_factory' || skillId === 'distillery' || skillId === 'investigation_lab';
    const getCraftBonuses = () => {
      if (skillId === 'drug_factory') return get().getDrugToolBonuses();
      if (skillId === 'distillery') return get().getDistilleryToolBonuses();
      if (skillId === 'investigation_lab') return get().getInvestigationLabToolBonuses();
      return undefined;
    };
    // Inputs actually charged per cycle once tool reductions apply.
    const getCycleInputs = (rollSave: boolean) => {
      if (!activity.inputs || activity.inputs.length === 0) return [] as { resourceId: string; quantity: number }[];
      const b = getCraftBonuses();
      if (!b) return activity.inputs;
      const mult = Math.max(0, b.inputReductionMultiplier ?? 1);
      const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
      if (rollSave && (b.inputSaveChance ?? 0) > 0 && Math.random() < (b.inputSaveChance ?? 0)) {
        reduced[0] = { resourceId: reduced[0].resourceId, quantity: Math.max(0, reduced[0].quantity - 1) };
      }
      return reduced;
    };

    if (activity.inputs && activity.inputs.length > 0 && !hasRequiredInputs(get().bank, { ...activity, inputs: getCycleInputs(false) })) {
      console.log('Cannot start activity: missing required inputs');
      get().pushNotice({ kind: 'warning', title: 'Missing materials', message: `You need more materials for ${activity.name}.` });
      return;
    }

    // Only one thing runs at a time: stop other skills and any queued thieving restart.
    haltAllSkills();
    if (skillId === 'thieving') {
      set({ currentThievingActivity: activity });
    }

    const adjustedTime = get().getAdjustedActionTime(skillId, activity.baseTime, activity.id);

    const timer = setInterval(() => {
      const { addExperience, addResource, addMasteryExperience, consumeInputs, addGold } = get();
      const craftB = isCrafting ? getCraftBonuses() : undefined;

      if (activity.inputs && activity.inputs.length > 0) {
        if (!consumeInputs(getCycleInputs(true))) {
          get().stopActivity(skillId);
          get().pushNotice({ kind: 'warning', title: 'Out of materials', message: `${activity.name} stopped. Restock in the Shop.`, skillId });
          return;
        }
      }

      // Check for getting caught (thieving only)
      if (skillId === 'thieving') {
        const { heat } = get();
        const masteryBonus = get().getThievingMasteryBonus(activity.id);
        
        // Base catch rate from activity (this is the chance of getting caught)
        let catchRate = activity.failureChance || 0;
        
        // Apply level-based reduction for lower-level targets
        // Lower level targets are easier to steal from
        const levelFactor = Math.max(0.5, Math.min(1.5, activity.levelRequired / 40));
        catchRate *= levelFactor;
        
        // Apply mastery reduction (reduces catch rate) and tool reduction
        const toolB = get().getThievingToolBonuses();
        catchRate *= (masteryBonus.failureReduction * toolB.failureReductionMultiplier);
        
        // Apply manager (agent) catch-rate reduction if unlocked (−40% catch rate)
        const agentActiveCatch = get().skills.thieving.agentUnlocked ?? false;
        if (agentActiveCatch) {
          catchRate *= 0.5;
        }
        
        // Apply the new heat percentage bonus rule:
        // +0.1% per heat percentage up to 30%
        // +0.2% per heat percentage from 30% to 70%
        // +0.4% per heat percentage from 70% to 100%
        let heatPercentageBonus = 0;
        if (heat <= 30) {
          heatPercentageBonus = heat * 0.1;
        } else if (heat <= 70) {
          heatPercentageBonus = (30 * 0.1) + ((heat - 30) * 0.2);
        } else {
          heatPercentageBonus = (30 * 0.1) + (40 * 0.2) + ((heat - 70) * 0.4);
        }
        
        // Final catch rate = base + heat bonus
        catchRate += heatPercentageBonus;
        
        // Clamp catch rate between reasonable bounds
        catchRate = Math.min(95, Math.max(1, catchRate));
        
        const gotCaught = Math.random() * 100 < catchRate;
        
        if (gotCaught) {
          console.log(`Got caught! Catch rate was ${catchRate.toFixed(1)}%`);
          
          // Determine if it's just a fail or an arrest using static arrestChance from activity
          const staticArrestChance = Math.max(0, Math.min(100, activity.arrestChance ?? 0));
          const arrested = Math.random() * 100 < staticArrestChance;
          get().bumpStat(arrested ? 'timesArrested' : 'timesCaught');
          
          // Static cooldowns per activity, reduced when thieving agent is unlocked
          const agentActive = get().skills.thieving.agentUnlocked ?? false;
          const failCooldownBase = Math.min(15000 + activity.levelRequired * 500, 45000);
          const arrestCooldownBase = Math.min(60000 + activity.levelRequired * 1500, 180000);
          const toolB = get().getThievingToolBonuses();
          // Apply agent time reduction, then tool flat time reduction, then tool multiplier
          const failBaseAfterAgent = agentActive ? Math.floor(failCooldownBase * 0.5) : failCooldownBase;
          const arrestBaseAfterAgent = agentActive ? Math.floor(arrestCooldownBase * 0.5) : arrestCooldownBase;
          const failAfterFlat = Math.floor(failBaseAfterAgent * (1 - (toolB.cooldownTimeReduction ?? 0)));
          const arrestAfterFlat = Math.floor(arrestBaseAfterAgent * (1 - (toolB.cooldownTimeReduction ?? 0)));
          const failCooldown = Math.max(100, Math.floor(failAfterFlat * toolB.cooldownReductionMultiplier));
          const arrestCooldown = Math.max(100, Math.floor(arrestAfterFlat * toolB.cooldownReductionMultiplier));
          
          const duration = arrested ? arrestCooldown : failCooldown;
          
          set(state => ({
            thievingCooldowns: {
              ...(state.thievingCooldowns || {}),
              [activity.id]: Date.now() + duration,
            },
          }));
          
          const toolB2 = get().getThievingToolBonuses();
          if (arrested) {
            console.log('Arrested! Applying longer static cooldown.');
            const baseAddRaw = activity.heatGenerated ? Math.round(activity.heatGenerated * 3) : 10;
            const addedHeat = Math.max(0, Math.floor(baseAddRaw * toolB2.heatReductionMultiplier));
            get().addHeat(addedHeat);
          } else {
            if (activity.heatGenerated) {
              const baseAdd = Math.max(1, Math.floor(activity.heatGenerated * 0.5));
              const addedHeat = Math.max(0, Math.floor(baseAdd * toolB2.heatReductionMultiplier));
              get().addHeat(addedHeat);
            }
          }
          
          // Stop current thieving loop WITHOUT disabling auto-resume
          const stateBefore = get();
          const timerRef = stateBefore.activeTimers[skillId];
          if (timerRef) {
            clearInterval(timerRef);
          }
          set(s => ({
            skills: {
              ...s.skills,
              [skillId]: {
                ...s.skills[skillId],
                isActive: false,
                currentActivity: s.skills[skillId].currentActivity,
              },
            },
            activeTimers: Object.fromEntries(Object.entries(s.activeTimers).filter(([key]) => key !== skillId)),
            // keep thievingAutoResume as-is
          }));
          
          // Start heat decay when entering cooldown (no other thieving is active)
          get().startHeatDecay();
          
          // Schedule restart after cooldown if auto-resume is enabled
          const cooldownEnd = Date.now() + duration;
          console.log(`Scheduling restart in ${duration}ms (${duration/1000}s) for ${activity.name}`);
          setTimeout(() => {
            const state = get();
            const currentCooldown = state.thievingCooldowns?.[activity.id];
            // Only restart if this is still the selected activity AND no other activity is running
            if (state.thievingAutoResume && 
                (!currentCooldown || currentCooldown <= Date.now()) &&
                state.currentThievingActivity?.id === activity.id &&
                !state.skills.thieving.isActive) {
              console.log(`Cooldown ended, auto-restarting ${activity.name}`);
              get().restartThievingAfterCooldown(activity);
            }
          }, duration);
          
          // Still give some XP for the attempt
          const xpToAward = activity.getDynamicXp ? activity.getDynamicXp(get().skills[skillId].level) : activity.baseXp;
          addExperience(skillId, Math.floor(xpToAward * 0.1));
          addMasteryExperience(activity.id, 1);
          return;
        }
      }
      
      // Success - handle thieving loot table or normal resource
      let xpFactor = 1;
      if (skillId === 'thieving' && activity.lootTable) {
        const { heat, skills } = get();
        const agentActive = skills.thieving.agentUnlocked ?? false;
        const heatPenalty = heat >= 100 ? 0.5 : 1.0;
        const toolB3 = get().getThievingToolBonuses();
        
        get().recordProduced('thieving', 1);
        get().trackContract({ type: 'theft', qty: 1 });
        // 1) Guaranteed cash payout
        const cashEntry = activity.lootTable.find(l => l.resourceId === 'cash' || l.resourceId === 'loose_change');
        if (cashEntry) {
          const baseQuantity = cashEntry.minQuantity + Math.random() * (cashEntry.maxQuantity - cashEntry.minQuantity + 1);
          let quantity = Math.max(1, Math.floor(baseQuantity * heatPenalty * (toolB3.lootBonusMultiplier || 1)));
          if (toolB3.extraLootChance && Math.random() < toolB3.extraLootChance) {
            quantity += 1;
          }
          if (agentActive && Math.random() < 0.5) {
            quantity *= 2;
          }
          addGold(quantity);
          console.log(`Thieving: guaranteed cash awarded ${quantity}`);
        } else {
          // Fallback if no explicit cash entry found
          const fallbackCash = Math.max(1, Math.floor(10 * (agentActive ? 1.5 : 1.0)));
          addGold(fallbackCash);
          console.log(`Thieving: no cash entry in lootTable, awarded fallback ${fallbackCash}`);
        }
        
        // 2) Optional single item roll from the rest of the drop list (not guaranteed)
        const itemPool = activity.lootTable.filter(l => l.resourceId !== 'cash' && l.resourceId !== 'loose_change');
        if (itemPool.length > 0) {
          const totalWeight = itemPool.reduce((sum, l) => sum + Math.max(0, l.weight), 0);
          if (totalWeight > 0) {
            // Select one candidate by weight
            let r = Math.random() * totalWeight;
            let selected = itemPool[0];
            for (const l of itemPool) {
              r -= Math.max(0, l.weight);
              if (r <= 0) { selected = l; break; }
            }
            // Roll chance to actually drop this selected item (not guaranteed)
            const baseChance = Math.max(0, Math.min(100, selected.weight));
            const boostedChance = Math.min(100, baseChance * (toolB3.lootBonusMultiplier || 1));
            const roll = Math.random() * 100;
            if (roll < boostedChance) {
              const baseQuantity = selected.minQuantity + Math.random() * (selected.maxQuantity - selected.minQuantity + 1);
              let quantity = Math.max(1, Math.floor(baseQuantity * heatPenalty * (toolB3.lootBonusMultiplier || 1)));
              if (toolB3.extraLootChance && Math.random() < toolB3.extraLootChance) {
                quantity += 1;
              }
              if (agentActive && Math.random() < 0.5) {
                quantity *= 2;
              }
              if (quantity > 0) {
                addResource(selected.resourceId, quantity);
                console.log(`Thieving: bonus item drop ${selected.resourceId} x${quantity} (roll ${roll.toFixed(2)} < ${boostedChance.toFixed(2)})`);
              }
            } else {
              console.log(`Thieving: no bonus item dropped (roll ${roll.toFixed(2)} >= ${boostedChance.toFixed(2)})`);
            }
          }
        }
      } else {
        // Normal resource generation with failure chance support (non-thieving skills)
        const baseFailChance = Math.max(0, Math.min(100, activity.failureChance ?? 0));
        const agentActive = get().skills[skillId]?.agentUnlocked ?? false;
        let effectiveFailChance = baseFailChance;
        if (skillId !== 'thieving' && agentActive) effectiveFailChance = Math.max(0, effectiveFailChance - 10);
        if (skillId === 'drug_factory') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (craftB?.failureReductionMultiplier ?? 1)));
        if (skillId === 'distillery') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (craftB?.failureReductionMultiplier ?? 1)));
        if (skillId === 'investigation_lab') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (craftB?.failureReductionMultiplier ?? 1)));
        const failed = Math.random() * 100 < effectiveFailChance;
        if (failed) {
          // A botched batch still teaches you something, but only a fraction.
          xpFactor = 0.1;
        } else {
          let outMult = 1;
          if (skillId === 'drug_factory') outMult = Math.max(1, Math.floor(craftB?.outputMultiplier ?? 1));
          if (skillId === 'distillery') outMult = Math.max(1, Math.floor(craftB?.outputMultiplier ?? 1));
          if (skillId === 'investigation_lab') outMult = Math.max(1, Math.floor(craftB?.outputMultiplier ?? 1));
          const managerBonus = (skillId !== 'thieving' && agentActive) ? 1 : 0;
          const quantityToAdd = Math.max(1, outMult + managerBonus);
          addResource(activity.resource.id, quantityToAdd);
          get().recordProduced(skillId, quantityToAdd);
          get().trackContract({ type: 'produce', skillId, resourceId: activity.resource.id, qty: quantityToAdd });
        }
      }
      
      const xpToAward = activity.getDynamicXp ? activity.getDynamicXp(get().skills[skillId].level) : activity.baseXp;
      addExperience(skillId, Math.floor(xpToAward * xpFactor));
      addMasteryExperience(activity.id, 1);

      // Add heat for successful thieving activities (reduced with agent)
      if (skillId === 'thieving' && activity.heatGenerated) {
        const toolB = get().getThievingToolBonuses();
        const heatAdd = Math.max(0, Math.floor(activity.heatGenerated * toolB.heatReductionMultiplier));
        get().addHeat(heatAdd);
      }

      // Stop gracefully once the next cycle can't be paid for.
      if (activity.inputs && activity.inputs.length > 0 && !hasRequiredInputs(get().bank, { ...activity, inputs: getCycleInputs(false) })) {
        get().stopActivity(skillId);
        get().pushNotice({ kind: 'warning', title: 'Out of materials', message: `${activity.name} stopped. Restock in the Shop.`, skillId });
      }
    }, adjustedTime);

    set(state => ({
      skills: {
        ...state.skills,
        [skillId]: {
          ...state.skills[skillId],
          isActive: true,
          currentActivity: activity,
        },
      },
      activeTimers: {
        ...state.activeTimers,
        [skillId]: timer,
      },
      thievingAutoResume: skillId === 'thieving',
    }));

    // Heat only cools down while the player isn't thieving
    if (skillId === 'thieving') {
      get().stopHeatDecay();
    } else {
      get().startHeatDecay();
    }
  },

  // Investigation Lab tools helpers
  getEquippedInvestigationLabTool: () => {
    const { equippedInvestigationLabToolId } = get();
    if (!equippedInvestigationLabToolId) return undefined;
    const tool = INVESTIGATION_LAB_TOOLS.find(t => t.id === equippedInvestigationLabToolId);
    if (!tool) return undefined;
    return { id: tool.id, tier: tool.tier };
  },

  getInvestigationLabToolBonuses: () => {
    const { equippedInvestigationLabToolId } = get();
    const tool = INVESTIGATION_LAB_TOOLS.find(t => t.id === equippedInvestigationLabToolId);
    const bonuses = tool?.bonuses ?? { failureReductionMultiplier: 1, timeReductionMultiplier: 1, outputMultiplier: 1, inputReductionMultiplier: 1, inputSaveChance: 0 };
    return {
      failureReductionMultiplier: bonuses.failureReductionMultiplier,
      timeReductionMultiplier: bonuses.timeReductionMultiplier,
      outputMultiplier: bonuses.outputMultiplier,
      inputReductionMultiplier: bonuses.inputReductionMultiplier ?? 1,
      inputSaveChance: bonuses.inputSaveChance ?? 0,
    };
  },

  acquireInvestigationLabTool: (toolId: string) => acquireTool(INVESTIGATION_LAB_TOOLS, toolId, 'investigationLabToolsOwned', 'equippedInvestigationLabToolId'),

  equipInvestigationLabTool: (toolId: string) => {
    const { investigationLabToolsOwned } = get();
    if (!investigationLabToolsOwned[toolId]) return;
    set({ equippedInvestigationLabToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  // Smuggling tools helpers
  getEquippedSmugglingTool: () => {
    const { equippedSmugglingToolId } = get();
    if (!equippedSmugglingToolId) return undefined;
    const tool = SMUGGLING_TOOLS.find(t => t.id === equippedSmugglingToolId);
    if (!tool) return undefined;
    return { id: tool.id, tier: tool.tier };
  },

  getSmugglingToolBonuses: () => {
    const { equippedSmugglingToolId } = get();
    const tool = SMUGGLING_TOOLS.find(t => t.id === equippedSmugglingToolId);
    const bonuses = tool?.bonuses ?? { timeReductionMultiplier: 1, junkReductionMultiplier: 1, itemsPerActionBonus: 0, rareWeightMultiplier: 1 };
    return {
      timeReductionMultiplier: bonuses.timeReductionMultiplier ?? 1,
      junkReductionMultiplier: bonuses.junkReductionMultiplier ?? 1,
      itemsPerActionBonus: bonuses.itemsPerActionBonus ?? 0,
      rareWeightMultiplier: bonuses.rareWeightMultiplier ?? 1,
    };
  },

  acquireSmugglingTool: (toolId: string) => acquireTool(SMUGGLING_TOOLS, toolId, 'smugglingToolsOwned', 'equippedSmugglingToolId'),

  equipSmugglingTool: (toolId: string) => {
    const { smugglingToolsOwned } = get();
    if (!smugglingToolsOwned[toolId]) return;
    set({ equippedSmugglingToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  startSmugglingZone: (zone: SmugglingZone) => {
    try {
      get().stopBackgroundCombat();
      set({ combatAutoResume: false, combatSnapshot: undefined, combatIsActive: false });
    } catch (e) {
      console.log('stop combat on startSmugglingZone failed', e);
    }

    const skillId = 'smuggling';
    if (get().skills.smuggling.level < zone.levelRequired) {
      console.log('Cannot start smuggling zone: level requirement not met');
      return;
    }

    haltAllSkills();

    const adjustedTime = get().getAdjustedActionTime('smuggling', zone.baseTime, `smuggling_${zone.id}`);

    const timer = setInterval(() => {
      const { addExperience, addResource, addMasteryExperience, getMasteryLevel } = get();
      const playerLevel = get().skills.smuggling.level;
      
      // Calculate items per action based on mastery milestones
      const masteryId = `smuggling_${zone.id}`;
      const masteryLevel = getMasteryLevel(masteryId);
      let bonusItems = 0;
      if (masteryLevel >= 100) bonusItems = 5; // +5 at 100
      else if (masteryLevel >= 75) bonusItems = 3; // +3 at 75
      else if (masteryLevel >= 50) bonusItems = 2; // +2 at 50
      else if (masteryLevel >= 25) bonusItems = 1; // +1 at 25
      const agentActiveSmug = get().skills.smuggling.agentUnlocked ?? false;
      const itemsPerAction = 1 + bonusItems + (get().getSmugglingToolBonuses().itemsPerActionBonus ?? 0) + (agentActiveSmug ? 1 : 0);

      const smugBonuses = get().getSmugglingToolBonuses();
      let junkChance = Math.max(0, Math.floor(zone.junkChance * (smugBonuses.junkReductionMultiplier ?? 1)));
      if (agentActiveSmug) {
        junkChance = Math.max(0, junkChance - 15);
      }
      
      // Process multiple items based on mastery (loot + bank updates)
      for (let i = 0; i < itemsPerAction; i++) {
        if (Math.random() * 100 < junkChance) {
          addResource('pile_of_junk', 1);
          continue;
        }
        const bonuses = get().getSmugglingToolBonuses();
        const availableItems = zone.items.map(it => ({
          ...it,
          weight: it.minLevel ? it.weight * (bonuses.rareWeightMultiplier ?? 1) : it.weight,
        })).filter(item => !item.minLevel || playerLevel >= item.minLevel);
        if (availableItems.length === 0) {
          addResource('pile_of_junk', 1);
          continue;
        }
        const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedItem = availableItems[0];
        for (const item of availableItems) {
          random -= item.weight;
          if (random <= 0) { selectedItem = item; break; }
        }
        addResource(selectedItem.resource.id, 1);
        if (selectedItem.minLevel) {
          get().bumpStat('rareCollected');
          get().pushNotice({ kind: 'success', title: 'Rare find!', message: `Your crew smuggled in ${selectedItem.resource.name}.`, icon: selectedItem.resource.icon });
        }
      }
      get().trackContract({ type: 'run', qty: 1 });
      get().bumpStat('smugglingRuns');
      
      // Award XP scaled to match target time-to-levels irrespective of loot composition
      const targetPerActionXp = getSmugglingXp(playerLevel, adjustedTime);
      const xpAward = Math.max(1, Math.floor(targetPerActionXp));
      addExperience(skillId, xpAward);
      addMasteryExperience(`smuggling_${zone.id}`, 1);
    }, adjustedTime);

    set(state => ({
      skills: {
        ...state.skills,
        [skillId]: {
          ...state.skills[skillId],
          isActive: true,
          currentActivity: {
            id: `smuggling_${zone.id}`,
            name: zone.name,
            skillId: 'smuggling',
            baseTime: zone.baseTime,
            baseXp: 0,
            levelRequired: zone.levelRequired,
            resource: RESOURCES.pile_of_junk,
          },
        },
      },
      activeTimers: {
        ...state.activeTimers,
        [skillId]: timer,
      },
      currentSmugglingZone: zone,
    }));
    get().startHeatDecay();
  },

  stopActivity: (skillId: string) => {
    const { activeTimers } = get();
    
    if (activeTimers[skillId]) {
      clearInterval(activeTimers[skillId]);
    }

    set(state => ({
      skills: {
        ...state.skills,
        [skillId]: {
          ...state.skills[skillId],
          isActive: false,
          currentActivity: undefined,
        },
      },
      activeTimers: Object.fromEntries(
        Object.entries(state.activeTimers).filter(([key]) => key !== skillId)
      ),
      currentSmugglingZone: skillId === 'smuggling' ? undefined : state.currentSmugglingZone,
      thievingAutoResume: skillId === 'thieving' ? false : state.thievingAutoResume,
      currentThievingActivity: skillId === 'thieving' ? undefined : state.currentThievingActivity,
    }));
    
    // Start heat decay when thieving is manually stopped (player is idle)
    if (skillId === 'thieving') {
      get().startHeatDecay();
    }
  },

  addExperience: (skillId: string, xp: number) => {
    const xpMultiplier = get().gameSpeedMultiplier;
    const finalXp = Math.floor(xp * xpMultiplier);

    const XP_CAP = 15_000_000;

    set(state => {
      const skill = state.skills[skillId];
      const currentXp = skill.experience ?? 0;
      if (currentXp >= XP_CAP || finalXp <= 0) {
        return {};
      }
      const remaining = Math.max(0, XP_CAP - currentXp);
      const toAdd = Math.max(0, Math.min(remaining, finalXp));
      const newXp = currentXp + toAdd;
      const newLevel = getLevelFromXp(newXp);
      const justUnlockedAgent = !skill.agentUnlocked && newLevel >= 100;
      const leveledUp = newLevel > (skill.level ?? 1);

      // Defer side effects to avoid nested set issues
      setTimeout(() => {
        try {
          if (toAdd > 0) get().pushXpToast(toAdd, skillId);
          if (leveledUp) {
            get().pushNotice({ kind: 'levelup', title: `${skill.name} level ${newLevel}!`, message: 'New jobs and bonuses may be unlocked.', skillId });
          }
          if (justUnlockedAgent) {
            get().pushNotice({ kind: 'agent', title: 'Agent recruited!', message: `A specialist now runs your ${skill.name} operation.`, skillId });
          }
        } catch (e) {
          console.log('notify failed', e);
        }
      }, 0);

      return {
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            experience: newXp,
            level: newLevel,
            agentUnlocked: skill.agentUnlocked || justUnlockedAgent,
          },
        },
      };
    });
  },

  addResource: (resourceId: string, quantity: number) => {
    if (quantity <= 0) return;
    let full = false;
    set(state => {
      const items = padItems(state.bankItems, state.maxBankSlots);
      if (!addToItems(items, resourceId, quantity)) {
        full = true;
        return {};
      }
      return { bankItems: items };
    });
    if (full) {
      const now = Date.now();
      // Throttle: a full bank would otherwise warn on every single action.
      if (now - lastBankFullNotice > 8000) {
        lastBankFullNotice = now;
        get().pushNotice({ kind: 'warning', title: 'Bank is full!', message: `${RESOURCES[resourceId]?.name ?? 'Loot'} was lost. Sell items or buy more slots.` });
      }
    }
  },

  processOfflineProgress: (resume?: { skillId: string; activityId: string }) => {
    const { lastSaved, skills } = get();
    const elapsedMs = Math.max(0, Date.now() - lastSaved);
    if (!resume || elapsedMs < MIN_OFFLINE_MS) return;
    const skill = skills[resume.skillId];
    if (!skill) return;
    const cappedMs = Math.min(elapsedMs, MAX_OFFLINE_MS);

    const gained: Record<string, number> = {};
    const consumed: Record<string, number> = {};
    const gain = (id: string, qty: number) => { if (qty > 0) gained[id] = (gained[id] ?? 0) + qty; };
    // Probabilistic rounding keeps expected values honest for small counts.
    const roundChance = (x: number) => Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0);

    let level = skill.level;
    let xp = skill.experience ?? 0;
    const levelBefore = level;
    let actions = 0;
    let goldGained = 0;
    let activityName = '';
    const awardXp = (amount: number) => {
      xp += amount;
      level = getLevelFromXp(xp);
    };

    if (resume.skillId === 'smuggling') {
      const zone = resolveZone(resume.activityId);
      if (!zone) return;
      activityName = zone.name;
      const actionTime = get().getAdjustedActionTime('smuggling', zone.baseTime, resume.activityId);
      actions = Math.floor(cappedMs / actionTime);
      const bonuses = get().getSmugglingToolBonuses();
      const agent = skill.agentUnlocked ?? false;
      const masteryLevel = get().getMasteryLevel(resume.activityId);
      const masteryBonus = masteryLevel >= 100 ? 5 : masteryLevel >= 75 ? 3 : masteryLevel >= 50 ? 2 : masteryLevel >= 25 ? 1 : 0;
      const perAction = 1 + masteryBonus + (bonuses.itemsPerActionBonus ?? 0) + (agent ? 1 : 0);
      let junkChance = Math.max(0, Math.floor(zone.junkChance * (bonuses.junkReductionMultiplier ?? 1)));
      if (agent) junkChance = Math.max(0, junkChance - 15);
      const pool = zone.items
        .filter(it => !it.minLevel || level >= it.minLevel)
        .map(it => ({ id: it.resource.id, weight: it.minLevel ? it.weight * (bonuses.rareWeightMultiplier ?? 1) : it.weight }));
      const totalWeight = pool.reduce((sum, it) => sum + it.weight, 0);
      const rolls = actions * perAction;
      gain('pile_of_junk', roundChance(rolls * junkChance / 100));
      const goodRolls = rolls * (1 - junkChance / 100);
      pool.forEach(it => gain(it.id, roundChance(goodRolls * it.weight / Math.max(1, totalWeight))));
      for (let i = 0; i < actions; i++) awardXp(Math.max(1, Math.floor(getSmugglingXp(level, actionTime))));
      get().trackContract({ type: 'run', qty: actions });
      get().bumpStat('smugglingRuns', actions);
    } else if (resume.skillId === 'thieving') {
      const activity = resolveActivity('thieving', resume.activityId);
      if (!activity) return;
      activityName = activity.name;
      const actionTime = get().getAdjustedActionTime('thieving', activity.baseTime, activity.id);
      // Approximate the live loop: each catch costs a cooldown before the next attempt.
      const toolB = get().getThievingToolBonuses();
      const mastery = get().getThievingMasteryBonus(activity.id);
      const agent = skill.agentUnlocked ?? false;
      let catchRate = (activity.failureChance ?? 0) * Math.max(0.5, Math.min(1.5, activity.levelRequired / 40));
      catchRate *= mastery.failureReduction * toolB.failureReductionMultiplier * (agent ? 0.5 : 1);
      catchRate = Math.min(95, Math.max(1, catchRate)) / 100;
      const failCooldown = Math.min(15000 + activity.levelRequired * 500, 45000) * (agent ? 0.5 : 1) * toolB.cooldownReductionMultiplier;
      const cycleMs = actionTime + catchRate * failCooldown;
      actions = Math.floor(cappedMs / cycleMs);
      const successes = Math.round(actions * (1 - catchRate));
      get().recordProduced('thieving', successes);
      get().trackContract({ type: 'theft', qty: successes });
      const cash = activity.lootTable?.find(l => l.resourceId === 'cash' || l.resourceId === 'loose_change');
      const avgCash = cash ? (cash.minQuantity + cash.maxQuantity) / 2 : 10;
      goldGained = Math.floor(successes * avgCash * (toolB.lootBonusMultiplier || 1) * (agent ? 1.5 : 1));
      const itemPool = (activity.lootTable ?? []).filter(l => l !== cash);
      const poolWeight = itemPool.reduce((sum, l) => sum + Math.max(0, l.weight), 0);
      itemPool.forEach(l => {
        const pickChance = poolWeight > 0 ? l.weight / poolWeight : 0;
        const dropChance = Math.min(1, l.weight * (toolB.lootBonusMultiplier || 1) / 100);
        gain(l.resourceId, roundChance(successes * pickChance * dropChance * (l.minQuantity + l.maxQuantity) / 2));
      });
      const successXp = () => (activity.getDynamicXp ? activity.getDynamicXp(level) : activity.baseXp);
      for (let i = 0; i < successes; i++) awardXp(successXp());
      awardXp(Math.floor((actions - successes) * successXp() * 0.1));
    } else {
      const activity = resolveActivity(resume.skillId, resume.activityId);
      if (!activity) return;
      activityName = activity.name;
      const actionTime = get().getAdjustedActionTime(resume.skillId, activity.baseTime, activity.id);
      const craftB = resume.skillId === 'drug_factory' ? get().getDrugToolBonuses()
        : resume.skillId === 'distillery' ? get().getDistilleryToolBonuses()
        : get().getInvestigationLabToolBonuses();
      const inputs = (activity.inputs ?? []).map(inp => ({
        resourceId: inp.resourceId,
        quantity: Math.max(1, Math.ceil(inp.quantity * Math.max(0, craftB.inputReductionMultiplier ?? 1))),
      }));
      // Offline crafting is limited by the materials in the bank, just like live play.
      const bank = get().bank;
      const affordable = inputs.reduce((min, inp) => Math.min(min, Math.floor((bank[inp.resourceId]?.quantity ?? 0) / inp.quantity)), Number.MAX_SAFE_INTEGER);
      actions = Math.min(Math.floor(cappedMs / actionTime), affordable);
      if (actions <= 0) return;
      inputs.forEach(inp => { consumed[inp.resourceId] = inp.quantity * actions; });
      const agent = skill.agentUnlocked ?? false;
      let failChance = Math.max(0, (activity.failureChance ?? 0) - (agent ? 10 : 0));
      failChance = Math.min(100, failChance * (craftB.failureReductionMultiplier ?? 1)) / 100;
      const successes = Math.round(actions * (1 - failChance));
      const perSuccess = Math.max(1, Math.floor(craftB.outputMultiplier ?? 1)) + (agent ? 1 : 0);
      gain(activity.resource.id, successes * perSuccess);
      get().recordProduced(resume.skillId, successes * perSuccess);
      get().trackContract({ type: 'produce', skillId: resume.skillId, resourceId: activity.resource.id, qty: successes * perSuccess });
      const baseXp = () => (activity.getDynamicXp ? activity.getDynamicXp(level) : activity.baseXp);
      for (let i = 0; i < actions; i++) awardXp(i < successes ? baseXp() : Math.floor(baseXp() * 0.1));
    }

    if (actions <= 0) return;

    // Apply everything in one go.
    const items = padItems(get().bankItems, get().maxBankSlots);
    Object.entries(consumed).forEach(([id, qty]) => removeFromItems(items, id, qty));
    const lost: string[] = [];
    Object.entries(gained).forEach(([id, qty]) => { if (!addToItems(items, id, qty)) lost.push(id); });
    const xpGained = Math.max(0, xp - (skill.experience ?? 0));
    set(state => ({
      bankItems: items,
      gold: state.gold + goldGained,
    }));
    get().addExperience(resume.skillId, Math.floor(xpGained / Math.max(1, get().gameSpeedMultiplier)));
    get().addMasteryExperience(resume.activityId, actions);

    set({
      offlineSummary: {
        elapsedMs,
        cappedMs,
        skillId: resume.skillId,
        activityName,
        actions,
        xp: xpGained,
        levelBefore,
        levelAfter: get().skills[resume.skillId].level,
        gold: goldGained,
        items: Object.entries(gained).filter(([id]) => !lost.includes(id)).map(([resourceId, quantity]) => ({ resourceId, quantity })),
        consumed: Object.entries(consumed).map(([resourceId, quantity]) => ({ resourceId, quantity })),
      },
    });
  },

  addMasteryExperience: (activityId: string, xp: number) => {
    set(state => {
      const currentMastery = state.mastery[activityId] || { experience: 0, level: 1 };
      const newXp = currentMastery.experience + xp;
      // Faster mastery progression: reduced XP requirement by 75%
      const newLevel = Math.floor(Math.sqrt(newXp / 2.5)) + 1;
      
      return {
        mastery: {
          ...state.mastery,
          [activityId]: {
            experience: newXp,
            level: newLevel,
          },
        },
      };
    });
  },

  getMasteryLevel: (activityId: string) => {
    const { mastery } = get();
    return mastery[activityId]?.level || 1;
  },

  getMasteryPercentage: (activityId: string) => {
    const { mastery } = get();
    const currentMastery = mastery[activityId] || { experience: 0, level: 1 };
    const maxLevel = 100;
    return Math.min((currentMastery.level / maxLevel) * 100, 100);
  },

  getMasteryTimeReduction: (activityId: string) => {
    const masteryLevel = get().getMasteryLevel(activityId);
    // 5% reduction for every 25 levels, with 25% total at level 100
    if (masteryLevel >= 100) return 25;
    if (masteryLevel >= 75) return 15;
    if (masteryLevel >= 50) return 10;
    if (masteryLevel >= 25) return 5;
    return 0;
  },

  getActualTime: (skillId: string, baseTime: number, activityId: string) => {
    const state = get();
    const skill = state.skills[skillId];
    const masteryReduction = state.getMasteryTimeReduction(activityId);
    const levelFactor = skillId === 'smuggling' ? 0.03 : 0.02;
    const minFactor = skillId === 'smuggling' ? 0.2 : 0.3;
    const levelReduction = Math.floor(skill.level * levelFactor * baseTime);
    let totalReduction = levelReduction + (baseTime * masteryReduction / 100);

    // Apply agent time reduction to all but thieving to avoid double-dipping
    if (skill.agentUnlocked && skillId !== 'thieving') {
      totalReduction += baseTime * 0.3;
    }

    return Math.max(baseTime - totalReduction, baseTime * minFactor);
  },

  getThievingMasteryBonus: (activityId: string) => {
    const masteryLevel = get().getMasteryLevel(activityId);
    const failureReduction = Math.max(0.05, 1 - (masteryLevel * 0.95 / 100));
    const cooldownReduction = 1 - (masteryLevel * 0.5 / 100);
    return {
      failureReduction,
      cooldownReduction,
      lootBonus: 1,
      heatReduction: 1,
    };
  },

  getEquippedThievingTool: () => {
    const { equippedThievingToolId } = get();
    if (!equippedThievingToolId) return undefined;
    const tool = THIEVING_TOOLS.find(t => t.id === equippedThievingToolId);
    if (!tool) return undefined;
    return { id: tool.id, tier: tool.tier };
  },

  getThievingToolBonuses: () => {
    const { equippedThievingToolId } = get();
    const tool = THIEVING_TOOLS.find(t => t.id === equippedThievingToolId);
    const bonuses = tool?.bonuses ?? { failureReductionMultiplier: 1, cooldownReductionMultiplier: 1, lootBonusMultiplier: 1, heatReductionMultiplier: 1 };
    return {
      failureReductionMultiplier: bonuses.failureReductionMultiplier,
      cooldownReductionMultiplier: bonuses.cooldownReductionMultiplier,
      lootBonusMultiplier: bonuses.lootBonusMultiplier || 1,
      heatReductionMultiplier: bonuses.heatReductionMultiplier,
      extraLootChance: bonuses.extraLootChance,
      cooldownTimeReduction: bonuses.cooldownTimeReduction,
    };
  },

  acquireThievingTool: (toolId: string) => acquireTool(THIEVING_TOOLS, toolId, 'thievingToolsOwned', 'equippedThievingToolId'),

  equipThievingTool: (toolId: string) => {
    const { thievingToolsOwned } = get();
    if (!thievingToolsOwned[toolId]) return;
    set({ equippedThievingToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  // Distillery tools helpers
  getEquippedDistilleryTool: () => {
    const { equippedDistilleryToolId } = get();
    if (!equippedDistilleryToolId) return undefined;
    const tool = DISTILLERY_TOOLS.find(t => t.id === equippedDistilleryToolId);
    if (!tool) return undefined;
    return { id: tool.id, tier: tool.tier };
  },

  getDistilleryToolBonuses: () => {
    const { equippedDistilleryToolId } = get();
    const tool = DISTILLERY_TOOLS.find(t => t.id === equippedDistilleryToolId);
    const bonuses = tool?.bonuses ?? { failureReductionMultiplier: 1, timeReductionMultiplier: 1, outputMultiplier: 1, inputReductionMultiplier: 1, inputSaveChance: 0 };
    return {
      failureReductionMultiplier: bonuses.failureReductionMultiplier,
      timeReductionMultiplier: bonuses.timeReductionMultiplier,
      outputMultiplier: bonuses.outputMultiplier,
      inputReductionMultiplier: bonuses.inputReductionMultiplier ?? 1,
      inputSaveChance: bonuses.inputSaveChance ?? 0,
    };
  },

  acquireDistilleryTool: (toolId: string) => acquireTool(DISTILLERY_TOOLS, toolId, 'distilleryToolsOwned', 'equippedDistilleryToolId'),

  equipDistilleryTool: (toolId: string) => {
    const { distilleryToolsOwned } = get();
    if (!distilleryToolsOwned[toolId]) return;
    set({ equippedDistilleryToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  // Drug tools helpers
  getEquippedDrugTool: () => {
    const { equippedDrugToolId } = get();
    if (!equippedDrugToolId) return undefined;
    const tool = DRUG_TOOLS.find(t => t.id === equippedDrugToolId);
    if (!tool) return undefined;
    return { id: tool.id, tier: tool.tier };
  },

  getDrugToolBonuses: () => {
    const { equippedDrugToolId } = get();
    const tool = DRUG_TOOLS.find(t => t.id === equippedDrugToolId);
    const bonuses = tool?.bonuses ?? { failureReductionMultiplier: 1, timeReductionMultiplier: 1, outputMultiplier: 1, inputReductionMultiplier: 1, inputSaveChance: 0 };
    return {
      failureReductionMultiplier: bonuses.failureReductionMultiplier,
      timeReductionMultiplier: bonuses.timeReductionMultiplier,
      outputMultiplier: bonuses.outputMultiplier,
      inputReductionMultiplier: bonuses.inputReductionMultiplier ?? 1,
      inputSaveChance: bonuses.inputSaveChance ?? 0,
    };
  },

  acquireDrugTool: (toolId: string) => acquireTool(DRUG_TOOLS, toolId, 'drugToolsOwned', 'equippedDrugToolId'),

  equipDrugTool: (toolId: string) => {
    const { drugToolsOwned } = get();
    if (!drugToolsOwned[toolId]) return;
    set({ equippedDrugToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  sortBank: () => {
    set(state => {
      const sortedEntries = Object.entries(state.bank)
        .filter(([_, item]) => item.quantity > 0)
        .sort((a, b) => {
          // Sort by quantity descending
          return b[1].quantity - a[1].quantity;
        });
      
      const sortedBank: Record<string, BankItem> = {};
      sortedEntries.forEach(([key, value]) => {
        sortedBank[key] = value;
      });
      
      return { bank: sortedBank };
    });
  },

  sellItem: (resourceId: string, quantity: number) => {
    const { bankItems } = get();
    const resource = RESOURCES[resourceId];
    
    console.log('Selling item:', resourceId, 'quantity:', quantity);
    console.log('Resource:', resource);
    
    if (!resource) {
      console.error('Cannot sell item: invalid resource');
      return;
    }
    
    // Find item in bankItems array
    const itemIndex = bankItems.findIndex(item => item?.resourceId === resourceId);
    if (itemIndex === -1) {
      console.error('Cannot sell item: item not found in bank');
      return;
    }
    
    const item = bankItems[itemIndex];
    if (!item || item.quantity < quantity) {
      console.error('Cannot sell item: insufficient quantity');
      return;
    }
    
    const goldEarned = (resource.value || 1) * quantity; // Default to $1 if no value
    get().trackContract({ type: 'sell', amount: goldEarned });
    get().bumpStat('soldValue', goldEarned);
    console.log('Gold earned:', goldEarned);
    
    set(state => {
      const newBankItems = [...state.bankItems];
      const newQuantity = item.quantity - quantity;
      
      if (newQuantity <= 0) {
        // Remove item completely
        newBankItems[itemIndex] = null;
      } else {
        // Update quantity
        newBankItems[itemIndex] = {
          ...item,
          quantity: newQuantity,
        };
      }
      
      // Update old bank format for compatibility
      const newBank = { ...state.bank };
      if (newQuantity <= 0) {
        delete newBank[resourceId];
      } else {
        newBank[resourceId] = {
          resourceId,
          quantity: newQuantity,
        };
      }
      
      const newGold = state.gold + goldEarned;
      console.log('New gold amount:', newGold);
      
      return {
        bankItems: newBankItems,
        bank: newBank,
        gold: newGold,
      };
    });
    
    // Auto-group items after selling
    setTimeout(() => get().groupItems(), 100);
    
    // Save game after selling
    get().saveGame();
  },

  equipFromBank: (resourceId: string) => {
    try {
      const item = (EQUIPMENT_CATALOG as any)[resourceId];
      if (!item) return;
      const slot = item.slot as EquipmentSlot;

      set(state => {
        const cap = get().maxBankSlots;
        const nextEquipped = { ...(state.equipped || {}) } as Partial<Record<EquipmentSlot, string>>;
        const previouslyEquipped = nextEquipped[slot];
        nextEquipped[slot] = resourceId;

        const newBank = { ...state.bank };
        let newBankItems = [...state.bankItems];
        while (newBankItems.length < cap) newBankItems.push(null);
        if (newBankItems.length > cap) newBankItems = newBankItems.slice(0, cap);

        // Consume one of the item being equipped from bank
        const idx = newBankItems.findIndex(it => it?.resourceId === resourceId);
        if (idx === -1) {
          console.log('equipFromBank: item not found in bankItems, abort');
          return {} as Partial<GameStore> as any;
        }
        const currentQty = newBankItems[idx]?.quantity ?? 0;
        const nextQty = currentQty - 1;
        if (nextQty <= 0) {
          newBankItems[idx] = null;
          delete newBank[resourceId];
        } else {
          newBankItems[idx] = { resourceId, quantity: nextQty };
          newBank[resourceId] = { resourceId, quantity: nextQty };
        }

        // If there was an item already equipped in that slot, return it to bank
        if (previouslyEquipped) {
          const prevIdx = newBankItems.findIndex(it => it?.resourceId === previouslyEquipped);
          if (prevIdx !== -1) {
            const prevQty = (newBankItems[prevIdx]?.quantity ?? 0) + 1;
            newBankItems[prevIdx] = { resourceId: previouslyEquipped, quantity: prevQty };
            newBank[previouslyEquipped] = { resourceId: previouslyEquipped, quantity: prevQty };
          } else {
            const emptyIdx = newBankItems.findIndex(it => it === null);
            if (emptyIdx !== -1) {
              newBankItems[emptyIdx] = { resourceId: previouslyEquipped, quantity: 1 };
              newBank[previouslyEquipped] = { resourceId: previouslyEquipped, quantity: 1 };
            } else {
              console.log('equipFromBank: bank full, dropping previously equipped item');
            }
          }
        }

        return {
          equipped: nextEquipped,
          bankItems: newBankItems,
          bank: newBank,
        } as Partial<GameStore> as any;
      });

      setTimeout(() => get().groupItems(), 50);
      setTimeout(() => get().saveGame(), 80);
    } catch (e) {
      console.log('equipFromBank failed', e);
    }
  },

  unequip: (slot: EquipmentSlot) => {
    set(state => {
      const nextEquipped = { ...(state.equipped || {}) } as Partial<Record<EquipmentSlot, string>>;
      const resourceId = nextEquipped[slot];
      delete nextEquipped[slot];

      if (!resourceId) return { equipped: nextEquipped } as Partial<GameStore> as any;

      const cap = get().maxBankSlots;
      let newBankItems = [...state.bankItems];
      while (newBankItems.length < cap) newBankItems.push(null);
      if (newBankItems.length > cap) newBankItems = newBankItems.slice(0, cap);

      const newBank = { ...state.bank };
      const existingIdx = newBankItems.findIndex(it => it?.resourceId === resourceId);
      if (existingIdx !== -1) {
        const qty = (newBankItems[existingIdx]?.quantity ?? 0) + 1;
        newBankItems[existingIdx] = { resourceId, quantity: qty };
        newBank[resourceId] = { resourceId, quantity: qty };
      } else {
        const emptyIdx = newBankItems.findIndex(it => it === null);
        if (emptyIdx !== -1) {
          newBankItems[emptyIdx] = { resourceId, quantity: 1 };
          newBank[resourceId] = { resourceId, quantity: 1 };
        } else {
          console.log('unequip: bank full, dropping item');
        }
      }

      return { equipped: nextEquipped, bankItems: newBankItems, bank: newBank } as Partial<GameStore> as any;
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 80);
  },

  startBackgroundCombat: (params: { dungeonId: string; enemyIndex: number; enemyHp: number; playerHp: number }) => {
    try {
      const state = get();
      if (state.combatBgTimer) {
        clearInterval(state.combatBgTimer);
      }
      const dungeon = COMBAT_DUNGEONS.find(d => d.id === params.dungeonId) ?? COMBAT_DUNGEONS[0];
      const totalStats = getPlayerCombatStats(state.equipped);
      const playerIntervalMs = getPlayerAttackIntervalMs(state.equipped);

      const getEnemyForIndex = (idx: number) => (idx >= dungeon.enemyCount ? dungeon.boss : dungeon.enemy);
      const enemyIntervalFor = (idx: number) => Math.max(600, Math.floor((getEnemyForIndex(idx).attackSpeed || 1.8) * 1000));

      let enemyIndex = params.enemyIndex;
      let enemyHp = params.enemyHp;
      let playerHp = Math.max(0, params.playerHp);
      let lastPlayerMs = 0;
      let lastEnemyMs = 0;
      const tick = 200;

      set({
        combatIsActive: true,
        combatDungeonId: dungeon.id,
        combatEnemyIndex: enemyIndex,
        combatEnemyHp: enemyHp,
        combatPlayerHp: playerHp,
      });

      const timer = setInterval(() => {
        try {
          if (!get().combatIsActive) {
            get().stopBackgroundCombat();
            return;
          }
          lastPlayerMs += tick;
          lastEnemyMs += tick;
          const eStats = getEnemyForIndex(enemyIndex);

          if (lastPlayerMs >= playerIntervalMs) {
            lastPlayerMs -= playerIntervalMs;
            const hitChance = Math.min(95, Math.max(5, totalStats.accuracy - eStats.evasion));
            const hit = Math.random() * 100 < hitChance;
            const base = totalStats.attack;
            const variance = Math.max(1, Math.floor(base * 0.15));
            const roll = base + Math.floor((Math.random() * variance - variance / 2));
            const dmgRaw = Math.max(1, roll - Math.floor(eStats.defense / 2));
            const crit = Math.random() * 100 < totalStats.critChance;
            const dmg = hit ? Math.max(1, Math.floor(dmgRaw * (crit ? 1.5 : 1))) : 0;
            enemyHp = Math.max(0, enemyHp - dmg);
            if (enemyHp <= 0) {
              enemyIndex += 1;
              if (enemyIndex >= dungeon.enemyCount + 1) {
                // Same rewards as the on-screen fight, then run the dungeon again.
                const goldReward = getDungeonGoldReward(dungeon);
                get().addGold(goldReward);
                get().addResource('loot_bag', 1);
                get().trackContract({ type: 'dungeon', qty: 1 });
                get().bumpStat('dungeonsCleared');
                const items = get().combatSessionItems;
                set({
                  combatSessionGold: get().combatSessionGold + goldReward,
                  combatSessionItems: { ...items, loot_bag: (items['loot_bag'] ?? 0) + 1 },
                });
                enemyIndex = 0;
                playerHp = totalStats.hp;
              }
              enemyHp = getEnemyForIndex(enemyIndex).hp;
            }
          }

          if (lastEnemyMs >= enemyIntervalFor(enemyIndex)) {
            lastEnemyMs -= enemyIntervalFor(enemyIndex);
            const e = getEnemyForIndex(enemyIndex);
            const hitChanceE = Math.min(95, Math.max(5, e.accuracy - totalStats.evasion));
            const hitE = Math.random() * 100 < hitChanceE;
            const varianceE = Math.max(1, Math.floor(e.attack * 0.15));
            const rollE = e.attack + Math.floor((Math.random() * varianceE - varianceE / 2));
            const critE = Math.random() * 100 < e.critChance;
            const dmgRawE = Math.max(0, Math.floor(rollE - totalStats.defense / 3));
            const dmgE = hitE ? Math.max(0, Math.floor(dmgRawE * (critE ? e.critDamage / 100 : 1))) : 0;
            playerHp = Math.max(0, playerHp - dmgE);
            if (playerHp <= 0) {
              set({ combatIsActive: false, combatPlayerHp: 0, combatSnapshot: undefined, combatAutoResume: false });
              get().setCombatDeath(e.name);
              get().stopBackgroundCombat();
              return;
            }
          }

          set({
            combatEnemyIndex: enemyIndex,
            combatEnemyHp: enemyHp,
            combatPlayerHp: playerHp,
            combatSnapshot: { dungeonId: dungeon.id, enemyIndex, enemyHp, at: Date.now() },
          });
        } catch (e) {
          console.log('Background combat tick error', e);
        }
      }, tick);

      set({ combatBgTimer: timer });
    } catch (e) {
      console.log('startBackgroundCombat failed', e);
    }
  },

  stopBackgroundCombat: () => {
    const t = get().combatBgTimer;
    if (t) {
      clearInterval(t);
      console.log('Stopped background combat timer');
    }
    set({ combatBgTimer: undefined, combatIsActive: false });
  },

  addGold: (amount: number) => {
    set(state => ({
      gold: state.gold + amount,
    }));
  },

  addPremium: (amount: number) => {
    set(state => ({ premiumCurrency: Math.max(0, (state as any).premiumCurrency + amount) }));
  },

  spendPremium: (amount: number) => {
    const current = (get() as any).premiumCurrency ?? 0;
    if (current < amount) return false;
    set({ premiumCurrency: current - amount } as any);
    return true;
  },

  watchAd: () => {
    try {
      const now = Date.now();
      const last = (get() as any).lastAdWatchedAt ?? 0;
      if (now - last < 2000) {
        console.log('WatchAd ignored: pressed too fast');
        return null;
      }
      const commonIds = STORE_ITEMS.map(it => it.resourceId);
      const packSize = 5;
      const awarded: string[] = [];
      for (let i = 0; i < packSize; i++) {
        const rid = commonIds[Math.floor(Math.random() * commonIds.length)];
        awarded.push(rid);
      }

      let resultWatched = 0;
      let resultGoal = 10;
      let resultPremiumDelta = 0;

      set(state => {
        const watched = (state as any).adsWatched ?? 0;
        const goal = (state as any).adsGoal ?? 10;
        const newWatched = watched + 1;
        let premiumDelta = 0;
        let resetWatched = newWatched;
        if (newWatched >= goal) {
          premiumDelta = 5;
          resetWatched = 0;
        }
        resultWatched = resetWatched;
        resultGoal = goal;
        resultPremiumDelta = premiumDelta;
        return {
          adsWatched: resetWatched,
          lastAdWatchedAt: now,
          premiumCurrency: (state as any).premiumCurrency + premiumDelta,
        } as Partial<GameStore> as any;
      });

      awarded.forEach(id => {
        try {
          get().addResource(id, 1);
        } catch (e) {
          console.log('Failed to grant ad reward item', id, e);
        }
      });

      console.log(`Rewarded ad: granted small pack of ${packSize} common items`, awarded);
      setTimeout(() => get().saveGame(), 50);
      return { awarded, premiumDelta: resultPremiumDelta, watched: resultWatched, goal: resultGoal };
    } catch (e) {
      console.log('watchAd reward pack generation failed', e);
      return null;
    }
  },

  resetAdsProgress: () => {
    set({ adsWatched: 0 });
    setTimeout(() => get().saveGame(), 50);
  },

  maxAllSkills: () => {
    set(state => {
      const newSkills: Record<string, Skill> = { ...state.skills };
      const maxXp = getXpForLevel(100) || 15_000_000;
      Object.keys(newSkills).forEach(id => {
        const s = newSkills[id];
        newSkills[id] = {
          ...s,
          level: 100,
          experience: Math.max(s.experience ?? 0, maxXp),
          agentUnlocked: true,
        };
      });
      return { skills: newSkills };
    });
    setTimeout(() => get().saveGame(), 50);
  },

  buyItem: (resourceId: string, quantity: number, price: number) => {
    const { gold } = get();
    const totalCost = price * quantity;
    
    if (gold < totalCost) {
      console.error('Not enough gold to buy item');
      return;
    }
    
    set(state => {
      const cap = get().maxBankSlots;
      let newBankItems = [...state.bankItems];
      while (newBankItems.length < cap) {
        newBankItems.push(null);
      }
      if (newBankItems.length > cap) {
        newBankItems = newBankItems.slice(0, cap);
      }
      
      // Update old bank format for backward compatibility
      const newBank = {
        ...state.bank,
        [resourceId]: {
          resourceId,
          quantity: (state.bank[resourceId]?.quantity || 0) + quantity,
        },
      };
      
      // Find existing item in bankItems array
      const existingIndex = newBankItems.findIndex(item => item?.resourceId === resourceId);
      
      if (existingIndex !== -1) {
        // Update existing item
        newBankItems[existingIndex] = {
          resourceId,
          quantity: (newBankItems[existingIndex]?.quantity || 0) + quantity,
        };
      } else {
        // Find first empty slot
        const emptyIndex = newBankItems.findIndex(item => item === null || (item && item.quantity <= 0));
        if (emptyIndex !== -1) {
          newBankItems[emptyIndex] = {
            resourceId,
            quantity,
          };
        } else {
          console.log('Bank is full! Cannot buy', resourceId);
          return {}; // Don't process the purchase if bank is full
        }
      }
      
      return {
        gold: state.gold - totalCost,
        bank: newBank,
        bankItems: newBankItems,
      };
    });
    
    // Auto-group items after buying
    setTimeout(() => get().groupItems(), 100);
    
    // Save game after buying
    get().saveGame();
  },

  consumeInputs: (inputs: { resourceId: string; quantity: number }[]) => {
    const items = [...get().bankItems];
    for (const input of inputs) {
      if (input.quantity <= 0) continue;
      if (!removeFromItems(items, input.resourceId, input.quantity)) return false;
    }
    const emptiedSlot = items.some((it, i) => it === null && get().bankItems[i] !== null);
    set({ bankItems: items });
    if (emptiedSlot) setTimeout(() => get().groupItems(), 50);
    return true;
  },

  addHeat: (amount: number) => {
    set(state => {
      const currentHeat = state.heat;
      const newHeat = Math.max(0, Math.min(100, currentHeat + amount));
      if (newHeat > (state.lifetimeStats.peakHeat ?? 0)) {
        return { heat: newHeat, lifetimeStats: { ...state.lifetimeStats, peakHeat: newHeat } };
      }
      return { heat: newHeat };
    });
  },

  startHeatDecay: () => {
    const { heatDecayTimer } = get();
    
    // Don't start if already running
    if (heatDecayTimer) return;
    
    // Decay heat by 1% every second when entering cooldown with no other active thieving
    console.log(`Starting heat decay with normal timing`);
    const timer = setInterval(() => {
      const { heat, skills } = get();
      const isThievingActive = skills.thieving?.isActive ?? false;

      // Decay heat when thieving is not active (including during cooldowns)
      if (!isThievingActive && heat > 0) {
        get().addHeat(-1);
      }
    }, 1000); // Normal heat decay timing

    set({ heatDecayTimer: timer });
  },

  stopHeatDecay: () => {
    const { heatDecayTimer } = get();
    if (heatDecayTimer) {
      clearInterval(heatDecayTimer);
      set({ heatDecayTimer: undefined });
    }
  },

  restartThievingAfterCooldown: (activity: Activity) => {
    const { skills, bank, thievingCooldowns, thievingAutoResume } = get();
    const skillId = 'thieving';
    
    // Double-check cooldown is cleared
    const until = thievingCooldowns?.[activity.id];
    if (until && until > Date.now()) {
      console.log('Activity still on cooldown, cannot restart');
      return;
    }
    
    // Check if auto-resume is enabled
    if (!thievingAutoResume) {
      console.log('Auto-resume disabled, not restarting');
      // Keep heat decay running since we're not restarting
      return;
    }
    
    // Check requirements
    if (skills[skillId].level < activity.levelRequired) {
      console.log('Level requirement not met after cooldown');
      get().stopActivity(skillId);
      // Keep heat decay running since we can't restart
      return;
    }
    
    if (!hasRequiredInputs(bank, activity)) {
      console.log('Missing inputs after cooldown');
      get().stopActivity(skillId);
      // Keep heat decay running since we can't restart
      return;
    }
    
    // Restart the activity (this will stop heat decay)
    console.log(`Auto-restarting thieving activity: ${activity.name}`);
    get().startActivity(skillId, activity);
  },

  setPlayerName: (name: string) => {
    set({ playerName: name.trim().substring(0, 20) });
    setTimeout(() => get().saveGame(), 50);
  },

  setPlayerIcon: (icon: string) => {
    set({ playerIcon: icon });
    setTimeout(() => get().saveGame(), 50);
  },

  setGameSpeedMultiplier: (multiplier: number) => {
    console.log(`Setting XP multiplier to x${multiplier}`);
    // Simply update the multiplier - no need to restart activities since timing doesn't change
    set({ gameSpeedMultiplier: multiplier });
  },
  
  // Bank management functions
  setActiveBankTab: (id: 'all' | string) => {
    set({ activeBankTab: id });
  },
  
  swapInAll: (fromIndex: number, toIndex: number) => {
    set(state => {
      const cap = get().maxBankSlots;
      if (fromIndex < 0 || fromIndex >= cap || toIndex < 0 || toIndex >= cap) {
        console.log('Invalid swap indices:', fromIndex, toIndex);
        return {};
      }
      
      // Ensure we have exactly 30 slots
      let newItems = [...state.bankItems];
      
      while (newItems.length < cap) {
        newItems.push(null);
      }
      if (newItems.length > cap) {
        newItems = newItems.slice(0, cap);
      }
      
      // Perform the swap
      const temp = newItems[fromIndex];
      newItems[fromIndex] = newItems[toIndex];
      newItems[toIndex] = temp;
      
      const fromItem = temp?.resourceId || 'empty';
      const toItem = newItems[fromIndex]?.resourceId || 'empty';
      console.log(`Swapped slot ${fromIndex} (${fromItem}) with slot ${toIndex} (${toItem})`);
      
      // Update old bank format for compatibility
      const newBank = { ...state.bank };
      // Clear old bank first
      Object.keys(newBank).forEach(key => {
        delete newBank[key];
      });
      // Rebuild from new items
      newItems.forEach((item) => {
        if (item && item.quantity > 0) {
          newBank[item.resourceId] = item;
        }
      });
      
      return { bankItems: newItems, bank: newBank };
    });
    // Save after swap
    setTimeout(() => get().saveGame(), 100);
  },
  
  moveToEmptyInAll: (fromIndex: number, toIndex: number) => {
    set(state => {
      if (state.bankItems[toIndex] !== null) return {}; // Safety check
      const newItems = [...state.bankItems];
      newItems[toIndex] = newItems[fromIndex];
      newItems[fromIndex] = null;
      return { bankItems: newItems };
    });
    // Auto-group items after move
    setTimeout(() => get().groupItems(), 100);
  },
  
  swapInTab: (tabId: string, fromPos: number, toPos: number) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      const newOrder = [...tab.order];
      [newOrder[fromPos], newOrder[toPos]] = [newOrder[toPos], newOrder[fromPos]];
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, order: newOrder }
        }
      };
    });
  },
  
  moveToEmptyInTab: (tabId: string, fromPos: number, toPos: number) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      const newOrder = [...tab.order];
      [newOrder[fromPos], newOrder[toPos]] = [newOrder[toPos], newOrder[fromPos]];
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, order: newOrder }
        }
      };
    });
  },
  
  createBankTab: (name: string) => {
    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set(state => ({
      bankTabs: {
        ...state.bankTabs,
        [tabId]: {
          id: tabId,
          name: name.trim().substring(0, 20),
          order: [],
        }
      },
      bankTabsOrder: [...(state.bankTabsOrder || []), tabId],
    }));
    return tabId;
  },
  
  deleteBankTab: (tabId: string) => {
    set(state => {
      const newTabs = { ...state.bankTabs };
      delete newTabs[tabId];
      const newOrder = (state.bankTabsOrder || []).filter(id => id !== tabId);
      return {
        bankTabs: newTabs,
        bankTabsOrder: newOrder,
        activeBankTab: state.activeBankTab === tabId ? 'all' : state.activeBankTab,
      };
    });
  },
  
  renameBankTab: (tabId: string, name: string) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, name: name.trim().substring(0, 20) }
        }
      };
    });
  },

  setTabIcon: (tabId: string, icon: string) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, icon }
        }
      };
    });
    setTimeout(() => get().saveGame(), 50);
  },

  setTabDisplayMode: (tabId: string, displayMode: 'both' | 'icon' | 'text') => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, displayMode }
        }
      };
    });
    setTimeout(() => get().saveGame(), 50);
  },

  swapBankTabs: (aId: string, bId: string) => {
    set(state => {
      const order = [...(state.bankTabsOrder || [])];
      const aIdx = order.indexOf(aId);
      const bIdx = order.indexOf(bId);
      if (aIdx === -1 || bIdx === -1 || aId === bId) return {};
      [order[aIdx], order[bIdx]] = [order[bIdx], order[aIdx]];
      return { bankTabsOrder: order };
    });
    setTimeout(() => get().saveGame(), 50);
  },
  
  addItemToTab: (tabId: string, itemIndex: number) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab || tab.order.includes(itemIndex)) return {};
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, order: [...tab.order, itemIndex] }
        }
      };
    });
  },
  
  removeItemFromTab: (tabId: string, itemIndex: number) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      return {
        bankTabs: {
          ...state.bankTabs,
          [tabId]: { ...tab, order: tab.order.filter(idx => idx !== itemIndex) }
        }
      };
    });
  },
  
  assignToTab: (itemIndex: number, tabId: string) => {
    set(state => {
      const tab = state.bankTabs[tabId];
      if (!tab) return {};
      
      // Remove from all other tabs first
      const newTabs = { ...state.bankTabs };
      Object.keys(newTabs).forEach(id => {
        if (id !== tabId) {
          newTabs[id] = {
            ...newTabs[id],
            order: newTabs[id].order.filter(idx => idx !== itemIndex)
          };
        }
      });
      
      // Add to the target tab if not already there
      if (!tab.order.includes(itemIndex)) {
        newTabs[tabId] = {
          ...tab,
          order: [...tab.order, itemIndex]
        };
      }
      
      return { bankTabs: newTabs };
    });
    // Save after assignment
    setTimeout(() => get().saveGame(), 100);
  },
  
  groupItems: () => {
    set(state => {
      // Ensure we have exactly 30 slots
      let newItems = [...state.bankItems];
      
      const cap = get().maxBankSlots;
      while (newItems.length < cap) {
        newItems.push(null);
      }
      if (newItems.length > cap) {
        newItems = newItems.slice(0, cap);
      }
      
      const validItems = newItems.filter(item => item !== null && item.quantity > 0);
      const emptySlots = cap - validItems.length;
      
      // Create new array with valid items first, then empty slots
      const groupedItems = [
        ...validItems,
        ...Array.from({ length: emptySlots }, () => null)
      ];
      
      console.log(`Grouped ${validItems.length} items, ${emptySlots} empty slots`);
      
      return { bankItems: groupedItems, lastGroupedAt: Date.now() } as Partial<GameStore> as any;
    });
  },
  
  resetBankTo30Slots: () => {
    set(state => {
      const cap = state.maxBankSlots;
      const currentItems = state.bankItems.filter(item => item !== null && item.quantity > 0);
      const bankItems = [
        ...currentItems.slice(0, cap),
        ...Array.from({ length: Math.max(0, cap - currentItems.length) }, () => null)
      ];
      
      console.log(`Reset bank to ${cap} slots: ${currentItems.length} items, ${cap - currentItems.length} empty slots`);
      
      return { bankItems };
    });
  },

  increaseBankSlots: (amount: number) => {
    set(state => {
      const newCap = Math.max(1, state.maxBankSlots + Math.floor(amount));
      let newItems = [...state.bankItems];
      while (newItems.length < newCap) newItems.push(null);
      if (newItems.length > newCap) newItems = newItems.slice(0, newCap);
      console.log(`Bank slots increased: ${state.maxBankSlots} -> ${newCap}`);
      return { maxBankSlots: newCap, bankItems: newItems };
    });
    setTimeout(() => get().saveGame(), 50);
  },

  addBankSlotWithGold: (price: number) => {
    const { gold } = get();
    if (gold < price) {
      console.log('Not enough gold to purchase bank slot');
      return;
    }
    set(state => ({ gold: state.gold - price }));
    get().increaseBankSlots(1);
  },

  grantBankSlot: () => {
    get().increaseBankSlots(1);
  },

  openLootBag: () => {
    const { bankItems } = get();
    const lootBagIndex = bankItems.findIndex(item => item?.resourceId === 'loot_bag');
    if (lootBagIndex === -1) {
      console.log('No loot bag found in bank');
      return null;
    }

    const lootBagItem = bankItems[lootBagIndex];
    if (!lootBagItem || lootBagItem.quantity <= 0) {
      console.log('Loot bag has no quantity');
      return null;
    }

    get().bumpStat('lootBagsOpened');
    // Remove one loot bag
    set(state => {
      const newBankItems = [...state.bankItems];
      const newBank = { ...state.bank };
      const newQuantity = (state.bank['loot_bag']?.quantity ?? lootBagItem.quantity) - 1;

      if (newQuantity <= 0) {
        newBankItems[lootBagIndex] = null;
        delete newBank['loot_bag'];
      } else {
        newBankItems[lootBagIndex] = { resourceId: 'loot_bag', quantity: newQuantity };
        newBank['loot_bag'] = { resourceId: 'loot_bag', quantity: newQuantity };
      }

      return { bankItems: newBankItems, bank: newBank };
    });

    // Loot table with weighted drops
    const lootTable = LOOT_BAG_TABLE;

    // Guaranteed gold drop
    const goldAmount = Math.floor(LOOT_BAG_GOLD.min + Math.random() * (LOOT_BAG_GOLD.max - LOOT_BAG_GOLD.min + 1));
    get().addGold(goldAmount);
    console.log(`Opened loot bag: received ${goldAmount} gold`);

    // Roll for item drops (can get multiple items)
    const receivedItems: { resourceId: string; quantity: number }[] = [];
    const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
    lootTable.forEach(drop => {
      const chance = (drop.weight / totalWeight) * 100;
      if (Math.random() * 100 < chance) {
        get().addResource(drop.resourceId, 1);
        receivedItems.push({ resourceId: drop.resourceId, quantity: 1 });
        console.log(`Opened loot bag: received ${drop.resourceId}`);
      }
    });

    // Auto-group items after opening
    setTimeout(() => get().groupItems(), 100);
    setTimeout(() => get().saveGame(), 150);

    return { items: receivedItems, gold: goldAmount };
  },

  openAllLootBags: () => {
    const { bankItems } = get();
    const lootBagIndex = bankItems.findIndex(item => item?.resourceId === 'loot_bag');
    if (lootBagIndex === -1) {
      console.log('No loot bags to open');
      return null;
    }
    const qty = bankItems[lootBagIndex]?.quantity ?? 0;
    if (qty <= 0) return null;

    let totalGold = 0;
    const aggregated: Record<string, number> = {};

    for (let i = 0; i < qty; i++) {
      const result = get().openLootBag();
      if (result) {
        totalGold += result.gold;
        result.items.forEach(it => {
          aggregated[it.resourceId] = (aggregated[it.resourceId] ?? 0) + it.quantity;
        });
      }
    }

    const items = Object.entries(aggregated).map(([resourceId, quantity]) => ({ resourceId, quantity }));
    return { items, gold: totalGold };
  },

  pushNotice: (notice) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set(state => ({ notices: [...state.notices.slice(-3), { ...notice, id }] }));
    setTimeout(() => get().dismissNotice(id), notice.kind === 'levelup' || notice.kind === 'agent' ? 3500 : 2600);
  },

  dismissNotice: (id: string) => {
    set(state => ({ notices: state.notices.filter(n => n.id !== id) }));
  },

  clearOfflineSummary: () => set({ offlineSummary: undefined }),

  getReputation: () => {
    const totalLevel = Object.values(get().skills).reduce((sum, sk) => sum + (sk.level ?? 1), 0);
    return getReputation(totalLevel, get().respect);
  },

  refillContracts: () => {
    const state = get();
    const levels = Object.fromEntries(Object.entries(state.skills).map(([id, sk]) => [id, sk.level ?? 1]));
    const contracts = [...state.contracts];
    while (contracts.length < CONTRACT_SLOTS) {
      // Keep the board varied: no duplicate jobs, at most two crafting orders.
      let candidate: Contract | undefined;
      for (let attempt = 0; attempt < 10; attempt++) {
        const c = generateContract({
          levels,
          actionTimeMs: (skillId, baseTime, activityId) => get().getAdjustedActionTime(skillId, baseTime, activityId),
          exclude: contracts.map(x => x.kind),
        });
        const duplicate = contracts.some(x => x.kind === c.kind && x.resourceId === c.resourceId);
        const tooManyCrafts = c.kind === 'craft' && contracts.filter(x => x.kind === 'craft').length >= 2;
        candidate = c;
        if (!duplicate && !tooManyCrafts) break;
      }
      contracts.push(candidate!);
    }
    if (contracts.length !== state.contracts.length) set({ contracts });
  },

  trackContract: (event: ContractEvent) => {
    const before = get().contracts;
    if (before.length === 0) return;
    let justDone: Contract | undefined;
    const next = before.map(c => {
      const updated = applyContractEvent(c, event);
      if (updated !== c && updated.progress >= updated.target && c.progress < c.target) justDone = updated;
      return updated;
    });
    if (next.some((c, i) => c !== before[i])) set({ contracts: next });
    if (justDone) {
      get().pushNotice({ kind: 'success', title: 'Contract complete!', message: `${justDone.title} — collect your cut at HQ.`, icon: justDone.icon });
    }
  },

  claimContract: (id: string) => {
    const c = get().contracts.find(x => x.id === id);
    if (!c || c.progress < c.target) return;
    const { cashBonus } = getRankInfo(get().getReputation());
    const gold = Math.round(c.reward.gold * (1 + cashBonus));
    set(state => ({
      gold: state.gold + gold,
      respect: state.respect + c.reward.respect,
      contractsCompleted: state.contractsCompleted + 1,
      contracts: state.contracts.filter(x => x.id !== id),
    }));
    c.reward.items.forEach(it => get().addResource(it.resourceId, it.quantity));
    get().refillContracts();
    get().pushNotice({ kind: 'success', title: `+$${gold.toLocaleString()} · +${c.reward.respect} respect`, message: 'A new contract hit the board.', icon: '💰' });
    setTimeout(() => get().saveGame(), 50);
  },

  getContractRerollCost: () => {
    const totalLevel = Object.values(get().skills).reduce((sum, sk) => sum + (sk.level ?? 1), 0);
    return 50 + totalLevel * 10;
  },

  rerollContract: (id: string) => {
    const cost = get().getContractRerollCost();
    if (get().gold < cost) {
      get().pushNotice({ kind: 'warning', title: 'Not enough cash', message: `A new contract costs $${cost}.` });
      return;
    }
    set(state => ({ gold: state.gold - cost, contracts: state.contracts.filter(x => x.id !== id) }));
    get().refillContracts();
  },

  claimDailyReward: () => {
    const { lastDailyClaim, dailyStreak } = get();
    const today = dayKey();
    const { claimable, day } = nextStreakDay(lastDailyClaim, dailyStreak, today);
    if (!claimable) return null;
    const reward = DAILY_REWARDS[day - 1];
    set(state => ({
      gold: state.gold + reward.gold,
      respect: state.respect + reward.respect,
      dailyStreak: day === 1 ? 1 : state.dailyStreak + 1,
      lastDailyClaim: today,
      lifetimeStats: { ...state.lifetimeStats, bestStreak: Math.max(state.lifetimeStats.bestStreak ?? 0, day === 1 ? 1 : state.dailyStreak + 1) },
    }));
    reward.items.forEach(it => get().addResource(it.resourceId, it.quantity));
    setTimeout(() => get().saveGame(), 50);
    return reward;
  },

  getAchievementStats: () => {
    const st = get();
    const levels = Object.fromEntries(Object.entries(st.skills).map(([id, sk]) => [id, sk.level ?? 1]));
    const masteryAt: Record<string, Record<number, number>> = {};
    const bump = (skillId: string, lvl: number) => {
      const m = (masteryAt[skillId] = masteryAt[skillId] ?? { 25: 0, 50: 0, 75: 0, 100: 0 });
      [25, 50, 75, 100].forEach(t => { if (lvl >= t) m[t] += 1; });
    };
    Object.entries(ACTIVITIES).forEach(([skillId, acts]) => acts.forEach(a => bump(skillId, st.mastery[a.id]?.level ?? 1)));
    SMUGGLING_ZONE_IDS.forEach(id => bump('smuggling', st.mastery[id]?.level ?? 1));
    const owned = (rec: Record<string, boolean>) => Object.values(rec ?? {}).filter(Boolean).length;
    const ls = st.lifetimeStats;
    return {
      levels,
      totalLevel: Object.values(levels).reduce((a, b) => a + b, 0),
      produced: ls.produced ?? {},
      smugglingRuns: ls.smugglingRuns ?? 0,
      rareCollected: ls.rareCollected ?? 0,
      timesCaught: ls.timesCaught ?? 0,
      timesArrested: ls.timesArrested ?? 0,
      peakHeat: ls.peakHeat ?? 0,
      dungeonsCleared: ls.dungeonsCleared ?? 0,
      deaths: ls.deaths ?? 0,
      lootBagsOpened: ls.lootBagsOpened ?? 0,
      peakGold: Math.max(ls.peakGold ?? 0, st.gold),
      cashEarned: ls.cashEarned ?? 0,
      soldValue: ls.soldValue ?? 0,
      bestStreak: Math.max(ls.bestStreak ?? 0, st.dailyStreak),
      discovered: Object.keys(ls.discovered ?? {}).length,
      contractsCompleted: st.contractsCompleted,
      rankIndex: getRankInfo(st.getReputation()).index,
      toolsOwned: {
        smuggling: owned(st.smugglingToolsOwned),
        thieving: owned(st.thievingToolsOwned),
        drug_factory: owned(st.drugToolsOwned),
        distillery: owned(st.distilleryToolsOwned),
        investigation_lab: owned(st.investigationLabToolsOwned),
      },
      masteryAt,
      bankSlots: st.maxBankSlots,
    };
  },

  checkAchievements: () => {
    const st = get();
    if (st.isLoading) return;
    const stats = st.getAchievementStats();
    const newly = ACHIEVEMENTS.filter(a => !st.achievementsUnlocked[a.id] && a.value(stats) >= a.target);
    if (newly.length === 0) return;
    const now = Date.now();
    const rewards = newly.map(achievementReward);
    const respect = rewards.reduce((sum, r) => sum + r.respect, 0);
    const gold = rewards.reduce((sum, r) => sum + r.gold, 0);
    set(state => ({
      achievementsUnlocked: { ...state.achievementsUnlocked, ...Object.fromEntries(newly.map(a => [a.id, now])) },
      respect: state.respect + respect,
      gold: state.gold + gold,
    }));
    if (newly.length <= 2) {
      newly.forEach(a => get().pushNotice({ kind: 'agent', title: `Achievement: ${a.title}`, message: `${a.description} · +$${achievementReward(a).gold.toLocaleString()} +${achievementReward(a).respect} rep`, icon: a.icon }));
    } else {
      get().pushNotice({ kind: 'agent', title: `${newly.length} achievements unlocked!`, message: `+$${gold.toLocaleString()} and +${respect} respect`, icon: '🏆' });
    }
    setTimeout(() => get().saveGame(), 50);
  },

  bumpStat: (key: CounterStat, amount = 1) => {
    if (amount <= 0) return;
    set(state => ({ lifetimeStats: { ...state.lifetimeStats, [key]: (state.lifetimeStats[key] ?? 0) + amount } }));
  },

  recordProduced: (skillId: string, amount: number) => {
    if (amount <= 0) return;
    set(state => ({
      lifetimeStats: {
        ...state.lifetimeStats,
        produced: { ...state.lifetimeStats.produced, [skillId]: (state.lifetimeStats.produced[skillId] ?? 0) + amount },
      },
    }));
  },

  exportSave: () => {
    const state = get();
    const data: Record<string, unknown> = {};
    Object.keys(initialData ?? {}).forEach(key => {
      if (!TRANSIENT_KEYS.has(key)) data[key] = (state as any)[key];
    });
    return JSON.stringify({ ...data, lastSaved: Date.now(), exportedAt: new Date().toISOString(), version: SAVE_VERSION });
  },

  importSave: async (raw: string) => {
    try {
      const parsed = JSON.parse(raw.trim());
      if (!parsed || typeof parsed !== 'object' || typeof parsed.skills !== 'object' || !Array.isArray(parsed.bankItems)) {
        return false;
      }
      stopAllTimers();
      // Imported saves shouldn't grant offline progress for the time they sat on disk.
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify({ ...parsed, lastSaved: Date.now() }));
      await get().loadGame();
      get().pushNotice({ kind: 'success', title: 'Save imported', message: 'Welcome back, boss.' });
      return true;
    } catch (e) {
      console.log('importSave failed', e);
      return false;
    }
  },

  resetGame: async () => {
    stopAllTimers();
    await AsyncStorage.removeItem(SAVE_KEY);
    statTrackingSuspended = true;
    if (initialData) set({ ...initialData, lastSaved: Date.now(), isLoading: false } as Partial<GameStore>);
    statTrackingSuspended = false;
    get().refillContracts();
    get().pushNotice({ kind: 'info', title: 'Fresh start', message: 'Your empire has been reset.' });
  },
  };
});

const SAVE_KEY = 'melvor-idle-save';
const SAVE_VERSION = '1.1.0';
// Runtime-only fields that must never be exported or restored.
const TRANSIENT_KEYS = new Set(['activeTimers', 'heatDecayTimer', 'combatBgTimer', 'xpToasts', 'notices', 'offlineSummary', 'isLoading', 'bank']);

// Snapshot of the pristine new-game state (data only), used by resetGame/exportSave.
const initialData: Partial<GameStore> = Object.fromEntries(
  Object.entries(useGameStore.getState()).filter(([, v]) => typeof v !== 'function'),
) as Partial<GameStore>;

function stopAllTimers() {
  const st = useGameStore.getState();
  Object.values(st.activeTimers).forEach(t => clearInterval(t));
  if (st.combatBgTimer) clearInterval(st.combatBgTimer);
  if (st.heatDecayTimer) clearInterval(st.heatDecayTimer);
  useGameStore.setState({ activeTimers: {}, combatBgTimer: undefined, heatDecayTimer: undefined, combatIsActive: false });
}

// Achievements are checked on a light heartbeat rather than inside every action.
setInterval(() => {
  useGameStore.getState().checkAchievements();
}, 1500);

// Auto-save every 30 seconds
setInterval(() => {
  useGameStore.getState().saveGame();
}, 30000);
