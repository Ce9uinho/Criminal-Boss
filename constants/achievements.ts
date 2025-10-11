import { AchievementDefinition, GameStateSnapshot } from '@/types/game';

const clampTier = (value: number): number => Math.max(0, Math.min(5, value));

export function getAchievementDescription(def: AchievementDefinition, currentLevel: number): string {
  const nextTierIndex = Math.min(currentLevel, def.tiers.length - 1);
  const targetValue = def.tiers[nextTierIndex];
  
  const descriptions: Record<string, (val: number) => string> = {
    'gold_hoarder': (v) => `Accumulate ${formatNumber(v)} gold`,
    'collector': (v) => `Collect ${v} unique items in bank`,
    'stash': (v) => `Store ${formatNumber(v)} total items in bank`,
    'level_avg': (v) => `Reach average skill level ${v}`,
    'level_peak': (v) => `Reach level ${v} in any skill`,
    'mastery_milestones': (v) => v === 1 ? `Unlock ${v} mastery milestone` : `Unlock ${v} mastery milestones`,
    
    'drug_factory_level': (v) => `Reach level ${v} in Drug Factory`,
    'drug_factory_tools': (v) => v === 1 ? `Unlock ${v} Drug Factory tool` : `Unlock ${v} Drug Factory tools`,
    'drug_factory_mastery_25': (v) => v === 1 ? `Reach 25% mastery in ${v} Drug Factory activity` : `Reach 25% mastery in ${v} Drug Factory activities`,
    'drug_factory_mastery_100': (v) => v === 1 ? `Reach 100% mastery in ${v} Drug Factory activity` : `Reach 100% mastery in ${v} Drug Factory activities`,
    'drug_factory_production': (v) => `Craft ${formatNumber(v)} items in Drug Factory`,
    
    'distillery_level': (v) => `Reach level ${v} in Distillery`,
    'distillery_tools': (v) => v === 1 ? `Unlock ${v} Distillery tool` : `Unlock ${v} Distillery tools`,
    'distillery_mastery_25': (v) => v === 1 ? `Reach 25% mastery in ${v} Distillery activity` : `Reach 25% mastery in ${v} Distillery activities`,
    'distillery_mastery_100': (v) => v === 1 ? `Reach 100% mastery in ${v} Distillery activity` : `Reach 100% mastery in ${v} Distillery activities`,
    'distillery_production': (v) => `Produce ${formatNumber(v)} drinks in Distillery`,
    
    'investigation_lab_level': (v) => `Reach level ${v} in Investigation Lab`,
    'investigation_lab_tools': (v) => v === 1 ? `Unlock ${v} Investigation Lab tool` : `Unlock ${v} Investigation Lab tools`,
    'investigation_lab_mastery_25': (v) => v === 1 ? `Reach 25% mastery in ${v} Investigation Lab activity` : `Reach 25% mastery in ${v} Investigation Lab activities`,
    'investigation_lab_mastery_100': (v) => v === 1 ? `Reach 100% mastery in ${v} Investigation Lab activity` : `Reach 100% mastery in ${v} Investigation Lab activities`,
    'investigation_lab_production': (v) => `Refine ${formatNumber(v)} materials in Investigation Lab`,
    
    'smuggling_level': (v) => `Reach level ${v} in Smuggling`,
    'smuggling_tools': (v) => v === 1 ? `Unlock ${v} Smuggling tool` : `Unlock ${v} Smuggling tools`,
    'smuggling_mastery_25': (v) => v === 1 ? `Reach 25% mastery in ${v} Smuggling zone` : `Reach 25% mastery in ${v} Smuggling zones`,
    'smuggling_mastery_100': (v) => v === 1 ? `Reach 100% mastery in ${v} Smuggling zone` : `Reach 100% mastery in ${v} Smuggling zones`,
    'smuggling_rare_items': (v) => `Collect ${formatNumber(v)} rare items in Smuggling`,
    
    'thieving_level': (v) => `Reach level ${v} in Thieving`,
    'thieving_tools': (v) => v === 1 ? `Unlock ${v} Thieving tool` : `Unlock ${v} Thieving tools`,
    'thieving_mastery_25': (v) => v === 1 ? `Reach 25% mastery in ${v} Thieving activity` : `Reach 25% mastery in ${v} Thieving activities`,
    'thieving_mastery_100': (v) => v === 1 ? `Reach 100% mastery in ${v} Thieving activity` : `Reach 100% mastery in ${v} Thieving activities`,
    'thieving_heists': (v) => `Complete ${formatNumber(v)} successful thefts`,
  };
  
  const formatter = descriptions[def.id];
  return formatter ? formatter(targetValue) : def.description;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return `${n}`;
}


export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'gold_hoarder',
    title: 'Gold Hoarder',
    description: 'Accumulate 1,000 gold',
    icon: 'Coins',
    category: 'general',
    tiers: [1_000, 10_000, 100_000, 1_000_000, 10_000_000],
    evaluate: (s: GameStateSnapshot) => {
      const thresholds = [1_000, 10_000, 100_000, 1_000_000, 10_000_000];
      let lvl = 0;
      thresholds.forEach((t, i) => { if (s.gold >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Collect 5 unique items in bank',
    icon: 'Package',
    category: 'general',
    tiers: [5, 15, 35, 70, 120],
    evaluate: (s: GameStateSnapshot) => {
      const thresholds = [5, 15, 35, 70, 120];
      let lvl = 0; thresholds.forEach((t, i) => { if (s.uniqueItemsInBank >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'stash',
    title: 'Warehouse',
    description: 'Store 100 total items in bank',
    icon: 'Boxes',
    category: 'general',
    tiers: [100, 1_000, 10_000, 100_000, 1_000_000],
    evaluate: (s: GameStateSnapshot) => {
      const thresholds = [100, 1_000, 10_000, 100_000, 1_000_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (s.totalItemsInBank >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'level_avg',
    title: 'Constant Training',
    description: 'Reach average skill level 5',
    icon: 'TrendingUp',
    category: 'general',
    tiers: [5, 15, 30, 60, 90],
    evaluate: (s: GameStateSnapshot) => {
      const thresholds = [5, 15, 30, 60, 90];
      let lvl = 0; thresholds.forEach((t, i) => { if (s.averageSkillLevel >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'level_peak',
    title: 'Peak Performance',
    description: 'Reach level 10 in any skill',
    icon: 'Award',
    category: 'general',
    tiers: [10, 30, 60, 90, 100],
    evaluate: (s: GameStateSnapshot) => {
      const thresholds = [10, 30, 60, 90, 100];
      let lvl = 0; thresholds.forEach((t, i) => { if (s.highestSkillLevel >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'mastery_milestones',
    title: 'Golden Hands',
    description: 'Unlock 1 mastery milestone',
    icon: 'Trophy',
    category: 'general',
    tiers: [1, 5, 15, 40, 100],
    evaluate: (s: GameStateSnapshot) => {
      const totalMilestones = s.masteryMilestones25 + s.masteryMilestones50 + s.masteryMilestones75 + s.masteryMilestones100;
      const thresholds = [1, 5, 15, 40, 100];
      let lvl = 0; thresholds.forEach((t, i) => { if (totalMilestones >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },

  // Drug Factory Achievements
  {
    id: 'drug_factory_level',
    title: 'Street Chemist',
    description: 'Reach level 5 in Drug Factory',
    icon: 'Award',
    category: 'drug_factory',
    tiers: [5, 20, 40, 70, 100],
    evaluate: (s: GameStateSnapshot) => {
      const lvl = s.skillLevels?.['drug_factory'] ?? 1;
      const thresholds = [5, 20, 40, 70, 100];
      let reached = 0; thresholds.forEach((t, i) => { if (lvl >= t) reached = i + 1; });
      return clampTier(reached);
    },
  },
  {
    id: 'drug_factory_tools',
    title: 'Chemical Equipment',
    description: 'Unlock 1 Drug Factory tool',
    icon: 'Wrench',
    category: 'drug_factory',
    tiers: [1, 2, 3, 4, 5],
    evaluate: (s: GameStateSnapshot) => {
      const unlocked = s.perSkill?.['drug_factory']?.toolsUnlocked ?? 0;
      const thresholds = [1, 2, 3, 4, 5];
      let lvl = 0; thresholds.forEach((t, i) => { if (unlocked >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'drug_factory_mastery_25',
    title: 'Chemical Apprentice',
    description: 'Reach 25% mastery in 1 Drug Factory activity',
    icon: 'GraduationCap',
    category: 'drug_factory',
    tiers: [1, 3, 5, 10, 16],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['drug_factory']?.masteryPctAt25 ?? 0;
      const thresholds = [1, 3, 5, 10, 16];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'drug_factory_mastery_100',
    title: 'Master Chemist',
    description: 'Reach 100% mastery in 1 Drug Factory activity',
    icon: 'Crown',
    category: 'drug_factory',
    tiers: [1, 2, 4, 8, 16],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['drug_factory']?.masteryPctAt100 ?? 0;
      const thresholds = [1, 2, 4, 8, 16];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'drug_factory_production',
    title: 'Mass Production',
    description: 'Craft 100 items in Drug Factory',
    icon: 'Factory',
    category: 'drug_factory',
    tiers: [100, 500, 2_000, 10_000, 50_000],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['drug_factory']?.craftedTotal ?? 0;
      const thresholds = [100, 500, 2_000, 10_000, 50_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },

  // Distillery Achievements
  {
    id: 'distillery_level',
    title: 'Distillery Master',
    description: 'Reach level 5 in Distillery',
    icon: 'Award',
    category: 'distillery',
    tiers: [5, 20, 40, 70, 100],
    evaluate: (s: GameStateSnapshot) => {
      const lvl = s.skillLevels?.['distillery'] ?? 1;
      const thresholds = [5, 20, 40, 70, 100];
      let reached = 0; thresholds.forEach((t, i) => { if (lvl >= t) reached = i + 1; });
      return clampTier(reached);
    },
  },
  {
    id: 'distillery_tools',
    title: 'Distillation Equipment',
    description: 'Unlock 1 Distillery tool',
    icon: 'Wrench',
    category: 'distillery',
    tiers: [1, 2, 3, 4, 5],
    evaluate: (s: GameStateSnapshot) => {
      const unlocked = s.perSkill?.['distillery']?.toolsUnlocked ?? 0;
      const thresholds = [1, 2, 3, 4, 5];
      let lvl = 0; thresholds.forEach((t, i) => { if (unlocked >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'distillery_mastery_25',
    title: 'Distiller Apprentice',
    description: 'Reach 25% mastery in 1 Distillery activity',
    icon: 'GraduationCap',
    category: 'distillery',
    tiers: [1, 3, 5, 10, 14],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['distillery']?.masteryPctAt25 ?? 0;
      const thresholds = [1, 3, 5, 10, 14];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'distillery_mastery_100',
    title: 'Master Distiller',
    description: 'Reach 100% mastery in 1 Distillery activity',
    icon: 'Crown',
    category: 'distillery',
    tiers: [1, 2, 4, 8, 14],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['distillery']?.masteryPctAt100 ?? 0;
      const thresholds = [1, 2, 4, 8, 14];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'distillery_production',
    title: 'Infinite Barrels',
    description: 'Produce 100 drinks in Distillery',
    icon: 'Factory',
    category: 'distillery',
    tiers: [100, 500, 2_000, 10_000, 50_000],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['distillery']?.craftedTotal ?? 0;
      const thresholds = [100, 500, 2_000, 10_000, 50_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },

  // Investigation Lab Achievements
  {
    id: 'investigation_lab_level',
    title: 'Lab Brain',
    description: 'Reach level 5 in Investigation Lab',
    icon: 'Award',
    category: 'investigation_lab',
    tiers: [5, 20, 40, 70, 100],
    evaluate: (s: GameStateSnapshot) => {
      const lvl = s.skillLevels?.['investigation_lab'] ?? 1;
      const thresholds = [5, 20, 40, 70, 100];
      let reached = 0; thresholds.forEach((t, i) => { if (lvl >= t) reached = i + 1; });
      return clampTier(reached);
    },
  },
  {
    id: 'investigation_lab_tools',
    title: 'Laboratory Equipment',
    description: 'Unlock 1 Investigation Lab tool',
    icon: 'Wrench',
    category: 'investigation_lab',
    tiers: [1, 2, 3, 4, 5],
    evaluate: (s: GameStateSnapshot) => {
      const unlocked = s.perSkill?.['investigation_lab']?.toolsUnlocked ?? 0;
      const thresholds = [1, 2, 3, 4, 5];
      let lvl = 0; thresholds.forEach((t, i) => { if (unlocked >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'investigation_lab_mastery_25',
    title: 'Scientist Apprentice',
    description: 'Reach 25% mastery in 1 Investigation Lab activity',
    icon: 'GraduationCap',
    category: 'investigation_lab',
    tiers: [1, 2, 4, 7, 10],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['investigation_lab']?.masteryPctAt25 ?? 0;
      const thresholds = [1, 2, 4, 7, 10];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'investigation_lab_mastery_100',
    title: 'Master Scientist',
    description: 'Reach 100% mastery in 1 Investigation Lab activity',
    icon: 'Crown',
    category: 'investigation_lab',
    tiers: [1, 2, 3, 5, 10],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['investigation_lab']?.masteryPctAt100 ?? 0;
      const thresholds = [1, 2, 3, 5, 10];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'investigation_lab_production',
    title: 'Premium Refiner',
    description: 'Refine 50 materials in Investigation Lab',
    icon: 'Factory',
    category: 'investigation_lab',
    tiers: [50, 250, 1_000, 5_000, 25_000],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['investigation_lab']?.craftedTotal ?? 0;
      const thresholds = [50, 250, 1_000, 5_000, 25_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },

  // Smuggling Achievements
  {
    id: 'smuggling_level',
    title: 'Smuggling King',
    description: 'Reach level 5 in Smuggling',
    icon: 'Award',
    category: 'smuggling',
    tiers: [5, 20, 40, 70, 100],
    evaluate: (s: GameStateSnapshot) => {
      const lvl = s.skillLevels?.['smuggling'] ?? 1;
      const thresholds = [5, 20, 40, 70, 100];
      let reached = 0; thresholds.forEach((t, i) => { if (lvl >= t) reached = i + 1; });
      return clampTier(reached);
    },
  },
  {
    id: 'smuggling_tools',
    title: 'Smuggling Equipment',
    description: 'Unlock 1 Smuggling tool',
    icon: 'Wrench',
    category: 'smuggling',
    tiers: [1, 2, 3, 4, 5],
    evaluate: (s: GameStateSnapshot) => {
      const unlocked = s.perSkill?.['smuggling']?.toolsUnlocked ?? 0;
      const thresholds = [1, 2, 3, 4, 5];
      let lvl = 0; thresholds.forEach((t, i) => { if (unlocked >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'smuggling_mastery_25',
    title: 'Smuggler Apprentice',
    description: 'Reach 25% mastery in 1 Smuggling zone',
    icon: 'GraduationCap',
    category: 'smuggling',
    tiers: [1, 2, 4, 7, 10],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['smuggling']?.masteryPctAt25 ?? 0;
      const thresholds = [1, 2, 4, 7, 10];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'smuggling_mastery_100',
    title: 'Master Smuggler',
    description: 'Reach 100% mastery in 1 Smuggling zone',
    icon: 'Crown',
    category: 'smuggling',
    tiers: [1, 2, 3, 5, 10],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['smuggling']?.masteryPctAt100 ?? 0;
      const thresholds = [1, 2, 3, 5, 10];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'smuggling_rare_items',
    title: 'Treasure Hunter',
    description: 'Collect 5 rare items in Smuggling',
    icon: 'Gem',
    category: 'smuggling',
    tiers: [5, 25, 100, 500, 2_000],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['smuggling']?.rareCollected ?? 0;
      const thresholds = [5, 25, 100, 500, 2_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },

  // Thieving Achievements
  {
    id: 'thieving_level',
    title: 'City Shadow',
    description: 'Reach level 5 in Thieving',
    icon: 'Award',
    category: 'thieving',
    tiers: [5, 20, 40, 70, 100],
    evaluate: (s: GameStateSnapshot) => {
      const lvl = s.skillLevels?.['thieving'] ?? 1;
      const thresholds = [5, 20, 40, 70, 100];
      let reached = 0; thresholds.forEach((t, i) => { if (lvl >= t) reached = i + 1; });
      return clampTier(reached);
    },
  },
  {
    id: 'thieving_tools',
    title: 'Thieving Equipment',
    description: 'Unlock 1 Thieving tool',
    icon: 'Wrench',
    category: 'thieving',
    tiers: [1, 2, 3, 4, 5],
    evaluate: (s: GameStateSnapshot) => {
      const unlocked = s.perSkill?.['thieving']?.toolsUnlocked ?? 0;
      const thresholds = [1, 2, 3, 4, 5];
      let lvl = 0; thresholds.forEach((t, i) => { if (unlocked >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'thieving_mastery_25',
    title: 'Thief Apprentice',
    description: 'Reach 25% mastery in 1 Thieving activity',
    icon: 'GraduationCap',
    category: 'thieving',
    tiers: [1, 3, 6, 10, 15],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['thieving']?.masteryPctAt25 ?? 0;
      const thresholds = [1, 3, 6, 10, 15];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'thieving_mastery_100',
    title: 'Master Thief',
    description: 'Reach 100% mastery in 1 Thieving activity',
    icon: 'Crown',
    category: 'thieving',
    tiers: [1, 2, 4, 8, 15],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['thieving']?.masteryPctAt100 ?? 0;
      const thresholds = [1, 2, 4, 8, 15];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
  {
    id: 'thieving_heists',
    title: 'Successful Heists',
    description: 'Complete 50 successful thefts',
    icon: 'Target',
    category: 'thieving',
    tiers: [50, 250, 1_000, 5_000, 25_000],
    evaluate: (s: GameStateSnapshot) => {
      const count = s.perSkill?.['thieving']?.craftedTotal ?? 0;
      const thresholds = [50, 250, 1_000, 5_000, 25_000];
      let lvl = 0; thresholds.forEach((t, i) => { if (count >= t) lvl = i + 1; });
      return clampTier(lvl);
    },
  },
];

export const ACHIEVEMENT_CATEGORIES = [
  { id: 'general' as const, name: 'General', icon: 'Trophy' },
  { id: 'drug_factory' as const, name: 'Drug Factory', icon: 'Flask' },
  { id: 'distillery' as const, name: 'Distillery', icon: 'Wine' },
  { id: 'smuggling' as const, name: 'Smuggling', icon: 'Package' },
  { id: 'investigation_lab' as const, name: 'Investigation Lab', icon: 'Microscope' },
  { id: 'thieving' as const, name: 'Thieving', icon: 'UserX' },
];
