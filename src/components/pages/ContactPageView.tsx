import Link from 'next/link';

import { ContactBriefForm } from '@/components/forms/ContactBriefForm';
import type { LandingPage, SiteSettings } from '@/features/cms/types';

import { sectionWithFallback, splitAccent } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type ContactPageViewProps = {
  page: LandingPage;
  settings?: Pick<SiteSettings, 'contact'>;
};

export function ContactPageView({ page, settings }: ContactPageViewProps) {
  const contactSettings = settings?.contact;

  const hero = sectionWithFallback(page, 0, {
    id: 'contact-hero',
    heading: "Let's Build Your|Digital Edge",
    body: 'From high-performance web applications to enterprise-grade architectures, we turn technical complexity into business advantage.',
    ctaLabel: 'Connect with the lab',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const brief = sectionWithFallback(page, 1, {
    id: 'contact-brief',
    heading: 'Strategic Brief',
    body: "Tell us about your mission. We'll analyze your needs and respond within 24 business hours.",
    ctaLabel: 'Submit Project Brief',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: 'Response in 24 business hours',
    layout: 'stacked'
  });
  const meet = sectionWithFallback(page, 2, {
    id: 'contact-meet',
    heading: 'Prefer a face-to-face|discussion?',
    body: "Skip the form and jump straight into a strategy session. We'll explore your technical requirements and business goals in real-time.",
    ctaLabel: 'Book a Google Meet Session',
    ctaHref: contactSettings?.emailHref || 'mailto:hello@example.com?subject=Google%20Meet%20Consultation',
    mediaImage: '',
    mediaAlt: 'Instant Booking',
    layout: 'split'
  });
  const bookingOne = sectionWithFallback(page, 3, {
    id: 'contact-booking-1',
    heading: '30-minute technical evaluation',
    body: '',
    ctaLabel: 'check',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const bookingTwo = sectionWithFallback(page, 4, {
    id: 'contact-booking-2',
    heading: 'Direct access to lead architects',
    body: '',
    ctaLabel: 'check',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const bookingThree = sectionWithFallback(page, 5, {
    id: 'contact-booking-3',
    heading: 'No-obligation consultation',
    body: '',
    ctaLabel: 'check',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const company = sectionWithFallback(page, 6, {
    id: 'contact-company',
    heading: contactSettings?.companyName || 'Example Studio LLC',
    body: `${contactSettings?.addressLine1 || '123 Example Avenue'}\n${
      contactSettings?.addressLine2 || 'Remote-first team, Global delivery'
    }\n\n${contactSettings?.globalReachLabel || 'Global reach'}\n${
      contactSettings?.globalReachText || 'Supporting partners across SEA, Europe, and North America.'
    }`,
    ctaLabel: '',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const email = sectionWithFallback(page, 7, {
    id: 'contact-email',
    heading: contactSettings?.emailLabel || 'Email Us',
    body: contactSettings?.emailValue || 'hello@example.com',
    ctaLabel: 'alternate_email',
    ctaHref: contactSettings?.emailHref || 'mailto:hello@example.com',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const whatsapp = sectionWithFallback(page, 8, {
    id: 'contact-whatsapp',
    heading: contactSettings?.whatsappLabel || 'WhatsApp Business',
    body: contactSettings?.whatsappValue || '+62 800 0000 0000',
    ctaLabel: 'chat',
    ctaHref: contactSettings?.whatsappHref || 'https://wa.me/620000000000',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const instagram = sectionWithFallback(page, 9, {
    id: 'contact-instagram',
    heading: contactSettings?.instagramLabel || 'Instagram',
    body: contactSettings?.instagramValue || '@example.studio',
    ctaLabel: 'photo_camera',
    ctaHref: contactSettings?.instagramHref || 'https://instagram.com/example.studio',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, 'Digital Edge');
  const { primary: meetPrimary, accent: meetAccent } = splitAccent(meet.heading, 'discussion?');

  const companyLines = company.body.split(/\n+/).map((row) => row.trim()).filter((row) => row.length > 0);

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-electricBlue animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">
              {hero.ctaLabel || 'Connect with the lab'}
            </span>
          </div>
          <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            {heroPrimary}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light inline-block px-1 sm:px-2">
              {heroAccent}
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">{hero.body}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ContactBriefForm
            heading={brief.heading}
            body={brief.body}
            submitLabel={brief.ctaLabel || 'Submit Project Brief'}
            helperText={brief.mediaAlt || 'Response in 24 business hours'}
          />
        </div>
      </Reveal>

      <Reveal as="section" className="py-24 bg-deepSlate relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-10" />
          <div className="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-10" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
                {meetPrimary}
                <br />
                <span className="text-electricBlue italic font-light">{meetAccent}</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">{meet.body}</p>
              <div className="flex flex-wrap gap-6">
                <Link href={meet.ctaHref || '/contact'} className="px-8 py-5 bg-white text-deepSlate font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:shadow-2xl transition-all flex items-center gap-3">
                  {meet.ctaLabel || 'Book a Google Meet Session'}
                  <span className="material-symbols-outlined text-xl">videocam</span>
                </Link>
              </div>
            </div>

            <div className="glass-panel bg-white/5 border-white/10 p-12 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <span className="material-symbols-outlined text-6xl text-white/5 group-hover:text-electricBlue/20 transition-colors duration-500">calendar_month</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">{meet.mediaAlt || 'Instant Booking'}</h3>
              <p className="text-slate-400 mb-10 text-sm">Synchronize with our engineering team.</p>

              <ul className="space-y-6">
                {[bookingOne, bookingTwo, bookingThree].map((item) => (
                  <li key={item.id} className="flex items-center gap-4 text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-electricBlue/20 flex items-center justify-center text-electricBlue">
                      <span className="material-symbols-outlined text-sm">{item.ctaLabel || 'check'}</span>
                    </span>
                    <span className="text-sm font-medium">{item.heading}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-32 pt-20 border-t border-white/5 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-display font-black text-xl">{company.heading}</h4>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                {companyLines[0] || ''}
                <br />
                {companyLines[1] || ''}
              </p>
              <div className="pt-4">
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-600 mb-2">
                  {companyLines[2] || 'Global Reach'}
                </p>
                <p className="text-slate-500 text-xs leading-relaxed">{companyLines[3] || ''}</p>
              </div>
            </div>

            <Link href={email.ctaHref || '/contact'} className="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
              <span className="material-symbols-outlined text-electricBlue mb-6 group-hover:scale-110 transition-transform">{email.ctaLabel || 'alternate_email'}</span>
              <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-1">{email.heading}</h5>
              <p className="text-slate-400 text-sm">{email.body}</p>
            </Link>

            <Link href={whatsapp.ctaHref || '/contact'} className="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
              <span className="material-symbols-outlined text-emerald-400 mb-6 group-hover:scale-110 transition-transform">{whatsapp.ctaLabel || 'chat'}</span>
              <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-1">{whatsapp.heading}</h5>
              <p className="text-slate-400 text-sm">{whatsapp.body}</p>
            </Link>

            <Link href={instagram.ctaHref || '/contact'} className="glass-panel bg-white/5 border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer block">
              <span className="material-symbols-outlined text-pink-400 mb-6 group-hover:scale-110 transition-transform">{instagram.ctaLabel || 'photo_camera'}</span>
              <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-1">{instagram.heading}</h5>
              <p className="text-slate-400 text-sm">{instagram.body}</p>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}

