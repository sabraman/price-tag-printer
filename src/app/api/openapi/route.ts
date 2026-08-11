import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export async function GET() {
	try {
		const openapiPath = join(process.cwd(), "public", "openapi.json");
		const openapiSpec = readFileSync(openapiPath, "utf8");
		const spec = JSON.parse(openapiSpec);

		// Keep generated examples stable across local, preview, and production builds.
		spec.servers = [
			{
				url: siteConfig.apiUrl,
				description: "Production API server",
			},
		];

		return NextResponse.json(spec, {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Failed to serve OpenAPI spec:", error);

		// Fallback minimal spec if file read fails
		const fallbackSpec = {
			openapi: "3.0.3",
			info: {
				title: "Price Tag API",
				version: "1.0.0",
				description:
					"LLM-friendly REST API for creating and managing price tags with PDF export",
			},
			servers: [
				{
					url: siteConfig.apiUrl,
					description: "Production API server",
				},
			],
			paths: {
				"/health": {
					get: {
						operationId: "checkHealth",
						summary: "Check API health status",
						description:
							"Returns comprehensive health status including uptime, memory usage, and service availability",
						responses: {
							"200": {
								description: "API is healthy and operational",
							},
						},
					},
				},
			},
		};

		return NextResponse.json(fallbackSpec, {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
