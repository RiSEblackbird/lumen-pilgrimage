export interface BossPhaseRule {
  readonly index: number;
  readonly title: string;
  readonly mechanicSummary: string;
  readonly arenaMutationSummary: string;
  readonly minElapsedSeconds: number;
  readonly minOverburn: number;
  readonly attackIntervalMultiplier: number;
  readonly telegraphLeadMultiplier: number;
  readonly incomingDamageMultiplier: number;
  readonly guardDamageMultiplier: number;
  readonly ambientHazardDamagePerSecond: number;
  readonly focusDrainPerSecond: number;
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
        arenaMutationSummary: '灼熱の香炉が点火し、床縁に短周期の火筋が走る。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0,
        focusDrainPerSecond: 0
      },
      {
        index: 2,
        title: 'Ashen Refrain',
        mechanicSummary: '熾火弾の同調射を増やし、telegraph を短縮する。',
        arenaMutationSummary: '灰燼ベントが開き、外周に残り火ハザードが展開する。',
        minElapsedSeconds: 16,
        minOverburn: 28,
        attackIntervalMultiplier: 0.88,
        telegraphLeadMultiplier: 0.84,
        incomingDamageMultiplier: 1.12,
        guardDamageMultiplier: 1.1,
        ambientHazardDamagePerSecond: 1.2,
        focusDrainPerSecond: 0
      },
      {
        index: 3,
        title: 'Cathedral Flashfire',
        mechanicSummary: '高圧フェーズ。guard 破断リスクが増し、被弾が重い。',
        arenaMutationSummary: '鐘塔の導火路が暴走し、断続的な焦熱波が走る。',
        minElapsedSeconds: 34,
        minOverburn: 55,
        attackIntervalMultiplier: 0.76,
        telegraphLeadMultiplier: 0.72,
        incomingDamageMultiplier: 1.22,
        guardDamageMultiplier: 1.24,
        ambientHazardDamagePerSecond: 2.4,
        focusDrainPerSecond: 0.4
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
        arenaMutationSummary: '水位が静止し、反射面だけが脅威として機能する。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0,
        focusDrainPerSecond: 0
      },
      {
        index: 2,
        title: 'Prismatic Wake',
        mechanicSummary: '遠隔圧を増やし、parry 窓をやや短縮する。',
        arenaMutationSummary: '導電水路が開放され、浅瀬に断続ショックが発生する。',
        minElapsedSeconds: 18,
        minOverburn: 25,
        attackIntervalMultiplier: 0.9,
        telegraphLeadMultiplier: 0.86,
        incomingDamageMultiplier: 1.08,
        guardDamageMultiplier: 1.08,
        ambientHazardDamagePerSecond: 1,
        focusDrainPerSecond: 0.25
      },
      {
        index: 3,
        title: 'Abyssal Chorus',
        mechanicSummary: 'beam 同期で高密度化。機動しないと被圧が急増する。',
        arenaMutationSummary: '月光共鳴で水鏡が反転し、全域で焦点攪乱が起こる。',
        minElapsedSeconds: 36,
        minOverburn: 50,
        attackIntervalMultiplier: 0.8,
        telegraphLeadMultiplier: 0.74,
        incomingDamageMultiplier: 1.18,
        guardDamageMultiplier: 1.2,
        ambientHazardDamagePerSecond: 1.8,
        focusDrainPerSecond: 0.7
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
        arenaMutationSummary: '胞子霧が低密度で拡散し、視線誘導を乱す。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0,
        focusDrainPerSecond: 0
      },
      {
        index: 2,
        title: 'Polaris Bloom',
        mechanicSummary: 'star lock の回転速度が増し、weakpoint 開口が短くなる。',
        arenaMutationSummary: '根橋が再編成され、外周に花粉渦の危険域が形成される。',
        minElapsedSeconds: 20,
        minOverburn: 30,
        attackIntervalMultiplier: 0.87,
        telegraphLeadMultiplier: 0.84,
        incomingDamageMultiplier: 1.1,
        guardDamageMultiplier: 1.12,
        ambientHazardDamagePerSecond: 1.4,
        focusDrainPerSecond: 0.2
      },
      {
        index: 3,
        title: 'Choir of Barkfire',
        mechanicSummary: '広域制圧フェーズ。dash と parry の精度を同時要求する。',
        arenaMutationSummary: '星根が発火して脈動し、接触時の焦熱汚染が増幅する。',
        minElapsedSeconds: 40,
        minOverburn: 58,
        attackIntervalMultiplier: 0.74,
        telegraphLeadMultiplier: 0.7,
        incomingDamageMultiplier: 1.22,
        guardDamageMultiplier: 1.26,
        ambientHazardDamagePerSecond: 2.1,
        focusDrainPerSecond: 0.5
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
        arenaMutationSummary: '鏡面が静止し、限定角度の反射線だけが有効化される。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0,
        focusDrainPerSecond: 0
      },
      {
        index: 2,
        title: 'Mirror Array',
        mechanicSummary: '反射 beam の交差が増え、safe lane が短周期で変化する。',
        arenaMutationSummary: '鏡柱が増設され、中央区画で反射障害が常時回転する。',
        minElapsedSeconds: 19,
        minOverburn: 30,
        attackIntervalMultiplier: 0.85,
        telegraphLeadMultiplier: 0.82,
        incomingDamageMultiplier: 1.14,
        guardDamageMultiplier: 1.16,
        ambientHazardDamagePerSecond: 1.3,
        focusDrainPerSecond: 0.3
      },
      {
        index: 3,
        title: 'Sundering Liturgy',
        mechanicSummary: '高密度斬撃と反射弾の複合圧。回避ルート選択が必須。',
        arenaMutationSummary: '刃壁が断続的に閉鎖し、横断時に深刻な裂傷を与える。',
        minElapsedSeconds: 38,
        minOverburn: 60,
        attackIntervalMultiplier: 0.72,
        telegraphLeadMultiplier: 0.68,
        incomingDamageMultiplier: 1.26,
        guardDamageMultiplier: 1.28,
        ambientHazardDamagePerSecond: 2.5,
        focusDrainPerSecond: 0.4
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
        arenaMutationSummary: '炉床は安定状態で、限定レーンのみ過熱する。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0,
        focusDrainPerSecond: 0
      },
      {
        index: 2,
        title: 'Rail Overcharge',
        mechanicSummary: 'overcharge rail が連続駆動し、移動遅延が致命傷になる。',
        arenaMutationSummary: '過充電レールが拡張され、交差部で火花嵐が周期発生する。',
        minElapsedSeconds: 21,
        minOverburn: 35,
        attackIntervalMultiplier: 0.84,
        telegraphLeadMultiplier: 0.8,
        incomingDamageMultiplier: 1.16,
        guardDamageMultiplier: 1.14,
        ambientHazardDamagePerSecond: 1.6,
        focusDrainPerSecond: 0.25
      },
      {
        index: 3,
        title: 'Noon Collapse',
        mechanicSummary: '掃射と着弾爆発が重なる最終圧。短時間で決着を迫る。',
        arenaMutationSummary: '主炉が暴走し、全域に灼光波が巡回して持久を拒否する。',
        minElapsedSeconds: 42,
        minOverburn: 62,
        attackIntervalMultiplier: 0.7,
        telegraphLeadMultiplier: 0.66,
        incomingDamageMultiplier: 1.3,
        guardDamageMultiplier: 1.3,
        ambientHazardDamagePerSecond: 2.8,
        focusDrainPerSecond: 0.6
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
        arenaMutationSummary: '終末聖堂の祭壇が同期し、周辺のみ局所危険域として明滅する。',
        minElapsedSeconds: 0,
        minOverburn: 0,
        attackIntervalMultiplier: 1,
        telegraphLeadMultiplier: 1,
        incomingDamageMultiplier: 1,
        guardDamageMultiplier: 1,
        ambientHazardDamagePerSecond: 0.4,
        focusDrainPerSecond: 0.2
      },
      {
        index: 2,
        title: 'Shattered Choir',
        mechanicSummary: 'arena mutation で hazard lane が入れ替わり、route 更新を継続要求する。',
        arenaMutationSummary: '聖歌線路が分断され、safe lane が短周期で切り替わる。',
        minElapsedSeconds: 24,
        minOverburn: 38,
        attackIntervalMultiplier: 0.82,
        telegraphLeadMultiplier: 0.78,
        incomingDamageMultiplier: 1.2,
        guardDamageMultiplier: 1.2,
        ambientHazardDamagePerSecond: 2,
        focusDrainPerSecond: 0.6
      },
      {
        index: 3,
        title: 'Broken Sun Verdict',
        mechanicSummary: '最終形態。telegraph は短いが silhouette を明確化し、読める高密度戦にする。',
        arenaMutationSummary: '砕けた太陽核が脈動し、全域に灼光と崩壊波が重ねて走る。',
        minElapsedSeconds: 48,
        minOverburn: 70,
        attackIntervalMultiplier: 0.66,
        telegraphLeadMultiplier: 0.62,
        incomingDamageMultiplier: 1.36,
        guardDamageMultiplier: 1.34,
        ambientHazardDamagePerSecond: 3.1,
        focusDrainPerSecond: 0.9
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
