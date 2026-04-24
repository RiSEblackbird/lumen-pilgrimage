import type { RoomTag } from './EncounterRuleSet';

export interface EncounterEnemyTemplate {
  readonly archetypeId: string;
  readonly label: string;
  readonly baseHealth: number;
  readonly baseDamage: number;
  readonly attackInterval: number;
  readonly telegraphLead: number;
  readonly meleeWeight: number;
  readonly rangedWeight: number;
}

interface EncounterSpawnContext {
  readonly biomeId: string;
  readonly roomTags: readonly RoomTag[];
  readonly sectorIndex: number;
}

const EMBER_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'ash-mote',
    label: 'Ash Mote',
    baseHealth: 30,
    baseDamage: 8,
    attackInterval: 2.2,
    telegraphLead: 0.45,
    meleeWeight: 0.8,
    rangedWeight: 0
  },
  {
    archetypeId: 'candle-penitent',
    label: 'Candle Penitent',
    baseHealth: 42,
    baseDamage: 10,
    attackInterval: 3,
    telegraphLead: 0.55,
    meleeWeight: 0.9,
    rangedWeight: 0.2
  },
  {
    archetypeId: 'furnace-thurifer',
    label: 'Furnace Thurifer',
    baseHealth: 60,
    baseDamage: 14,
    attackInterval: 4.4,
    telegraphLead: 0.75,
    meleeWeight: 0.4,
    rangedWeight: 0.8
  }
] as const;

const MOON_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'reservoir-monk',
    label: 'Reservoir Monk',
    baseHealth: 34,
    baseDamage: 9,
    attackInterval: 2.4,
    telegraphLead: 0.48,
    meleeWeight: 0.7,
    rangedWeight: 0.15
  },
  {
    archetypeId: 'moon-arbalist',
    label: 'Moon Arbalist',
    baseHealth: 40,
    baseDamage: 12,
    attackInterval: 3.6,
    telegraphLead: 0.7,
    meleeWeight: 0.2,
    rangedWeight: 0.95
  },
  {
    archetypeId: 'glass-eel',
    label: 'Glass Eel',
    baseHealth: 52,
    baseDamage: 14,
    attackInterval: 3.8,
    telegraphLead: 0.62,
    meleeWeight: 0.6,
    rangedWeight: 0.45
  }
] as const;

const SECRET_TEMPLATE: EncounterEnemyTemplate = {
  archetypeId: 'echo-sentinel',
  label: 'Echo Sentinel',
  baseHealth: 55,
  baseDamage: 12,
  attackInterval: 3.2,
  telegraphLead: 0.5,
  meleeWeight: 0.5,
  rangedWeight: 0.5
};

const ELITE_TEMPLATE: EncounterEnemyTemplate = {
  archetypeId: 'warden-vassal',
  label: 'Warden Vassal',
  baseHealth: 88,
  baseDamage: 18,
  attackInterval: 4.8,
  telegraphLead: 0.9,
  meleeWeight: 1.2,
  rangedWeight: 0.9
};

export function buildEncounterWave(context: EncounterSpawnContext): readonly EncounterEnemyTemplate[] {
  const biomeTemplates = context.biomeId === 'moon-reservoir' ? MOON_BASE : EMBER_BASE;
  const wave = [...biomeTemplates];

  if (context.roomTags.includes('traversal')) {
    wave[0] = {
      ...wave[0],
      baseHealth: Math.round(wave[0].baseHealth * 0.9),
      attackInterval: Math.max(1.8, wave[0].attackInterval - 0.2)
    };
  }

  if (context.roomTags.includes('elite') || context.roomTags.includes('boss-approach')) {
    wave.push(ELITE_TEMPLATE);
  }

  if (context.roomTags.includes('secret') || context.roomTags.includes('reward')) {
    wave.push(SECRET_TEMPLATE);
  }

  const sectorScale = 1 + (context.sectorIndex - 1) * 0.08;
  return wave.map((template) => ({
    ...template,
    baseHealth: Math.round(template.baseHealth * sectorScale),
    baseDamage: Math.round(template.baseDamage * sectorScale)
  }));
}
