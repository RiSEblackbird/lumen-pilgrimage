export type RoomTag = 'arena' | 'traversal' | 'elite' | 'reward' | 'secret' | 'boss-approach';
export type RouteStyle = 'standard' | 'risk' | 'recovery' | 'secret';

export interface EncounterRoomRule {
  readonly id: string;
  readonly biomeId: string;
  readonly displayName: string;
  readonly tags: readonly RoomTag[];
  readonly hazardIntensity: number;
  readonly rewardWeight: number;
}

export interface EncounterRouteEdge {
  readonly targetRoomId: string;
  readonly routeStyle: RouteStyle;
}

export interface BiomeEncounterSet {
  readonly biomeId: string;
  readonly displayName: string;
  readonly sectors: number;
  readonly roomsPerSector: number;
  readonly startRoomId: string;
  readonly rooms: readonly EncounterRoomRule[];
  readonly roomGraph: Readonly<Record<string, readonly EncounterRouteEdge[]>>;
}

export const BIOME_ENCOUNTER_SETS: readonly BiomeEncounterSet[] = [
  {
    biomeId: 'ember-ossuary',
    displayName: 'Ember Ossuary',
    sectors: 3,
    roomsPerSector: 3,
    startRoomId: 'ember-nave-01',
    rooms: [
      { id: 'ember-nave-01', biomeId: 'ember-ossuary', displayName: 'Charred Nave', tags: ['arena'], hazardIntensity: 0.4, rewardWeight: 1 },
      { id: 'ember-furnace-02', biomeId: 'ember-ossuary', displayName: 'Furnace Walk', tags: ['arena', 'traversal'], hazardIntensity: 0.6, rewardWeight: 1.1 },
      { id: 'ember-crypt-03', biomeId: 'ember-ossuary', displayName: 'Ash Crypt', tags: ['elite'], hazardIntensity: 0.8, rewardWeight: 1.4 },
      { id: 'ember-relay-04', biomeId: 'ember-ossuary', displayName: 'Penitent Relay', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.35 }
    ],
    roomGraph: {
      'ember-nave-01': [
        { targetRoomId: 'ember-furnace-02', routeStyle: 'standard' },
        { targetRoomId: 'ember-crypt-03', routeStyle: 'risk' }
      ],
      'ember-furnace-02': [
        { targetRoomId: 'ember-relay-04', routeStyle: 'standard' },
        { targetRoomId: 'ember-nave-01', routeStyle: 'recovery' }
      ],
      'ember-crypt-03': [
        { targetRoomId: 'ember-relay-04', routeStyle: 'standard' },
        { targetRoomId: 'ember-furnace-02', routeStyle: 'recovery' }
      ],
      'ember-relay-04': [
        { targetRoomId: 'ember-nave-01', routeStyle: 'standard' },
        { targetRoomId: 'ember-crypt-03', routeStyle: 'secret' }
      ]
    }
  },
  {
    biomeId: 'moon-reservoir',
    displayName: 'Moon Reservoir',
    sectors: 3,
    roomsPerSector: 3,
    startRoomId: 'moon-channel-01',
    rooms: [
      { id: 'moon-channel-01', biomeId: 'moon-reservoir', displayName: 'Mirror Channel', tags: ['arena'], hazardIntensity: 0.35, rewardWeight: 1 },
      { id: 'moon-vault-02', biomeId: 'moon-reservoir', displayName: 'Blue Vault', tags: ['traversal', 'arena'], hazardIntensity: 0.55, rewardWeight: 1.15 },
      { id: 'moon-breach-03', biomeId: 'moon-reservoir', displayName: 'Thirteen-Eyed Breach', tags: ['elite', 'boss-approach'], hazardIntensity: 0.9, rewardWeight: 1.5 },
      { id: 'moon-hidden-04', biomeId: 'moon-reservoir', displayName: 'Submerged Reliquary', tags: ['secret', 'reward'], hazardIntensity: 0.45, rewardWeight: 1.3 }
    ],
    roomGraph: {
      'moon-channel-01': [
        { targetRoomId: 'moon-vault-02', routeStyle: 'standard' },
        { targetRoomId: 'moon-breach-03', routeStyle: 'risk' }
      ],
      'moon-vault-02': [
        { targetRoomId: 'moon-hidden-04', routeStyle: 'standard' },
        { targetRoomId: 'moon-channel-01', routeStyle: 'recovery' }
      ],
      'moon-breach-03': [
        { targetRoomId: 'moon-hidden-04', routeStyle: 'secret' },
        { targetRoomId: 'moon-vault-02', routeStyle: 'recovery' }
      ],
      'moon-hidden-04': [
        { targetRoomId: 'moon-channel-01', routeStyle: 'standard' },
        { targetRoomId: 'moon-breach-03', routeStyle: 'risk' }
      ]
    }
  },
  {
    biomeId: 'birch-astrarium',
    displayName: 'Birch Astrarium',
    sectors: 3,
    roomsPerSector: 3,
    startRoomId: 'birch-observatory-01',
    rooms: [
      { id: 'birch-observatory-01', biomeId: 'birch-astrarium', displayName: 'Pollen Observatory', tags: ['arena'], hazardIntensity: 0.42, rewardWeight: 1 },
      { id: 'birch-rootbridge-02', biomeId: 'birch-astrarium', displayName: 'Rootbridge Choir', tags: ['traversal', 'arena'], hazardIntensity: 0.58, rewardWeight: 1.16 },
      { id: 'birch-lock-03', biomeId: 'birch-astrarium', displayName: 'Polaris Lock', tags: ['elite', 'boss-approach'], hazardIntensity: 0.88, rewardWeight: 1.48 },
      { id: 'birch-lore-04', biomeId: 'birch-astrarium', displayName: 'Lumen Bark Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.34 }
    ],
    roomGraph: {
      'birch-observatory-01': [
        { targetRoomId: 'birch-rootbridge-02', routeStyle: 'standard' },
        { targetRoomId: 'birch-lock-03', routeStyle: 'risk' }
      ],
      'birch-rootbridge-02': [
        { targetRoomId: 'birch-lore-04', routeStyle: 'standard' },
        { targetRoomId: 'birch-observatory-01', routeStyle: 'recovery' }
      ],
      'birch-lock-03': [
        { targetRoomId: 'birch-lore-04', routeStyle: 'secret' },
        { targetRoomId: 'birch-rootbridge-02', routeStyle: 'recovery' }
      ],
      'birch-lore-04': [
        { targetRoomId: 'birch-observatory-01', routeStyle: 'standard' },
        { targetRoomId: 'birch-lock-03', routeStyle: 'risk' }
      ]
    }
  },
  {
    biomeId: 'obsidian-artery',
    displayName: 'Obsidian Artery',
    sectors: 3,
    roomsPerSector: 3,
    startRoomId: 'obsidian-vein-01',
    rooms: [
      { id: 'obsidian-vein-01', biomeId: 'obsidian-artery', displayName: 'Split Vein Concourse', tags: ['arena'], hazardIntensity: 0.47, rewardWeight: 1.02 },
      { id: 'obsidian-shutters-02', biomeId: 'obsidian-artery', displayName: 'Mirror Shutter Gauntlet', tags: ['traversal', 'arena'], hazardIntensity: 0.66, rewardWeight: 1.2 },
      { id: 'obsidian-sanctum-03', biomeId: 'obsidian-artery', displayName: 'Deacon Sanctum', tags: ['elite', 'boss-approach'], hazardIntensity: 0.92, rewardWeight: 1.52 },
      { id: 'obsidian-vault-04', biomeId: 'obsidian-artery', displayName: 'Blackglass Vault', tags: ['reward', 'secret'], hazardIntensity: 0.56, rewardWeight: 1.36 }
    ],
    roomGraph: {
      'obsidian-vein-01': [
        { targetRoomId: 'obsidian-shutters-02', routeStyle: 'standard' },
        { targetRoomId: 'obsidian-sanctum-03', routeStyle: 'risk' }
      ],
      'obsidian-shutters-02': [
        { targetRoomId: 'obsidian-vault-04', routeStyle: 'standard' },
        { targetRoomId: 'obsidian-vein-01', routeStyle: 'recovery' }
      ],
      'obsidian-sanctum-03': [
        { targetRoomId: 'obsidian-vault-04', routeStyle: 'secret' },
        { targetRoomId: 'obsidian-shutters-02', routeStyle: 'recovery' }
      ],
      'obsidian-vault-04': [
        { targetRoomId: 'obsidian-vein-01', routeStyle: 'standard' },
        { targetRoomId: 'obsidian-sanctum-03', routeStyle: 'risk' }
      ]
    }
  },
  {
    biomeId: 'dawn-foundry',
    displayName: 'Dawn Foundry',
    sectors: 3,
    roomsPerSector: 3,
    startRoomId: 'dawn-anvil-01',
    rooms: [
      { id: 'dawn-anvil-01', biomeId: 'dawn-foundry', displayName: 'Anvil Procession', tags: ['arena'], hazardIntensity: 0.44, rewardWeight: 1.04 },
      { id: 'dawn-rails-02', biomeId: 'dawn-foundry', displayName: 'Overcharge Rails', tags: ['traversal', 'arena'], hazardIntensity: 0.7, rewardWeight: 1.22 },
      { id: 'dawn-gearhall-03', biomeId: 'dawn-foundry', displayName: 'Gearhall Tribunal', tags: ['elite', 'boss-approach'], hazardIntensity: 0.94, rewardWeight: 1.56 },
      { id: 'dawn-reliquary-04', biomeId: 'dawn-foundry', displayName: 'Solar Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.52, rewardWeight: 1.38 }
    ],
    roomGraph: {
      'dawn-anvil-01': [
        { targetRoomId: 'dawn-rails-02', routeStyle: 'standard' },
        { targetRoomId: 'dawn-gearhall-03', routeStyle: 'risk' }
      ],
      'dawn-rails-02': [
        { targetRoomId: 'dawn-reliquary-04', routeStyle: 'standard' },
        { targetRoomId: 'dawn-anvil-01', routeStyle: 'recovery' }
      ],
      'dawn-gearhall-03': [
        { targetRoomId: 'dawn-reliquary-04', routeStyle: 'secret' },
        { targetRoomId: 'dawn-rails-02', routeStyle: 'recovery' }
      ],
      'dawn-reliquary-04': [
        { targetRoomId: 'dawn-anvil-01', routeStyle: 'standard' },
        { targetRoomId: 'dawn-gearhall-03', routeStyle: 'risk' }
      ]
    }
  },
  {
    biomeId: 'broken-sun-choir',
    displayName: 'Choir of the Broken Sun',
    sectors: 4,
    roomsPerSector: 3,
    startRoomId: 'choir-threshold-01',
    rooms: [
      { id: 'choir-threshold-01', biomeId: 'broken-sun-choir', displayName: 'Cantor Threshold', tags: ['arena'], hazardIntensity: 0.6, rewardWeight: 1.08 },
      { id: 'choir-confluence-02', biomeId: 'broken-sun-choir', displayName: 'Confluence of Shards', tags: ['traversal', 'arena'], hazardIntensity: 0.78, rewardWeight: 1.28 },
      { id: 'choir-antechamber-03', biomeId: 'broken-sun-choir', displayName: 'Last Cantor Antechamber', tags: ['elite', 'boss-approach'], hazardIntensity: 0.98, rewardWeight: 1.64 },
      { id: 'choir-eclipse-04', biomeId: 'broken-sun-choir', displayName: 'Eclipsed Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.62, rewardWeight: 1.42 }
    ],
    roomGraph: {
      'choir-threshold-01': [
        { targetRoomId: 'choir-confluence-02', routeStyle: 'standard' },
        { targetRoomId: 'choir-antechamber-03', routeStyle: 'risk' }
      ],
      'choir-confluence-02': [
        { targetRoomId: 'choir-eclipse-04', routeStyle: 'standard' },
        { targetRoomId: 'choir-threshold-01', routeStyle: 'recovery' }
      ],
      'choir-antechamber-03': [
        { targetRoomId: 'choir-eclipse-04', routeStyle: 'secret' },
        { targetRoomId: 'choir-confluence-02', routeStyle: 'recovery' }
      ],
      'choir-eclipse-04': [
        { targetRoomId: 'choir-threshold-01', routeStyle: 'standard' },
        { targetRoomId: 'choir-antechamber-03', routeStyle: 'risk' }
      ]
    }
  }
] as const;
