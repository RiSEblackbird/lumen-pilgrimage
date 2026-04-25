import type { BossContract, BossPhaseRule } from '../encounters/BossContracts';

interface ArenaDeviceDefinition {
  readonly id: string;
  readonly label: string;
  readonly baseIntensity: number;
}

interface ArenaDeviceRuntime {
  readonly id: string;
  readonly label: string;
  intensity: number;
}

export interface ArenaMutationSnapshot {
  readonly biomeId: string;
  readonly mutationSummary: string;
  readonly phaseTitle: string;
  readonly deviceLabel: string;
}

const DEFAULT_DEVICE_DEFS: readonly ArenaDeviceDefinition[] = [
  { id: 'choir-lattice', label: 'Choir Lattice', baseIntensity: 0.7 },
  { id: 'hazard-lane', label: 'Hazard Lane', baseIntensity: 0.6 }
];

const BIOME_DEVICE_DEFS: Record<string, readonly ArenaDeviceDefinition[]> = {
  'ember-ossuary': [
    { id: 'censer-vents', label: 'Censer Vents', baseIntensity: 0.72 },
    { id: 'cinder-rails', label: 'Cinder Rails', baseIntensity: 0.64 }
  ],
  'moon-reservoir': [
    { id: 'mirror-gates', label: 'Mirror Gates', baseIntensity: 0.7 },
    { id: 'shock-canals', label: 'Shock Canals', baseIntensity: 0.62 }
  ],
  'birch-astrarium': [
    { id: 'root-bridges', label: 'Root Bridges', baseIntensity: 0.69 },
    { id: 'spore-orbits', label: 'Spore Orbits', baseIntensity: 0.66 }
  ],
  'obsidian-artery': [
    { id: 'mirror-array', label: 'Mirror Array', baseIntensity: 0.74 },
    { id: 'slice-walls', label: 'Slice Walls', baseIntensity: 0.68 }
  ],
  'dawn-foundry': [
    { id: 'overcharge-rails', label: 'Overcharge Rails', baseIntensity: 0.76 },
    { id: 'forge-sweeps', label: 'Forge Sweeps', baseIntensity: 0.67 }
  ],
  'broken-sun-choir': [
    { id: 'cantor-spires', label: 'Cantor Spires', baseIntensity: 0.8 },
    { id: 'choir-pulse-ring', label: 'Choir Pulse Ring', baseIntensity: 0.73 }
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

  private describeDevices(): string {
    if (this.devices.length === 0) {
      return 'No arena devices active';
    }

    return this.devices.map((device) => `${device.label} ${(device.intensity * 100).toFixed(0)}%`).join(' · ');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
