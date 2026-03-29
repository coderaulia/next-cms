import type { CmsContent, LandingPage, PageId, PageSection, SeoFields } from './types';

const nowIso = () => new Date().toISOString();

const section = (
  id: string,
  heading: string,
  body: string,
  options?: Partial<PageSection>
): PageSection => ({
  id,
  heading,
  body,
  ctaLabel: options?.ctaLabel ?? 'Learn more',
  ctaHref: options?.ctaHref ?? '#',
  mediaImage: options?.mediaImage ?? 'https://placehold.co/960x640/png',
  mediaAlt: options?.mediaAlt ?? heading,
  layout: options?.layout ?? 'split',
  theme: {
    background: options?.theme?.background ?? '#f9fafb',
    text: options?.theme?.text ?? '#111827',
    accent: options?.theme?.accent ?? '#0f766e'
  }
});

const seo = (slug: string, title: string, description: string, keywords: string[] = []): SeoFields => ({
  metaTitle: title,
  metaDescription: description,
  slug,
  canonical: '',
  socialImage: 'https://placehold.co/1200x630/png',
  noIndex: false,
  keywords
});

const page = (
  id: PageId,
  title: string,
  navLabel: string,
  description: string,
  sections: PageSection[],
  options?: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  }
): LandingPage => ({
  id,
  title,
  navLabel,
  published: true,
  seo: seo(
    options?.slug ?? (id === 'home' ? '' : id),
    options?.metaTitle ?? `${title} | Example Studio`,
    options?.metaDescription ?? description,
    options?.keywords ?? []
  ),
  sections,
  updatedAt: nowIso()
});
const category = (name: string, slug: string, description: string) => ({
  id: `category-${slug}`,
  name,
  slug,
  description,
  createdAt: nowIso(),
  updatedAt: nowIso()
});

const mediaAsset = (
  id: string,
  title: string,
  url: string,
  altText: string,
  mimeType = 'image/png'
) => ({
  id,
  title,
  url,
  altText,
  mimeType,
  width: 1200,
  height: 630,
  sizeBytes: null,
  storageProvider: 'external-url',
  storageKey: null,
  createdAt: nowIso(),
  updatedAt: nowIso()
});
type ServicePlanSeed = {
  tier: string;
  name: string;
  price: string;
  priceLabel: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

type ServiceListSeed = {
  icon: string;
  title: string;
  text: string;
};

type ServiceDetailSeed = {
  title: string;
  accent: string;
  description: string;
  plans: ServicePlanSeed[];
  whyTitle: string;
  whyItems: ServiceListSeed[];
  lifecycleItems: ServiceListSeed[];
  ctaTitle: string;
  ctaAccent: string;
  ctaDescription: string;
};

const buildServiceDetailSections = (seed: ServiceDetailSeed): PageSection[] => [
  section('hero', `${seed.title}|${seed.accent}`, seed.description, {
    ctaLabel: 'Engineering Excellence Since 2018',
    ctaHref: '/contact',
    layout: 'stacked',
    mediaImage: '',
    mediaAlt: ''
  }),
  ...seed.plans.map((plan, index) =>
    section(`plan-${index + 1}`, plan.name, plan.features.join('\n'), {
      ctaLabel: plan.tier,
      ctaHref: plan.ctaHref,
      mediaAlt: plan.price,
      mediaImage: plan.priceLabel,
      layout: plan.featured ? 'split' : 'stacked',
      theme: { background: '#f9fafb', text: '#111827', accent: plan.ctaLabel }
    })
  ),
  section('why-intro', seed.whyTitle, 'Differentiation', {
    ctaLabel: 'Differentiation',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  }),
  ...seed.whyItems.map((item, index) =>
    section(`why-${index + 1}`, item.title, item.text, {
      ctaLabel: item.icon,
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ),
  section('lifecycle-intro', 'Development Lifecycle', 'Methodology', {
    ctaLabel: 'Methodology',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  }),
  ...seed.lifecycleItems.map((item, index) =>
    section(`lifecycle-${index + 1}`, item.title, item.text, {
      ctaLabel: item.icon,
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ),
  section('cta', `${seed.ctaTitle}|${seed.ctaAccent}`, seed.ctaDescription, {
    ctaLabel: 'Book a Strategy Call',
    ctaHref: '/contact',
    mediaAlt: 'Get a Free Technical Audit',
    mediaImage: '/contact',
    layout: 'stacked'
  })
];

const home = page(
  'home',
  'Faster Tech. Smarter Work. Scaled Results.',
  'Home',
  'Premium engineering-focused digital agency for high-performance infrastructure.',
  [],
  {
    metaTitle: 'Example Studio | Web Development, Custom Software, and Business Automation',
    metaDescription:
      'Example Studio helps businesses scale with high-performance websites, custom software, ecommerce systems, and mobile apps.',
    keywords: [
      'web development agency',
      'custom software development',
      'business automation',
      'mobile app development',
      'ecommerce development',
      'digital agency indonesia'
    ]
  }
);
home.homeBlocks = [
  {
    id: 'home-hero',
    type: 'hero',
    enabled: true,
    theme: 'light',
    badge: 'Premium Digital Consultancy',
    titlePrimary: 'Faster Tech. Smarter Work.',
    titleAccent: 'Scaled Results.',
    description:
      'Example Studio builds the high-performance digital tools your business deserves. We specialize in lightning-fast websites and custom software that automates your unique workflows, giving you the elite-level tech you need at SME-friendly rates.',
    primaryCtaLabel: 'Get a free strategy call',
    primaryCtaHref: '/contact',
    primaryCtaStyle: 'primary',
    secondaryCtaLabel: 'Explore our work',
    secondaryCtaHref: '/service',
    secondaryCtaStyle: 'secondary'
  },
  {
    id: 'home-values',
    type: 'value_triplet',
    enabled: true,
    theme: 'light',
    items: [
      {
        id: 'value-speed',
        icon: 'bolt',
        title: 'Speed',
        text: 'Lightning-fast performance that keeps your customers engaged and improves your search rankings.'
      },
      {
        id: 'value-simplicity',
        icon: 'check_circle',
        title: 'Simplicity',
        text: 'Complex technical problems solved with elegant, easy-to-use interfaces that your team will love.'
      },
      {
        id: 'value-value',
        icon: 'savings',
        title: 'Value',
        text: 'Professional-grade solutions optimized for smart investment, without enterprise pricing.'
      }
    ]
  },
  {
    id: 'home-solutions',
    type: 'solutions_grid',
    enabled: true,
    theme: 'mist',
    heading: 'Our Solutions',
    subheading:
      'Engineered solutions for modern business infrastructure. We build for performance, scale, and uncompromising quality.',
    items: [
      {
        id: 'solution-01',
        number: '01',
        title: 'Professional Business Website',
        text: 'Clean, fast-loading digital authority. We architect modern websites built to convert and scale.',
        ctaLabel: 'Brand authority',
        ctaHref: '/website-development'
      },
      {
        id: 'solution-02',
        number: '02',
        title: 'Custom Business Tools',
        text: 'Bespoke automation systems engineered to streamline internal workflows and reduce operational friction.',
        ctaLabel: 'Automation',
        ctaHref: '/custom-business-tools'
      },
      {
        id: 'solution-03',
        number: '03',
        title: 'Secure Online Shops',
        text: 'Robust commerce systems built for secure payments and performance-driven growth.',
        ctaLabel: 'Revenue growth',
        ctaHref: '/secure-online-shops'
      },
      {
        id: 'solution-04',
        number: '04',
        title: 'Mobile Business App',
        text: 'Professional iOS and Android experiences with responsive architecture and native-feel interaction.',
        ctaLabel: 'Custom access',
        ctaHref: '/mobile-business-app'
      },
      {
        id: 'solution-05',
        number: '05',
        title: 'Official Business Email',
        text: 'Complete domain and email setup engineered for deliverability and professional trust.',
        ctaLabel: 'Professionalization',
        ctaHref: '/official-business-email'
      }
    ]
  },
  {
    id: 'home-why',
    type: 'why_split',
    enabled: true,
    theme: 'blue-soft',
    heading: 'Why Example Studio?',
    description: "We don't just build software; we build the engine for your future growth. Here's what sets our consultancy apart.",
    bullets: [
      {
        id: 'why-1',
        title: 'Innovation Focused on ROI',
        text: 'We prioritize features that drive revenue and efficiency, ensuring your investment pays for itself.'
      },
      {
        id: 'why-2',
        title: '8 Years of Hands-On Expertise',
        text: 'Benefit from years of refined processes and technical mastery in digital delivery.'
      },
      {
        id: 'why-3',
        title: 'Your External Technical Partner',
        text: 'We act as your dedicated CTO extension, so you can focus on running your business.'
      },
      {
        id: 'why-4',
        title: 'Bespoke Strategy for Every Project',
        text: 'No cookie-cutter templates. We design every strategy specifically for your unique goals.'
      },
      {
        id: 'why-5',
        title: 'Premium Quality, Best-Price Guarantee',
        text: 'Top-tier coding standards and design at a price point that makes sense for growing businesses.'
      }
    ],
    mediaImage: '',
    mediaAlt: 'Vanaila digital engineering visual'
  },
  {
    id: 'home-logos',
    type: 'logo_cloud',
    enabled: true,
    theme: 'light',
    heading: 'Trusted by Innovators',
    logos: [
      { id: 'logo-1', name: 'TechWave' },
      { id: 'logo-2', name: 'GlobalCom' },
      { id: 'logo-3', name: 'ApexRetail' },
      { id: 'logo-4', name: 'InnovaHealth' },
      { id: 'logo-5', name: 'Quantum' }
    ],
    primaryCtaLabel: 'View our portfolio',
    primaryCtaHref: '/blog',
    secondaryCtaLabel: "Let's talk growth",
    secondaryCtaHref: '/contact'
  },
  {
    id: 'home-cta',
    type: 'primary_cta',
    enabled: true,
    theme: 'blue-soft',
    heading: 'Ready to Grow?',
    accentText: 'Join the organizations that trust Example Studio.',
    description: "Let's build something that works as hard as you do.",
    ctaLabel: 'Claim free consultation call',
    ctaHref: '/contact',
    ctaStyle: 'primary'
  }
];

const serviceWebsite = page(
  'service-website-development',
  'Website Development',
  'Website Development',
  'Engineering your digital growth with high-performance web architecture.',
  buildServiceDetailSections({
    title: 'Website Development',
    accent: 'Engineering Your Digital Growth',
    description:
      'Transform your online presence into a performance-driven asset. We build infrastructure that scales with your ambition.',
    plans: [
      {
        tier: 'Base Tier',
        name: 'Startup',
        price: 'IDR 3.5M',
        priceLabel: 'Starting From',
        features: ['5 Premium Pages', 'Mobile-First Responsive Design', 'Core Web Vitals Optimized', 'Standard CMS Integration'],
        ctaLabel: 'Select Package',
        ctaHref: '/contact'
      },
      {
        tier: 'Growth Tier',
        name: 'Professional',
        price: 'IDR 7.5M',
        priceLabel: 'Starting From',
        features: ['Up to 12 Advanced Pages', 'Custom UX/UI Research', 'Technical SEO Architecture', 'Conversion Rate Optimization', 'API Integration'],
        ctaLabel: 'Get Started Now',
        ctaHref: '/contact',
        featured: true
      },
      {
        tier: 'Scale Tier',
        name: 'Enterprise',
        price: 'Custom Pricing',
        priceLabel: 'Infrastructure Focus',
        features: ['Unlimited Build & Pages', 'Custom Backend Engineering', 'Enterprise-Grade Security', 'Dedicated DevOps Support'],
        ctaLabel: 'Contact Architecture Team',
        ctaHref: '/contact'
      }
    ],
    whyTitle: 'Why Choose Vanaila?',
    whyItems: [
      { icon: 'schedule', title: '24-Hour SLA', text: 'Critical technical support and updates with guaranteed response windows.' },
      { icon: 'history_edu', title: '8+ Years Pedigree', text: 'A decade of engineering experience building digital assets.' },
      { icon: 'verified', title: 'Best Price Guarantee', text: 'Premium engineering at competitive rates.' },
      { icon: 'hub', title: 'Ecosystem Ready', text: 'Modular builds designed for your existing stack.' }
    ],
    lifecycleItems: [
      { icon: 'search', title: 'Discovery', text: 'Requirements and business audit' },
      { icon: 'architecture', title: 'Architecture', text: 'Technical design and sitemap' },
      { icon: 'code', title: 'Development', text: 'Clean engineering and UI build' },
      { icon: 'fact_check', title: 'QA & Testing', text: 'Stress test and UX validation' },
      { icon: 'rocket_launch', title: 'Deployment', text: 'Go-live and cloud configuration' }
    ],
    ctaTitle: 'Ready to Build Your',
    ctaAccent: 'Digital Future?',
    ctaDescription:
      'Whether you are a scaling startup or an established enterprise, technical clarity will guide your next breakthrough.'
  }),
  {
    slug: 'website-development',
    metaTitle: 'Website Development Services | Fast, SEO-Ready Business Websites',
    metaDescription: 'Get a fast, responsive, SEO-ready business website built for conversions and long-term growth.',
    keywords: ['website development services', 'seo website development', 'business website design', 'fast loading website']
  }
);

const serviceTools = page(
  'service-custom-business-tools',
  'Custom Business Tools',
  'Custom Business Tools',
  'Automate workflows with bespoke internal tools and systems.',
  buildServiceDetailSections({
    title: 'Custom Business Tools',
    accent: 'Automate Your Unique Workflows',
    description:
      'We build bespoke internal tools and automation systems that become the technical backbone of your operations.',
    plans: [
      {
        tier: 'Automation Tier',
        name: 'Process Boost',
        price: 'IDR 5.5M',
        priceLabel: 'Starting From',
        features: ['Workflow Automation', 'Internal Dashboard', 'API Integration', 'Standard Maintenance Support'],
        ctaLabel: 'Select Package',
        ctaHref: '/contact'
      },
      {
        tier: 'Infrastructure Tier',
        name: 'Operational Core',
        price: 'IDR 12.5M',
        priceLabel: 'Starting From',
        features: ['Comprehensive Ops Portal', 'Role-Based Access Control', 'Complex Database Architecture', 'Custom Reporting'],
        ctaLabel: 'Build My System',
        ctaHref: '/contact',
        featured: true
      },
      {
        tier: 'Ecosystem Tier',
        name: 'Enterprise Hub',
        price: 'Custom Pricing',
        priceLabel: 'Architecture Focus',
        features: ['Legacy Modernization', 'Secure Data Pipelines', 'Custom AI Integration', 'Priority Support'],
        ctaLabel: 'Architect Our Solution',
        ctaHref: '/contact'
      }
    ],
    whyTitle: 'Engineered for Efficiency',
    whyItems: [
      { icon: 'bolt', title: 'Rapid ROI', text: 'Tools pay for themselves by reducing manual time.' },
      { icon: 'security', title: 'Bank-Grade Security', text: 'Strict encryption and audit protocols.' },
      { icon: 'settings_suggest', title: 'Custom Tailored', text: 'No generic templates. Built for your logic.' },
      { icon: 'sync_alt', title: 'Ecosystem Integration', text: 'Sync with Slack, GWS, and your CRM stack.' }
    ],
    lifecycleItems: [
      { icon: 'troubleshoot', title: 'Workflow Audit', text: 'Identify manual bottlenecks' },
      { icon: 'schema', title: 'Database Design', text: 'Data integrity architecture' },
      { icon: 'terminal', title: 'Core Engineering', text: 'Bespoke logic and backend' },
      { icon: 'bug_report', title: 'Stress Testing', text: 'QA in real-world scenarios' },
      { icon: 'dns', title: 'Deployment', text: 'Secure migration and training' }
    ],
    ctaTitle: 'Ready to automate your',
    ctaAccent: 'operational friction?',
    ctaDescription: 'Turn technical complexity into a competitive advantage.'
  }),
  {
    slug: 'custom-business-tools',
    metaTitle: 'Custom Business Tools | Workflow Automation and Internal Systems',
    metaDescription: 'Build custom dashboards, internal tools, and workflow automation systems tailored to your business operations.',
    keywords: ['custom business tools', 'workflow automation', 'internal dashboard development', 'business process automation']
  }
);

const serviceShop = page(
  'service-secure-online-shops',
  'Secure Online Shops',
  'Secure Online Shops',
  'Build secure, scalable ecommerce infrastructure for growth.',
  buildServiceDetailSections({
    title: 'Secure Online Shops',
    accent: 'Your 24/7 Global Sales Machine',
    description:
      'We build robust systems designed for conversion and scalability. Secure, fast, and engineered to grow your brand.',
    plans: [
      {
        tier: 'Beginner Started',
        name: 'The Startup Shop',
        price: 'IDR 6.5M',
        priceLabel: 'Starting From',
        features: ['WooCommerce Setup', 'Up to 50 Products', 'WhatsApp Integration', 'Performance Optimization'],
        ctaLabel: 'Select Plan',
        ctaHref: '/contact'
      },
      {
        tier: 'Modern Architecture',
        name: 'The Growth Merchant',
        price: 'IDR 18.5M',
        priceLabel: 'Starting From',
        features: ['Headless Ecommerce', 'Automated Payments', 'Inventory Sync', 'Security Layer', 'Advanced Analytics'],
        ctaLabel: 'Scale My Store',
        ctaHref: '/contact',
        featured: true
      },
      {
        tier: 'Bespoke Ecosystem',
        name: 'The Enterprise Retailer',
        price: 'Custom Pricing',
        priceLabel: 'Architecture Focus',
        features: ['Custom Frontends', 'Native Mobile Apps', 'Loyalty Systems', 'B2B Portals'],
        ctaLabel: 'Consult Enterprise',
        ctaHref: '/contact'
      }
    ],
    whyTitle: 'Built for Reliability & Speed',
    whyItems: [
      { icon: 'verified_user', title: '8+ Years Reliability', text: 'High-uptime sales platforms for diverse industries.' },
      { icon: 'storefront', title: 'Ecosystem Experts', text: 'Seamless local payment and logistics integration.' },
      { icon: 'payments', title: 'Best Price Guarantee', text: 'Maximum performance per cost ratio.' },
      { icon: 'support_agent', title: 'The 24-Hour SLA', text: 'Rapid response for critical ecommerce incidents.' }
    ],
    lifecycleItems: [
      { icon: 'strategy', title: 'Strategy & Audit', text: 'Inventory and goal mapping' },
      { icon: 'storage', title: 'Infrastructure', text: 'Server and stack selection' },
      { icon: 'brush', title: 'UX & Design', text: 'High-conversion interfaces' },
      { icon: 'sync', title: 'Integration', text: 'Payments and logistics sync' },
      { icon: 'rocket', title: 'Launch & Support', text: 'Go-live and maintenance' }
    ],
    ctaTitle: 'Ready to dominate the',
    ctaAccent: 'digital market?',
    ctaDescription: 'Build a shop that sells while you sleep with reliable ecommerce infrastructure.'
  }),
  {
    slug: 'secure-online-shops',
    metaTitle: 'Secure Online Shop Development | Ecommerce Website Solutions',
    metaDescription: 'Launch a secure ecommerce website with reliable payments, inventory sync, and performance-focused architecture.',
    keywords: ['secure online shop', 'ecommerce website development', 'woocommerce development', 'online store security']
  }
);

const serviceMobile = page(
  'service-mobile-business-app',
  'Mobile Business App',
  'Mobile Business App',
  'Deliver high-fidelity mobile apps for iOS and Android.',
  buildServiceDetailSections({
    title: 'Mobile Business App',
    accent: 'Native Power, Cross-Platform Speed',
    description:
      'Reach users where they spend time with native-performing iOS and Android applications from a unified codebase.',
    plans: [
      {
        tier: 'MVP Tier',
        name: 'App Launchpad',
        price: 'IDR 15.0M',
        priceLabel: 'Starting From',
        features: ['React Native Framework', 'iOS & Android', 'Core Business Features', 'Store Deployment'],
        ctaLabel: 'Select Kickstart',
        ctaHref: '/contact'
      },
      {
        tier: 'Engagement Tier',
        name: 'Advanced Native',
        price: 'IDR 35.0M',
        priceLabel: 'Starting From',
        features: ['Custom UI/UX', 'Push Notifications', 'Offline Sync', 'Biometric Auth', 'Store Approval Support'],
        ctaLabel: 'Build Premium App',
        ctaHref: '/contact',
        featured: true
      },
      {
        tier: 'Ecosystem Tier',
        name: 'Enterprise Native',
        price: 'Custom Pricing',
        priceLabel: 'Infrastructure Focus',
        features: ['Complex Backend Integration', 'Payment SDKs', 'Custom Analytics', 'Multi-Region Hosting'],
        ctaLabel: 'Consult Architect',
        ctaHref: '/contact'
      }
    ],
    whyTitle: 'Why Go Mobile with Us?',
    whyItems: [
      { icon: 'speed', title: 'Single Base, Dual Power', text: 'One codebase for both iOS and Android.' },
      { icon: 'vibration', title: 'High-Fidelity UX', text: 'Native-feel navigation and smooth interactions.' },
      { icon: 'cloud_done', title: 'Cloud-Synced', text: 'Real-time sync between web and mobile.' },
      { icon: 'verified', title: 'App Store Ready', text: 'We handle submission and optimization flows.' }
    ],
    lifecycleItems: [
      { icon: 'draw', title: 'UX Wireframing', text: 'User journey and interaction design' },
      { icon: 'phone_android', title: 'Native Dev', text: 'Cross-platform programming' },
      { icon: 'api', title: 'Backend Bridge', text: 'API and infrastructure sync' },
      { icon: 'touch_app', title: 'Alpha/Beta Test', text: 'Feedback-driven quality loops' },
      { icon: 'publish', title: 'Store Launch', text: 'Deployment to app stores' }
    ],
    ctaTitle: 'Ready to put your brand',
    ctaAccent: 'in their pocket?',
    ctaDescription: 'Discuss your mobile strategy and start building high-performance apps today.'
  }),
  {
    slug: 'mobile-business-app',
    metaTitle: 'Mobile Business App Development | iOS and Android Solutions',
    metaDescription: 'Develop mobile business apps for iOS and Android with scalable backend integration and smooth user experience.',
    keywords: ['mobile app development', 'ios android app', 'react native development', 'business mobile app']
  }
);

const serviceEmail = page(
  'service-official-business-email',
  'Official Business Email',
  'Official Business Email',
  'Professional business email infrastructure with deliverability and security.',
  buildServiceDetailSections({
    title: 'Official Business Email',
    accent: 'Establish Instant Trust & Authority',
    description:
      'We architect professional Google Workspace and custom domain email infrastructure for secure business communication.',
    plans: [
      {
        tier: 'Starter Tier',
        name: 'Pro Identity',
        price: 'IDR 1.5M',
        priceLabel: 'Starting From',
        features: ['GWS Setup', 'DNS Configuration', 'Email Migration Support', 'Spam Protection'],
        ctaLabel: 'Get Started',
        ctaHref: '/contact'
      },
      {
        tier: 'Authority Tier',
        name: 'Corporate Comm',
        price: 'IDR 4.5M',
        priceLabel: 'Starting From',
        features: ['Unlimited User Guide', 'Advanced Security Protocols', 'Signature Design', 'Shared Calendars', 'Deliverability Monitoring'],
        ctaLabel: 'Professionalize Now',
        ctaHref: '/contact',
        featured: true
      },
      {
        tier: 'Enterprise Tier',
        name: 'Secure Infrastructure',
        price: 'Custom Pricing',
        priceLabel: 'Security Focus',
        features: ['Full DLP Setup', 'Archival & eDiscovery', 'Phishing Simulation', 'Managed Security'],
        ctaLabel: 'Secure My Domain',
        ctaHref: '/contact'
      }
    ],
    whyTitle: 'Professionalism by Design',
    whyItems: [
      { icon: 'verified', title: '100% Trust Factor', text: 'Domain-based identity improves response rates.' },
      { icon: 'security', title: 'Inbox Defense', text: 'SPF, DKIM, and DMARC for anti-spam deliverability.' },
      { icon: 'laptop_mac', title: 'Seamless GWS', text: 'Industry-standard collaboration and security tooling.' },
      { icon: 'sync', title: 'Device Sync', text: 'Perfect sync across desktop and mobile clients.' }
    ],
    lifecycleItems: [
      { icon: 'domain', title: 'Domain Audit', text: 'DNS health and status checks' },
      { icon: 'badge', title: 'Identity Setup', text: 'GWS and user provisioning' },
      { icon: 'key', title: 'Security Protocols', text: 'DKIM, SPF, and DMARC config' },
      { icon: 'move_to_inbox', title: 'Migration', text: 'Transition existing mailbox data' },
      { icon: 'alternate_email', title: 'Verification', text: 'Deliverability testing and QA' }
    ],
    ctaTitle: 'Ready to professionalize',
    ctaAccent: 'your communication?',
    ctaDescription: 'Set up secure, high-authority email infrastructure and communicate with confidence.'
  }),
  {
    slug: 'official-business-email',
    metaTitle: 'Official Business Email Setup | Secure Domain Email Infrastructure',
    metaDescription: 'Set up secure domain-based business email with SPF, DKIM, and DMARC for stronger trust and deliverability.',
    keywords: ['business email setup', 'domain email setup', 'google workspace setup', 'spf dkim dmarc']
  }
);

const partnership = page(
  'partnership',
  'Partnership Program',
  'Partnership',
  'Join our technical alliance and referral partner network.',
  [
    section('hero', 'Build the Future|Scale with Vanaila.', 'Join our network of elite technical agencies and referral partners. Let us deliver extraordinary digital infrastructure together.', {
      ctaLabel: 'Ecosystem Partnership',
      ctaHref: '/partnership',
      layout: 'stacked',
      mediaImage: '',
      mediaAlt: ''
    }),
    section('program-intro', 'Partnership Tracks', 'Choose the model that fits your team and growth strategy.', {
      ctaLabel: 'Program',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('program-1', 'Referral Alpha', 'Earn commissions by connecting clients with our engineering services.', {
      ctaLabel: 'handshake',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('program-2', 'Technical Alliance', 'Embed our lead architects into your project workflow with white-label support.', {
      ctaLabel: 'hub',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'split'
    }),
    section('program-3', 'Service Expansion', 'Offer cloud infra and mobile app delivery under your own brand.', {
      ctaLabel: 'rocket_launch',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('standards-intro', 'Our Selection Standard', 'We partner with teams that share our standards for engineering quality.', {
      ctaLabel: 'Standards',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('standard-1', 'Excellence', 'Proven high-performance delivery track record.', {
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('standard-2', 'Integrity', 'Transparent communication and milestone discipline.', {
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('standard-3', 'Innovation', 'Commitment to modern stacks and cloud-native delivery.', {
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('standard-4', 'Growth', 'Long-term vision for mutual ecosystem expansion.', {
      ctaLabel: '04',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('perks-intro', 'Ecosystem Perks', 'Beyond collaboration, we provide resources for partners to thrive.', {
      ctaLabel: 'Perks',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('perk-1', 'Architecture Audits', 'Free consultation for complex cloud infrastructure designs.', {
      ctaLabel: 'architecture',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('perk-2', 'Priority Support', 'Direct line to senior architects for emergency escalations.', {
      ctaLabel: 'monitoring',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('perk-3', 'Co-Marketing', 'Join webinars and white papers to boost visibility.', {
      ctaLabel: 'local_atm',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    section('cta', 'Ready to Build Partner Value?|Join our ecosystem network.', 'Tell us your capabilities and we will map the best collaboration model for your team.', {
      ctaLabel: 'Start Partnership Discussion',
      ctaHref: '/contact',
      mediaAlt: '',
      mediaImage: '',
      layout: 'stacked'
    })
  ],
  {
    slug: 'partnership',
    metaTitle: 'Partnership Program | Agency and Technical Alliance with Example Studio',
    metaDescription: 'Partner with Example Studio through referral and technical alliance programs to deliver high-performance solutions.',
    keywords: ['digital agency partnership', 'technical alliance program', 'referral partnership', 'white label development']
  }
);

export const defaultContent: CmsContent = {
  settings: {
    general: {
      siteName: 'Example Studio.',
      siteTagline: 'Engineering-focused digital agency for ambitious brands.',
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      adminEmail: process.env.CMS_ADMIN_EMAIL ?? 'hello@example.com',
      timezone: process.env.CMS_TIMEZONE ?? 'Asia/Jakarta',
      language: 'en-US',
      dateFormat: 'MMMM d, yyyy',
      timeFormat: 'HH:mm',
      weekStartsOn: 1
    },
    navigation: {
      headerLinks: [
        { id: 'nav-home', label: 'Home', href: '/', enabled: true },
        { id: 'nav-about', label: 'About', href: '/about', enabled: true },
        { id: 'nav-services', label: 'Services', href: '/service', enabled: true },
        { id: 'nav-insights', label: 'Insights', href: '/blog', enabled: true },
        { id: 'nav-partnership', label: 'Partnership', href: '/partnership', enabled: true },
        { id: 'nav-portfolio', label: 'Portfolio', href: '/portfolio', enabled: true }
      ],
      headerCtaLabel: 'Book Consultation',
      headerCtaHref: '/contact',
      footerNavigatorLinks: [
        { id: 'footer-nav-home', label: 'Home', href: '/', enabled: true },
        { id: 'footer-nav-about', label: 'About Us', href: '/about', enabled: true },
        { id: 'footer-nav-services', label: 'Services', href: '/service', enabled: true },
        { id: 'footer-nav-insights', label: 'Insights', href: '/blog', enabled: true },
        { id: 'footer-nav-partnership', label: 'Partnership', href: '/partnership', enabled: true },
        { id: 'footer-nav-contact', label: 'Contact', href: '/contact', enabled: true },
        { id: 'footer-nav-portfolio', label: 'Portfolio', href: '/portfolio', enabled: true }
      ],
      footerServiceLinks: [
        { id: 'footer-service-web', label: 'Website Development', href: '/website-development', enabled: true },
        { id: 'footer-service-shop', label: 'Secure Online Shops', href: '/secure-online-shops', enabled: true },
        { id: 'footer-service-mobile', label: 'Mobile Business App', href: '/mobile-business-app', enabled: true },
        { id: 'footer-service-email', label: 'Official Business Email', href: '/official-business-email', enabled: true },
        { id: 'footer-service-tools', label: 'Custom Business Tools', href: '/custom-business-tools', enabled: true }
      ]
    },
    contact: {
      companyName: 'Example Studio LLC',
      addressLine1: '123 Example Avenue',
      addressLine2: 'Remote-first team, Global delivery',
      globalReachLabel: 'Global Reach',
      globalReachText: 'Supporting partners across SEA, Europe, and North America.',
      emailLabel: 'Email Us',
      emailValue: 'hello@example.com',
      emailHref: 'mailto:hello@example.com',
      whatsappLabel: 'WhatsApp Business',
      whatsappValue: '+62 800 0000 0000',
      whatsappHref: 'https://wa.me/620000000000',
      instagramLabel: 'Instagram',
      instagramValue: '@example.studio',
      instagramHref: 'https://instagram.com/example.studio'
    },
    social: {
      chatHref: '/contact',
      instagramHref: 'https://instagram.com/example.studio',
      websiteHref: 'https://example.com',
      emailHref: 'mailto:hello@example.com'
    },
    branding: {
      headerLogo: '',
      footerLogo: '',
      siteIcon: '',
      footerTagline: 'Engineering-focused digital agency delivering high-performance infrastructure.',
      footerBadgePrimary: 'Glassmorphism Edition',
      footerBadgeSecondary: 'Premium Engineering',
      copyrightText: '© 2026 Example Studio.'
    },
    writing: {
      defaultPostCategory: 'general',
      defaultPostFormat: 'standard',
      defaultPostStatus: 'draft',
      defaultPostAuthor: 'Admin',
      convertEmoticons: true,
      requireReviewBeforePublish: false,
      pingServices: ['https://rpc.pingomatic.com/']
    },
    reading: {
      homepageDisplay: 'static_page',
      homepagePageId: 'home',
      postsPageId: '',
      postsPerPage: 10,
      feedItems: 10,
      feedSummary: 'excerpt',
      discourageSearchEngines: false
    },
    discussion: {
      commentsEnabled: false,
      commentRegistrationRequired: false,
      closeCommentsAfterDays: 30,
      threadedCommentsEnabled: true,
      threadDepth: 3,
      requireCommentApproval: true,
      notifyOnComment: true
    },
    media: {
      uploadOrganizeByMonth: true,
      thumbnailWidth: 300,
      thumbnailHeight: 300,
      mediumMaxWidth: 768,
      mediumMaxHeight: 768,
      largeMaxWidth: 1600,
      largeMaxHeight: 1600
    },
    permalinks: {
      postPermalinkStructure: '/blog/%postname%',
      categoryBase: 'category',
      tagBase: 'tag'
    },
    seo: {
      titleTemplate: '%page_title% | %site_name%',
      defaultMetaDescription: 'Engineering-led digital systems for growth-focused businesses.',
      defaultOgImage: 'https://placehold.co/1200x630/png',
      defaultNoIndex: false
    },
    sitemap: {
      enabled: true,
      includePages: true,
      includePosts: true,
      includePortfolio: true,
      includeLastModified: true
    },
    siteName: 'Example Studio.',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    organizationName: process.env.CMS_ORG_NAME ?? 'Example Studio',
    organizationLogo: process.env.CMS_ORG_LOGO ?? '',
    defaultOgImage: 'https://placehold.co/1200x630/png'
  },
  pages: {
    home,
    about: page(
      'about',
      'About Our Team',
      'About',
      'Meet the team behind your website growth system.',
      [
        section(
          'about-story',
          'A practical team focused on execution',
          'We combine content, engineering, and SEO to deliver compounding results for service businesses.',
          {
            ctaLabel: 'Read our blog',
            ctaHref: '/blog'
          }
        )
      ],
      {
        metaTitle: 'About Example Studio | Engineering-First Digital Partner',
        metaDescription:
          'Learn about Example Studio, an engineering-first team building scalable websites, software products, and growth systems.',
        keywords: ['about vanaila digital', 'digital engineering team', 'website development partner', 'custom software team']
      }
    ),
    service: page(
      'service',
      'Services',
      'Services',
      'Website and growth services built for modern marketing teams.',
      [
        section(
          'service-offers',
          'Services built for measurable growth',
          'We provide page strategy, CMS implementation, technical SEO, and analytics reporting.',
          {
            ctaLabel: 'Start a project',
            ctaHref: '/contact'
          }
        )
      ],
      {
        metaTitle: 'Digital Services | Website, Custom Software, Ecommerce, Mobile Apps',
        metaDescription:
          'Explore Example Studio services including website development, custom tools, ecommerce, mobile apps, and business email setup.',
        keywords: ['digital services', 'website development services', 'custom software services', 'ecommerce development', 'mobile app services']
      }
    ),
    'service-website-development': serviceWebsite,
    'service-custom-business-tools': serviceTools,
    'service-secure-online-shops': serviceShop,
    'service-mobile-business-app': serviceMobile,
    'service-official-business-email': serviceEmail,
    partnership,
    contact: page(
      'contact',
      'Contact',
      'Contact',
      'Get in touch to discuss your next campaign or website project.',
      [
        section(
          'contact-form',
          'Let us know your goals',
          'Share your current website, timeline, and business target. We will respond with a practical plan.',
          {
            ctaLabel: 'Send inquiry',
            ctaHref: 'mailto:hello@example.com'
          }
        )
      ],
      {
        metaTitle: 'Contact Example Studio | Book a Strategy Call',
        metaDescription:
          'Contact Example Studio to discuss your website, software, or automation goals and get a practical implementation plan.',
        keywords: ['contact vanaila digital', 'book strategy call', 'web development consultation', 'software consultation']
      }
    )
  },
  blogPosts: [
    {
      id: 'post-1',
      title: 'How to Structure a High-Converting Service Landing Page',
      excerpt:
        'A practical structure for hero sections, proof blocks, and conversion paths that increase lead quality.',
      content: `# Why structure matters

High-converting pages are clear, specific, and fast.

## Recommended flow

1. Hero with clear value proposition
2. Social proof
3. Service detail with outcomes
4. CTA with low friction

Keep sections simple and measurable.`,
      author: 'Editorial Team',
      tags: ['engineering', 'performance', 'seo'],
      coverImage: 'https://placehold.co/1200x630/png',
      status: 'published',
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'How to Structure a High-Converting Service Landing Page',
        metaDescription:
          'Use this framework to build service pages that improve conversion and organic visibility.',
        slug: 'high-converting-service-landing-page',
        canonical: '',
        socialImage: 'https://placehold.co/1200x630/png',
        noIndex: false,
        keywords: ['service landing page', 'conversion optimization', 'technical seo']
      }
    },
    {
      id: 'post-2',
      title: 'Editorial Workflow Checklist for Marketing Teams',
      excerpt:
        'Set up a draft-to-publish workflow in your CMS so non-technical teams can ship content confidently.',
      content: `# Editorial workflow

Use statuses, approvals, and clear owners.

Draft quickly, review carefully, then publish with SEO checks.`,
      author: 'Editorial Team',
      tags: ['workflow', 'cms'],
      coverImage: 'https://placehold.co/1200x630/png',
      status: 'draft',
      publishedAt: null,
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Editorial Workflow Checklist for Marketing Teams',
        metaDescription: 'A clear CMS workflow that supports consistent publishing quality.',
        slug: 'editorial-workflow-checklist',
        canonical: '',
        socialImage: 'https://placehold.co/1200x630/png',
        noIndex: false,
        keywords: ['editorial workflow', 'cms publishing', 'content operations']
      }
    }
  ],
  portfolioProjects: [
    {
      id: 'portfolio-assessment-app',
      title: 'Assessment App',
      summary:
        'Custom web application built for psychologists to collect structured socio-cultural research data. The product was later discontinued in 2022 after the research cycle ended.',
      challenge:
        'The research team needed a secure and easy way to distribute assessments, capture participant responses, and reduce manual spreadsheet handling during the data-collection phase.',
      solution:
        'We designed a custom web app with guided participant flows, form-based intake screens, and a lightweight admin workflow that made field data collection easier for non-technical researchers.',
      outcome:
        'The team gained a cleaner collection workflow for research operations. The platform is now inactive because the program concluded in 2022, but it remains a strong example of a purpose-built internal application.',
      clientName: 'Assessment App',
      serviceType: 'Custom Web App',
      industry: 'Psychology Research',
      projectUrl: '/custom-business-tools',
      relatedServicePageIds: ['service-custom-business-tools'],
      coverImage: '/portfolio/assessment-app-cover.svg',
      gallery: ['/portfolio/assessment-app-cover.svg'],
      tags: ['Custom App', 'Research', 'Psychology'],
      featured: false,
      status: 'published',
      sortOrder: 2,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Assessment App Case Study | Research Data Collection Web App',
        metaDescription:
          'Case study of a custom assessment web app built to help psychologists collect structured research data more efficiently.',
        slug: 'assessment-app',
        canonical: '',
        socialImage: '/portfolio/assessment-app-cover.svg',
        noIndex: false,
        keywords: ['assessment web app', 'research data collection', 'psychology app', 'custom web app']
      }
    },
    {
      id: 'portfolio-biliamind',
      title: 'Biliamind',
      summary:
        'Learning management website designed to publish mentor-led courses, course listings, and educational landing pages in a clean commercial format.',
      challenge:
        'The brand needed a structured web presence that could present courses clearly, support conversion-oriented messaging, and make the learning offer easier to browse.',
      solution:
        'We built a polished LMS-style website layout with content hierarchy for courses, mentors, and learning benefits, keeping the interface approachable for first-time visitors.',
      outcome:
        'Biliamind gained a clearer online storefront for digital learning offers and a stronger foundation for content-driven growth.',
      clientName: 'Biliamind',
      serviceType: 'Website Development',
      industry: 'Education',
      projectUrl: '/website-development',
      relatedServicePageIds: ['service-website-development'],
      coverImage: '/portfolio/biliamind-cover.svg',
      gallery: ['/portfolio/biliamind-cover.svg'],
      tags: ['LMS', 'Education', 'Website'],
      featured: false,
      status: 'published',
      sortOrder: 3,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Biliamind Case Study | LMS Website Development',
        metaDescription:
          'LMS website case study for Biliamind, focused on course presentation, educational content structure, and lead generation.',
        slug: 'biliamind',
        canonical: '',
        socialImage: '/portfolio/biliamind-cover.svg',
        noIndex: false,
        keywords: ['lms website', 'education website', 'course platform', 'website development']
      }
    },
    {
      id: 'portfolio-greenretech',
      title: 'Greenretech',
      summary:
        'WooCommerce website created to sell wood pellet products to international buyers with a cleaner product showcase and export-oriented positioning.',
      challenge:
        'The business needed a professional ecommerce presence that could communicate product credibility, showcase catalog information, and support international buying interest.',
      solution:
        'We built a WooCommerce-based storefront with product sections, trust messaging, and a global-friendly presentation tailored to industrial export customers.',
      outcome:
        'Greenretech gained a more credible ecommerce channel for premium wood pellet sales and a stronger digital presentation for international inquiries.',
      clientName: 'Greenretech',
      serviceType: 'Secure Online Shops',
      industry: 'Energy Export',
      projectUrl: '/secure-online-shops',
      relatedServicePageIds: ['service-secure-online-shops'],
      coverImage: '/portfolio/greenretech-cover.svg',
      gallery: ['/portfolio/greenretech-cover.svg'],
      tags: ['WooCommerce', 'Ecommerce', 'Export'],
      featured: false,
      status: 'published',
      sortOrder: 4,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Greenretech Case Study | WooCommerce Export Website',
        metaDescription:
          'WooCommerce case study for Greenretech, built to sell wood pellet products for international customers with a professional ecommerce experience.',
        slug: 'greenretech',
        canonical: '',
        socialImage: '/portfolio/greenretech-cover.svg',
        noIndex: false,
        keywords: ['woocommerce website', 'export ecommerce', 'wood pellet website', 'online shop']
      }
    },
    {
      id: 'portfolio-hr-performance',
      title: 'HR Performance',
      summary:
        'Custom HR performance suite for KPI management, analytics dashboards, employee performance tracking, and training need analysis.',
      challenge:
        'The organization needed a centralized internal system to manage KPI measurement, reporting visibility, and competency tracking across teams.',
      solution:
        'We developed a custom web application with performance dashboards, KPI management modules, records, and role-based operational views for HR workflows.',
      outcome:
        'HR teams received a dedicated internal platform to monitor performance and training priorities with clearer reporting and operational consistency.',
      clientName: 'HR Performance',
      serviceType: 'Custom Web App',
      industry: 'Human Resources',
      projectUrl: '/custom-business-tools',
      relatedServicePageIds: ['service-custom-business-tools'],
      coverImage: '/portfolio/hr-performance-cover.svg',
      gallery: ['/portfolio/hr-performance-cover.svg'],
      tags: ['HR System', 'Analytics', 'Custom App'],
      featured: true,
      status: 'published',
      sortOrder: 1,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'HR Performance Case Study | KPI and HR Analytics System',
        metaDescription:
          'Custom HR system case study covering KPI management, analytics dashboards, employee performance monitoring, and training need analysis.',
        slug: 'hr-performance',
        canonical: '',
        socialImage: '/portfolio/hr-performance-cover.svg',
        noIndex: false,
        keywords: ['hr system', 'kpi dashboard', 'performance management', 'custom web app']
      }
    },
    {
      id: 'portfolio-langgeng-sejahtera',
      title: 'Langgeng Sejahtera',
      summary:
        'Company profile website for a furniture manufacturing business, designed to present operations, capabilities, and brand credibility online.',
      challenge:
        'The company needed a more professional digital presence to explain its manufacturing background and support trust with prospective business partners.',
      solution:
        'We produced a structured company profile website with a stronger visual hierarchy, corporate storytelling, and clear access points for business inquiries.',
      outcome:
        'Langgeng Sejahtera gained a more polished company profile site that better communicates its manufacturing identity and business positioning.',
      clientName: 'Langgeng Sejahtera',
      serviceType: 'Website Development',
      industry: 'Furniture Manufacturing',
      projectUrl: '/website-development',
      relatedServicePageIds: ['service-website-development'],
      coverImage: '/portfolio/langgeng-sejahtera-cover.svg',
      gallery: ['/portfolio/langgeng-sejahtera-cover.svg'],
      tags: ['Company Profile', 'Manufacturing', 'Website'],
      featured: false,
      status: 'published',
      sortOrder: 5,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Langgeng Sejahtera Case Study | Company Profile Website',
        metaDescription:
          'Company profile website case study for Langgeng Sejahtera, focused on corporate credibility, business storytelling, and lead-ready presentation.',
        slug: 'langgeng-sejahtera',
        canonical: '',
        socialImage: '/portfolio/langgeng-sejahtera-cover.svg',
        noIndex: false,
        keywords: ['company profile website', 'manufacturing website', 'corporate website', 'website development']
      }
    },
    {
      id: 'portfolio-maza-adventure',
      title: 'Maza Adventure',
      summary:
        'Company profile website for an event and tour organizer, featuring outdoor programs, travel packages, and a more energetic visual direction.',
      challenge:
        'The brand needed a modern web presence that could showcase experiences, build trust quickly, and make the core programs easier to understand online.',
      solution:
        'We built a tourism-focused company profile website with hero storytelling, program highlights, and clearer pathways for potential customers to explore activities.',
      outcome:
        'Maza Adventure gained a stronger promotional website that presents its event and tour services with more confidence and clearer conversion paths.',
      clientName: 'Maza Adventure',
      serviceType: 'Website Development',
      industry: 'Tourism & Events',
      projectUrl: '/website-development',
      relatedServicePageIds: ['service-website-development'],
      coverImage: '/portfolio/maza-adventure-cover.svg',
      gallery: ['/portfolio/maza-adventure-cover.svg'],
      tags: ['Tourism', 'Events', 'Website'],
      featured: false,
      status: 'published',
      sortOrder: 6,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Maza Adventure Case Study | Tour Organizer Website',
        metaDescription:
          'Website case study for Maza Adventure, built to present event and tour programs with clearer storytelling and conversion-focused structure.',
        slug: 'maza-adventure',
        canonical: '',
        socialImage: '/portfolio/maza-adventure-cover.svg',
        noIndex: false,
        keywords: ['tour website', 'event organizer website', 'travel company profile', 'website development']
      }
    },
    {
      id: 'portfolio-rumah-psikologi',
      title: 'Rumah Psikologi',
      summary:
        'Company profile website for a psychology practice, designed to communicate services, consultation pathways, and a calm approachable brand identity.',
      challenge:
        'The practice needed a friendlier and more trustworthy website to introduce its services and help visitors understand how to start a consultation.',
      solution:
        'We created a soft visual system and a structured company profile website that highlights the practice, service offerings, and primary consultation actions.',
      outcome:
        'Rumah Psikologi gained a clearer digital front door for prospective clients and a more approachable service presentation.',
      clientName: 'Rumah Psikologi',
      serviceType: 'Website Development',
      industry: 'Psychology Practice',
      projectUrl: '/website-development',
      relatedServicePageIds: ['service-website-development'],
      coverImage: '/portfolio/rumah-psikologi-cover.svg',
      gallery: ['/portfolio/rumah-psikologi-cover.svg'],
      tags: ['Psychology', 'Company Profile', 'Website'],
      featured: false,
      status: 'published',
      sortOrder: 7,
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Rumah Psikologi Case Study | Psychology Practice Website',
        metaDescription:
          'Psychology company profile website case study focused on service clarity, trust-building, and consultation readiness.',
        slug: 'rumah-psikologi',
        canonical: '',
        socialImage: '/portfolio/rumah-psikologi-cover.svg',
        noIndex: false,
        keywords: ['psychology website', 'company profile website', 'consultation website', 'website development']
      }
    }
  ],  categories: [
    category('General', 'general', 'Default publishing category for uncategorized content.'),
    category('Engineering', 'engineering', 'Technical engineering insights and implementation notes.'),
    category('Performance', 'performance', 'Web performance, speed, and optimization topics.'),
    category('SEO', 'seo', 'Technical SEO and discoverability guidance.'),
    category('Workflow', 'workflow', 'Operational workflows, editorial process, and CMS governance.'),
    category('CMS', 'cms', 'Content management implementation and admin UX topics.')
  ],
  mediaAssets: [
    mediaAsset(
      'media-default-og',
      'Default Open Graph',
      'https://placehold.co/1200x630/png',
      'Default social sharing image'
    ),
    mediaAsset(
      'media-brand-mark',
      'Vanaila Brand Mark',
      'https://placehold.co/240x80/png',
      'Example Studio brand mark'
    ),
    mediaAsset(
      'media-blog-cover',
      'Blog Cover Placeholder',
      'https://placehold.co/1200x630/png',
      'Generic blog cover placeholder'
    )
  ]
};














