export interface ArenaDeviceVisualPreset {
  readonly biomeId: string;
  readonly label: string;
  readonly channelWeights: {
    readonly hazard: number;
    readonly focus: number;
    readonly guard: number;
    readonly overburn: number;
  };
  readonly dominantDeviceBias: {
    readonly sweep: number;
    readonly flare: number;
    readonly caustic: number;
    readonly fog: number;
  };
  readonly sweepTarget: readonly [number, number, number];
  readonly causticTarget: readonly [number, number, number];
}

const NEUTRAL_PRESET: ArenaDeviceVisualPreset = {
  biomeId: 'default',
  label: 'Neutral arena preset',
  channelWeights: {
    hazard: 1,
    focus: 1,
    guard: 1,
    overburn: 1
  },
  dominantDeviceBias: {
    sweep: 1,
    flare: 1,
    caustic: 1,
    fog: 1
  },
  sweepTarget: [4, 1, 3],
  causticTarget: [-2, 0, 2]
};

const ARENA_DEVICE_VISUAL_PRESETS: readonly ArenaDeviceVisualPreset[] = [
  {
    biomeId: 'ember-ossuary',
    label: 'Cinder furnace pulse',
    channelWeights: { hazard: 1.28, focus: 0.64, guard: 0.85, overburn: 1.18 },
    dominantDeviceBias: { sweep: 1.25, flare: 1.3, caustic: 0.7, fog: 1.18 },
    sweepTarget: [6.2, 1.1, 1.8],
    causticTarget: [-1.6, 0.4, 2.5]
  },
  {
    biomeId: 'moon-reservoir',
    label: 'Refraction pressure lattice',
    channelWeights: { hazard: 0.8, focus: 1.32, guard: 0.72, overburn: 0.86 },
    dominantDeviceBias: { sweep: 0.86, flare: 0.82, caustic: 1.4, fog: 1.1 },
    sweepTarget: [2.4, 1.6, -4.8],
    causticTarget: [-4.2, 0.2, 4.4]
  },
  {
    biomeId: 'birch-astrarium',
    label: 'Root canopy resonance',
    channelWeights: { hazard: 0.9, focus: 1.02, guard: 1.2, overburn: 0.78 },
    dominantDeviceBias: { sweep: 1.14, flare: 0.78, caustic: 1.08, fog: 1.16 },
    sweepTarget: [3.1, 1.4, 4.5],
    causticTarget: [-3.8, 0.7, -1.8]
  },
  {
    biomeId: 'obsidian-artery',
    label: 'Split mirror weaponized lanes',
    channelWeights: { hazard: 1.12, focus: 0.84, guard: 1.34, overburn: 0.9 },
    dominantDeviceBias: { sweep: 1.34, flare: 0.92, caustic: 1.26, fog: 1.08 },
    sweepTarget: [5.4, 1.2, 5.1],
    causticTarget: [-4.9, 0.6, -2.9]
  },
  {
    biomeId: 'dawn-foundry',
    label: 'Rail overcharge bloom',
    channelWeights: { hazard: 1.16, focus: 0.72, guard: 0.94, overburn: 1.36 },
    dominantDeviceBias: { sweep: 1.18, flare: 1.42, caustic: 0.76, fog: 1.22 },
    sweepTarget: [6.8, 1.3, -0.8],
    causticTarget: [-2.4, 0.3, 3.9]
  },
  {
    biomeId: 'broken-sun-choir',
    label: 'Cantor choir collapse',
    channelWeights: { hazard: 1.12, focus: 1.22, guard: 1.06, overburn: 1.12 },
    dominantDeviceBias: { sweep: 1.42, flare: 1.28, caustic: 1.36, fog: 1.35 },
    sweepTarget: [0.6, 1.9, 6.4],
    causticTarget: [-0.5, 0.4, -4.6]
  }
] as const;

const PRESET_BY_BIOME = new Map(ARENA_DEVICE_VISUAL_PRESETS.map((preset) => [preset.biomeId, preset] as const));

export function resolveArenaDeviceVisualPreset(biomeId: string): ArenaDeviceVisualPreset {
  return PRESET_BY_BIOME.get(biomeId) ?? NEUTRAL_PRESET;
}
