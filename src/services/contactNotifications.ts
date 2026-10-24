import { env } from '@/services/env';
import type { ContactSubmission } from '@/features/cms/types';

type NotificationRequest = {
  name: string;
  email: string;
  company: string;
  serviceCategory: string;
  projectOverview: string;
  status: ContactSubmission['status'];
  createdAt: string;
};

export async function notifyContactSubmission(submission: ContactSubmission) {
  const webhookUrl = env.contactNotificationWebhookUrl;
  if (!webhookUrl) {
    return { delivered: false };
  }

  // Validate webhook URL: reject malformed URLs, NUL bytes (CVE-2026-105482), or non-HTTP(S) protocols
  try {
    const parsed = new URL(webhookUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || webhookUrl.includes('\0') || webhookUrl.includes('%00')) {
      console.error('[notifications] webhook delivery skipped: invalid URL or protocol');
      return { delivered: false };
    }
  } catch {
    console.error('[notifications] webhook delivery skipped: malformed webhook URL');
    return { delivered: false };
  }

  const payload: NotificationRequest = {
    name: submission.name,
    email: submission.email,
    company: submission.company,
    serviceCategory: submission.serviceCategory,
    projectOverview: submission.projectOverview,
    status: submission.status,
    createdAt: submission.createdAt
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Disable Brotli response decompression on outbound calls (defense-in-depth for CVE-2026-111497)
    'Accept-Encoding': 'gzip, deflate'
  };

  if (env.contactNotificationWebhookToken) {
    headers.Authorization = `Bearer ${env.contactNotificationWebhookToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(webhookUrl, {
      method: env.contactNotificationWebhookMethod,
      headers,
      body: JSON.stringify({
        event: 'contact_submission_created',
        payload,
        source: 'react-cms'
      }),
      signal: controller.signal
    });

    return {
      delivered: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('[notifications] webhook delivery failed:', error instanceof Error ? error.message : 'unknown error');
    return { delivered: false };
  } finally {
    clearTimeout(timeout);
  }
}