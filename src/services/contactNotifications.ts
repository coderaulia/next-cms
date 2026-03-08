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
    'Content-Type': 'application/json'
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
  } finally {
    clearTimeout(timeout);
  }
}