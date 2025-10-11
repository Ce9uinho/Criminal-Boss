import { DrugTool } from '@/types/game';

// Requirements use ONLY Drug Factory OUTPUTS (crafted products),
// Quantities calibrated to match thieving-like acquisition times (approx):
// T1 ~15–18 min, T2 ~60 min, T3 ~4 h, T4 ~12 h, T5 ~30 h
export const DRUG_TOOLS: DrugTool[] = [
  {
    id: 'lab_glassware_kit',
    name: 'Basement Starter Lab',
    tier: 1,
    icon: '🏚️',
    bonuses: {
      failureReductionMultiplier: 0.95,
      timeReductionMultiplier: 0.95,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.98,
      inputSaveChance: 0.10,
    },
    requirements: [
      { resourceId: 'cash', quantity: 500 },
      { resourceId: 'handmade_cigarettes', quantity: 150 },
      { resourceId: 'simple_joints', quantity: 120 },
    ],
  },
  {
    id: 'precision_scales',
    name: 'Backroom Weigh Station',
    tier: 2,
    icon: '🏪',
    bonuses: {
      failureReductionMultiplier: 0.92,
      timeReductionMultiplier: 0.92,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.95,
      inputSaveChance: 0.15,
    },
    requirements: [
      { resourceId: 'cash', quantity: 3000 },
      { resourceId: 'premium_joints', quantity: 400 },
      { resourceId: 'pressed_hash', quantity: 300 },
    ],
  },
  {
    id: 'automated_mixer',
    name: 'Warehouse Processing Bay',
    tier: 3,
    icon: '🏗️',
    bonuses: {
      failureReductionMultiplier: 0.88,
      timeReductionMultiplier: 0.88,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.93,
      inputSaveChance: 0.20,
    },
    requirements: [
      { resourceId: 'cash', quantity: 12000 },
      { resourceId: 'artisan_lsd', quantity: 900 },
      { resourceId: 'ecstasy', quantity: 800 },
      { resourceId: 'amphetamines', quantity: 700 },
    ],
  },
  {
    id: 'cleanroom_tent',
    name: 'Cleanroom Facility',
    tier: 4,
    icon: '🧼',
    bonuses: {
      failureReductionMultiplier: 0.85,
      timeReductionMultiplier: 0.85,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.9,
      inputSaveChance: 0.25,
    },
    requirements: [
      { resourceId: 'cash', quantity: 60000 },
      { resourceId: 'diluted_cocaine', quantity: 1800 },
      { resourceId: 'basic_meth', quantity: 1600 },
      { resourceId: 'assorted_pills', quantity: 1400 },
      { resourceId: 'pure_cocaine', quantity: 800 },
    ],
  },
  {
    id: 'industrial_reactor',
    name: 'Industrial Synthesis Plant',
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
      { resourceId: 'crack', quantity: 3000 },
      { resourceId: 'crystal_meth', quantity: 2600 },
      { resourceId: 'base_heroin', quantity: 2200 },
      { resourceId: 'refined_heroin', quantity: 1600 },
      { resourceId: 'luxury_synthetics', quantity: 1200 },
    ],
  },
];
