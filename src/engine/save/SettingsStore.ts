import { DEFAULT_DIFFICULTY_ID, isDifficultyId, type DifficultyId } from '../../game/state/DifficultyState';

export interface SettingsData {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
  readonly uiScale: number;
  readonly reduceFlashing: boolean;
  readonly masterVolume: number;
  readonly difficultyId: DifficultyId;
}

const DEFAULT_SETTINGS: SettingsData = {
  snapTurn: true,
  seatedMode: false,
  uiScale: 1,
  reduceFlashing: false,
  masterVolume: 0.8,
  difficultyId: DEFAULT_DIFFICULTY_ID
};

export class SettingsStore {
  private readonly key = 'lumen-pilgrimage:settings:v3';

  load(): SettingsData {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SettingsData> & { difficultyId?: string };
      const difficultyId = parsed.difficultyId && isDifficultyId(parsed.difficultyId)
        ? parsed.difficultyId
        : DEFAULT_DIFFICULTY_ID;
      return { ...DEFAULT_SETTINGS, ...parsed, difficultyId };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  save(settings: SettingsData): void {
    localStorage.setItem(this.key, JSON.stringify(settings));
  }
}
