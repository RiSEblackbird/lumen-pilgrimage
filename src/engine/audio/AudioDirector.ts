import type { AudioListener } from 'three';
import type { MusicMixSnapshot } from './MusicDirector';

interface StemState {
  current: number;
  target: number;
}

/**
 * Runtime music stem gain router.
 *
 * This class intentionally keeps implementation lightweight until authored
 * WebAudio sources land. It still provides deterministic smoothing and a
 * single source of truth for stem bus levels so HUD labels and runtime audio
 * behavior stay in sync.
 */
export class AudioDirector {
  private readonly stems: Record<'exploration' | 'threat' | 'combat' | 'clutch' | 'boss', StemState> = {
    exploration: { current: 1, target: 1 },
    threat: { current: 0, target: 0 },
    combat: { current: 0, target: 0 },
    clutch: { current: 0, target: 0 },
    boss: { current: 0, target: 0 }
  };

  private readonly smoothingPerSecond = 8;

  constructor(private readonly listener: AudioListener) {}

  applyMusicMix(snapshot: MusicMixSnapshot): void {
    this.stems.exploration.target = snapshot.stems.exploration;
    this.stems.threat.target = snapshot.stems.threat;
    this.stems.combat.target = snapshot.stems.combat;
    this.stems.clutch.target = snapshot.stems.clutch;
    this.stems.boss.target = snapshot.stems.boss;
  }

  setHubAmbientMix(): void {
    this.stems.exploration.target = 1;
    this.stems.threat.target = 0;
    this.stems.combat.target = 0;
    this.stems.clutch.target = 0;
    this.stems.boss.target = 0;
  }

  tick(deltaSeconds: number): void {
    const t = Math.min(1, Math.max(0, deltaSeconds * this.smoothingPerSecond));
    this.stems.exploration.current = this.lerp(this.stems.exploration.current, this.stems.exploration.target, t);
    this.stems.threat.current = this.lerp(this.stems.threat.current, this.stems.threat.target, t);
    this.stems.combat.current = this.lerp(this.stems.combat.current, this.stems.combat.target, t);
    this.stems.clutch.current = this.lerp(this.stems.clutch.current, this.stems.clutch.target, t);
    this.stems.boss.current = this.lerp(this.stems.boss.current, this.stems.boss.target, t);

    // Keep listener volume authoritative for global master from settings while
    // still exercising bus updates for future source routing.
    const currentMaster = this.listener.getMasterVolume();
    this.listener.setMasterVolume(currentMaster);
  }

  private lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }
}
