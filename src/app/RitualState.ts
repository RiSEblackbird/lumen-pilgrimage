export type RitualDomain =
  | 'candle-cave'
  | 'moon-pool'
  | 'birch-star-garden'
  | 'obsidian-corridor'
  | 'dawn-altar';

export interface RitualDomainConfig {
  readonly fogColor: number;
  readonly kelvin: number;
  readonly particleHue: number;
  readonly probeIntensity: number;
  readonly audioLabel: string;
}

export const RITUAL_ORDER: RitualDomain[] = [
  'candle-cave',
  'moon-pool',
  'birch-star-garden',
  'obsidian-corridor',
  'dawn-altar'
];

export const RITUAL_CONFIG: Record<RitualDomain, RitualDomainConfig> = {
  'candle-cave': { fogColor: 0x20150f, kelvin: 1850, particleHue: 0.08, probeIntensity: 0.75, audioLabel: 'ember-drone' },
  'moon-pool': { fogColor: 0x0b1d35, kelvin: 4100, particleHue: 0.58, probeIntensity: 0.95, audioLabel: 'lunar-bowl' },
  'birch-star-garden': { fogColor: 0x101825, kelvin: 5200, particleHue: 0.12, probeIntensity: 1.1, audioLabel: 'forest-choir' },
  'obsidian-corridor': { fogColor: 0x0a0a11, kelvin: 3200, particleHue: 0.75, probeIntensity: 0.85, audioLabel: 'basalt-pulse' },
  'dawn-altar': { fogColor: 0x312811, kelvin: 6400, particleHue: 0.16, probeIntensity: 1.25, audioLabel: 'solar-harmonics' }
};

export class RitualState {
  private index = 0;

  get currentDomain(): RitualDomain {
    return RITUAL_ORDER[this.index];
  }

  get completedDomains(): number {
    return this.index;
  }

  activate(domain: RitualDomain): RitualDomain {
    const targetIndex = RITUAL_ORDER.indexOf(domain);
    if (targetIndex === -1) {
      return this.currentDomain;
    }

    this.index = Math.max(this.index, targetIndex);
    return this.currentDomain;
  }

  isDawnUnlocked(): boolean {
    return this.index >= RITUAL_ORDER.length - 1;
  }
}
