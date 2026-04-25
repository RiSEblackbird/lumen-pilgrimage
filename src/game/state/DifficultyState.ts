export type DifficultyId = 'pilgrim' | 'trial' | 'martyr';

export interface DifficultyDef {
  readonly id: DifficultyId;
  readonly label: string;
  readonly summary: string;
  readonly enemyHealthMultiplier: number;
  readonly enemyDamageMultiplier: number;
  readonly enemyAttackIntervalMultiplier: number;
  readonly enemyTelegraphMultiplier: number;
}

export const DIFFICULTY_DEFS: readonly DifficultyDef[] = [
  {
    id: 'pilgrim',
    label: 'Pilgrim',
    summary: '入門向け。telegraph を読み取りやすく、被弾リスクを抑える。',
    enemyHealthMultiplier: 0.92,
    enemyDamageMultiplier: 0.86,
    enemyAttackIntervalMultiplier: 1.08,
    enemyTelegraphMultiplier: 1.12
  },
  {
    id: 'trial',
    label: 'Trial',
    summary: '標準。攻防の密度をバランス良く要求する。',
    enemyHealthMultiplier: 1,
    enemyDamageMultiplier: 1,
    enemyAttackIntervalMultiplier: 1,
    enemyTelegraphMultiplier: 1
  },
  {
    id: 'martyr',
    label: 'Martyr',
    summary: '高難度。攻撃mixと処理密度が上がり、判断速度を要求する。',
    enemyHealthMultiplier: 1.18,
    enemyDamageMultiplier: 1.22,
    enemyAttackIntervalMultiplier: 0.9,
    enemyTelegraphMultiplier: 0.88
  }
] as const;

export const DEFAULT_DIFFICULTY_ID: DifficultyId = 'trial';

export function isDifficultyId(value: string): value is DifficultyId {
  return DIFFICULTY_DEFS.some((entry) => entry.id === value);
}

export function resolveDifficulty(id: DifficultyId): DifficultyDef {
  return DIFFICULTY_DEFS.find((entry) => entry.id === id) ?? DIFFICULTY_DEFS[1];
}

export function nextDifficultyId(current: DifficultyId): DifficultyId {
  const index = DIFFICULTY_DEFS.findIndex((entry) => entry.id === current);
  if (index < 0) {
    return DEFAULT_DIFFICULTY_ID;
  }
  return DIFFICULTY_DEFS[(index + 1) % DIFFICULTY_DEFS.length].id;
}
