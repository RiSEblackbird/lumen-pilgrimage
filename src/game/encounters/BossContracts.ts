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
  },
  {
    biomeId: 'birch-astrarium',
    bossName: 'Oracle of Bark and Polaris',
    contractLabel: 'Astral Root Canticle',
    phases: [
      {
        index: 1,
        title: 'Spore Lattice',
        mechanicSummary: '根と胞子の置き弾で足場を制限し、位置取りを問う。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Polaris Bloom',
        mechanicSummary: 'star lock の回転速度が増し、weakpoint 開口が短くなる。',
        minElapsedSeconds: 20,
        minOverburn: 30,
        attackIntervalMultiplier: 0.87,
        telegraphLeadMultiplier: 0.84,
        incomingDamageMultiplier: 1.1,
        guardDamageMultiplier: 1.12
      },
      {
        index: 3,
        title: 'Choir of Barkfire',
        mechanicSummary: '広域制圧フェーズ。dash と parry の精度を同時要求する。',
        minElapsedSeconds: 40,
        minOverburn: 58,
        attackIntervalMultiplier: 0.74,
        telegraphLeadMultiplier: 0.7,
        incomingDamageMultiplier: 1.22,
        guardDamageMultiplier: 1.26
      }
    ]
  },
  {
    biomeId: 'obsidian-artery',
    bossName: 'The Warden of Split Reflection',
    contractLabel: 'Fractured Vesper',
    phases: [
      {
        index: 1,
        title: 'Shearing Prelude',
        mechanicSummary: '鏡刃の sweep と thrust を交互に放ち、guard 消耗を狙う。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Mirror Array',
        mechanicSummary: '反射 beam の交差が増え、safe lane が短周期で変化する。',
        minElapsedSeconds: 19,
        minOverburn: 30,
        attackIntervalMultiplier: 0.85,
        telegraphLeadMultiplier: 0.82,
        incomingDamageMultiplier: 1.14,
        guardDamageMultiplier: 1.16
      },
      {
        index: 3,
        title: 'Sundering Liturgy',
        mechanicSummary: '高密度斬撃と反射弾の複合圧。回避ルート選択が必須。',
        minElapsedSeconds: 38,
        minOverburn: 60,
        attackIntervalMultiplier: 0.72,
        telegraphLeadMultiplier: 0.68,
        incomingDamageMultiplier: 1.26,
        guardDamageMultiplier: 1.28
      }
    ]
  },
  {
    biomeId: 'dawn-foundry',
    bossName: 'Daybreak Engine',
    contractLabel: 'Solar Forge Ordinance',
    phases: [
      {
        index: 1,
        title: 'Ignition Sequence',
        mechanicSummary: '直線 solar sweep を主軸に、platform 移動を要求する。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Rail Overcharge',
        mechanicSummary: 'overcharge rail が連続駆動し、移動遅延が致命傷になる。',
        minElapsedSeconds: 21,
        minOverburn: 35,
        attackIntervalMultiplier: 0.84,
        telegraphLeadMultiplier: 0.8,
        incomingDamageMultiplier: 1.16,
        guardDamageMultiplier: 1.14
      },
      {
        index: 3,
        title: 'Noon Collapse',
        mechanicSummary: '掃射と着弾爆発が重なる最終圧。短時間で決着を迫る。',
        minElapsedSeconds: 42,
        minOverburn: 62,
        attackIntervalMultiplier: 0.7,
        telegraphLeadMultiplier: 0.66,
        incomingDamageMultiplier: 1.3,
        guardDamageMultiplier: 1.3
      }
    ]
  },
  {
    biomeId: 'broken-sun-choir',
    bossName: 'The Last Cantor',
    contractLabel: 'Broken Sun Requiem',
    phases: [
      {
        index: 1,
        title: 'Cantor Ascendant',
        mechanicSummary: '全 biome 系統の基本圧を混在させ、読みにくさではなく処理密度で攻める。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1
      },
      {
        index: 2,
        title: 'Shattered Choir',
        mechanicSummary: 'arena mutation で hazard lane が入れ替わり、route 更新を継続要求する。',
        minElapsedSeconds: 24,
        minOverburn: 38,
        attackIntervalMultiplier: 0.82,
        telegraphLeadMultiplier: 0.78,
        incomingDamageMultiplier: 1.2,
        guardDamageMultiplier: 1.2
      },
      {
        index: 3,
        title: 'Broken Sun Verdict',
        mechanicSummary: '最終形態。telegraph は短いが silhouette を明確化し、読める高密度戦にする。',
        minElapsedSeconds: 48,
        minOverburn: 70,
        attackIntervalMultiplier: 0.66,
        telegraphLeadMultiplier: 0.62,
        incomingDamageMultiplier: 1.36,
        guardDamageMultiplier: 1.34
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
