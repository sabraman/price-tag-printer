import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Static theme preview API - serves pre-generated theme previews
// Much faster and more reliable than dynamic generation

interface ThemePreviewResponse {
	success: boolean;
	data?: {
		themeName: string;
		previewUrl: string;
		svgContent?: string;
	};
	error?: string;
}

export async function GET(
	request: Request,
): Promise<NextResponse<ThemePreviewResponse>> {
	try {
		const { searchParams } = new URL(request.url);
		const themeName = searchParams.get("theme") || "default";

		// Validate theme name
		const validThemes = [
			"default",
			"new",
			"sale",
			"white",
			"black",
			"sunset",
			"ocean",
			"forest",
			"royal",
			"vintage",
			"neon",
			"monochrome",
			"silver",
			"charcoal",
			"paper",
			"ink",
			"snow",
		];

		if (!validThemes.includes(themeName)) {
			return NextResponse.json(
				{
					success: false,
					error: `Invalid theme "${themeName}". Valid themes: ${validThemes.join(", ")}`,
				},
				{ status: 400 },
			);
		}

		// Check if static preview exists
		const publicDir = path.join(process.cwd(), "public");
		const svgPath = path.join(publicDir, "theme-previews", `${themeName}.svg`);

		if (!fs.existsSync(svgPath)) {
			return NextResponse.json(
				{
					success: false,
					error: `Theme preview not found for "${themeName}". Run "pnpm generate-theme-previews" to create previews.`,
				},
				{ status: 404 },
			);
		}

		// Get base URL for constructing full URL
		const baseUrl =
			process.env.NEXT_PUBLIC_BASE_URL ||
			(request.headers.get("host")
				? `https://${request.headers.get("host")}`
				: "http://localhost:3000");

		const previewUrl = `${baseUrl}/theme-previews/${themeName}.svg`;

		// Option: Return SVG content directly (useful for debugging)
		const returnSvgContent = searchParams.get("svg") === "true";
		let svgContent: string | undefined;

		if (returnSvgContent) {
			svgContent = fs.readFileSync(svgPath, "utf-8");
		}

		return NextResponse.json({
			success: true,
			data: {
				themeName,
				previewUrl,
				svgContent,
			},
		});
	} catch (error) {
		console.error("Theme preview API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// GET /api/theme-preview/theme-list - List all available themes
export async function getAllThemes(): Promise<NextResponse> {
	try {
		const publicDir = path.join(process.cwd(), "public");
		const indexPath = path.join(publicDir, "theme-previews", "index.json");

		if (!fs.existsSync(indexPath)) {
			return NextResponse.json(
				{
					success: false,
					error:
						'Theme previews not generated. Run "pnpm generate-theme-previews" first.',
				},
				{ status: 404 },
			);
		}

		const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

		return NextResponse.json({
			success: true,
			data: indexData,
		});
	} catch (error) {
		console.error("Theme list API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
