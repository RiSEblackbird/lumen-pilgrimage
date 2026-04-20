import {
  CircleGeometry,
  Color,
  Fog,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  DoubleSide
} from 'three';
import { RITUAL_CONFIG, RitualDomain } from '../app/RitualState';
import { KelvinLightRig } from './KelvinLightRig';
import { SpiritParticles } from './SpiritParticles';

export class Sanctuary {
  readonly group = new Group();
  readonly kelvinRig = new KelvinLightRig();
  readonly particles = new SpiritParticles();

  private readonly fogLayerA: Mesh;
  private readonly fogLayerB: Mesh;

  constructor(private readonly scene: Scene) {
    const floor = new Mesh(
      new CircleGeometry(5, 64),
      new MeshStandardMaterial({ color: 0x10121c, roughness: 0.9, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);

    this.fogLayerA = new Mesh(
      new PlaneGeometry(12, 12),
      new MeshStandardMaterial({ color: 0x1a2436, transparent: true, opacity: 0.09, side: DoubleSide })
    );
    this.fogLayerA.rotation.x = -Math.PI / 2;
    this.fogLayerA.position.y = 0.5;

    this.fogLayerB = this.fogLayerA.clone();
    this.fogLayerB.position.y = 1.1;
    this.fogLayerB.scale.setScalar(0.85);

    this.group.add(this.fogLayerA, this.fogLayerB, this.kelvinRig.group, this.particles.group);

    this.scene.add(this.group);
    this.scene.fog = new Fog(new Color(0x111723), 2, 16);
  }

  applyDomain(domain: RitualDomain): void {
    const config = RITUAL_CONFIG[domain];
    this.scene.fog = new Fog(config.fogColor, 2, 16);
    this.kelvinRig.setKelvin(config.kelvin);
    this.particles.setHue(config.particleHue);

    const baseColor = new Color(config.fogColor).multiplyScalar(1.5);
    (this.fogLayerA.material as MeshStandardMaterial).color.copy(baseColor);
    (this.fogLayerB.material as MeshStandardMaterial).color.copy(baseColor.clone().offsetHSL(0.02, 0.04, 0.03));
  }

  tick(timeSeconds: number): void {
    this.particles.tick(timeSeconds);
    this.fogLayerA.rotation.z = timeSeconds * 0.01;
    this.fogLayerB.rotation.z = -timeSeconds * 0.008;
  }
}
