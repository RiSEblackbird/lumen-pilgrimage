import type { AudioListener } from 'three';
import type { MusicMixSnapshot } from './MusicDirector';

export type MusicStemId = 'exploration' | 'threat' | 'combat' | 'clutch' | 'boss';

interface StemState {
  current: number;
  target: number;
  readonly gainNode: GainNode;
}

interface RegisteredStemSource {
  readonly stem: MusicStemId;
  readonly output: AudioNode;
}

const STEM_IDS: readonly MusicStemId[] = ['exploration', 'threat', 'combat', 'clutch', 'boss'] as const;

/**
 * Runtime music stem gain router.
 *
 * `registerStemSource` を使えば、authored WebAudio source graph（AudioBufferSource,
 * MediaElementAudioSource など）を stem ごとの gain bus に接続できる。
 */
export class AudioDirector {
  private readonly stems: Record<MusicStemId, StemState>;
  private readonly sourceRegistry = new Map<string, RegisteredStemSource>();
  private readonly smoothingPerSecond = 8;

  constructor(private readonly listener: AudioListener) {
    const context = this.listener.context;
    const listenerInput = this.listener.getInput();

    const stemEntries = STEM_IDS.map((stemId) => {
      const gainNode = context.createGain();
      gainNode.gain.value = stemId === 'exploration' ? 1 : 0;
      gainNode.connect(listenerInput);
      return [
        stemId,
        {
          current: gainNode.gain.value,
          target: gainNode.gain.value,
          gainNode
        }
      ] as const;
    });

    this.stems = Object.fromEntries(stemEntries) as Record<MusicStemId, StemState>;
  }

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

  registerStemSource(sourceId: string, stem: MusicStemId, output: AudioNode): void {
    this.unregisterStemSource(sourceId);
    output.connect(this.stems[stem].gainNode);
    this.sourceRegistry.set(sourceId, { stem, output });
  }

  unregisterStemSource(sourceId: string): void {
    const registered = this.sourceRegistry.get(sourceId);
    if (!registered) {
      return;
    }
    registered.output.disconnect(this.stems[registered.stem].gainNode);
    this.sourceRegistry.delete(sourceId);
  }

  tick(deltaSeconds: number): void {
    const t = Math.min(1, Math.max(0, deltaSeconds * this.smoothingPerSecond));
    const contextTime = this.listener.context.currentTime;

    for (const stemId of STEM_IDS) {
      const stemState = this.stems[stemId];
      stemState.current = this.lerp(stemState.current, stemState.target, t);
      stemState.gainNode.gain.setValueAtTime(stemState.current, contextTime);
    }

    const currentMaster = this.listener.getMasterVolume();
    this.listener.setMasterVolume(currentMaster);
  }

  dispose(): void {
    for (const sourceId of Array.from(this.sourceRegistry.keys())) {
      this.unregisterStemSource(sourceId);
    }
    for (const stemId of STEM_IDS) {
      this.stems[stemId].gainNode.disconnect();
    }
  }

  private lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }
}
