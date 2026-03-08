const fallbackBaseUrl = 'http://localhost:3000';

const clean = (value: string | undefined) => value?.trim().replace(/^['"]|['"]$/g, '') || '';

export const env = {
  get siteUrl() {
    return clean(process.env.NEXT_PUBLIC_SITE_URL) || fallbackBaseUrl;
  },
  get adminToken() {
    return clean(process.env.CMS_ADMIN_TOKEN) || '';
  },
  get adminEmail() {
    return clean(process.env.CMS_ADMIN_EMAIL) || 'admin@vanaila.local';
  },
  get adminPassword() {
    return clean(process.env.CMS_ADMIN_PASSWORD) || clean(process.env.CMS_ADMIN_TOKEN);
  },
  get adminName() {
    return clean(process.env.CMS_ADMIN_NAME) || 'Administrator';
  },
  get orgName() {
    return clean(process.env.CMS_ORG_NAME) || 'Acme Marketing';
  },
  get orgLogo() {
    return clean(process.env.CMS_ORG_LOGO) || 'https://placehold.co/240x80/png';
  },
  get databaseUrl() {
    return clean(process.env.DATABASE_URL);
  },
  get databaseMigrationUrl() {
    return clean(process.env.DATABASE_URL_MIGRATION) || clean(process.env.DATABASE_URL);
  },
  get mediaPublicBaseUrl() {
    return clean(process.env.MEDIA_PUBLIC_BASE_URL) || clean(process.env.NEXT_PUBLIC_MEDIA_BASE_URL) || '';
  },
  get contactNotificationWebhookUrl() {
    return clean(process.env.CONTACT_NOTIFICATION_WEBHOOK_URL);
  },
  get contactNotificationWebhookMethod() {
    return (clean(process.env.CONTACT_NOTIFICATION_WEBHOOK_METHOD) || 'POST').toUpperCase() as 'POST' | 'PUT' | 'PATCH';
  },
  get contactNotificationWebhookToken() {
    return clean(process.env.CONTACT_NOTIFICATION_WEBHOOK_TOKEN);
  }
};