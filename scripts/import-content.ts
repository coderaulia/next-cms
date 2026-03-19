import { readFile } from 'node:fs/promises';
import path from 'node:path';

import '../src/services/loadLocalEnv';
import { defaultContent } from '../src/features/cms/defaultContent';
import {
  bootstrapFixtures,
  buildFixtureSeedContent,
  type BootstrapFixtureName
} from '../src/features/bootstrap/clientStarter';
import type { CmsContent } from '../src/features/cms/types';
import { replaceAllCmsContent } from '../src/features/cms/dbStore';
import { mergeWithDefaults } from '../src/features/cms/storeShared';

function parseFixtureArg() {
  const args = process.argv.slice(2);
  const fixtureIndex = args.findIndex((entry) => entry === '--fixture');
  const inlineFixture = args.find((entry) => entry.startsWith('--fixture='));

  if (inlineFixture) {
    return inlineFixture.slice('--fixture='.length);
  }

  if (fixtureIndex >= 0) {
    return args[fixtureIndex + 1];
  }

  return process.env.CMS_SEED_FIXTURE;
}

function resolveFixtureName(value: string | undefined): BootstrapFixtureName | null {
  if (!value) return null;
  if (bootstrapFixtures.includes(value as BootstrapFixtureName)) {
    return value as BootstrapFixtureName;
  }

  throw new Error(`Invalid fixture: ${value}. Allowed: ${bootstrapFixtures.join(', ')}`);
}

async function readSeedContent() {
  const fixture = resolveFixtureName(parseFixtureArg());
  if (fixture) {
    return {
      content: buildFixtureSeedContent(defaultContent, fixture),
      source: `bootstrap fixture "${fixture}"`
    };
  }

  const candidates = [
    path.join(process.cwd(), 'data', 'content.local.json'),
    path.join(process.cwd(), 'data', 'content.json')
  ];

  for (const filePath of candidates) {
    try {
      const raw = await readFile(filePath, 'utf-8');
      return {
        content: mergeWithDefaults(JSON.parse(raw) as CmsContent),
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
