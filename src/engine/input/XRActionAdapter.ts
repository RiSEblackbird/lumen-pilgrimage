import { Group, Quaternion, Vector3, type WebGLRenderer } from 'three';

export interface XRComfortSettings {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
}

export interface XRSessionStatus {
  readonly active: boolean;
  readonly referenceSpaceReady: boolean;
  readonly lifecycleLabel: string;
}

export class XRActionAdapter {
  private inSession = false;
  private referenceSpaceReady = false;
  private lifecycleLabel = 'XR fallback active (flat-screen)';
  private comfort: XRComfortSettings = {
    snapTurn: true,
    seatedMode: false
  };
  private readonly controllers: readonly Group[];
  private readonly controllerHandedness = new Map<Group, XRHandedness>();
  private readonly pointerDirection = new Vector3(0, 0, -1);
  private readonly pointerOriginBuffer = new Vector3();
  private readonly pointerDirectionBuffer = new Vector3();
  private readonly pointerQuaternionBuffer = new Quaternion();

  constructor(renderer: WebGLRenderer) {
    const leftOrPrimary = renderer.xr.getController(0);
    const rightOrSecondary = renderer.xr.getController(1);
    this.controllers = [leftOrPrimary, rightOrSecondary];

    for (const controller of this.controllers) {
      const xrController = controller as unknown as {
        addEventListener: (type: string, listener: (event: { readonly data?: XRInputSource }) => void) => void;
      };
      xrController.addEventListener('connected', (event) => {
        const data = (event as { readonly data?: XRInputSource }).data;
        this.controllerHandedness.set(controller, data?.handedness ?? 'none');
      });
      xrController.addEventListener('disconnected', () => {
        this.controllerHandedness.delete(controller);
      });
    }

  }

  isPresenting(): boolean {
    return this.inSession;
  }

  applySessionStatus(status: XRSessionStatus): void {
    this.inSession = status.active;
    this.referenceSpaceReady = status.referenceSpaceReady;
    this.lifecycleLabel = status.lifecycleLabel;
  }

  getSessionStatusLabel(): string {
    return this.lifecycleLabel;
  }

  setComfort(settings: XRComfortSettings): void {
    this.comfort = settings;
  }

  getComfortStatus(): string {
    const posture = this.comfort.seatedMode ? 'Seated' : 'Standing';
    const turnMode = this.comfort.snapTurn ? 'SnapTurn' : 'SmoothTurn';
    const refSpace = this.referenceSpaceReady ? 'RefSpace OK' : 'RefSpace Recovery';
    return `${turnMode} / ${posture} / ${refSpace}`;
  }

  getControllerPointerRays(): readonly XRPointerRay[] {
    const rays: XRPointerRay[] = [];

    for (const controller of this.controllers) {
      const handedness = this.controllerHandedness.get(controller);
      if (!this.inSession || !this.referenceSpaceReady || !handedness || !controller.visible) {
        continue;
      }

      const origin = controller.getWorldPosition(this.pointerOriginBuffer).clone();
      const direction = this.pointerDirectionBuffer
        .copy(this.pointerDirection)
        .applyQuaternion(controller.getWorldQuaternion(this.pointerQuaternionBuffer))
        .normalize();

      rays.push({
        origin,
        direction: direction.clone(),
        handedness
      });
    }

    return rays;
  }
}

export interface XRPointerRay {
  readonly origin: Vector3;
  readonly direction: Vector3;
  readonly handedness: XRHandedness;
}
