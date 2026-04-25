export type GameState =
  | 'Boot'
  | 'MainMenu'
  | 'Settings'
  | 'Accessibility'
  | 'Controls'
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
  'Settings',
  'Accessibility',
  'Controls',
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
