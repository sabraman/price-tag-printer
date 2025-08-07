import type React from "react";
import { Label } from "@/components/ui/label";
import type { ThemeSet } from "@/store/priceTagsStore";
import { PriceTagPreview } from "./PriceTagPreview";

interface FancyThemeSelectorProps {
	themes: ThemeSet;
	designType: string;
	onThemeChange: (themes: ThemeSet) => void;
}

const themeLabels: Record<string, string> = {
	white: "Белый",
	black: "Черный",
	sunset: "Закат",
	ocean: "Океан",
	forest: "Лес",
	royal: "Королевский",
	vintage: "Винтаж",
	neon: "Неон",
	monochrome: "Монохром",
	silver: "Серебро",
	charcoal: "Уголь",
	paper: "Бумага",
	ink: "Чернила",
	snow: "Снег",
};

export const FancyThemeSelector: React.FC<FancyThemeSelectorProps> = ({
	themes,
	designType,
	onThemeChange,
}) => {
	const designTypeLabels: Record<string, string> = {
		default: "Обычный",
		new: "Новинка",
		sale: "Распродажа",
	};

	// Get all color themes (exclude design behavior types)
	const colorThemes = Object.entries(themes).filter(
		([key]) => !["default", "new", "sale"].includes(key),
	);

	// Fallback: if no color themes found, create some basic ones
	if (colorThemes.length === 0) {
		console.warn("No color themes found, using fallback themes");
		// Add some basic color themes if they don't exist
		const fallbackThemes = [
			["white", { start: "#ffffff", end: "#ffffff", textColor: "#000000" }],
			["black", { start: "#000000", end: "#000000", textColor: "#ffffff" }],
			[
				"monochrome",
				{ start: "#4a4a4a", end: "#888888", textColor: "#ffffff" },
			],
			["silver", { start: "#c0c0c0", end: "#e8e8e8", textColor: "#000000" }],
			["sunset", { start: "#ff7e5f", end: "#feb47b", textColor: "#ffffff" }],
			["ocean", { start: "#667eea", end: "#764ba2", textColor: "#ffffff" }],
		] as [string, { start: string; end: string; textColor: string }][];

		colorThemes.push(...fallbackThemes);
	}

	console.log("FancyThemeSelector - All themes keys:", Object.keys(themes));
	console.log("FancyThemeSelector - All themes object:", themes);
	console.log(
		"FancyThemeSelector - Available color themes:",
		colorThemes.map(([key]) => key),
	);
	console.log("FancyThemeSelector - Design type:", designType);

	return (
		<div className="border p-4 rounded-lg space-y-4">
			<Label className="text-sm font-medium">
				Цветовая тема для "{designTypeLabels[designType] || designType}"
			</Label>
			<p className="text-xs text-muted-foreground mb-3">
				Выберите цвета для текущего типа дизайна
			</p>

			{/* Responsive grid with all color themes */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
				{colorThemes.map(([themeName, theme]) => {
					const label = themeLabels[themeName] || themeName;

					return (
						<button
							key={themeName}
							className="relative cursor-pointer transition-all hover:scale-105 border-2 rounded-lg overflow-hidden border-border hover:border-primary/50"
							onClick={() => {
								// Apply this color theme to the current design type
								const updatedThemes = {
									...themes,
									[designType]: {
										start: theme.start,
										end: theme.end,
										textColor: theme.textColor,
									},
								};
								onThemeChange(updatedThemes);
								console.log(`Applied ${themeName} colors to ${designType}`);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									// Apply this color theme to the current design type
									const updatedThemes = {
										...themes,
										[designType]: {
											start: theme.start,
											end: theme.end,
											textColor: theme.textColor,
										},
									};
									onThemeChange(updatedThemes);
									console.log(`Applied ${themeName} colors to ${designType}`);
								}
							}}
							aria-label={`Выбрать тему: ${themeName}`}
							type="button"
						>
							<div className="p-2">
								{/* Price tag preview with proper gradients */}
								<div className="relative w-full h-20 mx-auto mb-2 rounded overflow-hidden border bg-gray-50">
									<div className="absolute inset-0 flex items-center justify-center">
										<PriceTagPreview
											theme={theme}
											designType={
												designType as "default" | "new" | "sale" | "table"
											}
											width={120}
											height={80}
											viewBox="0 0 120 80"
											showLabels={true}
											showBorder={false}
											uniqueId={`fancy-${themeName}`}
											className="max-w-full max-h-full"
										/>
									</div>
								</div>

								{/* Theme name */}
								<p className="text-xs text-center font-medium truncate px-1">
									{label}
								</p>
							</div>
						</button>
					);
				})}
			</div>

			{/* Debug info */}
			<p className="text-xs text-muted-foreground">
				Найдено тем: {colorThemes.length}
			</p>
		</div>
	);
};
