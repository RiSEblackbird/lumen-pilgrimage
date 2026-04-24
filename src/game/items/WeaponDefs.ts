export interface WeaponDef {
  readonly id: string;
  readonly displayName: string;
  readonly baseDamage: number;
}

export const WEAPON_DEFS: readonly WeaponDef[] = [
  {
    id: 'prism-blade',
    displayName: 'Prism Blade',
    baseDamage: 18
  },
  {
    id: 'censer-carbine',
    displayName: 'Censer Carbine',
    baseDamage: 14
  }
];
