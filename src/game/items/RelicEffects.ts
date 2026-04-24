export interface RelicStatModifiers {
  readonly primaryDamageMultiplier: number;
  readonly staggerDamageMultiplier: number;
  readonly dashFocusCostMultiplier: number;
  readonly guardDamageTakenMultiplier: number;
  readonly focusRegenPerSecondBonus: number;
  readonly overburnDecayMultiplier: number;
  readonly roomClearFocusBonus: number;
  readonly parryFocusBonus: number;
}

export const DEFAULT_RELIC_MODIFIERS: RelicStatModifiers = {
  primaryDamageMultiplier: 1,
  staggerDamageMultiplier: 1,
  dashFocusCostMultiplier: 1,
  guardDamageTakenMultiplier: 1,
  focusRegenPerSecondBonus: 0,
  overburnDecayMultiplier: 1,
  roomClearFocusBonus: 0,
  parryFocusBonus: 0
};

export function buildRelicStatModifiers(equippedRelicIds: readonly string[]): RelicStatModifiers {
  const equipped = new Set(equippedRelicIds);

  let primaryDamageMultiplier = 1;
  let staggerDamageMultiplier = 1;
  let dashFocusCostMultiplier = 1;
  let guardDamageTakenMultiplier = 1;
  let focusRegenPerSecondBonus = 0;
  let overburnDecayMultiplier = 1;
  let roomClearFocusBonus = 0;
  let parryFocusBonus = 0;

  if (equipped.has('penitent-spike')) {
    staggerDamageMultiplier += 0.2;
  }

  if (equipped.has('veil-thread')) {
    dashFocusCostMultiplier *= 0.75;
  }

  if (equipped.has('ward-carillon')) {
    guardDamageTakenMultiplier *= 0.92;
  }

  if (equipped.has('hushed-thurible')) {
    guardDamageTakenMultiplier *= 0.9;
  }

  if (equipped.has('cathedral-fuse')) {
    overburnDecayMultiplier *= 0.85;
  }

  if (equipped.has('lumen-votive')) {
    roomClearFocusBonus += 12;
  }

  if (equipped.has('dash-furnace-spine')) {
    focusRegenPerSecondBonus += 1.5;
  }

  if (equipped.has('sunshard-buckle')) {
    primaryDamageMultiplier += 0.1;
  }

  if (equipped.has('moonbreak-prayer')) {
    parryFocusBonus += 4;
  }

  return {
    primaryDamageMultiplier,
    staggerDamageMultiplier,
    dashFocusCostMultiplier,
    guardDamageTakenMultiplier,
    focusRegenPerSecondBonus,
    overburnDecayMultiplier,
    roomClearFocusBonus,
    parryFocusBonus
  };
}
