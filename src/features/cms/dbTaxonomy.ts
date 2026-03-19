import { inArray } from 'drizzle-orm';

import { getDb } from '@/db/client';
import {
  categoriesTable,
  portfolioProjectTagsTable,
  portfolioTagsTable,
  postCategoriesTable
} from '@/db/schema';

import { normalizeCategoryRecord } from './collectionShared';
import { nowIso, normalizeSlug } from './storeShared';
import type { BlogPost, Category, PortfolioProject } from './types';

type PostTagShape = Pick<BlogPost, 'id' | 'tags'>;
type PortfolioTagShape = Pick<PortfolioProject, 'id' | 'tags'>;

function slugToName(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueCategorySlugs(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => normalizeSlug(tag)).filter(Boolean)));
}

function normalizePortfolioTagEntries(tags: string[]) {
  const bySlug = new Map<string, string>();

  for (const tag of tags) {
    const name = tag.trim();
    const slug = normalizeSlug(name);
    if (!name || !slug || bySlug.has(slug)) {
      continue;
    }

    bySlug.set(slug, name);
  }

  return Array.from(bySlug.entries()).map(([slug, name]) => ({ slug, name }));
}

async function readCategoriesBySlug(slugs: string[]) {
  if (slugs.length === 0) {
    return [] as Array<typeof categoriesTable.$inferSelect>;
  }

  return getDb().select().from(categoriesTable).where(inArray(categoriesTable.slug, slugs));
}

async function ensureCategoriesForPosts(posts: PostTagShape[]) {
  const requestedSlugs = Array.from(new Set(posts.flatMap((post) => uniqueCategorySlugs(post.tags))));
  if (requestedSlugs.length === 0) {
    return new Map<string, Category>();
  }

  const existingRows = await readCategoriesBySlug(requestedSlugs);
  const categoriesBySlug = new Map(
    existingRows.map((row) => [
      row.slug,
      {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      } satisfies Category
    ])
  );

  const missing = requestedSlugs
    .filter((slug) => !categoriesBySlug.has(slug))
    .map((slug) =>
      normalizeCategoryRecord({
        id: `category-${slug}`,
        name: slugToName(slug),
        slug,
        description: ''
      })
    );

  if (missing.length > 0) {
    await getDb().insert(categoriesTable).values(missing).onConflictDoNothing();
    for (const category of missing) {
      categoriesBySlug.set(category.slug, category);
    }
  }

  return categoriesBySlug;
}

export async function syncBlogPostCategoryLinks(posts: PostTagShape[]) {
  if (posts.length === 0) {
    return;
  }

  const categoriesBySlug = await ensureCategoriesForPosts(posts);
  const postIds = posts.map((post) => post.id);

  await getDb().delete(postCategoriesTable).where(inArray(postCategoriesTable.postId, postIds));

  const rows = posts.flatMap((post) =>
    uniqueCategorySlugs(post.tags)
      .map((slug) => categoriesBySlug.get(slug))
      .filter((category): category is Category => Boolean(category))
      .map((category) => ({
        postId: post.id,
        categoryId: category.id,
        createdAt: nowIso()
      }))
  );

  if (rows.length > 0) {
    await getDb().insert(postCategoriesTable).values(rows).onConflictDoNothing();
  }
}

export async function deleteBlogPostCategoryLinks(postIds: string[]) {
  if (postIds.length === 0) {
    return;
  }

  await getDb().delete(postCategoriesTable).where(inArray(postCategoriesTable.postId, postIds));
}

export async function mapBlogPostCategorySlugs(postIds: string[]) {
  const byPostId = new Map<string, string[]>();
  if (postIds.length === 0) {
    return byPostId;
  }

  const links = await getDb().select().from(postCategoriesTable).where(inArray(postCategoriesTable.postId, postIds));
  if (links.length === 0) {
    return byPostId;
  }

  const categoryIds = Array.from(new Set(links.map((row) => row.categoryId)));
  const categories = await getDb()
    .select()
    .from(categoriesTable)
    .where(inArray(categoriesTable.id, categoryIds));
  const categoriesById = new Map(categories.map((row) => [row.id, row.slug]));

  for (const link of links) {
    const slug = categoriesById.get(link.categoryId);
    if (!slug) {
      continue;
    }

    const current = byPostId.get(link.postId) ?? [];
    current.push(slug);
    byPostId.set(link.postId, current);
  }

  for (const [postId, slugs] of byPostId.entries()) {
    byPostId.set(postId, Array.from(new Set(slugs)).sort((a, b) => a.localeCompare(b)));
  }

  return byPostId;
}

async function ensurePortfolioTagsForProjects(projects: PortfolioTagShape[]) {
  const requested = Array.from(
    new Map(
      projects
        .flatMap((project) => normalizePortfolioTagEntries(project.tags))
        .map((entry) => [entry.slug, entry])
    ).values()
  );

  if (requested.length === 0) {
    return new Map<string, typeof portfolioTagsTable.$inferSelect>();
  }

  const existingRows = await getDb()
    .select()
    .from(portfolioTagsTable)
    .where(inArray(portfolioTagsTable.slug, requested.map((entry) => entry.slug)));
  const tagsBySlug = new Map(existingRows.map((row) => [row.slug, row]));
  const timestamp = nowIso();

  const missing = requested
    .filter((entry) => !tagsBySlug.has(entry.slug))
    .map((entry) => ({
      id: `portfolio-tag-${entry.slug}`,
      name: entry.name,
      slug: entry.slug,
      createdAt: timestamp,
      updatedAt: timestamp
    }));

  if (missing.length > 0) {
    await getDb().insert(portfolioTagsTable).values(missing).onConflictDoNothing();
    for (const tag of missing) {
      tagsBySlug.set(tag.slug, tag);
    }
  }

  return tagsBySlug;
}

export async function syncPortfolioProjectTagLinks(projects: PortfolioTagShape[]) {
  if (projects.length === 0) {
    return;
  }

  const tagsBySlug = await ensurePortfolioTagsForProjects(projects);
  const projectIds = projects.map((project) => project.id);

  await getDb().delete(portfolioProjectTagsTable).where(inArray(portfolioProjectTagsTable.projectId, projectIds));

  const rows = projects.flatMap((project) =>
    normalizePortfolioTagEntries(project.tags)
      .map((entry) => tagsBySlug.get(entry.slug))
      .filter((tag): tag is typeof portfolioTagsTable.$inferSelect => Boolean(tag))
      .map((tag) => ({
        projectId: project.id,
        tagId: tag.id,
        createdAt: nowIso()
      }))
  );

  if (rows.length > 0) {
    await getDb().insert(portfolioProjectTagsTable).values(rows).onConflictDoNothing();
  }
}

export async function deletePortfolioProjectTagLinks(projectIds: string[]) {
  if (projectIds.length === 0) {
    return;
  }

  await getDb().delete(portfolioProjectTagsTable).where(inArray(portfolioProjectTagsTable.projectId, projectIds));
}

export async function mapPortfolioProjectTags(projectIds: string[]) {
  const byProjectId = new Map<string, string[]>();
  if (projectIds.length === 0) {
    return byProjectId;
  }

  const links = await getDb()
    .select()
    .from(portfolioProjectTagsTable)
    .where(inArray(portfolioProjectTagsTable.projectId, projectIds));
  if (links.length === 0) {
    return byProjectId;
  }

  const tagIds = Array.from(new Set(links.map((row) => row.tagId)));
  const tags = await getDb().select().from(portfolioTagsTable).where(inArray(portfolioTagsTable.id, tagIds));
  const tagsById = new Map(tags.map((row) => [row.id, row.name]));

  for (const link of links) {
    const name = tagsById.get(link.tagId);
    if (!name) {
      continue;
    }

    const current = byProjectId.get(link.projectId) ?? [];
    current.push(name);
    byProjectId.set(link.projectId, current);
  }

  for (const [projectId, names] of byProjectId.entries()) {
    byProjectId.set(projectId, Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
  }

  return byProjectId;
}
