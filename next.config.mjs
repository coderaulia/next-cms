import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
  webpack: (config, { isServer }) => {
    if (!isServer && config.optimization?.splitChunks) {
      const cacheGroups = config.optimization.splitChunks.cacheGroups ?? {};

      config.optimization.splitChunks.cacheGroups = {
        ...cacheGroups,
        motion: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'motion',
          chunks: 'all',
          priority: 40,
          reuseExistingChunk: true
        },
        icons: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'icons',
          chunks: 'all',
          priority: 35,
          reuseExistingChunk: true
        }
      };
    }

    return config;
  }
};

export default withBundleAnalyzer(nextConfig);
