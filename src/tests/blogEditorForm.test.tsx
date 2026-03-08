import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BlogEditorForm } from '@/components/forms/BlogEditorForm';
import type { BlogPost } from '@/features/cms/types';

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock
  })
}));

const csrfFetchMock = vi.fn(async (input: RequestInfo | URL) => {
  if (typeof input === 'string' && input.includes('/api/admin/categories')) {
    return {
      ok: true,
      json: async () => ({ categories: [] })
    } as Response;
  }

  return {
    ok: true,
    json: async () => ({ post: null })
  } as Response;
});

vi.mock('@/lib/clientCsrf', () => ({
  csrfFetch: (...args: unknown[]) => csrfFetchMock(...(args as [RequestInfo | URL]))
}));

function makeInvalidPost(): BlogPost {
  return {
    id: 'post-1',
    title: '',
    excerpt: 'Excerpt',
    content: '',
    author: '',
    tags: [],
    coverImage: '',
    status: 'draft',
    publishedAt: null,
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: '',
      metaDescription: '',
      slug: '',
      canonical: '',
      socialImage: '',
      noIndex: false
    }
  };
}

describe('BlogEditorForm', () => {
  it('blocks save when required fields are invalid', async () => {
    render(<BlogEditorForm initialPost={makeInvalidPost()} />);

    await waitFor(() => expect(csrfFetchMock).toHaveBeenCalled());

    expect(screen.getByRole('button', { name: /save post/i })).toBeDisabled();
    expect(screen.getAllByText('Title is required.').length).toBeGreaterThan(0);
  });
});


