import { NextResponse } from "next/server";
import { ThemeStore } from "@/lib/themes";

/**
 * Unified Theme API Endpoint
 *
 * Provides themes for all platforms:
 * - Web app (default themes)
 * - Bot (with metadata)
 * - External API consumers
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const format = searchParams.get("format") || "json";
	const platform = searchParams.get("platform") || "web";
	const themeId = searchParams.get("id");

	try {
		// Single theme request
		if (themeId) {
			const theme = ThemeStore.getTheme(
				themeId as keyof import("@/lib/themes").ThemeSet,
			);
			const metadata = ThemeStore.getThemeMetadata(
				themeId as keyof import("@/lib/themes").ThemeSet,
			);

			if (!theme) {
				return NextResponse.json({ error: "Theme not found" }, { status: 404 });
			}

			const response = {
				id: themeId,
				theme,
				metadata,
			};

			return format === "json"
				? NextResponse.json(response)
				: NextResponse.json(response, {
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
						},
					});
		}

		// Platform-specific responses
		switch (platform) {
			case "bot": {
				const botThemes = ThemeStore.getBotThemes();
				return NextResponse.json({
					themes: botThemes,
					categories: ThemeStore.getThemesByCategories(),
					version: "1.0.0",
					platform: "bot",
				});
			}

			case "api": {
				const serialized = ThemeStore.serializeThemes();
				const data = JSON.parse(serialized);
				data.categories = ThemeStore.getThemesByCategories();
				return NextResponse.json(data, {
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Cache-Control": "public, max-age=3600", // 1 hour cache
					},
				});
			}

			case "web":
			default:
				return NextResponse.json({
					themes: ThemeStore.getAllThemes(),
					metadata: ThemeStore.getAllThemeMetadata(),
					categories: ThemeStore.getThemesByCategories(),
					version: "1.0.0",
					platform: "web",
				});
		}
	} catch (error) {
		console.error("Theme API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * Theme validation endpoint
 */
export async function POST(request: Request) {
	try {
		const { themes, validate } = await request.json();

		if (validate) {
			const isValid = Object.values(themes).every((theme: any) =>
				ThemeStore.validateTheme(theme),
			);

			return NextResponse.json({
				valid: isValid,
				errors: isValid ? [] : ["Invalid theme structure detected"],
			});
		}

		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	} catch (error) {
		console.error("Theme validation error:", error);
		return NextResponse.json(
			{ error: "Invalid request format" },
			{ status: 400 },
		);
	}
}
