"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Theme, ThemeSet } from "@/store/priceTagsStore";

interface GradientPickerProps {
	themes: ThemeSet;
	onChange: (themes: ThemeSet) => void;
	className?: string;
}

// Create a helper to generate a complete theme set with defaults for unused themes
const createCompleteThemeSet = (overrides: Partial<ThemeSet>): ThemeSet => {
	const defaultTheme = {
		start: "#222222",
		end: "#dd4c9b",
		textColor: "#ffffff",
	};
	const newTheme = { start: "#222222", end: "#9cdd4c", textColor: "#ffffff" };
	const saleTheme = { start: "#222222", end: "#dd4c54", textColor: "#ffffff" };

	return {
		default: defaultTheme,
		new: newTheme,
		sale: saleTheme,
		white: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
		black: { start: "#000000", end: "#000000", textColor: "#ffffff" },
		sunset: { start: "#ff7e5f", end: "#feb47b", textColor: "#ffffff" },
		ocean: { start: "#667eea", end: "#764ba2", textColor: "#ffffff" },
		forest: { start: "#134e5e", end: "#71b280", textColor: "#ffffff" },
		royal: { start: "#4c63d2", end: "#9c27b0", textColor: "#ffffff" },
		vintage: { start: "#8b4513", end: "#d2b48c", textColor: "#ffffff" },
		neon: { start: "#00ff00", end: "#ff00ff", textColor: "#000000" },
		monochrome: { start: "#4a4a4a", end: "#888888", textColor: "#ffffff" },
		silver: { start: "#c0c0c0", end: "#e8e8e8", textColor: "#000000" },
		charcoal: { start: "#2c2c2c", end: "#2c2c2c", textColor: "#ffffff" },
		paper: { start: "#f8f8f8", end: "#f0f0f0", textColor: "#333333" },
		ink: { start: "#1a1a1a", end: "#1a1a1a", textColor: "#ffffff" },
		snow: { start: "#ffffff", end: "#f5f5f5", textColor: "#000000" },
		...overrides,
	};
};

const darkThemePresets: ThemeSet[] = [
	// Classic Dark (original)
	createCompleteThemeSet({
		default: { start: "#222222", end: "#dd4c9b", textColor: "#ffffff" },
		new: { start: "#222222", end: "#9cdd4c", textColor: "#ffffff" },
		sale: { start: "#222222", end: "#dd4c54", textColor: "#ffffff" },
	}),
	// Dark Monochrome (original)
	createCompleteThemeSet({
		default: { start: "#000000", end: "#666666", textColor: "#ffffff" },
		new: { start: "#000000", end: "#808080", textColor: "#ffffff" },
		sale: { start: "#000000", end: "#999999", textColor: "#ffffff" },
	}),
	// Dark Slate (original)
	createCompleteThemeSet({
		default: { start: "#2f4550", end: "#b2d1d1", textColor: "#ffffff" },
		new: { start: "#2f4550", end: "#b8dbd9", textColor: "#ffffff" },
		sale: { start: "#2f4550", end: "#e2e2e6", textColor: "#ffffff" },
	}),
	// Vapar (original)
	createCompleteThemeSet({
		default: { start: "#dd4c9b", end: "#f6989a", textColor: "#ffffff" },
		new: { start: "#dd4c9b", end: "#f6989a", textColor: "#ffffff" },
		sale: { start: "#ee4a61", end: "#f6989a", textColor: "#ffffff" },
	}),
	// Sunset (original)
	createCompleteThemeSet({
		default: { start: "#2B2827", end: "#FF731D", textColor: "#ffffff" },
		new: { start: "#2B2827", end: "#E2E0FF", textColor: "#ffffff" },
		sale: { start: "#2B2827", end: "#FE4152", textColor: "#ffffff" },
	}),
];

const lightThemePresets: ThemeSet[] = [
	// Light Blue (like dark themes with consistent gradients)
	createCompleteThemeSet({
		default: { start: "#e3f2fd", end: "#90caf9", textColor: "#0d47a1" },
		new: { start: "#e3f2fd", end: "#81c784", textColor: "#1b5e20" },
		sale: { start: "#e3f2fd", end: "#ef5350", textColor: "#b71c1c" },
	}),
	// Light Green
	createCompleteThemeSet({
		default: { start: "#e8f5e8", end: "#a5d6a7", textColor: "#1b5e20" },
		new: { start: "#e8f5e8", end: "#66bb6a", textColor: "#1b5e20" },
		sale: { start: "#e8f5e8", end: "#ef5350", textColor: "#b71c1c" },
	}),
	// Light Orange
	createCompleteThemeSet({
		default: { start: "#fff3e0", end: "#ffb74d", textColor: "#e65100" },
		new: { start: "#fff3e0", end: "#66bb6a", textColor: "#1b5e20" },
		sale: { start: "#fff3e0", end: "#ef5350", textColor: "#b71c1c" },
	}),
	// Light Purple
	createCompleteThemeSet({
		default: { start: "#f3e5f5", end: "#ba68c8", textColor: "#4a148c" },
		new: { start: "#f3e5f5", end: "#66bb6a", textColor: "#1b5e20" },
		sale: { start: "#f3e5f5", end: "#ef5350", textColor: "#b71c1c" },
	}),
];

const lightMonochromeThemePresets: ThemeSet[] = [
	// Pure White
	createCompleteThemeSet({
		default: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
		new: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
		sale: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
	}),
	// Light Gray
	createCompleteThemeSet({
		default: { start: "#f3f4f6", end: "#f3f4f6", textColor: "#111827" },
		new: { start: "#f3f4f6", end: "#f3f4f6", textColor: "#111827" },
		sale: { start: "#f3f4f6", end: "#f3f4f6", textColor: "#111827" },
	}),
	// Silver
	createCompleteThemeSet({
		default: { start: "#d1d5db", end: "#d1d5db", textColor: "#374151" },
		new: { start: "#d1d5db", end: "#d1d5db", textColor: "#374151" },
		sale: { start: "#d1d5db", end: "#d1d5db", textColor: "#374151" },
	}),
];

const darkMonochromeThemePresets: ThemeSet[] = [
	// Pure Black
	createCompleteThemeSet({
		default: { start: "#000000", end: "#000000", textColor: "#ffffff" },
		new: { start: "#000000", end: "#000000", textColor: "#ffffff" },
		sale: { start: "#000000", end: "#000000", textColor: "#ffffff" },
	}),
	// Dark Gray
	createCompleteThemeSet({
		default: { start: "#111827", end: "#111827", textColor: "#ffffff" },
		new: { start: "#111827", end: "#111827", textColor: "#ffffff" },
		sale: { start: "#111827", end: "#111827", textColor: "#ffffff" },
	}),
	// Charcoal
	createCompleteThemeSet({
		default: { start: "#374151", end: "#374151", textColor: "#ffffff" },
		new: { start: "#374151", end: "#374151", textColor: "#ffffff" },
		sale: { start: "#374151", end: "#374151", textColor: "#ffffff" },
	}),
];

// Создаем уникальные id для тем
const darkThemeIds = [
	"classic-dark",
	"ocean-deep",
	"forest-night",
	"royal-purple",
	"sunset-glow",
];
const lightThemeIds = [
	"light-blue",
	"light-green",
	"light-orange",
	"light-purple",
];
const lightMonochromeThemeIds = [
	"white-mono",
	"light-gray-mono",
	"silver-mono",
];

const darkMonochromeThemeIds = [
	"black-mono",
	"dark-gray-mono",
	"charcoal-mono",
];

export function GradientPicker({
	themes,
	onChange,
	className,
}: GradientPickerProps) {
	const defaultTab = useMemo(() => "presets", []);

	const getGradientStyle = (theme: Theme) => {
		return `linear-gradient(to right, ${theme.start}, ${theme.end})`;
	};

	return (
		<Card className={className}>
			<CardContent className="p-4">
				<Tabs defaultValue={defaultTab} className="w-full">
					<TabsList className="w-full mb-4">
						<TabsTrigger className="flex-1" value="presets">
							Готовые схемы
						</TabsTrigger>
						<TabsTrigger className="flex-1" value="custom">
							Настроить
						</TabsTrigger>
					</TabsList>

					<TabsContent value="presets" className="mt-0">
						<div className="space-y-6">
							{/* Dark Themes */}
							<div className="space-y-3">
								<h3 className="text-sm font-medium">Темные темы</h3>
								<div className="grid grid-cols-3 gap-2">
									{darkThemePresets.map((preset, i) => (
										<Button
											type="button"
											key={darkThemeIds[i]}
											className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
											onClick={() => onChange(preset)}
										>
											<div className="w-full h-full grid grid-rows-3">
												<div
													style={{
														background: getGradientStyle(preset.default),
													}}
												/>
												<div
													style={{ background: getGradientStyle(preset.new) }}
												/>
												<div
													style={{ background: getGradientStyle(preset.sale) }}
												/>
											</div>
										</Button>
									))}
								</div>
							</div>

							{/* Light Themes */}
							<div className="space-y-3">
								<h3 className="text-sm font-medium">Светлые темы</h3>
								<div className="grid grid-cols-3 gap-2">
									{lightThemePresets.map((preset, i) => (
										<Button
											type="button"
											key={lightThemeIds[i]}
											className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
											onClick={() => onChange(preset)}
										>
											<div className="w-full h-full grid grid-rows-3">
												<div
													style={{
														background: getGradientStyle(preset.default),
													}}
												/>
												<div
													style={{ background: getGradientStyle(preset.new) }}
												/>
												<div
													style={{ background: getGradientStyle(preset.sale) }}
												/>
											</div>
										</Button>
									))}
								</div>
							</div>

							{/* Light Monochrome Themes */}
							<div className="space-y-3">
								<h3 className="text-sm font-medium">
									Светлые монохромные темы
								</h3>
								<div className="grid grid-cols-3 gap-2">
									{lightMonochromeThemePresets.map((preset, i) => (
										<Button
											type="button"
											key={lightMonochromeThemeIds[i]}
											className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
											onClick={() => onChange(preset)}
										>
											<div className="w-full h-full grid grid-rows-3">
												<div
													style={{
														background: getGradientStyle(preset.default),
													}}
												/>
												<div
													style={{ background: getGradientStyle(preset.new) }}
												/>
												<div
													style={{ background: getGradientStyle(preset.sale) }}
												/>
											</div>
										</Button>
									))}
								</div>
							</div>

							{/* Dark Monochrome Themes */}
							<div className="space-y-3">
								<h3 className="text-sm font-medium">Темные монохромные темы</h3>
								<div className="grid grid-cols-3 gap-2">
									{darkMonochromeThemePresets.map((preset, i) => (
										<Button
											type="button"
											key={darkMonochromeThemeIds[i]}
											className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
											onClick={() => onChange(preset)}
										>
											<div className="w-full h-full grid grid-rows-3">
												<div
													style={{
														background: getGradientStyle(preset.default),
													}}
												/>
												<div
													style={{ background: getGradientStyle(preset.new) }}
												/>
												<div
													style={{ background: getGradientStyle(preset.sale) }}
												/>
											</div>
										</Button>
									))}
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="custom" className="mt-0">
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Обычный ценник</h3>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<label
											htmlFor="default-start"
											className="text-xs mb-1 block"
										>
											Начальный
										</label>
										<Input
											id="default-start"
											value={themes.default.start}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													default: { ...themes.default, start: e.target.value },
												})
											}
										/>
									</div>
									<div>
										<label htmlFor="default-end" className="text-xs mb-1 block">
											Конечный
										</label>
										<Input
											id="default-end"
											value={themes.default.end}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													default: { ...themes.default, end: e.target.value },
												})
											}
										/>
									</div>
								</div>
								<div
									className="h-6 rounded-md"
									style={{ background: getGradientStyle(themes.default) }}
								/>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-medium">Новинка</h3>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<label htmlFor="new-start" className="text-xs mb-1 block">
											Начальный
										</label>
										<Input
											id="new-start"
											value={themes.new.start}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													new: { ...themes.new, start: e.target.value },
												})
											}
										/>
									</div>
									<div>
										<label htmlFor="new-end" className="text-xs mb-1 block">
											Конечный
										</label>
										<Input
											id="new-end"
											value={themes.new.end}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													new: { ...themes.new, end: e.target.value },
												})
											}
										/>
									</div>
								</div>
								<div
									className="h-6 rounded-md"
									style={{ background: getGradientStyle(themes.new) }}
								/>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-medium">Распродажа</h3>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<label htmlFor="sale-start" className="text-xs mb-1 block">
											Начальный
										</label>
										<Input
											id="sale-start"
											value={themes.sale.start}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													sale: { ...themes.sale, start: e.target.value },
												})
											}
										/>
									</div>
									<div>
										<label htmlFor="sale-end" className="text-xs mb-1 block">
											Конечный
										</label>
										<Input
											id="sale-end"
											value={themes.sale.end}
											className="h-8"
											onChange={(e) =>
												onChange({
													...themes,
													sale: { ...themes.sale, end: e.target.value },
												})
											}
										/>
									</div>
								</div>
								<div
									className="h-6 rounded-md"
									style={{ background: getGradientStyle(themes.sale) }}
								/>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
