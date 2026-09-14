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
  },
  webpack: (config) => {
    // Suppress dynamic ESM cache invalidation warnings inside next-intl's format extractor
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Parsing of .*next-intl.* for build dependencies failed/,
      {
        message: /Build dependencies behind this expression are ignored/
      }
    ];
    return config;
  }
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
