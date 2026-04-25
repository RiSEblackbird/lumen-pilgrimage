import type { BossContract, BossPhaseRule } from '../encounters/BossContracts';

type ArenaEffectType = 'hazard-damage' | 'focus-drain' | 'overburn-pressure' | 'guard-tax';

interface ArenaDeviceDefinition {
  readonly id: string;
  readonly label: string;
  readonly baseIntensity: number;
  readonly effectType: ArenaEffectType;
  readonly effectRate: number;
}

interface ArenaDeviceRuntime {
  readonly id: string;
  readonly label: string;
  readonly effectType: ArenaEffectType;
  readonly effectRate: number;
  intensity: number;
}

export interface ArenaMutationSnapshot {
  readonly biomeId: string;
  readonly mutationSummary: string;
  readonly phaseTitle: string;
  readonly deviceLabel: string;
}

export interface ArenaDeviceEffectSnapshot {
  readonly biomeId: string;
  readonly phaseTitle: string;
  readonly effects: readonly {
    readonly id: string;
    readonly label: string;
    readonly effectType: ArenaEffectType;
    readonly scaledRate: number;
    readonly intensity: number;
  }[];
  readonly summary: string;
}

export interface ArenaDeviceVisualHooks {
  readonly biomeId: string;
  readonly phaseTitle: string;
  readonly channels: {
    readonly hazard: number;
    readonly focus: number;
    readonly guard: number;
    readonly overburn: number;
  };
  readonly dominantDeviceLabel: string;
  readonly visualSummary: string;
}

const DEFAULT_DEVICE_DEFS: readonly ArenaDeviceDefinition[] = [
  { id: 'choir-lattice', label: 'Choir Lattice', baseIntensity: 0.7, effectType: 'hazard-damage', effectRate: 1.2 },
  { id: 'hazard-lane', label: 'Hazard Lane', baseIntensity: 0.6, effectType: 'guard-tax', effectRate: 1.1 }
];

const BIOME_DEVICE_DEFS: Record<string, readonly ArenaDeviceDefinition[]> = {
  'ember-ossuary': [
    { id: 'censer-vents', label: 'Censer Vents', baseIntensity: 0.72, effectType: 'hazard-damage', effectRate: 2.2 },
    { id: 'cinder-rails', label: 'Cinder Rails', baseIntensity: 0.64, effectType: 'overburn-pressure', effectRate: 1.3 }
  ],
  'moon-reservoir': [
    { id: 'mirror-gates', label: 'Mirror Gates', baseIntensity: 0.7, effectType: 'focus-drain', effectRate: 1.9 },
    { id: 'shock-canals', label: 'Shock Canals', baseIntensity: 0.62, effectType: 'hazard-damage', effectRate: 1.8 }
  ],
  'birch-astrarium': [
    { id: 'root-bridges', label: 'Root Bridges', baseIntensity: 0.69, effectType: 'guard-tax', effectRate: 1.4 },
    { id: 'spore-orbits', label: 'Spore Orbits', baseIntensity: 0.66, effectType: 'focus-drain', effectRate: 1.6 }
  ],
  'obsidian-artery': [
    { id: 'mirror-array', label: 'Mirror Array', baseIntensity: 0.74, effectType: 'guard-tax', effectRate: 1.7 },
    { id: 'slice-walls', label: 'Slice Walls', baseIntensity: 0.68, effectType: 'hazard-damage', effectRate: 2.1 }
  ],
  'dawn-foundry': [
    { id: 'overcharge-rails', label: 'Overcharge Rails', baseIntensity: 0.76, effectType: 'overburn-pressure', effectRate: 1.9 },
    { id: 'forge-sweeps', label: 'Forge Sweeps', baseIntensity: 0.67, effectType: 'hazard-damage', effectRate: 2 }
  ],
  'broken-sun-choir': [
    { id: 'cantor-spires', label: 'Cantor Spires', baseIntensity: 0.8, effectType: 'focus-drain', effectRate: 2.4 },
    { id: 'choir-pulse-ring', label: 'Choir Pulse Ring', baseIntensity: 0.73, effectType: 'guard-tax', effectRate: 1.9 }
  ]
};

export class ArenaMutationDirector {
  private biomeId = 'default';
  private devices: ArenaDeviceRuntime[] = [];
  private summary = 'Arena stable';
  private phaseTitle = 'No phase';
  private pulseTimer = 0;

  enterContract(contract: BossContract, phaseRule: BossPhaseRule): void {
    this.biomeId = contract.biomeId;
    const defs = BIOME_DEVICE_DEFS[this.biomeId] ?? DEFAULT_DEVICE_DEFS;
    this.devices = defs.map((def) => ({
      id: def.id,
      label: def.label,
      effectType: def.effectType,
      effectRate: def.effectRate,
      intensity: def.baseIntensity
    }));
    this.applyPhaseRule(phaseRule);
    this.pulseTimer = 0;
  }

  stop(): void {
    this.biomeId = 'default';
    this.devices = [];
    this.summary = 'Arena stable';
    this.phaseTitle = 'No phase';
    this.pulseTimer = 0;
  }

  applyPhaseRule(phaseRule: BossPhaseRule): void {
    this.summary = phaseRule.arenaMutationSummary;
    this.phaseTitle = phaseRule.title;
    const pressureScalar =
      1 +
      (1 - phaseRule.attackIntervalMultiplier) * 0.6 +
      (1 - phaseRule.telegraphLeadMultiplier) * 0.4 +
      Math.min(phaseRule.ambientHazardDamagePerSecond / 6, 0.35);

    this.devices = this.devices.map((device, index) => {
      const phaseWeight = 1 + phaseRule.index * 0.12 + index * 0.05;
      return {
        ...device,
        intensity: this.clamp(device.intensity * phaseWeight * pressureScalar, 0.15, 1.95)
      };
    });
  }

  tick(deltaSeconds: number): string | null {
    if (this.devices.length === 0) {
      return null;
    }

    this.pulseTimer += deltaSeconds;
    if (this.pulseTimer < 4) {
      return null;
    }

    this.pulseTimer = 0;
    const hottest = this.devices.reduce((max, device) => (device.intensity > max.intensity ? device : max), this.devices[0]);
    return `${hottest.label} pulsing (${(hottest.intensity * 100).toFixed(0)}%)`;
  }

  snapshot(): ArenaMutationSnapshot {
    return {
      biomeId: this.biomeId,
      mutationSummary: this.summary,
      phaseTitle: this.phaseTitle,
      deviceLabel: this.describeDevices()
    };
  }

  effectSnapshot(): ArenaDeviceEffectSnapshot {
    const effects = this.devices.map((device) => ({
      id: device.id,
      label: device.label,
      effectType: device.effectType,
      scaledRate: device.effectRate * device.intensity,
      intensity: device.intensity
    }));

    return {
      biomeId: this.biomeId,
      phaseTitle: this.phaseTitle,
      effects,
      summary: this.describeEffects(effects)
    };
  }

  visualHooksSnapshot(): ArenaDeviceVisualHooks {
    const effectSnapshot = this.effectSnapshot();
    let hazard = 0;
    let focus = 0;
    let guard = 0;
    let overburn = 0;
    let dominantLabel = 'No arena devices active';
    let dominantIntensity = 0;

    for (const effect of effectSnapshot.effects) {
      const normalized = this.clamp(effect.intensity / 1.95, 0, 1);
      if (effect.intensity > dominantIntensity) {
        dominantIntensity = effect.intensity;
        dominantLabel = effect.label;
      }

      if (effect.effectType === 'hazard-damage') {
        hazard = Math.max(hazard, normalized);
      } else if (effect.effectType === 'focus-drain') {
        focus = Math.max(focus, normalized);
      } else if (effect.effectType === 'guard-tax') {
        guard = Math.max(guard, normalized);
      } else if (effect.effectType === 'overburn-pressure') {
        overburn = Math.max(overburn, normalized);
      }
    }

    const channels = {
      hazard: Number(hazard.toFixed(2)),
      focus: Number(focus.toFixed(2)),
      guard: Number(guard.toFixed(2)),
      overburn: Number(overburn.toFixed(2))
    };

    return {
      biomeId: this.biomeId,
      phaseTitle: this.phaseTitle,
      channels,
      dominantDeviceLabel: dominantLabel,
      visualSummary: `Arena Visuals H${Math.round(channels.hazard * 100)} F${Math.round(channels.focus * 100)} G${Math.round(channels.guard * 100)} O${Math.round(channels.overburn * 100)} · ${dominantLabel}`
    };
  }

  private describeDevices(): string {
    if (this.devices.length === 0) {
      return 'No arena devices active';
    }

    return this.devices.map((device) => `${device.label} ${(device.intensity * 100).toFixed(0)}%`).join(' · ');
  }

  private describeEffects(effects: ArenaDeviceEffectSnapshot['effects']): string {
    if (effects.length === 0) {
      return 'No arena effects active';
    }

    return effects
      .map((effect) => `${effect.label} ${this.effectTypeLabel(effect.effectType)} ${effect.scaledRate.toFixed(1)}/s`)
      .join(' · ');
  }

  private effectTypeLabel(effectType: ArenaEffectType): string {
    switch (effectType) {
      case 'hazard-damage':
        return 'hazard';
      case 'focus-drain':
        return 'focus';
      case 'overburn-pressure':
        return 'overburn';
      case 'guard-tax':
        return 'guard';
      default:
        return 'effect';
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
