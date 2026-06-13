import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

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

export default withBundleAnalyzer(nextConfig);
