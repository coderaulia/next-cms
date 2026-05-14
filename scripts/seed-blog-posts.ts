/**
 * Seed blog posts from data/content.json into the Supabase database.
 * Only inserts posts that don't already exist (matched by slug).
 *
 * Usage:
 *   npx tsx scripts/seed-blog-posts.ts
 *   npx tsx scripts/seed-blog-posts.ts --dry-run    # preview without inserting
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import '../src/services/loadLocalEnv';

import { getDb } from '../src/db/client';
import { blogPostsTable } from '../src/db/schema';
import type { BlogPost, CmsContent } from '../src/features/cms/types';

function postToRow(post: BlogPost) {
  return {
    id: post.id,
    title: post.title,
    slug: post.seo.slug,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    tags: post.tags,
    coverImage: post.coverImage,
    status: post.status,
    publishedAt: post.publishedAt,
    scheduledPublishAt: post.scheduledPublishAt ?? null,
    scheduledUnpublishAt: post.scheduledUnpublishAt ?? null,
    updatedAt: post.updatedAt,
    seo: post.seo,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  // Read blog posts from content.json
  const filePath = path.join(process.cwd(), 'data', 'content.json');
  const raw = await readFile(filePath, 'utf-8');
  const content = JSON.parse(raw) as CmsContent;
  const posts = content.blogPosts.filter((p) => p.status === 'published');

  if (posts.length === 0) {
    console.log('No published blog posts found in content.json.');
    return;
  }

  console.log(`Found ${posts.length} published blog posts in content.json.`);

  // Check which slugs already exist in the database
  const db = getDb();
  const existingRows = await db
    .select({ slug: blogPostsTable.slug })
    .from(blogPostsTable);
  const existingSlugs = new Set(existingRows.map((r) => r.slug));

  const newPosts = posts.filter((p) => !existingSlugs.has(p.seo.slug));

  if (newPosts.length === 0) {
    console.log('All posts already exist in the database. Nothing to insert.');
    return;
  }

  console.log(`${newPosts.length} new post(s) to insert:\n`);
  for (const post of newPosts) {
    console.log(`  • ${post.publishedAt?.slice(0, 10)} — ${post.title}`);
  }

  if (dryRun) {
    console.log('\n[dry-run] No changes made.');
    return;
  }

  // Insert new posts
  const rows = newPosts.map(postToRow);
  await db.insert(blogPostsTable).values(rows);

  console.log(`\n✓ Inserted ${newPosts.length} blog post(s) into the database.`);
}

main().catch((error) => {
  console.error('Error seeding blog posts:', error);
  process.exit(1);
});
