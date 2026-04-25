export interface HudSnapshot {
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly objective: string;
  readonly weaponName: string;
  readonly offhandName: string;
  readonly sigilName: string;
  readonly enemiesRemaining: number;
  readonly telegraphLabel: string;
  readonly staggeredEnemies: number;
  readonly missionName: string;
  readonly pressureLabel: string;
  readonly rewardLabel: string;
  readonly equippedRelics: readonly string[];
  readonly encounterLabel: string;
  readonly contractLabel: string;
  readonly bossLabel: string;
  readonly bossHealthLabel: string;
  readonly arenaMutationLabel: string;
  readonly arenaEffectsLabel: string;
  readonly arenaVisualLabel: string;
  readonly loadoutPoolLabel: string;
  readonly ashSightLabel: string;
  readonly musicLabel: string;
  readonly runSummaryLabel: string;
}

export class HudManager {
  private readonly root: HTMLDivElement;
  private uiScale = 1;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.right = '16px';
    this.root.style.bottom = '16px';
    this.root.style.padding = '10px';
    this.root.style.minWidth = '260px';
    this.root.style.background = 'rgba(10, 12, 20, 0.74)';
    this.root.style.color = '#ebeff7';
    this.root.style.fontFamily = 'system-ui, sans-serif';
    this.root.style.fontSize = '13px';
    this.root.style.lineHeight = '1.4';
    container.appendChild(this.root);
  }

  setUiScale(scale: number): void {
    this.uiScale = scale;
    this.root.style.transformOrigin = 'bottom right';
    this.root.style.transform = `scale(${this.uiScale.toFixed(2)})`;
  }

  render(snapshot: HudSnapshot): void {
    const relicSummary = snapshot.equippedRelics.length > 0 ? snapshot.equippedRelics.join(', ') : 'none';

    this.root.innerHTML = [
      `Mission: ${snapshot.missionName}`,
      `Contract: ${snapshot.contractLabel}`,
      `HP ${snapshot.health.toFixed(0)} | Guard ${snapshot.guard.toFixed(0)}`,
      `Focus ${snapshot.focus.toFixed(0)} | Overburn ${snapshot.overburn.toFixed(0)}`,
      `Weapon: ${snapshot.weaponName}`,
      `Offhand: ${snapshot.offhandName} | Sigil: ${snapshot.sigilName}`,
      `Enemies: ${snapshot.enemiesRemaining} | Staggered: ${snapshot.staggeredEnemies}`,
      `Telegraph: ${snapshot.telegraphLabel}`,
      `Pressure: ${snapshot.pressureLabel}`,
      `Encounter: ${snapshot.encounterLabel}`,
      `Boss: ${snapshot.bossLabel}`,
      snapshot.bossHealthLabel,
      `Arena: ${snapshot.arenaMutationLabel}`,
      `Arena Effects: ${snapshot.arenaEffectsLabel}`,
      snapshot.arenaVisualLabel,
      snapshot.loadoutPoolLabel,
      snapshot.ashSightLabel,
      snapshot.musicLabel,
      snapshot.runSummaryLabel,
      `Reward: ${snapshot.rewardLabel}`,
      `Relics: ${relicSummary}`,
      `Objective: ${snapshot.objective}`
    ].join('<br/>');
  }
}
