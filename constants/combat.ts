import { EquipmentSlot } from '@/types/game';
import { EQUIPMENT_CATALOG } from '@/constants/gameData';

export type EnemyRarity = 'common' | 'elite' | 'boss';

export interface CombatEnemy {
  id: string;
  name: string;
  icon: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  accuracy: number;
  evasion: number;
  critChance: number;
  critDamage: number;
  rarity?: EnemyRarity;
}

export interface CombatDungeon {
  id: string;
  name: string;
  recommendedLevel: number;
  enemyCount: number;
  enemy: CombatEnemy;
  boss: CombatEnemy;
  description: string;
}

// Single source of truth for dungeons: both the on-screen fight and the background
// simulation read from here so rewards and difficulty never drift apart.
export const COMBAT_DUNGEONS: CombatDungeon[] = [
  {
    id: 'back_alley',
    name: 'Back Alley',
    recommendedLevel: 1,
    description: 'Shady alleys patrolled by rookie guards.',
    enemyCount: 4,
    enemy: { id: 'thug', name: 'Street Thug', icon: '🥊', level: 1, hp: 30, attack: 6, defense: 2, attackSpeed: 1.6, accuracy: 70, evasion: 5, critChance: 5, critDamage: 150, rarity: 'common' },
    boss: { id: 'alley_boss', name: 'Alley Boss', icon: '🗡️', level: 5, hp: 100, attack: 14, defense: 8, attackSpeed: 1.4, accuracy: 75, evasion: 10, critChance: 10, critDamage: 175, rarity: 'boss' },
  },
  {
    id: 'warehouse',
    name: 'Abandoned Warehouse',
    recommendedLevel: 10,
    description: 'A stash point crawling with vigilantes.',
    enemyCount: 4,
    enemy: { id: 'vigilante', name: 'Vigilante', icon: '🕶️', level: 10, hp: 90, attack: 14, defense: 8, attackSpeed: 1.5, accuracy: 75, evasion: 8, critChance: 8, critDamage: 160, rarity: 'common' },
    boss: { id: 'sheriff', name: 'Sheriff', icon: '⭐', level: 14, hp: 150, attack: 26, defense: 14, attackSpeed: 1.2, accuracy: 80, evasion: 12, critChance: 15, critDamage: 200, rarity: 'boss' },
  },
];

export function getDungeon(id?: string): CombatDungeon {
  return COMBAT_DUNGEONS.find(d => d.id === id) ?? COMBAT_DUNGEONS[0];
}

export function getDungeonGoldReward(dungeon: CombatDungeon): number {
  return 50 + Math.floor(dungeon.recommendedLevel * 2);
}

export const BASE_PLAYER_STATS = { hp: 100, attack: 10, defense: 5, accuracy: 80, evasion: 10, critChance: 5 } as const;

export type PlayerCombatStats = { hp: number; attack: number; defense: number; accuracy: number; evasion: number; critChance: number };

export function getPlayerCombatStats(equipped: Partial<Record<EquipmentSlot, string>> | undefined): PlayerCombatStats {
  const total: PlayerCombatStats = { ...BASE_PLAYER_STATS };
  Object.values(equipped ?? {}).forEach(rid => {
    const item = rid ? EQUIPMENT_CATALOG[rid] : undefined;
    if (!item?.stats) return;
    Object.entries(item.stats).forEach(([k, v]) => {
      const key = (k === 'health' || k === 'maxHealth' ? 'hp' : k) as keyof PlayerCombatStats;
      if (key in total) total[key] += (v as number) ?? 0;
    });
  });
  return total;
}

export function getPlayerAttackIntervalMs(equipped: Partial<Record<EquipmentSlot, string>> | undefined): number {
  const weapon = equipped?.weapon ? EQUIPMENT_CATALOG[equipped.weapon] : undefined;
  const secPerAttack = typeof weapon?.attackSpeed === 'number' && weapon.attackSpeed > 0 ? weapon.attackSpeed : 1.6;
  return Math.max(600, Math.floor(secPerAttack * 1000));
}
