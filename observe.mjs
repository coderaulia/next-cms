import { mergeWithDefaults, normalizeSettings } from './src/features/cms/storeShared.ts';
import { defaultContent } from './src/features/cms/defaultContent.ts';

// Observation 1: mergeWithDefaults with empty CmsContent
const emptyContent = {
  settings: {},
  pages: {},
  blogPosts: [],
  portfolioProjects: [],
  categories: [],
  mediaAssets: []
};
const merged = mergeWithDefaults(emptyContent);
console.log('=== Observation 1: mergeWithDefaults with empty content ===');
console.log('Pages keys:', Object.keys(merged.pages));
console.log('BlogPosts length:', merged.blogPosts.length);
console.log('PortfolioProjects length:', merged.portfolioProjects.length);
console.log('Categories length:', merged.categories.length);
console.log('MediaAssets length:', merged.mediaAssets.length);

// Observation 2: normalizeSettings with empty object
const normalized = normalizeSettings({});
console.log('\n=== Observation 2: normalizeSettings with empty object ===');
console.log('Has general:', !!normalized.general);
console.log('Has navigation:', !!normalized.navigation);
console.log('Has contact:', !!normalized.contact);
console.log('Has social:', !!normalized.social);
console.log('Has branding:', !!normalized.branding);
console.log('Has writing:', !!normalized.writing);
console.log('Has reading:', !!normalized.reading);
console.log('Has discussion:', !!normalized.discussion);
console.log('Has media:', !!normalized.media);
console.log('Has permalinks:', !!normalized.permalinks);
console.log('Has seo:', !!normalized.seo);
console.log('Has sitemap:', !!normalized.sitemap);
console.log('siteName:', normalized.general.siteName);

// Observation 3: defaultContent.pages keys
console.log('\n=== Observation 3: defaultContent.pages keys ===');
console.log('Page keys:', Object.keys(defaultContent.pages));

// Observation 4: defaultContent.blogPosts length
console.log('\n=== Observation 4: defaultContent.blogPosts length ===');
console.log('BlogPosts count:', defaultContent.blogPosts.length);
