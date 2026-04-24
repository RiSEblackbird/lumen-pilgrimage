import type { GameState } from '../../game/state/GameState';
import { DEFAULT_RELIC_MODIFIERS } from '../../game/items/RelicEffects';
import type { RelicStatModifiers } from '../../game/items/RelicEffects';

export interface ExpeditionProgress {
  readonly biomeId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomLabel: string;
  readonly routeStyle: string;
  readonly missionName: string;
  readonly health: number;
  readonly guard: number;
  readonly focus: number;
  readonly overburn: number;
  readonly relicIds: readonly string[];
  readonly relicModifiers: RelicStatModifiers;
  readonly capturedAtIso: string;
}

export interface SaveSlot {
  readonly slotId: number;
  readonly state: GameState;
  readonly unlockedBiomes: readonly string[];
  readonly expedition: ExpeditionProgress | null;
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
      const parsed: unknown = JSON.parse(raw);
      return this.parseSlot(parsed);
    } catch {
      return null;
    }
  }

  loadOrCreate(slotId: number, fallback: Omit<SaveSlot, 'slotId' | 'updatedAtIso'>): SaveSlot {
    const existing = this.load(slotId);
    if (existing) {
      return existing;
    }

    const created: SaveSlot = {
      slotId,
      state: fallback.state,
      unlockedBiomes: fallback.unlockedBiomes,
      expedition: fallback.expedition,
      updatedAtIso: new Date().toISOString()
    };
    this.save(created);
    return created;
  }

  save(slot: SaveSlot): void {
    localStorage.setItem(this.key(slot.slotId), JSON.stringify(slot));
  }

  updateExpedition(slotId: number, expedition: ExpeditionProgress | null): SaveSlot | null {
    const current = this.load(slotId);
    if (!current) {
      return null;
    }

    const updated: SaveSlot = {
      ...current,
      expedition,
      updatedAtIso: new Date().toISOString()
    };
    this.save(updated);
    return updated;
  }

  private key(slotId: number): string {
    return `${this.keyPrefix}${slotId}`;
  }

  private parseSlot(input: unknown): SaveSlot | null {
    if (!this.isRecord(input)) {
      return null;
    }

    if (typeof input.slotId !== 'number' || !Number.isInteger(input.slotId)) {
      return null;
    }

    if (!this.isGameState(input.state)) {
      return null;
    }

    if (!Array.isArray(input.unlockedBiomes) || !input.unlockedBiomes.every((entry) => typeof entry === 'string')) {
      return null;
    }

    if (typeof input.updatedAtIso !== 'string') {
      return null;
    }

    const expedition = this.parseExpedition(input.expedition);
    if (input.expedition !== null && expedition === null) {
      return null;
    }

    return {
      slotId: input.slotId,
      state: input.state,
      unlockedBiomes: input.unlockedBiomes,
      expedition,
      updatedAtIso: input.updatedAtIso
    };
  }

  private parseExpedition(input: unknown): ExpeditionProgress | null {
    if (input === null || input === undefined) {
      return null;
    }

    if (!this.isRecord(input)) {
      return null;
    }

    const relicIds = input.relicIds;
    if (!Array.isArray(relicIds) || !relicIds.every((entry) => typeof entry === 'string')) {
      return null;
    }

    const numberKeys: Array<keyof ExpeditionProgress> = ['sectorIndex', 'sectorsTotal', 'health', 'guard', 'focus', 'overburn'];
    const stringKeys: Array<keyof ExpeditionProgress> = [
      'biomeId',
      'roomLabel',
      'routeStyle',
      'missionName',
      'capturedAtIso'
    ];

    if (numberKeys.some((key) => typeof input[key] !== 'number')) {
      return null;
    }

    if (stringKeys.some((key) => typeof input[key] !== 'string')) {
      return null;
    }

    const relicModifiers = this.parseRelicModifiers(input.relicModifiers);
    if (!relicModifiers) {
      return null;
    }

    return {
      biomeId: input.biomeId as string,
      sectorIndex: input.sectorIndex as number,
      sectorsTotal: input.sectorsTotal as number,
      roomLabel: input.roomLabel as string,
      routeStyle: input.routeStyle as string,
      missionName: input.missionName as string,
      health: input.health as number,
      guard: input.guard as number,
      focus: input.focus as number,
      overburn: input.overburn as number,
      relicIds: relicIds as string[],
      relicModifiers,
      capturedAtIso: input.capturedAtIso as string
    };
  }

  private parseRelicModifiers(input: unknown): RelicStatModifiers | null {
    if (input === undefined || input === null) {
      return DEFAULT_RELIC_MODIFIERS;
    }

    if (!this.isRecord(input)) {
      return null;
    }

    const keys: Array<keyof RelicStatModifiers> = [
      'primaryDamageMultiplier',
      'staggerDamageMultiplier',
      'dashFocusCostMultiplier',
      'guardDamageTakenMultiplier',
      'focusRegenPerSecondBonus',
      'overburnDecayMultiplier',
      'roomClearFocusBonus',
      'parryFocusBonus'
    ];

    if (keys.some((key) => typeof input[key] !== 'number')) {
      return null;
    }

    return {
      primaryDamageMultiplier: input.primaryDamageMultiplier as number,
      staggerDamageMultiplier: input.staggerDamageMultiplier as number,
      dashFocusCostMultiplier: input.dashFocusCostMultiplier as number,
      guardDamageTakenMultiplier: input.guardDamageTakenMultiplier as number,
      focusRegenPerSecondBonus: input.focusRegenPerSecondBonus as number,
      overburnDecayMultiplier: input.overburnDecayMultiplier as number,
      roomClearFocusBonus: input.roomClearFocusBonus as number,
      parryFocusBonus: input.parryFocusBonus as number
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isGameState(value: unknown): value is GameState {
    return (
      typeof value === 'string' &&
      [
        'Boot',
        'MainMenu',
        'Hub',
        'ExpeditionPrep',
        'InExpedition',
        'MiniBoss',
        'Boss',
        'Extraction',
        'MetaUpgrade',
        'GameOver',
        'Credits',
        'BossRush',
        'EndlessCollapse'
      ].includes(value)
    );
  }
}
