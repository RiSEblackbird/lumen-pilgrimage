import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, Points, PointsMaterial, Scene } from 'three';
import type { ArenaDeviceVisualHooks } from '../../game/director/ArenaMutationDirector';
import { resolveArenaDeviceVisualPreset } from '../../content/biomes/ArenaDeviceVisualPresets';

interface ChannelEmitter {
  readonly key: 'hazard' | 'focus' | 'guard' | 'overburn';
  readonly points: Points<BufferGeometry, PointsMaterial>;
  readonly baseSize: number;
}

const CHANNEL_COLORS: Record<ChannelEmitter['key'], number> = {
  hazard: 0xff7a47,
  focus: 0x5db8ff,
  guard: 0x9f8cff,
  overburn: 0xffcb5d
};

export class ParticleDirector {
  private readonly root = new Group();
  private readonly emitters: readonly ChannelEmitter[];
  private arenaHooks: ArenaDeviceVisualHooks = {
    biomeId: 'default',
    phaseTitle: 'No phase',
    channels: { hazard: 0, focus: 0, guard: 0, overburn: 0 },
    dominantDeviceLabel: 'No arena devices active',
    visualSummary: 'Arena Visuals H0 F0 G0 O0 · No arena devices active'
  };
  private pressure = 0;
  private label = 'Particles idle';

  constructor(scene: Scene) {
    this.emitters = [
      this.createEmitter('hazard', -1.4),
      this.createEmitter('focus', -0.45),
      this.createEmitter('guard', 0.45),
      this.createEmitter('overburn', 1.4)
    ];
    this.root.position.set(0, 1.2, -3.1);
    scene.add(this.root);
  }

  applyArenaVisualHooks(hooks: ArenaDeviceVisualHooks): void {
    this.arenaHooks = hooks;
    const preset = resolveArenaDeviceVisualPreset(hooks.biomeId);
    const weightedHazard = hooks.channels.hazard * preset.channelWeights.hazard;
    const weightedFocus = hooks.channels.focus * preset.channelWeights.focus;
    const weightedGuard = hooks.channels.guard * preset.channelWeights.guard;
    const weightedOverburn = hooks.channels.overburn * preset.channelWeights.overburn;

    this.pressure = Math.min(1.8, Math.max(weightedHazard, weightedFocus, weightedGuard, weightedOverburn));
    this.label = `Particle Rig ${Math.round(this.pressure * 100)}% · ${hooks.dominantDeviceLabel}`;
  }

  tick(elapsedSeconds: number, deltaSeconds: number, reduceFlashing: boolean): void {
    const pulseSpeed = reduceFlashing ? 2.1 : 3.8;
    const pulseBase = reduceFlashing ? 0.08 : 0.16;
    const pulseAmplitude = reduceFlashing ? 0.1 : 0.2;
    const smoothing = Math.min(1, deltaSeconds * 6.5);

    for (const emitter of this.emitters) {
      const material = emitter.points.material;
      const channelStrength = this.resolveChannelStrength(emitter.key);
      const pulse = pulseBase + Math.sin(elapsedSeconds * pulseSpeed + emitter.points.position.x * 0.8) * pulseAmplitude;
      const targetOpacity = Math.min(0.95, 0.1 + channelStrength * 0.62 + Math.max(0, pulse) * 0.22);
      const targetSize = emitter.baseSize + channelStrength * (reduceFlashing ? 0.045 : 0.085);

      material.opacity += (targetOpacity - material.opacity) * smoothing;
      material.size += (targetSize - material.size) * smoothing;
      material.color.copy(new Color(CHANNEL_COLORS[emitter.key]).multiplyScalar(0.55 + channelStrength * 0.7));

      emitter.points.rotation.y += deltaSeconds * (0.1 + channelStrength * 0.35);
      emitter.points.rotation.z += deltaSeconds * (0.04 + channelStrength * 0.2);
    }
  }

  getStatusLabel(): string {
    return this.label;
  }

  private createEmitter(key: ChannelEmitter['key'], xOffset: number): ChannelEmitter {
    const geometry = new BufferGeometry();
    const points = new Float32Array(48 * 3);
    for (let index = 0; index < 48; index += 1) {
      const stride = index * 3;
      const ring = 0.24 + (index % 6) * 0.04;
      const angle = (index / 48) * Math.PI * 2;
      const height = ((index % 8) - 4) * 0.04;
      points[stride] = Math.cos(angle) * ring;
      points[stride + 1] = height;
      points[stride + 2] = Math.sin(angle) * ring;
    }
    geometry.setAttribute('position', new BufferAttribute(points, 3));

    const material = new PointsMaterial({
      color: CHANNEL_COLORS[key],
      size: 0.06,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: AdditiveBlending
    });

    const pointCloud = new Points(geometry, material);
    pointCloud.position.set(xOffset, 0, 0);
    this.root.add(pointCloud);

    return {
      key,
      points: pointCloud,
      baseSize: 0.06
    };
  }

  private resolveChannelStrength(channel: ChannelEmitter['key']): number {
    const preset = resolveArenaDeviceVisualPreset(this.arenaHooks.biomeId);
    const source = this.arenaHooks.channels[channel];
    const weighted = source * preset.channelWeights[channel];
    return Math.min(1, Math.max(0, weighted * 0.82 + this.pressure * 0.12));
  }
}
