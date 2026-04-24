export interface PerformanceTargets {
  readonly desktopFps: number;
  readonly standaloneXrFps: number;
  readonly pcvrFps: number;
}

export interface GameConfig {
  readonly title: string;
  readonly subtitle: string;
  readonly targets: PerformanceTargets;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  title: 'Lumen Pilgrimage: Reforge',
  subtitle: 'Hub-based dark fantasy action expedition',
  targets: {
    desktopFps: 60,
    standaloneXrFps: 72,
    pcvrFps: 90
  }
};
