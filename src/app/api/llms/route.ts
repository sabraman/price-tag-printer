import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export async function GET() {
	try {
		const llmsPath = join(process.cwd(), "public", "llms.txt");
		const llmsContent = readFileSync(llmsPath, "utf8");

		return new NextResponse(llmsContent, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Failed to serve llms.txt:", error);

		// Fallback content if file read fails
		const fallbackContent = `# ${siteConfig.name}

> ${siteConfig.description} The public API is designed for predictable integrations and AI-assisted function calling.

The production site is available at ${siteConfig.url}. The API base URL is ${siteConfig.apiUrl}. Prices are represented in the smallest currency unit used by the client integration.

## Product

- [Live price-tag editor](${siteConfig.url}/): Import Excel or Google Sheets data, edit products, choose themes, preview tags, and export print-ready PDFs.
- [API documentation](${siteConfig.url}/api-docs): Interactive API overview, examples, playground, and LLM integration guidance.
- [API health](${siteConfig.url}/api-health): Human-readable service status dashboard.

## API resources

- [OpenAPI specification](${siteConfig.url}/openapi.json): Machine-readable OpenAPI 3.0 document for integrations and function calling.
- [Health endpoint](${siteConfig.apiUrl}/health): JSON service status and capability information.
- [LLM guide](https://github.com/sabraman/price-tag-printer/blob/main/LLM_API_GUIDE.md): Repository guide with request patterns and integration notes.

## Core operations

- Create one or many price tags with POST ${siteConfig.apiUrl}/price-tags.
- Generate a printable PDF with POST ${siteConfig.apiUrl}/generate-pdf-v2.
- Check service readiness with GET ${siteConfig.apiUrl}/health.

Use the OpenAPI specification for request schemas, response formats, and the complete endpoint list.
`;

		return new NextResponse(fallbackContent, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
