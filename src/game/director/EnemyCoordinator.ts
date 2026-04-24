export interface EnemyPressureProfile {
  readonly meleeWeight: number;
  readonly rangedWeight: number;
}

export interface CoordinatedEnemyState extends EnemyPressureProfile {
  readonly id: string;
  readonly label: string;
  readonly isStaggered: boolean;
  readonly isTelegraphActive: boolean;
  readonly canAttackSoon: boolean;
}

export interface EnemyCoordinatorConfig {
  readonly meleeTokenLimit: number;
  readonly rangedPressureBudget: number;
}

export interface EnemyCoordinatorResult {
  readonly allowedEnemyIds: ReadonlySet<string>;
  readonly blockedEnemyIds: ReadonlySet<string>;
  readonly meleeLoad: number;
  readonly rangedLoad: number;
}

const DEFAULT_CONFIG: EnemyCoordinatorConfig = {
  meleeTokenLimit: 2,
  rangedPressureBudget: 1.25
};

export class EnemyCoordinator {
  private readonly config: EnemyCoordinatorConfig;

  constructor(config: Partial<EnemyCoordinatorConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  evaluate(enemies: readonly CoordinatedEnemyState[]): EnemyCoordinatorResult {
    const candidates = enemies
      .filter((enemy) => enemy.canAttackSoon && !enemy.isStaggered)
      .sort((left, right) => {
        if (left.isTelegraphActive !== right.isTelegraphActive) {
          return left.isTelegraphActive ? -1 : 1;
        }

        const leftTotalPressure = left.meleeWeight + left.rangedWeight;
        const rightTotalPressure = right.meleeWeight + right.rangedWeight;
        return rightTotalPressure - leftTotalPressure;
      });

    const allowedEnemyIds = new Set<string>();
    let meleeLoad = 0;
    let rangedLoad = 0;

    for (const enemy of candidates) {
      const nextMeleeLoad = meleeLoad + enemy.meleeWeight;
      const nextRangedLoad = rangedLoad + enemy.rangedWeight;
      const canSpendMelee = nextMeleeLoad <= this.config.meleeTokenLimit;
      const canSpendRanged = nextRangedLoad <= this.config.rangedPressureBudget;

      if (!canSpendMelee || !canSpendRanged) {
        continue;
      }

      allowedEnemyIds.add(enemy.id);
      meleeLoad = nextMeleeLoad;
      rangedLoad = nextRangedLoad;
    }

    const blockedEnemyIds = new Set(
      candidates.filter((enemy) => !allowedEnemyIds.has(enemy.id)).map((enemy) => enemy.id)
    );

    return {
      allowedEnemyIds,
      blockedEnemyIds,
      meleeLoad,
      rangedLoad
    };
  }
}
