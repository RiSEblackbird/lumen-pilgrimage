import { BIOME_ENCOUNTER_SETS, type BiomeEncounterSet, type EncounterRoomRule, type RoomTag } from '../encounters/EncounterRuleSet';

export interface EncounterSnapshot {
  readonly biomeId: string;
  readonly biomeName: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomName: string;
  readonly roomTags: readonly RoomTag[];
  readonly progressLabel: string;
  readonly rewardWeight: number;
}

export class EncounterDirector {
  private biome: BiomeEncounterSet = BIOME_ENCOUNTER_SETS[0];
  private sectorIndex = 1;
  private roomCursor = 0;

  startExpedition(biomeId: string): void {
    this.biome = BIOME_ENCOUNTER_SETS.find((set) => set.biomeId === biomeId) ?? BIOME_ENCOUNTER_SETS[0];
    this.sectorIndex = 1;
    this.roomCursor = 0;
  }

  onRoomCleared(clearTimeSeconds: number, tookHeavyDamage: boolean): EncounterSnapshot {
    const current = this.currentRoom();
    const paceBonus = clearTimeSeconds <= 35 ? 0.15 : 0;
    const safetyPenalty = tookHeavyDamage ? -0.1 : 0;
    const adjustedWeight = Math.max(0.9, current.rewardWeight + paceBonus + safetyPenalty);

    this.roomCursor += 1;
    if (this.roomCursor >= this.biome.rooms.length) {
      this.roomCursor = 0;
      this.sectorIndex = Math.min(this.biome.sectors, this.sectorIndex + 1);
    }

    return this.snapshot(adjustedWeight);
  }

  snapshot(rewardWeight = this.currentRoom().rewardWeight): EncounterSnapshot {
    const room = this.currentRoom();
    return {
      biomeId: this.biome.biomeId,
      biomeName: this.biome.displayName,
      sectorIndex: this.sectorIndex,
      sectorsTotal: this.biome.sectors,
      roomName: room.displayName,
      roomTags: room.tags,
      progressLabel: `Sector ${this.sectorIndex}/${this.biome.sectors} · ${room.displayName}`,
      rewardWeight
    };
  }

  private currentRoom(): EncounterRoomRule {
    return this.biome.rooms[this.roomCursor % this.biome.rooms.length];
  }
}
