import type { BossContract, BossPhaseRule } from '../encounters/BossContracts';
import type { ArenaMutationSnapshot } from './ArenaMutationDirector';

interface BiomeReactiveProfile {
  readonly motif: string;
  readonly pulseVerb: string;
  readonly hazardBus: string;
}

export interface BossArenaAudioSnapshot {
  readonly biomeId: string;
  readonly motif: string;
  readonly mixLabel: string;
  readonly pulseCallout: string;
}

const DEFAULT_PROFILE: BiomeReactiveProfile = {
  motif: 'broken-sun drones',
  pulseVerb: 'choir pulse',
  hazardBus: 'cathedral danger bus'
};

const BIOME_AUDIO_PROFILES: Record<string, BiomeReactiveProfile> = {
  'ember-ossuary': {
    motif: 'ember choir + furnace drums',
    pulseVerb: 'censer thrum',
    hazardBus: 'cinder hazard bus'
  },
  'moon-reservoir': {
    motif: 'glass bell + moon bass',
    pulseVerb: 'refraction swell',
    hazardBus: 'undertow hazard bus'
  },
  'birch-astrarium': {
    motif: 'pollen strings + bark choir',
    pulseVerb: 'root resonance',
    hazardBus: 'astrarium hazard bus'
  },
  'obsidian-artery': {
    motif: 'blackglass ticks + split brass',
    pulseVerb: 'mirror crack pulse',
    hazardBus: 'artery hazard bus'
  },
  'dawn-foundry': {
    motif: 'forge brass + gear choir',
    pulseVerb: 'rail overcharge swell',
    hazardBus: 'foundry hazard bus'
  },
  'broken-sun-choir': {
    motif: 'last cantor chant + catastrophic low choir',
    pulseVerb: 'cantor verdict pulse',
    hazardBus: 'broken sun hazard bus'
  }
};

export class BossArenaAudioDirector {
  private biomeId = 'default';
  private profile: BiomeReactiveProfile = DEFAULT_PROFILE;
  private phaseTitle = 'No phase';
  private overburn = 0;
  private hazardIntensity = 0;

  enterContract(contract: BossContract, phaseRule: BossPhaseRule, overburn: number): void {
    this.biomeId = contract.biomeId;
    this.profile = BIOME_AUDIO_PROFILES[contract.biomeId] ?? DEFAULT_PROFILE;
    this.phaseTitle = phaseRule.title;
    this.overburn = overburn;
    this.hazardIntensity = this.computeHazardIntensity(phaseRule);
  }

  stop(): void {
    this.biomeId = 'default';
    this.profile = DEFAULT_PROFILE;
    this.phaseTitle = 'No phase';
    this.overburn = 0;
    this.hazardIntensity = 0;
  }

  applyPhaseRule(phaseRule: BossPhaseRule, overburn: number): void {
    this.phaseTitle = phaseRule.title;
    this.overburn = overburn;
    this.hazardIntensity = this.computeHazardIntensity(phaseRule);
  }

  onArenaPulse(arena: ArenaMutationSnapshot): string {
    const pulseGain = this.toPercent(this.hazardIntensity * 0.45 + this.overburn / 220);
    return `${this.profile.pulseVerb} synced to ${arena.phaseTitle} (${pulseGain}% intensity)`;
  }

  onHazardTick(phaseRule: BossPhaseRule): string {
    const hazardLoad = phaseRule.ambientHazardDamagePerSecond + phaseRule.focusDrainPerSecond * 0.75;
    const ducking = this.toPercent(Math.min(1, hazardLoad / 12));
    return `${this.profile.hazardBus} engaged, ducking ${ducking}% for telegraph clarity`;
  }

  snapshot(): BossArenaAudioSnapshot {
    const overburnBoost = this.toPercent(Math.min(1, this.overburn / 100));
    return {
      biomeId: this.biomeId,
      motif: this.profile.motif,
      mixLabel: `${this.phaseTitle} · motif ${this.profile.motif} · overburn send ${overburnBoost}%`,
      pulseCallout: `${this.profile.pulseVerb} · hazard ${this.toPercent(this.hazardIntensity)}%`
    };
  }

  private computeHazardIntensity(phaseRule: BossPhaseRule): number {
    const hazardScore = phaseRule.ambientHazardDamagePerSecond / 8 + phaseRule.focusDrainPerSecond / 10;
    return Math.min(1, Math.max(0, hazardScore));
  }

  private toPercent(value: number): number {
    return Math.round(Math.min(1, Math.max(0, value)) * 100);
  }
}
