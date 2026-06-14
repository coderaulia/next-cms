import { notFound, redirect } from 'next/navigation';

import { ContactPageView } from '@/components/pages/ContactPageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

type ContactPageProps = {
  searchParams?: Promise<{ interest?: string; template?: string }>;
};

const INTEREST_TO_SERVICE: Record<string, string> = {
  partnership: 'Partnership / Referral',
  template: 'Website Development',
  website: 'Website Development',
  webapp: 'Custom Web App Development',
  mobile: 'Mobile App Development (React Native)',
  landing: 'High-Conversion Landing Page',
  shop: 'Online Shop / E-Commerce',
  email: 'Professional Business Email',
  hris: 'Custom Web App Development',
  'hris-custom': 'Custom Web App Development',
  psikotest: 'Custom Web App Development',
  flowraze: 'Custom Web App Development',
  atelier: 'Website Development',
  blog: 'Website Development',
  portfolio: 'Website Development',
};

const OVERVIEW_PREFILL: Record<string, string> = {
  hris: "Hi, I'm interested in Vanaila HRIS for my team. I'd like to learn about features, modules, and pricing.",
  'hris-custom': "Hi, I need a custom HRIS solution tailored to my organization's workflows. Let's discuss the modules and integrations I need.",
  psikotest: "Hi, I'm interested in the Vanaila Psikotest platform for psychometric assessments in our HR or recruitment process.",
  flowraze: "Hi, I'm interested in Flowraze CRM to manage my sales pipeline and customer relationships. Can we discuss pricing and onboarding?",
  atelier: "Hi, I'm interested in collaborating with Vanaila Atelier on a custom website project. Here's what I have in mind:",
  website: "Hi, I'd like to discuss a website development project with Vanaila.",
  webapp: "Hi, I need a custom web application built. Here are the details of what I'm looking to create:",
  mobile: "Hi, I'm looking to build a mobile application using React Native. Here's the concept:",
  landing: "Hi, I need a high-conversion landing page for my product or campaign.",
  shop: "Hi, I want to build an online shop or e-commerce platform for my business.",
  blog: "Hi, I came across the Vanaila blog and I'm interested in working together on a project.",
  portfolio: "Hi, I saw the Vanaila portfolio and I'd love to discuss a similar project for my business.",
};

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('contact')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [page, settings, params] = await Promise.all([
    getPublishedPage('contact'),
    getSiteSettings(),
    searchParams
  ]);
  if (!page) notFound();
  if (page.seo.slug && page.seo.slug !== 'contact') {
    redirect(`/${page.seo.slug}`);
  }

  const rawInterest = typeof params?.interest === 'string' ? params.interest : null;
  const mappedService = rawInterest ? (INTEREST_TO_SERVICE[rawInterest] ?? null) : null;

  let initialInterest: string | undefined = mappedService ?? undefined;
  let initialOverview: string | undefined;

  if (rawInterest === 'template') {
    const templateName = typeof params?.template === 'string'
      ? params.template.slice(0, 120).replace(/[<>"']/g, '')
      : null;
    if (templateName) {
      initialOverview = `Hi, I'm interested in the "${templateName}" template. I'd love to build a website using this design.`;
    }
  } else if (rawInterest && OVERVIEW_PREFILL[rawInterest]) {
    initialOverview = OVERVIEW_PREFILL[rawInterest];
  }

  return (
    <ContactPageView
      page={page}
      settings={settings}
      initialInterest={initialInterest}
      initialOverview={initialOverview}
    />
  );
}
