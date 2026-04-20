export class FlatCodexPanel {
  readonly element: HTMLDivElement;

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
        <li>VRButton から VR に入場</li>
        <li>右: fire wand / 左: moon wand</li>
        <li>レイで glyph を指し、Select で儀式遷移</li>
        <li>両手同時に同じ glyph で儀式増幅</li>
        <li>キーボード <b>V</b> で spirit vision 切替</li>
        <li>キーボード <b>E</b> で最終状態を JSON export</li>
      </ul>
    `;

    container.appendChild(this.element);
  }

  destroy(): void {
    this.element.remove();
  }
}
