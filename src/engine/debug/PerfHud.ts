export class PerfHud {
  private readonly element: HTMLDivElement;
  private uiScale = 1;

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.style.position = 'fixed';
    this.element.style.left = '12px';
    this.element.style.bottom = '12px';
    this.element.style.padding = '6px 8px';
    this.element.style.fontFamily = 'monospace';
    this.element.style.fontSize = '12px';
    this.element.style.background = 'rgba(0,0,0,0.55)';
    this.element.style.color = '#a7ffd8';
    this.element.style.pointerEvents = 'none';
    container.appendChild(this.element);
  }

  setUiScale(scale: number): void {
    this.uiScale = scale;
    this.element.style.transformOrigin = 'bottom left';
    this.element.style.transform = `scale(${this.uiScale.toFixed(2)})`;
  }

  render(fps: number, stateLabel: string): void {
    this.element.textContent = `fps ${fps.toFixed(1)} | ${stateLabel}`;
  }
}
