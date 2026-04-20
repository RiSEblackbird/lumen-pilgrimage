import { DirectionalLight, Group, PointLight } from 'three';
import * as ColorUtils from 'three/addons/utils/ColorUtils.js';

export class KelvinLightRig {
  readonly group = new Group();
  private readonly moonLight: DirectionalLight;
  private readonly candleLight: PointLight;
  private kelvin = 3200;

  constructor() {
    this.moonLight = new DirectionalLight(0xffffff, 1.2);
    this.moonLight.position.set(-3, 5, 2);
    this.group.add(this.moonLight);

    this.candleLight = new PointLight(0xffffff, 0.8, 8, 2);
    this.candleLight.position.set(0, 1.5, 0);
    this.group.add(this.candleLight);

    this.setKelvin(3200);
  }

  setKelvin(kelvin: number): void {
    this.kelvin = Math.max(1000, Math.min(12000, kelvin));
    ColorUtils.setKelvin(this.moonLight.color, this.kelvin + 1200);
    ColorUtils.setKelvin(this.candleLight.color, this.kelvin);
  }

  adjustByRoll(rollRadians: number): void {
    const normalized = Math.max(-1, Math.min(1, rollRadians / Math.PI));
    this.setKelvin(4200 + normalized * 2200);
  }

  get currentKelvin(): number {
    return this.kelvin;
  }
}
