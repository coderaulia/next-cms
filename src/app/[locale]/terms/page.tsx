import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalPageLayout } from '@/components/pages/LegalPageLayout';
import { getSiteSettings } from '@/features/cms/publicApi';

export const metadata: Metadata = {
  title: 'Terms of Service — Vanaila Digital',
  description:
    'Read the terms and conditions governing your use of the Vanaila Digital website and services.',
  robots: { index: true, follow: true }
};

export default async function TermsOfServicePage() {
  const settings = await getSiteSettings();
  const companyName = settings.contact?.companyName || 'PT Vanaila Digital Vision';
  const email = settings.contact?.emailValue || 'care@vanaila.com';
  const address = settings.contact?.addressLine1 || 'Bogor, Indonesia';

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle={`These terms govern your access to and use of the Vanaila Digital website and any services offered by ${companyName}.`}
      tag="LEGAL / TERMS"
      effectiveDate="January 1, 2025"
      breadcrumb="Terms of Service"
      sections={[
        {
          heading: 'Agreement to Terms',
          content: (
            <p>
              By accessing or using the Vanaila Digital website (vanaila.com) or submitting a
              project enquiry, you agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy-policy" style={{ color: '#0033FF' }}>
                Privacy Policy
              </Link>
              . If you do not agree, please do not use this website. These Terms constitute a legally
              binding agreement between you and {companyName} (&quot;Vanaila Digital&quot;,
              &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
          )
        },
        {
          heading: 'Use of the Website',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>You agree to use this website only for lawful purposes and in a manner that:</p>
              <ul style={{ margin: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Does not violate applicable local, national, or international laws or regulations</li>
                <li>Does not transmit unsolicited promotional or commercial content (spam)</li>
                <li>Does not attempt to gain unauthorised access to any part of the website or its underlying systems</li>
                <li>Does not interfere with, disrupt, or damage the availability or performance of the website</li>
                <li>Does not reproduce, distribute, or create derivative works of our content without written permission</li>
              </ul>
            </div>
          )
        },
        {
          heading: 'Services and Enquiries',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                Submitting a contact form or project brief constitutes an enquiry, not a binding
                contract. A contract for services is formed only when both parties have signed a
                written service agreement or statement of work.
              </p>
              <p>
                We reserve the right to decline any enquiry at our discretion without obligation to
                provide a reason. We are under no obligation to accept or act upon any enquiry
                received through this website.
              </p>
              <p>
                All pricing, timelines, and deliverables discussed during consultation are
                indicative only and subject to a formal written agreement.
              </p>
            </div>
          )
        },
        {
          heading: 'Intellectual Property',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                All content on this website — including but not limited to text, graphics, logos,
                icons, images, audio clips, case studies, and code — is the property of{' '}
                {companyName} or its content suppliers and is protected by Indonesian and international
                intellectual property laws.
              </p>
              <p>
                You may view, download, and print pages from this website for your personal,
                non-commercial use, provided you retain all copyright and proprietary notices.
              </p>
              <p>
                You may not use our name, logo, or brand marks without prior written consent.
              </p>
            </div>
          )
        },
        {
          heading: 'Client Work and Portfolio',
          content: (
            <p>
              Unless otherwise agreed in writing, we reserve the right to display work completed
              for clients in our portfolio and marketing materials. If you do not wish for your
              project to be featured, please notify us in writing before project commencement or
              in your service agreement.
            </p>
          )
        },
        {
          heading: 'Disclaimers and Limitation of Liability',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                This website and its content are provided &quot;as is&quot; without any warranties,
                express or implied, including but not limited to fitness for a particular purpose,
                accuracy, or non-infringement.
              </p>
              <p>
                To the fullest extent permitted by applicable law, {companyName} shall not be
                liable for any indirect, incidental, special, or consequential damages arising from
                your use of or inability to use this website, including but not limited to loss of
                profits, data, or business opportunities.
              </p>
              <p>
                Our total liability for any claim arising out of or relating to this website shall
                not exceed the amount paid by you to us in the three months prior to the claim, or
                IDR 1,000,000 (one million rupiah), whichever is greater.
              </p>
            </div>
          )
        },
        {
          heading: 'Third-Party Links',
          content: (
            <p>
              Our website may contain links to third-party websites. These links are provided for
              your convenience only. We have no control over the content of those sites and accept
              no responsibility for them or for any loss or damage that may arise from your use of
              them. Visiting linked sites is at your own risk.
            </p>
          )
        },
        {
          heading: 'Privacy',
          content: (
            <p>
              Your use of this website is also governed by our{' '}
              <Link href="/privacy-policy" style={{ color: '#0033FF' }}>
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review it carefully. By
              using our website, you consent to the practices described in our Privacy Policy.
            </p>
          )
        },
        {
          heading: 'Governing Law and Jurisdiction',
          content: (
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic
              of Indonesia. Any disputes arising from these Terms or your use of our website shall
              be subject to the exclusive jurisdiction of the courts of Indonesia, without
              prejudice to any mandatory local consumer protection provisions that may apply in
              your jurisdiction.
            </p>
          )
        },
        {
          heading: 'Changes to These Terms',
          content: (
            <p>
              We may revise these Terms at any time by updating this page. The effective date will
              be updated at the top of the page. Your continued use of our website following any
              changes constitutes your acceptance of the revised Terms. We encourage you to review
              this page periodically.
            </p>
          )
        },
        {
          heading: 'Contact Us',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p>
                If you have any questions about these Terms of Service, please contact us:
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
            </div>
          )
        }
      ]}
    />
  );
}
