import {
  BIOME_ENCOUNTER_SETS,
  type BiomeEncounterSet,
  type EncounterRoomRule,
  type RouteStyle,
  type RoomTag
} from '../encounters/EncounterRuleSet';
import { DeterministicRng, createRunSeed } from '../../core/DeterministicRng';

export interface EncounterSnapshot {
  readonly biomeId: string;
  readonly biomeName: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomId: string;
  readonly roomName: string;
  readonly roomTags: readonly RoomTag[];
  readonly progressLabel: string;
  readonly rewardWeight: number;
  readonly routeStyle: RouteStyle;
  readonly runSeed: number;
}

export class EncounterDirector {
  private biome: BiomeEncounterSet = BIOME_ENCOUNTER_SETS[0];
  private sectorIndex = 1;
  private roomsClearedInSector = 0;
  private totalRoomsCleared = 0;
  private currentRoomId = this.biome.startRoomId;
  private routeStyle: RouteStyle = 'standard';
  private missionRouteBias: readonly RouteStyle[] = [];
  private runSeed = createRunSeed();
  private rng = new DeterministicRng(this.runSeed);

  startExpedition(biomeId: string, missionRouteBias: readonly RouteStyle[] = [], runSeed = createRunSeed()): void {
    this.biome = BIOME_ENCOUNTER_SETS.find((set) => set.biomeId === biomeId) ?? BIOME_ENCOUNTER_SETS[0];
    this.sectorIndex = 1;
    this.roomsClearedInSector = 0;
    this.totalRoomsCleared = 0;
    this.currentRoomId = this.biome.startRoomId;
    this.routeStyle = 'standard';
    this.missionRouteBias = missionRouteBias;
    this.runSeed = runSeed >>> 0 || 1;
    this.rng = new DeterministicRng(this.runSeed);
  }

  setMissionRouteBias(routeBias: readonly RouteStyle[]): void {
    this.missionRouteBias = routeBias;
  }

  restoreExpedition(snapshot: {
    readonly biomeId: string;
    readonly sectorIndex: number;
    readonly roomId: string;
    readonly routeStyle: RouteStyle;
    readonly runSeed?: number;
  }): void {
    this.biome = BIOME_ENCOUNTER_SETS.find((set) => set.biomeId === snapshot.biomeId) ?? BIOME_ENCOUNTER_SETS[0];
    this.sectorIndex = Math.min(this.biome.sectors, Math.max(1, Math.floor(snapshot.sectorIndex)));
    this.roomsClearedInSector = 0;
    this.totalRoomsCleared = 0;
    const roomExists = this.biome.rooms.some((room) => room.id === snapshot.roomId);
    this.currentRoomId = roomExists ? snapshot.roomId : this.biome.startRoomId;
    this.routeStyle = snapshot.routeStyle;
    this.runSeed = snapshot.runSeed && snapshot.runSeed > 0 ? snapshot.runSeed >>> 0 : createRunSeed();
    this.rng = new DeterministicRng(this.runSeed);
  }

  onRoomCleared(clearTimeSeconds: number, tookHeavyDamage: boolean): EncounterSnapshot {
    const current = this.currentRoom();
    const paceBonus = clearTimeSeconds <= 35 ? 0.15 : 0;
    const safetyPenalty = tookHeavyDamage ? -0.1 : 0;
    const adjustedWeight = Math.max(0.9, current.rewardWeight + paceBonus + safetyPenalty);

    this.totalRoomsCleared += 1;
    this.roomsClearedInSector += 1;
    if (this.roomsClearedInSector >= this.biome.roomsPerSector) {
      this.roomsClearedInSector = 0;
      this.sectorIndex = Math.min(this.biome.sectors, this.sectorIndex + 1);
    }

    this.moveToNextRoom(clearTimeSeconds, tookHeavyDamage);
    return this.snapshot(adjustedWeight);
  }

  snapshot(rewardWeight = this.currentRoom().rewardWeight): EncounterSnapshot {
    const room = this.currentRoom();
    return {
      biomeId: this.biome.biomeId,
      biomeName: this.biome.displayName,
      sectorIndex: this.sectorIndex,
      sectorsTotal: this.biome.sectors,
      roomId: room.id,
      roomName: room.displayName,
      roomTags: room.tags,
      progressLabel: `Sector ${this.sectorIndex}/${this.biome.sectors} · ${room.displayName} [${this.routeStyle}]`,
      rewardWeight,
      routeStyle: this.routeStyle,
      runSeed: this.runSeed
    };
  }

  private moveToNextRoom(clearTimeSeconds: number, tookHeavyDamage: boolean): void {
    const edges = this.biome.roomGraph[this.currentRoomId] ?? [];
    if (edges.length === 0) {
      this.currentRoomId = this.biome.startRoomId;
      this.routeStyle = 'standard';
      return;
    }

    const preferredRoutes = this.getPreferredRoutes(clearTimeSeconds, tookHeavyDamage);
    for (const routeStyle of preferredRoutes) {
      const matches = edges.filter((edge) => edge.routeStyle === routeStyle);
      if (matches.length === 0) {
        continue;
      }
      const pickedEdge = matches[this.pickIndex(matches.length)];
      this.currentRoomId = pickedEdge.targetRoomId;
      this.routeStyle = pickedEdge.routeStyle;
      return;
    }

    const fallback = edges[this.pickIndex(edges.length)];
    this.currentRoomId = fallback.targetRoomId;
    this.routeStyle = fallback.routeStyle;
  }

  private getPreferredRoutes(clearTimeSeconds: number, tookHeavyDamage: boolean): readonly RouteStyle[] {
    const dynamicPriority: readonly RouteStyle[] = tookHeavyDamage
      ? ['recovery', 'standard', 'secret', 'risk']
      : clearTimeSeconds <= 35
        ? ['risk', 'secret', 'standard', 'recovery']
        : ['standard', 'secret', 'risk', 'recovery'];

    return this.mergeRoutePriority(dynamicPriority, this.missionRouteBias);
  }

  private mergeRoutePriority(primary: readonly RouteStyle[], secondary: readonly RouteStyle[]): readonly RouteStyle[] {
    const merged: RouteStyle[] = [];

    for (const route of secondary) {
      if (!merged.includes(route)) {
        merged.push(route);
      }
    }

    for (const route of primary) {
      if (!merged.includes(route)) {
        merged.push(route);
      }
    }

    for (const route of ['standard', 'risk', 'recovery', 'secret'] as const) {
      if (!merged.includes(route)) {
        merged.push(route);
      }
    }

    return merged;
  }

  private pickIndex(length: number): number {
    return this.rng.nextInt(length);
  }

  private currentRoom(): EncounterRoomRule {
    return this.biome.rooms.find((room) => room.id === this.currentRoomId) ?? this.biome.rooms[0];
  }
}
