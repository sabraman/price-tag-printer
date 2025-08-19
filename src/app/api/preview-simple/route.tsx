import type { NextRequest } from "next/server";

// Simple SVG-based preview generation without @vercel/og
export async function GET(request: NextRequest) {
	console.log("Simple preview API called");

	try {
		const { searchParams } = new URL(request.url);

		const _designType = searchParams.get("designType") || "default";
		const _font = searchParams.get("font") || "montserrat";
		const hasDiscount = searchParams.get("hasDiscount") === "true";
		const productName = searchParams.get("productName") || "ТОВАР ПРИМЕР";
		const price = parseInt(searchParams.get("price") || "1000");
		const discountPrice = parseInt(searchParams.get("discountPrice") || "800");

		// Theme colors
		const themeStart = searchParams.get("themeStart") || "#3b82f6";
		const themeEnd = searchParams.get("themeEnd") || "#1d4ed8";
		const themeTextColor = searchParams.get("themeTextColor") || "#ffffff";

		// Format numbers
		const formatNumber = (num: number) => {
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		};

		const formattedPrice = formatNumber(price);
		const formattedDiscountPrice = formatNumber(discountPrice);

		// Create simple SVG
		const svg = `
      <svg width="400" height="275" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${themeStart}"/>
            <stop offset="100%" style="stop-color:${themeEnd}"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="275" fill="url(#grad)"/>
        
        <!-- Product name -->
        <text x="25" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              fill="${themeTextColor}" text-transform="uppercase">${productName}</text>
        
        <!-- Price -->
        <text x="200" y="150" font-family="Arial, sans-serif" font-size="60" font-weight="bold" 
              fill="${themeTextColor}" text-anchor="middle">${formattedPrice}</text>
        
        ${
					hasDiscount
						? `
        <!-- Discount price -->
        <text x="50" y="200" font-family="Arial, sans-serif" font-size="24" 
              fill="${themeTextColor}" opacity="0.8">${formattedDiscountPrice}</text>
        `
						: ""
				}
        
        <!-- Cutting lines -->
        <line x1="0" y1="0" x2="400" y2="0" stroke="${themeTextColor}" stroke-width="1" stroke-dasharray="20,5" opacity="0.5"/>
        <line x1="0" y1="275" x2="400" y2="275" stroke="${themeTextColor}" stroke-width="1" stroke-dasharray="20,5" opacity="0.5"/>
        <line x1="0" y1="0" x2="0" y2="275" stroke="${themeTextColor}" stroke-width="1" stroke-dasharray="15,5" opacity="0.5"/>
        <line x1="400" y1="0" x2="400" y2="275" stroke="${themeTextColor}" stroke-width="1" stroke-dasharray="15,5" opacity="0.5"/>
      </svg>
    `;

		console.log("Simple SVG preview generated successfully");

		// Создаем data URL для использования как изображение
		const base64Svg = Buffer.from(svg).toString("base64");
		const _dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

		// Telegram нужен PNG. Давайте вернем SVG как HTML с автоконвертацией
		const htmlWithSvg = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 0; background: transparent; }
        </style>
    </head>
    <body>
        ${svg}
    </body>
    </html>
    `;

		return new Response(htmlWithSvg, {
			status: 200,
			headers: {
				"Content-Type": "text/html",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	} catch (error) {
		console.error("Simple preview error:", error);

		return new Response("Error generating preview", {
			status: 500,
			headers: { "Content-Type": "text/plain" },
		});
	}
}
