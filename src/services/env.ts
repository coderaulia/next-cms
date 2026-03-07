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
  }
};
