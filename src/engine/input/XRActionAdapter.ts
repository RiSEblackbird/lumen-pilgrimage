import type { WebGLRenderer } from 'three';

export interface XRComfortSettings {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
}

export class XRActionAdapter {
  private inSession = false;
  private comfort: XRComfortSettings = {
    snapTurn: true,
    seatedMode: false
  };

  constructor(renderer: WebGLRenderer) {
    renderer.xr.addEventListener('sessionstart', () => {
      this.inSession = true;
    });
    renderer.xr.addEventListener('sessionend', () => {
      this.inSession = false;
    });
  }

  isPresenting(): boolean {
    return this.inSession;
  }

  setComfort(settings: XRComfortSettings): void {
    this.comfort = settings;
  }

  getComfortStatus(): string {
    return `${this.comfort.snapTurn ? 'SnapTurn' : 'SmoothTurn'} / ${this.comfort.seatedMode ? 'Seated' : 'Standing'}`;
  }
}
