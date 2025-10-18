import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// API to list all available theme previews

export async function GET() {
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
		console.error("Themes API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
