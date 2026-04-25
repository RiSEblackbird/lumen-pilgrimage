import type { RouteStyle } from '../encounters/EncounterRuleSet';

export type RewardTier = 'standard' | 'elevated' | 'mythic';

export interface LootEntry {
  readonly relicId: string;
  readonly weight: number;
}

export interface LootTableDef {
  readonly id: string;
  readonly biomeId: string;
  readonly routeStyles: readonly RouteStyle[];
  readonly rewardTier: RewardTier;
  readonly entries: readonly LootEntry[];
}

export const LOOT_TABLES: readonly LootTableDef[] = [
  {
    id: 'global-standard',
    biomeId: 'any',
    routeStyles: ['standard', 'recovery', 'secret'],
    rewardTier: 'standard',
    entries: [
      { relicId: 'parry-ember-ring', weight: 5 },
      { relicId: 'dash-furnace-spine', weight: 5 },
      { relicId: 'moonbreak-prayer', weight: 4 },
      { relicId: 'lumen-votive', weight: 5 },
      { relicId: 'ward-carillon', weight: 4 },
      { relicId: 'hymn-of-ash', weight: 4 },
      { relicId: 'veil-thread', weight: 5 },
      { relicId: 'anchor-chime', weight: 3 }
    ]
  },
  {
    id: 'global-risk',
    biomeId: 'any',
    routeStyles: ['risk'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'shock-ink-script', weight: 4 },
      { relicId: 'overburn-cinder-trail', weight: 4 },
      { relicId: 'cathedral-fuse', weight: 3 },
      { relicId: 'penitent-spike', weight: 3 },
      { relicId: 'null-chalice', weight: 3 },
      { relicId: 'mirror-wake', weight: 3 },
      { relicId: 'sunshard-buckle', weight: 3 },
      { relicId: 'thorned-litany', weight: 3 },
      { relicId: 'covenant-gear', weight: 2 },
      { relicId: 'oracle-needle', weight: 1 }
    ]
  },
  {
    id: 'global-mythic',
    biomeId: 'any',
    routeStyles: ['risk', 'secret'],
    rewardTier: 'mythic',
    entries: [
      { relicId: 'bloodglass-resonator', weight: 2 },
      { relicId: 'oracle-needle', weight: 2 },
      { relicId: 'choir-axis', weight: 2 },
      { relicId: 'saint-glass-node', weight: 1 },
      { relicId: 'executor-seal', weight: 1 }
    ]
  },
  {
    id: 'ember-ossuary-elevated',
    biomeId: 'ember-ossuary',
    routeStyles: ['risk', 'secret'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'parry-ember-ring', weight: 4 },
      { relicId: 'dash-furnace-spine', weight: 4 },
      { relicId: 'overburn-cinder-trail', weight: 4 },
      { relicId: 'cathedral-fuse', weight: 3 },
      { relicId: 'grave-censer', weight: 4 },
      { relicId: 'sunshard-buckle', weight: 2 }
    ]
  },
  {
    id: 'moon-reservoir-elevated',
    biomeId: 'moon-reservoir',
    routeStyles: ['standard', 'secret'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'moonbreak-prayer', weight: 4 },
      { relicId: 'shock-ink-script', weight: 3 },
      { relicId: 'null-chalice', weight: 3 },
      { relicId: 'mirror-wake', weight: 3 },
      { relicId: 'saint-glass-node', weight: 1 }
    ]
  },
  {
    id: 'birch-astrarium-elevated',
    biomeId: 'birch-astrarium',
    routeStyles: ['standard', 'risk', 'secret'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'hymn-of-ash', weight: 3 },
      { relicId: 'oracle-needle', weight: 2 },
      { relicId: 'thorned-litany', weight: 4 },
      { relicId: 'anchor-chime', weight: 3 },
      { relicId: 'choir-axis', weight: 2 }
    ]
  },
  {
    id: 'obsidian-artery-elevated',
    biomeId: 'obsidian-artery',
    routeStyles: ['risk', 'secret'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'bloodglass-resonator', weight: 2 },
      { relicId: 'mirror-wake', weight: 4 },
      { relicId: 'covenant-gear', weight: 3 },
      { relicId: 'choir-axis', weight: 2 },
      { relicId: 'executor-seal', weight: 1 }
    ]
  },
  {
    id: 'dawn-foundry-elevated',
    biomeId: 'dawn-foundry',
    routeStyles: ['standard', 'risk'],
    rewardTier: 'elevated',
    entries: [
      { relicId: 'cathedral-fuse', weight: 3 },
      { relicId: 'sunshard-buckle', weight: 4 },
      { relicId: 'covenant-gear', weight: 3 },
      { relicId: 'grave-censer', weight: 3 },
      { relicId: 'executor-seal', weight: 1 }
    ]
  },
  {
    id: 'broken-sun-choir-mythic',
    biomeId: 'broken-sun-choir',
    routeStyles: ['risk', 'secret'],
    rewardTier: 'mythic',
    entries: [
      { relicId: 'bloodglass-resonator', weight: 2 },
      { relicId: 'oracle-needle', weight: 2 },
      { relicId: 'choir-axis', weight: 3 },
      { relicId: 'saint-glass-node', weight: 2 },
      { relicId: 'executor-seal', weight: 2 }
    ]
  }
] as const;
