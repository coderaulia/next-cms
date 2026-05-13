/**
 * Bug Condition Exploration Test — Property 1
 *
 * Validates: Requirements 1.1, 1.2, 1.6
 *
 * **Validates: Requirements 1.1, 1.6**
 *
 * GOAL: Surface counterexamples that demonstrate `defaultContent.ts` is eagerly
 * evaluated at import time, allocating the full 64 KB object before any bootstrap
 * call is made.
 *
 * EXPECTED OUTCOME ON UNFIXED CODE: FAIL
 *   — The module eagerly constructs the object at import time, so the assertions
 *     below (which expect lazy/deferred allocation) will fail.
 *
 * EXPECTED OUTCOME AFTER FIX: PASS
 *   — `getDefaultContent()` loads the fixture lazily; the object is not allocated
 *     until the function is explicitly called.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// ─── Property 1: Bug Condition ────────────────────────────────────────────────
//
// For any server process start where data/content.json already exists and is
// valid, the system SHALL NOT evaluate or allocate the default content object
// until getDefaultContent() is explicitly called by a bootstrap or merge code
// path.
//
// On UNFIXED code, importing the module immediately allocates the 64 KB object,
// so the assertions below will fail — which is the expected outcome for this
// exploration test.
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 1: Bug Condition — Default Content Is Not Bundled or Eagerly Evaluated', () => {
  it('should NOT expose a populated defaultContent object immediately on import (lazy load expected)', async () => {
    // Dynamically import the module so we can observe its state right after load.
    // On unfixed code, `defaultContent` is a fully-constructed CmsContent object
    // the moment this import resolves — proving eager evaluation.
    const mod = await import('@/features/cms/defaultContent');

    // The fixed module should export `getDefaultContent` as the primary API.
    // On unfixed code, only `defaultContent` (the static export) exists.
    const hasLazyLoader = typeof (mod as Record<string, unknown>).getDefaultContent === 'function';

    // ASSERTION 1: The module must expose a lazy loader function, not just a
    // static export. On unfixed code this fails because `getDefaultContent` does
    // not exist.
    expect(
      hasLazyLoader,
      'Expected module to export getDefaultContent() lazy loader, but it does not. ' +
        'This confirms the bug: the module uses a static export instead of lazy loading.'
    ).toBe(true);
  });

  it('should NOT have siteName populated before getDefaultContent() is called (no eager allocation)', async () => {
    // On unfixed code, `defaultContent.settings.general.siteName` is immediately
    // available as 'Example Studio.' because the object is constructed at module
    // load time. This test asserts the opposite — that accessing the value before
    // any explicit call returns undefined/null (lazy behavior).
    const mod = await import('@/features/cms/defaultContent');

    // On unfixed code: mod.defaultContent is a fully-populated CmsContent object.
    // On fixed code: mod.defaultContent is a Proxy that defers to getDefaultContent(),
    //   OR the named export does not exist and only getDefaultContent() is exported.
    const staticExport = (mod as Record<string, unknown>).defaultContent as
      | Record<string, unknown>
      | undefined;

    // If the static export exists and is a plain (non-Proxy) object with settings
    // already populated, that is the bug condition.
    if (staticExport && typeof staticExport === 'object') {
      const settings = staticExport.settings as Record<string, unknown> | undefined;
      const general = settings?.general as Record<string, unknown> | undefined;
      const siteName = general?.siteName;

      // ASSERTION 2: siteName must NOT be eagerly populated.
      // On unfixed code this fails with:
      //   counterexample: defaultContent.settings.general.siteName === 'Example Studio.'
      expect(
        siteName,
        `Counterexample found: defaultContent.settings.general.siteName is '${String(siteName)}' ` +
          'immediately on import, before any bootstrap call. ' +
          'This proves the bug — the module eagerly constructs the 64 KB object at import time.'
      ).toBeUndefined();
    }
  });

  it('source file should NOT contain inline string literals like "Example Studio" (bundle inclusion proxy)', () => {
    // As a proxy for bundle inclusion: the raw source of defaultContent.ts must
    // NOT contain inline string literals like "Example Studio" after the fix.
    // On unfixed code it will contain them — proving the data is embedded in code.
    const fixturePath = path.join(
      process.cwd(),
      'src',
      'features',
      'cms',
      'defaultContent.ts'
    );

    let source: string;
    try {
      source = readFileSync(fixturePath, 'utf-8');
    } catch {
      // If the file cannot be read, skip this assertion.
      return;
    }

    // ASSERTION 3: The source must not contain the inline string 'Example Studio'
    // (with or without trailing period). On unfixed code this fails because the
    // 64 KB content object is embedded directly in the TypeScript source.
    const containsInlineData = source.includes('Example Studio');

    expect(
      containsInlineData,
      "Counterexample found: defaultContent.ts source contains the inline string 'Example Studio'. " +
        'This proves the data is embedded in the TypeScript module and will be bundled into the ' +
        'server build, confirming the bug condition (Requirements 1.6).'
    ).toBe(false);
  });
});
