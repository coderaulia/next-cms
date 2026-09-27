import type { Metadata } from 'next';

import { VanailaChatPageView } from '@/components/pages/VanailaChatPageView';

export const metadata: Metadata = {
  title: 'VanailaChat — Privacy-First AI Workstation & Native Desktop Client',
  description:
    'Native Linux desktop client and web workstation built for Ollama & cloud LLMs. Featuring swappable Pi and DeepSeek live coding harnesses, persistent vector memory, and zero telemetry.',
  openGraph: {
    title: 'VanailaChat — Privacy-First AI Workstation & Native Desktop Client',
    description:
      'Native Linux desktop client and web workstation built for Ollama & cloud LLMs. Featuring swappable Pi and DeepSeek live coding harnesses, persistent vector memory, and zero telemetry.',
    images: ['/vanailachat/hero-mockup.png'],
  },
};

export default function VanailaChatPage() {
  return <VanailaChatPageView />;
}
