/**
 * Downloads the current brand images, produces properly sized derivatives
 * (header logo ~96px-tall WebP, OG image <=1200px compressed PNG), uploads
 * them to the active media storage, registers them as media assets, and
 * points settings at the new files. Originals are left untouched.
 * Run with: npx tsx scripts/optimize-brand-images.ts
 */
import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import sharp from 'sharp';

import * as contentStore from '../src/features/cms/contentStore';
import { saveUploadedMedia } from '../src/services/mediaStorage';

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadDerivative(name: string, buffer: Buffer, mimeType: string, title: string, altText: string) {
  const file = new File([buffer], name, { type: mimeType });
  const stored = await saveUploadedMedia(file);
  const meta = await sharp(buffer).metadata();
  const now = new Date().toISOString();
  await contentStore.createMediaAsset({
    id: randomUUID(),
    title,
    url: stored.url,
    altText,
    mimeType,
    width: meta.width ?? null,
    height: meta.height ?? null,
    sizeBytes: stored.sizeBytes,
    storageProvider: stored.storageProvider,
    storageKey: stored.storageKey,
    createdAt: now,
    updatedAt: now
  });
  return stored.url;
}

async function main() {
  const settings = await contentStore.getSettings();
  const headerLogoUrl = settings.branding.headerLogo;
  const orgLogoUrl = settings.organizationLogo;

  if (headerLogoUrl) {
    const original = await download(headerLogoUrl);
    const optimized = await sharp(original)
      .resize({ height: 96, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    console.log(`header logo: ${original.length} -> ${optimized.length} bytes`);
    const url = await uploadDerivative(
      'header-logo.webp',
      optimized,
      'image/webp',
      'Header logo (optimized)',
      `${settings.general.siteName} logo`
    );
    settings.branding.headerLogo = url;
    console.log('header logo url:', url);
  }

  if (orgLogoUrl) {
    const original = await download(orgLogoUrl);

    // OG/social image: keep PNG for platform compatibility, cap at 1200px wide.
    const ogImage = await sharp(original)
      .resize({ width: 1200, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer();
    console.log(`og image: ${original.length} -> ${ogImage.length} bytes`);
    const ogUrl = await uploadDerivative(
      'og-default.png',
      ogImage,
      'image/png',
      'Default social image (optimized)',
      `${settings.general.siteName} social preview`
    );
    settings.defaultOgImage = ogUrl;
    settings.seo.defaultOgImage = ogUrl;

    // On-site organization logo: WebP, 480px wide is plenty for any placement.
    const orgLogo = await sharp(original)
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    console.log(`org logo: ${original.length} -> ${orgLogo.length} bytes`);
    const orgUrl = await uploadDerivative(
      'organization-logo.webp',
      orgLogo,
      'image/webp',
      'Organization logo (optimized)',
      `${settings.general.siteName} organization logo`
    );
    settings.organizationLogo = orgUrl;
    console.log('og url:', ogUrl);
    console.log('org logo url:', orgUrl);
  }

  await contentStore.updateSettings(settings);
  console.log('Settings updated. Originals left in storage untouched.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
