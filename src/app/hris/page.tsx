import type { Metadata } from 'next';

import { ProductHrisPageView } from '@/components/pages/ProductHrisPageView';

export const metadata: Metadata = {
  title: 'Vanaila HRIS — Human Resource Information System',
  description:
    'End-to-end HR management platform for Indonesian organizations. Attendance, payroll, leaves, KPI, TNA, and employee database in one integrated system.',
  openGraph: {
    title: 'Vanaila HRIS — Human Resource Information System',
    description:
      'Manage your entire workforce from a single platform. Built for growing Indonesian organizations.',
  },
};

export default function HrisPage() {
  return <ProductHrisPageView />;
}
