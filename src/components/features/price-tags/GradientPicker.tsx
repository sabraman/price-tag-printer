"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Theme, ThemeSet } from "@/store/priceTagsStore";

interface GradientPickerProps {
	themes: ThemeSet;
	onChange: (themes: ThemeSet) => void;
	className?: string;
	cuttingLineColor?: string;
	onCuttingLineColorChange?: (color: string) => void;
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
	cuttingLineColor = "#cccccc",
	onCuttingLineColorChange,
}: GradientPickerProps) {
	const defaultTab = useMemo(() => "presets", []);

	const getGradientStyle = (theme: Theme) => {
		return `linear-gradient(135deg, ${theme.start}, ${theme.end})`;
	};

	const _isMonochrome = (theme: Theme) => {
		return theme.start === theme.end;
	};

	return (
		<div className={className}>
			<Tabs defaultValue={defaultTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-9 mb-3">
					<TabsTrigger value="presets" className="text-xs">
						🎨 Готовые
					</TabsTrigger>
					<TabsTrigger value="custom" className="text-xs">
						⚙️ Настроить
					</TabsTrigger>
				</TabsList>

				<TabsContent value="presets" className="mt-0">
					<div className="space-y-4">
						{/* Dark Themes */}
						<div className="space-y-2">
							<h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
								🌑 Темные темы
							</h3>
							<div className="grid grid-cols-4 gap-2">
								{darkThemePresets.map((preset, i) => (
									<button
										type="button"
										key={darkThemeIds[i]}
										className="group relative overflow-hidden rounded-lg hover:border-primary/50 transition-all duration-200 hover:scale-105 aspect-square"
										onClick={() => onChange(preset)}
									>
										<div className="w-full h-full grid grid-rows-3">
											<div
												style={{
													background: getGradientStyle(preset.default),
												}}
												className="w-full h-full"
											/>
											<div
												style={{ background: getGradientStyle(preset.new) }}
												className="w-full h-full"
											/>
											<div
												style={{ background: getGradientStyle(preset.sale) }}
												className="w-full h-full"
											/>
										</div>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
									</button>
								))}
							</div>
						</div>

						{/* Light Themes */}
						<div className="space-y-2">
							<h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
								☀️ Светлые темы
							</h3>
							<div className="grid grid-cols-4 gap-2">
								{lightThemePresets.map((preset, i) => (
									<button
										type="button"
										key={lightThemeIds[i]}
										className="group relative overflow-hidden rounded-lg hover:border-primary/50 transition-all duration-200 hover:scale-105 aspect-square"
										onClick={() => onChange(preset)}
									>
										<div className="w-full h-full grid grid-rows-3">
											<div
												style={{
													background: getGradientStyle(preset.default),
												}}
												className="w-full h-full"
											/>
											<div
												style={{ background: getGradientStyle(preset.new) }}
												className="w-full h-full"
											/>
											<div
												style={{ background: getGradientStyle(preset.sale) }}
												className="w-full h-full"
											/>
										</div>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
									</button>
								))}
							</div>
						</div>

						{/* Light Monochrome Themes */}
						<div className="space-y-2">
							<h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
								⚪ Светлые монохром
							</h3>
							<div className="grid grid-cols-4 gap-2">
								{lightMonochromeThemePresets.map((preset, i) => (
									<button
										type="button"
										key={lightMonochromeThemeIds[i]}
										className="group relative overflow-hidden rounded-lg hover:border-primary/50 transition-all duration-200 hover:scale-105 aspect-square"
										onClick={() => onChange(preset)}
									>
										<div
											className="w-full h-full flex items-center justify-center"
											style={{ backgroundColor: preset.default.start }}
										>
											<span
												className="text-xs font-medium"
												style={{ color: preset.default.textColor }}
											>
												Аа
											</span>
										</div>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
									</button>
								))}
							</div>
						</div>

						{/* Dark Monochrome Themes */}
						<div className="space-y-2">
							<h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
								⚫ Темные монохром
							</h3>
							<div className="grid grid-cols-4 gap-2">
								{darkMonochromeThemePresets.map((preset, i) => (
									<button
										type="button"
										key={darkMonochromeThemeIds[i]}
										className="group relative overflow-hidden rounded-lg hover:border-primary/50 transition-all duration-200 hover:scale-105 aspect-square"
										onClick={() => onChange(preset)}
									>
										<div
											className="w-full h-full flex items-center justify-center"
											style={{ backgroundColor: preset.default.start }}
										>
											<span
												className="text-xs font-medium"
												style={{ color: preset.default.textColor }}
											>
												Аа
											</span>
										</div>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
									</button>
								))}
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="custom" className="mt-0">
					<div className="space-y-6">
						{/* Default Theme */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="text-sm font-medium">Обычный ценник</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Начальный цвет</Label>
									<ColorPicker
										value={themes.default.start as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												default: { ...themes.default, start: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.default.start }}
										>
											<span className="sr-only">Выбрать начальный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.default.start}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												default: { ...themes.default, start: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Конечный цвет</Label>
									<ColorPicker
										value={themes.default.end as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												default: { ...themes.default, end: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.default.end }}
										>
											<span className="sr-only">Выбрать конечный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.default.end}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												default: { ...themes.default, end: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Цвет текста</Label>
									<ColorPicker
										value={themes.default.textColor as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												default: { ...themes.default, textColor: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.default.textColor }}
										>
											<span className="sr-only">Выбрать цвет текста</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.default.textColor}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												default: {
													...themes.default,
													textColor: e.target.value,
												},
											})
										}
									/>
								</div>
							</div>
							<div
								className="h-8 rounded-md border flex items-center justify-center text-sm font-medium"
								style={{
									background: getGradientStyle(themes.default),
									color: themes.default.textColor,
								}}
							>
								Превью обычного ценника
							</div>
						</div>

						{/* New Theme */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="text-sm font-medium">Новинка</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Начальный цвет</Label>
									<ColorPicker
										value={themes.new.start as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												new: { ...themes.new, start: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.new.start }}
										>
											<span className="sr-only">Выбрать начальный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.new.start}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												new: { ...themes.new, start: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Конечный цвет</Label>
									<ColorPicker
										value={themes.new.end as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												new: { ...themes.new, end: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.new.end }}
										>
											<span className="sr-only">Выбрать конечный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.new.end}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												new: { ...themes.new, end: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Цвет текста</Label>
									<ColorPicker
										value={themes.new.textColor as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												new: { ...themes.new, textColor: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.new.textColor }}
										>
											<span className="sr-only">Выбрать цвет текста</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.new.textColor}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												new: { ...themes.new, textColor: e.target.value },
											})
										}
									/>
								</div>
							</div>
							<div
								className="h-8 rounded-md border flex items-center justify-center text-sm font-medium"
								style={{
									background: getGradientStyle(themes.new),
									color: themes.new.textColor,
								}}
							>
								Превью новинки
							</div>
						</div>

						{/* Sale Theme */}
						<div className="space-y-4 p-4 border rounded-lg">
							<h3 className="text-sm font-medium">Распродажа</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Начальный цвет</Label>
									<ColorPicker
										value={themes.sale.start as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												sale: { ...themes.sale, start: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.sale.start }}
										>
											<span className="sr-only">Выбрать начальный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.sale.start}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												sale: { ...themes.sale, start: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Конечный цвет</Label>
									<ColorPicker
										value={themes.sale.end as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												sale: { ...themes.sale, end: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.sale.end }}
										>
											<span className="sr-only">Выбрать конечный цвет</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.sale.end}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												sale: { ...themes.sale, end: e.target.value },
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Цвет текста</Label>
									<ColorPicker
										value={themes.sale.textColor as `#${string}`}
										onValueChange={(color) =>
											onChange({
												...themes,
												sale: { ...themes.sale, textColor: color.hex },
											})
										}
									>
										<Button
											variant="outline"
											className="w-full h-10 p-1"
											style={{ backgroundColor: themes.sale.textColor }}
										>
											<span className="sr-only">Выбрать цвет текста</span>
										</Button>
									</ColorPicker>
									<Input
										value={themes.sale.textColor}
										className="h-8 text-xs"
										onChange={(e) =>
											onChange({
												...themes,
												sale: { ...themes.sale, textColor: e.target.value },
											})
										}
									/>
								</div>
							</div>
							<div
								className="h-8 rounded-md border flex items-center justify-center text-sm font-medium"
								style={{
									background: getGradientStyle(themes.sale),
									color: themes.sale.textColor,
								}}
							>
								Превью распродажи
							</div>
						</div>

						{/* Cutting Line Color */}
						{onCuttingLineColorChange && (
							<div className="space-y-4 p-4 border rounded-lg">
								<h3 className="text-sm font-medium">Цвет линий отреза</h3>
								<div className="space-y-3">
									<Label className="text-xs">
										Выберите цвет линий для вырезания
									</Label>
									<div className="flex gap-4 items-center">
										<ColorPicker
											value={cuttingLineColor as `#${string}`}
											onValueChange={(color) => {
												onCuttingLineColorChange?.(color.hex);
											}}
										>
											<Button
												variant="outline"
												className="w-20 h-10 p-1"
												style={{ backgroundColor: cuttingLineColor }}
											>
												<span className="sr-only">
													Выбрать цвет линий отреза
												</span>
											</Button>
										</ColorPicker>
										<Input
											value={cuttingLineColor}
											className="h-10 flex-1"
											onChange={(e) => {
												onCuttingLineColorChange?.(e.target.value);
											}}
											placeholder="#cccccc"
										/>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onCuttingLineColorChange?.("#cccccc")}
											className="shrink-0"
										>
											Авто
										</Button>
									</div>
									<div className="text-xs text-muted-foreground space-y-1">
										<div>
											Эти линии помогают при вырезании ценников после печати
										</div>
										{(!cuttingLineColor || cuttingLineColor === "#cccccc") && (
											<div className="font-medium text-blue-600 dark:text-blue-400">
												Авто-режим: белый для тёмных тем, чёрный для светлых
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Reset Button */}
						<div className="flex justify-center pt-4 w-full">
							<Button
								className="w-full"
								variant="outline"
								onClick={() => {
									const defaultThemes: ThemeSet = {
										default: {
											start: "#222222",
											end: "#dd4c9b",
											textColor: "#ffffff",
										},
										new: {
											start: "#222222",
											end: "#9cdd4c",
											textColor: "#ffffff",
										},
										sale: {
											start: "#222222",
											end: "#dd4c54",
											textColor: "#ffffff",
										},
										white: {
											start: "#ffffff",
											end: "#ffffff",
											textColor: "#000000",
										},
										black: {
											start: "#000000",
											end: "#000000",
											textColor: "#ffffff",
										},
										sunset: {
											start: "#ff7e5f",
											end: "#feb47b",
											textColor: "#ffffff",
										},
										ocean: {
											start: "#667eea",
											end: "#764ba2",
											textColor: "#ffffff",
										},
										forest: {
											start: "#134e5e",
											end: "#71b280",
											textColor: "#ffffff",
										},
										royal: {
											start: "#4c63d2",
											end: "#9c27b0",
											textColor: "#ffffff",
										},
										vintage: {
											start: "#8b4513",
											end: "#d2b48c",
											textColor: "#ffffff",
										},
										neon: {
											start: "#00ff00",
											end: "#ff00ff",
											textColor: "#000000",
										},
										monochrome: {
											start: "#4a4a4a",
											end: "#888888",
											textColor: "#ffffff",
										},
										silver: {
											start: "#c0c0c0",
											end: "#e8e8e8",
											textColor: "#000000",
										},
										charcoal: {
											start: "#2c2c2c",
											end: "#2c2c2c",
											textColor: "#ffffff",
										},
										paper: {
											start: "#f8f8f8",
											end: "#f0f0f0",
											textColor: "#333333",
										},
										ink: {
											start: "#1a1a1a",
											end: "#1a1a1a",
											textColor: "#ffffff",
										},
										snow: {
											start: "#ffffff",
											end: "#f5f5f5",
											textColor: "#000000",
										},
									};
									onChange(defaultThemes);
								}}
							>
								Сбросить к значениям по умолчанию
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
