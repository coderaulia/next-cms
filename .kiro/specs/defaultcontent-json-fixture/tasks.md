# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Default Content Is Not Bundled or Eagerly Evaluated
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate that `defaultContent.ts` is eagerly evaluated at import time
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — importing the module and asserting the content object is NOT allocated until `getDefaultContent()` is called
  - Create `src/tests/defaultContentLazyLoad.test.ts`
  - Test: import `defaultContent.ts`, then assert that accessing `defaultContent` (or calling `getDefaultContent()`) before any bootstrap call does NOT return a populated object (i.e., the module does not eagerly construct the 64 KB object)
  - As a proxy for bundle inclusion: assert that the raw source of `defaultContent.ts` does NOT contain inline string literals like `"Example Studio"` after the fix (on unfixed code it will contain them)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (proves the bug — the module eagerly constructs the object at import time)
  - Document counterexamples found (e.g., "`defaultContent.settings.general.siteName` is `'Example Studio'` immediately on import, before any bootstrap call")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.6_

- [-] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - All Bootstrap and Merge Behaviors Are Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Create `src/tests/defaultContentPreservation.test.ts`
  - Observe: call `mergeWithDefaults({ settings: {}, pages: {}, blogPosts: [], portfolioProjects: [], categories: [], mediaAssets: [] })` on unfixed code and record the result shape
  - Observe: call `normalizeSettings({})` on unfixed code and record the result shape
  - Observe: `defaultContent.pages` keys on unfixed code (e.g., `['home', 'about', ...]`)
  - Write property-based test using `fast-check` (already in devDependencies if present, otherwise use manual random generation):
    - For any partial `SiteSettings` object, `normalizeSettings(partial)` must return an object with all required top-level keys populated (from Preservation Requirements in design)
    - For any `CmsContent` with empty arrays, `mergeWithDefaults(partial)` must return arrays with length > 0 (filled from defaults)
    - `getDefaultContent().pages` must contain the same keys as the current `defaultContent.pages`
    - `getDefaultContent().blogPosts` must have the same length as the current `defaultContent.blogPosts`
  - Verify tests PASS on UNFIXED code (establishes baseline)
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 3. Fix: Move default content data to a JSON fixture file

  - [~] 3.1 Generate `data/default-content.fixture.json`
    - Write a one-off Node script (or use the existing `scripts/` pattern) that imports the current `defaultContent` export and writes `JSON.stringify(defaultContent, null, 2)` to `data/default-content.fixture.json`
    - Replace any `nowIso()`-generated timestamps with a fixed value (`"2024-01-01T00:00:00.000Z"`) so the file is deterministic and diff-friendly
    - Commit the generated file to the repository (it is NOT gitignored — unlike `data/content.json`)
    - Verify the file is valid JSON and parses back to a `CmsContent`-shaped object
    - _Requirements: 2.5, 2.6_

  - [~] 3.2 Replace `defaultContent.ts` static export with a lazy loader
    - Remove all content-construction helpers (`section()`, `seo()`, `page()`, `nowIso()`) and all inline content data from `defaultContent.ts`
    - Add `getDefaultContent(): CmsContent` that reads `data/default-content.fixture.json` with `readFileSync` on first call and caches the result in a module-level `let _cache: CmsContent | null = null`
    - Add a Proxy-based back-compat `export const defaultContent` so all 11 existing import sites continue to compile without changes
    - Ensure `getDefaultContent()` throws a descriptive error if the fixture file is missing
    - Run `npm run typecheck` — must pass with zero errors
    - _Bug_Condition: isBugCondition(input) — static module import causes eager 64 KB allocation_
    - _Expected_Behavior: getDefaultContent() loads fixture lazily, _cache is null until first call_
    - _Preservation: all callers of defaultContent.X continue to work via Proxy delegation_
    - _Requirements: 2.1, 2.6, 3.9_

  - [~] 3.3 Update `storeShared.ts` to call `getDefaultContent()`
    - Replace `import { defaultContent }` with `import { getDefaultContent }` (or keep using the Proxy back-compat export — either is acceptable)
    - In `normalizeSettings()`: replace `structuredClone(defaultContent.settings)` with `structuredClone(getDefaultContent().settings)`
    - In `mergeWithDefaults()`: replace all `structuredClone(defaultContent.X)` calls with `structuredClone(getDefaultContent().X)`
    - Run `npm run typecheck` — must pass
    - _Requirements: 2.3, 3.5, 3.6_

  - [~] 3.4 Update `fileStore.ts` to call `getDefaultContent()`
    - Replace `import { defaultContent }` with `import { getDefaultContent }`
    - In `ensureDataFile()`: replace `JSON.stringify(defaultContent, ...)` with `JSON.stringify(getDefaultContent(), ...)`
    - In `readContent()`: replace `structuredClone(defaultContent)` and `JSON.stringify(defaultContent, ...)` with calls using `getDefaultContent()`
    - In `readContent()`: replace `Object.keys(defaultContent.pages)` with `Object.keys(getDefaultContent().pages)`
    - Run `npm run typecheck` — must pass
    - _Requirements: 2.2, 3.1, 3.2, 3.3_

  - [~] 3.5 Update `dbStore.ts` to call `getDefaultContent()`
    - Replace `import { defaultContent }` with `import { getDefaultContent }`
    - In `ensureDbBootstrap()`: replace all `defaultContent.X` references with `getDefaultContent().X`
    - In `getSettings()`: replace `defaultContent.settings` fallback with `getDefaultContent().settings`
    - In `getPages()`: replace `structuredClone(defaultContent.pages)` with `structuredClone(getDefaultContent().pages)`
    - Run `npm run typecheck` — must pass
    - _Requirements: 2.4, 3.4, 3.7_

  - [~] 3.6 Update remaining feature files and scripts
    - `src/features/cms/dbCollectionsStore.ts`: replace `defaultContent` import/usage with `getDefaultContent()`
    - `src/features/cms/fileCollectionsStore.ts`: replace `defaultContent` import/usage with `getDefaultContent()`
    - `src/features/cms/importExport.ts`: replace `defaultContent` import/usage with `getDefaultContent()`
    - `scripts/bootstrap-client.ts`: replace `defaultContent` import/usage with `getDefaultContent()`
    - `scripts/import-content.ts`: replace `defaultContent` import/usage with `getDefaultContent()`
    - Run `npm run typecheck` — must pass with zero errors across all updated files
    - _Requirements: 3.8_

  - [~] 3.7 Update test files
    - `src/tests/clientStarter.test.ts`: update `defaultContent` import/usage to `getDefaultContent()`
    - `src/tests/seo.test.ts`: update `defaultContent` import/usage to `getDefaultContent()`
    - `src/tests/contentStore.test.ts`: update `defaultContent` import/usage to `getDefaultContent()`
    - `src/tests/importExport.test.ts`: update `defaultContent` import/usage to `getDefaultContent()`
    - Run `npm run typecheck` — must pass
    - _Requirements: 3.9_

  - [~] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Default Content Is Not Bundled or Eagerly Evaluated
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the lazy-load behavior is satisfied
    - Run `npx vitest run src/tests/defaultContentLazyLoad.test.ts`
    - **EXPECTED OUTCOME**: Test PASSES (confirms the 64 KB object is no longer eagerly allocated)
    - _Requirements: 2.1, 2.2, 2.6_

  - [~] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - All Bootstrap and Merge Behaviors Are Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run `npx vitest run src/tests/defaultContentPreservation.test.ts`
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in bootstrap/merge behavior)
    - Confirm all tests still pass after fix (no regressions)

- [~] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite: `npm run test`
  - Run type checking: `npm run typecheck`
  - Run lint: `npm run lint`
  - All checks must pass with zero errors
  - Verify `data/default-content.fixture.json` is committed and `data/content.json` remains gitignored
  - Ask the user if any questions arise
