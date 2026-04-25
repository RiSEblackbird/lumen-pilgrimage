import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function extractConstArrayBody(source, constName) {
  const marker = `const ${constName}`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing const declaration: ${constName}`);
  }

  const assignmentIndex = source.indexOf('=', start);
  if (assignmentIndex === -1) {
    throw new Error(`Missing assignment for ${constName}`);
  }

  const bracketStart = source.indexOf('[', assignmentIndex);
  if (bracketStart === -1) {
    throw new Error(`Missing array start for ${constName}`);
  }

  let depth = 0;
  for (let i = bracketStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') {
      depth += 1;
    } else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bracketStart, i + 1);
      }
    }
  }

  throw new Error(`Unclosed array literal for ${constName}`);
}

function countEntriesByKey(arrayBody, key) {
  const pattern = new RegExp(`\\b${key}\\s*:\\s*['\"][^'\"]+['\"]`, 'g');
  const matches = arrayBody.match(pattern);
  return matches ? matches.length : 0;
}

function assertMinimumCount({ name, actual, expected }) {
  if (actual < expected) {
    throw new Error(`[content quota] ${name}: expected >= ${expected}, got ${actual}`);
  }

  console.log(`✓ ${name}: ${actual} (>= ${expected})`);
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
  const weaponDefs = readRepoFile('src/game/items/WeaponDefs.ts');
  const offhandDefs = readRepoFile('src/game/items/OffhandDefs.ts');
  const sigilDefs = readRepoFile('src/game/items/SigilDefs.ts');
  const relicDefs = readRepoFile('src/game/items/RelicDefs.ts');
  const missionDefs = readRepoFile('src/game/encounters/MissionTypes.ts');
  const bossContracts = readRepoFile('src/game/encounters/BossContracts.ts');
  const campaignBiomes = readRepoFile('src/game/state/CampaignBiomes.ts');
  const enemyCatalog = readRepoFile('src/content/enemies/EnemyCatalog.ts');

  assertMinimumCount({
    name: 'weapons',
    actual: countEntriesByKey(extractConstArrayBody(weaponDefs, 'WEAPON_DEFS'), 'id'),
    expected: 4
  });
  assertMinimumCount({
    name: 'offhands',
    actual: countEntriesByKey(extractConstArrayBody(offhandDefs, 'OFFHAND_DEFS'), 'id'),
    expected: 4
  });
  assertMinimumCount({
    name: 'sigils',
    actual: countEntriesByKey(extractConstArrayBody(sigilDefs, 'SIGIL_DEFS'), 'id'),
    expected: 12
  });
  assertMinimumCount({
    name: 'relics',
    actual: countEntriesByKey(extractConstArrayBody(relicDefs, 'RELIC_DEFS'), 'id'),
    expected: 24
  });
  assertMinimumCount({
    name: 'missions',
    actual: countEntriesByKey(extractConstArrayBody(missionDefs, 'MISSION_TYPE_DEFS'), 'id'),
    expected: 8
  });
  assertMinimumCount({
    name: 'boss contracts',
    actual: countEntriesByKey(extractConstArrayBody(bossContracts, 'BOSS_CONTRACTS'), 'biomeId'),
    expected: 6
  });
  assertMinimumCount({
    name: 'campaign biomes',
    actual: countEntriesByKey(extractConstArrayBody(campaignBiomes, 'CAMPAIGN_BIOME_ORDER'), 'id'),
    expected: 6
  });

  assertMinimumCount({
    name: 'regular enemies',
    actual: countEntriesByKey(extractConstArrayBody(enemyCatalog, 'REGULAR_ENEMIES'), 'id'),
    expected: 12
  });
  assertMinimumCount({
    name: 'elite enemies',
    actual: countEntriesByKey(extractConstArrayBody(enemyCatalog, 'ELITE_ENEMIES'), 'id'),
    expected: 6
  });
  assertMinimumCount({
    name: 'mini bosses',
    actual: countEntriesByKey(extractConstArrayBody(enemyCatalog, 'MINI_BOSSES'), 'id'),
    expected: 5
  });
  assertMinimumCount({
    name: 'boss enemies',
    actual: countEntriesByKey(extractConstArrayBody(enemyCatalog, 'BOSS_ENEMIES'), 'id'),
    expected: 6
  });

  scanDebugStrings();
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
