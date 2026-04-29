import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { cmsContentRevisionsTable } from '@/db/schema';
import { env } from '@/services/env';

import { readRawCmsContent, writeRawCmsContent } from './storeAdapter';
import { nowIso } from './storeShared';
import type {
  BlogPost,
  CmsContent,
  CmsContentRevision,
  CmsContentRevisionSummary,
  CmsRevisionEntityType,
  CmsRevisionPayload,
  LandingPage,
  PortfolioProject,
  SiteSettings
} from './types';

const REVISION_DATA_DIR = path.join(process.cwd(), 'data');
const REVISION_DATA_FILE = path.join(REVISION_DATA_DIR, 'content-revisions.json');
const MAX_REVISIONS_PER_ENTITY = 20;

type CaptureContentRevisionInput = {
  entityType: CmsRevisionEntityType;
  entityId: string;
  label: string;
  payload: CmsRevisionPayload;
  summary?: string;
  userId?: string | null;
  userDisplayName?: string | null;
};

export type RestoreContentRevisionResult = {
  entityType: CmsRevisionEntityType;
  entityId: string;
  payload: CmsRevisionPayload;
};

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; cause?: unknown };
  if (typeof record.code === 'string') return record.code;
  if (record.cause) return extractErrorCode(record.cause);
  return undefined;
}

function isMissingRelationError(error: unknown) {
  return extractErrorCode(error) === '42P01';
}

function toSummary(revision: CmsContentRevision): CmsContentRevisionSummary {
  return {
    id: revision.id,
    entityType: revision.entityType,
    entityId: revision.entityId,
    label: revision.label,
    summary: revision.summary,
    createdAt: revision.createdAt,
    userId: revision.userId,
    userDisplayName: revision.userDisplayName
  };
}

function payloadSignature(payload: CmsRevisionPayload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function normalizePathLabel(slug: string) {
  const cleaned = slug.trim().replace(/^\/+/, '');
  return cleaned ? `/${cleaned}` : '/';
}

function buildRevisionSummary(entityType: CmsRevisionEntityType, payload: CmsRevisionPayload) {
  switch (entityType) {
    case 'page': {
      const page = payload as LandingPage;
      return `${page.title || page.id} • ${page.id === 'home' ? '/' : normalizePathLabel(page.seo.slug)}`;
    }
    case 'blog_post': {
      const post = payload as BlogPost;
      return `${post.title || 'Untitled post'} • /blog/${post.seo.slug}`;
    }
    case 'portfolio_project': {
      const project = payload as PortfolioProject;
      return `${project.title || 'Untitled project'} • /portfolio/${project.seo.slug}`;
    }
    case 'site_settings': {
      const settings = payload as SiteSettings;
      return `${settings.siteName || settings.general.siteName || 'Site settings'} • ${settings.general.baseUrl || 'Base URL not set'}`;
    }
    case 'full_site': {
      const content = payload as CmsContent;
      return `${Object.keys(content.pages).length} pages • ${content.blogPosts.length} posts • ${content.portfolioProjects.length} portfolio`;
    }
    default:
      return 'Content revision';
  }
}

function parseRevisionFile(raw: string): CmsContentRevision[] {
  try {
    const parsed = JSON.parse(raw) as CmsContentRevision[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function ensureRevisionFile() {
  await mkdir(REVISION_DATA_DIR, { recursive: true });
  try {
    await readFile(REVISION_DATA_FILE, 'utf-8');
  } catch {
    await writeFile(REVISION_DATA_FILE, '[]', 'utf-8');
  }
}

async function readFileRevisions() {
  await ensureRevisionFile();
  const raw = await readFile(REVISION_DATA_FILE, 'utf-8');
  return parseRevisionFile(raw);
}

async function writeFileRevisions(revisions: CmsContentRevision[]) {
  await ensureRevisionFile();
  await writeFile(REVISION_DATA_FILE, JSON.stringify(revisions, null, 2), 'utf-8');
}

function pruneRevisions(revisions: CmsContentRevision[]) {
  const counters = new Map<string, number>();
  return revisions.filter((revision) => {
    const key = `${revision.entityType}:${revision.entityId}`;
    const nextCount = (counters.get(key) ?? 0) + 1;
    counters.set(key, nextCount);
    return nextCount <= MAX_REVISIONS_PER_ENTITY;
  });
}

async function getLatestRevision(
  entityType: CmsRevisionEntityType,
  entityId: string
): Promise<CmsContentRevision | null> {
  if (env.databaseUrl) {
    try {
      const rows = await getDb()
        .select()
        .from(cmsContentRevisionsTable)
        .where(and(eq(cmsContentRevisionsTable.entityType, entityType), eq(cmsContentRevisionsTable.entityId, entityId)))
        .orderBy(desc(cmsContentRevisionsTable.createdAt))
        .limit(1);

      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        entityType: row.entityType as CmsRevisionEntityType,
        entityId: row.entityId,
        label: row.label,
        summary: row.summary,
        createdAt: row.createdAt,
        userId: row.userId ?? null,
        userDisplayName: row.userDisplayName ?? null,
        payload: row.payload
      };
    } catch (error) {
      if (isMissingRelationError(error)) {
        return null;
      }
      throw error;
    }
  }

  const revisions = await readFileRevisions();
  return revisions.find((revision) => revision.entityType === entityType && revision.entityId === entityId) ?? null;
}

export async function getContentRevision(id: string): Promise<CmsContentRevision | null> {
  if (env.databaseUrl) {
    try {
      const rows = await getDb()
        .select()
        .from(cmsContentRevisionsTable)
        .where(eq(cmsContentRevisionsTable.id, id))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        entityType: row.entityType as CmsRevisionEntityType,
        entityId: row.entityId,
        label: row.label,
        summary: row.summary,
        createdAt: row.createdAt,
        userId: row.userId ?? null,
        userDisplayName: row.userDisplayName ?? null,
        payload: row.payload
      };
    } catch (error) {
      if (isMissingRelationError(error)) {
        return null;
      }
      throw error;
    }
  }

  const revisions = await readFileRevisions();
  return revisions.find((revision) => revision.id === id) ?? null;
}

function getCurrentEntityPayload(
  content: CmsContent,
  entityType: CmsRevisionEntityType,
  entityId: string
): CmsRevisionPayload | null {
  switch (entityType) {
    case 'page':
      return content.pages[entityId as keyof typeof content.pages] ?? null;
    case 'blog_post':
      return content.blogPosts.find((post) => post.id === entityId) ?? null;
    case 'portfolio_project':
      return content.portfolioProjects.find((project) => project.id === entityId) ?? null;
    case 'site_settings':
      return content.settings;
    case 'full_site':
      return content;
    default:
      return null;
  }
}

function applyEntityPayload(
  content: CmsContent,
  entityType: CmsRevisionEntityType,
  entityId: string,
  payload: CmsRevisionPayload
): CmsContent {
  switch (entityType) {
    case 'page': {
      return {
        ...content,
        pages: {
          ...content.pages,
          [entityId]: payload as LandingPage
        }
      };
    }
    case 'blog_post': {
      const post = payload as BlogPost;
      const index = content.blogPosts.findIndex((entry) => entry.id === entityId);
      const blogPosts = [...content.blogPosts];
      if (index === -1) {
        blogPosts.unshift(post);
      } else {
        blogPosts[index] = post;
      }
      return { ...content, blogPosts };
    }
    case 'portfolio_project': {
      const project = payload as PortfolioProject;
      const index = content.portfolioProjects.findIndex((entry) => entry.id === entityId);
      const portfolioProjects = [...content.portfolioProjects];
      if (index === -1) {
        portfolioProjects.unshift(project);
      } else {
        portfolioProjects[index] = project;
      }
      return { ...content, portfolioProjects };
    }
    case 'site_settings':
      return { ...content, settings: payload as SiteSettings };
    case 'full_site':
      return payload as CmsContent;
    default:
      return content;
  }
}

export async function captureContentRevision(input: CaptureContentRevisionInput): Promise<CmsContentRevisionSummary | null> {
  const latest = await getLatestRevision(input.entityType, input.entityId);
  if (latest && payloadSignature(latest.payload) === payloadSignature(input.payload)) {
    return toSummary(latest);
  }

  const revision: CmsContentRevision = {
    id: randomUUID(),
    entityType: input.entityType,
    entityId: input.entityId,
    label: input.label,
    summary: input.summary || buildRevisionSummary(input.entityType, input.payload),
    createdAt: nowIso(),
    userId: input.userId ?? null,
    userDisplayName: input.userDisplayName ?? null,
    payload: input.payload
  };

  if (env.databaseUrl) {
    try {
      await getDb().insert(cmsContentRevisionsTable).values({
        id: revision.id,
        entityType: revision.entityType,
        entityId: revision.entityId,
        label: revision.label,
        summary: revision.summary,
        userId: revision.userId,
        userDisplayName: revision.userDisplayName,
        payload: revision.payload,
        createdAt: revision.createdAt
      });
      return toSummary(revision);
    } catch (error) {
      if (isMissingRelationError(error)) {
        return null;
      }
      throw error;
    }
  }

  const next = pruneRevisions([revision, ...(await readFileRevisions())]);
  await writeFileRevisions(next);
  return toSummary(revision);
}

export async function listContentRevisions(
  entityType: CmsRevisionEntityType,
  entityId: string,
  limit = 12
): Promise<CmsContentRevisionSummary[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  if (env.databaseUrl) {
    try {
      const rows = await getDb()
        .select()
        .from(cmsContentRevisionsTable)
        .where(and(eq(cmsContentRevisionsTable.entityType, entityType), eq(cmsContentRevisionsTable.entityId, entityId)))
        .orderBy(desc(cmsContentRevisionsTable.createdAt))
        .limit(safeLimit);

      return rows.map((row) => ({
        id: row.id,
        entityType: row.entityType as CmsRevisionEntityType,
        entityId: row.entityId,
        label: row.label,
        summary: row.summary,
        createdAt: row.createdAt,
        userId: row.userId ?? null,
        userDisplayName: row.userDisplayName ?? null
      }));
    } catch (error) {
      if (isMissingRelationError(error)) {
        return [];
      }
      throw error;
    }
  }

  const revisions = await readFileRevisions();
  return revisions
    .filter((revision) => revision.entityType === entityType && revision.entityId === entityId)
    .slice(0, safeLimit)
    .map(toSummary);
}

export async function restoreContentRevision(
  id: string,
  options?: { userId?: string | null; userDisplayName?: string | null }
): Promise<RestoreContentRevisionResult | null> {
  const revision = await getContentRevision(id);
  if (!revision) return null;

  const content = await readRawCmsContent();
  const current = getCurrentEntityPayload(content, revision.entityType, revision.entityId);

  if (current) {
    await captureContentRevision({
      entityType: revision.entityType,
      entityId: revision.entityId,
      label: 'Backup before restore',
      payload: current,
      userId: options?.userId ?? null,
      userDisplayName: options?.userDisplayName ?? null
    });
  }

  const nextContent = applyEntityPayload(content, revision.entityType, revision.entityId, revision.payload);
  await writeRawCmsContent(nextContent);

  await captureContentRevision({
    entityType: revision.entityType,
    entityId: revision.entityId,
    label: `Restored from ${new Date(revision.createdAt).toLocaleString()}`,
    payload: revision.payload,
    userId: options?.userId ?? null,
    userDisplayName: options?.userDisplayName ?? null
  });

  return {
    entityType: revision.entityType,
    entityId: revision.entityId,
    payload: revision.payload
  };
}
