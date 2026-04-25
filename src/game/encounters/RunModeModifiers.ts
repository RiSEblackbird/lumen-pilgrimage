import type { RunMode } from '../state/RunMode';

export interface RunModeModifier {
  readonly id: RunMode;
  readonly enemyHealthMultiplier: number;
  readonly enemyDamageMultiplier: number;
  readonly enemyAttackIntervalMultiplier: number;
  readonly enemyTelegraphMultiplier: number;
  readonly waveCountBonus: number;
  readonly rewardWeightMultiplier: number;
  readonly focusRegenMultiplier: number;
  readonly overburnDecayMultiplier: number;
  readonly hazardDamageMultiplier: number;
  readonly focusDrainMultiplier: number;
  readonly missionStride: number;
  readonly objectiveSuffix: string;
  readonly contractLabel: string;
}

export const RUN_MODE_MODIFIERS: Readonly<Record<RunMode, RunModeModifier>> = {
  campaign: {
    id: 'campaign',
    enemyHealthMultiplier: 1,
    enemyDamageMultiplier: 1,
    enemyAttackIntervalMultiplier: 1,
    enemyTelegraphMultiplier: 1,
    waveCountBonus: 0,
    rewardWeightMultiplier: 1,
    focusRegenMultiplier: 1,
    overburnDecayMultiplier: 1,
    hazardDamageMultiplier: 1,
    focusDrainMultiplier: 1,
    missionStride: 1,
    objectiveSuffix: 'Campaign route: secure relic loop and advance biome objective.',
    contractLabel: 'Mode: Campaign baseline'
  },
  contracts: {
    id: 'contracts',
    enemyHealthMultiplier: 0.94,
    enemyDamageMultiplier: 1.08,
    enemyAttackIntervalMultiplier: 0.92,
    enemyTelegraphMultiplier: 0.95,
    waveCountBonus: 1,
    rewardWeightMultiplier: 1.15,
    focusRegenMultiplier: 1.08,
    overburnDecayMultiplier: 0.9,
    hazardDamageMultiplier: 1,
    focusDrainMultiplier: 1,
    missionStride: 2,
    objectiveSuffix: 'Contract cycle: rotate targets quickly and cash out route bonuses.',
    contractLabel: 'Mode: Contracts quick-cycle'
  },
  'boss-rush': {
    id: 'boss-rush',
    enemyHealthMultiplier: 1.12,
    enemyDamageMultiplier: 1.16,
    enemyAttackIntervalMultiplier: 0.88,
    enemyTelegraphMultiplier: 0.9,
    waveCountBonus: 1,
    rewardWeightMultiplier: 1.22,
    focusRegenMultiplier: 0.92,
    overburnDecayMultiplier: 0.85,
    hazardDamageMultiplier: 1.15,
    focusDrainMultiplier: 1.12,
    missionStride: 1,
    objectiveSuffix: 'Boss Rush: chain phase pressure and stabilize guard windows.',
    contractLabel: 'Mode: Boss Rush escalation'
  },
  'endless-collapse': {
    id: 'endless-collapse',
    enemyHealthMultiplier: 1.06,
    enemyDamageMultiplier: 1.2,
    enemyAttackIntervalMultiplier: 0.86,
    enemyTelegraphMultiplier: 0.88,
    waveCountBonus: 2,
    rewardWeightMultiplier: 1.18,
    focusRegenMultiplier: 0.9,
    overburnDecayMultiplier: 0.8,
    hazardDamageMultiplier: 1.2,
    focusDrainMultiplier: 1.2,
    missionStride: 1,
    objectiveSuffix: 'Endless Collapse: survive compounding pressure and extend extraction horizon.',
    contractLabel: 'Mode: Endless pressure ramp'
  }
} as const;

export function runModeModifier(mode: RunMode): RunModeModifier {
  return RUN_MODE_MODIFIERS[mode] ?? RUN_MODE_MODIFIERS.campaign;
}
