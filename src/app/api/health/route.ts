import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

interface HealthData {
	status: string;
	timestamp: string;
	uptime: string;
	version: string;
	service: string;
	environment: string;
	memory: unknown;
	responseTime: string;
	llm_integration: {
		openapi_spec_url: string;
		function_calling_ready: boolean;
		structured_outputs: boolean;
		max_items_per_request: number;
		supported_llms: string[];
	};
	endpoints: Record<string, string>;
}

export async function GET(): Promise<NextResponse<ApiResponse<HealthData>>> {
	const startTime = Date.now();

	const healthData = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime ? `${Math.floor(process.uptime())}s` : "unknown",
		version: "1.0.0",
		service: "Price Tag API",
		environment: process.env.NODE_ENV || "development",
		memory: process.memoryUsage
			? {
					used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
					total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
				}
			: "unknown",
		responseTime: `${Date.now() - startTime}ms`,
		llm_integration: {
			openapi_spec_url: "/api/openapi",
			function_calling_ready: true,
			structured_outputs: true,
			max_items_per_request: 1000,
			supported_llms: ["openai", "anthropic", "google", "azure"],
		},
		endpoints: {
			health: "/api/health",
			openapi_spec: "/api/openapi",
			price_tags_list: "/api/price-tags",
			price_tags_create: "/api/price-tags",
			price_tags_get: "/api/price-tags/{id}",
			price_tags_update: "/api/price-tags/{id}",
			price_tags_delete: "/api/price-tags/{id}",
			pdf_generation: "/api/generate-pdf-v2",
			html_generation: "/api/generate-html",
			excel_processing: "/api/process-excel",
			google_sheets: "/api/process-google-sheets",
		},
		api_capabilities: {
			crud_operations: ["create", "read", "update", "delete"],
			bulk_operations: true,
			filtering: ["search", "designType", "priceRange"],
			pagination: true,
			sorting: ["data", "price", "id"],
			pdf_formats: ["A4", "A3", "Letter"],
			design_themes: 17,
			fonts: ["montserrat", "nunito", "inter", "mont"],
			discount_system: true,
			multi_tier_pricing: true,
		},
		services: {
			telegram_bot: process.env.TELEGRAM_BOT_TOKEN
				? "configured"
				: "not_configured",
			google_sheets: process.env.GOOGLE_SHEETS_API_KEY
				? "configured"
				: "not_configured",
		},
	};

	return NextResponse.json(
		{
			success: true,
			data: healthData,
			message:
				"Price Tag API is running successfully and ready for LLM integration",
		},
		{
			status: 200,
			headers: {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				"X-API-Version": "1.0.0",
				"X-LLM-Ready": "true",
				"X-OpenAPI-Spec": "/api/openapi",
			},
		},
	);
}
