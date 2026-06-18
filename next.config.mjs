import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Inline CSS into the HTML to remove the render-blocking stylesheet
    // request (~1.3s on mobile). CSP already allows style-src unsafe-inline.
    inlineCss: true
  }
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
