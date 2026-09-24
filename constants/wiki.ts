import { ACTIVITIES, EQUIPMENT_CATALOG, RESOURCES, SMUGGLING_ZONES, STORE_ITEMS } from '@/constants/gameData';
import { LOOT_BAG_TABLE } from '@/constants/combat';
import { THIEVING_TOOLS } from '@/constants/thievingTools';
import { DRUG_TOOLS } from '@/constants/drugTools';
import { DISTILLERY_TOOLS } from '@/constants/distilleryTools';
import { SMUGGLING_TOOLS } from '@/constants/smugglingTools';
import { INVESTIGATION_LAB_TOOLS } from '@/constants/investigationLabTools';

// ---------------------------------------------------------------------------
// Everything the Wiki and the Collection Log know is derived from the game
// data itself, so documentation can never drift from the real numbers.
// ---------------------------------------------------------------------------

export const SKILL_NAMES: Record<string, string> = {
  smuggling: 'Smuggling',
  thieving: 'Thieving',
  drug_factory: 'Drug Factory',
  distillery: 'Distillery',
  investigation_lab: 'Investigation Lab',
};

export const TOOL_SETS: { skillId: string; label: string; tools: { id: string; name: string; tier: number; icon: string; bonuses: Record<string, number | undefined>; requirements: { resourceId: string; quantity: number }[] }[] }[] = [
  { skillId: 'smuggling', label: 'Crews', tools: SMUGGLING_TOOLS as any },
  { skillId: 'thieving', label: 'Heist Gear', tools: THIEVING_TOOLS as any },
  { skillId: 'drug_factory', label: 'Facilities', tools: DRUG_TOOLS as any },
  { skillId: 'distillery', label: 'Equipment', tools: DISTILLERY_TOOLS as any },
  { skillId: 'investigation_lab', label: 'Lab Sets', tools: INVESTIGATION_LAB_TOOLS as any },
];

export type ItemSource =
  | { kind: 'craft'; skillId: string; activityId: string; name: string; level: number }
  | { kind: 'smuggle'; zoneId: string; name: string; level: number; chance: number; minLevel?: number }
  | { kind: 'steal'; activityId: string; name: string; level: number; chance: number; min: number; max: number }
  | { kind: 'shop'; price: number }
  | { kind: 'lootbag'; chance: number }
  | { kind: 'junk' };

export type ItemUse =
  | { kind: 'input'; skillId: string; activityId: string; name: string; qty: number; level: number }
  | { kind: 'tool'; skillId: string; toolName: string; qty: number }
  | { kind: 'equip'; slot: string };

const sources: Record<string, ItemSource[]> = {};
const uses: Record<string, ItemUse[]> = {};
const add = <T,>(map: Record<string, T[]>, id: string, v: T) => { (map[id] = map[id] ?? []).push(v); };

Object.entries(ACTIVITIES).forEach(([skillId, acts]) => {
  acts.forEach(a => {
    if (skillId !== 'thieving') {
      add(sources, a.resource.id, { kind: 'craft', skillId, activityId: a.id, name: a.name, level: a.levelRequired });
    }
    a.inputs?.forEach(inp => add(uses, inp.resourceId, { kind: 'input', skillId, activityId: a.id, name: a.name, qty: inp.quantity, level: a.levelRequired }));
    if (a.lootTable) {
      const items = a.lootTable.filter(l => l.resourceId !== 'cash' && l.resourceId !== 'loose_change');
      const total = items.reduce((sum, l) => sum + Math.max(0, l.weight), 0);
      items.forEach(l => {
        // Same maths as the store: pick one item by weight, then roll weight% to keep it.
        const chance = total > 0 ? (l.weight / total) * Math.min(1, l.weight / 100) : 0;
        add(sources, l.resourceId, { kind: 'steal', activityId: a.id, name: a.name, level: a.levelRequired, chance, min: l.minQuantity, max: l.maxQuantity });
      });
    }
  });
});

SMUGGLING_ZONES.forEach(z => {
  const total = z.items.reduce((sum, it) => sum + it.weight, 0);
  z.items.forEach(it => {
    const chance = (1 - z.junkChance / 100) * (it.weight / Math.max(1, total));
    add(sources, it.resource.id, { kind: 'smuggle', zoneId: z.id, name: z.name, level: z.levelRequired, chance, minLevel: it.minLevel });
  });
});
add(sources, 'pile_of_junk', { kind: 'junk' });

STORE_ITEMS.forEach(it => add(sources, it.resourceId, { kind: 'shop', price: it.price }));
const lootTotal = LOOT_BAG_TABLE.reduce((sum, l) => sum + l.weight, 0);
LOOT_BAG_TABLE.forEach(l => add(sources, l.resourceId, { kind: 'lootbag', chance: l.weight / lootTotal }));

TOOL_SETS.forEach(set => set.tools.forEach(t => t.requirements.forEach(r => {
  if (r.resourceId !== 'cash' && r.resourceId !== 'loose_change') add(uses, r.resourceId, { kind: 'tool', skillId: set.skillId, toolName: t.name, qty: r.quantity });
})));
Object.values(EQUIPMENT_CATALOG).forEach(e => add(uses, e.id, { kind: 'equip', slot: e.slot }));

export function getItemSources(id: string): ItemSource[] {
  return sources[id] ?? [];
}

export function getItemUses(id: string): ItemUse[] {
  return uses[id] ?? [];
}

export type ItemGroup = 'supplies' | 'drug_factory' | 'distillery' | 'investigation_lab' | 'smuggling' | 'thieving' | 'gear' | 'misc';

export const ITEM_GROUPS: { id: ItemGroup; name: string; icon: string }[] = [
  { id: 'supplies', name: 'Supplies', icon: '🛒' },
  { id: 'drug_factory', name: 'Drug Factory', icon: '🧪' },
  { id: 'distillery', name: 'Distillery', icon: '🥃' },
  { id: 'investigation_lab', name: 'Lab Refinements', icon: '🔬' },
  { id: 'smuggling', name: 'Smuggled Goods', icon: '🚢' },
  { id: 'thieving', name: 'Stolen Goods', icon: '🥷' },
  { id: 'gear', name: 'Combat Gear', icon: '⚔️' },
  { id: 'misc', name: 'Miscellaneous', icon: '🧰' },
];

export function getItemGroup(id: string): ItemGroup {
  if (EQUIPMENT_CATALOG[id]) return 'gear';
  const src = getItemSources(id);
  const craft = src.find(s => s.kind === 'craft') as Extract<ItemSource, { kind: 'craft' }> | undefined;
  if (craft) return craft.skillId as ItemGroup;
  if (src.some(s => s.kind === 'shop')) return 'supplies';
  if (src.some(s => s.kind === 'smuggle' || s.kind === 'junk')) return 'smuggling';
  if (src.some(s => s.kind === 'steal')) return 'thieving';
  return 'misc';
}

export const ALL_ITEM_IDS = Object.keys(RESOURCES);

export function itemsByGroup(): Record<ItemGroup, string[]> {
  const out = Object.fromEntries(ITEM_GROUPS.map(g => [g.id, [] as string[]])) as Record<ItemGroup, string[]>;
  ALL_ITEM_IDS.forEach(id => out[getItemGroup(id)].push(id));
  return out;
}

export function formatChance(p: number): string {
  if (p <= 0) return '0%';
  const pct = p * 100;
  if (pct >= 10) return `${pct.toFixed(0)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct >= 0.01) return `${pct.toFixed(2)}%`;
  return `1 in ${Math.round(1 / p).toLocaleString('en-US')}`;
}
