# defaultContent JSON Fixture Bugfix Design

## Overview

`defaultContent.ts` is a 64 KB TypeScript module that exports a fully-constructed `CmsContent`
object. It is imported by 11 files across the CMS feature layer, scripts, and tests. Because it
is a static ES module, the entire object graph is bundled into the server build and held in
memory from process start, regardless of whether bootstrapping is ever needed.

The fix extracts the content data into `data/default-content.fixture.json` and replaces the
static module export with a lazy loader (`getDefaultContent()`) that reads and parses the JSON
file once per process, caching the result. The TypeScript types and all bootstrap/merge logic
remain unchanged; only the data source moves from compiled code to a runtime file.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the server process imports
  `defaultContent.ts`, causing the 64 KB object to be bundled and evaluated at module load time.
- **Property (P)**: The desired behavior — default content data is loaded lazily from a JSON
  fixture file, not bundled into the server build.
- **Preservation**: All existing bootstrap, merge, fallback, and seeding behaviors that must
  remain functionally identical after the fix.
- **`defaultContent`**: The named export from `src/features/cms/defaultContent.ts` — a
  `CmsContent` object containing all seed data.
- **`getDefaultContent()`**: The new lazy-loader function that replaces the static export,
  reading `data/default-content.fixture.json` at most once per process.
- **`data/default-content.fixture.json`**: The new runtime JSON file containing the seed data
  previously embedded in `defaultContent.ts`.
- **`mergeWithDefaults()`**: Function in `storeShared.ts` that fills missing fields in a
  `CmsContent` object using the default content as a template.
- **`normalizeSettings()`**: Function in `storeShared.ts` that fills missing fields in a
  `SiteSettings` object using the default settings as a template.
- **`ensureDataFile()`**: Function in `fileStore.ts` that creates `data/content.json` from
  default content if it does not exist.
- **`ensureDbBootstrap()`**: Function in `dbStore.ts` that seeds all database tables from
  default content on first boot.

## Bug Details

### Bug Condition

The bug manifests whenever the Node.js module system resolves `defaultContent.ts`. Because the
file is a static ES module with a top-level `export const defaultContent = { ... }`, the entire
64 KB object is constructed and retained in memory from the moment any importing module is
loaded — even if bootstrapping is never triggered during that request.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ServerRequest (any HTTP request or build step)
  OUTPUT: boolean

  // The bug condition is met whenever the server bundle includes defaultContent.ts
  // as a statically-evaluated module, regardless of whether bootstrap is needed.
  RETURN defaultContent_module_is_statically_imported
         AND content_json_already_exists(input.dataDir)
         AND bootstrap_not_needed(input)
END FUNCTION
```

The secondary bug condition (structuredClone on every cold read) is:
```
FUNCTION isCloneBugCondition(input)
  INPUT: input of type ReadContentCall
  OUTPUT: boolean

  RETURN cache_is_cold_or_stale(input)
         AND content_json_exists_and_valid(input.dataDir)
         AND structuredClone_called_on_defaultContent(input)
END FUNCTION
```

### Examples

- **Bundle inflation**: `npm run build` produces a server bundle that includes the full 64 KB
  content object. Expected: the bundle contains only the loader function; the JSON is read at
  runtime.
- **Unnecessary clone on read**: A cold `readContent()` call on a server with a valid
  `data/content.json` calls `structuredClone(defaultContent)` as a fallback path even though
  the file parse succeeds. Expected: no clone of default content occurs.
- **Deployment required for copy change**: Updating the hero headline in `defaultContent.ts`
  requires `git commit` + `npm run build` + deploy. Expected: edit
  `data/default-content.fixture.json` and restart (or hot-reload) the server.
- **Edge case — fixture missing**: If `data/default-content.fixture.json` is deleted, the
  loader should throw a clear error rather than silently returning empty content.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `ensureDataFile()` must still create `data/content.json` from default content when it does
  not exist.
- `mergeWithDefaults()` must still fill missing pages, posts, portfolio projects, categories,
  and media assets from the default content.
- `normalizeSettings()` must still fill missing settings fields from the default settings.
- `ensureDbBootstrap()` must still seed all database tables from default content on first boot.
- `dbStore.getSettings()` must still fall back to default settings when the DB row is absent.
- `dbStore.getPages()` must still merge default pages as the base map.
- `scripts/bootstrap-client.ts` and `scripts/import-content.ts` must still work.
- All existing Vitest tests that reference `defaultContent` must still pass.

**Scope:**
All code paths that do NOT trigger bootstrapping (i.e., `data/content.json` exists and is
valid, or the database is already seeded) should be completely unaffected by this fix in terms
of observable behavior. The only changes are:

- The default content is no longer in the server bundle.
- The default content object is constructed lazily (first access) rather than at module load.
- `structuredClone` calls on the default content object are eliminated or deferred.

## Hypothesized Root Cause

1. **Static module export**: `defaultContent.ts` uses `export const defaultContent = { ... }`
   at the top level. ES module semantics guarantee this runs at import time, so every file that
   imports it pays the construction cost unconditionally.

2. **No lazy loading**: There is no guard like `let _cache: CmsContent | null = null` around
   the default content. Every import site gets the full object immediately.

3. **`structuredClone` on fallback paths**: `fileStore.readContent()` and
   `storeShared.mergeWithDefaults()` call `structuredClone(defaultContent.X)` to avoid
   mutating the shared default. Once the default content is lazy-loaded and the result is
   treated as immutable (or cloned only when actually needed), this cost disappears on the
   happy path.

4. **Data embedded in TypeScript**: The content is expressed as TypeScript constructor calls
   (`section(...)`, `page(...)`, `seo(...)`) rather than plain JSON. This means the data cannot
   be edited without a TypeScript toolchain and cannot be loaded without evaluating the module.

## Correctness Properties

Property 1: Bug Condition — Default Content Is Not Bundled or Eagerly Evaluated

_For any_ server process start or build step where `data/content.json` already exists and is
valid (isBugCondition returns true), the fixed system SHALL NOT include the 64 KB content data
in the server bundle, and SHALL NOT evaluate or allocate the default content object until
`getDefaultContent()` is explicitly called by a bootstrap or merge code path.

**Validates: Requirements 2.1, 2.2, 2.6**

Property 2: Preservation — All Bootstrap and Merge Behaviors Are Unchanged

_For any_ input where the bug condition does NOT hold (i.e., bootstrapping or merging IS
needed), the fixed `getDefaultContent()` loader SHALL return a `CmsContent` object that is
deeply equal to the object previously exported by `defaultContent.ts`, preserving all existing
bootstrap, merge, fallback, and seeding behaviors without regression.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

## Fix Implementation

### Changes Required

**Step 1 — Generate the fixture file**

Run the existing `defaultContent.ts` module once (via a small Node script or by serializing
the current export) to produce `data/default-content.fixture.json`. This file becomes the
canonical data source and is committed to the repository (unlike `data/content.json` which is
gitignored).

**File**: `data/default-content.fixture.json` (new file, committed)

**Content**: The JSON serialization of the current `defaultContent` export, with
`nowIso()`-generated timestamps replaced by a fixed placeholder (e.g.,
`"2024-01-01T00:00:00.000Z"`) so the file is deterministic.

---

**Step 2 — Replace the static export with a lazy loader**

**File**: `src/features/cms/defaultContent.ts`

**Function**: module-level export → `getDefaultContent()` lazy loader

**Specific Changes**:

1. **Remove all content-construction helpers and data**: Delete the `section()`, `seo()`,
   `page()` helpers and all the inline content objects. The file shrinks from 64 KB to ~30
   lines.

2. **Add a lazy loader**:
   ```typescript
   import { readFileSync } from 'node:fs';
   import path from 'node:path';
   import type { CmsContent } from './types';

   let _cache: CmsContent | null = null;

   export function getDefaultContent(): CmsContent {
     if (_cache) return _cache;
     const fixturePath = path.join(process.cwd(), 'data', 'default-content.fixture.json');
     const raw = readFileSync(fixturePath, 'utf-8');
     _cache = JSON.parse(raw) as CmsContent;
     return _cache;
   }

   // Back-compat named export for callers that destructure { defaultContent }
   export const defaultContent: CmsContent = new Proxy({} as CmsContent, {
     get(_target, prop) {
       return getDefaultContent()[prop as keyof CmsContent];
     }
   });
   ```
   The `Proxy`-based back-compat export means all 11 existing import sites continue to work
   without changes during the migration. Property accesses on `defaultContent.X` trigger the
   lazy load transparently.

   > **Alternative (simpler, requires updating all callers)**: Export only
   > `getDefaultContent()` and update all 11 import sites to call it. This is cleaner but
   > requires more changes. The Proxy approach is a safe intermediate step.

3. **Remove `nowIso` import**: The helper is no longer needed in this file.

---

**Step 3 — Update `storeShared.ts`**

**File**: `src/features/cms/storeShared.ts`

**Specific Changes**:

1. Replace `import { defaultContent } from './defaultContent'` with
   `import { getDefaultContent } from './defaultContent'`.
2. In `normalizeSettings()`, replace `structuredClone(defaultContent.settings)` with
   `structuredClone(getDefaultContent().settings)`. The clone is still needed here because
   `normalizeSettings` mutates `defaults`.
3. In `mergeWithDefaults()`, replace all `structuredClone(defaultContent.X)` calls with
   `structuredClone(getDefaultContent().X)`. The lazy load means these clones only happen when
   bootstrapping is actually needed.

---

**Step 4 — Update `fileStore.ts`**

**File**: `src/features/cms/fileStore.ts`

**Specific Changes**:

1. Replace `import { defaultContent } from './defaultContent'` with
   `import { getDefaultContent } from './defaultContent'`.
2. In `ensureDataFile()`, replace `JSON.stringify(defaultContent, ...)` with
   `JSON.stringify(getDefaultContent(), ...)`.
3. In `readContent()`, replace `structuredClone(defaultContent)` with
   `structuredClone(getDefaultContent())` and `JSON.stringify(defaultContent, ...)` with
   `JSON.stringify(getDefaultContent(), ...)`.
4. In `readContent()`, replace `Object.keys(defaultContent.pages)` with
   `Object.keys(getDefaultContent().pages)`.

---

**Step 5 — Update `dbStore.ts`**

**File**: `src/features/cms/dbStore.ts`

**Specific Changes**:

1. Replace `import { defaultContent } from './defaultContent'` with
   `import { getDefaultContent } from './defaultContent'`.
2. In `ensureDbBootstrap()`, replace all `defaultContent.X` references with
   `getDefaultContent().X`.
3. In `getSettings()`, replace `defaultContent.settings` fallback with
   `getDefaultContent().settings`.
4. In `getPages()`, replace `structuredClone(defaultContent.pages)` with
   `structuredClone(getDefaultContent().pages)`.

---

**Step 6 — Update remaining feature files**

Apply the same import swap (`defaultContent` → `getDefaultContent()`) to:
- `src/features/cms/dbCollectionsStore.ts`
- `src/features/cms/fileCollectionsStore.ts`
- `src/features/cms/importExport.ts`

---

**Step 7 — Update scripts**

Apply the same import swap to:
- `scripts/bootstrap-client.ts`
- `scripts/import-content.ts`

---

**Step 8 — Update tests**

Apply the same import swap (or use the Proxy back-compat export) to:
- `src/tests/clientStarter.test.ts`
- `src/tests/seo.test.ts`
- `src/tests/contentStore.test.ts`
- `src/tests/importExport.test.ts`

Tests that compare against `defaultContent.X` should instead call `getDefaultContent().X`.

---

**Step 9 — Gitignore / fixture placement**

Ensure `data/default-content.fixture.json` is NOT in `.gitignore` (it should be committed).
Confirm `data/content.json` remains gitignored (it is the live runtime store).

## Testing Strategy

### Validation Approach

The testing strategy follows the four-phase exploratory bugfix workflow:

1. **Explore** — Write a test that asserts the bug condition (bundle/eager-load) exists on
   unfixed code. Run it on unfixed code; expect failure (confirms bug).
2. **Preserve** — Write property-based tests that assert all bootstrap/merge behaviors produce
   identical results. Run on unfixed code; expect pass (establishes baseline).
3. **Implement** — Apply the fix.
4. **Validate** — Re-run both test suites; both should pass.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the eager-load bug BEFORE implementing the
fix. Confirm the root cause analysis.

**Test Plan**: Write a test that imports `defaultContent.ts` and asserts that the module does
NOT eagerly allocate the content object when `data/content.json` already exists. On unfixed
code this test will fail because the module always allocates the object.

**Test Cases**:
1. **Bundle size test**: Assert that the compiled server bundle does NOT contain the string
   `"Example Studio"` (a unique string from the default content). Will fail on unfixed code.
2. **Lazy-load test**: Import the module, then assert that `_cache` (or equivalent) is `null`
   before any bootstrap call. Will fail on unfixed code because the object is constructed at
   import time.
3. **No-clone-on-valid-read test**: Call `readContent()` with a valid `data/content.json` in
   place and assert that `structuredClone` was NOT called with the default content object. Will
   fail on unfixed code.

**Expected Counterexamples**:
- The default content object is allocated immediately on module import.
- `structuredClone(defaultContent)` is called even when `data/content.json` is valid.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed system produces
the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := loadModule('defaultContent')
  ASSERT result._cache IS null  // not eagerly allocated
  ASSERT serverBundle DOES NOT CONTAIN defaultContentData
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (bootstrapping IS
needed), the fixed `getDefaultContent()` returns a value deeply equal to the old
`defaultContent` export.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  old_result := defaultContent_original  // from unfixed code
  new_result := getDefaultContent()      // from fixed code
  ASSERT deepEqual(old_result, new_result)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain.
- It catches edge cases in `mergeWithDefaults` and `normalizeSettings` that manual tests miss.
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs.

**Test Plan**: Observe behavior of `mergeWithDefaults`, `normalizeSettings`, and
`ensureDataFile` on unfixed code, then write property-based tests capturing those behaviors.

**Test Cases**:
1. **Settings normalization preservation**: For any partial settings object, assert that
   `normalizeSettings(partial)` returns the same result before and after the fix.
2. **mergeWithDefaults preservation**: For any `CmsContent` with missing fields, assert that
   `mergeWithDefaults(partial)` fills them identically before and after the fix.
3. **Bootstrap file creation preservation**: Assert that `ensureDataFile()` creates
   `data/content.json` with content deeply equal to `getDefaultContent()`.
4. **DB bootstrap preservation**: Assert that `ensureDbBootstrap()` inserts rows matching
   `getDefaultContent()` fields.

### Unit Tests

- Test that `getDefaultContent()` returns a valid `CmsContent` object (all required keys
  present, correct types).
- Test that `getDefaultContent()` returns the same object reference on repeated calls (cache
  works).
- Test that `getDefaultContent()` throws a clear error when the fixture file is missing.
- Test that the `defaultContent` Proxy back-compat export delegates to `getDefaultContent()`.

### Property-Based Tests

- Generate random partial `SiteSettings` objects and verify `normalizeSettings` output is
  identical before and after the fix.
- Generate random partial `CmsContent` objects and verify `mergeWithDefaults` output is
  identical before and after the fix.
- Generate random page maps with missing keys and verify `fileStore.readContent` fills them
  from the fixture identically.

### Integration Tests

- Full bootstrap flow: delete `data/content.json`, call `readContent()`, assert the file is
  created with content matching `getDefaultContent()`.
- Full DB bootstrap flow: empty database, call `ensureDbBootstrap()`, assert all tables are
  seeded with data matching `getDefaultContent()`.
- Script smoke test: run `scripts/bootstrap-client.ts --dry-run` and assert it completes
  without error.
