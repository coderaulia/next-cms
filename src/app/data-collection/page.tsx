import type { Metadata } from 'next';

import { LegalPageLayout } from '@/components/pages/LegalPageLayout';
import { getSiteSettings } from '@/features/cms/publicApi';

export const metadata: Metadata = {
  title: 'Data Collection — Vanaila Digital',
  description:
    'A plain-language summary of exactly what data Vanaila Digital collects, where it goes, and how long it is kept.',
  robots: { index: true, follow: true }
};

export default async function DataCollectionPage() {
  const settings = await getSiteSettings();
  const companyName = settings.contact?.companyName || 'PT Vanaila Digital Vision';
  const email = settings.contact?.emailValue || 'care@vanaila.com';

  return (
    <LegalPageLayout
      title="Data Collection"
      subtitle="A plain-language summary of exactly what data we collect when you visit this website, why we collect it, and how long we keep it — with no jargon."
      tag="LEGAL / DATA"
      effectiveDate="January 1, 2025"
      breadcrumb="Data Collection"
      sections={[
        {
          heading: 'Our Approach',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                We collect as little data as possible. We do not use third-party advertising
                trackers, social media pixels, or behavioural profiling tools. What we collect
                is either something you actively give us, or anonymised technical data that
                helps us understand how our website performs.
              </p>
              <p>
                <strong>No third-party tracking.</strong> No Google Analytics, no Facebook Pixel,
                no Hotjar, no ad network cookies.
                <br />
                <strong>No tracking cookies.</strong> Our analytics do not use cookies; they use
                browser localStorage with a random identifier.
                <br />
                <strong>No data selling.</strong> Your information is never sold or shared with
                advertisers.
              </p>
            </div>
          )
        },
        {
          heading: 'Contact Form Data',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                When you submit a project brief or contact form, we collect and store the
                following fields:
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                  fontFamily: 'var(--font-tight, sans-serif)',
                  marginTop: 8,
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(10,14,26,0.04)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Field</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>What it is</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Name', 'Your full name or company name', 'Yes'],
                    ['Email address', 'Your business or personal email', 'Yes'],
                    ['Company name', 'Your organisation (optional on some forms)', 'No'],
                    ['Service category', 'Which service you are interested in', 'Yes'],
                    ['Project overview', 'Description of your project goals', 'Yes'],
                  ].map(([field, desc, req]) => (
                    <tr
                      key={field}
                      style={{ borderBottom: '1px solid rgba(10,14,26,0.07)' }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{field}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(10,14,26,0.6)' }}>{desc}</td>
                      <td style={{ padding: '10px 14px', color: req === 'Yes' ? '#0033FF' : 'rgba(10,14,26,0.4)' }}>
                        {req}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                <strong>Where it goes:</strong> Stored in our secure PostgreSQL database (Supabase).
                Only our team can access it.
                <br />
                <strong>How long we keep it:</strong> Up to 3 years for business records, then permanently deleted.
                <br />
                <strong>Why we collect it:</strong> To respond to your enquiry and discuss your project.
              </p>
            </div>
          )
        },
        {
          heading: 'Website Analytics',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Every page you visit on our website is recorded by our self-hosted analytics
                system. Here is exactly what is captured:
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                  fontFamily: 'var(--font-tight, sans-serif)',
                  marginTop: 8,
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(10,14,26,0.04)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Data point</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>What it is</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Identifies you?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Page URL', 'The address of the page you visited', 'No'],
                    ['HTTP referrer', 'The URL of the page you came from', 'No'],
                    ['UTM parameters', 'Campaign tags from email or ad links (e.g. utm_source)', 'No'],
                    ['Visitor ID', 'A random UUID stored in your browser localStorage — not linked to your identity', 'No'],
                    ['Session ID', 'A random UUID for the current browser session (erased when you close the tab)', 'No'],
                    ['CTA clicks', 'Which call-to-action buttons you clicked', 'No'],
                  ].map(([field, desc, identifies]) => (
                    <tr
                      key={field}
                      style={{ borderBottom: '1px solid rgba(10,14,26,0.07)' }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{field}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(10,14,26,0.6)' }}>{desc}</td>
                      <td style={{ padding: '10px 14px', color: identifies === 'No' ? '#059669' : '#BD3146' }}>
                        {identifies}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                <strong>Where it goes:</strong> Our own database — no third-party analytics service receives this data.
                <br />
                <strong>How long we keep it:</strong> Up to 12 months, then deleted.
                <br />
                <strong>No cookies used.</strong> The visitor ID lives only in your browser&apos;s localStorage and
                is never transmitted to other sites.
              </p>
            </div>
          )
        },
        {
          heading: 'Browser Local Storage',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>We write the following entries to your browser&apos;s storage:</p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14,
                  fontFamily: 'var(--font-tight, sans-serif)',
                  marginTop: 8,
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(10,14,26,0.04)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Key</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Storage type</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600 }}>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['cms.analytics.visitorId', 'localStorage (persists across sessions)', 'Counts unique visitors — random UUID, cannot identify you personally'],
                    ['cms.analytics.sessionId', 'sessionStorage (erased on tab close)', 'Groups page views within a single visit'],
                    ['cms.analytics.tracked.*', 'sessionStorage', 'Prevents counting the same page twice in one session'],
                  ].map(([key, storage, purpose]) => (
                    <tr
                      key={key}
                      style={{ borderBottom: '1px solid rgba(10,14,26,0.07)' }}
                    >
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{key}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(10,14,26,0.6)', fontSize: 13 }}>{storage}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(10,14,26,0.6)', fontSize: 13 }}>{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>
                You can clear these at any time by clearing your browser&apos;s site data or local
                storage for vanaila.com. Doing so will not affect your access to any part of the
                website.
              </p>
            </div>
          )
        },
        {
          heading: 'Fonts and Static Assets',
          content: (
            <p>
              This website uses Google Fonts (Sora, Playfair Display, Inter Tight, Instrument
              Serif, JetBrains Mono). The font files are downloaded and served from our own server
              via Next.js font optimisation — your browser does not make any direct requests to
              Google&apos;s servers. Google cannot track your visit through fonts on this site.
            </p>
          )
        },
        {
          heading: 'Server Logs',
          content: (
            <p>
              Our web host&apos;s server automatically logs standard HTTP request metadata: your IP
              address, browser user agent, date and time, and requested URL. These logs are used
              solely for security monitoring and infrastructure diagnostics, are not linked to
              your identity, and are typically purged within 30 days by our hosting provider.
            </p>
          )
        },
        {
          heading: 'Data We Do Not Collect',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p>To be explicit, we do <strong>not</strong> collect or process:</p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Financial or payment information (we have no payment forms)</li>
                <li>Social media profile data or login credentials</li>
                <li>Location data beyond what may appear in your IP address in server logs</li>
                <li>Biometric or health data</li>
                <li>Data from children under 16</li>
                <li>Information from third-party data brokers</li>
              </ul>
            </div>
          )
        },
        {
          heading: 'Your Control Over Your Data',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>You have the following options:</p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>Clear localStorage</strong> — removes your visitor ID. In your browser
                  developer tools under Application → Local Storage → vanaila.com.
                </li>
                <li>
                  <strong>Request deletion of contact data</strong> — email{' '}
                  <a href={`mailto:${email}`} style={{ color: '#0033FF' }}>
                    {email}
                  </a>{' '}
                  with the subject &quot;Data deletion request&quot; and we will remove your
                  submission records within 30 days.
                </li>
                <li>
                  <strong>Access your data</strong> — email us and we will send you a copy of any
                  personal data we hold about you.
                </li>
              </ul>
            </div>
          )
        },
        {
          heading: 'Applicable Regulations',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                We have designed our data practices to comply with the following frameworks:
              </p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>UU PDP (Indonesia)</strong> — Undang-Undang Perlindungan Data Pribadi No.
                  27 Tahun 2022. As an Indonesian-registered company, this is our primary regulatory
                  framework.
                </li>
                <li>
                  <strong>GDPR (European Union)</strong> — General Data Protection Regulation. We
                  apply GDPR-equivalent practices for all visitors regardless of location.
                </li>
                <li>
                  <strong>PDPA (Thailand / ASEAN)</strong> — Personal Data Protection Act and
                  similar ASEAN data protection laws where applicable.
                </li>
              </ul>
              <p>
                Questions or regulatory enquiries may be directed to{' '}
                <a href={`mailto:${email}`} style={{ color: '#0033FF' }}>
                  {email}
                </a>
                . We are {companyName}, registered in Indonesia.
              </p>
            </div>
          )
        }
      ]}
    />
  );
}
