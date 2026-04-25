import { Color, DirectionalLight, FogExp2, HemisphereLight, Scene } from 'three';
import type { ArenaDeviceVisualHooks } from '../game/director/ArenaMutationDirector';
import { resolveBiomeMood, type BiomeMoodDefinition } from '../content/biomes/BiomeMoodDefs';

export class WorldAssembler {
  private readonly keyLight: DirectionalLight;
  private readonly fillLight: HemisphereLight;
  private activeMood: BiomeMoodDefinition = resolveBiomeMood('pilgrims-belfry');
  private activeMoodId = '';
  private targetKeyIntensity = this.activeMood.keyLightIntensity;
  private targetFillIntensity = this.activeMood.fillLightIntensity;

  constructor(private readonly scene: Scene) {
    this.keyLight = new DirectionalLight(this.activeMood.keyLightHex, this.activeMood.keyLightIntensity);
    this.keyLight.position.set(4, 9, 1.5);
    this.fillLight = new HemisphereLight(this.activeMood.fillLightHex, 0x0a0e16, this.activeMood.fillLightIntensity);
    this.fillLight.position.set(0, 6, 0);
    this.scene.add(this.keyLight, this.fillLight);
    this.applyMood('pilgrims-belfry');
  }

  enterHub(): void {
    this.applyMood('pilgrims-belfry');
  }

  enterExpedition(biomeId: string): void {
    this.applyMood(biomeId);
  }

  applyArenaVisualHooks(hooks: ArenaDeviceVisualHooks): void {
    const pressure = Math.max(hooks.channels.hazard, hooks.channels.focus, hooks.channels.guard, hooks.channels.overburn);
    this.targetKeyIntensity = this.activeMood.keyLightIntensity + pressure * 0.38;
    this.targetFillIntensity = this.activeMood.fillLightIntensity + pressure * 0.22;
  }

  tick(deltaSeconds: number): void {
    const smoothing = Math.min(1, deltaSeconds * 3.5);
    this.keyLight.intensity = this.lerp(this.keyLight.intensity, this.targetKeyIntensity, smoothing);
    this.fillLight.intensity = this.lerp(this.fillLight.intensity, this.targetFillIntensity, smoothing);
  }

  private applyMood(biomeId: string): void {
    const resolved = resolveBiomeMood(biomeId);
    if (resolved.id === this.activeMoodId) {
      return;
    }

    this.activeMood = resolved;
    this.activeMoodId = resolved.id;
    const background = new Color(this.activeMood.backgroundHex);
    this.scene.background = background;
    this.scene.fog = new FogExp2(this.activeMood.fogHex, this.activeMood.fogDensity);

    this.keyLight.color.setHex(this.activeMood.keyLightHex);
    this.fillLight.color.setHex(this.activeMood.fillLightHex);
    this.targetKeyIntensity = this.activeMood.keyLightIntensity;
    this.targetFillIntensity = this.activeMood.fillLightIntensity;
    this.keyLight.intensity = this.activeMood.keyLightIntensity;
    this.fillLight.intensity = this.activeMood.fillLightIntensity;
  }

  private lerp(from: number, to: number, alpha: number): number {
    return from + (to - from) * alpha;
  }
}
