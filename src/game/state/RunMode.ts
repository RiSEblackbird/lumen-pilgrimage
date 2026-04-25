import type { GameState } from './GameState';

export type RunMode = 'campaign' | 'contracts' | 'boss-rush' | 'endless-collapse';

export interface RunModeDef {
  readonly id: RunMode;
  readonly label: string;
  readonly summary: string;
  readonly launchState: GameState;
}

export const RUN_MODE_DEFS: readonly RunModeDef[] = [
  {
    id: 'campaign',
    label: 'Campaign',
    summary: '標準 expedition。hub から biome 攻略を進める。',
    launchState: 'InExpedition'
  },
  {
    id: 'contracts',
    label: 'Contracts',
    summary: 'repeatable contract を短サイクルで周回する。',
    launchState: 'InExpedition'
  },
  {
    id: 'boss-rush',
    label: 'Boss Rush',
    summary: 'Warden contract を連戦し、phase 読解を鍛える。',
    launchState: 'BossRush'
  },
  {
    id: 'endless-collapse',
    label: 'Endless Collapse',
    summary: '長期生存重視で pressure escalation を継続する。',
    launchState: 'EndlessCollapse'
  }
] as const;

export const DEFAULT_RUN_MODE: RunMode = 'campaign';

export function isRunMode(value: string): value is RunMode {
  return RUN_MODE_DEFS.some((entry) => entry.id === value);
}

export function runModeLabel(mode: RunMode): string {
  return RUN_MODE_DEFS.find((entry) => entry.id === mode)?.label ?? mode;
}

