export class FlatCodexPanel {
  readonly element: HTMLDivElement;
  private readonly modeLine: HTMLLIElement;
  private readonly crosshair: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.top = '1rem';
    this.element.style.left = '1rem';
    this.element.style.maxWidth = '28rem';
    this.element.style.padding = '0.9rem 1rem';
    this.element.style.background = 'rgba(4,8,18,0.72)';
    this.element.style.border = '1px solid rgba(154, 178, 255, 0.5)';
    this.element.style.borderRadius = '0.75rem';
    this.element.style.lineHeight = '1.5';
    this.element.innerHTML = `
      <h1 style="margin:0 0 .5rem; font-size: 1rem;">Lumen Pilgrimage / Codex</h1>
      <ul style="margin:0; padding-left:1.1rem; font-size:.9rem;">
        <li id="mode-line">モード: <b>FPS</b></li>
        <li>VRButton から VR に入場</li>
        <li>FPS: 画面クリックで照準固定、WASD で移動、クリック/Enter/Space で glyph 選択</li>
        <li>FPS: Shift + 選択で儀式増幅、Z/X で Kelvin を調整</li>
        <li>VR: 右 fire wand / 左 moon wand、レイ + Select で儀式遷移</li>
        <li>両手同時に同じ glyph で儀式増幅</li>
        <li>キーボード <b>V</b> で spirit vision 切替</li>
        <li>キーボード <b>E</b> で最終状態を JSON export</li>
      </ul>
    `;
    this.modeLine = this.element.querySelector<HTMLLIElement>('#mode-line') as HTMLLIElement;

    this.crosshair = document.createElement('div');
    this.crosshair.style.position = 'fixed';
    this.crosshair.style.left = '50%';
    this.crosshair.style.top = '50%';
    this.crosshair.style.transform = 'translate(-50%, -50%)';
    this.crosshair.style.color = 'rgba(220, 227, 255, 0.88)';
    this.crosshair.style.fontSize = '1.2rem';
    this.crosshair.style.fontFamily = 'monospace';
    this.crosshair.style.pointerEvents = 'none';
    this.crosshair.style.textShadow = '0 0 8px rgba(127, 170, 255, 0.7)';
    this.crosshair.textContent = '+';

    container.appendChild(this.element);
    container.appendChild(this.crosshair);
  }

  setMode(mode: 'vr' | 'fps'): void {
    this.modeLine.innerHTML = `モード: <b>${mode === 'vr' ? 'VR' : 'FPS'}</b>`;
    this.crosshair.style.display = mode === 'vr' ? 'none' : 'block';
  }

  destroy(): void {
    this.element.remove();
    this.crosshair.remove();
  }
}
