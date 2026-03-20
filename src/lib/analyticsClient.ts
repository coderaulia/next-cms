'use client';

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

export function getAnalyticsIdentity() {
  return {
    visitorId: readOrCreateStorageValue(VISITOR_ID_KEY),
    sessionId: readOrCreateStorageValue(SESSION_ID_KEY)
  };
}

export function getTrackedPathKey(path: string) {
  return `${TRACKED_PATH_PREFIX}${path}`;
}

export function buildAnalyticsPayload(path: string) {
  const { visitorId, sessionId } = getAnalyticsIdentity();
  const params = new URLSearchParams(window.location.search);

  return {
    path,
    referrer: document.referrer || '',
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    visitorId,
    sessionId
  };
}

export async function trackClientAnalyticsEvent(eventType: 'cta_click' | 'contact_submit', label: string, path?: string) {
  const targetPath = path || window.location.pathname || '/';
  const payload = JSON.stringify({
    ...buildAnalyticsPayload(targetPath),
    eventType,
    label
  });

  await fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  });
}
