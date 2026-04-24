import type { WebGLRenderer } from 'three';

export class XRActionAdapter {
  private inSession = false;

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
}
