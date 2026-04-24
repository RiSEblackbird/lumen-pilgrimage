export interface HudSnapshot {
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly objective: string;
}

export class HudManager {
  private readonly root: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.right = '16px';
    this.root.style.bottom = '16px';
    this.root.style.padding = '10px';
    this.root.style.minWidth = '240px';
    this.root.style.background = 'rgba(10, 12, 20, 0.74)';
    this.root.style.color = '#ebeff7';
    this.root.style.fontFamily = 'system-ui, sans-serif';
    this.root.style.fontSize = '13px';
    container.appendChild(this.root);
  }

  render(snapshot: HudSnapshot): void {
    this.root.innerHTML = [
      `HP ${snapshot.health.toFixed(0)} | Guard ${snapshot.guard.toFixed(0)}`,
      `Focus ${snapshot.focus.toFixed(0)} | Overburn ${snapshot.overburn.toFixed(0)}`,
      `Objective: ${snapshot.objective}`
    ].join('<br/>');
  }
}
