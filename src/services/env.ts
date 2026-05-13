const fallbackBaseUrl = 'http://localhost:3000';

const clean = (value: string | undefined) => value?.trim().replace(/^['"]|['"]$/g, '') || '';
const parsePositiveInt = (value: string | undefined) => {
  const normalized = clean(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
};
const parseContactWebhookMethod = (value: string | undefined): 'POST' | 'PUT' | 'PATCH' => {
  const normalized = clean(value).toUpperCase();
  return normalized === 'PUT' || normalized === 'PATCH' ? normalized : 'POST';
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
  get r2AccountId() {
    return clean(process.env.R2_ACCOUNT_ID);
  },
  get r2AccessKeyId() {
    return clean(process.env.R2_ACCESS_KEY_ID);
  },
  get r2SecretAccessKey() {
    return clean(process.env.R2_SECRET_ACCESS_KEY);
  },
  get r2Bucket() {
    return clean(process.env.R2_BUCKET);
  },
  get r2PublicUrl() {
    return clean(process.env.R2_PUBLIC_URL);
  },
  /** Storage quota in MB. Default 1000 MB (≈1 GB — fits Supabase free tier). R2 free tier is 10 GB. */
  get storageQuotaMb() {
    return parsePositiveInt(process.env.CMS_STORAGE_QUOTA_MB) ?? 1000;
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
    return parseContactWebhookMethod(process.env.CONTACT_NOTIFICATION_WEBHOOK_METHOD);
  },
  get contactNotificationWebhookToken() {
    return clean(process.env.CONTACT_NOTIFICATION_WEBHOOK_TOKEN);
  },
  /** Set CMS_ENABLE_DEV_AUTH=true to allow x-admin-token header auth in non-production environments. */
  get enableDevAuth() {
    return clean(process.env.CMS_ENABLE_DEV_AUTH).toLowerCase() === 'true';
  },
  /**
   * Number of trusted reverse proxies in front of the app (e.g. 1 for Vercel/Cloudflare).
   * Set to 0 when the app receives connections directly (no proxy).
   * Used to extract the real client IP from X-Forwarded-For without trusting attacker-injected entries.
   */
  get trustedProxyCount() {
    const val = parseInt(clean(process.env.TRUSTED_PROXY_COUNT) || '0', 10);
    return Number.isFinite(val) && val >= 0 ? val : 0;
  }
};
