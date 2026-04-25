export interface RunStatsSnapshot {
  readonly enemiesDefeated: number;
  readonly damageDealt: number;
  readonly damageTaken: number;
  readonly guardDamageBlocked: number;
  readonly parryCount: number;
  readonly dashCount: number;
  readonly ashSightUses: number;
  readonly relicsClaimed: number;
  readonly elapsedSeconds: number;
}

const EMPTY_STATS: RunStatsSnapshot = {
  enemiesDefeated: 0,
  damageDealt: 0,
  damageTaken: 0,
  guardDamageBlocked: 0,
  parryCount: 0,
  dashCount: 0,
  ashSightUses: 0,
  relicsClaimed: 0,
  elapsedSeconds: 0
};

export class StatsTracker {
  private stats: RunStatsSnapshot = EMPTY_STATS;

  reset(): void {
    this.stats = EMPTY_STATS;
  }

  tick(deltaSeconds: number): void {
    this.stats = {
      ...this.stats,
      elapsedSeconds: Math.max(0, this.stats.elapsedSeconds + deltaSeconds)
    };
  }

  recordDamageDealt(value: number): void {
    this.stats = {
      ...this.stats,
      damageDealt: this.stats.damageDealt + Math.max(0, value)
    };
  }

  recordEnemyDefeated(count = 1): void {
    this.stats = {
      ...this.stats,
      enemiesDefeated: this.stats.enemiesDefeated + Math.max(0, Math.floor(count))
    };
  }

  recordDamageTaken(value: number): void {
    this.stats = {
      ...this.stats,
      damageTaken: this.stats.damageTaken + Math.max(0, value)
    };
  }

  recordGuardBlocked(value: number): void {
    this.stats = {
      ...this.stats,
      guardDamageBlocked: this.stats.guardDamageBlocked + Math.max(0, value)
    };
  }

  recordParry(): void {
    this.stats = {
      ...this.stats,
      parryCount: this.stats.parryCount + 1
    };
  }

  recordDash(): void {
    this.stats = {
      ...this.stats,
      dashCount: this.stats.dashCount + 1
    };
  }

  recordAshSight(): void {
    this.stats = {
      ...this.stats,
      ashSightUses: this.stats.ashSightUses + 1
    };
  }

  recordRelicClaimed(): void {
    this.stats = {
      ...this.stats,
      relicsClaimed: this.stats.relicsClaimed + 1
    };
  }

  snapshot(): RunStatsSnapshot {
    return this.stats;
  }
}
