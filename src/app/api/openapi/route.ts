import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const openapiPath = join(process.cwd(), "public", "openapi.json");
		const openapiSpec = readFileSync(openapiPath, "utf8");
		const spec = JSON.parse(openapiSpec);

		// Update the server URL to match the current request
		const currentUrl = new URL(
			"/api",
			process.env.VERCEL_URL
				? `https://${process.env.VERCEL_URL}`
				: "http://localhost:3000",
		);
		spec.servers = [
			{
				url: currentUrl.toString(),
				description: "Current API server",
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
					url: "/api",
					description: "Current server",
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
