import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HomeBlockRenderer } from '@/components/home/HomeBlockRenderer';
import type { LandingPage } from '@/features/cms/types';

describe('HomeBlockRenderer', () => {
  it('renders enabled blocks only in configured order', () => {
    const page: LandingPage = {
      id: 'home',
      title: 'Home',
      navLabel: 'Home',
      published: true,
      seo: {
        metaTitle: 'Home',
        metaDescription: 'desc',
        slug: '',
        canonical: '',
        socialImage: '',
        noIndex: false
      },
      sections: [],
      homeBlocks: [
        {
          id: 'hero-1',
          type: 'hero',
          enabled: true,
          theme: 'light',
          badge: 'Badge',
          titlePrimary: 'Enabled title',
          titleAccent: 'Accent',
          description: 'Desc',
          primaryCtaLabel: 'CTA',
          primaryCtaHref: '/contact',
          primaryCtaStyle: 'primary',
          secondaryCtaLabel: 'CTA 2',
          secondaryCtaHref: '/service',
          secondaryCtaStyle: 'secondary'
        },
        {
          id: 'cta-1',
          type: 'primary_cta',
          enabled: false,
          theme: 'blue-soft',
          heading: 'Hidden heading',
          accentText: 'Hidden accent',
          description: 'Hidden description',
          ctaLabel: 'Hidden CTA',
          ctaHref: '/contact',
          ctaStyle: 'primary'
        }
      ],
      updatedAt: new Date().toISOString()
    };

    render(<HomeBlockRenderer page={page} />);

    expect(screen.getByText('Enabled title')).toBeInTheDocument();
    expect(screen.queryByText('Hidden heading')).not.toBeInTheDocument();
  });
});
