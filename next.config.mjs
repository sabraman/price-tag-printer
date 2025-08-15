/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer-core': 'commonjs puppeteer-core',
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
      });
    }
    
    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
  // Enable React Compiler
  compiler: {
    reactCompiler: true,
  },
};

export default nextConfig;