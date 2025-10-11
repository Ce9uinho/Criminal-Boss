import { SmugglingTool } from '@/types/game';

export const SMUGGLING_TOOLS: SmugglingTool[] = [
  {
    id: 'hidden_compartments',
    name: 'Alley Mules',
    tier: 1,
    icon: '📦',
    bonuses: {
      timeReductionMultiplier: 0.95,
      junkReductionMultiplier: 0.95,
      itemsPerActionBonus: 0,
      rareWeightMultiplier: 1.05,
    },
    requirements: [
      { resourceId: 'cash', quantity: 500 },
      { resourceId: 'water', quantity: 80 },
      { resourceId: 'paper', quantity: 30 },
    ],
  },
  {
    id: 'bribery_network',
    name: 'Harbor Fixers',
    tier: 2,
    icon: '💼',
    bonuses: {
      timeReductionMultiplier: 0.92,
      junkReductionMultiplier: 0.9,
      itemsPerActionBonus: 0,
      rareWeightMultiplier: 1.1,
    },
    requirements: [
      { resourceId: 'cash', quantity: 3000 },
      { resourceId: 'smartphones', quantity: 40 },
      { resourceId: 'stolen_cargo', quantity: 25 },
    ],
  },
  {
    id: 'forged_routes',
    name: 'Midnight Couriers',
    tier: 3,
    icon: '🗺️',
    bonuses: {
      timeReductionMultiplier: 0.88,
      junkReductionMultiplier: 0.85,
      itemsPerActionBonus: 1,
      rareWeightMultiplier: 1.15,
    },
    requirements: [
      { resourceId: 'cash', quantity: 12000 },
      { resourceId: 'designer_bags', quantity: 50 },
      { resourceId: 'gaming_consoles', quantity: 40 },
      { resourceId: 'laptops', quantity: 30 },
    ],
  },
  {
    id: 'ghost_manifests',
    name: 'Dockside Brokers',
    tier: 4,
    icon: '🚢',
    bonuses: {
      timeReductionMultiplier: 0.85,
      junkReductionMultiplier: 0.8,
      itemsPerActionBonus: 1,
      rareWeightMultiplier: 1.2,
    },
    requirements: [
      { resourceId: 'cash', quantity: 60000 },
      { resourceId: 'gold_bars', quantity: 20 },
      { resourceId: 'drones', quantity: 15 },
      { resourceId: 'diplomatic_pouches', quantity: 10 },
    ],
  },
  {
    id: 'syndicate_clearance',
    name: 'Omerta Logistics',
    tier: 5,
    icon: '🚚',
    bonuses: {
      timeReductionMultiplier: 0.8,
      junkReductionMultiplier: 0.75,
      itemsPerActionBonus: 2,
      rareWeightMultiplier: 1.3,
    },
    requirements: [
      { resourceId: 'cash', quantity: 200000 },
      { resourceId: 'precious_metals', quantity: 25 },
      { resourceId: 'satellite_equipment', quantity: 20 },
      { resourceId: 'quantum_processors', quantity: 10 },
    ],
  },
];
