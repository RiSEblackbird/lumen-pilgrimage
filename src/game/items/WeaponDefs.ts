export interface WeaponDef {
  readonly id: string;
  readonly displayName: string;
  readonly baseDamage: number;
  readonly overburnGain: number;
  readonly effectiveRange: 'close' | 'mid' | 'far' | 'zone';
}

export const WEAPON_DEFS: readonly WeaponDef[] = [
  {
    id: 'prism-blade',
    displayName: 'Prism Blade',
    baseDamage: 18,
    overburnGain: 10,
    effectiveRange: 'close'
  },
  {
    id: 'censer-carbine',
    displayName: 'Censer Carbine',
    baseDamage: 14,
    overburnGain: 8,
    effectiveRange: 'mid'
  },
  {
    id: 'astral-pike',
    displayName: 'Astral Pike',
    baseDamage: 22,
    overburnGain: 7,
    effectiveRange: 'far'
  },
  {
    id: 'thurible-chain',
    displayName: 'Thurible Chain',
    baseDamage: 12,
    overburnGain: 12,
    effectiveRange: 'zone'
  }
] as const;
