import { readFile } from 'node:fs/promises';
import path from 'node:path';

import '../src/services/loadLocalEnv';
import type { CmsContent } from '../src/features/cms/types';
import { replaceAllCmsContent } from '../src/features/cms/dbStore';

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'content.json');
  const raw = await readFile(filePath, 'utf-8');
  const content = JSON.parse(raw) as CmsContent;

  await replaceAllCmsContent(content);

  console.log(
    `Imported ${Object.keys(content.pages).length} pages, ${content.blogPosts.length} posts, ${
      content.portfolioProjects?.length ?? 0
    } portfolio projects, ${content.categories?.length ?? 0} categories, and ${
      content.mediaAssets?.length ?? 0
    } media assets into database.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
