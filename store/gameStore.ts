import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { GameState, Skill, Activity, BankItem, Mastery, SmugglingZone, BankTab, EquipmentSlot } from '@/types/game';
import { getLevelFromXp, RESOURCES, hasRequiredInputs, SKILL_DESCRIPTIONS, getSmugglingXp, getXpForLevel, STORE_ITEMS, EQUIPMENT_CATALOG } from '@/constants/gameData';
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
  processOfflineProgress: () => void;
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

  // Starter combat gear to test equipping
  { resourceId: 'iron_dagger', quantity: 1 },
  { resourceId: 'wooden_shield', quantity: 1 },
  { resourceId: 'leather_cap', quantity: 1 },
  { resourceId: 'leather_vest', quantity: 1 },
  { resourceId: 'leather_pants', quantity: 1 },
  { resourceId: 'leather_boots', quantity: 1 },
  { resourceId: 'simple_ring', quantity: 1 },
  { resourceId: 'street_amulet', quantity: 1 },
  
  // Fill remaining slots with null (empty) - exactly 30 total slots
  ...Array.from({ length: 30 - 26 }, () => null) // 26 items + 4 empty = 30 total
];

export const useGameStore = create<GameStore>((set, get) => ({
  skills: INITIAL_SKILLS,
  bank: {},
  bankItems: INITIAL_BANK_ITEMS,
  equipped: {},
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

  setCombatDeath: (enemyName: string) => set({ combatDeath: { enemyName, at: Date.now() } }),
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
    try {
      const savedGame = await AsyncStorage.getItem('melvor-idle-save');
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
        for (let i = 0; i < desiredSlots; i++) {
          if (i < validItems.length) {
            finalBankItems.push(validItems[i]);
          } else {
            finalBankItems.push(null);
          }
        }
        
        console.log(`Bank loaded with ${validItems.length} items, ${desiredSlots - validItems.length} empty slots, total: ${finalBankItems.length}`);
        
        // Merge saved skills with initial skills to ensure descriptions are added
        const mergedSkills = { ...INITIAL_SKILLS } as Record<string, Skill>;
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
          gold: (gameData as any).gold || 1000,
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
        });
        
        // Process offline progress
        get().processOfflineProgress();
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
      };
      await AsyncStorage.setItem('melvor-idle-save', JSON.stringify(gameData));
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

  startActivity: (skillId: string, activity: Activity) => {
    const { skills, activeTimers, stopActivity, bank, thievingCooldowns } = get();
    try {
      get().stopBackgroundCombat();
      set({ combatAutoResume: false, combatSnapshot: undefined, combatIsActive: false });
    } catch (e) {
      console.log('stop combat on startActivity failed', e);
    }
    
    // Per-activity cooldown check for thieving
    if (skillId === 'thieving') {
      // Track the currently selected thieving activity
      set({ currentThievingActivity: activity });
      
      const until = thievingCooldowns?.[activity.id];
      if (until && until > Date.now()) {
        const remaining = Math.ceil((until - Date.now()) / 1000);
        console.log(`Thieving activity '${activity.id}' on cooldown: ${remaining}s remaining`);
        
        // If auto-resume is enabled, schedule restart after cooldown
        if (get().thievingAutoResume) {
          const remainingTime = until - Date.now();
          console.log(`Scheduling restart in ${remainingTime}ms for ${activity.name}`);
          setTimeout(() => {
            const state = get();
            // Only restart if this is still the selected activity AND no other activity is running
            if (state.thievingAutoResume && 
                state.currentThievingActivity?.id === activity.id &&
                !state.skills.thieving.isActive) {
              console.log(`Cooldown ended, restarting ${activity.name}`);
              get().restartThievingAfterCooldown(activity);
            }
          }, remainingTime);
        }
        return;
      }
    }
    
    // Stop all other active skills first
    Object.keys(skills).forEach((id) => {
      if (skills[id].isActive) {
        stopActivity(id);
      }
    });

    // Calculate activity time based on level and mastery
    const skill = skills[skillId];

    // Check if player meets level requirement
    if (skill.level < activity.levelRequired) {
      console.log('Cannot start activity: level requirement not met');
      return;
    }

    // Compute adjusted inputs for drug factory based on equipped tool
    const drugToolB = skillId === 'drug_factory' ? get().getDrugToolBonuses() : undefined;
    const adjustedInputs = (() => {
      if (!activity.inputs || activity.inputs.length === 0) return activity.inputs;
      if (skillId === 'drug_factory') {
        const mult = Math.max(0, drugToolB?.inputReductionMultiplier ?? 1);
        const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
        if ((drugToolB?.inputSaveChance ?? 0) > 0 && Math.random() < (drugToolB?.inputSaveChance ?? 0)) {
          const idx = 0;
          reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
        }
        return reduced;
      }
      if (skillId === 'distillery') {
        const mult = Math.max(0, (get().getDistilleryToolBonuses().inputReductionMultiplier));
        const distB = get().getDistilleryToolBonuses();
        const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
        if ((distB.inputSaveChance ?? 0) > 0 && Math.random() < distB.inputSaveChance) {
          const idx = 0;
          reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
        }
        return reduced;
      }
      if (skillId === 'investigation_lab') {
        const labB = get().getInvestigationLabToolBonuses();
        const mult = Math.max(0, labB.inputReductionMultiplier);
        const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
        if ((labB.inputSaveChance ?? 0) > 0 && Math.random() < (labB.inputSaveChance ?? 0)) {
          const idx = 0;
          reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
        }
        return reduced;
      }
      return activity.inputs;
    })();

    // Check if we have required inputs BEFORE starting the activity
    if (activity.inputs && activity.inputs.length > 0) {
      const ok = adjustedInputs ? hasRequiredInputs(bank, { ...activity, inputs: adjustedInputs }) : hasRequiredInputs(bank, activity);
      if (!ok) {
        console.log('Cannot start activity: missing required inputs');
        return;
      }
    }

    const baseActualTime = get().getActualTime(skillId, activity.baseTime, activity.id);
    const distToolB = skillId === 'distillery' ? get().getDistilleryToolBonuses() : undefined;
    const labToolB = skillId === 'investigation_lab' ? get().getInvestigationLabToolBonuses() : undefined;
    const adjustedTime = (() => {
      if (skillId === 'drug_factory') return Math.max(100, Math.floor(baseActualTime * (drugToolB?.timeReductionMultiplier ?? 1)));
      if (skillId === 'distillery') return Math.max(100, Math.floor(baseActualTime * (distToolB?.timeReductionMultiplier ?? 1)));
      if (skillId === 'investigation_lab') return Math.max(100, Math.floor(baseActualTime * (labToolB?.timeReductionMultiplier ?? 1)));
      return baseActualTime;
    })();
    console.log(`Starting activity with normal timing: ${adjustedTime}ms`);

    const timer = setInterval(() => {
      const { addExperience, addResource, addMasteryExperience, consumeInputs, bank, addGold } = get();

      // Prepare adjusted inputs each tick for drug factory
      const localDrugToolB = skillId === 'drug_factory' ? get().getDrugToolBonuses() : undefined;
      const localDistToolB = skillId === 'distillery' ? get().getDistilleryToolBonuses() : undefined;
      const localLabToolB = skillId === 'investigation_lab' ? get().getInvestigationLabToolBonuses() : undefined;
      const tickAdjustedInputs = (() => {
        if (!activity.inputs || activity.inputs.length === 0) return activity.inputs;
        if (skillId === 'drug_factory') {
          const mult = Math.max(0, localDrugToolB?.inputReductionMultiplier ?? 1);
          const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
          if ((localDrugToolB?.inputSaveChance ?? 0) > 0 && Math.random() < (localDrugToolB?.inputSaveChance ?? 0)) {
            const idx = 0;
            reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
          }
          return reduced;
        }
        if (skillId === 'distillery') {
          const mult = Math.max(0, localDistToolB?.inputReductionMultiplier ?? 1);
          const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
          if ((localDistToolB?.inputSaveChance ?? 0) > 0 && Math.random() < (localDistToolB?.inputSaveChance ?? 0)) {
            const idx = 0;
            reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
          }
          return reduced;
        }
        if (skillId === 'investigation_lab') {
          const mult = Math.max(0, localLabToolB?.inputReductionMultiplier ?? 1);
          const reduced = activity.inputs.map(inp => ({ resourceId: inp.resourceId, quantity: Math.max(1, Math.ceil(inp.quantity * mult)) }));
          if ((localLabToolB?.inputSaveChance ?? 0) > 0 && Math.random() < (localLabToolB?.inputSaveChance ?? 0)) {
            const idx = 0;
            reduced[idx] = { resourceId: reduced[idx].resourceId, quantity: Math.max(0, reduced[idx].quantity - 1) };
          }
          return reduced;
        }
        return activity.inputs;
      })();

      // Check if we have required inputs BEFORE processing this cycle
      if (activity.inputs && activity.inputs.length > 0) {
        const ok = skillId === 'drug_factory' && tickAdjustedInputs ? hasRequiredInputs(bank, { ...activity, inputs: tickAdjustedInputs }) : hasRequiredInputs(bank, activity);
        if (!ok) {
          console.log('Missing required inputs, stopping activity');
          get().stopActivity(skillId);
          return;
        }
      }

      // Consume inputs for this cycle
      if (activity.inputs) {
        const toConsume = (skillId === 'drug_factory' || skillId === 'distillery' || skillId === 'investigation_lab') && tickAdjustedInputs ? tickAdjustedInputs : activity.inputs;
        const consumed = consumeInputs(toConsume as { resourceId: string; quantity: number }[]);
        if (!consumed) {
          console.log('Failed to consume inputs, stopping activity');
          get().stopActivity(skillId);
          return;
        }
      }

      // After consuming inputs, check if we still have enough for the NEXT cycle
      // This prevents the "one extra cycle" issue
      const currentBank = get().bank;
      if (activity.inputs && activity.inputs.length > 0) {
        const okNext = tickAdjustedInputs ? hasRequiredInputs(currentBank, { ...activity, inputs: tickAdjustedInputs }) : hasRequiredInputs(currentBank, activity);
        if (!okNext) {
          console.log('Insufficient inputs for next cycle, stopping activity after this completion');
          // Process this cycle normally, but stop after it
          setTimeout(() => {
            get().stopActivity(skillId);
          }, 0);
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
      if (skillId === 'thieving' && activity.lootTable) {
        const { heat, skills } = get();
        const agentActive = skills.thieving.agentUnlocked ?? false;
        const heatPenalty = heat >= 100 ? 0.5 : 1.0;
        const toolB3 = get().getThievingToolBonuses();
        
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
        if (skillId === 'drug_factory') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (localDrugToolB?.failureReductionMultiplier ?? 1)));
        if (skillId === 'distillery') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (localDistToolB?.failureReductionMultiplier ?? 1)));
        if (skillId === 'investigation_lab') effectiveFailChance = Math.max(0, Math.min(100, effectiveFailChance * (localLabToolB?.failureReductionMultiplier ?? 1)));
        const failed = Math.random() * 100 < effectiveFailChance;
        if (failed) {
          const xpToAward = activity.getDynamicXp ? activity.getDynamicXp(get().skills[skillId].level) : activity.baseXp;
          addExperience(skillId, Math.floor(xpToAward * 0.1));
        } else {
          let outMult = 1;
          if (skillId === 'drug_factory') outMult = Math.max(1, Math.floor(localDrugToolB?.outputMultiplier ?? 1));
          if (skillId === 'distillery') outMult = Math.max(1, Math.floor(localDistToolB?.outputMultiplier ?? 1));
          if (skillId === 'investigation_lab') outMult = Math.max(1, Math.floor(localLabToolB?.outputMultiplier ?? 1));
          const managerBonus = (skillId !== 'thieving' && agentActive) ? 1 : 0;
          const quantityToAdd = Math.max(1, outMult + managerBonus);
          addResource(activity.resource.id, quantityToAdd);
        }
      }
      
      const xpToAward = activity.getDynamicXp ? activity.getDynamicXp(get().skills[skillId].level) : activity.baseXp;
      addExperience(skillId, xpToAward);
      addMasteryExperience(activity.id, 1);
      
      // Add heat for successful thieving activities (reduced with agent)
      if (skillId === 'thieving' && activity.heatGenerated) {
        const toolB = get().getThievingToolBonuses();
        const baseHeat = activity.heatGenerated;
        const heatAdd = Math.max(0, Math.floor(baseHeat * toolB.heatReductionMultiplier));
        get().addHeat(heatAdd);
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
      thievingAutoResume: skillId === 'thieving' ? true : state.thievingAutoResume,
    }));
    
    // Stop heat decay when thieving starts (heat should increase during active thieving)
    if (skillId === 'thieving') {
      get().stopHeatDecay();
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

  acquireInvestigationLabTool: (toolId: string) => {
    const state = get();
    const tool = INVESTIGATION_LAB_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    for (const req of tool.requirements) {
      const have = (req.resourceId === 'loose_change' || req.resourceId === 'cash') ? state.gold : (state.bank[req.resourceId]?.quantity ?? 0);
      if (have < req.quantity) {
        console.log('Not enough resources to acquire lab set', toolId, req.resourceId, 'need', req.quantity, 'have', have);
        return;
      }
    }
    set(s => {
      const newBank = { ...s.bank };
      const newBankItems = [...s.bankItems];
      let newGold = s.gold;
      tool.requirements.forEach(req => {
        const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
        if (isCash) {
          newGold = Math.max(0, newGold - req.quantity);
          return;
        }
        const current = newBank[req.resourceId]?.quantity ?? 0;
        const updated = current - req.quantity;
        if (updated <= 0) {
          delete newBank[req.resourceId];
        } else {
          newBank[req.resourceId] = { resourceId: req.resourceId, quantity: updated };
        }
        const idx = newBankItems.findIndex(it => it?.resourceId === req.resourceId);
        if (idx !== -1) {
          const slotQty = (newBankItems[idx]?.quantity ?? 0) - req.quantity;
          newBankItems[idx] = slotQty > 0 ? { resourceId: req.resourceId, quantity: slotQty } : null;
        }
      });
      while (newBankItems.length < 30) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, 30);
      return {
        bank: newBank,
        bankItems: trimmed,
        gold: newGold,
        investigationLabToolsOwned: { ...s.investigationLabToolsOwned, [toolId]: true },
        equippedInvestigationLabToolId: s.equippedInvestigationLabToolId ?? toolId,
      };
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  },

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

  acquireSmugglingTool: (toolId: string) => {
    const state = get();
    const tool = SMUGGLING_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    for (const req of tool.requirements) {
      const have = (req.resourceId === 'loose_change' || req.resourceId === 'cash') ? state.gold : (state.bank[req.resourceId]?.quantity ?? 0);
      if (have < req.quantity) {
        console.log('Not enough resources to acquire smuggling tool', toolId, req.resourceId, 'need', req.quantity, 'have', have);
        return;
      }
    }
    set(s => {
      const newBank = { ...s.bank };
      const newBankItems = [...s.bankItems];
      let newGold = s.gold;
      tool.requirements.forEach(req => {
        const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
        if (isCash) {
          newGold = Math.max(0, newGold - req.quantity);
          return;
        }
        const current = newBank[req.resourceId]?.quantity ?? 0;
        const updated = current - req.quantity;
        if (updated <= 0) {
          delete newBank[req.resourceId];
        } else {
          newBank[req.resourceId] = { resourceId: req.resourceId, quantity: updated };
        }
        const idx = newBankItems.findIndex(it => it?.resourceId === req.resourceId);
        if (idx !== -1) {
          const slotQty = (newBankItems[idx]?.quantity ?? 0) - req.quantity;
          newBankItems[idx] = slotQty > 0 ? { resourceId: req.resourceId, quantity: slotQty } : null;
        }
      });
      while (newBankItems.length < 30) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, 30);
      return {
        bank: newBank,
        bankItems: trimmed,
        gold: newGold,
        smugglingToolsOwned: { ...s.smugglingToolsOwned, [toolId]: true },
        equippedSmugglingToolId: s.equippedSmugglingToolId ?? toolId,
      };
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  },

  equipSmugglingTool: (toolId: string) => {
    const { smugglingToolsOwned } = get();
    if (!smugglingToolsOwned[toolId]) return;
    set({ equippedSmugglingToolId: toolId });
    setTimeout(() => get().saveGame(), 50);
  },

  startSmugglingZone: (zone: SmugglingZone) => {
    const { skills, activeTimers, stopActivity } = get();
    try {
      get().stopBackgroundCombat();
      set({ combatAutoResume: false, combatSnapshot: undefined, combatIsActive: false });
    } catch (e) {
      console.log('stop combat on startSmugglingZone failed', e);
    }
    
    // Stop all other active skills first
    Object.keys(skills).forEach((id) => {
      if (skills[id].isActive) {
        stopActivity(id);
      }
    });

    const skillId = 'smuggling';
    const skill = skills[skillId];

    const smugTool = get().getSmugglingToolBonuses();
    const baseActual = get().getActualTime('smuggling', zone.baseTime, `smuggling_${zone.id}`);
    const adjustedTime = Math.max(100, Math.floor(baseActual * (smugTool.timeReductionMultiplier ?? 1)));
    console.log(`Starting smuggling with normal timing: ${adjustedTime}ms`);

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
          weight: it.minLevel ? Math.floor(it.weight * (bonuses.rareWeightMultiplier ?? 1)) : it.weight,
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
      }
      
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

      // Defer toast to avoid nested set issues
      setTimeout(() => {
        try {
          if (toAdd > 0) get().pushXpToast(toAdd, skillId);
        } catch (e) {
          console.log('pushXpToast failed', e);
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
      
      // Find existing item
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
          console.log('Bank is full! Cannot add', resourceId);
        }
      }
      
      return {
        bank: newBank,
        bankItems: newBankItems,
      };
    });
    // Auto-group items after adding new resource
    setTimeout(() => get().groupItems(), 100);
  },

  processOfflineProgress: () => {
    const { skills, lastSaved } = get();
    const offlineTime = Date.now() - lastSaved;
    const offlineHours = offlineTime / (1000 * 60 * 60);
    
    if (offlineHours < 0.1) return; // Less than 6 minutes, ignore
    
    console.log(`Processing ${offlineHours.toFixed(1)} hours of offline progress`);
    
    // Process each active skill
    Object.values(skills).forEach(skill => {
      if (skill.isActive && skill.currentActivity) {
        const activity = skill.currentActivity;
        const actualTime = get().getActualTime(skill.id, activity.baseTime, activity.id);
        const completions = Math.floor(offlineTime / actualTime);
        
        if (completions > 0) {
          if (skill.id === 'smuggling') {
            const perAction = getSmugglingXp(skill.level, actualTime);
            get().addExperience(skill.id, Math.max(1, Math.floor(perAction)) * completions);
            // Smuggling generates variable loot; for offline, add placeholder junk to reflect activity minimally
            get().addResource('pile_of_junk', completions);
            get().addMasteryExperience(activity.id, completions);
          } else {
            const xpToAward = activity.getDynamicXp ? activity.getDynamicXp(skill.level) : activity.baseXp;
            get().addExperience(skill.id, xpToAward * completions);
            get().addResource(activity.resource.id, completions);
            get().addMasteryExperience(activity.id, completions);
          }
        }
      }
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

  acquireThievingTool: (toolId: string) => {
    const state = get();
    const tool = THIEVING_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    // Check requirements (treat 'loose_change' as in-game cash stored in gold)
    for (const req of tool.requirements) {
      const have = req.resourceId === 'loose_change'
        ? state.gold
        : (state.bank[req.resourceId]?.quantity ?? 0);
      if (have < req.quantity) {
        console.log('Not enough resources to acquire tool', toolId, req.resourceId, 'need', req.quantity, 'have', have);
        return;
      }
    }
    // Consume
    set(s => {
      const newBank = { ...s.bank };
      const newBankItems = [...s.bankItems];
      let newGold = s.gold;
      tool.requirements.forEach(req => {
        const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
        if (isCash) {
          newGold = Math.max(0, newGold - req.quantity);
          return;
        }
        const current = newBank[req.resourceId]?.quantity ?? 0;
        const updated = current - req.quantity;
        if (updated <= 0) {
          delete newBank[req.resourceId];
        } else {
          newBank[req.resourceId] = { resourceId: req.resourceId, quantity: updated };
        }
        const idx = newBankItems.findIndex(it => it?.resourceId === req.resourceId);
        if (idx !== -1) {
          const slotQty = (newBankItems[idx]?.quantity ?? 0) - req.quantity;
          newBankItems[idx] = slotQty > 0 ? { resourceId: req.resourceId, quantity: slotQty } : null;
        }
      });
      while (newBankItems.length < 30) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, 30);
      return {
        bank: newBank,
        bankItems: trimmed,
        gold: newGold,
        thievingToolsOwned: { ...s.thievingToolsOwned, [toolId]: true },
        equippedThievingToolId: s.equippedThievingToolId ?? toolId,
      };
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  },

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

  acquireDistilleryTool: (toolId: string) => {
    const state = get();
    const tool = DISTILLERY_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    for (const req of tool.requirements) {
      const have = (req.resourceId === 'loose_change' || req.resourceId === 'cash') ? state.gold : (state.bank[req.resourceId]?.quantity ?? 0);
      if (have < req.quantity) {
        console.log('Not enough resources to acquire distillery tool', toolId, req.resourceId, 'need', req.quantity, 'have', have);
        return;
      }
    }
    set(s => {
      const newBank = { ...s.bank };
      const newBankItems = [...s.bankItems];
      let newGold = s.gold;
      tool.requirements.forEach(req => {
        const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
        if (isCash) {
          newGold = Math.max(0, newGold - req.quantity);
          return;
        }
        const current = newBank[req.resourceId]?.quantity ?? 0;
        const updated = current - req.quantity;
        if (updated <= 0) {
          delete newBank[req.resourceId];
        } else {
          newBank[req.resourceId] = { resourceId: req.resourceId, quantity: updated };
        }
        const idx = newBankItems.findIndex(it => it?.resourceId === req.resourceId);
        if (idx !== -1) {
          const slotQty = (newBankItems[idx]?.quantity ?? 0) - req.quantity;
          newBankItems[idx] = slotQty > 0 ? { resourceId: req.resourceId, quantity: slotQty } : null;
        }
      });
      while (newBankItems.length < 30) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, 30);
      return {
        bank: newBank,
        bankItems: trimmed,
        gold: newGold,
        distilleryToolsOwned: { ...s.distilleryToolsOwned, [toolId]: true },
        equippedDistilleryToolId: s.equippedDistilleryToolId ?? toolId,
      };
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  },

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

  acquireDrugTool: (toolId: string) => {
    const state = get();
    const tool = DRUG_TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    for (const req of tool.requirements) {
      const have = req.resourceId === 'loose_change' ? state.gold : (state.bank[req.resourceId]?.quantity ?? 0);
      if (have < req.quantity) {
        console.log('Not enough resources to acquire drug tool', toolId, req.resourceId, 'need', req.quantity, 'have', have);
        return;
      }
    }
    set(s => {
      const newBank = { ...s.bank };
      const newBankItems = [...s.bankItems];
      let newGold = s.gold;
      tool.requirements.forEach(req => {
        const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
        if (isCash) {
          newGold = Math.max(0, newGold - req.quantity);
          return;
        }
        const current = newBank[req.resourceId]?.quantity ?? 0;
        const updated = current - req.quantity;
        if (updated <= 0) {
          delete newBank[req.resourceId];
        } else {
          newBank[req.resourceId] = { resourceId: req.resourceId, quantity: updated };
        }
        const idx = newBankItems.findIndex(it => it?.resourceId === req.resourceId);
        if (idx !== -1) {
          const slotQty = (newBankItems[idx]?.quantity ?? 0) - req.quantity;
          newBankItems[idx] = slotQty > 0 ? { resourceId: req.resourceId, quantity: slotQty } : null;
        }
      });
      while (newBankItems.length < 30) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, 30);
      return {
        bank: newBank,
        bankItems: trimmed,
        gold: newGold,
        drugToolsOwned: { ...s.drugToolsOwned, [toolId]: true },
        equippedDrugToolId: s.equippedDrugToolId ?? toolId,
      };
    });
    setTimeout(() => get().groupItems(), 50);
    setTimeout(() => get().saveGame(), 100);
  },

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
    
    const goldEarned = (resource.value || 1) * quantity; // Default to 1 gp if no value
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
      const dungeons = [
        { id: 'back_alley', enemyCount: 4, recommendedLevel: 1,
          enemy: { hp: 30, attack: 6, defense: 2, attackSpeed: 1.6, accuracy: 70, evasion: 5, critChance: 5, critDamage: 150 },
          boss: { hp: 100, attack: 14, defense: 8, attackSpeed: 1.4, accuracy: 75, evasion: 10, critChance: 10, critDamage: 175 },
        },
        { id: 'warehouse', enemyCount: 4, recommendedLevel: 10,
          enemy: { hp: 90, attack: 14, defense: 8, attackSpeed: 1.5, accuracy: 75, evasion: 8, critChance: 8, critDamage: 160 },
          boss: { hp: 150, attack: 26, defense: 14, attackSpeed: 1.2, accuracy: 80, evasion: 12, critChance: 15, critDamage: 200 },
        },
      ] as const;
      const dungeon = dungeons.find(d => d.id === params.dungeonId) ?? dungeons[0];

      const equipped = state.equipped || {} as Partial<Record<EquipmentSlot, string>>;
      const baseStats = { hp: 100, attack: 10, defense: 5, accuracy: 80, evasion: 10, critChance: 5 };
      const bonus = Object.entries(equipped).reduce<{ hp?: number; attack?: number; defense?: number; accuracy?: number; evasion?: number; critChance?: number }>((acc, [_slot, rid]) => {
        if (!rid) return acc;
        const item = (EQUIPMENT_CATALOG as any)[rid];
        if (!item?.stats) return acc;
        Object.entries(item.stats).forEach(([k, v]) => {
          const key = k as keyof typeof acc;
          acc[key] = (acc[key] ?? 0) + ((v as number) ?? 0);
        });
        return acc;
      }, {});
      const totalStats = {
        hp: baseStats.hp + (bonus.hp ?? 0),
        attack: baseStats.attack + (bonus.attack ?? 0),
        defense: baseStats.defense + (bonus.defense ?? 0),
        accuracy: baseStats.accuracy + (bonus.accuracy ?? 0),
        evasion: baseStats.evasion + (bonus.evasion ?? 0),
        critChance: baseStats.critChance + (bonus.critChance ?? 0),
      };
      const weaponId = equipped.weapon;
      const weapon = weaponId ? (EQUIPMENT_CATALOG as any)[weaponId] : undefined;
      const secPerAttack = typeof weapon?.attackSpeed === 'number' && weapon?.attackSpeed > 0 ? weapon.attackSpeed : 1.6;
      const playerIntervalMs = Math.max(600, Math.floor(secPerAttack * 1000));

      const getEnemyForIndex = (idx: number) => (idx >= dungeon.enemyCount ? dungeon.boss : dungeon.enemy);
      const enemyIntervalFor = (idx: number) => {
        const e = getEnemyForIndex(idx);
        const sec = (e.attackSpeed || 1.8);
        return Math.max(600, Math.floor(sec * 1000));
      };

      let enemyIndex = params.enemyIndex;
      let enemyHp = params.enemyHp;
      let playerHp = Math.max(0, params.playerHp);
      let lastPlayerMs = 0;
      let lastEnemyMs = 0;
      const tick = 200;

      set({
        combatIsActive: true,
        combatDungeonId: params.dungeonId,
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
            const hitChance = Math.min(95, Math.max(5, totalStats.accuracy - (eStats.evasion ?? 0)));
            const hit = Math.random() * 100 < hitChance;
            const base = totalStats.attack;
            const variance = Math.max(1, Math.floor(base * 0.15));
            const roll = base + Math.floor((Math.random() * variance - variance / 2));
            const dmgRaw = Math.max(1, roll - Math.floor((eStats.defense ?? 0) / 2));
            const crit = Math.random() * 100 < (totalStats.critChance ?? 0);
            const dmg = hit ? Math.max(1, Math.floor(dmgRaw * (crit ? 1.5 : 1))) : 0;
            enemyHp = Math.max(0, enemyHp - dmg);
            if (enemyHp <= 0) {
              enemyIndex += 1;
              const total = dungeon.enemyCount + 1;
              if (enemyIndex >= total) {
                console.log('Background combat: Dungeon completed! Awarding loot bag');
                get().addResource('loot_bag', 1);
                const bagCount = get().combatSessionItems['loot_bag'] ?? 0;
                set({ combatSessionItems: { ...get().combatSessionItems, loot_bag: bagCount + 1 } });
                set({ combatIsActive: false, combatSnapshot: undefined, combatAutoResume: false });
                get().stopBackgroundCombat();
                return;
              }
              const isBossNext = enemyIndex >= dungeon.enemyCount;
              enemyHp = isBossNext ? (dungeon.boss.hp ?? 1) : (dungeon.enemy.hp ?? 1);
            }
          }

          if (lastEnemyMs >= enemyIntervalFor(enemyIndex)) {
            lastEnemyMs -= enemyIntervalFor(enemyIndex);
            const e = getEnemyForIndex(enemyIndex);
            const hitChanceE = Math.min(95, Math.max(5, (e.accuracy ?? 70) - totalStats.evasion));
            const hitE = Math.random() * 100 < hitChanceE;
            const baseE = e.attack ?? 5;
            const varianceE = Math.max(1, Math.floor(baseE * 0.15));
            const rollE = baseE + Math.floor((Math.random() * varianceE - varianceE / 2));
            const critE = Math.random() * 100 < (e.critChance ?? 0);
            const dmgRawE = Math.max(0, Math.floor(rollE - totalStats.defense / 3));
            const dmgE = hitE ? Math.max(0, Math.floor(dmgRawE * (critE ? (e.critDamage ?? 150) / 100 : 1))) : 0;
            playerHp = Math.max(0, playerHp - dmgE);
            if (playerHp <= 0) {
              set({ combatIsActive: false, combatPlayerHp: 0, combatSnapshot: undefined, combatAutoResume: false });
              try { get().setCombatDeath('Enemy'); } catch {}
              get().stopBackgroundCombat();
              return;
            }
          }

          set({
            combatDungeonId: params.dungeonId,
            combatEnemyIndex: enemyIndex,
            combatEnemyHp: enemyHp,
            combatPlayerHp: playerHp,
            combatSnapshot: get().combatIsActive ? { dungeonId: params.dungeonId, enemyIndex, enemyHp, at: Date.now() } : undefined,
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
    const { bank } = get();
    // Verify availability first
    for (const input of inputs) {
      const bankItem = bank[input.resourceId];
      if (!bankItem || bankItem.quantity < input.quantity) {
        return false;
      }
    }

    // Apply consumption to both bank map and bankItems array for UI sync
    set(state => {
      const newBank = { ...state.bank };
      const newBankItems = [...state.bankItems];

      for (const input of inputs) {
        const currentQuantity = newBank[input.resourceId]?.quantity ?? 0;
        const updatedQuantity = currentQuantity - input.quantity;

        if (updatedQuantity <= 0) {
          delete newBank[input.resourceId];
        } else {
          newBank[input.resourceId] = {
            resourceId: input.resourceId,
            quantity: updatedQuantity,
          };
        }

        // Reflect changes in bankItems array (first matching slot)
        const idx = newBankItems.findIndex(it => it?.resourceId === input.resourceId);
        if (idx !== -1) {
          const slotItem = newBankItems[idx];
          const slotQty = (slotItem?.quantity ?? 0) - input.quantity;
          if (slotQty <= 0) {
            newBankItems[idx] = null;
          } else {
            newBankItems[idx] = { resourceId: input.resourceId, quantity: slotQty };
          }
        }
      }

      const cap2 = get().maxBankSlots;
      while (newBankItems.length < cap2) newBankItems.push(null);
      const trimmed = newBankItems.slice(0, cap2);

      return { bank: newBank, bankItems: trimmed };
    });

    // Group after slight delay to compact empties
    setTimeout(() => get().groupItems(), 50);

    return true;
  },

  addHeat: (amount: number) => {
    set(state => {
      const currentHeat = state.heat;
      const newHeat = Math.max(0, Math.min(100, currentHeat + amount));
      console.log(`Heat: ${currentHeat} -> ${newHeat} (${amount > 0 ? '+' : ''}${amount})`);
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
    const lootTable = [
      { resourceId: 'iron_dagger', weight: 15 },
      { resourceId: 'wooden_shield', weight: 15 },
      { resourceId: 'leather_cap', weight: 12 },
      { resourceId: 'leather_vest', weight: 12 },
      { resourceId: 'leather_pants', weight: 10 },
      { resourceId: 'leather_boots', weight: 10 },
      { resourceId: 'simple_ring', weight: 8 },
      { resourceId: 'street_amulet', weight: 8 },
    ];

    // Guaranteed gold drop
    const goldAmount = Math.floor(50 + Math.random() * 101); // 50-150 gold
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
}));

// Auto-save every 30 seconds
setInterval(() => {
  useGameStore.getState().saveGame();
}, 30000);
