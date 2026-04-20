import { Group, Matrix4, PerspectiveCamera, Raycaster, Vector3, WebGLRenderer } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { RitualDomain } from './RitualState';
import { GlyphSystem } from '../world/GlyphSystem';

export interface FPSSelectEvent {
  domain: RitualDomain;
  source: 'fps';
}

export class FPSInputRig {
  readonly group = new Group();

  private readonly controls: PointerLockControls;
  private readonly raycaster = new Raycaster();
  private readonly moveDirection = new Vector3();
  private readonly keys = new Set<string>();
  private readonly tempMatrix = new Matrix4();

  private speedMetersPerSecond = 2.5;
  private active = true;

  constructor(
    camera: PerspectiveCamera,
    private readonly renderer: WebGLRenderer,
    private readonly glyphSystem: GlyphSystem,
    private readonly onSelect: (event: FPSSelectEvent) => void
  ) {
    this.controls = new PointerLockControls(camera, renderer.domElement);

    this.renderer.domElement.addEventListener('click', () => {
      if (!this.active) {
        return;
      }
      if (!this.controls.isLocked) {
        this.controls.lock();
        return;
      }
      this.selectTargetGlyph();
    });

    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active && this.controls.isLocked) {
      this.controls.unlock();
    }
  }

  update(deltaSeconds: number): void {
    if (!this.active || !this.controls.isLocked) {
      return;
    }

    this.moveDirection.set(0, 0, 0);
    if (this.keys.has('keyw')) {
      this.moveDirection.z -= 1;
    }
    if (this.keys.has('keys')) {
      this.moveDirection.z += 1;
    }
    if (this.keys.has('keya')) {
      this.moveDirection.x -= 1;
    }
    if (this.keys.has('keyd')) {
      this.moveDirection.x += 1;
    }

    if (this.moveDirection.lengthSq() === 0) {
      return;
    }

    this.moveDirection.normalize();
    const moveDistance = this.speedMetersPerSecond * deltaSeconds;
    this.controls.moveRight(this.moveDirection.x * moveDistance);
    this.controls.moveForward(-this.moveDirection.z * moveDistance);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.code.toLowerCase();
    this.keys.add(key);

    if (!this.active || !this.controls.isLocked) {
      return;
    }

    if (key === 'space' || key === 'enter') {
      this.selectTargetGlyph();
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code.toLowerCase());
  }

  private selectTargetGlyph(): void {
    const domain = this.pickCenterDomain();
    if (!domain) {
      return;
    }

    this.onSelect({ domain, source: 'fps' });
  }

  private pickCenterDomain(): RitualDomain | null {
    this.tempMatrix.identity().extractRotation(this.controls.object.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(this.controls.object.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix).normalize();
    const hit = this.raycaster.intersectObjects(this.glyphSystem.pickables, false)[0];
    return hit?.object.userData.domain ?? null;
  }
}
