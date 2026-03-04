import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import type { BlogPost } from '@/features/cms/types';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
}));

describe('AdminPostsTable', () => {
  it('renders rows and pagination values from filter state payload', () => {
    const posts: BlogPost[] = [
      {
        id: 'post-1',
        title: 'Post one',
        excerpt: 'Excerpt',
        content: 'Content',
        author: 'Admin',
        tags: ['engineering'],
        coverImage: '',
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seo: {
          metaTitle: 'Post one',
          metaDescription: 'desc',
          slug: 'post-one',
          canonical: '',
          socialImage: '',
          noIndex: false
        }
      }
    ];

    render(
      <AdminPostsTable
        posts={posts}
        total={11}
        page={2}
        pageSize={10}
        totalPages={2}
        onPrev={() => undefined}
        onNext={() => undefined}
      />
    );

    expect(screen.getByText('Post one')).toBeInTheDocument();
    expect(screen.getByText('Showing 11-11 of 11 posts')).toBeInTheDocument();
    expect(screen.getByText('Page 2 / 2')).toBeInTheDocument();
  });
});
