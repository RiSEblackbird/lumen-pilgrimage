export interface OffhandDef {
  readonly id: string;
  readonly displayName: string;
  readonly focusCost: number;
  readonly summary: string;
}

export const OFFHAND_DEFS: readonly OffhandDef[] = [
  {
    id: 'ward-aegis',
    displayName: 'Ward Aegis',
    focusCost: 20,
    summary: 'Guard を回復し、短時間の投射反射を付与する。'
  },
  {
    id: 'grasp-tether',
    displayName: 'Grasp Tether',
    focusCost: 24,
    summary: '前衛敵を手前に引き寄せ、処刑圏へ固定する。'
  },
  {
    id: 'beacon-crucible',
    displayName: 'Beacon Crucible',
    focusCost: 28,
    summary: '小型フィールドを展開し、回復と lure を同時に行う。'
  },
  {
    id: 'siphon-engine',
    displayName: 'Siphon Engine',
    focusCost: 26,
    summary: '標的から Focus と overburn を吸収して資源変換する。'
  }
] as const;
