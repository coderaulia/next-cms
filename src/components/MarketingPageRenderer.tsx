import Link from 'next/link';

import type { LandingPage } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';

type MarketingPageRendererProps = {
  page: LandingPage;
};

export function MarketingPageRenderer({ page }: MarketingPageRendererProps) {
  return (
    <main>
      {page.sections.map((section) => {
        const sectionStyle = {
          backgroundColor: section.theme.background,
          color: section.theme.text
        };
        const buttonStyle = {
          backgroundColor: section.theme.accent
        };
        return (
          <Reveal as="section" className="marketing-section" key={section.id} style={sectionStyle}>
            <div className={`container section-grid ${section.layout}`}>
              <div>
                <h1 className="section-title">{section.heading}</h1>
                <p className="section-body">{section.body}</p>
                {section.ctaHref ? (
                  <Link
                    href={section.ctaHref}
                    className="cta-link"
                    style={buttonStyle}
                    data-analytics-event="cta_click"
                    data-analytics-label={section.ctaLabel || section.heading || 'Marketing section CTA'}
                  >
                    {section.ctaLabel || 'Learn more'}
                  </Link>
                ) : null}
              </div>
              {section.layout === 'split' ? (
                <div>
                  <img src={section.mediaImage} alt={section.mediaAlt || section.heading} />
                </div>
              ) : null}
            </div>
          </Reveal>
        );
      })}
    </main>
  );
}
