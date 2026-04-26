import { Color, DirectionalLight, FogExp2, HemisphereLight, PointLight, Scene, SpotLight } from 'three';
import type { ArenaDeviceVisualHooks } from '../game/director/ArenaMutationDirector';
import { resolveBiomeMood, type BiomeMoodDefinition } from '../content/biomes/BiomeMoodDefs';

export class WorldAssembler {
  private readonly keyLight: DirectionalLight;
  private readonly fillLight: HemisphereLight;
  private readonly sweepLight: SpotLight;
  private readonly flareLight: PointLight;
  private readonly causticLight: SpotLight;
  private activeMood: BiomeMoodDefinition = resolveBiomeMood('pilgrims-belfry');
  private activeMoodId = '';
  private targetKeyIntensity = this.activeMood.keyLightIntensity;
  private targetFillIntensity = this.activeMood.fillLightIntensity;
  private baseFogDensity = this.activeMood.fogDensity;
  private transitionTimer = 0;
  private transitionDuration = this.activeMood.transition.beatSeconds;
  private pressure = 0;

  constructor(private readonly scene: Scene) {
    this.keyLight = new DirectionalLight(this.activeMood.keyLightHex, this.activeMood.keyLightIntensity);
    this.keyLight.position.set(4, 9, 1.5);
    this.fillLight = new HemisphereLight(this.activeMood.fillLightHex, 0x0a0e16, this.activeMood.fillLightIntensity);
    this.fillLight.position.set(0, 6, 0);
    this.sweepLight = new SpotLight(this.activeMood.keyLightHex, 0, 18, 0.66, 0.6, 1.35);
    this.sweepLight.position.set(-6, 7, -2.5);
    this.sweepLight.target.position.set(4, 1, 3);
    this.flareLight = new PointLight(this.activeMood.keyLightHex, 0, 8, 1.5);
    this.flareLight.position.set(0, 1.2, 0);
    this.causticLight = new SpotLight(this.activeMood.fillLightHex, 0, 20, 0.85, 0.75, 1.8);
    this.causticLight.position.set(3.5, 6.5, -4);
    this.causticLight.target.position.set(-2, 0, 2);

    this.scene.add(this.keyLight, this.fillLight, this.sweepLight, this.flareLight, this.causticLight);
    this.scene.add(this.sweepLight.target, this.causticLight.target);
    this.applyMood('pilgrims-belfry');
  }

  enterHub(): void {
    this.applyMood('pilgrims-belfry');
  }

  enterExpedition(biomeId: string): void {
    this.applyMood(biomeId);
  }

  applyArenaVisualHooks(hooks: ArenaDeviceVisualHooks): void {
    this.pressure = Math.max(hooks.channels.hazard, hooks.channels.focus, hooks.channels.guard, hooks.channels.overburn);
    this.targetKeyIntensity = this.activeMood.keyLightIntensity + this.pressure * 0.38;
    this.targetFillIntensity = this.activeMood.fillLightIntensity + this.pressure * 0.22;
  }

  tick(deltaSeconds: number): void {
    const smoothing = Math.min(1, deltaSeconds * 3.5);
    this.keyLight.intensity = this.lerp(this.keyLight.intensity, this.targetKeyIntensity, smoothing);
    this.fillLight.intensity = this.lerp(this.fillLight.intensity, this.targetFillIntensity, smoothing);
    this.tickTransitionFx(deltaSeconds);
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
    this.sweepLight.color.setHex(this.activeMood.keyLightHex);
    this.flareLight.color.setHex(this.activeMood.keyLightHex);
    this.causticLight.color.setHex(this.activeMood.fillLightHex);

    this.baseFogDensity = this.activeMood.fogDensity;
    this.targetKeyIntensity = this.activeMood.keyLightIntensity;
    this.targetFillIntensity = this.activeMood.fillLightIntensity;
    this.keyLight.intensity = this.activeMood.keyLightIntensity;
    this.fillLight.intensity = this.activeMood.fillLightIntensity;
    this.transitionTimer = this.activeMood.transition.beatSeconds;
    this.transitionDuration = this.activeMood.transition.beatSeconds;
  }

  private lerp(from: number, to: number, alpha: number): number {
    return from + (to - from) * alpha;
  }

  private tickTransitionFx(deltaSeconds: number): void {
    this.transitionTimer = Math.max(0, this.transitionTimer - deltaSeconds);
    const progress = this.transitionDuration <= 0 ? 1 : 1 - this.transitionTimer / this.transitionDuration;
    const clampedProgress = this.clamp(progress, 0, 1);
    const transitionInfluence = 1 - clampedProgress;
    const pulse = Math.sin(clampedProgress * Math.PI * 4) * 0.5 + 0.5;

    this.sweepLight.intensity = (this.activeMood.transition.sweepBoost * transitionInfluence + this.pressure * 0.36) * (0.45 + pulse * 0.55);
    this.sweepLight.penumbra = this.lerp(0.35, 0.82, clampedProgress);

    this.flareLight.intensity = (this.activeMood.transition.flareBoost * transitionInfluence + this.pressure * 0.42) * (0.6 + pulse * 0.4);
    this.flareLight.distance = this.lerp(4, 9, clampedProgress);

    this.causticLight.intensity = (this.activeMood.transition.causticBoost * transitionInfluence + this.pressure * 0.3) * (0.4 + pulse * 0.6);
    this.causticLight.angle = this.lerp(0.55, 0.92, clampedProgress);

    const fog = this.scene.fog;
    if (fog instanceof FogExp2) {
      fog.density = this.baseFogDensity + this.activeMood.transition.fogPulse * transitionInfluence + this.pressure * 0.003;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
