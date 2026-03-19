import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import '../src/services/loadLocalEnv';
import * as dbCollectionsStore from '../src/features/cms/dbCollectionsStore';
import * as dbStore from '../src/features/cms/dbStore';
import * as fileStore from '../src/features/cms/fileStore';
import type { CmsContent, LandingPage, MediaAsset } from '../src/features/cms/types';
import { env } from '../src/services/env';

type MigrationOptions = {
  dryRun: boolean;
  uploadAllPublic: boolean;
};

type AssetStatus = 'would-upload' | 'uploaded' | 'remote' | 'missing';

type AssetResolution = {
  key: string;
  publicUrl: string;
  status: AssetStatus;
};

type MigrationStats = {
  rewrittenFields: number;
  updatedMediaAssets: number;
};

const PUBLIC_ROOT = resolve(process.cwd(), 'public');
const MANAGED_PREFIXES = ['media/', 'portfolio/'];
const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp'
};

function parseOptions(argv: string[]): MigrationOptions {
  const args = new Set(argv);
  const unknownArgs = argv.filter((arg) => !['--dry-run', '--upload-all-public'].includes(arg));

  if (unknownArgs.length > 0) {
    throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`);
  }

  return {
    dryRun: args.has('--dry-run'),
    uploadAllPublic: args.has('--upload-all-public')
  };
}

function isDatabaseMode() {
  return Boolean(env.databaseUrl);
}

function getSupabaseStorageClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey || !env.supabaseStorageBucket) {
    throw new Error(
      'SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET are required for media migration.'
    );
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeStorageKey(value: string) {
  const normalized = safeDecode(value.trim()).replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) {
    return '';
  }

  return segments.join('/');
}

function isManagedStorageKey(value: string) {
  return MANAGED_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function extractManagedStorageKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = normalizeStorageKey(trimmed);
  if (direct && isManagedStorageKey(direct)) {
    return direct;
  }

  try {
    const parsed = new URL(trimmed, env.siteUrl);
    const fromPath = normalizeStorageKey(parsed.pathname);
    if (fromPath && isManagedStorageKey(fromPath)) {
      return fromPath;
    }
  } catch {
    return null;
  }

  return null;
}

function getContentType(storageKey: string) {
  return MIME_TYPES[extname(storageKey).toLowerCase()] ?? 'application/octet-stream';
}

function safePublicPath(storageKey: string) {
  const nextPath = resolve(PUBLIC_ROOT, storageKey);
  const relativePath = relative(PUBLIC_ROOT, nextPath);
  const relativeSegments = relativePath.split(/[\\/]/).filter(Boolean);

  if (!relativePath || relativePath.startsWith('..') || relativeSegments.includes('..')) {
    throw new Error(`Invalid storage key: ${storageKey}`);
  }

  return nextPath;
}

async function loadRawContent(): Promise<{ content: CmsContent; source: string }> {
  if (!isDatabaseMode()) {
    return {
      content: await fileStore.readContent(),
      source: 'file:data/content.json'
    };
  }

  const [settings, pages, blogPosts, portfolioProjects, categories, mediaAssets] = await Promise.all([
    dbStore.getSettings(),
    dbStore.getPages(),
    dbStore.getBlogPosts(true),
    dbStore.getPortfolioProjects(true),
    dbCollectionsStore.getCategories(),
    dbCollectionsStore.getMediaAssets()
  ]);

  return {
    content: {
      settings,
      pages,
      blogPosts,
      portfolioProjects,
      categories,
      mediaAssets
    },
    source: 'database'
  };
}

async function saveRawContent(content: CmsContent) {
  if (!isDatabaseMode()) {
    await fileStore.writeContent(content);
    return;
  }

  await dbStore.replaceAllCmsContent(content);
}

function collectContentStorageKeys(content: CmsContent) {
  const keys = new Set<string>();

  const addValue = (value: string) => {
    const key = extractManagedStorageKey(value);
    if (key) {
      keys.add(key);
    }
  };

  addValue(content.settings.organizationLogo);
  addValue(content.settings.defaultOgImage);
  addValue(content.settings.seo.defaultOgImage);

  for (const page of Object.values(content.pages)) {
    addValue(page.seo.socialImage);
    for (const section of page.sections) {
      addValue(section.mediaImage);
    }
    for (const block of page.homeBlocks ?? []) {
      if (block.type === 'why_split') {
        addValue(block.mediaImage);
      }
    }
  }

  for (const post of content.blogPosts) {
    addValue(post.coverImage);
    addValue(post.seo.socialImage);
  }

  for (const project of content.portfolioProjects) {
    addValue(project.coverImage);
    addValue(project.seo.socialImage);
    for (const image of project.gallery) {
      addValue(image);
    }
  }

  for (const asset of content.mediaAssets) {
    addValue(asset.url);
    addValue(asset.storageKey ?? '');
  }

  return keys;
}

async function collectPublicStorageKeys(prefix: 'media' | 'portfolio') {
  const root = resolve(PUBLIC_ROOT, prefix);
  const keys = new Set<string>();

  async function walk(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (isNotFound(error)) {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const fullPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const key = normalizeStorageKey(relative(PUBLIC_ROOT, fullPath));
      if (key && isManagedStorageKey(key)) {
        keys.add(key);
      }
    }
  }

  await walk(root);
  return keys;
}

function isNotFound(error: unknown) {
  return typeof error === 'object' && error !== null && (error as NodeJS.ErrnoException).code === 'ENOENT';
}

async function remoteObjectExists(
  client: SupabaseClient,
  storageKey: string
) {
  const directory = dirname(storageKey);
  const fileName = basename(storageKey);
  const { data, error } = await client.storage
    .from(env.supabaseStorageBucket)
    .list(directory === '.' ? '' : directory, { limit: 100, search: fileName });

  if (error) {
    throw new Error(`Failed to inspect Supabase bucket for ${storageKey}: ${error.message}`);
  }

  return (data ?? []).some((entry) => entry.name === fileName);
}

function buildPublicUrl(
  client: SupabaseClient,
  storageKey: string
) {
  const {
    data: { publicUrl }
  } = client.storage.from(env.supabaseStorageBucket).getPublicUrl(storageKey);

  return publicUrl;
}

async function resolveAsset(
  client: SupabaseClient,
  storageKey: string,
  options: MigrationOptions
): Promise<AssetResolution> {
  const publicUrl = buildPublicUrl(client, storageKey);
  const fullPath = safePublicPath(storageKey);

  try {
    const fileBuffer = await readFile(fullPath);

    if (options.dryRun) {
      return {
        key: storageKey,
        publicUrl,
        status: 'would-upload'
      };
    }

    const { error } = await client.storage.from(env.supabaseStorageBucket).upload(storageKey, fileBuffer, {
      cacheControl: '31536000',
      contentType: getContentType(storageKey),
      upsert: true
    });

    if (error) {
      throw new Error(`Failed to upload ${storageKey}: ${error.message}`);
    }

    return {
      key: storageKey,
      publicUrl,
      status: 'uploaded'
    };
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
  }

  if (await remoteObjectExists(client, storageKey)) {
    return {
      key: storageKey,
      publicUrl,
      status: 'remote'
    };
  }

  return {
    key: storageKey,
    publicUrl,
    status: 'missing'
  };
}

function rewriteAssetValue(
  value: string,
  resolutions: Map<string, AssetResolution>,
  stats: MigrationStats
) {
  const key = extractManagedStorageKey(value);
  if (!key) return value;

  const resolution = resolutions.get(key);
  if (!resolution || resolution.status === 'missing') {
    return value;
  }

  if (value !== resolution.publicUrl) {
    stats.rewrittenFields += 1;
  }

  return resolution.publicUrl;
}

function rewritePageAssets(
  page: LandingPage,
  resolutions: Map<string, AssetResolution>,
  stats: MigrationStats
) {
  page.seo.socialImage = rewriteAssetValue(page.seo.socialImage, resolutions, stats);

  for (const section of page.sections) {
    section.mediaImage = rewriteAssetValue(section.mediaImage, resolutions, stats);
  }

  for (const block of page.homeBlocks ?? []) {
    if (block.type === 'why_split') {
      block.mediaImage = rewriteAssetValue(block.mediaImage, resolutions, stats);
    }
  }
}

function rewriteMediaAsset(
  asset: MediaAsset,
  resolutions: Map<string, AssetResolution>,
  stats: MigrationStats
) {
  const key = extractManagedStorageKey(asset.url) ?? extractManagedStorageKey(asset.storageKey ?? '');
  if (!key) return;

  const resolution = resolutions.get(key);
  if (!resolution || resolution.status === 'missing') {
    return;
  }

  if (asset.url !== resolution.publicUrl) {
    stats.rewrittenFields += 1;
  }

  if (asset.storageProvider !== 'supabase' || asset.storageKey !== key) {
    stats.updatedMediaAssets += 1;
  }

  asset.url = resolution.publicUrl;
  asset.storageProvider = 'supabase';
  asset.storageKey = key;
}

function rewriteContentAssets(content: CmsContent, resolutions: Map<string, AssetResolution>) {
  const stats: MigrationStats = {
    rewrittenFields: 0,
    updatedMediaAssets: 0
  };

  content.settings.organizationLogo = rewriteAssetValue(
    content.settings.organizationLogo,
    resolutions,
    stats
  );
  content.settings.defaultOgImage = rewriteAssetValue(
    content.settings.defaultOgImage,
    resolutions,
    stats
  );
  content.settings.seo.defaultOgImage = rewriteAssetValue(
    content.settings.seo.defaultOgImage,
    resolutions,
    stats
  );

  for (const page of Object.values(content.pages)) {
    rewritePageAssets(page, resolutions, stats);
  }

  for (const post of content.blogPosts) {
    post.coverImage = rewriteAssetValue(post.coverImage, resolutions, stats);
    post.seo.socialImage = rewriteAssetValue(post.seo.socialImage, resolutions, stats);
  }

  for (const project of content.portfolioProjects) {
    project.coverImage = rewriteAssetValue(project.coverImage, resolutions, stats);
    project.seo.socialImage = rewriteAssetValue(project.seo.socialImage, resolutions, stats);
    project.gallery = project.gallery.map((image) => rewriteAssetValue(image, resolutions, stats));
  }

  for (const asset of content.mediaAssets) {
    rewriteMediaAsset(asset, resolutions, stats);
  }

  return stats;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const client = getSupabaseStorageClient();
  const { content, source } = await loadRawContent();
  const contentKeys = collectContentStorageKeys(content);
  const allKeys = new Set(contentKeys);

  let extraPublicKeys = new Set<string>();
  if (options.uploadAllPublic) {
    const [mediaKeys, portfolioKeys] = await Promise.all([
      collectPublicStorageKeys('media'),
      collectPublicStorageKeys('portfolio')
    ]);
    extraPublicKeys = new Set([...mediaKeys, ...portfolioKeys].filter((key) => !contentKeys.has(key)));
    for (const key of extraPublicKeys) {
      allKeys.add(key);
    }
  }

  console.log(
    `Migrating media from ${source} (${isDatabaseMode() ? 'database mode' : 'file mode'}) to Supabase bucket ${env.supabaseStorageBucket}.`
  );
  console.log(
    `Options: dryRun=${options.dryRun ? 'yes' : 'no'}, uploadAllPublic=${
      options.uploadAllPublic ? 'yes' : 'no'
    }`
  );

  if (allKeys.size === 0) {
    console.log('No eligible /media or /portfolio assets were found in CMS content or public/.');
    return;
  }

  const resolutions = new Map<string, AssetResolution>();
  for (const key of Array.from(allKeys).sort()) {
    resolutions.set(key, await resolveAsset(client, key, options));
  }

  const stats = rewriteContentAssets(content, resolutions);
  const uploads = Array.from(resolutions.values());
  const uploadedCount = uploads.filter((entry) => entry.status === 'uploaded').length;
  const wouldUploadCount = uploads.filter((entry) => entry.status === 'would-upload').length;
  const remoteCount = uploads.filter((entry) => entry.status === 'remote').length;
  const missing = uploads.filter((entry) => entry.status === 'missing').map((entry) => entry.key);
  const shouldWrite = stats.rewrittenFields > 0 || stats.updatedMediaAssets > 0;

  if (!options.dryRun && shouldWrite) {
    await saveRawContent(content);
  }

  console.log(`Referenced CMS assets: ${contentKeys.size}`);
  console.log(`Extra public assets: ${extraPublicKeys.size}`);
  console.log(`Uploaded to Supabase: ${uploadedCount}`);
  console.log(`Already present in Supabase: ${remoteCount}`);
  console.log(`Would upload (dry run): ${wouldUploadCount}`);
  console.log(`Rewritten CMS fields: ${stats.rewrittenFields}`);
  console.log(`Updated media library records: ${stats.updatedMediaAssets}`);
  console.log(`Missing assets: ${missing.length}`);

  if (missing.length > 0) {
    console.log('Missing keys:');
    for (const key of missing) {
      console.log(`- ${key}`);
    }
  }

  if (options.dryRun) {
    console.log('Dry run complete. No CMS records were changed.');
    return;
  }

  if (!shouldWrite) {
    console.log('No CMS content changes were necessary.');
    return;
  }

  console.log('CMS content updated to use Supabase public asset URLs.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
