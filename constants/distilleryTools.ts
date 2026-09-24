import { DrugTool } from '@/types/game';

// Reuse DrugTool type for distillery tools (same bonus schema): failure/time/output/input multipliers
// Requirements use ONLY Distillery outputs, with timings aligned to thieving-like acquisition: 
// T1 ~15–20 min, T2 ~60–90 min, T3 ~4–6 h, T4 ~12–18 h, T5 ~30–40 h
export const DISTILLERY_TOOLS: DrugTool[] = [
  {
    id: 'pot_still',
    name: 'Pot Still',
    tier: 1,
    icon: '⚗️',
    bonuses: {
      failureReductionMultiplier: 0.95,
      timeReductionMultiplier: 0.95,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.98,
      inputSaveChance: 0.10,
    },
    requirements: [
      { resourceId: 'cash', quantity: 500 },
      { resourceId: 'craft_beer', quantity: 30 },
      { resourceId: 'simple_wine', quantity: 15 },
    ],
  },
  {
    id: 'oak_aging_barrels',
    name: 'Oak Aging Barrels',
    tier: 2,
    icon: '🛢️',
    bonuses: {
      failureReductionMultiplier: 0.92,
      timeReductionMultiplier: 0.92,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.95,
      inputSaveChance: 0.15,
    },
    requirements: [
      { resourceId: 'cash', quantity: 3000 },
      { resourceId: 'mead', quantity: 260 },
      { resourceId: 'cider', quantity: 220 },
      { resourceId: 'rum', quantity: 180 },
    ],
  },
  {
    id: 'copper_column_still',
    name: 'Copper Column Still',
    tier: 3,
    icon: '⚙️',
    bonuses: {
      failureReductionMultiplier: 0.88,
      timeReductionMultiplier: 0.88,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.93,
      inputSaveChance: 0.20,
    },
    requirements: [
      { resourceId: 'cash', quantity: 12000 },
      { resourceId: 'vodka', quantity: 600 },
      { resourceId: 'tequila', quantity: 500 },
      { resourceId: 'whisky', quantity: 400 },
    ],
  },
  {
    id: 'liebig_condensers',
    name: 'Liebig Condensers',
    tier: 4,
    icon: '🔧',
    bonuses: {
      failureReductionMultiplier: 0.85,
      timeReductionMultiplier: 0.85,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.9,
      inputSaveChance: 0.25,
    },
    requirements: [
      { resourceId: 'cash', quantity: 60000 },
      { resourceId: 'absinthe', quantity: 900 },
      { resourceId: 'champagne', quantity: 800 },
      { resourceId: 'premium_liqueur', quantity: 700 },
      { resourceId: 'cognac', quantity: 500 },
    ],
  },
  {
    id: 'automated_micro_distillery',
    name: 'Automated Micro Distillery',
    tier: 5,
    icon: '🏭',
    bonuses: {
      failureReductionMultiplier: 0.8,
      timeReductionMultiplier: 0.8,
      outputMultiplier: 3,
      inputReductionMultiplier: 0.85,
      inputSaveChance: 0.30,
    },
    requirements: [
      { resourceId: 'cash', quantity: 200000 },
      { resourceId: 'illegal_energy_drink', quantity: 1200 },
      { resourceId: 'special_cocktails', quantity: 1000 },
      { resourceId: 'cognac', quantity: 900 },
      { resourceId: 'premium_liqueur', quantity: 900 },
    ],
  },
];
