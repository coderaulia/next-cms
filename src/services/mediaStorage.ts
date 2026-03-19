import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/services/env';

type StoredMedia = {
  storageProvider: 'local' | 'supabase';
  storageKey: string;
  url: string;
  sizeBytes: number;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_SAFE_FILE_NAME_LENGTH = 64;

const ALLOWED_MIME_PREFIXES = ['image/', 'video/'];
const FALLBACK_EXTENSION = '.png';
let supabaseStorageClient: ReturnType<typeof createClient> | null = null;

function sanitizeFilename(value: string) {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, MAX_SAFE_FILE_NAME_LENGTH) || 'media-asset';

  return safe || randomUUID();
}

function getExtFromMimeType(mimeType: string, fallbackName: string) {
  const fromName = extname(fallbackName || '').toLowerCase();
  if (fromName.length > 1) {
    return fromName;
  }

  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/heic': '.heic',
    'video/mp4': '.mp4',
    'video/webm': '.webm'
  };

  return map[mimeType] ?? FALLBACK_EXTENSION;
}

function isAllowedFile(file: File) {
  const mimeType = (file.type || '').toLowerCase();
  if (!mimeType) return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

function normalizeStorageKey(value: string) {
  const safe = value.replace(/^\/+/, '');
  if (!safe) return '';
  return safe
    .split('/')
    .map((segment) => sanitizeFilename(segment))
    .join('/');
}

function safeJoin(root: string, storageKey: string) {
  const normalized = normalize(storageKey).replace(/^\.{2}[\\/]+/, '');
  const next = resolve(root, normalized);
  const relativePath = relative(root, next);

  if (!relativePath || relativePath.startsWith('..') || relativePath.includes('..')) {
    throw new Error('Invalid storage key');
  }

  return next;
}

function publicUrlPrefix() {
  const configured = env.mediaPublicBaseUrl.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return env.siteUrl.replace(/\/+$/, '');
}

function isSupabaseStorageEnabled() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey && env.supabaseStorageBucket);
}

function getSupabaseStorageClient() {
  if (!isSupabaseStorageEnabled()) {
    throw new Error('Supabase media storage is not configured.');
  }

  if (!supabaseStorageClient) {
    supabaseStorageClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseStorageClient;
}

function generateStorageKey(file: File) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const base = sanitizeFilename(file.name || randomUUID());
  const extension = getExtFromMimeType(file.type || '', file.name || '');
  const id = randomUUID();
  const filename = `${base}-${id.slice(0, 6)}${extension}`;
  return `media/${year}/${month}/${filename}`;
}

export async function saveUploadedMedia(file: File) {
  if (!file || file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Invalid file size');
  }

  if (!isAllowedFile(file)) {
    throw new Error('Unsupported file type');
  }

  const storageKey = normalizeStorageKey(generateStorageKey(file));
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isSupabaseStorageEnabled()) {
    const client = getSupabaseStorageClient();
    const bucket = env.supabaseStorageBucket;
    const { error } = await client.storage.from(bucket).upload(storageKey, buffer, {
      cacheControl: '31536000',
      contentType: file.type || undefined,
      upsert: false
    });

    if (error) {
      throw new Error(error.message);
    }

    const {
      data: { publicUrl }
    } = client.storage.from(bucket).getPublicUrl(storageKey);

    return {
      storageProvider: 'supabase',
      storageKey,
      url: publicUrl,
      sizeBytes: buffer.length
    } as StoredMedia;
  }

  const publicRoot = join(process.cwd(), 'public');
  const fullPath = safeJoin(publicRoot, storageKey);

  const directory = dirname(fullPath);
  await mkdir(directory, { recursive: true });

  await writeFile(fullPath, buffer);

  return {
    storageProvider: 'local',
    storageKey,
    url: `${publicUrlPrefix()}/${storageKey}`,
    sizeBytes: buffer.length
  } as StoredMedia;
}

export async function deleteUploadedMedia(storageKey: string, storageProvider: string) {
  if (!storageKey) return;

  const normalized = normalizeStorageKey(storageKey);

  if (storageProvider === 'supabase') {
    if (!isSupabaseStorageEnabled()) {
      return;
    }

    const client = getSupabaseStorageClient();
    const { error } = await client.storage.from(env.supabaseStorageBucket).remove([normalized]);
    if (error && !isSupabaseNotFound(error.message)) {
      throw new Error(error.message);
    }
    return;
  }

  const publicRoot = join(process.cwd(), 'public');
  const fullPath = safeJoin(publicRoot, normalized);

  try {
    await readFile(fullPath);
    await unlink(fullPath);
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

function isNotFoundError(error: unknown) {
  return typeof error === 'object' && error !== null && (error as NodeJS.ErrnoException).code === 'ENOENT';
}

function isSupabaseNotFound(message: string) {
  return /not found/i.test(message);
}
