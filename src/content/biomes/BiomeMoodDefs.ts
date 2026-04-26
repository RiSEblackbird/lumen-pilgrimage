export type BiomeMoodId =
  | 'pilgrims-belfry'
  | 'ember-ossuary'
  | 'moon-reservoir'
  | 'birch-astrarium'
  | 'obsidian-artery'
  | 'dawn-foundry'
  | 'broken-sun-choir';

export interface BiomeMoodDefinition {
  readonly id: BiomeMoodId;
  readonly label: string;
  readonly backgroundHex: number;
  readonly fogHex: number;
  readonly fogDensity: number;
  readonly keyLightHex: number;
  readonly keyLightIntensity: number;
  readonly fillLightHex: number;
  readonly fillLightIntensity: number;
  readonly transition: BiomeTransitionProfile;
}

export interface BiomeTransitionProfile {
  readonly sweepBoost: number;
  readonly flareBoost: number;
  readonly causticBoost: number;
  readonly fogPulse: number;
  readonly beatSeconds: number;
}

export const BIOME_MOOD_DEFS: readonly BiomeMoodDefinition[] = [
  {
    id: 'pilgrims-belfry',
    label: 'Pilgrim\'s Belfry Nexus',
    backgroundHex: 0x06080f,
    fogHex: 0x111728,
    fogDensity: 0.03,
    keyLightHex: 0xffe4bc,
    keyLightIntensity: 1.1,
    fillLightHex: 0x6f8fb8,
    fillLightIntensity: 0.5,
    transition: { sweepBoost: 0.35, flareBoost: 0.28, causticBoost: 0.22, fogPulse: 0.003, beatSeconds: 2.6 }
  },
  {
    id: 'ember-ossuary',
    label: 'Ember Ossuary Furnace Nave',
    backgroundHex: 0x110805,
    fogHex: 0x29120b,
    fogDensity: 0.041,
    keyLightHex: 0xff9b5d,
    keyLightIntensity: 1.35,
    fillLightHex: 0x8e5238,
    fillLightIntensity: 0.65,
    transition: { sweepBoost: 0.72, flareBoost: 0.88, causticBoost: 0.35, fogPulse: 0.006, beatSeconds: 3.2 }
  },
  {
    id: 'moon-reservoir',
    label: 'Moon Reservoir Mirror Vault',
    backgroundHex: 0x050b15,
    fogHex: 0x12253b,
    fogDensity: 0.034,
    keyLightHex: 0xa6d3ff,
    keyLightIntensity: 1.22,
    fillLightHex: 0x5178a9,
    fillLightIntensity: 0.58,
    transition: { sweepBoost: 0.5, flareBoost: 0.44, causticBoost: 0.86, fogPulse: 0.005, beatSeconds: 3 }
  },
  {
    id: 'birch-astrarium',
    label: 'Birch Astrarium Spore Choir',
    backgroundHex: 0x080f0b,
    fogHex: 0x1a3527,
    fogDensity: 0.036,
    keyLightHex: 0xd8f8c7,
    keyLightIntensity: 1.19,
    fillLightHex: 0x5d9a68,
    fillLightIntensity: 0.52,
    transition: { sweepBoost: 0.58, flareBoost: 0.42, causticBoost: 0.52, fogPulse: 0.004, beatSeconds: 2.8 }
  },
  {
    id: 'obsidian-artery',
    label: 'Obsidian Artery Split Reflection',
    backgroundHex: 0x08070d,
    fogHex: 0x1a1230,
    fogDensity: 0.039,
    keyLightHex: 0xc0a4ff,
    keyLightIntensity: 1.28,
    fillLightHex: 0x5a4793,
    fillLightIntensity: 0.55,
    transition: { sweepBoost: 0.66, flareBoost: 0.52, causticBoost: 0.78, fogPulse: 0.005, beatSeconds: 2.9 }
  },
  {
    id: 'dawn-foundry',
    label: 'Dawn Foundry Daybreak Forge',
    backgroundHex: 0x140d05,
    fogHex: 0x382314,
    fogDensity: 0.04,
    keyLightHex: 0xffcf71,
    keyLightIntensity: 1.4,
    fillLightHex: 0xae7b37,
    fillLightIntensity: 0.66,
    transition: { sweepBoost: 0.78, flareBoost: 0.76, causticBoost: 0.36, fogPulse: 0.006, beatSeconds: 3.1 }
  },
  {
    id: 'broken-sun-choir',
    label: 'Choir of the Broken Sun',
    backgroundHex: 0x0d060f,
    fogHex: 0x311735,
    fogDensity: 0.046,
    keyLightHex: 0xff8be5,
    keyLightIntensity: 1.45,
    fillLightHex: 0x8452a5,
    fillLightIntensity: 0.68,
    transition: { sweepBoost: 0.92, flareBoost: 0.85, causticBoost: 0.93, fogPulse: 0.007, beatSeconds: 3.4 }
  }
] as const;

const BIOME_MOOD_BY_ID: ReadonlyMap<BiomeMoodId, BiomeMoodDefinition> = new Map(BIOME_MOOD_DEFS.map((entry) => [entry.id, entry] as const));

export function resolveBiomeMood(id: string): BiomeMoodDefinition {
  const normalized = id.trim().toLowerCase() as BiomeMoodId;
  return BIOME_MOOD_BY_ID.get(normalized) ?? BIOME_MOOD_BY_ID.get('pilgrims-belfry')!;
}
