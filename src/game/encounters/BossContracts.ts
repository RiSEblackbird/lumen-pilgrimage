export interface BossPhaseRule {
  readonly index: number;
  readonly title: string;
  readonly mechanicSummary: string;
  readonly minElapsedSeconds: number;
  readonly minOverburn: number;
  readonly attackIntervalMultiplier: number;
  readonly telegraphLeadMultiplier: number;
  readonly incomingDamageMultiplier: number;
  readonly guardDamageMultiplier: number;
}

export interface BossContract {
  readonly biomeId: string;
  readonly bossName: string;
  readonly contractLabel: string;
  readonly phases: readonly BossPhaseRule[];
}

export const BOSS_CONTRACTS: readonly BossContract[] = [
  {
    biomeId: 'ember-ossuary',
    bossName: 'Bell of Cinders',
    contractLabel: 'Cinder Litany',
    phases: [
      {
        index: 1,
        title: 'Kindling Toll',
        mechanicSummary: '短い隙で近接圧を維持し、guard を刻む。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Ashen Refrain',
        mechanicSummary: '熾火弾の同調射を増やし、telegraph を短縮する。',
        minElapsedSeconds: 16,
        minOverburn: 28,
        attackIntervalMultiplier: 0.88,
        telegraphLeadMultiplier: 0.84,
        incomingDamageMultiplier: 1.12,
        guardDamageMultiplier: 1.1
      },
      {
        index: 3,
        title: 'Cathedral Flashfire',
        mechanicSummary: '高圧フェーズ。guard 破断リスクが増し、被弾が重い。',
        minElapsedSeconds: 34,
        minOverburn: 55,
        attackIntervalMultiplier: 0.76,
        telegraphLeadMultiplier: 0.72,
        incomingDamageMultiplier: 1.22,
        guardDamageMultiplier: 1.24
      }
    ]
  },
  {
    biomeId: 'moon-reservoir',
    bossName: 'The Thirteen-Eyed Pool',
    contractLabel: 'Lunar Refraction',
    phases: [
      {
        index: 1,
        title: 'Stillwater Gaze',
        mechanicSummary: '反射弾を散発し、射線管理を要求する。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Prismatic Wake',
        mechanicSummary: '遠隔圧を増やし、parry 窓をやや短縮する。',
        minElapsedSeconds: 18,
        minOverburn: 25,
        attackIntervalMultiplier: 0.9,
        telegraphLeadMultiplier: 0.86,
        incomingDamageMultiplier: 1.08,
        guardDamageMultiplier: 1.08
      },
      {
        index: 3,
        title: 'Abyssal Chorus',
        mechanicSummary: 'beam 同期で高密度化。機動しないと被圧が急増する。',
        minElapsedSeconds: 36,
        minOverburn: 50,
        attackIntervalMultiplier: 0.8,
        telegraphLeadMultiplier: 0.74,
        incomingDamageMultiplier: 1.18,
        guardDamageMultiplier: 1.2
      }
    ]
  }
] as const;

export function getBossContractForBiome(biomeId: string): BossContract | null {
  return BOSS_CONTRACTS.find((contract) => contract.biomeId === biomeId) ?? null;
}

export function resolveBossPhase(contract: BossContract, elapsedSeconds: number, overburn: number): BossPhaseRule {
  let resolved = contract.phases[0];
  for (const phase of contract.phases) {
    if (elapsedSeconds >= phase.minElapsedSeconds && overburn >= phase.minOverburn) {
      resolved = phase;
    }
  }
  return resolved;
}
