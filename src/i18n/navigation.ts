import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

// Locale-aware drop-in replacements for next/link + next/navigation helpers.
// Public pages should import Link/useRouter/usePathname/redirect from here so
// the active locale is preserved across navigation.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
