export interface OffhandDef {
  readonly id: string;
  readonly displayName: string;
  readonly focusCost: number;
}

export const OFFHAND_DEFS: readonly OffhandDef[] = [
  {
    id: 'ward-aegis',
    displayName: 'Ward Aegis',
    focusCost: 20
  },
  {
    id: 'grasp-tether',
    displayName: 'Grasp Tether',
    focusCost: 24
  }
];
