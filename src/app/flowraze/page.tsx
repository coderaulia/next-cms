import type { Metadata } from 'next';

import { FlowrazePageView } from '@/components/pages/FlowrazePageView';

export const metadata: Metadata = {
  title: 'Flowraze — CRM & Sales Platform for Indonesian Teams',
  description:
    'Flowraze unifies leads, deals, campaigns, and team performance in one clear system. See what drives revenue — and what holds it back. Built for Indonesian SMB sales teams.',
  openGraph: {
    title: 'Flowraze — CRM & Sales Platform for Indonesian Teams',
    description:
      'Manage leads, close deals, track campaigns, and hit revenue targets. WhatsApp-first CRM built for growing Indonesian sales teams.',
    images: ['/flowraze/home.png'],
  },
};

export default function FlowrazePage() {
  return <FlowrazePageView />;
}
