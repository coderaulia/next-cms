import Link from 'next/link';

import type { LandingPage, PageId } from '@/features/cms/types';

import { sectionWithFallback, splitAccent } from './sectionContent';

type ServiceDetailPageId =
  | 'service-website-development'
  | 'service-custom-business-tools'
  | 'service-secure-online-shops'
  | 'service-mobile-business-app'
  | 'service-official-business-email';

type ServicePreset = {
  heroHeading: string;
  heroDescription: string;
  heroBadge: string;
  plans: Array<{
    heading: string;
    features: string;
    tier: string;
    price: string;
    priceLabel: string;
    button: string;
    href: string;
    featured?: boolean;
  }>;
  whyHeading: string;
  whyItems: Array<{ icon: string; heading: string; body: string }>;
  lifecycleItems: Array<{ icon: string; heading: string; body: string }>;
  ctaHeading: string;
  ctaBody: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

const servicePresets: Record<ServiceDetailPageId, ServicePreset> = {
  'service-website-development': {
    heroHeading: 'Website Development|Engineering Your Digital Growth',
    heroDescription:
      'Transform your online presence into a performance-driven asset. We build infrastructure that scales with your ambition.',
    heroBadge: 'Engineering Excellence Since 2018',
    plans: [
      {
        heading: 'Startup',
        features: '5 Premium Pages\nMobile-First Responsive Design\nCore Web Vitals Optimized\nStandard CMS Integration',
        tier: 'Base Tier',
        price: 'IDR 3.5M',
        priceLabel: 'Starting From',
        button: 'Select Package',
        href: '/contact'
      },
      {
        heading: 'Professional',
        features:
          'Up to 12 Advanced Pages\nCustom UX/UI Research\nTechnical SEO Architecture\nConversion Rate Optimization\nAPI Integration',
        tier: 'Growth Tier',
        price: 'IDR 7.5M',
        priceLabel: 'Starting From',
        button: 'Get Started Now',
        href: '/contact',
        featured: true
      },
      {
        heading: 'Enterprise',
        features:
          'Unlimited Build & Pages\nCustom Backend Engineering\nEnterprise-Grade Security\nDedicated DevOps Support',
        tier: 'Scale Tier',
        price: 'Custom Pricing',
        priceLabel: 'Infrastructure Focus',
        button: 'Contact Architecture Team',
        href: '/contact'
      }
    ],
    whyHeading: 'Why Choose Vanaila?',
    whyItems: [
      { icon: 'schedule', heading: '24-Hour SLA', body: 'Critical technical support and updates with guaranteed response windows.' },
      { icon: 'history_edu', heading: '8+ Years Pedigree', body: 'A decade of engineering experience building digital assets.' },
      { icon: 'verified', heading: 'Best Price Guarantee', body: 'Premium engineering at competitive rates.' },
      { icon: 'hub', heading: 'Ecosystem Ready', body: 'Modular builds designed for your existing stack.' }
    ],
    lifecycleItems: [
      { icon: 'search', heading: 'Discovery', body: 'Requirements and business audit' },
      { icon: 'architecture', heading: 'Architecture', body: 'Technical design and sitemap' },
      { icon: 'code', heading: 'Development', body: 'Clean engineering and UI build' },
      { icon: 'fact_check', heading: 'QA & Testing', body: 'Stress test and UX validation' },
      { icon: 'rocket_launch', heading: 'Deployment', body: 'Go-live and cloud configuration' }
    ],
    ctaHeading: 'Ready to Build Your|Digital Future?',
    ctaBody:
      'Whether you are a scaling startup or an established enterprise, technical clarity will guide your next breakthrough.',
    ctaPrimaryLabel: 'Book a Strategy Call',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'Get a Free Technical Audit',
    ctaSecondaryHref: '/contact'
  },
  'service-custom-business-tools': {
    heroHeading: 'Custom Business Tools|Automate Your Unique Workflows',
    heroDescription:
      'We build bespoke internal tools and automation systems that become the technical backbone of your operations.',
    heroBadge: 'Engineering Excellence Since 2018',
    plans: [
      {
        heading: 'Process Boost',
        features: 'Workflow Automation\nInternal Dashboard\nAPI Integration\nStandard Maintenance Support',
        tier: 'Automation Tier',
        price: 'IDR 5.5M',
        priceLabel: 'Starting From',
        button: 'Select Package',
        href: '/contact'
      },
      {
        heading: 'Operational Core',
        features:
          'Comprehensive Ops Portal\nRole-Based Access Control\nComplex Database Architecture\nCustom Reporting',
        tier: 'Infrastructure Tier',
        price: 'IDR 12.5M',
        priceLabel: 'Starting From',
        button: 'Build My System',
        href: '/contact',
        featured: true
      },
      {
        heading: 'Enterprise Hub',
        features: 'Legacy Modernization\nSecure Data Pipelines\nCustom AI Integration\nPriority Support',
        tier: 'Ecosystem Tier',
        price: 'Custom Pricing',
        priceLabel: 'Architecture Focus',
        button: 'Architect Our Solution',
        href: '/contact'
      }
    ],
    whyHeading: 'Engineered for Efficiency',
    whyItems: [
      { icon: 'bolt', heading: 'Rapid ROI', body: 'Tools pay for themselves by reducing manual time.' },
      { icon: 'security', heading: 'Bank-Grade Security', body: 'Strict encryption and audit protocols.' },
      { icon: 'settings_suggest', heading: 'Custom Tailored', body: 'No generic templates. Built for your logic.' },
      { icon: 'sync_alt', heading: 'Ecosystem Integration', body: 'Sync with Slack, GWS, and your CRM stack.' }
    ],
    lifecycleItems: [
      { icon: 'troubleshoot', heading: 'Workflow Audit', body: 'Identify manual bottlenecks' },
      { icon: 'schema', heading: 'Database Design', body: 'Data integrity architecture' },
      { icon: 'terminal', heading: 'Core Engineering', body: 'Bespoke logic and backend' },
      { icon: 'bug_report', heading: 'Stress Testing', body: 'QA in real-world scenarios' },
      { icon: 'dns', heading: 'Deployment', body: 'Secure migration and training' }
    ],
    ctaHeading: 'Ready to automate your|operational friction?',
    ctaBody: 'Turn technical complexity into a competitive advantage.',
    ctaPrimaryLabel: 'Book a Strategy Call',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'Get a Free Technical Audit',
    ctaSecondaryHref: '/contact'
  },
  'service-secure-online-shops': {
    heroHeading: 'Secure Online Shops|Your 24/7 Global Sales Machine',
    heroDescription:
      'We build robust systems designed for conversion and scalability. Secure, fast, and engineered to grow your brand.',
    heroBadge: 'Engineering Excellence Since 2018',
    plans: [
      {
        heading: 'The Startup Shop',
        features: 'WooCommerce Setup\nUp to 50 Products\nWhatsApp Integration\nPerformance Optimization',
        tier: 'Beginner Started',
        price: 'IDR 6.5M',
        priceLabel: 'Starting From',
        button: 'Select Plan',
        href: '/contact'
      },
      {
        heading: 'The Growth Merchant',
        features: 'Headless Ecommerce\nAutomated Payments\nInventory Sync\nSecurity Layer\nAdvanced Analytics',
        tier: 'Modern Architecture',
        price: 'IDR 18.5M',
        priceLabel: 'Starting From',
        button: 'Scale My Store',
        href: '/contact',
        featured: true
      },
      {
        heading: 'The Enterprise Retailer',
        features: 'Custom Frontends\nNative Mobile Apps\nLoyalty Systems\nB2B Portals',
        tier: 'Bespoke Ecosystem',
        price: 'Custom Pricing',
        priceLabel: 'Architecture Focus',
        button: 'Consult Enterprise',
        href: '/contact'
      }
    ],
    whyHeading: 'Built for Reliability & Speed',
    whyItems: [
      { icon: 'verified_user', heading: '8+ Years Reliability', body: 'High-uptime sales platforms for diverse industries.' },
      { icon: 'storefront', heading: 'Ecosystem Experts', body: 'Seamless local payment and logistics integration.' },
      { icon: 'payments', heading: 'Best Price Guarantee', body: 'Maximum performance per cost ratio.' },
      { icon: 'support_agent', heading: 'The 24-Hour SLA', body: 'Rapid response for critical ecommerce incidents.' }
    ],
    lifecycleItems: [
      { icon: 'strategy', heading: 'Strategy & Audit', body: 'Inventory and goal mapping' },
      { icon: 'storage', heading: 'Infrastructure', body: 'Server and stack selection' },
      { icon: 'brush', heading: 'UX & Design', body: 'High-conversion interfaces' },
      { icon: 'sync', heading: 'Integration', body: 'Payments and logistics sync' },
      { icon: 'rocket', heading: 'Launch & Support', body: 'Go-live and maintenance' }
    ],
    ctaHeading: 'Ready to dominate the|digital market?',
    ctaBody: 'Build a shop that sells while you sleep with reliable ecommerce infrastructure.',
    ctaPrimaryLabel: 'Book a Strategy Call',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'Get a Free Technical Audit',
    ctaSecondaryHref: '/contact'
  },
  'service-mobile-business-app': {
    heroHeading: 'Mobile Business App|Native Power, Cross-Platform Speed',
    heroDescription:
      'Reach users where they spend time with native-performing iOS and Android applications from a unified codebase.',
    heroBadge: 'Engineering Excellence Since 2018',
    plans: [
      {
        heading: 'App Launchpad',
        features: 'React Native Framework\niOS & Android\nCore Business Features\nStore Deployment',
        tier: 'MVP Tier',
        price: 'IDR 15.0M',
        priceLabel: 'Starting From',
        button: 'Select Kickstart',
        href: '/contact'
      },
      {
        heading: 'Advanced Native',
        features:
          'Custom UI/UX\nPush Notifications\nOffline Sync\nBiometric Auth\nStore Approval Support',
        tier: 'Engagement Tier',
        price: 'IDR 35.0M',
        priceLabel: 'Starting From',
        button: 'Build Premium App',
        href: '/contact',
        featured: true
      },
      {
        heading: 'Enterprise Native',
        features: 'Complex Backend Integration\nPayment SDKs\nCustom Analytics\nMulti-Region Hosting',
        tier: 'Ecosystem Tier',
        price: 'Custom Pricing',
        priceLabel: 'Infrastructure Focus',
        button: 'Consult Architect',
        href: '/contact'
      }
    ],
    whyHeading: 'Why Go Mobile with Us?',
    whyItems: [
      { icon: 'speed', heading: 'Single Base, Dual Power', body: 'One codebase for both iOS and Android.' },
      { icon: 'vibration', heading: 'High-Fidelity UX', body: 'Native-feel navigation and smooth interactions.' },
      { icon: 'cloud_done', heading: 'Cloud-Synced', body: 'Real-time sync between web and mobile.' },
      { icon: 'verified', heading: 'App Store Ready', body: 'We handle submission and optimization flows.' }
    ],
    lifecycleItems: [
      { icon: 'draw', heading: 'UX Wireframing', body: 'User journey and interaction design' },
      { icon: 'phone_android', heading: 'Native Dev', body: 'Cross-platform programming' },
      { icon: 'api', heading: 'Backend Bridge', body: 'API and infrastructure sync' },
      { icon: 'touch_app', heading: 'Alpha/Beta Test', body: 'Feedback-driven quality loops' },
      { icon: 'publish', heading: 'Store Launch', body: 'Deployment to app stores' }
    ],
    ctaHeading: 'Ready to put your brand|in their pocket?',
    ctaBody: 'Discuss your mobile strategy and start building high-performance apps today.',
    ctaPrimaryLabel: 'Book a Strategy Call',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'Get a Free Technical Audit',
    ctaSecondaryHref: '/contact'
  },
  'service-official-business-email': {
    heroHeading: 'Official Business Email|Establish Instant Trust & Authority',
    heroDescription:
      'We architect professional Google Workspace and custom domain email infrastructure for secure business communication.',
    heroBadge: 'Engineering Excellence Since 2018',
    plans: [
      {
        heading: 'Pro Identity',
        features: 'GWS Setup\nDNS Configuration\nEmail Migration Support\nSpam Protection',
        tier: 'Starter Tier',
        price: 'IDR 1.5M',
        priceLabel: 'Starting From',
        button: 'Get Started',
        href: '/contact'
      },
      {
        heading: 'Corporate Comm',
        features:
          'Unlimited User Guide\nAdvanced Security Protocols\nSignature Design\nShared Calendars\nDeliverability Monitoring',
        tier: 'Authority Tier',
        price: 'IDR 4.5M',
        priceLabel: 'Starting From',
        button: 'Professionalize Now',
        href: '/contact',
        featured: true
      },
      {
        heading: 'Secure Infrastructure',
        features: 'Full DLP Setup\nArchival & eDiscovery\nPhishing Simulation\nManaged Security',
        tier: 'Enterprise Tier',
        price: 'Custom Pricing',
        priceLabel: 'Security Focus',
        button: 'Secure My Domain',
        href: '/contact'
      }
    ],
    whyHeading: 'Professionalism by Design',
    whyItems: [
      { icon: 'verified', heading: '100% Trust Factor', body: 'Domain-based identity improves response rates.' },
      { icon: 'security', heading: 'Inbox Defense', body: 'SPF, DKIM, and DMARC for anti-spam deliverability.' },
      { icon: 'laptop_mac', heading: 'Seamless GWS', body: 'Industry-standard collaboration and security tooling.' },
      { icon: 'sync', heading: 'Device Sync', body: 'Perfect sync across desktop and mobile clients.' }
    ],
    lifecycleItems: [
      { icon: 'domain', heading: 'Domain Audit', body: 'DNS health and status checks' },
      { icon: 'badge', heading: 'Identity Setup', body: 'GWS and user provisioning' },
      { icon: 'key', heading: 'Security Protocols', body: 'DKIM, SPF, and DMARC config' },
      { icon: 'move_to_inbox', heading: 'Migration', body: 'Transition existing mailbox data' },
      { icon: 'alternate_email', heading: 'Verification', body: 'Deliverability testing and QA' }
    ],
    ctaHeading: 'Ready to professionalize|your communication?',
    ctaBody: 'Set up secure, high-authority email infrastructure and communicate with confidence.',
    ctaPrimaryLabel: 'Book a Strategy Call',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'Get a Free Technical Audit',
    ctaSecondaryHref: '/contact'
  }
};

const servicePageIds: ServiceDetailPageId[] = [
  'service-website-development',
  'service-custom-business-tools',
  'service-secure-online-shops',
  'service-mobile-business-app',
  'service-official-business-email'
];

function isServiceDetailPageId(id: PageId): id is ServiceDetailPageId {
  return servicePageIds.includes(id as ServiceDetailPageId);
}

type ServiceDetailPageViewProps = {
  page: LandingPage;
};

export function ServiceDetailPageView({ page }: ServiceDetailPageViewProps) {
  if (!isServiceDetailPageId(page.id)) {
    return null;
  }

  const preset = servicePresets[page.id];
  const hero = sectionWithFallback(page, 0, {
    id: 'hero',
    heading: preset.heroHeading,
    body: preset.heroDescription,
    ctaLabel: preset.heroBadge,
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const plans = preset.plans.map((plan, index) =>
    sectionWithFallback(page, index + 1, {
      id: `plan-${index + 1}`,
      heading: plan.heading,
      body: plan.features,
      ctaLabel: plan.tier,
      ctaHref: plan.href,
      mediaAlt: plan.price,
      mediaImage: plan.priceLabel,
      layout: plan.featured ? 'split' : 'stacked',
      theme: { background: '#f9fafb', text: '#111827', accent: plan.button }
    })
  );

  const whyIntro = sectionWithFallback(page, 4, {
    id: 'why-intro',
    heading: preset.whyHeading,
    body: 'Differentiation',
    ctaLabel: 'Differentiation',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const whyItems = preset.whyItems.map((item, index) =>
    sectionWithFallback(page, index + 5, {
      id: `why-${index + 1}`,
      heading: item.heading,
      body: item.body,
      ctaLabel: item.icon,
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  );

  const lifecycleIntro = sectionWithFallback(page, 9, {
    id: 'lifecycle-intro',
    heading: 'Development Lifecycle',
    body: 'Methodology',
    ctaLabel: 'Methodology',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const lifecycleItems = preset.lifecycleItems.map((item, index) =>
    sectionWithFallback(page, index + 10, {
      id: `lifecycle-${index + 1}`,
      heading: item.heading,
      body: item.body,
      ctaLabel: item.icon,
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  );

  const cta = sectionWithFallback(page, 15, {
    id: 'cta',
    heading: preset.ctaHeading,
    body: preset.ctaBody,
    ctaLabel: preset.ctaPrimaryLabel,
    ctaHref: preset.ctaPrimaryHref,
    mediaAlt: preset.ctaSecondaryLabel,
    mediaImage: preset.ctaSecondaryHref,
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, 'Engineering Excellence');
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, 'Digital Growth');

  return (
    <main>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-electricBlue animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">{hero.ctaLabel}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            {heroPrimary}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light pr-4">
              {heroAccent}
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">{hero.body}</p>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => {
              const features = plan.body
                .split(/\n+/)
                .map((row) => row.trim())
                .filter((row) => row.length > 0);
              const featured = plan.layout === 'split';

              return (
                <div
                  className={`glass-panel p-10 rounded-[3rem] bg-white border border-slate-100 flex flex-col h-full relative ${featured ? 'ring-2 ring-electricBlue shadow-2xl scale-105 z-20' : 'z-10'}`}
                  key={plan.id}
                >
                  {featured ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-electricBlue text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                      Top Choice!
                    </div>
                  ) : null}
                  <div className="mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 block">
                      {plan.ctaLabel}
                    </span>
                    <h3 className="text-3xl font-display font-black text-deepSlate">{plan.heading}</h3>
                  </div>
                  <div className="mb-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      {plan.mediaImage || 'Starting From'}
                    </span>
                    <div className="text-4xl font-display font-black text-deepSlate">{plan.mediaAlt || '-'}</div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-grow">
                    {features.map((feature) => (
                      <li className="flex items-center gap-3 text-sm text-slate-500 font-light" key={`${plan.id}-${feature}`}>
                        <span className="material-symbols-outlined text-electricBlue text-lg">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaHref || '/contact'}
                    className={`w-full py-5 rounded-full font-display font-bold text-xs uppercase tracking-[0.2em] text-center transition-all ${featured ? 'bg-deepSlate text-white hover:bg-black shadow-xl' : 'bg-slate-50 text-deepSlate border border-slate-100 hover:bg-white hover:border-electricBlue'}`}
                  >
                    {plan.theme.accent && !plan.theme.accent.startsWith('#') ? plan.theme.accent : preset.plans[index]?.button || 'Select Package'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">
              {whyIntro.ctaLabel || 'Differentiation'}
            </span>
            <h2 className="text-4xl font-display font-black text-deepSlate">{whyIntro.heading}</h2>
            <div className="w-20 h-1 bg-electricBlue mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyItems.map((item) => (
              <div className="glass-panel p-8 rounded-[2rem] bg-white border border-slate-50 hover:shadow-xl transition-all group" key={item.id}>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-electricBlue mb-6 group-hover:bg-electricBlue group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">{item.ctaLabel || 'verified'}</span>
                </div>
                <h4 className="text-lg font-bold text-deepSlate mb-3">{item.heading}</h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">
              {lifecycleIntro.ctaLabel || 'Methodology'}
            </span>
            <h2 className="text-4xl font-display font-black text-deepSlate italic">{lifecycleIntro.heading}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-start relative">
            {lifecycleItems.map((item, index) => (
              <div className="text-center group" key={item.id}>
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-electricBlue group-hover:border-electricBlue transition-all shadow-sm">
                    <span className="material-symbols-outlined text-2xl">{item.ctaLabel || 'code'}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-deepSlate text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-deepSlate mb-2 tracking-tight">{item.heading}</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white w-full shadow-2xl shadow-blue-900/5 border border-white">
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                {ctaPrimary}
                <br />
                <span className="text-brand-gradient italic font-light">{ctaAccent}</span>
              </h2>
              <p className="text-slate-500 text-lg font-light mb-12 max-w-xl mx-auto">{cta.body}</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href={cta.ctaHref || '/contact'} className="px-12 py-5 bg-deepSlate text-white font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-lg shadow-black/10">
                  {cta.ctaLabel || 'Book a Strategy Call'}
                </Link>
                <Link href={cta.mediaImage || '/contact'} className="px-12 py-5 bg-white border-2 border-slate-100 text-deepSlate font-bold text-xs uppercase tracking-[0.2em] hover:border-electricBlue hover:text-electricBlue transition-all rounded-full">
                  {cta.mediaAlt || 'Get a Free Technical Audit'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


