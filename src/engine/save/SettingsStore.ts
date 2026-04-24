export interface SettingsData {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
  readonly uiScale: number;
  readonly reduceFlashing: boolean;
  readonly masterVolume: number;
}

const DEFAULT_SETTINGS: SettingsData = {
  snapTurn: true,
  seatedMode: false,
  uiScale: 1,
  reduceFlashing: false,
  masterVolume: 0.8
};

export class SettingsStore {
  private readonly key = 'lumen-pilgrimage:settings:v2';

  load(): SettingsData {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SettingsData>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  save(settings: SettingsData): void {
    localStorage.setItem(this.key, JSON.stringify(settings));
  }
}
