import type { Metadata } from 'next';

import { MuzikPlayerPageView } from '@/components/pages/MuzikPlayerPageView';

export const metadata: Metadata = {
  title: 'MuzikPlayer — Pure Hi-Fi Sound & Libadwaita Slate Design | Vanaila Digital',
  description:
    'A modern desktop music player for local libraries, built with Compose Desktop (Kotlin/JVM). Features bit-perfect PipeWire direct streaming, synchronized lyrics, and peak audio waveforms.',
  openGraph: {
    title: 'MuzikPlayer — Pure Hi-Fi Sound & Libadwaita Slate Design | Vanaila Digital',
    description:
      'Bit-perfect PipeWire direct streaming, synchronized lyrics, audio waveforms, and lightning-fast local library navigation on Linux.',
    images: ['/muzikplayer/muzikplayer-hero.png'],
  },
};

export default function MuzikPlayerPage() {
  return <MuzikPlayerPageView />;
}
