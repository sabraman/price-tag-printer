/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', 'google-sheets-data-fetcher'],
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
    
    // Fix Node.js modules in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        url: false,
        util: false,
        stream: false,
        crypto: false,
        buffer: false,
        process: false,
        path: false,
        os: false,
        zlib: false,
      };
    }
    
    return config;
  },
  // Enable React Compiler
  compiler: {
    // Note: reactCompiler might not be available in this version
  },
};

export default nextConfig;