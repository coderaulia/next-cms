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

const seo = (slug: string, title: string, description: string): SeoFields => ({
  metaTitle: title,
  metaDescription: description,
  slug,
  canonical: '',
  socialImage: 'https://placehold.co/1200x630/png',
  noIndex: false
});

const page = (
  id: PageId,
  title: string,
  navLabel: string,
  description: string,
  sections: PageSection[],
  options?: { slug?: string }
): LandingPage => ({
  id,
  title,
  navLabel,
  published: true,
  seo: seo(options?.slug ?? (id === 'home' ? '' : id), `${title} | Vanaila Digital`, description),
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
  []
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
      'Vanaila Digital builds the high-performance digital tools your business deserves. We specialize in lightning-fast websites and custom software that automates your unique workflows, giving you the elite-level tech you need at SME-friendly rates.',
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
    heading: 'Why Vanaila Digital?',
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
    accentText: 'Join the organizations that trust Vanaila Digital.',
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
  { slug: 'website-development' }
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
  { slug: 'custom-business-tools' }
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
  { slug: 'secure-online-shops' }
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
  { slug: 'mobile-business-app' }
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
  { slug: 'official-business-email' }
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
  { slug: 'partnership' }
);

export const defaultContent: CmsContent = {
  settings: {
    general: {
      siteName: 'Vanaila Digital.',
      siteTagline: 'Engineering-focused digital agency for ambitious brands.',
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      adminEmail: process.env.CMS_ADMIN_EMAIL ?? 'care@vanaila.com',
      timezone: process.env.CMS_TIMEZONE ?? 'Asia/Jakarta',
      language: 'en-US',
      dateFormat: 'MMMM d, yyyy',
      timeFormat: 'HH:mm',
      weekStartsOn: 1
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
      includeLastModified: true
    },
    siteName: 'Vanaila Digital.',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    organizationName: process.env.CMS_ORG_NAME ?? 'Vanaila Digital',
    organizationLogo: process.env.CMS_ORG_LOGO ?? 'https://placehold.co/120x120/png',
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
      ]
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
      ]
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
      ]
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
        noIndex: false
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
        noIndex: false
      }
    }
  ],
  categories: [
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
      'Vanaila Digital brand mark'
    ),
    mediaAsset(
      'media-blog-cover',
      'Blog Cover Placeholder',
      'https://placehold.co/1200x630/png',
      'Generic blog cover placeholder'
    )
  ]
};

