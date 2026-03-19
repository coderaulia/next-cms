'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const VISITOR_ID_KEY = 'cms.analytics.visitorId';
const SESSION_ID_KEY = 'cms.analytics.sessionId';
const TRACKED_PATH_PREFIX = 'cms.analytics.tracked.';

function readOrCreateStorageValue(key: string) {
  const existing = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  if (key === VISITOR_ID_KEY) {
    window.localStorage.setItem(key, next);
  } else {
    window.sessionStorage.setItem(key, next);
  }
  return next;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const path = pathname || '/';
    const trackedKey = `${TRACKED_PATH_PREFIX}${path}`;
    if (window.sessionStorage.getItem(trackedKey)) {
      return;
    }

    const visitorId = readOrCreateStorageValue(VISITOR_ID_KEY);
    const sessionId = readOrCreateStorageValue(SESSION_ID_KEY);
    const payload = JSON.stringify({
      path,
      referrer: document.referrer || '',
      utmSource: searchParams.get('utm_source') || '',
      utmMedium: searchParams.get('utm_medium') || '',
      utmCampaign: searchParams.get('utm_campaign') || '',
      visitorId,
      sessionId
    });

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
  }, [pathname, searchParams]);

  return null;
}
