import type { RunStatsSnapshot } from '../../game/state/StatsTracker';

export interface RunSummarySnapshot {
  readonly elapsedLabel: string;
  readonly intensity: 'low' | 'medium' | 'high';
  readonly summaryLabel: string;
}

function toElapsedLabel(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function resolveIntensity(stats: RunStatsSnapshot): 'low' | 'medium' | 'high' {
  const pressureScore = stats.enemiesDefeated * 2 + stats.parryCount + stats.relicsClaimed * 3 + stats.damageDealt / 120;
  if (pressureScore >= 42) {
    return 'high';
  }
  if (pressureScore >= 18) {
    return 'medium';
  }
  return 'low';
}

export class RunSummaryBuilder {
  build(stats: RunStatsSnapshot): RunSummarySnapshot {
    const elapsedLabel = toElapsedLabel(stats.elapsedSeconds);
    const intensity = resolveIntensity(stats);
    const summaryLabel = [
      `Run ${elapsedLabel}`,
      `K ${stats.enemiesDefeated}`,
      `DMG ${Math.round(stats.damageDealt)}/${Math.round(stats.damageTaken)}`,
      `Parry ${stats.parryCount}`,
      `Dash ${stats.dashCount}`,
      `AshSight ${stats.ashSightUses}`,
      `Relic ${stats.relicsClaimed}`,
      `Intensity ${intensity.toUpperCase()}`
    ].join(' · ');

    return {
      elapsedLabel,
      intensity,
      summaryLabel
    };
  }
}
