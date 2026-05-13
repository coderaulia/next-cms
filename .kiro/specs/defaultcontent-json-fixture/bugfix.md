# Bugfix Requirements Document

## Introduction

`defaultContent.ts` is a 64 KB TypeScript file that contains all hardcoded site-specific content
(pages, blog posts, portfolio projects, categories, media assets, and site settings). It is the
canonical bootstrap source for the CMS when no database or `data/content.json` exists.

The file causes four concrete problems:

1. The entire 64 KB object is bundled into the server build and evaluated at module load time,
   inflating the server bundle unnecessarily.
2. `structuredClone()` is called on the exported object on every file-mode read (in
   `fileStore.ts`, `storeShared.ts`, and `dbStore.ts`), wasting CPU and memory on every request.
3. Content changes (copy, branding, pricing) require a full code deployment instead of a data
   edit.
4. Business data is masquerading as code, violating the separation of concerns between
   configuration/data and application logic.

The fix is to extract the content data into a JSON fixture file
(`data/default-content.fixture.json`) that is loaded lazily at runtime, while keeping the
TypeScript type-safety and bootstrap logic intact.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the server process starts THEN the system evaluates the entire 64 KB
`defaultContent.ts` module and holds its object graph in memory for the lifetime of the process,
even when `data/content.json` already exists and bootstrapping is never needed.

1.2 WHEN `fileStore.readContent()` is called and the in-process cache is cold or stale THEN the
system calls `structuredClone(defaultContent)` to produce the fallback value, cloning the full
64 KB object on every such request.

1.3 WHEN `storeShared.mergeWithDefaults()` is called THEN the system calls
`structuredClone(defaultContent.pages)` and `structuredClone(defaultContent.blogPosts)` (etc.)
unconditionally, even when the caller already has valid data for those fields.

1.4 WHEN `dbStore.getPages()` is called THEN the system calls
`structuredClone(defaultContent.pages)` to build the base page map, cloning the full pages
object on every invocation.

1.5 WHEN a developer needs to change site copy, branding text, or pricing content THEN the
system requires a code change and a full production deployment to apply the update.

1.6 WHEN the Next.js server bundle is built THEN the system includes the full 64 KB content
object in the server bundle, increasing bundle size and cold-start evaluation time.

### Expected Behavior (Correct)

2.1 WHEN the server process starts THEN the system SHALL NOT load or evaluate the default
content data until it is actually needed for bootstrapping.

2.2 WHEN `fileStore.readContent()` is called and `data/content.json` already exists and is
valid THEN the system SHALL NOT clone or reference the default content object at all.

2.3 WHEN `storeShared.mergeWithDefaults()` is called THEN the system SHALL load the default
content fixture lazily (at most once per process) and SHALL NOT perform unnecessary clones of
the full object graph.

2.4 WHEN `dbStore.getPages()` is called THEN the system SHALL obtain the default page map from
the lazily-loaded fixture rather than from a statically-bundled module-level object.

2.5 WHEN a developer needs to change site copy, branding text, or pricing content THEN the
system SHALL allow the change to be made by editing `data/default-content.fixture.json` without
requiring a code change or redeployment.

2.6 WHEN the Next.js server bundle is built THEN the system SHALL NOT include the 64 KB content
data in the bundle; the fixture file SHALL be read from disk at runtime.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `data/content.json` does not exist THEN the system SHALL CONTINUE TO bootstrap it from
the default content fixture, producing an identical result to the current behavior.

3.2 WHEN `data/content.json` exists but is missing one or more page keys THEN the system SHALL
CONTINUE TO merge the missing pages from the default content fixture into the file.

3.3 WHEN `data/content.json` exists but is unparseable JSON THEN the system SHALL CONTINUE TO
overwrite it with the full default content and return a valid `CmsContent` object.

3.4 WHEN the database is empty on first boot THEN the system SHALL CONTINUE TO seed all tables
(settings, pages, blog posts, portfolio projects, categories, media assets) from the default
content fixture.

3.5 WHEN `storeShared.normalizeSettings()` is called with a partial settings object THEN the
system SHALL CONTINUE TO fill missing fields from the default settings, producing a fully
populated `SiteSettings` object.

3.6 WHEN `storeShared.mergeWithDefaults()` is called with a `CmsContent` object that has
missing or non-array fields THEN the system SHALL CONTINUE TO substitute the corresponding
default arrays/objects from the fixture.

3.7 WHEN `dbStore.getSettings()` is called and the settings row is absent THEN the system SHALL
CONTINUE TO fall back to the default settings values.

3.8 WHEN the `scripts/bootstrap-client.ts` or `scripts/import-content.ts` scripts are run THEN
the system SHALL CONTINUE TO use the default content as the base fixture for bootstrapping a
new client environment.

3.9 WHEN any existing Vitest test that imports `defaultContent` directly is run THEN the system
SHALL CONTINUE TO pass, either by re-exporting the loaded fixture through the same module path
or by updating the test imports to use the new loader.
