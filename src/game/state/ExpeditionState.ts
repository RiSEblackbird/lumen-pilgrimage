import type { ContinueSnapshot } from '../ui/MenuManager';
import type { CombatPersistenceSnapshot } from '../sandbox/CombatSandboxDirector';

export interface ExpeditionStateSnapshot {
  readonly active: boolean;
  readonly biomeId: string | null;
  readonly missionId: string | null;
  readonly sectorLabel: string;
  readonly roomLabel: string;
  readonly routeStyle: string;
}

export class ExpeditionState {
  private active = false;
  private biomeId: string | null = null;
  private missionId: string | null = null;
  private sectorIndex = 0;
  private sectorsTotal = 0;
  private roomLabel = '-';
  private routeStyle = 'balanced';

  restoreFromContinue(snapshot: ContinueSnapshot | null): void {
    if (!snapshot) {
      this.reset();
      return;
    }

    this.active = true;
    this.biomeId = snapshot.biomeId;
    this.missionId = snapshot.missionId;
    this.sectorIndex = snapshot.sectorIndex;
    this.sectorsTotal = snapshot.sectorsTotal;
    this.roomLabel = snapshot.roomLabel;
    this.routeStyle = snapshot.routeStyle;
  }

  beginFreshRun(defaultBiome: string): void {
    this.active = true;
    this.biomeId = defaultBiome;
    this.missionId = null;
    this.sectorIndex = 1;
    this.sectorsTotal = 1;
    this.roomLabel = 'Entry Chamber';
    this.routeStyle = 'balanced';
  }

  syncFromPersistence(snapshot: CombatPersistenceSnapshot): void {
    this.active = true;
    this.biomeId = snapshot.biomeId;
    this.missionId = snapshot.missionId;
    this.sectorIndex = snapshot.sectorIndex;
    this.sectorsTotal = snapshot.sectorsTotal;
    this.roomLabel = snapshot.roomLabel;
    this.routeStyle = snapshot.routeStyle;
  }

  reset(): void {
    this.active = false;
    this.biomeId = null;
    this.missionId = null;
    this.sectorIndex = 0;
    this.sectorsTotal = 0;
    this.roomLabel = '-';
    this.routeStyle = 'balanced';
  }

  getSnapshot(): ExpeditionStateSnapshot {
    const sectorLabel = this.active && this.sectorsTotal > 0 ? `${this.sectorIndex}/${this.sectorsTotal}` : '-';

    return {
      active: this.active,
      biomeId: this.biomeId,
      missionId: this.missionId,
      sectorLabel,
      roomLabel: this.roomLabel,
      routeStyle: this.routeStyle
    };
  }
}
