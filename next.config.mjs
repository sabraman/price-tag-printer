/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: [
		"puppeteer-core",
		"@sparticuz/chromium",
		"google-sheets-data-fetcher",
	],
	experimental: {
		// Try to avoid static generation issues
		serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
		// Force dynamic rendering to avoid Html import issues
		forceSwcTransforms: true,
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals.push({
				"puppeteer-core": "commonjs puppeteer-core",
				"@sparticuz/chromium": "commonjs @sparticuz/chromium",
			});
		}

		// Handle font files
		config.module.rules.push({
			test: /\.(woff|woff2|eot|ttf|otf)$/i,
			type: "asset/resource",
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
	// Disable trailing slash handling to avoid build issues
	trailingSlash: false,
	// Skip static generation for error pages
	poweredByHeader: false,
};

export default nextConfig;
