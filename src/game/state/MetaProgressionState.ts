import type { MetaProgress } from '../../engine/save/SaveManager';

export class MetaProgressionState {
  constructor(private meta: MetaProgress) {}

  getSnapshot(): MetaProgress {
    return this.meta;
  }

  replace(meta: MetaProgress): void {
    this.meta = meta;
  }

  toLoadoutPoolLabel(): string {
    return `Loadout Pool W ${this.meta.unlockedWeapons.length}/4 | O ${this.meta.unlockedOffhands.length}/4 | S ${this.meta.unlockedSigils.length}/12`;
  }
}
