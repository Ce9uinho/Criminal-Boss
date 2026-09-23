import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/gameStore';
import { ACTIVITIES, SMUGGLING_ZONES } from '@/constants/gameData';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { GameStateSnapshot, SkillMetaSnapshot } from '@/types/game';

// Builds the snapshot every achievement evaluates against.
export function useAchievementSnapshot(): GameStateSnapshot {
  const { skills, bank, mastery, gold, lifetimeStats } = useGameStore();
  // useShallow: the selector builds a new object, so compare by field to avoid re-render loops.
  const toolsOwned = useGameStore(useShallow(s => ({
    drug_factory: s.drugToolsOwned,
    distillery: s.distilleryToolsOwned,
    investigation_lab: s.investigationLabToolsOwned,
    smuggling: s.smugglingToolsOwned,
    thieving: s.thievingToolsOwned,
  })));

  // Per-skill progress used by the skill-specific achievements.
  const buildPerSkill = (): Record<string, SkillMetaSnapshot> => {
    const out: Record<string, SkillMetaSnapshot> = {};
    Object.keys(toolsOwned).forEach(skillId => {
      const activityIds = skillId === 'smuggling'
        ? SMUGGLING_ZONES.map(z => `smuggling_${z.id}`)
        : (ACTIVITIES[skillId] ?? []).map(a => a.id);
      const levels = activityIds.map(id => mastery?.[id]?.level ?? 1);
      const owned = toolsOwned[skillId as keyof typeof toolsOwned] ?? {};
      out[skillId] = {
        toolsUnlocked: Object.values(owned).filter(Boolean).length,
        toolsTotal: 5,
        masteryPctAt25: levels.filter(l => l >= 25).length,
        masteryPctAt50: levels.filter(l => l >= 50).length,
        masteryPctAt75: levels.filter(l => l >= 75).length,
        masteryPctAt100: levels.filter(l => l >= 100).length,
        craftedTotal: lifetimeStats?.produced?.[skillId] ?? 0,
        rareCollected: skillId === 'smuggling' ? (lifetimeStats?.rareCollected ?? 0) : 0,
      };
    });
    return out;
  };

  return React.useMemo(() => {
    const skillsArray = Object.values(skills ?? {});
    const skillLevels: Record<string, number> = Object.fromEntries(Object.entries(skills ?? {}).map(([id, s]) => [id, s.level ?? 1]));
    const averageSkillLevel = (() => {
      const count = skillsArray.length;
      if (count === 0) return 1;
      const sum = skillsArray.reduce((acc, s) => acc + (s.level || 1), 0);
      return Math.floor(sum / count);
    })();
    const highestSkillLevel = skillsArray.reduce((max, s) => Math.max(max, s.level || 1), 1);
    const totalItemsInBank = Object.values(bank ?? {}).reduce((sum, it) => sum + (it.quantity || 0), 0);
    const uniqueItemsInBank = Object.keys(bank ?? {}).length;
    const masteryLevels = Object.values(mastery ?? {}).map(m => m.level || 1);
    const masteryMilestones25 = masteryLevels.filter(l => l >= 25).length;
    const masteryMilestones50 = masteryLevels.filter(l => l >= 50).length;
    const masteryMilestones75 = masteryLevels.filter(l => l >= 75).length;
    const masteryMilestones100 = masteryLevels.filter(l => l >= 100).length;
    return {
      gold: gold ?? 0,
      totalItemsInBank,
      uniqueItemsInBank,
      averageSkillLevel,
      highestSkillLevel,
      masteryMilestones25,
      masteryMilestones50,
      masteryMilestones75,
      masteryMilestones100,
      skillLevels,
      perSkill: buildPerSkill(),
    };
  }, [skills, bank, mastery, gold, lifetimeStats, toolsOwned.drug_factory, toolsOwned.distillery, toolsOwned.investigation_lab, toolsOwned.smuggling, toolsOwned.thieving]);

}

// Number of achievement tiers completed and available across the whole game.
export function useAchievementTotals(): { completed: number; total: number } {
  const snapshot = useAchievementSnapshot();
  return React.useMemo(() => {
    const total = ACHIEVEMENTS.reduce((sum, a) => sum + a.tiers.length, 0);
    const completed = ACHIEVEMENTS.reduce((sum, a) => sum + Math.max(0, Math.min(a.tiers.length, a.evaluate(snapshot))), 0);
    return { completed, total };
  }, [snapshot]);
}
