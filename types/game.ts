export interface Skill {
  id: string;
  name: string;
  description?: string;
  level: number;
  experience: number;
  isActive: boolean;
  currentActivity?: Activity;
  agentUnlocked?: boolean;
}

export interface Activity {
  id: string;
  name: string;
  skillId: string;
  baseTime: number; // milliseconds
  baseXp: number;
  levelRequired: number;
  resource: Resource;
  inputs?: ActivityInput[]; // Required input items
  failureChance?: number; // Percentage chance of failure (waste chance)
  arrestChance?: number; // Percentage chance of arrest on failure (for thieving)
  heatGenerated?: number; // Amount of heat generated (for thieving)
  managerYield?: number; // Yield multiplier with manager (future feature)
  lootTable?: ThievingLoot[]; // Possible loot items for thieving
  icon?: string; // Custom icon for the activity (overrides resource icon)
  getDynamicXp?: (level: number) => number; // Dynamic XP calculation function
}

export interface ThievingLoot {
  resourceId: string;
  minQuantity: number;
  maxQuantity: number;
  weight: number; // For weighted random selection
}

export interface ActivityInput {
  resourceId: string;
  quantity: number;
}

export interface SmugglingZone {
  id: string;
  name: string;
  levelRequired: number;
  baseTime: number;
  junkChance: number; // percentage
  items: SmugglingItem[];
}

export interface SmugglingItem {
  resource: Resource;
  weight: number; // for weighted random selection
  minLevel?: number; // optional level requirement for specific items
  baseXp: number;
}

export interface Mastery {
  experience: number;
  level: number;
}

export interface MasteryPerk {
  level: number;
  description: string;
  timeReduction: number; // percentage
}

export interface Resource {
  id: string;
  name: string;
  icon: string;
  value: number;
  description?: string;
  imageUri?: string;
}

export interface BankItem {
  resourceId: string;
  quantity: number;
}

export interface BankTab {
  id: string;
  name: string;
  icon?: string; // optional icon for the tab
  displayMode?: 'both' | 'icon' | 'text'; // how to display the tab
  order: number[]; // indices in the bank.items array
}

export interface GameState {
  skills: Record<string, Skill>;
  bank: Record<string, BankItem>;
  mastery: Record<string, Mastery>; // key is activityId
  lastSaved: number;
  gold: number;
  heat?: number; // Heat level for thieving (0-100)
  arrestedUntil?: number; // Deprecated: was global thieving cooldown
  thievingCooldowns?: Record<string, number>; // per-thieving-activity cooldown until timestamp
  bankItems?: (BankItem | null)[]; // slots (null = empty)
  bankTabs?: Record<string, BankTab>; // custom tabs
  bankTabsOrder?: string[]; // explicit tab order (excluding 'all')
  activeBankTab?: 'all' | string;
}

export interface ThievingToolBonuses {
  failureReductionMultiplier: number;
  cooldownReductionMultiplier: number;
  lootBonusMultiplier?: number; // Legacy bonus
  heatReductionMultiplier: number;
  extraLootChance?: number; // New: chance to get +1 loot (0-1)
  cooldownTimeReduction?: number; // New: flat cooldown time reduction (0-1)
}

export interface ThievingTool {
  id: string;
  name: string;
  tier: number;
  icon: string;
  bonuses: ThievingToolBonuses;
  requirements: { resourceId: string; quantity: number }[];
}

export interface DrugToolBonuses {
  failureReductionMultiplier: number; // multiplies failure chance
  timeReductionMultiplier: number; // multiplies action time
  outputMultiplier: number; // multiplies output quantity
  inputReductionMultiplier?: number; // multiplies input consumption (<=1 reduces cost)
  inputSaveChance?: number; // chance (0-1) to save 1 input item per cycle
}

export interface DrugTool {
  id: string;
  name: string;
  tier: number;
  icon: string;
  bonuses: DrugToolBonuses;
  requirements: { resourceId: string; quantity: number }[];
}

export interface SmugglingToolBonuses {
  timeReductionMultiplier: number;
  junkReductionMultiplier: number;
  itemsPerActionBonus?: number;
  rareWeightMultiplier?: number;
}

export interface SmugglingTool {
  id: string;
  name: string;
  tier: number;
  icon: string;
  bonuses: SmugglingToolBonuses;
  requirements: { resourceId: string; quantity: number }[];
}

export type EquipmentSlot = 'weapon' | 'offhand' | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves' | 'amulet' | 'ring' | 'ammunition' | 'backpack' | 'scroll' | 'potion';

export interface CombatStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  accuracy: number;
  evasion: number;
  critChance: number;
  critDamage: number;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  icon: string;
  levelRequired: number;
  stats: Partial<CombatStats>;
  description?: string;
  attackSpeed?: number; // attacks per second for weapons; undefined for non-weapons
}

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  level: number;
  stats: CombatStats;
  loot: { resourceId: string; minQuantity: number; maxQuantity: number; weight: number }[];
  goldReward: { min: number; max: number };
}

export interface Dungeon {
  id: string;
  name: string;
  icon: string;
  levelRequired: number;
  description: string;
  enemies: Enemy[];
  bossEnemy?: Enemy;
}
