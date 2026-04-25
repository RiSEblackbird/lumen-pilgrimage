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

interface RoomSeed {
  readonly slug: string;
  readonly displayName: string;
  readonly tags: readonly RoomTag[];
  readonly hazardIntensity: number;
  readonly rewardWeight: number;
}

interface BiomeSeed {
  readonly biomeId: string;
  readonly displayName: string;
  readonly sectors: number;
  readonly roomsPerSector: number;
  readonly roomPrefix: string;
  readonly startSlug: string;
  readonly rooms: readonly RoomSeed[];
}

function roomId(prefix: string, slug: string): string {
  return `${prefix}-${slug}`;
}

function buildRoomGraph(ids: readonly string[]): Record<string, readonly EncounterRouteEdge[]> {
  const graph: Record<string, readonly EncounterRouteEdge[]> = {};

  for (let index = 0; index < ids.length; index += 1) {
    const standardTarget = ids[(index + 1) % ids.length];
    const riskTarget = ids[(index + 2) % ids.length];
    const recoveryTarget = ids[(index - 1 + ids.length) % ids.length];
    const secretTarget = ids[(index + 3) % ids.length];

    graph[ids[index]] = [
      { targetRoomId: standardTarget, routeStyle: 'standard' },
      { targetRoomId: riskTarget, routeStyle: 'risk' },
      { targetRoomId: recoveryTarget, routeStyle: 'recovery' },
      { targetRoomId: secretTarget, routeStyle: 'secret' }
    ];
  }

  return graph;
}

function defineBiomeEncounterSet(seed: BiomeSeed): BiomeEncounterSet {
  const rooms = seed.rooms.map<EncounterRoomRule>((room) => ({
    id: roomId(seed.roomPrefix, room.slug),
    biomeId: seed.biomeId,
    displayName: room.displayName,
    tags: room.tags,
    hazardIntensity: room.hazardIntensity,
    rewardWeight: room.rewardWeight
  }));

  const roomIds = rooms.map((room) => room.id);

  return {
    biomeId: seed.biomeId,
    displayName: seed.displayName,
    sectors: seed.sectors,
    roomsPerSector: seed.roomsPerSector,
    startRoomId: roomId(seed.roomPrefix, seed.startSlug),
    rooms,
    roomGraph: buildRoomGraph(roomIds)
  };
}

const BIOME_ROOM_SEEDS: readonly BiomeSeed[] = [
  {
    biomeId: 'ember-ossuary',
    displayName: 'Ember Ossuary',
    sectors: 3,
    roomsPerSector: 3,
    roomPrefix: 'ember',
    startSlug: 'nave-01',
    rooms: [
      { slug: 'nave-01', displayName: 'Charred Nave', tags: ['arena'], hazardIntensity: 0.4, rewardWeight: 1 },
      { slug: 'furnace-02', displayName: 'Furnace Walk', tags: ['arena', 'traversal'], hazardIntensity: 0.58, rewardWeight: 1.1 },
      { slug: 'crypt-03', displayName: 'Ash Crypt', tags: ['elite'], hazardIntensity: 0.84, rewardWeight: 1.38 },
      { slug: 'relay-04', displayName: 'Penitent Relay', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.3 },
      { slug: 'kiln-05', displayName: 'Kiln Choir', tags: ['arena'], hazardIntensity: 0.52, rewardWeight: 1.12 },
      { slug: 'catwalk-06', displayName: 'Cinder Catwalk', tags: ['traversal'], hazardIntensity: 0.62, rewardWeight: 1.18 },
      { slug: 'vault-07', displayName: 'Sootbound Vault', tags: ['reward'], hazardIntensity: 0.46, rewardWeight: 1.24 },
      { slug: 'smolder-08', displayName: 'Smolder Lane', tags: ['arena', 'secret'], hazardIntensity: 0.66, rewardWeight: 1.2 },
      { slug: 'belfry-09', displayName: 'Belfry of Cinders', tags: ['elite', 'boss-approach'], hazardIntensity: 0.94, rewardWeight: 1.56 },
      { slug: 'altar-10', displayName: 'Ashen Altar', tags: ['reward', 'secret'], hazardIntensity: 0.54, rewardWeight: 1.34 }
    ]
  },
  {
    biomeId: 'moon-reservoir',
    displayName: 'Moon Reservoir',
    sectors: 3,
    roomsPerSector: 3,
    roomPrefix: 'moon',
    startSlug: 'channel-01',
    rooms: [
      { slug: 'channel-01', displayName: 'Mirror Channel', tags: ['arena'], hazardIntensity: 0.36, rewardWeight: 1 },
      { slug: 'vault-02', displayName: 'Blue Vault', tags: ['traversal', 'arena'], hazardIntensity: 0.54, rewardWeight: 1.12 },
      { slug: 'breach-03', displayName: 'Thirteen-Eyed Breach', tags: ['elite'], hazardIntensity: 0.86, rewardWeight: 1.4 },
      { slug: 'hidden-04', displayName: 'Submerged Reliquary', tags: ['secret', 'reward'], hazardIntensity: 0.45, rewardWeight: 1.28 },
      { slug: 'spillway-05', displayName: 'Lunar Spillway', tags: ['arena'], hazardIntensity: 0.5, rewardWeight: 1.1 },
      { slug: 'weir-06', displayName: 'Refraction Weir', tags: ['traversal'], hazardIntensity: 0.6, rewardWeight: 1.16 },
      { slug: 'cistern-07', displayName: 'Moon Cistern', tags: ['reward'], hazardIntensity: 0.42, rewardWeight: 1.22 },
      { slug: 'gallery-08', displayName: 'Tidal Gallery', tags: ['arena', 'secret'], hazardIntensity: 0.64, rewardWeight: 1.2 },
      { slug: 'gate-09', displayName: 'Lunar Gatehouse', tags: ['elite', 'boss-approach'], hazardIntensity: 0.92, rewardWeight: 1.52 },
      { slug: 'sanctum-10', displayName: 'Pool Sanctum', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.32 }
    ]
  },
  {
    biomeId: 'birch-astrarium',
    displayName: 'Birch Astrarium',
    sectors: 3,
    roomsPerSector: 3,
    roomPrefix: 'birch',
    startSlug: 'observatory-01',
    rooms: [
      { slug: 'observatory-01', displayName: 'Pollen Observatory', tags: ['arena'], hazardIntensity: 0.42, rewardWeight: 1 },
      { slug: 'rootbridge-02', displayName: 'Rootbridge Choir', tags: ['traversal', 'arena'], hazardIntensity: 0.58, rewardWeight: 1.14 },
      { slug: 'lock-03', displayName: 'Polaris Lock', tags: ['elite'], hazardIntensity: 0.88, rewardWeight: 1.42 },
      { slug: 'lore-04', displayName: 'Lumen Bark Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.5, rewardWeight: 1.3 },
      { slug: 'spire-05', displayName: 'Astral Spire', tags: ['arena'], hazardIntensity: 0.54, rewardWeight: 1.12 },
      { slug: 'crossing-06', displayName: 'Shepherd Crossing', tags: ['traversal'], hazardIntensity: 0.64, rewardWeight: 1.18 },
      { slug: 'bloom-07', displayName: 'Bloom Field Vault', tags: ['reward'], hazardIntensity: 0.48, rewardWeight: 1.24 },
      { slug: 'thicket-08', displayName: 'Whisper Thicket', tags: ['arena', 'secret'], hazardIntensity: 0.68, rewardWeight: 1.22 },
      { slug: 'ante-09', displayName: 'Bark Polaris Antechamber', tags: ['elite', 'boss-approach'], hazardIntensity: 0.95, rewardWeight: 1.56 },
      { slug: 'cathedral-10', displayName: 'Cathedral Grove', tags: ['reward', 'secret'], hazardIntensity: 0.55, rewardWeight: 1.34 }
    ]
  },
  {
    biomeId: 'obsidian-artery',
    displayName: 'Obsidian Artery',
    sectors: 3,
    roomsPerSector: 3,
    roomPrefix: 'obsidian',
    startSlug: 'vein-01',
    rooms: [
      { slug: 'vein-01', displayName: 'Split Vein Concourse', tags: ['arena'], hazardIntensity: 0.47, rewardWeight: 1.02 },
      { slug: 'shutters-02', displayName: 'Mirror Shutter Gauntlet', tags: ['traversal', 'arena'], hazardIntensity: 0.66, rewardWeight: 1.2 },
      { slug: 'sanctum-03', displayName: 'Deacon Sanctum', tags: ['elite'], hazardIntensity: 0.9, rewardWeight: 1.44 },
      { slug: 'vault-04', displayName: 'Blackglass Vault', tags: ['reward', 'secret'], hazardIntensity: 0.56, rewardWeight: 1.3 },
      { slug: 'splice-05', displayName: 'Splice Gallery', tags: ['arena'], hazardIntensity: 0.6, rewardWeight: 1.16 },
      { slug: 'prism-06', displayName: 'Prism Fault', tags: ['traversal'], hazardIntensity: 0.7, rewardWeight: 1.22 },
      { slug: 'mirrorwell-07', displayName: 'Mirrorwell Cache', tags: ['reward'], hazardIntensity: 0.52, rewardWeight: 1.26 },
      { slug: 'shardway-08', displayName: 'Shardway Crucible', tags: ['arena', 'secret'], hazardIntensity: 0.72, rewardWeight: 1.24 },
      { slug: 'axis-09', displayName: 'Split Axis Court', tags: ['elite', 'boss-approach'], hazardIntensity: 0.96, rewardWeight: 1.58 },
      { slug: 'echo-10', displayName: 'Obsidian Echo Altar', tags: ['reward', 'secret'], hazardIntensity: 0.58, rewardWeight: 1.36 }
    ]
  },
  {
    biomeId: 'dawn-foundry',
    displayName: 'Dawn Foundry',
    sectors: 3,
    roomsPerSector: 3,
    roomPrefix: 'dawn',
    startSlug: 'anvil-01',
    rooms: [
      { slug: 'anvil-01', displayName: 'Anvil Procession', tags: ['arena'], hazardIntensity: 0.44, rewardWeight: 1.04 },
      { slug: 'rails-02', displayName: 'Overcharge Rails', tags: ['traversal', 'arena'], hazardIntensity: 0.7, rewardWeight: 1.22 },
      { slug: 'gearhall-03', displayName: 'Gearhall Tribunal', tags: ['elite'], hazardIntensity: 0.92, rewardWeight: 1.46 },
      { slug: 'reliquary-04', displayName: 'Solar Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.52, rewardWeight: 1.32 },
      { slug: 'smelter-05', displayName: 'Smelter Choir', tags: ['arena'], hazardIntensity: 0.58, rewardWeight: 1.16 },
      { slug: 'gantry-06', displayName: 'Halo Gantry', tags: ['traversal'], hazardIntensity: 0.72, rewardWeight: 1.24 },
      { slug: 'forgewell-07', displayName: 'Forgewell Cache', tags: ['reward'], hazardIntensity: 0.48, rewardWeight: 1.28 },
      { slug: 'flare-08', displayName: 'Flare Crucible', tags: ['arena', 'secret'], hazardIntensity: 0.74, rewardWeight: 1.25 },
      { slug: 'core-09', displayName: 'Daybreak Core Vestibule', tags: ['elite', 'boss-approach'], hazardIntensity: 0.97, rewardWeight: 1.6 },
      { slug: 'aureate-10', displayName: 'Aureate Projection Hall', tags: ['reward', 'secret'], hazardIntensity: 0.56, rewardWeight: 1.38 }
    ]
  },
  {
    biomeId: 'broken-sun-choir',
    displayName: 'Choir of the Broken Sun',
    sectors: 4,
    roomsPerSector: 3,
    roomPrefix: 'choir',
    startSlug: 'threshold-01',
    rooms: [
      { slug: 'threshold-01', displayName: 'Cantor Threshold', tags: ['arena'], hazardIntensity: 0.6, rewardWeight: 1.08 },
      { slug: 'confluence-02', displayName: 'Confluence of Shards', tags: ['traversal', 'arena'], hazardIntensity: 0.78, rewardWeight: 1.28 },
      { slug: 'antechamber-03', displayName: 'Last Cantor Antechamber', tags: ['elite'], hazardIntensity: 0.96, rewardWeight: 1.52 },
      { slug: 'eclipse-04', displayName: 'Eclipsed Reliquary', tags: ['reward', 'secret'], hazardIntensity: 0.62, rewardWeight: 1.4 },
      { slug: 'fracture-05', displayName: 'Fracture Nave', tags: ['arena'], hazardIntensity: 0.72, rewardWeight: 1.2 },
      { slug: 'bridge-06', displayName: 'Broken Choir Bridge', tags: ['traversal'], hazardIntensity: 0.82, rewardWeight: 1.3 },
      { slug: 'vault-07', displayName: 'Canticle Vault', tags: ['reward'], hazardIntensity: 0.66, rewardWeight: 1.34 },
      { slug: 'gaol-08', displayName: 'Sunshard Gaol', tags: ['arena', 'secret'], hazardIntensity: 0.84, rewardWeight: 1.32 },
      { slug: 'chorus-09', displayName: 'Broken Chorus Gate', tags: ['elite', 'boss-approach'], hazardIntensity: 0.99, rewardWeight: 1.66 },
      { slug: 'throne-10', displayName: 'Cantor Throne Axis', tags: ['reward', 'secret'], hazardIntensity: 0.7, rewardWeight: 1.44 }
    ]
  }
] as const;

export const BIOME_ENCOUNTER_SETS: readonly BiomeEncounterSet[] = BIOME_ROOM_SEEDS.map((seed) =>
  defineBiomeEncounterSet(seed)
);
