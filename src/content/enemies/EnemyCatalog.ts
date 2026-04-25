export type EnemyRole =
  | 'fast-flanker'
  | 'shield-bearer'
  | 'sniper'
  | 'support-buffer'
  | 'swarm'
  | 'summoner'
  | 'turret-anchor'
  | 'grabber'
  | 'area-denial'
  | 'airborne-harassment';

export interface EnemyCatalogEntry {
  readonly id: string;
  readonly displayName: string;
  readonly role: EnemyRole;
  readonly biomeIds: readonly string[];
}

export const REGULAR_ENEMIES: readonly EnemyCatalogEntry[] = [
  { id: 'ash-mote', displayName: 'Ash Mote', role: 'swarm', biomeIds: ['ember-ossuary'] },
  { id: 'candle-penitent', displayName: 'Candle Penitent', role: 'shield-bearer', biomeIds: ['ember-ossuary'] },
  { id: 'furnace-thurifer', displayName: 'Furnace Thurifer', role: 'area-denial', biomeIds: ['ember-ossuary'] },
  { id: 'moon-arbalist', displayName: 'Moon Arbalist', role: 'sniper', biomeIds: ['moon-reservoir'] },
  { id: 'reservoir-monk', displayName: 'Reservoir Monk', role: 'support-buffer', biomeIds: ['moon-reservoir'] },
  { id: 'glass-eel', displayName: 'Glass Eel', role: 'fast-flanker', biomeIds: ['moon-reservoir'] },
  { id: 'birch-widow', displayName: 'Birch Widow', role: 'grabber', biomeIds: ['birch-astrarium'] },
  { id: 'pollen-choir', displayName: 'Pollen Choir', role: 'summoner', biomeIds: ['birch-astrarium'] },
  { id: 'root-shepherd', displayName: 'Root Shepherd', role: 'turret-anchor', biomeIds: ['birch-astrarium'] },
  { id: 'artery-hound', displayName: 'Artery Hound', role: 'fast-flanker', biomeIds: ['obsidian-artery'] },
  { id: 'mirror-deacon', displayName: 'Mirror Deacon', role: 'sniper', biomeIds: ['obsidian-artery'] },
  { id: 'halo-drone', displayName: 'Halo Drone', role: 'airborne-harassment', biomeIds: ['dawn-foundry', 'broken-sun-choir'] },
  {
    id: 'echo-sentinel',
    displayName: 'Echo Sentinel',
    role: 'turret-anchor',
    biomeIds: ['ember-ossuary', 'moon-reservoir', 'birch-astrarium', 'obsidian-artery', 'dawn-foundry', 'broken-sun-choir']
  }
] as const;

export const ELITE_ENEMIES: readonly EnemyCatalogEntry[] = [
  { id: 'blackglass-warden', displayName: 'Blackglass Warden', role: 'shield-bearer', biomeIds: ['obsidian-artery'] },
  { id: 'seraph-machinist', displayName: 'Seraph Machinist', role: 'area-denial', biomeIds: ['dawn-foundry'] },
  { id: 'dawn-tender', displayName: 'Dawn Tender', role: 'support-buffer', biomeIds: ['dawn-foundry'] },
  { id: 'cantor-shade', displayName: 'Cantor Shade', role: 'summoner', biomeIds: ['broken-sun-choir'] },
  { id: 'broken-choir-lancer', displayName: 'Broken Choir Lancer', role: 'grabber', biomeIds: ['broken-sun-choir'] },
  { id: 'sun-shard-seraph', displayName: 'Sun Shard Seraph', role: 'airborne-harassment', biomeIds: ['broken-sun-choir'] },
  {
    id: 'warden-vassal',
    displayName: 'Warden Vassal',
    role: 'shield-bearer',
    biomeIds: ['ember-ossuary', 'moon-reservoir', 'birch-astrarium', 'obsidian-artery', 'dawn-foundry', 'broken-sun-choir']
  }
] as const;

export const MINI_BOSSES: readonly EnemyCatalogEntry[] = [
  { id: 'ossuary-pyre-knight', displayName: 'Ossuary Pyre Knight', role: 'shield-bearer', biomeIds: ['ember-ossuary'] },
  { id: 'mirror-tide-abbot', displayName: 'Mirror Tide Abbot', role: 'sniper', biomeIds: ['moon-reservoir'] },
  { id: 'thorn-matron', displayName: 'Thorn Matron', role: 'summoner', biomeIds: ['birch-astrarium'] },
  { id: 'split-axis-curator', displayName: 'Split Axis Curator', role: 'turret-anchor', biomeIds: ['obsidian-artery'] },
  { id: 'rail-anointer', displayName: 'Rail Anointer', role: 'area-denial', biomeIds: ['dawn-foundry'] }
] as const;

export const BOSS_ENEMIES: readonly EnemyCatalogEntry[] = [
  { id: 'bell-of-cinders', displayName: 'Bell of Cinders', role: 'area-denial', biomeIds: ['ember-ossuary'] },
  { id: 'thirteen-eyed-pool', displayName: 'The Thirteen-Eyed Pool', role: 'summoner', biomeIds: ['moon-reservoir'] },
  { id: 'oracle-of-bark-and-polaris', displayName: 'Oracle of Bark and Polaris', role: 'support-buffer', biomeIds: ['birch-astrarium'] },
  { id: 'warden-of-split-reflection', displayName: 'The Warden of Split Reflection', role: 'shield-bearer', biomeIds: ['obsidian-artery'] },
  { id: 'daybreak-engine', displayName: 'Daybreak Engine', role: 'turret-anchor', biomeIds: ['dawn-foundry'] },
  {
    id: 'last-cantor-broken-sun-choir',
    displayName: 'The Last Cantor / Broken Sun Choir',
    role: 'grabber',
    biomeIds: ['broken-sun-choir']
  },
  {
    id: 'broken-sun-choir-incarnate',
    displayName: 'Broken Sun Choir Incarnate',
    role: 'area-denial',
    biomeIds: ['broken-sun-choir']
  }
] as const;

export const ALL_ENEMY_CATALOG_ENTRIES: readonly EnemyCatalogEntry[] = [
  ...REGULAR_ENEMIES,
  ...ELITE_ENEMIES,
  ...MINI_BOSSES,
  ...BOSS_ENEMIES
] as const;

const ENEMY_CATALOG_BY_ID: ReadonlyMap<string, EnemyCatalogEntry> = new Map(
  ALL_ENEMY_CATALOG_ENTRIES.map((entry) => [entry.id, entry] as const)
);

export function getEnemyCatalogEntry(id: string): EnemyCatalogEntry | null {
  return ENEMY_CATALOG_BY_ID.get(id) ?? null;
}

export function getEnemyDisplayName(id: string, fallback = id): string {
  return getEnemyCatalogEntry(id)?.displayName ?? fallback;
}
