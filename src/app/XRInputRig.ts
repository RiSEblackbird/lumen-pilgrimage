import {
  BufferGeometry,
  Group,
  Intersection,
  Line,
  LineBasicMaterial,
  Matrix4,
  Object3D,
  Raycaster,
  Vector3,
  WebGLRenderer
} from 'three';
import { RitualDomain } from './RitualState';
import { GlyphSystem } from '../world/GlyphSystem';

export interface XRSelectEvent {
  domain: RitualDomain;
  intensified: boolean;
  source: 'left' | 'right';
}

interface ControllerState {
  hand: 'left' | 'right';
  controller: Group;
  line: Line;
  raycaster: Raycaster;
  targetDomain: RitualDomain | null;
}

export class XRInputRig {
  readonly group = new Group();
  private readonly tempMatrix = new Matrix4();
  private readonly states: ControllerState[] = [];

  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly glyphSystem: GlyphSystem,
    private readonly onSelect: (event: XRSelectEvent) => void,
    private readonly onRollKelvin: (rollRadians: number) => void
  ) {
    this.states.push(this.createController(0, 'right'));
    this.states.push(this.createController(1, 'left'));
  }

  update(): void {
    for (const state of this.states) {
      this.tempMatrix.identity().extractRotation(state.controller.matrixWorld);
      state.raycaster.ray.origin.setFromMatrixPosition(state.controller.matrixWorld);
      state.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix).normalize();

      const intersections = state.raycaster.intersectObjects(this.glyphSystem.pickables, false);
      const hit = this.readHit(intersections);
      state.targetDomain = hit?.object.userData.domain ?? null;

      state.line.scale.z = hit ? hit.distance : 5;
      this.onRollKelvin(state.controller.rotation.z);
    }
  }

  private createController(index: number, hand: 'left' | 'right'): ControllerState {
    const controller = this.renderer.xr.getController(index);
    controller.userData.hand = hand;

    const lineGeometry = new BufferGeometry().setFromPoints([new Vector3(), new Vector3(0, 0, -1)]);
    const lineMaterial = new LineBasicMaterial({ color: hand === 'right' ? 0xffaa77 : 0x77aaff });
    const line = new Line(lineGeometry, lineMaterial);
    line.scale.z = 5;
    controller.add(line);

    const state: ControllerState = {
      hand,
      controller,
      line,
      raycaster: new Raycaster(),
      targetDomain: null
    };

    controller.addEventListener('selectstart', () => {
      if (!state.targetDomain) {
        return;
      }
      const other = this.states.find((entry) => entry.hand !== hand);
      const intensified = other?.targetDomain === state.targetDomain;
      this.onSelect({ domain: state.targetDomain, intensified: Boolean(intensified), source: hand });
    });

    this.group.add(controller);
    return state;
  }

  private readHit(intersections: Intersection<Object3D>[]): Intersection<Object3D> | null {
    if (intersections.length === 0) {
      return null;
    }
    return intersections[0];
  }
}
