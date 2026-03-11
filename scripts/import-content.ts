import { readFile } from 'node:fs/promises';
import path from 'node:path';

import '../src/services/loadLocalEnv';
import { defaultContent } from '../src/features/cms/defaultContent';
import type { CmsContent } from '../src/features/cms/types';
import { replaceAllCmsContent } from '../src/features/cms/dbStore';

async function readSeedContent() {
  const candidates = [
    path.join(process.cwd(), 'data', 'content.local.json'),
    path.join(process.cwd(), 'data', 'content.json')
  ];

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, 'utf-8');
      return {
        content: JSON.parse(raw) as CmsContent,
        source: path.relative(process.cwd(), filePath)
      };
    } catch {
      // ignore missing local seed files and fall back to sanitized defaults
    }
  }

  return {
    content: defaultContent,
    source: 'src/features/cms/defaultContent.ts'
  };
}

async function main() {
  const { content, source } = await readSeedContent();

  await replaceAllCmsContent(content);

  console.log(
    `Imported ${Object.keys(content.pages).length} pages, ${content.blogPosts.length} posts, ${
      content.portfolioProjects?.length ?? 0
    } portfolio projects, ${content.categories?.length ?? 0} categories, and ${
      content.mediaAssets?.length ?? 0
    } media assets into database from ${source}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
