export type GameState =
  | 'Boot'
  | 'MainMenu'
  | 'Hub'
  | 'ExpeditionPrep'
  | 'InExpedition'
  | 'MiniBoss'
  | 'Boss'
  | 'Extraction'
  | 'MetaUpgrade'
  | 'GameOver'
  | 'Credits'
  | 'BossRush'
  | 'EndlessCollapse';

export const GAME_STATE_ORDER: readonly GameState[] = [
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
] as const;
