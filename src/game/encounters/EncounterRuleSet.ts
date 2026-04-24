export type RoomTag = 'arena' | 'traversal' | 'elite' | 'reward' | 'secret' | 'boss-approach';

export interface EncounterRoomRule {
  readonly id: string;
  readonly biomeId: string;
  readonly displayName: string;
  readonly tags: readonly RoomTag[];
  readonly hazardIntensity: number;
  readonly rewardWeight: number;
}

export interface BiomeEncounterSet {
  readonly biomeId: string;
  readonly displayName: string;
  readonly sectors: number;
  readonly rooms: readonly EncounterRoomRule[];
}

export const BIOME_ENCOUNTER_SETS: readonly BiomeEncounterSet[] = [
  {
    biomeId: 'ember-ossuary',
    displayName: 'Ember Ossuary',
    sectors: 3,
    rooms: [
      { id: 'ember-nave-01', biomeId: 'ember-ossuary', displayName: 'Charred Nave', tags: ['arena'], hazardIntensity: 0.4, rewardWeight: 1 },
      { id: 'ember-furnace-02', biomeId: 'ember-ossuary', displayName: 'Furnace Walk', tags: ['arena', 'traversal'], hazardIntensity: 0.6, rewardWeight: 1.1 },
      { id: 'ember-crypt-03', biomeId: 'ember-ossuary', displayName: 'Ash Crypt', tags: ['elite'], hazardIntensity: 0.8, rewardWeight: 1.4 },
      { id: 'ember-relay-04', biomeId: 'ember-ossuary', displayName: 'Penitent Relay', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.35 }
    ]
  },
  {
    biomeId: 'moon-reservoir',
    displayName: 'Moon Reservoir',
    sectors: 3,
    rooms: [
      { id: 'moon-channel-01', biomeId: 'moon-reservoir', displayName: 'Mirror Channel', tags: ['arena'], hazardIntensity: 0.35, rewardWeight: 1 },
      { id: 'moon-vault-02', biomeId: 'moon-reservoir', displayName: 'Blue Vault', tags: ['traversal', 'arena'], hazardIntensity: 0.55, rewardWeight: 1.15 },
      { id: 'moon-breach-03', biomeId: 'moon-reservoir', displayName: 'Thirteen-Eyed Breach', tags: ['elite', 'boss-approach'], hazardIntensity: 0.9, rewardWeight: 1.5 },
      { id: 'moon-hidden-04', biomeId: 'moon-reservoir', displayName: 'Submerged Reliquary', tags: ['secret', 'reward'], hazardIntensity: 0.45, rewardWeight: 1.3 }
    ]
  }
] as const;
