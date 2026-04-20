import { Group, Scene, WebGLRenderer } from 'three';
import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
import { LightProbeGridHelper } from 'three/addons/helpers/LightProbeGridHelper.js';
import { RITUAL_CONFIG, RitualDomain } from '../app/RitualState';

export class ProbeVolumeManager {
  readonly group = new Group();
  private readonly probeGrid: LightProbeGrid;
  private readonly helper: LightProbeGridHelper;

  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly scene: Scene
  ) {
    this.probeGrid = new LightProbeGrid(8, 4, 8, 6, 3, 6);
    this.probeGrid.position.set(0, 2, 0);
    this.group.add(this.probeGrid);

    this.helper = new LightProbeGridHelper(this.probeGrid, 0.08);
    this.helper.visible = false;
    this.group.add(this.helper);

    scene.add(this.group);
    this.bakeOnLoad();
  }

  bakeOnLoad(): void {
    this.probeGrid.bake(this.renderer, this.scene, { near: 0.2, far: 16 });
  }

  bakeForDomain(domain: RitualDomain): void {
    const probeScale = RITUAL_CONFIG[domain].probeIntensity;
    this.probeGrid.scale.setScalar(probeScale);
    this.probeGrid.updateBoundingBox();
    this.probeGrid.bake(this.renderer, this.scene, { near: 0.2, far: 16 });
  }

  setSpiritVision(visible: boolean): void {
    this.helper.visible = visible;
  }
}
