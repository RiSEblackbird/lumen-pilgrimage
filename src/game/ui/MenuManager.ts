import type { GameState } from '../state/GameState';

export interface ContinueSnapshot {
  readonly biomeId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomLabel: string;
  readonly missionName: string;
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly relicIds: readonly string[];
  readonly capturedAtIso: string;
}

export class MenuManager {
  private readonly root: HTMLDivElement;
  private state: GameState = 'Boot';
  private continueSnapshot: ContinueSnapshot | null = null;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.top = '16px';
    this.root.style.left = '16px';
    this.root.style.padding = '10px 12px';
    this.root.style.border = '1px solid rgba(255,255,255,0.16)';
    this.root.style.background = 'rgba(5, 7, 14, 0.68)';
    this.root.style.color = '#f0f6ff';
    this.root.style.fontFamily = 'system-ui, sans-serif';
    this.root.style.fontSize = '13px';
    container.appendChild(this.root);
  }

  setState(state: GameState): void {
    this.state = state;
    this.render();
  }

  setContinueSnapshot(snapshot: ContinueSnapshot | null): void {
    this.continueSnapshot = snapshot;
    this.render();
  }

  private render(): void {
    const snapshot = this.continueSnapshot;
    if (!snapshot) {
      this.root.innerHTML = [`State: ${this.state}`, 'Continue: no expedition snapshot'].join('<br/>');
      return;
    }

    const capturedAt = new Date(snapshot.capturedAtIso);
    const capturedLabel = Number.isNaN(capturedAt.getTime()) ? snapshot.capturedAtIso : capturedAt.toLocaleString();
    const relicSummary = snapshot.relicIds.length === 0 ? 'none' : snapshot.relicIds.join(', ');

    this.root.innerHTML = [
      `State: ${this.state}`,
      `Continue: ${snapshot.biomeId} / Sector ${snapshot.sectorIndex}/${snapshot.sectorsTotal}`,
      `Room: ${snapshot.roomLabel}`,
      `Mission: ${snapshot.missionName}`,
      `Vitals: HP ${snapshot.health.toFixed(0)} | Guard ${snapshot.guard.toFixed(0)} | Focus ${snapshot.focus.toFixed(0)} | Overburn ${snapshot.overburn.toFixed(0)}`,
      `Relics: ${relicSummary}`,
      `Saved: ${capturedLabel}`
    ].join('<br/>');
  }
}
