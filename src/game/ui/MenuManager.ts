import type { GameState } from '../state/GameState';

export class MenuManager {
  private readonly root: HTMLDivElement;

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
    this.root.textContent = `State: ${state}`;
  }
}
