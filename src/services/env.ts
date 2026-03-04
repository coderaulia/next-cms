const fallbackBaseUrl = 'http://localhost:3000';

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || fallbackBaseUrl,
  adminToken: process.env.CMS_ADMIN_TOKEN || 'change-this-token',
  orgName: process.env.CMS_ORG_NAME || 'Acme Marketing',
  orgLogo: process.env.CMS_ORG_LOGO || 'https://placehold.co/240x80/png'
};
