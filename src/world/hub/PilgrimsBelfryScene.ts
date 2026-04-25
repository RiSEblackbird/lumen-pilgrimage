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
import { HubTerminalDirector, type HubTerminalAction, type HubTerminalId, type HubTerminalWidgetState } from './HubTerminalDirector';
import type { XRPointerRay } from '../../engine/input/XRActionAdapter';
import type { ArenaDeviceVisualHooks } from '../../game/director/ArenaMutationDirector';

interface TerminalWidgetMeshes {
  readonly stem: Mesh;
  readonly meter: Mesh;
  readonly halo: Mesh;
  state: HubTerminalWidgetState;
}

export class PilgrimsBelfryScene {
  private readonly arena: Mesh;
  private readonly terminalDirector: HubTerminalDirector;
  private readonly terminalRing: Mesh;
  private readonly leftHandBeacon: Mesh;
  private readonly rightHandBeacon: Mesh;
  private readonly terminalMeshes: readonly Mesh[];
  private readonly terminalWidgets = new Map<HubTerminalId, TerminalWidgetMeshes>();
  private readonly pointerRaycaster = new Raycaster();
  private reduceFlashing = false;
  private arenaVisualHooks: ArenaDeviceVisualHooks = {
    biomeId: 'default',
    phaseTitle: 'No phase',
    channels: { hazard: 0, focus: 0, guard: 0, overburn: 0 },
    dominantDeviceLabel: 'No arena devices active',
    visualSummary: 'Arena Visuals H0 F0 G0 O0 · No arena devices active'
  };

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

    this.leftHandBeacon = this.createPointerBeacon(0x4cb8ff);
    this.rightHandBeacon = this.createPointerBeacon(0xff9f4c);

    this.createTerminalWidgets();

    this.scene.add(ambience, key, this.arena, this.terminalRing, this.leftHandBeacon, this.rightHandBeacon, ...terminalMeshes);
  }

  tick(elapsedSeconds: number): void {
    const speed = this.reduceFlashing ? 0.12 : 0.25;
    this.arena.rotation.y = elapsedSeconds * speed;

    this.applyArenaVisualHookPulse(elapsedSeconds);

    const pulseScale = this.reduceFlashing ? 0.06 : 0.14;
    this.terminalRing.scale.setScalar(1 + Math.sin(elapsedSeconds * 3.2) * pulseScale);

    if (this.leftHandBeacon.visible) {
      this.leftHandBeacon.scale.setScalar(1 + Math.sin(elapsedSeconds * 4.1) * 0.08);
    }
    if (this.rightHandBeacon.visible) {
      this.rightHandBeacon.scale.setScalar(1 + Math.sin(elapsedSeconds * 4.1 + Math.PI / 2) * 0.08);
    }

    this.animateTerminalWidgets(elapsedSeconds);
  }

  cycleHubTerminal(): string {
    this.terminalDirector.cycleSelection();
    this.terminalRing.position.copy(this.getTerminalRingAnchor());
    this.refreshWidgetHighlights();
    this.clearPointerAffordance();
    return this.terminalDirector.getSelectedLabel();
  }

  activateHubTerminal(): HubTerminalAction {
    return this.terminalDirector.activateSelection();
  }

  getSelectedHubTerminalLabel(): string {
    return this.terminalDirector.getSelectedLabel();
  }

  setTerminalWidgetState(terminalId: HubTerminalId, state: HubTerminalWidgetState): void {
    const widget = this.terminalWidgets.get(terminalId);
    if (!widget) {
      return;
    }

    widget.state = {
      label: state.label,
      intensity: this.clamp01(state.intensity)
    };
    this.applyWidgetState(terminalId, widget);
  }

  selectHubTerminalFromRay(origin: Vector3, direction: Vector3): string | null {
    this.pointerRaycaster.set(origin, direction.clone().normalize());
    const intersections = this.pointerRaycaster.intersectObjects([...this.terminalMeshes], false);
    const closest = intersections.find((hit): hit is Intersection<Mesh> => hit.object instanceof Mesh);
    if (!closest) {
      this.clearPointerAffordance();
      return null;
    }

    const hitIndex = this.terminalMeshes.findIndex((mesh) => mesh === closest.object);
    if (hitIndex < 0) {
      this.clearPointerAffordance();
      return null;
    }

    this.terminalDirector.setSelectedIndex(hitIndex);
    this.terminalRing.position.copy(this.getTerminalRingAnchor());
    this.refreshWidgetHighlights();
    this.clearPointerAffordance();
    return this.terminalDirector.getSelectedLabel();
  }

  selectHubTerminalFromPointerRays(pointerRays: readonly XRPointerRay[]): HubPointerSelection | null {
    let best: HubPointerSelection | null = null;

    for (const pointerRay of pointerRays) {
      this.pointerRaycaster.set(pointerRay.origin, pointerRay.direction.clone().normalize());
      const intersections = this.pointerRaycaster.intersectObjects([...this.terminalMeshes], false);
      const closest = intersections.find((hit): hit is Intersection<Mesh> => hit.object instanceof Mesh);
      if (!closest) {
        continue;
      }

      const hitIndex = this.terminalMeshes.findIndex((mesh) => mesh === closest.object);
      if (hitIndex < 0) {
        continue;
      }

      if (!best || closest.distance < best.distance) {
        const label = this.terminalDirector.getLabelByIndex(hitIndex);
        if (!label) {
          continue;
        }
        best = {
          terminalIndex: hitIndex,
          label,
          distance: closest.distance,
          handedness: pointerRay.handedness
        };
      }
    }

    if (!best) {
      this.clearPointerAffordance();
      return null;
    }

    this.terminalDirector.setSelectedIndex(best.terminalIndex);
    this.terminalRing.position.copy(this.getTerminalRingAnchor());
    this.refreshWidgetHighlights();
    this.updatePointerAffordance(best.handedness);
    return {
      ...best,
      label: this.terminalDirector.getSelectedLabel()
    };
  }

  clearPointerAffordance(): void {
    this.leftHandBeacon.visible = false;
    this.rightHandBeacon.visible = false;
  }

  setReduceFlashing(enabled: boolean): void {
    this.reduceFlashing = enabled;
  }

  setArenaVisualHooks(hooks: ArenaDeviceVisualHooks): void {
    this.arenaVisualHooks = hooks;
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

  private createTerminalWidgets(): void {
    const meterGeometry = new BoxGeometry(0.12, 1, 0.12);
    const stemGeometry = new BoxGeometry(0.18, 0.1, 0.18);
    const haloGeometry = new TorusGeometry(0.2, 0.015, 8, 20);

    for (const [index, terminal] of this.terminalMeshes.entries()) {
      const terminalId = this.terminalDirector.getTerminalIdByIndex(index);
      if (!terminalId) {
        continue;
      }

      const stem = new Mesh(
        stemGeometry,
        new MeshStandardMaterial({
          color: 0x1c2434,
          emissive: 0x1c2434,
          emissiveIntensity: 0.2,
          roughness: 0.55,
          metalness: 0.3
        })
      );
      const meter = new Mesh(
        meterGeometry,
        new MeshStandardMaterial({
          color: 0x5fa8ff,
          emissive: 0x5fa8ff,
          emissiveIntensity: 0.45,
          roughness: 0.32,
          metalness: 0.12
        })
      );
      const halo = new Mesh(
        haloGeometry,
        new MeshStandardMaterial({
          color: 0x87b8ff,
          emissive: 0x87b8ff,
          emissiveIntensity: 0.35,
          roughness: 0.35,
          metalness: 0.08
        })
      );
      halo.rotation.x = Math.PI / 2;

      stem.position.set(terminal.position.x, 2.14, terminal.position.z + 0.42);
      meter.position.set(terminal.position.x, 2.24, terminal.position.z + 0.42);
      halo.position.set(terminal.position.x, 2.66, terminal.position.z + 0.42);

      this.scene.add(stem, meter, halo);

      const widget: TerminalWidgetMeshes = {
        stem,
        meter,
        halo,
        state: {
          label: 'Idle',
          intensity: 0.45
        }
      };

      this.terminalWidgets.set(terminalId, widget);
      this.applyWidgetState(terminalId, widget);
    }
  }

  private animateTerminalWidgets(elapsedSeconds: number): void {
    const selectedTerminalId = this.terminalDirector.getSelectedTerminalId();
    for (const [terminalId, widget] of this.terminalWidgets.entries()) {
      const highlight = terminalId === selectedTerminalId ? 1 : 0;
      const pulseAmplitude = this.reduceFlashing ? 0.02 : 0.05;
      const pulse = 1 + Math.sin(elapsedSeconds * 2.8 + (highlight > 0 ? Math.PI / 3 : 0)) * pulseAmplitude;
      widget.halo.scale.setScalar(pulse + highlight * 0.08);
      const haloMaterial = widget.halo.material;
      if (haloMaterial instanceof MeshStandardMaterial) {
        haloMaterial.emissiveIntensity = this.reduceFlashing ? 0.2 + highlight * 0.15 : 0.3 + highlight * 0.35;
      }
    }
  }

  private refreshWidgetHighlights(): void {
    for (const [terminalId, widget] of this.terminalWidgets.entries()) {
      this.applyWidgetState(terminalId, widget);
    }
  }

  private applyWidgetState(terminalId: HubTerminalId, widget: TerminalWidgetMeshes): void {
    const intensity = this.clamp01(widget.state.intensity);
    const highlight = terminalId === this.terminalDirector.getSelectedTerminalId();

    widget.meter.scale.y = 0.18 + intensity * 0.82;
    widget.meter.position.y = 2.14 + widget.meter.scale.y * 0.5;

    const meterMaterial = widget.meter.material;
    if (meterMaterial instanceof MeshStandardMaterial) {
      const meterColor = this.resolveMeterColor(intensity, highlight);
      meterMaterial.color.copy(meterColor);
      meterMaterial.emissive.copy(meterColor);
      meterMaterial.emissiveIntensity = 0.25 + intensity * 0.7 + (highlight ? 0.2 : 0);
    }

    const stemMaterial = widget.stem.material;
    if (stemMaterial instanceof MeshStandardMaterial) {
      const stemBoost = 0.14 + intensity * 0.3;
      stemMaterial.emissiveIntensity = highlight ? stemBoost + 0.18 : stemBoost;
    }

    const haloMaterial = widget.halo.material;
    if (haloMaterial instanceof MeshStandardMaterial) {
      const haloColor = this.resolveMeterColor(Math.min(1, intensity + 0.14), highlight);
      haloMaterial.color.copy(haloColor);
      haloMaterial.emissive.copy(haloColor);
    }

    widget.halo.userData.label = widget.state.label;
  }

  private createPointerBeacon(color: number): Mesh {
    const beacon = new Mesh(
      new TorusGeometry(0.13, 0.02, 8, 20),
      new MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.7,
        roughness: 0.35,
        metalness: 0.12
      })
    );
    beacon.rotation.y = Math.PI / 2;
    beacon.visible = false;
    return beacon;
  }

  private updatePointerAffordance(handedness: XRHandedness): void {
    const selectedTerminal = this.terminalMeshes[this.terminalDirector.getSelectedIndex()];
    const basePosition = selectedTerminal.position;

    this.leftHandBeacon.visible = handedness === 'left';
    this.rightHandBeacon.visible = handedness === 'right';

    this.leftHandBeacon.position.set(basePosition.x - 0.34, 1.04, basePosition.z);
    this.rightHandBeacon.position.set(basePosition.x + 0.34, 1.04, basePosition.z);
  }

  private getTerminalRingAnchor(): Vector3 {
    const selectedTerminal = this.terminalMeshes[this.terminalDirector.getSelectedIndex()];
    return new Vector3(selectedTerminal.position.x, 0.86, selectedTerminal.position.z);
  }

  private applyArenaVisualHookPulse(elapsedSeconds: number): void {
    const arenaMaterial = this.arena.material;
    if (!(arenaMaterial instanceof MeshStandardMaterial)) {
      return;
    }

    const channels = this.arenaVisualHooks.channels;
    const base = new Color(0x394255);
    const hazard = new Color(0xc76c44).multiplyScalar(channels.hazard);
    const focus = new Color(0x5a98dd).multiplyScalar(channels.focus);
    const guard = new Color(0x8f7bd4).multiplyScalar(channels.guard);
    const overburn = new Color(0xd8a232).multiplyScalar(channels.overburn);
    const mixed = base.clone().add(hazard).add(focus).add(guard).add(overburn);
    arenaMaterial.color.copy(mixed);
    arenaMaterial.emissive.copy(mixed.clone().multiplyScalar(0.45));
    const pulseBase = this.reduceFlashing ? 0.08 : 0.18;
    const pulseAmp = this.reduceFlashing ? 0.06 : 0.14;
    const pressure = Math.max(channels.hazard, channels.focus, channels.guard, channels.overburn);
    arenaMaterial.emissiveIntensity = pulseBase + pressure * 0.28 + Math.sin(elapsedSeconds * 3.4) * pulseAmp * pressure;
  }

  private resolveMeterColor(intensity: number, highlighted: boolean): Color {
    const low = new Color(0x2e4d7d);
    const high = new Color(0x9fe7ff);
    const color = low.lerp(high, intensity);
    if (highlighted) {
      color.lerp(new Color(0xffffff), 0.2);
    }
    return color;
  }

  private clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
  }
}

export interface HubPointerSelection {
  readonly terminalIndex: number;
  readonly label: string;
  readonly distance: number;
  readonly handedness: XRHandedness;
}
