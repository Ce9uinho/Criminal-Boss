import { DrugTool } from '@/types/game';

export const INVESTIGATION_LAB_TOOLS: DrugTool[] = [
  {
    id: 'lab_set_basic',
    name: 'Basic Glassware Kit',
    tier: 1,
    icon: '🧪',
    bonuses: {
      failureReductionMultiplier: 0.95,
      timeReductionMultiplier: 0.95,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.98,
      inputSaveChance: 0.20,
    },
    requirements: [
      { resourceId: 'cash', quantity: 500 },
      { resourceId: 'premium_water', quantity: 50 },
      { resourceId: 'premium_alcohol', quantity: 30 },
    ],
  },
  {
    id: 'lab_set_precision',
    name: 'Analytical Bench Setup',
    tier: 2,
    icon: '⚖️',
    bonuses: {
      failureReductionMultiplier: 0.92,
      timeReductionMultiplier: 0.92,
      outputMultiplier: 1,
      inputReductionMultiplier: 0.95,
      inputSaveChance: 0.40,
    },
    requirements: [
      { resourceId: 'cash', quantity: 3000 },
      { resourceId: 'premium_grapes', quantity: 120 },
      { resourceId: 'premium_herbs', quantity: 100 },
    ],
  },
  {
    id: 'lab_set_automated',
    name: 'Automated Reactor Module',
    tier: 3,
    icon: '⚗️',
    bonuses: {
      failureReductionMultiplier: 0.88,
      timeReductionMultiplier: 0.88,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.93,
      inputSaveChance: 0.60,
    },
    requirements: [
      { resourceId: 'cash', quantity: 12000 },
      { resourceId: 'premium_chemical', quantity: 180 },
      { resourceId: 'premium_solvent', quantity: 160 },
    ],
  },
  {
    id: 'lab_set_cleanroom',
    name: 'ISO-7 Cleanroom Suite',
    tier: 4,
    icon: '🧼',
    bonuses: {
      failureReductionMultiplier: 0.85,
      timeReductionMultiplier: 0.85,
      outputMultiplier: 2,
      inputReductionMultiplier: 0.9,
      inputSaveChance: 0.80,
    },
    requirements: [
      { resourceId: 'cash', quantity: 60000 },
      { resourceId: 'premium_catalyst', quantity: 220 },
      { resourceId: 'premium_plant', quantity: 200 },
    ],
  },
  {
    id: 'lab_set_industrial',
    name: 'Pilot Plant Scale-Up',
    tier: 5,
    icon: '🏭',
    bonuses: {
      failureReductionMultiplier: 0.8,
      timeReductionMultiplier: 0.8,
      outputMultiplier: 3,
      inputReductionMultiplier: 0.85,
      inputSaveChance: 1.00,
    },
    requirements: [
      { resourceId: 'cash', quantity: 200000 },
      { resourceId: 'premium_catalyst', quantity: 400 },
      { resourceId: 'premium_chemical', quantity: 380 },
      { resourceId: 'premium_solvent', quantity: 360 },
    ],
  },
];
