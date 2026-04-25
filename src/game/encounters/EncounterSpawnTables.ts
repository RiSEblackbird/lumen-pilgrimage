import { getEnemyDisplayName } from '../../content/enemies/EnemyCatalog';
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
    label: getEnemyDisplayName('ash-mote'),
    baseHealth: 30,
    baseDamage: 8,
    attackInterval: 2.2,
    telegraphLead: 0.45,
    meleeWeight: 0.8,
    rangedWeight: 0
  },
  {
    archetypeId: 'candle-penitent',
    label: getEnemyDisplayName('candle-penitent'),
    baseHealth: 42,
    baseDamage: 10,
    attackInterval: 3,
    telegraphLead: 0.55,
    meleeWeight: 0.9,
    rangedWeight: 0.2
  },
  {
    archetypeId: 'furnace-thurifer',
    label: getEnemyDisplayName('furnace-thurifer'),
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
    label: getEnemyDisplayName('reservoir-monk'),
    baseHealth: 34,
    baseDamage: 9,
    attackInterval: 2.4,
    telegraphLead: 0.48,
    meleeWeight: 0.7,
    rangedWeight: 0.15
  },
  {
    archetypeId: 'moon-arbalist',
    label: getEnemyDisplayName('moon-arbalist'),
    baseHealth: 40,
    baseDamage: 12,
    attackInterval: 3.6,
    telegraphLead: 0.7,
    meleeWeight: 0.2,
    rangedWeight: 0.95
  },
  {
    archetypeId: 'glass-eel',
    label: getEnemyDisplayName('glass-eel'),
    baseHealth: 52,
    baseDamage: 14,
    attackInterval: 3.8,
    telegraphLead: 0.62,
    meleeWeight: 0.6,
    rangedWeight: 0.45
  }
] as const;

const BIRCH_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'birch-widow',
    label: getEnemyDisplayName('birch-widow'),
    baseHealth: 38,
    baseDamage: 11,
    attackInterval: 2.5,
    telegraphLead: 0.5,
    meleeWeight: 0.85,
    rangedWeight: 0.2
  },
  {
    archetypeId: 'pollen-choir',
    label: getEnemyDisplayName('pollen-choir'),
    baseHealth: 32,
    baseDamage: 8,
    attackInterval: 2.1,
    telegraphLead: 0.42,
    meleeWeight: 0.2,
    rangedWeight: 0.9
  },
  {
    archetypeId: 'root-shepherd',
    label: getEnemyDisplayName('root-shepherd'),
    baseHealth: 66,
    baseDamage: 15,
    attackInterval: 4.2,
    telegraphLead: 0.78,
    meleeWeight: 0.6,
    rangedWeight: 0.55
  }
] as const;

const OBSIDIAN_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'artery-hound',
    label: getEnemyDisplayName('artery-hound'),
    baseHealth: 36,
    baseDamage: 10,
    attackInterval: 2.3,
    telegraphLead: 0.46,
    meleeWeight: 0.9,
    rangedWeight: 0.1
  },
  {
    archetypeId: 'mirror-deacon',
    label: getEnemyDisplayName('mirror-deacon'),
    baseHealth: 46,
    baseDamage: 13,
    attackInterval: 3.5,
    telegraphLead: 0.68,
    meleeWeight: 0.25,
    rangedWeight: 0.92
  },
  {
    archetypeId: 'blackglass-warden',
    label: getEnemyDisplayName('blackglass-warden'),
    baseHealth: 72,
    baseDamage: 16,
    attackInterval: 4.6,
    telegraphLead: 0.82,
    meleeWeight: 0.7,
    rangedWeight: 0.6
  }
] as const;

const DAWN_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'dawn-tender',
    label: getEnemyDisplayName('dawn-tender'),
    baseHealth: 44,
    baseDamage: 11,
    attackInterval: 2.8,
    telegraphLead: 0.52,
    meleeWeight: 0.7,
    rangedWeight: 0.35
  },
  {
    archetypeId: 'halo-drone',
    label: getEnemyDisplayName('halo-drone'),
    baseHealth: 34,
    baseDamage: 10,
    attackInterval: 2.2,
    telegraphLead: 0.4,
    meleeWeight: 0.1,
    rangedWeight: 1
  },
  {
    archetypeId: 'seraph-machinist',
    label: getEnemyDisplayName('seraph-machinist'),
    baseHealth: 74,
    baseDamage: 18,
    attackInterval: 4.7,
    telegraphLead: 0.84,
    meleeWeight: 0.5,
    rangedWeight: 0.8
  }
] as const;

const FINAL_BASE: readonly EncounterEnemyTemplate[] = [
  {
    archetypeId: 'cantor-shade',
    label: getEnemyDisplayName('cantor-shade'),
    baseHealth: 48,
    baseDamage: 14,
    attackInterval: 2.5,
    telegraphLead: 0.44,
    meleeWeight: 0.55,
    rangedWeight: 0.7
  },
  {
    archetypeId: 'broken-choir-lancer',
    label: getEnemyDisplayName('broken-choir-lancer'),
    baseHealth: 62,
    baseDamage: 18,
    attackInterval: 3.8,
    telegraphLead: 0.66,
    meleeWeight: 0.85,
    rangedWeight: 0.5
  },
  {
    archetypeId: 'sun-shard-seraph',
    label: getEnemyDisplayName('sun-shard-seraph'),
    baseHealth: 84,
    baseDamage: 21,
    attackInterval: 5,
    telegraphLead: 0.88,
    meleeWeight: 0.65,
    rangedWeight: 0.95
  }
] as const;

const BIOME_ENEMY_TEMPLATES: Readonly<Record<string, readonly EncounterEnemyTemplate[]>> = {
  'ember-ossuary': EMBER_BASE,
  'moon-reservoir': MOON_BASE,
  'birch-astrarium': BIRCH_BASE,
  'obsidian-artery': OBSIDIAN_BASE,
  'dawn-foundry': DAWN_BASE,
  'broken-sun-choir': FINAL_BASE
};

const SECRET_TEMPLATE: EncounterEnemyTemplate = {
  archetypeId: 'echo-sentinel',
  label: getEnemyDisplayName('echo-sentinel'),
  baseHealth: 55,
  baseDamage: 12,
  attackInterval: 3.2,
  telegraphLead: 0.5,
  meleeWeight: 0.5,
  rangedWeight: 0.5
};

const ELITE_TEMPLATE: EncounterEnemyTemplate = {
  archetypeId: 'warden-vassal',
  label: getEnemyDisplayName('warden-vassal'),
  baseHealth: 88,
  baseDamage: 18,
  attackInterval: 4.8,
  telegraphLead: 0.9,
  meleeWeight: 1.2,
  rangedWeight: 0.9
};

export function buildEncounterWave(context: EncounterSpawnContext): readonly EncounterEnemyTemplate[] {
  const biomeTemplates = BIOME_ENEMY_TEMPLATES[context.biomeId] ?? EMBER_BASE;
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
