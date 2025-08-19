import { createCanvas } from "canvas";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	console.log("Canvas preview API called");

	try {
		const { searchParams } = new URL(request.url);

		const designType = searchParams.get("designType") || "default";
		const productName = searchParams.get("productName") || "ТОВАР ПРИМЕР";
		const price = parseInt(searchParams.get("price") || "1000");
		const discountPrice = parseInt(searchParams.get("discountPrice") || "800");
		const hasDiscount = searchParams.get("hasDiscount") === "true";

		// Theme colors
		const themeStart = searchParams.get("themeStart") || "#3b82f6";
		const themeEnd = searchParams.get("themeEnd") || "#1d4ed8";
		const themeTextColor = searchParams.get("themeTextColor") || "#ffffff";

		// Create canvas
		const canvas = createCanvas(400, 275);
		const ctx = canvas.getContext("2d");

		// Create gradient background
		const gradient = ctx.createLinearGradient(0, 0, 400, 275);
		gradient.addColorStop(0, themeStart);
		gradient.addColorStop(1, themeEnd);

		// Fill background
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 400, 275);

		// Add border for white/black themes
		if (designType === "white" || designType === "black") {
			ctx.strokeStyle = designType === "white" ? "#e5e5e5" : "#333333";
			ctx.lineWidth = designType === "white" ? 3 : 2;
			ctx.strokeRect(0, 0, 400, 275);
		}

		// Format price
		const formatNumber = (num: number) => {
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		};

		// Draw product name
		ctx.fillStyle = themeTextColor;
		ctx.font = "bold 32px Arial";
		ctx.textAlign = "left";
		ctx.fillText(productName.toUpperCase().substring(0, 20), 25, 50);

		// Draw main price
		ctx.font = "bold 80px Arial";
		ctx.textAlign = "center";
		ctx.fillText(formatNumber(price), 200, 160);

		// Draw discount price if enabled
		if (hasDiscount && discountPrice !== price) {
			ctx.font = "28px Arial";
			ctx.textAlign = "left";
			ctx.globalAlpha = 0.8;
			ctx.fillText(formatNumber(discountPrice), 25, 220);
			ctx.globalAlpha = 1.0;
		}

		// Draw cutting lines
		ctx.strokeStyle = themeTextColor;
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = 1;
		ctx.setLineDash([20, 5]);

		// Top line
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(400, 0);
		ctx.stroke();

		// Bottom line
		ctx.beginPath();
		ctx.moveTo(0, 275);
		ctx.lineTo(400, 275);
		ctx.stroke();

		// Left line
		ctx.setLineDash([15, 5]);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 275);
		ctx.stroke();

		// Right line
		ctx.beginPath();
		ctx.moveTo(400, 0);
		ctx.lineTo(400, 275);
		ctx.stroke();

		ctx.globalAlpha = 1.0;
		ctx.setLineDash([]);

		// Convert to PNG buffer
		const buffer = canvas.toBuffer("image/png");

		console.log("Canvas PNG generated successfully");

		return new Response(buffer, {
			status: 200,
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	} catch (error) {
		console.error("Canvas preview error:", error);

		return new Response("Error generating preview", {
			status: 500,
			headers: { "Content-Type": "text/plain" },
		});
	}
}
