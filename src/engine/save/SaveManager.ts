import type { GameState } from '../../game/state/GameState';
import { DEFAULT_RELIC_MODIFIERS } from '../../game/items/RelicEffects';
import type { RelicStatModifiers } from '../../game/items/RelicEffects';

export interface ExpeditionProgress {
  readonly biomeId: string;
  readonly missionId: string;
  readonly sectorIndex: number;
  readonly sectorsTotal: number;
  readonly roomId: string;
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

export interface MetaProgress {
  readonly lumenAsh: number;
  readonly choirThread: number;
  readonly saintGlass: number;
  readonly echoScript: number;
  readonly unlockedWeapons: readonly string[];
  readonly unlockedOffhands: readonly string[];
  readonly unlockedSigils: readonly string[];
}

export interface SaveSlot {
  readonly slotId: number;
  readonly state: GameState;
  readonly unlockedBiomes: readonly string[];
  readonly expedition: ExpeditionProgress | null;
  readonly metaProgress: MetaProgress;
  readonly updatedAtIso: string;
}

export const DEFAULT_META_PROGRESS: MetaProgress = {
  lumenAsh: 120,
  choirThread: 30,
  saintGlass: 4,
  echoScript: 10,
  unlockedWeapons: ['prism-blade', 'censer-carbine'],
  unlockedOffhands: ['ward-aegis'],
  unlockedSigils: ['blink-dash', 'shock-nova']
};

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
      metaProgress: fallback.metaProgress,
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

  updateMetaProgress(slotId: number, updater: (meta: MetaProgress) => MetaProgress): SaveSlot | null {
    const current = this.load(slotId);
    if (!current) {
      return null;
    }

    const updated: SaveSlot = {
      ...current,
      metaProgress: updater(current.metaProgress),
      updatedAtIso: new Date().toISOString()
    };
    this.save(updated);
    return updated;
  }

  resetSlot(slotId: number, next: Omit<SaveSlot, 'slotId' | 'updatedAtIso'>): SaveSlot {
    const reset: SaveSlot = {
      slotId,
      state: next.state,
      unlockedBiomes: next.unlockedBiomes,
      expedition: next.expedition,
      metaProgress: next.metaProgress,
      updatedAtIso: new Date().toISOString()
    };
    this.save(reset);
    return reset;
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

    const metaProgress = this.parseMetaProgress(input.metaProgress);
    if (!metaProgress) {
      return null;
    }

    return {
      slotId: input.slotId,
      state: input.state,
      unlockedBiomes: input.unlockedBiomes,
      expedition,
      metaProgress,
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
      'missionId',
      'roomId',
      'roomLabel',
      'routeStyle',
      'missionName',
      'capturedAtIso'
    ];

    if (numberKeys.some((key) => typeof input[key] !== 'number')) {
      return null;
    }

    const stringKeyErrors = stringKeys.some((key) => key !== 'roomId' && key !== 'missionId' && typeof input[key] !== 'string');
    if (stringKeyErrors) {
      return null;
    }

    const relicModifiers = this.parseRelicModifiers(input.relicModifiers);
    if (!relicModifiers) {
      return null;
    }

    return {
      biomeId: input.biomeId as string,
      missionId: typeof input.missionId === 'string' ? input.missionId : '',
      roomId: typeof input.roomId === 'string' ? input.roomId : '',
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

  private parseMetaProgress(input: unknown): MetaProgress | null {
    if (input === undefined || input === null) {
      return DEFAULT_META_PROGRESS;
    }

    if (!this.isRecord(input)) {
      return null;
    }

    const numberKeys: Array<keyof MetaProgress> = ['lumenAsh', 'choirThread', 'saintGlass', 'echoScript'];
    if (numberKeys.some((key) => typeof input[key] !== 'number')) {
      return null;
    }

    const arrayKeys: Array<keyof MetaProgress> = ['unlockedWeapons', 'unlockedOffhands', 'unlockedSigils'];
    const hasInvalidArray = arrayKeys.some((key) => !Array.isArray(input[key]) || !(input[key] as unknown[]).every((entry) => typeof entry === 'string'));
    if (hasInvalidArray) {
      return null;
    }

    return {
      lumenAsh: input.lumenAsh as number,
      choirThread: input.choirThread as number,
      saintGlass: input.saintGlass as number,
      echoScript: input.echoScript as number,
      unlockedWeapons: input.unlockedWeapons as string[],
      unlockedOffhands: input.unlockedOffhands as string[],
      unlockedSigils: input.unlockedSigils as string[]
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
