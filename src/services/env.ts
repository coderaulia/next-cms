const fallbackBaseUrl = 'http://localhost:3000';

const clean = (value: string | undefined) => value?.trim().replace(/^['"]|['"]$/g, '') || '';
const parsePositiveInt = (value: string | undefined) => {
  const normalized = clean(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
};

export const env = {
  get siteUrl() {
    return clean(process.env.NEXT_PUBLIC_SITE_URL) || fallbackBaseUrl;
  },
  get adminToken() {
    return clean(process.env.CMS_ADMIN_TOKEN) || '';
  },
  get adminEmail() {
    return clean(process.env.CMS_ADMIN_EMAIL) || 'admin@example.local';
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
  get databasePoolMax() {
    return parsePositiveInt(process.env.CMS_DB_POOL_MAX);
  },
  get supabaseUrl() {
    return clean(process.env.SUPABASE_URL);
  },
  get supabaseServiceRoleKey() {
    return clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get supabaseStorageBucket() {
    return clean(process.env.SUPABASE_STORAGE_BUCKET) || 'cms-media';
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
