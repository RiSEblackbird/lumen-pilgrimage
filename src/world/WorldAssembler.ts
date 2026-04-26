import { Color, DirectionalLight, FogExp2, HemisphereLight, PointLight, Scene, SpotLight } from 'three';
import type { ArenaDeviceVisualHooks } from '../game/director/ArenaMutationDirector';
import { resolveBiomeMood, type BiomeMoodDefinition } from '../content/biomes/BiomeMoodDefs';
import { resolveArenaDeviceVisualPreset, type ArenaDeviceVisualPreset } from '../content/biomes/ArenaDeviceVisualPresets';

export class WorldAssembler {
  private readonly keyLight: DirectionalLight;
  private readonly fillLight: HemisphereLight;
  private readonly sweepLight: SpotLight;
  private readonly flareLight: PointLight;
  private readonly causticLight: SpotLight;
  private activeMood: BiomeMoodDefinition = resolveBiomeMood('pilgrims-belfry');
  private activeMoodId = '';
  private activeVisualPreset: ArenaDeviceVisualPreset = resolveArenaDeviceVisualPreset('pilgrims-belfry');
  private targetKeyIntensity = this.activeMood.keyLightIntensity;
  private targetFillIntensity = this.activeMood.fillLightIntensity;
  private baseFogDensity = this.activeMood.fogDensity;
  private transitionTimer = 0;
  private transitionDuration = this.activeMood.transition.beatSeconds;
  private pressure = 0;
  private sweepBias = 0;
  private flareBias = 0;
  private causticBias = 0;
  private fogBias = 0;
  private targetSweep = { x: 4, y: 1, z: 3 };
  private targetCaustic = { x: -2, y: 0, z: 2 };

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
    this.activeVisualPreset = resolveArenaDeviceVisualPreset(hooks.biomeId);
    const weightedHazard = hooks.channels.hazard * this.activeVisualPreset.channelWeights.hazard;
    const weightedFocus = hooks.channels.focus * this.activeVisualPreset.channelWeights.focus;
    const weightedGuard = hooks.channels.guard * this.activeVisualPreset.channelWeights.guard;
    const weightedOverburn = hooks.channels.overburn * this.activeVisualPreset.channelWeights.overburn;

    this.pressure = this.clamp(Math.max(weightedHazard, weightedFocus, weightedGuard, weightedOverburn), 0, 1.8);
    this.targetKeyIntensity = this.activeMood.keyLightIntensity + this.pressure * 0.38;
    this.targetFillIntensity = this.activeMood.fillLightIntensity + this.pressure * 0.22;

    this.sweepBias = weightedGuard * 0.34 + weightedHazard * 0.26 + weightedOverburn * 0.12;
    this.flareBias = weightedOverburn * 0.44 + weightedHazard * 0.18;
    this.causticBias = weightedFocus * 0.42 + weightedGuard * 0.14;
    this.fogBias = weightedHazard * 0.28 + weightedFocus * 0.16 + weightedOverburn * 0.2;

    const deviceIntensity = Math.min(1, hooks.dominantDeviceLabel === 'No arena devices active' ? 0 : this.pressure * 0.85 + 0.2);
    const [sweepX, sweepY, sweepZ] = this.activeVisualPreset.sweepTarget;
    this.targetSweep = {
      x: this.lerp(4, sweepX, deviceIntensity),
      y: this.lerp(1, sweepY, deviceIntensity),
      z: this.lerp(3, sweepZ, deviceIntensity)
    };

    const [causticX, causticY, causticZ] = this.activeVisualPreset.causticTarget;
    this.targetCaustic = {
      x: this.lerp(-2, causticX, deviceIntensity),
      y: this.lerp(0, causticY, deviceIntensity),
      z: this.lerp(2, causticZ, deviceIntensity)
    };
  }

  tick(deltaSeconds: number): void {
    const smoothing = Math.min(1, deltaSeconds * 3.5);
    this.keyLight.intensity = this.lerp(this.keyLight.intensity, this.targetKeyIntensity, smoothing);
    this.fillLight.intensity = this.lerp(this.fillLight.intensity, this.targetFillIntensity, smoothing);

    this.sweepLight.target.position.x = this.lerp(this.sweepLight.target.position.x, this.targetSweep.x, smoothing);
    this.sweepLight.target.position.y = this.lerp(this.sweepLight.target.position.y, this.targetSweep.y, smoothing);
    this.sweepLight.target.position.z = this.lerp(this.sweepLight.target.position.z, this.targetSweep.z, smoothing);

    this.causticLight.target.position.x = this.lerp(this.causticLight.target.position.x, this.targetCaustic.x, smoothing);
    this.causticLight.target.position.y = this.lerp(this.causticLight.target.position.y, this.targetCaustic.y, smoothing);
    this.causticLight.target.position.z = this.lerp(this.causticLight.target.position.z, this.targetCaustic.z, smoothing);

    this.tickTransitionFx(deltaSeconds);
  }

  private applyMood(biomeId: string): void {
    const resolved = resolveBiomeMood(biomeId);
    if (resolved.id === this.activeMoodId) {
      return;
    }

    this.activeMood = resolved;
    this.activeMoodId = resolved.id;
    this.activeVisualPreset = resolveArenaDeviceVisualPreset(resolved.id);
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

    const sweepScale = this.activeVisualPreset.dominantDeviceBias.sweep;
    const flareScale = this.activeVisualPreset.dominantDeviceBias.flare;
    const causticScale = this.activeVisualPreset.dominantDeviceBias.caustic;
    const fogScale = this.activeVisualPreset.dominantDeviceBias.fog;

    this.sweepLight.intensity =
      (this.activeMood.transition.sweepBoost * transitionInfluence + (this.pressure * 0.36 + this.sweepBias) * sweepScale) *
      (0.45 + pulse * 0.55);
    this.sweepLight.penumbra = this.lerp(0.35, 0.82, clampedProgress);

    this.flareLight.intensity =
      (this.activeMood.transition.flareBoost * transitionInfluence + (this.pressure * 0.42 + this.flareBias) * flareScale) *
      (0.6 + pulse * 0.4);
    this.flareLight.distance = this.lerp(4, 9.5, clampedProgress);

    this.causticLight.intensity =
      (this.activeMood.transition.causticBoost * transitionInfluence + (this.pressure * 0.3 + this.causticBias) * causticScale) *
      (0.4 + pulse * 0.6);
    this.causticLight.angle = this.lerp(0.55, 0.92, clampedProgress);

    const fog = this.scene.fog;
    if (fog instanceof FogExp2) {
      fog.density = this.baseFogDensity + this.activeMood.transition.fogPulse * transitionInfluence + (this.pressure * 0.003 + this.fogBias * 0.0024) * fogScale;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
