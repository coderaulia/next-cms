/**
 * One-shot content cleanup: fixes the site tagline typo, trims over-length
 * meta titles (>60ch) and meta descriptions (>160ch) found by
 * scripts/audit-content.ts. Run with: npx tsx scripts/fix-content-seo.ts
 */
import 'dotenv/config';

import * as contentStore from '../src/features/cms/contentStore';

const PAGE_TITLE_FIXES: Record<string, string> = {
  service: 'Digital Services: Websites, Custom Software & Mobile Apps',
  'product-hris': 'Vanaila HRIS: Performance Management for Indonesian Teams',
  'service-website-development': 'Website Development: Fast, SEO-Ready Business Websites',
  'service-custom-business-tools': 'Custom Business Tools: Workflow Automation & Internal Apps',
  'service-official-business-email': 'Business Email Setup: Secure Domain Email Infrastructure',
  partnership: 'Partnership Program: Agency & Technical Alliances'
};

const POST_TITLE_FIXES: Record<string, string> = {
  'post-8': 'Automating Repetitive Tasks: Guide for Business Owners',
  'post-6': 'AI-Powered SEO: Get Found Online Without a Marketing Team',
  'post-5': 'Why Small Businesses Need Custom Web Applications in 2026',
  'post-3': 'AI Chatbots for Small Business: 24/7 Customer Support'
};

const WORK_DESC_FIXES: Record<string, string> = {
  'd0de1716-e9e5-4b7c-9ff2-684b13496cef':
    'Multi-tenant CRM and operations analytics for growing sales teams: leads, deals, campaigns, targets, billing, and team performance in one workspace.',
  '8e031c6d-164b-4962-bfc4-f3cd74b9c948':
    'Production-grade local browser UI for Ollama, built with React 19, Hono, and SQLite — glassmorphic design, multi-project workspaces, agentic tool execution.'
};

const TAGLINE_FIX = {
  from: 'Boost Companies Growth Through Online Presents',
  to: 'Boost Company Growth Through Online Presence'
};

async function main() {
  const settings = await contentStore.getSettings();
  if (settings.general.siteTagline === TAGLINE_FIX.from) {
    settings.general.siteTagline = TAGLINE_FIX.to;
    await contentStore.updateSettings(settings);
    console.log(`tagline: "${TAGLINE_FIX.from}" -> "${TAGLINE_FIX.to}"`);
  } else {
    console.log(`tagline: skipped (current: "${settings.general.siteTagline}")`);
  }

  const pages = await contentStore.getPages();
  for (const [id, nextTitle] of Object.entries(PAGE_TITLE_FIXES)) {
    const page = pages[id];
    if (!page) {
      console.log(`page ${id}: NOT FOUND, skipped`);
      continue;
    }
    console.log(`page ${id}: "${page.seo.metaTitle}" (${page.seo.metaTitle.length}ch) -> "${nextTitle}" (${nextTitle.length}ch)`);
    page.seo.metaTitle = nextTitle;
    await contentStore.upsertPage(page);
  }

  for (const [id, nextTitle] of Object.entries(POST_TITLE_FIXES)) {
    const post = await contentStore.getBlogPostById(id);
    if (!post) {
      console.log(`post ${id}: NOT FOUND, skipped`);
      continue;
    }
    console.log(`post ${id}: "${post.seo.metaTitle}" (${post.seo.metaTitle.length}ch) -> "${nextTitle}" (${nextTitle.length}ch)`);
    post.seo.metaTitle = nextTitle;
    await contentStore.updateBlogPost(id, post);
  }

  for (const [id, nextDesc] of Object.entries(WORK_DESC_FIXES)) {
    const project = await contentStore.getPortfolioProjectById(id);
    if (!project) {
      console.log(`work ${id}: NOT FOUND, skipped`);
      continue;
    }
    console.log(`work ${project.title}: desc ${project.seo.metaDescription.length}ch -> ${nextDesc.length}ch`);
    project.seo.metaDescription = nextDesc;
    await contentStore.updatePortfolioProject(id, project);
  }

  console.log('Done. Note: ISR caches may serve old metadata until next revalidation or admin save.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
