import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Intersection,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Scene,
  TorusGeometry,
  Vector3
} from 'three';
import { HubTerminalDirector, type HubTerminalAction } from './HubTerminalDirector';

export class PilgrimsBelfryScene {
  private readonly arena: Mesh;
  private readonly terminalDirector: HubTerminalDirector;
  private readonly terminalRing: Mesh;
  private readonly terminalMeshes: readonly Mesh[];
  private readonly pointerRaycaster = new Raycaster();
  private reduceFlashing = false;

  constructor(private readonly scene: Scene) {
    this.scene.background = new Color(0x06080f);

    const ambience = new AmbientLight(0x7f8aa8, 0.9);
    const key = new DirectionalLight(0xffe4bc, 1.2);
    key.position.set(3, 8, 2);

    this.arena = new Mesh(
      new BoxGeometry(2.4, 0.6, 2.4),
      new MeshStandardMaterial({ color: 0x4f5568, roughness: 0.78, metalness: 0.1 })
    );
    this.arena.position.set(0, 1, -3);

    const terminalMeshes = this.createTerminalPedestals();
    this.terminalMeshes = terminalMeshes;
    this.terminalDirector = new HubTerminalDirector(terminalMeshes);

    this.terminalRing = new Mesh(
      new TorusGeometry(0.38, 0.03, 8, 24),
      new MeshStandardMaterial({ color: 0x8cc8ff, emissive: 0x8cc8ff, emissiveIntensity: 0.45, metalness: 0.12, roughness: 0.42 })
    );
    this.terminalRing.rotation.x = Math.PI / 2;
    this.terminalRing.position.copy(this.getTerminalRingAnchor());

    this.scene.add(ambience, key, this.arena, this.terminalRing, ...terminalMeshes);
  }

  tick(elapsedSeconds: number): void {
    const speed = this.reduceFlashing ? 0.12 : 0.25;
    this.arena.rotation.y = elapsedSeconds * speed;

    const pulseScale = this.reduceFlashing ? 0.06 : 0.14;
    this.terminalRing.scale.setScalar(1 + Math.sin(elapsedSeconds * 3.2) * pulseScale);
  }

  cycleHubTerminal(): string {
    this.terminalDirector.cycleSelection();
    this.terminalRing.position.copy(this.getTerminalRingAnchor());
    return this.terminalDirector.getSelectedLabel();
  }

  activateHubTerminal(): HubTerminalAction {
    return this.terminalDirector.activateSelection();
  }

  getSelectedHubTerminalLabel(): string {
    return this.terminalDirector.getSelectedLabel();
  }

  selectHubTerminalFromRay(origin: Vector3, direction: Vector3): string | null {
    this.pointerRaycaster.set(origin, direction.clone().normalize());
    const intersections = this.pointerRaycaster.intersectObjects([...this.terminalMeshes], false);
    const closest = intersections.find((hit): hit is Intersection<Mesh> => hit.object instanceof Mesh);
    if (!closest) {
      return null;
    }

    const hitIndex = this.terminalMeshes.findIndex((mesh) => mesh === closest.object);
    if (hitIndex < 0) {
      return null;
    }

    this.terminalDirector.setSelectedIndex(hitIndex);
    this.terminalRing.position.copy(this.getTerminalRingAnchor());
    return this.terminalDirector.getSelectedLabel();
  }

  setReduceFlashing(enabled: boolean): void {
    this.reduceFlashing = enabled;
  }

  private createTerminalPedestals(): Mesh[] {
    const createTerminal = (x: number, color: number): Mesh => {
      const terminal = new Mesh(
        new BoxGeometry(0.52, 1.2, 0.52),
        new MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.2, emissive: color, emissiveIntensity: 0.16 })
      );
      terminal.position.set(x, 1.45, -4.15);
      return terminal;
    };

    return [createTerminal(-1.25, 0x35506e), createTerminal(0, 0x5b3f24), createTerminal(1.25, 0x4f2454)];
  }

  private getTerminalRingAnchor(): Vector3 {
    const label = this.terminalDirector.getSelectedLabel();
    if (label === 'Meta Upgrade Terminal') {
      return new Vector3(0, 0.86, -4.15);
    }
    if (label === 'Return Terminal') {
      return new Vector3(1.25, 0.86, -4.15);
    }
    return new Vector3(-1.25, 0.86, -4.15);
  }
}
