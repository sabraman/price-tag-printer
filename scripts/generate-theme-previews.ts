#!/usr/bin/env tsx

/**
 * Theme Preview Generator
 *
 * Generates static preview images for all themes once.
 * These images are served as static files - no runtime generation needed!
 *
 * Auto-runs during build and dev start.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Theme definitions - sync with store/priceTagsStore.ts
const themes = {
	default: { start: '#222222', end: '#dd4c9b', textColor: '#ffffff' },
	new: { start: '#222222', end: '#9cdd4c', textColor: '#ffffff' },
	sale: { start: '#222222', end: '#dd4c54', textColor: '#ffffff' },
	white: { start: '#ffffff', end: '#ffffff', textColor: '#000000' },
	black: { start: '#000000', end: '#000000', textColor: '#ffffff' },
	sunset: { start: '#ff7e5f', end: '#feb47b', textColor: '#ffffff' },
	ocean: { start: '#667eea', end: '#764ba2', textColor: '#ffffff' },
	forest: { start: '#134e5e', end: '#71b280', textColor: '#ffffff' },
	royal: { start: '#4c63d2', end: '#9c27b0', textColor: '#ffffff' },
	vintage: { start: '#8b4513', end: '#d2b48c', textColor: '#ffffff' },
	neon: { start: '#00ff00', end: '#ff00ff', textColor: '#000000' },
	monochrome: { start: '#4a4a4a', end: '#888888', textColor: '#ffffff' },
	silver: { start: '#c0c0c0', end: '#e8e8e8', textColor: '#000000' },
	charcoal: { start: '#2c2c2c', end: '#2c2c2c', textColor: '#ffffff' },
	paper: { start: '#f8f8f8', end: '#f0f0f0', textColor: '#333333' },
	ink: { start: '#1a1a1a', end: '#1a1a1a', textColor: '#ffffff' },
	snow: { start: '#ffffff', end: '#f5f5f5', textColor: '#000000' }
};

interface Theme {
	start: string;
	end: string;
	textColor: string;
}

// Create SVG template for theme preview
const createSVG = (themeName: string, theme: Theme): string => {
	const { start, end, textColor } = theme;
	const isGradient = start !== end;

	// Determine if border is needed (for solid colors)
	const needsBorder = themeName === 'white' || themeName === 'black' || start === end;
	const borderColor = themeName === 'white' ? '#e5e5e5' : '#333333';
	const borderWidth = themeName === 'white' ? '3.75px' : '2.5px';

	// Cutting line color
	const cutLineColor = textColor !== '#ffffff' ? '#000000' : '#ffffff';

	// Theme label
	const showLabel = themeName === 'new' || themeName === 'sale';
	const labelColor = themeName === 'new' ? themes.new.start : themes.sale.start;
	const labelText = themeName === 'new' ? 'NEW' : 'SALE';

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="275" xmlns="http://www.w3.org/2000/svg">
	<defs>
		${isGradient ? `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" style="stop-color:${start};stop-opacity:1" />
			<stop offset="100%" style="stop-color:${end};stop-opacity:1" />
		</linearGradient>` : ''}
	</defs>

	<!-- Background -->
	<rect width="400" height="275" fill="${isGradient ? 'url(#bg)' : start}" />

	<!-- Border (if needed) -->
	${needsBorder ? `<rect width="394" height="269" x="3" y="3" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />` : ''}

	<!-- Product Name -->
	<text x="50" y="80" font-family="Arial, sans-serif" font-size="40" font-weight="500" fill="${textColor}" text-anchor="start">
		PRIMER TOVARA
	</text>

	<!-- Price -->
	<text x="200" y="180" font-family="Arial, sans-serif" font-size="130" font-weight="bold" fill="${textColor}" text-anchor="middle">
		2 999
	</text>

	<!-- Discount Price -->
	<text x="340" y="230" font-family="Arial, sans-serif" font-size="45" font-weight="400" fill="${textColor}" opacity="0.8" text-anchor="end">
		800
	</text>

	<!-- Theme Label (if applicable) -->
	${showLabel ? `<text x="520" y="310" font-family="Arial, sans-serif" font-size="130" font-weight="900" fill="${labelColor}" text-anchor="middle" transform="rotate(-90 520 310)">
		${labelText}
	</text>` : ''}

	<!-- Discount Text -->
	<text x="200" y="310" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="${textColor}" opacity="0.8" text-anchor="middle">
		tsena pri podpiske
	</text>
	<text x="200" y="330" font-family="Arial, sans-serif" font-size="20" font-weight="500" fill="${textColor}" opacity="0.8" text-anchor="middle">
		na telegram kanal
	</text>

	<!-- Cutting Lines -->
	<line x1="0" y1="0" x2="400" y2="0" stroke="${cutLineColor}" stroke-width="1.5" stroke-dasharray="30,7.5" />
	<line x1="0" y1="275" x2="400" y2="275" stroke="${cutLineColor}" stroke-width="1.5" stroke-dasharray="30,7.5" />
	<line x1="0" y1="0" x2="0" y2="275" stroke="${cutLineColor}" stroke-width="1.5" stroke-dasharray="20,7.5" />
	<line x1="400" y1="0" x2="400" y2="275" stroke="${cutLineColor}" stroke-width="1.5" stroke-dasharray="20,7.5" />
</svg>`;
};

// Main generation function
export async function generateThemePreviews(): Promise<void> {
	const publicDir = path.join(__dirname, '..', 'public');
	const previewsDir = path.join(publicDir, 'theme-previews');

	console.log('🎨 Generating theme previews...');

	// Ensure directories exist
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true });
	}

	if (!fs.existsSync(previewsDir)) {
		fs.mkdirSync(previewsDir, { recursive: true });
	}

	const generatedFiles = [];

	// Generate SVG for each theme
	for (const [themeName, theme] of Object.entries(themes)) {
		const svg = createSVG(themeName, theme);
		const svgPath = path.join(previewsDir, `${themeName}.svg`);

		// Save SVG
		fs.writeFileSync(svgPath, svg);
		console.log(`✅ Generated SVG: ${themeName}.svg`);
		generatedFiles.push(`${themeName}.svg`);
	}

	// Generate index file with theme metadata
	const indexData = {
		generated: new Date().toISOString(),
		themes: Object.keys(themes),
		baseUrl: '/theme-previews',
		files: generatedFiles
	};

	fs.writeFileSync(
		path.join(previewsDir, 'index.json'),
		JSON.stringify(indexData, null, 2)
	);

	console.log(`📁 Generated ${generatedFiles.length} theme previews in /public/theme-previews/`);
	console.log('🌐 These files will be served statically at: https://yoursite.com/theme-previews/[theme-name].svg');
	console.log('');
	console.log('🤖 Bot can now use static URLs:');
	console.log('   /theme-previews/default.svg');
	console.log('   /theme-previews/new.svg');
	console.log('   /theme-previews/sale.svg');
	console.log('   ...etc');
}

// Run if called directly
generateThemePreviews().catch(console.error);