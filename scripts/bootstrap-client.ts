import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defaultContent } from '../src/features/cms/defaultContent';
import {
  bootstrapFixtures,
  bootstrapModules,
  bootstrapPages,
  bootstrapVariants,
  buildEnvExample,
  buildSiteProfileSource,
  buildStarterContent,
  normalizeBootstrapConfig,
  type BootstrapFixtureName,
  type BootstrapConfigInput,
  type BootstrapVariant,
  updateGitIgnoreForStarter,
  updateGlobalCssBrandColors,
  updatePackageLock,
  updatePackageManifest,
  updateTailwindBrandColors
} from '../src/features/bootstrap/clientStarter';
import type { CmsContent } from '../src/features/cms/types';

type CliFlags = Record<string, string | boolean>;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDir, '..');
const ignoredNames = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist']);

function printHelp() {
  console.log(`Create a new client starter from this repo.

Usage:
  npm run bootstrap:client -- --output ../acme-cms --site-name "Acme Studio"

Options:
  --output <path>             Target directory for the generated starter.
  --site-name <value>         Client-facing site name.
  --site-url <value>          Public site URL. Default: https://<slug>.example.com
  --admin-email <value>       Bootstrap admin email.
  --admin-name <value>        Bootstrap admin display name.
  --brand-mark <value>        Brand mark for header/admin chrome.
  --brand-wordmark <value>    Wordmark for admin chrome.
  --variant <name>            Common client profile: ${bootstrapVariants.join(', ')}.
  --fixture <name>            Deterministic seed shape: ${bootstrapFixtures.join(', ')}.
  --modules <list>            Comma-separated: ${bootstrapModules.join(', ')}.
  --pages <list>              Comma-separated: ${bootstrapPages.join(', ')}.
  --color-dark <hex>          Dark brand color mapped to vanailaNavy token.
  --color-primary <hex>       Primary brand color mapped to electricBlue token.
  --color-secondary <hex>     Secondary brand color mapped to royalPurple token.
  --color-accent <hex>        Accent brand color mapped to vibrantCyan token.
  --color-text <hex>          Text brand color mapped to deepSlate token.
  --config <path>             Optional JSON config file. CLI flags override it.
  --help                      Print this help message.

Example:
  npm run bootstrap:client -- --output ../acme-cms --site-name "Acme Studio" --variant portfolio-case-studies --color-dark "#17304a" --color-primary "#0f79ff"
`);
}

function parseArgs(argv: string[]) {
  const flags: CliFlags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      throw new Error(`Unexpected argument: ${current}`);
    }

    const [rawKey, inlineValue] = current.slice(2).split('=', 2);
    if (!rawKey) {
      throw new Error('Encountered an empty argument key.');
    }

    if (inlineValue !== undefined) {
      flags[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      flags[rawKey] = true;
      continue;
    }

    flags[rawKey] = next;
    index += 1;
  }

  return flags;
}

function parseList(value: string | boolean | undefined, allowed: readonly string[]) {
  if (!value || typeof value !== 'string') return undefined;
  if (value.trim().toLowerCase() === 'all') return [...allowed];
  if (value.trim().toLowerCase() === 'none') return [];

  const values = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const invalid = values.filter((entry) => !allowed.includes(entry));
  if (invalid.length > 0) {
    throw new Error(`Invalid values: ${invalid.join(', ')}. Allowed: ${allowed.join(', ')}`);
  }

  return values;
}

function parseEnum<T extends string>(value: string | boolean | undefined, allowed: readonly T[], label: string) {
  if (!value || typeof value !== 'string') return undefined;
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}. Allowed: ${allowed.join(', ')}`);
  }

  return value as T;
}

async function readJsonFile<T>(path: string) {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function loadConfigFile(configPath: string) {
  return readJsonFile<BootstrapConfigInput>(configPath);
}

async function pathExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function resolvePathFromCwd(value: string) {
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
}

function shouldSkipSourcePath(sourcePath: string, outputRoot: string) {
  const relativePath = relative(sourceRoot, sourcePath);
  if (!relativePath || relativePath.startsWith('..')) {
    return false;
  }

  const firstSegment = relativePath.split(/[\\/]/).filter(Boolean)[0];
  if (firstSegment && ignoredNames.has(firstSegment)) {
    return true;
  }

  const normalizedOutput = outputRoot.toLowerCase();
  const normalizedSource = sourcePath.toLowerCase();
  return normalizedSource === normalizedOutput || normalizedSource.startsWith(`${normalizedOutput}\\`);
}

async function ensureEmptyOutputDirectory(outputRoot: string) {
  if (!(await pathExists(outputRoot))) {
    await mkdir(outputRoot, { recursive: true });
    return;
  }

  const stats = await stat(outputRoot);
  if (!stats.isDirectory()) {
    throw new Error(`Output path exists and is not a directory: ${outputRoot}`);
  }

  const entries = await readdir(outputRoot);
  if (entries.length > 0) {
    throw new Error(`Output directory is not empty: ${outputRoot}`);
  }
}

async function copyWorkspaceTree(sourceDir: string, outputRoot: string) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    if (shouldSkipSourcePath(sourcePath, outputRoot)) {
      continue;
    }

    const relativePath = relative(sourceRoot, sourcePath);
    const destinationPath = join(outputRoot, relativePath);

    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      await copyWorkspaceTree(sourcePath, outputRoot);
      continue;
    }

    if (entry.isFile()) {
      await mkdir(dirname(destinationPath), { recursive: true });
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function loadSourceContent() {
  const contentPath = resolve(sourceRoot, 'data', 'content.json');
  if (await pathExists(contentPath)) {
    return readJsonFile<CmsContent>(contentPath);
  }

  return structuredClone(defaultContent);
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
    return;
  }

  const configPath = typeof flags.config === 'string' ? resolvePathFromCwd(flags.config) : null;
  const fileConfig = configPath ? await loadConfigFile(configPath) : null;
  const parsedVariant = parseEnum(flags.variant, bootstrapVariants, 'variant') as BootstrapVariant | undefined;
  const parsedFixture = parseEnum(flags.fixture, bootstrapFixtures, 'fixture') as BootstrapFixtureName | undefined;
  const parsedModules = parseList(flags.modules, bootstrapModules) as BootstrapConfigInput['modules'] | undefined;
  const parsedPages = parseList(flags.pages, bootstrapPages) as BootstrapConfigInput['pages'] | undefined;

  const mergedInput: BootstrapConfigInput = {
    ...(fileConfig ?? {}),
    outputDir:
      (typeof flags.output === 'string' ? flags.output : undefined) ?? fileConfig?.outputDir,
    siteName:
      (typeof flags['site-name'] === 'string' ? flags['site-name'] : undefined) ?? fileConfig?.siteName ?? '',
    siteUrl:
      (typeof flags['site-url'] === 'string' ? flags['site-url'] : undefined) ?? fileConfig?.siteUrl,
    adminEmail:
      (typeof flags['admin-email'] === 'string' ? flags['admin-email'] : undefined) ?? fileConfig?.adminEmail,
    adminName:
      (typeof flags['admin-name'] === 'string' ? flags['admin-name'] : undefined) ?? fileConfig?.adminName,
    brandMark:
      (typeof flags['brand-mark'] === 'string' ? flags['brand-mark'] : undefined) ?? fileConfig?.brandMark,
    brandWordmark:
      (typeof flags['brand-wordmark'] === 'string' ? flags['brand-wordmark'] : undefined) ?? fileConfig?.brandWordmark,
    variant: parsedVariant ?? fileConfig?.variant,
    fixture: parsedFixture ?? fileConfig?.fixture,
    modules: parsedModules ?? fileConfig?.modules,
    pages: parsedPages ?? fileConfig?.pages,
    colors: {
      ...(fileConfig?.colors ?? {}),
      ...(typeof flags['color-dark'] === 'string' ? { dark: flags['color-dark'] } : {}),
      ...(typeof flags['color-primary'] === 'string' ? { primary: flags['color-primary'] } : {}),
      ...(typeof flags['color-secondary'] === 'string' ? { secondary: flags['color-secondary'] } : {}),
      ...(typeof flags['color-accent'] === 'string' ? { accent: flags['color-accent'] } : {}),
      ...(typeof flags['color-text'] === 'string' ? { text: flags['color-text'] } : {})
    }
  };

  const config = normalizeBootstrapConfig(mergedInput);
  if (!config.outputDir) {
    throw new Error('outputDir is required. Pass --output <path> or provide outputDir in --config.');
  }

  const outputRoot = resolvePathFromCwd(config.outputDir);
  await ensureEmptyOutputDirectory(outputRoot);
  await copyWorkspaceTree(sourceRoot, outputRoot);

  const starterContent = buildStarterContent(await loadSourceContent(), config);

  const packagePath = join(outputRoot, 'package.json');
  const packageLockPath = join(outputRoot, 'package-lock.json');
  const gitIgnorePath = join(outputRoot, '.gitignore');
  const tailwindPath = join(outputRoot, 'tailwind.config.mjs');
  const globalsPath = join(outputRoot, 'src', 'app', 'globals.css');
  const siteProfilePath = join(outputRoot, 'src', 'config', 'site-profile.ts');
  const envExamplePath = join(outputRoot, '.env.example');
  const contentPath = join(outputRoot, 'data', 'content.json');

  const [packageJson, packageLock, gitIgnoreSource, tailwindSource, globalsSource] = await Promise.all([
    readJsonFile<Record<string, unknown>>(packagePath),
    readJsonFile<Record<string, unknown>>(packageLockPath),
    readFile(gitIgnorePath, 'utf8'),
    readFile(tailwindPath, 'utf8'),
    readFile(globalsPath, 'utf8')
  ]);

  await Promise.all([
    writeFile(packagePath, `${JSON.stringify(updatePackageManifest(packageJson, config), null, 2)}\n`),
    writeFile(packageLockPath, `${JSON.stringify(updatePackageLock(packageLock, config), null, 2)}\n`),
    writeFile(gitIgnorePath, `${updateGitIgnoreForStarter(gitIgnoreSource)}\n`),
    writeFile(tailwindPath, updateTailwindBrandColors(tailwindSource, config.colors)),
    writeFile(globalsPath, updateGlobalCssBrandColors(globalsSource, config.colors)),
    writeFile(siteProfilePath, buildSiteProfileSource(config)),
    writeFile(envExamplePath, buildEnvExample(config)),
    writeFile(contentPath, `${JSON.stringify(starterContent, null, 2)}\n`)
  ]);

  console.log(`Client starter created at ${outputRoot}`);
  console.log(`Package: ${config.packageName}`);
  console.log(`Variant: ${config.variant ?? 'custom'}`);
  console.log(`Fixture: ${config.fixture}`);
  console.log(`Modules: ${config.modules.join(', ') || 'none'}`);
  console.log(`Seeded pages: home${config.pages.length > 0 ? `, ${config.pages.join(', ')}` : ''}`);
  console.log(`Site URL template: ${config.siteUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
