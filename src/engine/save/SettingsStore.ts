import { DEFAULT_DIFFICULTY_ID, isDifficultyId, type DifficultyId } from '../../game/state/DifficultyState';

export type DominantHand = 'right' | 'left';
export type TurnStyle = 'snap' | 'smooth';

export interface SettingsData {
  readonly snapTurn: boolean;
  readonly seatedMode: boolean;
  readonly uiScale: number;
  readonly reduceFlashing: boolean;
  readonly masterVolume: number;
  readonly difficultyId: DifficultyId;
  readonly subtitleEnabled: boolean;
  readonly colorblindSafeCues: boolean;
  readonly reduceScreenShake: boolean;
  readonly holdToGuard: boolean;
  readonly aimAssistFlat: boolean;
  readonly dominantHand: DominantHand;
  readonly turnStyle: TurnStyle;
  readonly tinnitusSafeMode: boolean;
  readonly reduceSuddenPeaks: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  snapTurn: true,
  seatedMode: false,
  uiScale: 1,
  reduceFlashing: false,
  masterVolume: 0.8,
  difficultyId: DEFAULT_DIFFICULTY_ID,
  subtitleEnabled: true,
  colorblindSafeCues: true,
  reduceScreenShake: true,
  holdToGuard: false,
  aimAssistFlat: false,
  dominantHand: 'right',
  turnStyle: 'snap',
  tinnitusSafeMode: false,
  reduceSuddenPeaks: true
};

function toDominantHand(value: unknown): DominantHand {
  return value === 'left' ? 'left' : 'right';
}

function toTurnStyle(value: unknown): TurnStyle {
  return value === 'smooth' ? 'smooth' : 'snap';
}

export class SettingsStore {
  private readonly key = 'lumen-pilgrimage:settings:v4';

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
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        difficultyId,
        dominantHand: toDominantHand(parsed.dominantHand),
        turnStyle: toTurnStyle(parsed.turnStyle)
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  save(settings: SettingsData): void {
    localStorage.setItem(this.key, JSON.stringify(settings));
  }
}
