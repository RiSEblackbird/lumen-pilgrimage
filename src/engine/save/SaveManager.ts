import type { GameState } from '../../game/state/GameState';

export interface SaveSlot {
  readonly slotId: number;
  readonly state: GameState;
  readonly unlockedBiomes: readonly string[];
  readonly updatedAtIso: string;
}

export class SaveManager {
  private readonly keyPrefix = 'lumen-pilgrimage:save-slot:';

  load(slotId: number): SaveSlot | null {
    const raw = localStorage.getItem(this.key(slotId));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SaveSlot;
    } catch {
      return null;
    }
  }

  save(slot: SaveSlot): void {
    localStorage.setItem(this.key(slot.slotId), JSON.stringify(slot));
  }

  private key(slotId: number): string {
    return `${this.keyPrefix}${slotId}`;
  }
}
