/** @type {import('next').NextConfig} */
const nextConfig = {
	reactCompiler: true,
	serverExternalPackages: [
		"puppeteer-core",
		"@sparticuz/chromium",
		"google-sheets-data-fetcher",
	],
	trailingSlash: false,
	poweredByHeader: false,
};

export default nextConfig;
