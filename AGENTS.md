# AGENTS.md

## Overview

This is a Next.js App Router CMS with TypeScript strict mode, Drizzle ORM, and dual persistence (local files or PostgreSQL/Supabase).

## Build / Lint / Test Commands

```bash
# Development
npm run dev                  # Start dev server at http://localhost:3000

# Build
npm run build                # Production build
npm run analyze              # Build with bundle analyzer
npm run audit:size           # Report public/ and build output sizes
npm run build:audit          # build + audit:size

# Lint & Type Check
npm run lint                 # ESLint (next lint)
npm run typecheck            # TypeScript checks (tsc --noEmit --incremental false)
npm run check                # lint + typecheck + test

# Testing
npm run test                 # Run all Vitest tests (vitest run)
npx vitest run src/tests/contentStore.test.ts   # Run single test file
npx vitest run --watch       # Watch mode
npx vitest run -t "filters by status"           # Run tests matching name

# Database (Drizzle)
npm run db:generate          # Generate migrations
npm run db:migrate           # Apply migrations
npm run db:push              # Push schema directly
npm run db:studio            # Open Drizzle Studio
npm run db:seed:file         # Import data/content.json
npm run db:seed:file -- --fixture brochure     # Seed with fixture

# Database Reset & Reseed
npm run db:reseed            # purge + migrate + seed
```

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** (`strict: true`, `noImplicitAny: true`)
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` for plain data shapes; use `interface` for extendable object shapes
- Use type guards (`value is X`) for runtime validation of unknown inputs
- Import types with `import type { TypeName }` to ensure type-only imports

### Imports
- Order: 1) Node.js built-ins, 2) External packages, 3) Internal `@/` aliases
- Blank line between groups
- Example:
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/features/cms/types';
```

### React Components
- Use function components exclusively; no class components
- Use `React.forwardRef` for components that need ref forwarding
- Set `displayName` after `forwardRef` components
- Co-locate component styles when using Tailwind; no separate CSS files for component styles
- Prop types: define with `type Props = { ... }` or `interface Props`
- Server Components by default; add `'use client'` only when needed for interactivity

### Naming Conventions
| Thing | Convention | Example |
|-------|------------|---------|
| Files | kebab-case | `content-store.ts`, `hero-block-view.tsx` |
| Types/Interfaces | PascalCase | `BlogPost`, `HomeBlockViewProps` |
| Functions | camelCase | `queryBlogPosts`, `validateBlogPost` |
| Constants | camelCase or SCREAMING_SNAKE | `PAGE_IDS`, `cmsAdminEmail` |
| CSS/Tailwind classes | Tailwind defaults | `bg-primary`, `text-foreground` |

### Error Handling
- API routes: return `NextResponse.json({ error: 'message' }, { status: 400 })` for client errors
- Use `try/catch` with specific error handling; avoid bare `catch`
- Audit/log failures should be swallowed silently (see admin blog route pattern)
- Validators return `null` on failure instead of throwing; callers check for null

### Validators Pattern
This codebase uses a consistent validator pattern for untrusted input:
```typescript
function isObject(value: unknown): value is Record<string, unknown>
function asString(value: unknown): string
function asBoolean(value: unknown): boolean
function asSafeAssetUrl(value: unknown): string  // validates and normalizes URLs

export function validateXxx(payload: unknown): Xxx | null {
  if (!isObject(payload)) return null;
  // ... validate and return typed object or null
}
```

### Tailwind CSS
- Core plugins: `preflight: false` (no base reset)
- Custom colors: `vanailaNavy`, `electricBlue`, `royalPurple`, `vibrantCyan`, `deepSlate`
- Custom shadows: `glass`, `glass-card`
- Use `cn()` utility from `@/lib/utils` to merge Tailwind classes conditionally

### Testing with Vitest
- Environment: `jsdom`
- Globals: enabled (`describe`, `expect`, `it`, etc.)
- Timeout: 15000ms per test
- Setup file: `vitest.setup.ts` (mocks IntersectionObserver)
- Test files: `src/tests/**/*.test.ts` or `*.test.tsx`

### File Structure
```
src/
  app/              # Next.js App Router (pages, api routes, sitemap, robots)
  components/       # React components (ui/, home/blocks/, admin/, forms/)
  db/               # Drizzle schema and client
  features/cms/      # Core CMS logic (store, validators, types, auth)
  lib/              # Utilities (utils.ts, clientCsrf.ts, analyticsClient.ts)
  services/         # Service layer (env.ts, mediaStorage.ts, requestSecurity.ts)
  tests/            # Vitest tests
  config/           # Site configuration (site-profile.ts)
data/
  content.json       # Local file store (gitignored)
```

### Environment Variables
- Use `env.ts` service to access env vars (wraps `process.env`)
- Always clean/trim env values: `value?.trim().replace(/^['"]|['"]$/g, '') || ''`
- Server-only vars: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Public vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL`

### API Routes
- Use `NextResponse` for responses
- Validate admin requests with `assertAdminRequest` or `assertAdminPermission`
- Return early on unauthorized
- Use `request.json().catch(() => null)` for body parsing with fallback
- Call `revalidatePublicCmsCache()` after mutations

### Database (Drizzle)
- Schema in `src/db/schema.ts`
- Use `drizzle-orm` for queries
- Migrations via `drizzle-kit`
- Dual mode: file-based (default) or Postgres (when `DATABASE_URL` set)

## Security Notes
- Admin auth via cookie sessions (database mode) or `CMS_ADMIN_TOKEN` header (legacy)
- Always validate/sanitize untrusted input with validators
- Use `asSafeHref` and `asSafeAssetUrl` for URL fields
- Contact submission webhooks include token verification
