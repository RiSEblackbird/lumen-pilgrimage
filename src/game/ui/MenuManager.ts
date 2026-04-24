import type { GameState } from '../state/GameState';
import type { RelicStatModifiers } from '../items/RelicEffects';

export interface ContinueSnapshot {
  readonly biomeId: string;
  readonly missionId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomId: string;
  readonly roomLabel: string;
  readonly routeStyle: string;
  readonly missionName: string;
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly relicIds: readonly string[];
  readonly relicModifiers: RelicStatModifiers;
  readonly capturedAtIso: string;
}

export type MenuCommand = 'continue' | 'new-game' | 'open-settings' | 'open-credits';

export class MenuManager {
  private readonly root: HTMLDivElement;
  private readonly commandQueue: MenuCommand[] = [];
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

  consumeCommand(): MenuCommand | null {
    return this.commandQueue.shift() ?? null;
  }

  private render(): void {
    const snapshot = this.continueSnapshot;
    if (this.state === 'MainMenu') {
      this.root.innerHTML = '';
      this.root.append(this.createMainMenu(snapshot));
      return;
    }

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
      `Room: ${snapshot.roomLabel} / Route ${snapshot.routeStyle}`,
      `RoomID: ${snapshot.roomId || 'legacy-save'}`,
      `Mission: ${snapshot.missionName} (${snapshot.missionId || 'legacy-save'})`,
      `Vitals: HP ${snapshot.health.toFixed(0)} | Guard ${snapshot.guard.toFixed(0)} | Focus ${snapshot.focus.toFixed(0)} | Overburn ${snapshot.overburn.toFixed(0)}`,
      `Relics: ${relicSummary}`,
      `RelicMods: DMG x${snapshot.relicModifiers.primaryDamageMultiplier.toFixed(2)} | GuardTaken x${snapshot.relicModifiers.guardDamageTakenMultiplier.toFixed(2)} | DashCost x${snapshot.relicModifiers.dashFocusCostMultiplier.toFixed(2)}`,
      `Saved: ${capturedLabel}`
    ].join('<br/>');
  }

  private createMainMenu(snapshot: ContinueSnapshot | null): HTMLElement {
    const panel = document.createElement('div');
    panel.style.display = 'grid';
    panel.style.gap = '8px';
    panel.style.minWidth = '250px';

    const title = document.createElement('div');
    title.textContent = 'Lumen Pilgrimage: Reforge';
    title.style.fontSize = '16px';
    title.style.fontWeight = '700';
    panel.append(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = 'Main Menu';
    subtitle.style.opacity = '0.8';
    panel.append(subtitle);

    if (snapshot) {
      const continueMeta = document.createElement('div');
      continueMeta.textContent = `Continue: ${snapshot.biomeId} / ${snapshot.roomLabel}`;
      continueMeta.style.fontSize = '12px';
      continueMeta.style.opacity = '0.88';
      panel.append(continueMeta);
      panel.append(this.createCommandButton('Continue Expedition', 'continue'));
    } else {
      const noContinue = document.createElement('div');
      noContinue.textContent = 'Continue unavailable (no saved expedition)';
      noContinue.style.fontSize = '12px';
      noContinue.style.opacity = '0.75';
      panel.append(noContinue);
    }

    panel.append(this.createCommandButton('New Game', 'new-game'));
    panel.append(this.createCommandButton('Settings', 'open-settings'));
    panel.append(this.createCommandButton('Credits', 'open-credits'));
    return panel;
  }

  private createCommandButton(label: string, command: MenuCommand): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.padding = '7px 10px';
    button.style.background = 'rgba(255,255,255,0.08)';
    button.style.border = '1px solid rgba(255,255,255,0.26)';
    button.style.color = '#f0f6ff';
    button.style.textAlign = 'left';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      this.commandQueue.push(command);
    });
    return button;
  }
}
