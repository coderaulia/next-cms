import Link from 'next/link';

import type { LandingPage } from '@/features/cms/types';

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
          <section className="marketing-section" key={section.id} style={sectionStyle}>
            <div className={`container section-grid ${section.layout}`}>
              <div>
                <h1 className="section-title">{section.heading}</h1>
                <p className="section-body">{section.body}</p>
                {section.ctaHref ? (
                  <Link href={section.ctaHref} className="cta-link" style={buttonStyle}>
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
          </section>
        );
      })}
    </main>
  );
}
