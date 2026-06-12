/**
 * Read-only content audit: health report + SEO/copy metrics for every
 * published page, post, and project. Run with: npx tsx scripts/audit-content.ts
 */
import 'dotenv/config';

import { getContentHealthReport } from '../src/features/cms/contentHealth';
import * as contentStore from '../src/features/cms/contentStore';

const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function seoRow(kind: string, title: string, slug: string, metaTitle: string, metaDescription: string) {
  const flags: string[] = [];
  if (!metaTitle.trim()) flags.push('NO META TITLE');
  else if (metaTitle.length > TITLE_MAX) flags.push(`title ${metaTitle.length}ch (>${TITLE_MAX})`);
  if (!metaDescription.trim()) flags.push('NO META DESC');
  else if (metaDescription.length < DESC_MIN) flags.push(`desc ${metaDescription.length}ch (<${DESC_MIN})`);
  else if (metaDescription.length > DESC_MAX) flags.push(`desc ${metaDescription.length}ch (>${DESC_MAX})`);
  return `${kind} | ${title} | /${slug} | ${flags.length ? flags.join('; ') : 'ok'}`;
}

async function main() {
  const report = await getContentHealthReport();
  console.log(`=== CONTENT HEALTH: ${report.errors} errors, ${report.warnings} warnings ===`);
  for (const item of report.items) {
    console.log(`[${item.severity}] (${item.category}) ${item.label} — ${item.detail}`);
  }

  const [pagesMap, posts, projects, settings] = await Promise.all([
    contentStore.getPages(),
    contentStore.getBlogPosts(true),
    contentStore.getPortfolioProjects(true),
    contentStore.getSettings()
  ]);

  console.log('\n=== SEO FIELD AUDIT ===');
  for (const page of Object.values(pagesMap)) {
    console.log(seoRow(`page(${page.status ?? '?'})`, page.title, page.seo.slug || page.id, page.seo.metaTitle, page.seo.metaDescription));
  }
  for (const post of posts) {
    console.log(seoRow(`post(${post.status})`, post.title, `blog/${post.seo.slug}`, post.seo.metaTitle, post.seo.metaDescription));
  }
  for (const project of projects) {
    console.log(seoRow(`work(${project.status})`, project.title, `portfolio/${project.seo.slug}`, project.seo.metaTitle, project.seo.metaDescription));
  }

  console.log('\n=== BLOG INVENTORY ===');
  for (const post of posts) {
    const words = post.content ? post.content.split(/\s+/).length : 0;
    console.log(`${post.status} | ${post.title} | ${words} words | tags: ${(post.tags ?? []).join(',') || '-'} | published: ${post.publishedAt || '-'}`);
  }

  console.log('\n=== HOME BLOCKS ===');
  const home = pagesMap['home'];
  for (const block of home?.homeBlocks ?? []) {
    console.log(`${block.enabled ? 'on ' : 'OFF'} | ${block.type} | ${JSON.stringify(block).slice(0, 300)}`);
  }

  console.log('\n=== SETTINGS SEO ===');
  console.log(`defaultMetaDescription: "${settings.seo.defaultMetaDescription}"`);
  console.log(`defaultOgImage: "${settings.defaultOgImage}"`);
  console.log(`siteTagline: "${settings.general.siteTagline}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
