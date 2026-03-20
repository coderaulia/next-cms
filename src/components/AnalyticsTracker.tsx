'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { buildAnalyticsPayload, getTrackedPathKey, trackClientAnalyticsEvent } from '@/lib/analyticsClient';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname || '/';
    const trackedKey = getTrackedPathKey(path);
    if (window.sessionStorage.getItem(trackedKey)) {
      return;
    }

    const payload = JSON.stringify(buildAnalyticsPayload(path));
    window.sessionStorage.setItem(trackedKey, '1');

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/page-view', new Blob([payload], { type: 'application/json' }));
      return;
    }

    void fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    });
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest<HTMLElement>('[data-analytics-event]');
      if (!trigger) return;

      const eventType = trigger.dataset.analyticsEvent;
      const label = trigger.dataset.analyticsLabel || trigger.textContent?.trim() || 'Unknown CTA';
      if (eventType !== 'cta_click') return;

      void trackClientAnalyticsEvent('cta_click', label, window.location.pathname || '/');
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  return null;
}
