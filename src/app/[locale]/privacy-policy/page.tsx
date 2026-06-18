import type { Metadata } from 'next';

import { LegalPageLayout } from '@/components/pages/LegalPageLayout';
import { getSiteSettings } from '@/features/cms/publicApi';

export const metadata: Metadata = {
  title: 'Privacy Policy — Vanaila Digital',
  description:
    'Learn how Vanaila Digital collects, uses, and protects your personal information when you use our website and services.',
  robots: { index: true, follow: true }
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const companyName = settings.contact?.companyName || 'PT Vanaila Digital Vision';
  const email = settings.contact?.emailValue || 'care@vanaila.com';
  const address = settings.contact?.addressLine1 || 'Bogor, Indonesia';

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle={`${companyName} respects your privacy and is committed to protecting your personal data. This policy explains what we collect, why we collect it, and your rights.`}
      tag="LEGAL / PRIVACY"
      effectiveDate="January 1, 2025"
      breadcrumb="Privacy Policy"
      sections={[
        {
          heading: 'Who We Are',
          content: (
            <p>
              {companyName} (&quot;Vanaila Digital&quot;, &quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) operates the website at vanaila.com and related subdomains. We are
              registered in Indonesia and our primary office is located at {address}. For any
              privacy-related enquiries, contact us at{' '}
              <a href={`mailto:${email}`} style={{ color: '#0033FF' }}>
                {email}
              </a>
              .
            </p>
          )
        },
        {
          heading: 'Information We Collect',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>
                We collect only the information necessary to provide our services and improve your
                experience. We do <strong>not</strong> sell your data to third parties.
              </p>
              <p>
                <strong>Information you provide directly</strong> — When you submit a contact or
                project brief form, we collect your name, business email address, company name (if
                provided), service category of interest, and a project overview description.
              </p>
              <p>
                <strong>Usage data we collect automatically</strong> — When you visit our website,
                our self-hosted analytics system records the page URL visited, the HTTP referrer
                (the page you came from), UTM campaign parameters (e.g., from email or ad links),
                and a randomly generated visitor identifier stored in your browser&apos;s local
                storage. No cookies are used for analytics. No data is sent to third-party analytics
                platforms such as Google Analytics.
              </p>
              <p>
                <strong>Technical data</strong> — Our web server receives standard HTTP request
                data including your IP address, browser type, operating system, and timestamp. This
                data is used only for security monitoring and is not linked to your identity.
              </p>
            </div>
          )
        },
        {
          heading: 'How We Use Your Information',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>We use the information we collect for the following purposes:</p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>To respond to your project brief or enquiry and provide consultation services</li>
                <li>To understand which pages and content are most useful to our visitors</li>
                <li>To measure the effectiveness of marketing campaigns via UTM parameters</li>
                <li>To protect our website from unauthorised access and abuse</li>
                <li>To fulfil any legal obligations we may have under applicable law</li>
              </ul>
              <p>We do not use your data for automated decision-making or profiling.</p>
            </div>
          )
        },
        {
          heading: 'Legal Basis for Processing (GDPR / UU PDP)',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Depending on your location, different legal frameworks may apply. Our legal basis
                for processing personal data is:
              </p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>Contractual necessity</strong> — to respond to and fulfil your project
                  enquiry
                </li>
                <li>
                  <strong>Legitimate interests</strong> — to analyse website usage through
                  self-hosted, cookieless analytics and to protect our systems
                </li>
                <li>
                  <strong>Legal obligation</strong> — where applicable laws require us to retain
                  certain records
                </li>
              </ul>
              <p>
                Where required, we will ask for your consent. You may withdraw consent at any time
                by contacting us.
              </p>
            </div>
          )
        },
        {
          heading: 'Data Storage and Retention',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Contact form submissions are stored in our secure database hosted on Supabase
                (PostgreSQL), which is operated on infrastructure within or proxied through the
                European Union and Southeast Asia regions. We retain contact submissions for up to
                3 years for business and tax record-keeping purposes, after which they are
                permanently deleted.
              </p>
              <p>
                Analytics records (visitor and session identifiers) are anonymised and retained for
                up to 12 months to allow us to identify usage trends over time.
              </p>
            </div>
          )
        },
        {
          heading: 'Cookies and Local Storage',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Our website does <strong>not</strong> use tracking cookies. We do use the
                browser&apos;s <code>localStorage</code> to store a randomly generated visitor
                identifier that helps us count unique visitors without identifying you personally.
                This identifier cannot be used to re-identify you.
              </p>
              <p>
                We may set a session cookie for administrative users who log in to the admin panel.
                This cookie is strictly functional and is not used for tracking.
              </p>
              <p>
                Google Fonts are loaded through our own server (self-proxied) — your browser does
                not make requests directly to Google&apos;s servers.
              </p>
            </div>
          )
        },
        {
          heading: 'Third-Party Services',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                We use a minimal set of third-party services. These may process data as part of
                providing their service:
              </p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>Supabase</strong> — database and media storage hosting. Your contact form
                  data is stored here. Supabase is GDPR-compliant and data is processed under a
                  Data Processing Agreement.
                </li>
                <li>
                  <strong>Hostinger / web host</strong> — server infrastructure for running the
                  website.
                </li>
              </ul>
              <p>
                We do not integrate Facebook Pixel, Google Analytics, Hotjar, Intercom, or any
                advertising network trackers.
              </p>
            </div>
          )
        },
        {
          heading: 'Your Rights',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Depending on your jurisdiction, you may have the following rights regarding your
                personal data:
              </p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <strong>Right of access</strong> — request a copy of the personal data we hold
                  about you
                </li>
                <li>
                  <strong>Right to rectification</strong> — ask us to correct inaccurate data
                </li>
                <li>
                  <strong>Right to erasure</strong> — request deletion of your personal data where
                  there is no lawful reason to retain it
                </li>
                <li>
                  <strong>Right to restrict processing</strong> — ask us to temporarily stop
                  processing your data
                </li>
                <li>
                  <strong>Right to data portability</strong> — receive your data in a
                  machine-readable format
                </li>
                <li>
                  <strong>Right to object</strong> — object to processing based on legitimate
                  interests
                </li>
              </ul>
              <p>
                To exercise any of these rights, email{' '}
                <a href={`mailto:${email}`} style={{ color: '#0033FF' }}>
                  {email}
                </a>
                . We will respond within 30 days. For residents of Indonesia, these rights are
                recognised under UU PDP (Government Regulation on Personal Data Protection).
              </p>
            </div>
          )
        },
        {
          heading: 'Children\'s Privacy',
          content: (
            <p>
              Our website and services are not directed at children under 16 years of age. We do
              not knowingly collect personal data from children. If you believe we have inadvertently
              collected such data, please contact us immediately.
            </p>
          )
        },
        {
          heading: 'Changes to This Policy',
          content: (
            <p>
              We may update this Privacy Policy from time to time. The effective date at the top of
              this page will be updated accordingly. We encourage you to review this page
              periodically. Continued use of our website after any update constitutes acceptance of
              the revised policy.
            </p>
          )
        },
        {
          heading: 'Contact and Complaints',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                For any privacy-related questions, data requests, or complaints, contact our data
                controller:
              </p>
              <p>
                <strong>{companyName}</strong>
                <br />
                {address}
                <br />
                Email:{' '}
                <a href={`mailto:${email}`} style={{ color: '#0033FF' }}>
                  {email}
                </a>
              </p>
              <p>
                If you are located in the European Union and are not satisfied with our response,
                you have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>
          )
        }
      ]}
    />
  );
}
