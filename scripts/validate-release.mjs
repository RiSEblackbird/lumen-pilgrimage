import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function scanFiles({ rootDir, extensions, forbiddenPatterns }) {
  const files = walkFiles(rootDir, (filePath) => extensions.some((ext) => filePath.endsWith(ext)));
  const violations = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.regex.test(content)) {
        violations.push(`${relative(filePath)}: ${pattern.name}`);
      }
    }
  }

  return violations;
}

function ensureDirectoryExists(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  try {
    const info = statSync(fullPath);
    if (!info.isDirectory()) {
      throw new Error(`${relativePath} exists but is not a directory`);
    }
  } catch {
    throw new Error(`[release guard] ${relativePath} directory is missing. Run npm run build first.`);
  }

  return fullPath;
}

function run() {
  const srcRoot = path.join(repoRoot, 'src');
  const distRoot = ensureDirectoryExists('dist');

  const forbiddenLegacyIdentifiers = [
    { name: 'legacy ritual loop token', regex: /\bRitualState\b/ },
    { name: 'legacy glyph system token', regex: /\bGlyphSystem\b/ },
    { name: 'legacy export reward token', regex: /\bDreamExporter\b/ },
    { name: 'legacy codex panel token', regex: /\bFlatCodexPanel\b|\bVrCodexPanel\b/ },
    { name: 'legacy sanctuary token', regex: /\bSanctuary\b/ }
  ];

  const forbiddenReleaseIdentifiers = [
    { name: 'debug HUD token', regex: /\bPerfHud\b/ },
    { name: 'debug overlay token', regex: /\bDevOverlay\b/ },
    { name: 'spawn cheat token', regex: /\bSpawnCheats\b/ },
    { name: 'legacy ritual token', regex: /\bRitualState\b/ },
    { name: 'legacy glyph token', regex: /\bGlyphSystem\b/ },
    { name: 'legacy export token', regex: /\bDreamExporter\b/ }
  ];

  const srcViolations = scanFiles({
    rootDir: srcRoot,
    extensions: ['.ts'],
    forbiddenPatterns: forbiddenLegacyIdentifiers
  });

  if (srcViolations.length > 0) {
    throw new Error(`[release guard] Legacy implementation references found under src/:\n${srcViolations.join('\n')}`);
  }
  console.log('✓ release guard: no legacy ritual/glyph/export/codex identifiers in src/');

  const distViolations = scanFiles({
    rootDir: distRoot,
    extensions: ['.html', '.js', '.css'],
    forbiddenPatterns: forbiddenReleaseIdentifiers
  });

  if (distViolations.length > 0) {
    throw new Error(`[release guard] Forbidden debug/legacy tokens found in dist/:\n${distViolations.join('\n')}`);
  }
  console.log('✓ release guard: dist/ does not include debug helpers or legacy loop tokens');
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
