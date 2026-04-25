import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function parseTs(relativePath) {
  const sourceText = readRepoFile(relativePath);
  const sourceFile = ts.createSourceFile(relativePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return { sourceText, sourceFile };
}

function findConstInitializer(sourceFile, constName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === constName) {
        if (!declaration.initializer) {
          throw new Error(`Missing initializer for const ${constName}`);
        }
        return declaration.initializer;
      }
    }
  }

  throw new Error(`Missing const declaration: ${constName}`);
}

function unwrapExpression(node) {
  let current = node;
  while (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current) || ts.isParenthesizedExpression(current) || ts.isSatisfiesExpression?.(current)) {
    current = current.expression;
  }
  return current;
}

function asArrayLiteral(node, label) {
  const value = unwrapExpression(node);
  if (!ts.isArrayLiteralExpression(value)) {
    throw new Error(`${label} must be an array literal`);
  }
  return value;
}

function asObjectLiteral(node, label) {
  const value = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(value)) {
    throw new Error(`${label} must contain object literals`);
  }
  return value;
}

function getObjectProperty(objectNode, propertyName, label) {
  const property = objectNode.properties.find((entry) => {
    if (!ts.isPropertyAssignment(entry)) {
      return false;
    }
    if (ts.isIdentifier(entry.name)) {
      return entry.name.text === propertyName;
    }
    if (ts.isStringLiteral(entry.name)) {
      return entry.name.text === propertyName;
    }
    return false;
  });

  if (!property || !ts.isPropertyAssignment(property)) {
    throw new Error(`Missing property ${propertyName} in ${label}`);
  }

  return property.initializer;
}

function readStringLiteral(node, label) {
  if (!ts.isStringLiteralLike(node)) {
    throw new Error(`${label} must be a string literal`);
  }

  return node.text;
}

function readStringArrayLiteral(node, label) {
  const arrayNode = asArrayLiteral(node, label);
  return arrayNode.elements.map((element, index) => readStringLiteral(element, `${label}[${index}]`));
}

function extractIdsFromConstArray(relativePath, constName, key) {
  const { sourceFile } = parseTs(relativePath);
  const initializer = findConstInitializer(sourceFile, constName);
  const arrayNode = asArrayLiteral(initializer, constName);

  return arrayNode.elements.map((element, index) => {
    const objectNode = asObjectLiteral(element, `${constName}[${index}]`);
    const idNode = getObjectProperty(objectNode, key, `${constName}[${index}]`);
    return readStringLiteral(idNode, `${constName}[${index}].${key}`);
  });
}

function extractPairsFromConstArray(relativePath, constName, keys) {
  const { sourceFile } = parseTs(relativePath);
  const initializer = findConstInitializer(sourceFile, constName);
  const arrayNode = asArrayLiteral(initializer, constName);

  return arrayNode.elements.map((element, index) => {
    const objectNode = asObjectLiteral(element, `${constName}[${index}]`);
    const record = {};

    for (const key of keys) {
      const valueNode = getObjectProperty(objectNode, key, `${constName}[${index}]`);
      record[key] = readStringLiteral(valueNode, `${constName}[${index}].${key}`);
    }

    return record;
  });
}

function extractEnemyBiomePairs(relativePath, constName) {
  const { sourceFile } = parseTs(relativePath);
  const initializer = findConstInitializer(sourceFile, constName);
  const arrayNode = asArrayLiteral(initializer, constName);

  return arrayNode.elements.map((element, index) => {
    const objectNode = asObjectLiteral(element, `${constName}[${index}]`);
    const id = readStringLiteral(getObjectProperty(objectNode, 'id', `${constName}[${index}]`), `${constName}[${index}].id`);
    const biomeIds = readStringArrayLiteral(
      getObjectProperty(objectNode, 'biomeIds', `${constName}[${index}]`),
      `${constName}[${index}].biomeIds`
    );
    return { id, biomeIds };
  });
}

function collectArchetypeIds(relativePath) {
  const { sourceFile } = parseTs(relativePath);
  const ids = new Set();

  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      const key = ts.isIdentifier(node.name) ? node.name.text : ts.isStringLiteral(node.name) ? node.name.text : '';
      if (key === 'archetypeId' && ts.isStringLiteralLike(node.initializer)) {
        ids.add(node.initializer.text);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...ids];
}

function parseBiomeRoomSeeds(relativePath) {
  const { sourceFile } = parseTs(relativePath);
  const initializer = findConstInitializer(sourceFile, 'BIOME_ROOM_SEEDS');
  const biomeArray = asArrayLiteral(initializer, 'BIOME_ROOM_SEEDS');

  return biomeArray.elements.map((element, biomeIndex) => {
    const biomeObject = asObjectLiteral(element, `BIOME_ROOM_SEEDS[${biomeIndex}]`);
    const biomeId = readStringLiteral(getObjectProperty(biomeObject, 'biomeId', `BIOME_ROOM_SEEDS[${biomeIndex}]`), 'biomeId');
    const roomPrefix = readStringLiteral(getObjectProperty(biomeObject, 'roomPrefix', `BIOME_ROOM_SEEDS[${biomeIndex}]`), 'roomPrefix');
    const startSlug = readStringLiteral(getObjectProperty(biomeObject, 'startSlug', `BIOME_ROOM_SEEDS[${biomeIndex}]`), 'startSlug');

    const roomsNode = asArrayLiteral(getObjectProperty(biomeObject, 'rooms', `BIOME_ROOM_SEEDS[${biomeIndex}]`), 'rooms');
    const slugs = roomsNode.elements.map((roomElement, roomIndex) => {
      const roomObj = asObjectLiteral(roomElement, `BIOME_ROOM_SEEDS[${biomeIndex}].rooms[${roomIndex}]`);
      return readStringLiteral(getObjectProperty(roomObj, 'slug', `BIOME_ROOM_SEEDS[${biomeIndex}].rooms[${roomIndex}]`), 'slug');
    });

    return {
      biomeId,
      roomPrefix,
      startRoomId: `${roomPrefix}-${startSlug}`,
      roomIds: slugs.map((slug) => `${roomPrefix}-${slug}`)
    };
  });
}


function parseLootTables(relativePath) {
  const { sourceFile } = parseTs(relativePath);
  const initializer = findConstInitializer(sourceFile, 'LOOT_TABLES');
  const tableArray = asArrayLiteral(initializer, 'LOOT_TABLES');

  return tableArray.elements.map((element, tableIndex) => {
    const tableObject = asObjectLiteral(element, `LOOT_TABLES[${tableIndex}]`);
    const id = readStringLiteral(getObjectProperty(tableObject, 'id', `LOOT_TABLES[${tableIndex}]`), 'id');
    const entriesNode = asArrayLiteral(getObjectProperty(tableObject, 'entries', `LOOT_TABLES[${tableIndex}]`), 'entries');

    const relicIds = entriesNode.elements.map((entryNode, entryIndex) => {
      const entryObject = asObjectLiteral(entryNode, `LOOT_TABLES[${tableIndex}].entries[${entryIndex}]`);
      return readStringLiteral(
        getObjectProperty(entryObject, 'relicId', `LOOT_TABLES[${tableIndex}].entries[${entryIndex}]`),
        'relicId'
      );
    });

    return { id, relicIds };
  });
}

function assertMinimumCount({ name, actual, expected }) {
  if (actual < expected) {
    throw new Error(`[content quota] ${name}: expected >= ${expected}, got ${actual}`);
  }

  console.log(`✓ ${name}: ${actual} (>= ${expected})`);
}

function assertNoDuplicateIds(label, ids) {
  const seen = new Set();
  const duplicates = new Set();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  if (duplicates.size > 0) {
    throw new Error(`[data integrity] Duplicate ${label} ids: ${[...duplicates].join(', ')}`);
  }

  console.log(`✓ ${label}: no duplicates`);
}

function assertRoomGraphConnectivity(biomeSeed) {
  const { biomeId, roomIds, startRoomId } = biomeSeed;
  if (roomIds.length < 10 || roomIds.length > 14) {
    throw new Error(`[content quota] ${biomeId} rooms: expected 10-14, got ${roomIds.length}`);
  }

  const graph = new Map();
  for (let index = 0; index < roomIds.length; index += 1) {
    const standardTarget = roomIds[(index + 1) % roomIds.length];
    const riskTarget = roomIds[(index + 2) % roomIds.length];
    const recoveryTarget = roomIds[(index - 1 + roomIds.length) % roomIds.length];
    const secretTarget = roomIds[(index + 3) % roomIds.length];

    graph.set(roomIds[index], [standardTarget, riskTarget, recoveryTarget, secretTarget]);
  }

  const deadEnds = [...graph.entries()].filter(([, targets]) => targets.length === 0).map(([roomId]) => roomId);
  if (deadEnds.length > 0) {
    throw new Error(`[room graph] ${biomeId} dead-end rooms detected: ${deadEnds.join(', ')}`);
  }

  const visited = new Set([startRoomId]);
  const queue = [startRoomId];
  while (queue.length > 0) {
    const roomId = queue.shift();
    const next = graph.get(roomId) ?? [];
    for (const target of next) {
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
  }

  if (visited.size !== roomIds.length) {
    const unreachable = roomIds.filter((roomId) => !visited.has(roomId));
    throw new Error(`[room graph] ${biomeId} contains soft-lock unreachable rooms: ${unreachable.join(', ')}`);
  }

  console.log(`✓ room graph ${biomeId}: ${roomIds.length} rooms, no dead ends, fully reachable`);
}

function walkFiles(dirPath, predicate, bucket = []) {
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const entryStat = statSync(fullPath);
    if (entryStat.isDirectory()) {
      walkFiles(fullPath, predicate, bucket);
      continue;
    }

    if (predicate(fullPath)) {
      bucket.push(fullPath);
    }
  }

  return bucket;
}

function scanDebugStrings() {
  const srcRoot = path.join(repoRoot, 'src');
  const sourceFiles = walkFiles(srcRoot, (filePath) => filePath.endsWith('.ts'));

  const forbiddenPatterns = [
    { name: 'dev token', regex: /\bdev\b/i },
    { name: 'placeholder token', regex: /placeholder/i }
  ];

  const allowList = new Set(['src/engine/debug/PerfHud.ts']);
  const violations = [];

  for (const filePath of sourceFiles) {
    const relativePath = path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
    if (allowList.has(relativePath)) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.regex.test(content)) {
        violations.push(`${relativePath}: ${pattern.name}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`[release guard] Debug-like tokens found:\n${violations.join('\n')}`);
  }

  console.log('✓ release guard: no dev/placeholder tokens under src/ (allowlist applied)');
}

function run() {
  const weaponIds = extractIdsFromConstArray('src/game/items/WeaponDefs.ts', 'WEAPON_DEFS', 'id');
  const offhandIds = extractIdsFromConstArray('src/game/items/OffhandDefs.ts', 'OFFHAND_DEFS', 'id');
  const sigilIds = extractIdsFromConstArray('src/game/items/SigilDefs.ts', 'SIGIL_DEFS', 'id');
  const relicIds = extractIdsFromConstArray('src/game/items/RelicDefs.ts', 'RELIC_DEFS', 'id');
  const lootTables = parseLootTables('src/game/items/LootTables.ts');
  const missionIds = extractIdsFromConstArray('src/game/encounters/MissionTypes.ts', 'MISSION_TYPE_DEFS', 'id');
  const bossContracts = extractPairsFromConstArray('src/game/encounters/BossContracts.ts', 'BOSS_CONTRACTS', ['biomeId', 'bossEnemyId']);
  const bossContractBiomeIds = bossContracts.map((contract) => contract.biomeId);
  const campaignBiomeIds = extractIdsFromConstArray('src/game/state/CampaignBiomes.ts', 'CAMPAIGN_BIOME_ORDER', 'id');
  const regularEnemyIds = extractIdsFromConstArray('src/content/enemies/EnemyCatalog.ts', 'REGULAR_ENEMIES', 'id');
  const eliteEnemyIds = extractIdsFromConstArray('src/content/enemies/EnemyCatalog.ts', 'ELITE_ENEMIES', 'id');
  const miniBossIds = extractIdsFromConstArray('src/content/enemies/EnemyCatalog.ts', 'MINI_BOSSES', 'id');
  const bossEnemyIds = extractIdsFromConstArray('src/content/enemies/EnemyCatalog.ts', 'BOSS_ENEMIES', 'id');
  const bossEnemyBiomePairs = extractEnemyBiomePairs('src/content/enemies/EnemyCatalog.ts', 'BOSS_ENEMIES');

  assertMinimumCount({ name: 'weapons', actual: weaponIds.length, expected: 4 });
  assertMinimumCount({ name: 'offhands', actual: offhandIds.length, expected: 4 });
  assertMinimumCount({ name: 'sigils', actual: sigilIds.length, expected: 12 });
  assertMinimumCount({ name: 'relics', actual: relicIds.length, expected: 24 });
  assertMinimumCount({ name: 'missions', actual: missionIds.length, expected: 8 });
  assertMinimumCount({ name: 'boss contracts', actual: bossContractBiomeIds.length, expected: 6 });
  assertMinimumCount({ name: 'campaign biomes', actual: campaignBiomeIds.length, expected: 6 });
  assertMinimumCount({ name: 'regular enemies', actual: regularEnemyIds.length, expected: 12 });
  assertMinimumCount({ name: 'elite enemies', actual: eliteEnemyIds.length, expected: 6 });
  assertMinimumCount({ name: 'mini bosses', actual: miniBossIds.length, expected: 5 });
  assertMinimumCount({ name: 'boss enemies', actual: bossEnemyIds.length, expected: 6 });

  assertNoDuplicateIds('weapon', weaponIds);
  assertNoDuplicateIds('offhand', offhandIds);
  assertNoDuplicateIds('sigil', sigilIds);
  assertNoDuplicateIds('relic', relicIds);
  assertNoDuplicateIds('loot table', lootTables.map((table) => table.id));

  const lootRelicIds = lootTables.flatMap((table) => table.relicIds);
  const unknownLootRelics = lootRelicIds.filter((relicId) => !relicIds.includes(relicId));
  if (unknownLootRelics.length > 0) {
    throw new Error(`[content validation] LootTables has unknown relic ids: ${[...new Set(unknownLootRelics)].join(', ')}`);
  }
  console.log(`✓ loot table relic references: all ${lootRelicIds.length} entries resolve in RelicDefs`);

  assertNoDuplicateIds('mission', missionIds);

  const allEnemyIds = [...regularEnemyIds, ...eliteEnemyIds, ...miniBossIds, ...bossEnemyIds];
  assertNoDuplicateIds('enemy catalog', allEnemyIds);

  const encounterArchetypeIds = collectArchetypeIds('src/game/encounters/EncounterSpawnTables.ts');
  const unknownArchetypes = encounterArchetypeIds.filter((id) => !allEnemyIds.includes(id));
  if (unknownArchetypes.length > 0) {
    throw new Error(`[content validation] EncounterSpawnTables has unknown archetype ids: ${unknownArchetypes.join(', ')}`);
  }
  console.log(`✓ encounter archetypes: all ${encounterArchetypeIds.length} ids resolve in EnemyCatalog`);

  const unknownBossEnemyIds = bossContracts
    .map((contract) => contract.bossEnemyId)
    .filter((enemyId) => !bossEnemyIds.includes(enemyId));
  if (unknownBossEnemyIds.length > 0) {
    throw new Error(`[content validation] BossContracts has unknown bossEnemyId values: ${[...new Set(unknownBossEnemyIds)].join(', ')}`);
  }

  const bossEnemyBiomeMap = new Map(bossEnemyBiomePairs.map((entry) => [entry.id, entry.biomeIds]));
  for (const contract of bossContracts) {
    const supportedBiomes = bossEnemyBiomeMap.get(contract.bossEnemyId) ?? [];
    if (!supportedBiomes.includes(contract.biomeId)) {
      throw new Error(
        `[content validation] Boss contract biome mismatch: ${contract.bossEnemyId} not registered for biome ${contract.biomeId}`
      );
    }
  }
  console.log(`✓ boss contracts: ${bossContracts.length} contracts map to boss catalog biome assignments`);

  const biomeSeeds = parseBiomeRoomSeeds('src/game/encounters/EncounterRuleSet.ts');
  for (const biomeSeed of biomeSeeds) {
    assertRoomGraphConnectivity(biomeSeed);
  }

  scanDebugStrings();
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
